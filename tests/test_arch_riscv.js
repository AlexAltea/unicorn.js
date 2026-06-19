// RISC-V smoke test (added in the 2.1.4 port): runs a tiny known program through
// the TCI interpreter and checks a register, proving the arch is compiled in and
// its translate/helper/adapter path works.
//
// Exercises the 32-bit register path (reg_read_i32 -> JS Number) on a 64-bit core.
// (Verified encoding taken from Unicorn's own tests/samples.)
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  // riscv64: addi t0, zero, 1 ; addi t1, zero, 0x20 ; addi sp, sp, 8
  const CODE = [0x93, 0x02, 0x10, 0x00, 0x13, 0x03, 0x00, 0x02, 0x13, 0x01, 0x81, 0x00];
  const ADDRESS = 0x1000n;

  const e = new uc.Unicorn(uc.ARCH_RISCV, uc.MODE_RISCV64);
  e.mem_map(ADDRESS, 0x1000, uc.PROT_ALL);
  e.mem_write(ADDRESS, CODE);
  e.emu_start(ADDRESS, ADDRESS + BigInt(CODE.length), 0, 0);

  const t0 = e.reg_read_i32(uc.RISCV_REG_T0);
  const t1 = e.reg_read_i32(uc.RISCV_REG_T1);
  e.close();

  const okT0 = (t0 === 1);
  const okT1 = (t1 === 0x20);
  console.log(`t0=${t0} (want 1)        ${okT0 ? 'OK' : 'FAIL'}`);
  console.log(`t1=0x${t1.toString(16)} (want 0x20)   ${okT1 ? 'OK' : 'FAIL'}`);

  const pass = okT0 && okT1;
  console.log(pass ? 'RISCV SMOKE: PASS' : 'RISCV SMOKE: FAIL');
  process.exit(pass ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
