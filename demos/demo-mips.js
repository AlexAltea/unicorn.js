var e = new uc.Unicorn(uc.ARCH_MIPS, uc.MODE_MIPS32 | uc.MODE_BIG_ENDIAN);
var a = new ks.Keystone(ks.ARCH_MIPS, ks.MODE_MIPS32 | ks.MODE_BIG_ENDIAN);
var d = new cs.Capstone(cs.ARCH_MIPS, cs.MODE_MIPS32 | cs.MODE_BIG_ENDIAN);

// Instruction Pointer
function pcRead() {
    return e.reg_read_i32(uc.MIPS_REG_PC);
}
function pcWrite(value) {
    return e.reg_write_i32(uc.MIPS_REG_PC, value);
}

// Customization
$('title').html('Unicorn.js: MIPS');
$('.navbar-demo').html('MIPS');

// Registers
paneRegisters.add(new Register('ZERO', 'i32', uc.MIPS_REG_ZERO));
paneRegisters.add(new Register('AT',   'i32', uc.MIPS_REG_AT));
paneRegisters.add(new Register('V0',   'i32', uc.MIPS_REG_V0));
paneRegisters.add(new Register('V1',   'i32', uc.MIPS_REG_V1));
paneRegisters.add(new Register('A0',   'i32', uc.MIPS_REG_A0));
paneRegisters.add(new Register('A1',   'i32', uc.MIPS_REG_A1));
paneRegisters.add(new Register('A2',   'i32', uc.MIPS_REG_A2));
paneRegisters.add(new Register('A3',   'i32', uc.MIPS_REG_A3));
paneRegisters.add(new Register('T0',   'i32', uc.MIPS_REG_T0));
paneRegisters.add(new Register('T1',   'i32', uc.MIPS_REG_T1));
paneRegisters.add(new Register('T2',   'i32', uc.MIPS_REG_T2));
paneRegisters.add(new Register('T3',   'i32', uc.MIPS_REG_T3));
paneRegisters.add(new Register('T4',   'i32', uc.MIPS_REG_T4));
paneRegisters.add(new Register('T5',   'i32', uc.MIPS_REG_T5));
paneRegisters.add(new Register('T6',   'i32', uc.MIPS_REG_T6));
paneRegisters.add(new Register('T7',   'i32', uc.MIPS_REG_T7));
paneRegisters.add(new Register('T8',   'i32', uc.MIPS_REG_T8));
paneRegisters.add(new Register('T9',   'i32', uc.MIPS_REG_T9));
paneRegisters.add(new Register('S0',   'i32', uc.MIPS_REG_S0));
paneRegisters.add(new Register('S1',   'i32', uc.MIPS_REG_S1));
paneRegisters.add(new Register('S2',   'i32', uc.MIPS_REG_S2));
paneRegisters.add(new Register('S3',   'i32', uc.MIPS_REG_S3));
paneRegisters.add(new Register('S4',   'i32', uc.MIPS_REG_S4));
paneRegisters.add(new Register('S5',   'i32', uc.MIPS_REG_S5));
paneRegisters.add(new Register('S6',   'i32', uc.MIPS_REG_S6));
paneRegisters.add(new Register('S7',   'i32', uc.MIPS_REG_S7));
paneRegisters.add(new Register('S8',   'i32', uc.MIPS_REG_S8));
paneRegisters.add(new Register('K0',   'i32', uc.MIPS_REG_K0));
paneRegisters.add(new Register('K1',   'i32', uc.MIPS_REG_K1));
paneRegisters.add(new Register('PC',   'i32', uc.MIPS_REG_PC));
paneRegisters.update();

// Initialization
paneAssembler.setAddr(0x10000);
paneAssembler.appendAsm(`
    ori  $at, $at, 0x3456;
`);
paneMemory.update();
