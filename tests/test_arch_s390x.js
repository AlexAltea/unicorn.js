// s390x smoke test (added in the 2.1.4 port): runs a tiny known program through
// the TCI interpreter and checks a register, proving the arch is compiled in and
// its translate/helper/adapter path works.
//
// Exercises the 64-bit register path (reg_read/write_i64 -> JS BigInt) in
// big-endian mode. (Verified encoding taken from Unicorn's own tests/samples.)
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  // s390x (big-endian): lr %r2, %r3
  const CODE = [0x18, 0x23];
  const ADDRESS = 0x1000n;
  const EXPECT = 0x114514n;

  const e = new uc.Unicorn(uc.ARCH_S390X, uc.MODE_BIG_ENDIAN);
  e.mem_map(ADDRESS, 0x1000, uc.PROT_ALL);
  e.mem_write(ADDRESS, CODE);
  e.reg_write_i64(uc.S390X_REG_R3, EXPECT);
  e.emu_start(ADDRESS, ADDRESS + BigInt(CODE.length), 0, 0);

  const r2 = e.reg_read_i64(uc.S390X_REG_R2);
  e.close();

  const ok = (typeof r2 === 'bigint') && (r2 === EXPECT);
  console.log(`r2=0x${r2.toString(16)} (want 0x${EXPECT.toString(16)}, typeof ${typeof r2})  ${ok ? 'OK' : 'FAIL'}`);

  console.log(ok ? 'S390X SMOKE: PASS' : 'S390X SMOKE: FAIL');
  process.exit(ok ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
