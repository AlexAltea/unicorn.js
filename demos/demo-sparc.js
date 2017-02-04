var e = new uc.Unicorn(uc.ARCH_SPARC, uc.MODE_SPARC32 | uc.MODE_BIG_ENDIAN);
var a = new ks.Keystone(ks.ARCH_SPARC, ks.MODE_SPARC32 | uc.MODE_BIG_ENDIAN); // TODO
var d = new cs.Capstone(cs.ARCH_SPARC, cs.MODE_SPARC32 | cs.MODE_BIG_ENDIAN);

// Instruction Pointer
function pcRead() {
    return e.reg_read_i32(uc.SPARC_REG_PC);
}
function pcWrite(value) {
    return e.reg_write_i32(uc.SPARC_REG_PC, value);
}

// Customization
$('title').html('Unicorn.js: SPARC');
$('.navbar-demo').html('SPARC');

// Registers
paneRegisters.add(new Register('G0', 'i32', uc.SPARC_REG_G0));
paneRegisters.add(new Register('G1', 'i32', uc.SPARC_REG_G1));
paneRegisters.add(new Register('G2', 'i32', uc.SPARC_REG_G2));
paneRegisters.add(new Register('G3', 'i32', uc.SPARC_REG_G3));
paneRegisters.add(new Register('G4', 'i32', uc.SPARC_REG_G4));
paneRegisters.add(new Register('G5', 'i32', uc.SPARC_REG_G5));
paneRegisters.add(new Register('G6', 'i32', uc.SPARC_REG_G6));
paneRegisters.add(new Register('G7', 'i32', uc.SPARC_REG_G7));
paneRegisters.add(new Register('L0', 'i32', uc.SPARC_REG_L0));
paneRegisters.add(new Register('L1', 'i32', uc.SPARC_REG_L1));
paneRegisters.add(new Register('L2', 'i32', uc.SPARC_REG_L2));
paneRegisters.add(new Register('L3', 'i32', uc.SPARC_REG_L3));
paneRegisters.add(new Register('L4', 'i32', uc.SPARC_REG_L4));
paneRegisters.add(new Register('L5', 'i32', uc.SPARC_REG_L5));
paneRegisters.add(new Register('L6', 'i32', uc.SPARC_REG_L6));
paneRegisters.add(new Register('L7', 'i32', uc.SPARC_REG_L7));
paneRegisters.add(new Register('I0', 'i32', uc.SPARC_REG_I0));
paneRegisters.add(new Register('I1', 'i32', uc.SPARC_REG_I1));
paneRegisters.add(new Register('I2', 'i32', uc.SPARC_REG_I2));
paneRegisters.add(new Register('I3', 'i32', uc.SPARC_REG_I3));
paneRegisters.add(new Register('I4', 'i32', uc.SPARC_REG_I4));
paneRegisters.add(new Register('I5', 'i32', uc.SPARC_REG_I5));
paneRegisters.add(new Register('I6', 'i32', uc.SPARC_REG_I6));
paneRegisters.add(new Register('I7', 'i32', uc.SPARC_REG_I7));
paneRegisters.add(new Register('O0', 'i32', uc.SPARC_REG_O0));
paneRegisters.add(new Register('O1', 'i32', uc.SPARC_REG_O1));
paneRegisters.add(new Register('O2', 'i32', uc.SPARC_REG_O2));
paneRegisters.add(new Register('O3', 'i32', uc.SPARC_REG_O3));
paneRegisters.add(new Register('O4', 'i32', uc.SPARC_REG_O4));
paneRegisters.add(new Register('O5', 'i32', uc.SPARC_REG_O5));
paneRegisters.add(new Register('O6', 'i32', uc.SPARC_REG_O6));
paneRegisters.add(new Register('O7', 'i32', uc.SPARC_REG_O7));
paneRegisters.add(new Register('PC', 'i32', uc.SPARC_REG_PC));
paneRegisters.update();

// Initialization
paneAssembler.setAddr(0x10000);
paneAssembler.appendAsm(/*`
    add  %g1, %g2, %g3;
`*/);
paneMemory.update();
