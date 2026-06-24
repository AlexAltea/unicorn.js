// uc_ctl binding test.
//
// uc_ctl is variadic in C; the wrapper packs its variable arguments into a
// single buffer (Emscripten's varargs convention) and exposes typed helpers
// mirroring the uc_ctl_* macros. This exercises:
//   - scalar reads through an output pointer (arch, mode, page_size, timeout),
//   - an int read/write round-trip with a functional run (cpu_model), and
//   - the (uint64_t* buffer, size_t len) two-argument form, both as a value
//     round-trip and functionally via the multiple-exits mechanism.
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  let pass = true;
  const check = (name, ok, got, want) => {
    if (!ok) pass = false;
    console.log(`  ${ok ? 'OK' : 'FAIL'}  ${name}` +
      (ok ? '' : `  (got ${got}, want ${want})`));
  };

  // --- scalar reads: arch / mode / page_size / timeout -------------------
  {
    const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
    const arch = e.ctl_get_arch();
    const mode = e.ctl_get_mode();
    const page = e.ctl_get_page_size();      // triggers engine init
    const timeout = e.ctl_get_timeout();
    e.close();
    check('ctl_get_arch == ARCH_X86', arch === uc.ARCH_X86, arch, uc.ARCH_X86);
    check('ctl_get_mode == MODE_64', mode === uc.MODE_64, mode, uc.MODE_64);
    check('ctl_get_page_size == 4096', page === 4096, page, 4096);
    check('ctl_get_timeout == 0n', timeout === 0n, timeout, 0n);
  }

  // --- cpu_model: write then read back, then run with that model ---------
  {
    const ADDRESS = 0x1000n;
    const CODE = [0xb8, 0x34, 0x12, 0x00, 0x00]; // mov eax, 0x1234
    const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_32);
    const MODEL = uc.CPU_X86_QEMU32; // exposed CPU-model constant (== 4)
    e.ctl_set_cpu_model(MODEL); // must precede any init
    const got = e.ctl_get_cpu_model(); // triggers init, commits the model
    e.mem_map(ADDRESS, 0x1000, uc.PROT_ALL);
    e.mem_write(ADDRESS, CODE);
    e.emu_start(ADDRESS, ADDRESS + BigInt(CODE.length), 0, 0);
    const eax = e.reg_read_i32(uc.X86_REG_EAX);
    e.close();
    check('ctl_set/get_cpu_model round-trip', got === MODEL, got, MODEL);
    check('engine runs after explicit cpu_model', eax === 0x1234, eax, 0x1234);
  }

  // --- multiple exits: (uint64_t* buffer, size_t len) two-arg varargs ----
  {
    const ADDRESS = 0x1000n;
    const CODE = new Array(16).fill(0x90); // 16x nop
    const EXITS = [0x1003n, 0x1007n];
    const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
    e.ctl_exits_enable();
    e.mem_map(ADDRESS, 0x1000, uc.PROT_ALL);
    e.mem_write(ADDRESS, CODE);
    e.ctl_set_exits(EXITS);
    const cnt = e.ctl_get_exits_cnt();
    const back = e.ctl_get_exits(cnt);
    // With exits enabled, `until` is ignored; emulation stops at the first
    // exit address reached, so rip must land on the lowest exit (0x1003).
    e.emu_start(ADDRESS, 0, 0, 0);
    const rip = e.reg_read_i64(uc.X86_REG_RIP);
    e.close();
    check('ctl_get_exits_cnt == 2', cnt === 2, cnt, 2);
    check('ctl_set/get_exits round-trip',
      back.length === 2 && back[0] === EXITS[0] && back[1] === EXITS[1],
      `[${back}]`, `[${EXITS}]`);
    check('emulation stops at exit 0x1003', rip === 0x1003n, rip, 0x1003n);
  }

  // --- smoke: write-only controls should not throw ----------------------
  {
    const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
    e.mem_map(0x1000n, 0x1000, uc.PROT_ALL);
    let ok = true;
    try {
      e.ctl_tlb_mode(uc.TLB_CPU);
      e.ctl_context_mode(uc.CTL_CONTEXT_CPU);
      e.ctl_remove_cache(0x1000n, 0x1010n); // i64 + i64 varargs path
      e.ctl_flush_tb();
      e.ctl_flush_tlb();
    } catch (ex) {
      ok = false;
      console.log('    threw: ' + (ex && ex.message ? ex.message : ex));
    }
    e.close();
    check('tlb_mode/context_mode/remove_cache/flush_tb/flush_tlb', ok);
  }

  console.log(pass ? 'UC_CTL: PASS' : 'UC_CTL: FAIL');
  process.exit(pass ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
