// Exercises the context_* and mem_regions wrapper methods (previously stubbed).
//   - context_alloc / save / restore / free snapshot and roll back CPU state
//   - mem_regions enumerates the mapped regions (uc_mem_region: begin/end/perms)
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  const results = [];
  const check = (label, ok, detail) => {
    results.push(ok);
    console.log(`${label}: ${detail}  ${ok ? 'OK' : 'FAIL'}`);
  };

  // --- context save/restore ---
  const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
  e.reg_write_i64(uc.X86_REG_RAX, 0x1111n);
  const ctx = e.context_alloc();
  e.context_save(ctx);            // snapshot RAX = 0x1111
  e.reg_write_i64(uc.X86_REG_RAX, 0x2222n);
  const before = e.reg_read_i64(uc.X86_REG_RAX);
  e.context_restore(ctx);         // roll back to 0x1111
  const after = e.reg_read_i64(uc.X86_REG_RAX);
  e.context_free(ctx);
  check('context_save/restore', before === 0x2222n && after === 0x1111n,
        `before=0x${before.toString(16)} after=0x${after.toString(16)}`);

  // --- mem_regions ---
  e.mem_map(0x100000n, 0x1000, uc.PROT_ALL);            // [0x100000, 0x100fff] rwx
  e.mem_map(0x200000n, 0x2000, uc.PROT_READ);           // [0x200000, 0x201fff] r
  const regions = e.mem_regions();
  regions.sort((a, b) => (a.begin < b.begin ? -1 : 1));
  const okCount = regions.length === 2;
  const okR0 = okCount && regions[0].begin === 0x100000n &&
               regions[0].end === 0x100fffn && regions[0].perms === uc.PROT_ALL;
  const okR1 = okCount && regions[1].begin === 0x200000n &&
               regions[1].end === 0x201fffn && regions[1].perms === uc.PROT_READ;
  // begin/end must be BigInt (uint64_t)
  const okTypes = okCount && typeof regions[0].begin === 'bigint' &&
                  typeof regions[0].end === 'bigint';
  check('mem_regions count', okCount, `count=${regions.length}`);
  check('mem_regions[0]', okR0, JSON.stringify(regions[0], bigintToStr));
  check('mem_regions[1]', okR1, JSON.stringify(regions[1], bigintToStr));
  check('mem_regions types', okTypes, `begin is ${okCount ? typeof regions[0].begin : 'n/a'}`);
  e.close();

  const pass = results.every(Boolean);
  console.log(pass ? 'CONTEXT/MEM_REGIONS: PASS' : 'CONTEXT/MEM_REGIONS: FAIL');
  process.exit(pass ? 0 : 1);

  function bigintToStr(k, v) { return typeof v === 'bigint' ? '0x' + v.toString(16) : v; }
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
