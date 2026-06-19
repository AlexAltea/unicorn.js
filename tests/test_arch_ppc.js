// PPC smoke test (added in the 2.1.4 port): runs a tiny known program through the
// TCI interpreter and checks a register, proving the arch is compiled in and its
// translate/helper/adapter path works.
//
// Exercises the 32-bit register path (reg_read/write_i32 -> JS Number) in
// big-endian mode. (Verified encoding taken from Unicorn's own tests/samples.)
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  // ppc (32-bit, big-endian): add r26, r6, r3   (42 + 1337 = 1379)
  const CODE = [0x7f, 0x46, 0x1a, 0x14];
  const ADDRESS = 0x1000n;

  const e = new uc.Unicorn(uc.ARCH_PPC, uc.MODE_32 | uc.MODE_BIG_ENDIAN);
  e.mem_map(ADDRESS, 0x1000, uc.PROT_ALL);
  e.mem_write(ADDRESS, CODE);
  e.reg_write_i32(uc.PPC_REG_3, 42);
  e.reg_write_i32(uc.PPC_REG_6, 1337);
  e.emu_start(ADDRESS, ADDRESS + BigInt(CODE.length), 0, 0);

  const r26 = e.reg_read_i32(uc.PPC_REG_26);
  e.close();

  const ok = (r26 === 1379);
  console.log(`r26=${r26} (want 1379)  ${ok ? 'OK' : 'FAIL'}`);

  console.log(ok ? 'PPC SMOKE: PASS' : 'PPC SMOKE: FAIL');
  process.exit(ok ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
