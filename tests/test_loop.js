// Multi-translation-block regression test. Guests that loop/branch generate more
// than one TB, and each new TB is inserted into a GTree keyed by a comparator.
// On the 2nd+ insertion the comparator is invoked through a function pointer; if
// its signature doesn't match the call site, wasm call_indirect traps ("null
// function or function signature mismatch"). Single-TB programs never compare, so
// this only shows up once a guest branches — exactly the x86 demo's xadd/loop.
const path = require('path');
const distPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');
const MUnicorn = require(distPath);

MUnicorn().then((uc) => {
  // The x86 demo program: a 30-iteration loop that turns (eax,edx) into
  // consecutive Fibonacci numbers via xadd.
  //   mov eax,0 ; mov edx,1 ; mov ecx,30 ; loop: xadd eax,edx ; loop loop
  const CODE = [
    0xB8,0x00,0x00,0x00,0x00, // mov eax, 0
    0xBA,0x01,0x00,0x00,0x00, // mov edx, 1
    0xB9,0x1E,0x00,0x00,0x00, // mov ecx, 30
    0x0F,0xC1,0xD0,           // xadd eax, edx
    0xE2,0xFB,                // loop -5  (back to xadd)
  ];
  const ADDRESS = 0x10000;

  const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_32);
  e.mem_map(ADDRESS, 0x1000, uc.PROT_ALL);
  e.mem_write(ADDRESS, CODE);

  let insns = 0;
  e.hook_add(uc.HOOK_CODE, function () { insns++; }, {}, ADDRESS, ADDRESS + CODE.length);

  e.emu_start(ADDRESS, ADDRESS + CODE.length, 0, 0);
  const eax = e.reg_read_i32(uc.X86_REG_EAX);
  const edx = e.reg_read_i32(uc.X86_REG_EDX);
  const ecx = e.reg_read_i32(uc.X86_REG_ECX);
  e.close();

  // F(30) = 832040, F(29) = 514229; the loop ran 30 xadds (+3 setup movs +29
  // extra loop instructions), so the code hook must have fired many times.
  const okEax = eax === 832040;
  const okEdx = edx === 514229;
  const okEcx = ecx === 0;
  const okMulti = insns > 30; // proves multiple TBs executed
  console.log(`eax=${eax} (want 832040)  ${okEax ? 'OK' : 'FAIL'}`);
  console.log(`edx=${edx} (want 514229)  ${okEdx ? 'OK' : 'FAIL'}`);
  console.log(`ecx=${ecx} (want 0)  ${okEcx ? 'OK' : 'FAIL'}`);
  console.log(`instructions executed=${insns} (multi-TB)  ${okMulti ? 'OK' : 'FAIL'}`);

  const pass = okEax && okEdx && okEcx && okMulti;
  console.log(pass ? 'MULTI-TB LOOP: PASS' : 'MULTI-TB LOOP: FAIL');
  process.exit(pass ? 0 : 1);
}).catch((e) => { console.error('ERROR', e); process.exit(2); });
