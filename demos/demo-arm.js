var e = new uc.Unicorn(uc.ARCH_ARM, uc.MODE_ARM);

// Registers
paneRegisters.add(new Register('R0', 'i32', uc.ARM_REG_R0));
paneRegisters.add(new Register('R1', 'i32', uc.ARM_REG_R1));
paneRegisters.add(new Register('R2', 'i32', uc.ARM_REG_R2));
paneRegisters.add(new Register('R3', 'i32', uc.ARM_REG_R3));
paneRegisters.add(new Register('R4', 'i32', uc.ARM_REG_R4));
paneRegisters.add(new Register('R5', 'i32', uc.ARM_REG_R5));
paneRegisters.add(new Register('R6', 'i32', uc.ARM_REG_R6));
paneRegisters.add(new Register('R7', 'i32', uc.ARM_REG_R7));

// Assembler
paneAssembler.appendAsm(`

`);
