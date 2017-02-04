var e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_32);
var a = new ks.Keystone(ks.ARCH_X86, ks.MODE_32);
var d = new cs.Capstone(cs.ARCH_X86, cs.MODE_32);

// Instruction Pointer
function pcRead() {
    return e.reg_read_i32(uc.X86_REG_EIP);
}
function pcWrite(value) {
    return e.reg_write_i32(uc.X86_REG_EIP, value);
}

// Customization
$('title').html('Unicorn.js: X86');
$('.navbar-demo').html('X86');

// Registers
paneRegisters.add(new Register('EAX',  'i32', uc.X86_REG_EAX));
paneRegisters.add(new Register('EBX',  'i32', uc.X86_REG_EBX));
paneRegisters.add(new Register('ECX',  'i32', uc.X86_REG_ECX));
paneRegisters.add(new Register('EDX',  'i32', uc.X86_REG_EDX));
paneRegisters.add(new Register('EBP',  'i32', uc.X86_REG_EBP));
paneRegisters.add(new Register('ESP',  'i32', uc.X86_REG_ESP));
paneRegisters.add(new Register('ESI',  'i32', uc.X86_REG_ESI));
paneRegisters.add(new Register('EDI',  'i32', uc.X86_REG_EDI));
paneRegisters.add(new Register('EIP',  'i32', uc.X86_REG_EIP));
paneRegisters.update();

// Initialization
//e.reg_write_i32(uc.X86_REG_ECX, 30);
paneAssembler.setAddr(0x10000);
paneAssembler.appendAsm(`
    mov   eax, 0
    mov   edx, 1
    mov   ecx, 30
    xadd  eax, edx
    loop  -3
`);
paneMemory.update();
