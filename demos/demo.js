// Utils
function utilIntToHex(n, pad) {
    pad = (typeof pad !== 'undefined') ? pad : 1;
    var s = Number(n).toString(16).toUpperCase();
    while (s.length < pad) {
        s = '0' + s;
    }
    return s;
}
function utilBytesToHex(b) {
    return b.map(function (b) {
        return utilIntToHex(b, 2);
    }).join(' ');
}

// Classes
/**
 * Register
 */
function Register(name, type, id) {
    // Constructor
    this.name = name;
    this.type = type;
    this.id = id;

    this.node = document.createElement("tr");
    this.nodeName = document.createElement("td");
    this.nodeValue = document.createElement("td");
    this.node.className = 'row-instruction';
    this.node.appendChild(this.nodeName);
    this.node.appendChild(this.nodeValue);
    this.nodeName.innerHTML = name

    // Helpers
    this._update_int = function () {
        var value = e.reg_read_int(this.id);
        // Set color
        if (this.value != value) {
            this.node.style.color = '#F86';
        } else {
            this.node.style.color = '#EEE';
        }
        // Set value
        this.value = value;
        switch (this.type) {
            case 'i8':  this.nodeValue.innerHTML = utilIntToHex(value, 2);
            case 'i16': this.nodeValue.innerHTML = utilIntToHex(value, 4);
            case 'i32': this.nodeValue.innerHTML = utilIntToHex(value, 8);
        }
    }
    this._update_float = function () {
        var value = e.reg_read(); // TODO
    }
    this._update_vector = function () {
        var value = e.reg_read(); // TODO
    }

    // Methods
    this.update = function () {
        switch (this.type) {
            case 'i8':
            case 'i16':
            case 'i32':
                this._update_int();
            case 'f32':
                this._update_float();
            case 'v128':
                this._update_vector();
        }
    }

    this.update();
}

/**
 * Instruction
 */
function Instruction() {
    this.bytes = [];
    this.asm = "";

    this.node = document.createElement("tr");
    this.nodeAddr = document.createElement("td");
    this.nodeHex = document.createElement("td");
    this.nodeAsm = document.createElement("td");
    this.node.className = 'row-instruction'
    this.node.appendChild(this.nodeAddr);
    this.node.appendChild(this.nodeHex);
    this.node.appendChild(this.nodeAsm);

    // Methods
    this.setAddr = function (addr) {
        this.nodeAddr.innerHTML = utilIntToHex(addr, 8);
    }
    this.setHex = function (bytes) {
        if (typeof bytes === 'string') {
            console.error("Unimplemented");
        } else {
            this.bytes = bytes;
        }
        this.nodeHex.innerHTML = utilBytesToHex(bytes);
    }
    this.setAsm = function (asm) {
        this.asm = asm.trim()
        this.nodeAsm.innerHTML = this.asm.replace(' ', '&nbsp;');
        var bytes = Array.from(a.asm(this.asm));
        this.setHex(bytes);
    }
    this.length = function () {
        return this.bytes.length;
    }
}

// Panes
var paneAssembler = {
    instructions: [],
    address: 0x0,
    size: 0x1000,
    mapped: false,

    bytes: function () {
        var bytes = [];
        for (var i = 0; i < this.instructions.length; i++) {
            bytes = bytes.concat(this.instructions[i].bytes);
        }
        return bytes;
    },
    update: function () {
        var table = $("#assembler");
        table.find(".row-instruction").remove();
        // Add instruction rows
        var addr = this.address;
        for (var i = 0; i < this.instructions.length; i++) {
            var inst = this.instructions[i];
            inst.setAddr(addr);
            table.append(inst.node);
            addr += inst.length();
        }
    },
    setAddr: function (addr) {
        if (this.mapped) {
            e.mem_unmap(this.address, this.size);
        }
        this.address = addr;
        e.mem_map(this.address, this.size, uc.PROT_ALL);
        for (var i = 0; i < this.instructions.length; i++) {
            var inst = this.instructions[i];
            inst.setAddr(addr);
            addr += inst.length();
        }
        pcWrite(this.address);
        paneRegisters.update();
    },
    appendAsm: function (asm) {
        asm = asm.split(/[\n\r;]+/);
        for (var i = 0; i < asm.length; i++) {
            var instAsm = asm[i].trim();
            if (instAsm.length == 0) {
                continue;
            }
            var inst = new Instruction();
            inst.setAsm(instAsm);
            this.instructions.push(inst);
        }
        this.update();
    },
    // Emulation
    emuStart: function () {
        var bytes = this.bytes();
        e.mem_write(this.address, bytes);
        e.emu_start(this.address, this.address+bytes.length, 0, 0);
        paneRegisters.update();
    },
    emuPause: function () {
        console.warn("Pause unimplemented");
    },
    emuStepInto: function () {
        console.warn("Step-in unimplemented");
    },
    emuStepOver: function () {
        console.warn("Step-over unimplemented");
    },
    emuStepOut: function () {
        console.warn("Step-out unimplemented");
    }
};

var paneRegisters = {
    registers: [],

    add: function (reg) {
        this.registers.push(reg);
        var regs = document.getElementById('registers');
        regs.appendChild(reg.node);
    },
    update: function () {
        for (var i = 0; i < this.registers.length; i++) {
            this.registers[i].update();
        }
    }
};


$(document).ready(function () {
    Split(['#pane-l', '#pane-r'], {
        gutterSize: 7,
        sizes: [65, 35],
        cursor: 'col-resize'
    });
    Split(['#pane-lt', '#pane-lb'], {
        direction: 'vertical',
        sizes: [65, 35],
        gutterSize: 7,
        cursor: 'row-resize'
    });
    /* TODO: Reenable Stack pane
    Split(['#pane-rt', '#pane-rb'], {
        direction: 'vertical',
        sizes: [65, 35],
        gutterSize: 7,
        cursor: 'row-resize'
    });*/
});
