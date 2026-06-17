// x86-64 / 64-bit FFI test: proves the BigInt-for-64-bit / Number-elsewhere
// integer convention.
//   - reg_write_i64 / reg_read_i64 round-trip a value > 2^32 as a BigInt
//   - `movabs rax, imm64` executes, rax reads back as a full-width BigInt
//   - UC_HOOK_CODE delivers the 64-bit guest address as a BigInt
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  // movabs rax, 0x1122334455667788
  const CODE = [0x48, 0xb8, 0x88, 0x77, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11];
  const ADDRESS = 0x1000000;
  const EXPECT = 0x1122334455667788n;

  const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
  e.mem_map(ADDRESS, 2 * 1024 * 1024, uc.PROT_ALL);
  e.mem_write(ADDRESS, CODE);

  // 64-bit register round-trip (no execution)
  e.reg_write_i64(uc.X86_REG_RBX, EXPECT);
  const rbx = e.reg_read_i64(uc.X86_REG_RBX);

  let hookAddr = null, hookType = null;
  e.hook_add(uc.HOOK_CODE, function (h, addr, size, data) {
    hookAddr = addr; hookType = typeof addr;
  }, {}, ADDRESS, ADDRESS + CODE.length);

  e.emu_start(ADDRESS, ADDRESS + CODE.length, 0, 0);
  const rax = e.reg_read_i64(uc.X86_REG_RAX);
  e.close();

  const okRbx  = (typeof rbx === 'bigint') && (rbx === EXPECT);
  const okRax  = (typeof rax === 'bigint') && (rax === EXPECT);
  const okHook = (hookType === 'bigint') && (hookAddr === BigInt(ADDRESS));

  console.log(`reg_write/read_i64 rbx = ${rbx} (typeof ${typeof rbx})  ${okRbx ? 'OK' : 'FAIL'}`);
  console.log(`movabs rax -> 0x${rax.toString(16)} (typeof ${typeof rax})  ${okRax ? 'OK' : 'FAIL'}`);
  console.log(`hook addr = 0x${(hookAddr ?? 0n).toString(16)} (typeof ${hookType})  ${okHook ? 'OK' : 'FAIL'}`);

  const pass = okRbx && okRax && okHook;
  console.log(pass ? 'X64 BIGINT SMOKE: PASS' : 'X64 BIGINT SMOKE: FAIL');
  process.exit(pass ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
