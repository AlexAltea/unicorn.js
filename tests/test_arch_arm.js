// ARM smoke test: canonical Unicorn ARM example + a UC_HOOK_CODE.
// Exercises the 32-bit register path (reg_read/write_i32 -> JS Number) and the
// hook trampoline (the hook address arrives as a BigInt under WASM_BIGINT).
//
// Regression guard: the ARM cpreg list is built with g_list_sort() on every
// uc_open, which runs through glib_compat.c's merge sort. That comparator is
// invoked via an indirect call whose signature must match exactly under WASM,
// so this test also covers the glib_compat.c "function pointer" patch — drop
// that patch and `new uc.Unicorn(uc.ARCH_ARM, ...)` traps here.
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  // mov r0, #0x37 ; sub r1, r2, r3
  const ARM_CODE = [0x37, 0x00, 0xa0, 0xe3, 0x03, 0x10, 0x42, 0xe0];
  const ADDRESS = 0x10000;

  const e = new uc.Unicorn(uc.ARCH_ARM, uc.MODE_ARM);
  e.mem_map(ADDRESS, 2 * 1024 * 1024, uc.PROT_ALL);
  e.mem_write(ADDRESS, ARM_CODE);

  e.reg_write_i32(uc.ARM_REG_R0, 0x1234);
  e.reg_write_i32(uc.ARM_REG_R2, 0x6789);
  e.reg_write_i32(uc.ARM_REG_R3, 0x3333);

  let hookCount = 0;
  let addrType = null;
  e.hook_add(uc.HOOK_CODE, function (handle, addr, size, data) {
    hookCount++;
    addrType = typeof addr;
  }, {}, ADDRESS, ADDRESS + ARM_CODE.length);

  e.emu_start(ADDRESS, ADDRESS + ARM_CODE.length, 0, 0);

  const r0 = e.reg_read_i32(uc.ARM_REG_R0);
  const r1 = e.reg_read_i32(uc.ARM_REG_R1);
  e.close();

  const okR0 = (r0 === 0x37);
  const okR1 = (r1 === 0x3456);            // 0x6789 - 0x3333
  const okHook = (hookCount === 2);
  console.log(`r0=0x${r0.toString(16)} (want 0x37)  ${okR0 ? 'OK' : 'FAIL'}`);
  console.log(`r1=0x${r1.toString(16)} (want 0x3456) ${okR1 ? 'OK' : 'FAIL'}`);
  console.log(`hookCount=${hookCount} (want 2)      ${okHook ? 'OK' : 'FAIL'}`);
  console.log(`hook addr typeof = ${addrType} (expect bigint under WASM_BIGINT)`);

  const pass = okR0 && okR1 && okHook;
  console.log(pass ? 'ARM SMOKE: PASS' : 'ARM SMOKE: FAIL');
  process.exit(pass ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
