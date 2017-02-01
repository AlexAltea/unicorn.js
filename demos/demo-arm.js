var e = new uc.Unicorn(uc.ARCH_ARM, uc.MODE_ARM);
var a = new ks.Keystone(uc.ARCH_ARM, uc.MODE_ARM);

// Instruction Pointer
function pcRead() {
    return e.reg_read_int(uc.ARM_REG_PC);
}
function pcWrite(value) {
    return e.reg_write_int(uc.ARM_REG_PC, value);
}

// Customization
$('title').html('Unicorn.js: ARM');
$('.navbar-demo').html('ARM');

// Registers
paneRegisters.add(new Register('R0',  'i32', uc.ARM_REG_R0));
paneRegisters.add(new Register('R1',  'i32', uc.ARM_REG_R1));
paneRegisters.add(new Register('R2',  'i32', uc.ARM_REG_R2));
paneRegisters.add(new Register('R3',  'i32', uc.ARM_REG_R3));
paneRegisters.add(new Register('R4',  'i32', uc.ARM_REG_R4));
paneRegisters.add(new Register('R5',  'i32', uc.ARM_REG_R5));
paneRegisters.add(new Register('R6',  'i32', uc.ARM_REG_R6));
paneRegisters.add(new Register('R7',  'i32', uc.ARM_REG_R7));
paneRegisters.add(new Register('R8',  'i32', uc.ARM_REG_R8));
paneRegisters.add(new Register('R9',  'i32', uc.ARM_REG_R9));
paneRegisters.add(new Register('R10', 'i32', uc.ARM_REG_R10));
paneRegisters.add(new Register('R11', 'i32', uc.ARM_REG_R11));
paneRegisters.add(new Register('R12', 'i32', uc.ARM_REG_R12));
paneRegisters.add(new Register('SP',  'i32', uc.ARM_REG_R13));
paneRegisters.add(new Register('LR',  'i32', uc.ARM_REG_R14));
paneRegisters.add(new Register('PC',  'i32', uc.ARM_REG_R15));

// Initialization
paneAssembler.setAddr(0x10000);
paneAssembler.appendAsm(`
    mov  r0, #0x37
    sub  r1, r2, r3
`);

