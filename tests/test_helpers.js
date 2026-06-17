// TCG helper / adapter-path stress test.
//
// Guest instructions that lower to a QEMU TCG *helper* are dispatched at runtime
// through tci.c's INDEX_op_call: the helper pointer is cast to one fixed
// signature `uint64_t (*)(uint32_t x10)` and called. Under WebAssembly,
// call_indirect type-checks the callee, so every heterogeneous helper must be
// funneled through that single signature — which is exactly what build.py's
// adapter-helper machinery (+ the coupled tcg/tcg.c 64-bit-arg patch) provides.
// Remove either and this indirect call traps with
// "null function or function signature mismatch", so emu_start throws below.
//
// helper_divq_EAX / helper_divl_EAX are non-void, multi-arg DEF_HELPERs with
// fully deterministic output, so a correct adapter round-trip is observable.
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  const ADDRESS = 0x1000000;
  // 64-bit unsigned divide (helper_divq_EAX)
  const DIV64 = [
    0x48, 0x31, 0xd2,                               // xor rdx, rdx
    0x48, 0xc7, 0xc0, 0xe8, 0x03, 0x00, 0x00,       // mov rax, 1000
    0x48, 0xc7, 0xc1, 0x07, 0x00, 0x00, 0x00,       // mov rcx, 7
    0x48, 0xf7, 0xf1,                               // div rcx
  ];
  // 32-bit unsigned divide (helper_divl_EAX)
  const DIV32 = [
    0x31, 0xd2,                                     // xor edx, edx
    0xb8, 0xe8, 0x03, 0x00, 0x00,                   // mov eax, 1000
    0xb9, 0x07, 0x00, 0x00, 0x00,                   // mov ecx, 7
    0xf7, 0xf1,                                     // div ecx
  ];

  let err = null, q64, r64, q32, r32;
  try {
    let e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
    e.mem_map(ADDRESS, 2 * 1024 * 1024, uc.PROT_ALL);
    e.mem_write(ADDRESS, DIV64);
    e.emu_start(ADDRESS, ADDRESS + DIV64.length, 0, 0);
    q64 = e.reg_read_i64(uc.X86_REG_RAX);
    r64 = e.reg_read_i64(uc.X86_REG_RDX);
    e.close();

    e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
    e.mem_map(ADDRESS, 2 * 1024 * 1024, uc.PROT_ALL);
    e.mem_write(ADDRESS, DIV32);
    e.emu_start(ADDRESS, ADDRESS + DIV32.length, 0, 0);
    q32 = e.reg_read_i64(uc.X86_REG_RAX) & 0xffffffffn;
    r32 = e.reg_read_i64(uc.X86_REG_RDX) & 0xffffffffn;
    e.close();
  } catch (ex) {
    err = ex;
  }

  if (err) {
    console.log('HELPER ADAPTER: emu_start THREW (indicates the adapter path is broken):');
    console.log('  ' + String(err && err.message ? err.message : err));
    console.log('HELPER ADAPTER STRESS: FAIL');
    process.exit(1);
  }

  const ok64q = q64 === 142n, ok64r = r64 === 6n;
  const ok32q = q32 === 142n, ok32r = r32 === 6n;
  console.log(`div64 1000/7 -> q=${q64} r=${r64}  ${ok64q && ok64r ? 'OK' : 'FAIL'}`);
  console.log(`div32 1000/7 -> q=${q32} r=${r32}  ${ok32q && ok32r ? 'OK' : 'FAIL'}`);
  const pass = ok64q && ok64r && ok32q && ok32r;
  console.log(pass ? 'HELPER ADAPTER STRESS: PASS' : 'HELPER ADAPTER STRESS: FAIL');
  process.exit(pass ? 0 : 1);
}).catch((e) => {
  console.error('HELPER ADAPTER: top-level ERROR:', e && e.message ? e.message : e);
  console.log('HELPER ADAPTER STRESS: FAIL');
  process.exit(1);
});
