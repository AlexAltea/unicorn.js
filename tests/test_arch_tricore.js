// TriCore smoke test (added in the 2.1.4 port): runs a tiny known program through
// the TCI interpreter and checks a register, proving the arch is compiled in and
// its translate/helper/adapter path works.
//
// Exercises the 32-bit register path (reg_read_i32 -> JS Number). TriCore's page
// size is > 4K, so the code is mapped at an aligned 64K address.
// (Verified encoding taken from Unicorn's own tests/samples.)
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  // tricore (little-endian): mov d1, #1 ; mov.u d0, #0x8000
  const CODE = [0x82, 0x11, 0xbb, 0x00, 0x00, 0x08];
  const ADDRESS = 0x10000n;

  const e = new uc.Unicorn(uc.ARCH_TRICORE, uc.MODE_LITTLE_ENDIAN);
  e.mem_map(ADDRESS, 0x10000, uc.PROT_ALL);
  e.mem_write(ADDRESS, CODE);
  e.emu_start(ADDRESS, ADDRESS + BigInt(CODE.length), 0, 0);

  const d0 = e.reg_read_i32(uc.TRICORE_REG_D0);
  const d1 = e.reg_read_i32(uc.TRICORE_REG_D1);
  e.close();

  const okD0 = (d0 === 0x8000);
  const okD1 = (d1 === 1);
  console.log(`d0=0x${d0.toString(16)} (want 0x8000)  ${okD0 ? 'OK' : 'FAIL'}`);
  console.log(`d1=${d1} (want 1)            ${okD1 ? 'OK' : 'FAIL'}`);

  const pass = okD0 && okD1;
  console.log(pass ? 'TRICORE SMOKE: PASS' : 'TRICORE SMOKE: FAIL');
  process.exit(pass ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
