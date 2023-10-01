var e = new uc.Unicorn(uc.ARCH_ARM64, uc.MODE_ARM64);
var a = new ks.Keystone(ks.ARCH_ARM64); // , ks.MODE_ARM);
var d = new cs.Capstone(cs.ARCH_ARM64, cs.MODE_ARM);

// Instruction Pointer
function pcRead() {
    return e.reg_read_i64(uc.ARM64_REG_PC);
}
function pcWrite(value) {
    return e.reg_write_i64(uc.ARM64_REG_PC, value);
}

// Customization
$('title').html('Unicorn.js: ARM64');
$('.navbar-demo').html('ARM');

// Registers
paneRegisters.add(new Register('X0',  'i64', uc.ARM64_REG_X0));
paneRegisters.add(new Register('X1',  'i64', uc.ARM64_REG_X1));
paneRegisters.add(new Register('X2',  'i64', uc.ARM64_REG_X2));
paneRegisters.add(new Register('X3',  'i64', uc.ARM64_REG_X3));
paneRegisters.add(new Register('X4',  'i64', uc.ARM64_REG_X4));
paneRegisters.add(new Register('X5',  'i64', uc.ARM64_REG_X5));
paneRegisters.add(new Register('X6',  'i64', uc.ARM64_REG_X6));
paneRegisters.add(new Register('X7',  'i64', uc.ARM64_REG_X7));
paneRegisters.add(new Register('X8',  'i64', uc.ARM64_REG_X8));
paneRegisters.add(new Register('X9',  'i64', uc.ARM64_REG_X9));
paneRegisters.add(new Register('X10', 'i64', uc.ARM64_REG_X10));
paneRegisters.add(new Register('X11', 'i64', uc.ARM64_REG_X11));
paneRegisters.add(new Register('X12', 'i64', uc.ARM64_REG_X12));
paneRegisters.add(new Register('X13', 'i64', uc.ARM64_REG_X13));
paneRegisters.add(new Register('X14', 'i64', uc.ARM64_REG_X14));
paneRegisters.add(new Register('X15', 'i64', uc.ARM64_REG_X15));
paneRegisters.add(new Register('X16', 'i64', uc.ARM64_REG_X16));
paneRegisters.add(new Register('X17', 'i64', uc.ARM64_REG_X17));
paneRegisters.add(new Register('X18', 'i64', uc.ARM64_REG_X18));
paneRegisters.add(new Register('X19', 'i64', uc.ARM64_REG_X19));
paneRegisters.add(new Register('X20', 'i64', uc.ARM64_REG_X20));
paneRegisters.add(new Register('X21', 'i64', uc.ARM64_REG_X21));
paneRegisters.add(new Register('X22', 'i64', uc.ARM64_REG_X22));
paneRegisters.add(new Register('X23', 'i64', uc.ARM64_REG_X23));
paneRegisters.add(new Register('X24', 'i64', uc.ARM64_REG_X24));
paneRegisters.add(new Register('X25', 'i64', uc.ARM64_REG_X25));
paneRegisters.add(new Register('X26', 'i64', uc.ARM64_REG_X26));
paneRegisters.add(new Register('X27', 'i64', uc.ARM64_REG_X27));
paneRegisters.add(new Register('X28', 'i64', uc.ARM64_REG_X28));
paneRegisters.add(new Register('SP',  'i64', uc.ARM64_REG_SP));
paneRegisters.add(new Register('LR',  'i64', uc.ARM64_REG_LR));
paneRegisters.add(new Register('PC',  'i64', uc.ARM64_REG_PC));
paneRegisters.update();

// Initialization
paneAssembler.setAddr(0x10000);
paneAssembler.appendAsm(`
    mov  x0, #0x37
    mov  x2, #0x33
    mov  x3, #0x11
    sub  x1, x2, x3
`);
paneMemory.update();
