// UC_HOOK_INSN test — covers the variadic uc_hook_add path.
//
// The instruction id to match (here SYSCALL) is passed to uc_hook_add as the
// trailing `extra` argument. uc_hook_add is variadic in C; on wasm32 Clang
// lowers the `...` to a single pointer-to-va_list-buffer parameter that the
// caller must fill, which src/unicorn-wrapper.js builds by hand. If that
// marshalling is wrong, `va_arg(valist, int)` reads garbage and the hook never
// matches SYSCALL — so this is the regression guard for the JS-side va_list fix.
//
// Code: 64-bit `syscall` (0F 05). We hook UC_HOOK_INSN for SYSCALL and assert
// the callback fires. A plain UC_HOOK_CODE counter runs alongside to prove the
// emulator executes (that path never reads the variadic arg).
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  const CODE = [0x0f, 0x05]; // syscall
  const ADDRESS = 0x1000000;

  const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
  e.mem_map(ADDRESS, 2 * 1024 * 1024, uc.PROT_ALL);
  e.mem_write(ADDRESS, CODE);

  let codeHits = 0, insnHits = 0;
  e.hook_add(uc.HOOK_CODE, function () { codeHits++; }, {}, ADDRESS, ADDRESS + CODE.length);
  // HOOK_INSN: trailing `extra` arg = the instruction id to match.
  e.hook_add(uc.HOOK_INSN, function () { insnHits++; }, {}, ADDRESS, ADDRESS + CODE.length, uc.X86_INS_SYSCALL);

  try {
    e.emu_start(ADDRESS, ADDRESS + CODE.length, 0, 0);
  } catch (err) {
    // emu may stop on the syscall; the hook firing is what we assert.
  }
  e.close();

  const okCode = codeHits >= 1;
  const okInsn = insnHits >= 1;
  console.log(`HOOK_CODE fired ${codeHits}x   ${okCode ? 'OK' : 'FAIL'}`);
  console.log(`HOOK_INSN (SYSCALL=${uc.X86_INS_SYSCALL}) fired ${insnHits}x   ${okInsn ? 'OK' : 'FAIL'}`);

  const pass = okCode && okInsn;
  console.log(pass ? 'INSN HOOK SMOKE: PASS' : 'INSN HOOK SMOKE: FAIL');
  process.exit(pass ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
