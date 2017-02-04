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
function utilByteToStr(n) {
    if (n >= 0x20 && n <= 0x7E) {
        return String.fromCharCode(n);
    } else {
        return '.';
    }
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

    // Data
    this.dataHex = "";
    this.dataValue = "";

    this.node = document.createElement("tr");
    this.nodeName = document.createElement("td");
    this.nodeHex = document.createElement("td");
    this.nodeValue = document.createElement("td");
    this.node.className = 'row-register';
    this.node.appendChild(this.nodeName);
    this.node.appendChild(this.nodeHex);
    this.node.appendChild(this.nodeValue);
    this.nodeName.innerHTML = name

    // Events
    this.nodeHex.ondblclick = (function (reg) {
        return function() {
            // Check if already in edit-mode
            if ($(this).find('input').length) {
                return;
            }
            paneRegisters.restore();
            var content = this.firstChild.innerHTML;
            var input = document.createElement("input");
            input.type = "text";
            input.value = content;
            input.style.width = reg.nodeHex.firstChild.offsetWidth + 'px';
            reg.node.style.color = '#EEE';
            reg.nodeHex.innerHTML = '';
            reg.nodeHex.appendChild(input);
            $(input).on('keyup', function (e) {
                if (e.keyCode == 13) {
                    reg.set(parseInt(this.value, 16));
                    reg.update();
                }
            });
            input.select();
        }
    })(this);

    // Helpers
    this._update_int = function () {
        var value = e.reg_read_i32(this.id);
        var valueStr = value.toString();
        // Set color
        if (this.dataValue != valueStr) {
            this.node.style.color = '#FA8';
        } else {
            this.node.style.color = '#EEE';
        }
        // Set value
        this.dataValue = value.toString();
        switch (this.type) {
            case 'i8':  this.dataHex = utilIntToHex(value, 2); break;
            case 'i16': this.dataHex = utilIntToHex(value, 4); break;
            case 'i32': this.dataHex = utilIntToHex(value, 8); break;
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
                break;
            case 'f32':
                this._update_float();
                break;
            case 'v128':
                this._update_vector();
                break;
        }
        this.restore();
    }
    this.restore = function () {
        this.nodeHex.innerHTML = '<span>'+this.dataHex+'</span>';
        this.nodeValue.innerHTML = '<span>'+this.dataValue+'</span>';
    }
    this.set = function (value) {
        switch (this.type) {
        default:
            e.reg_write_type(this.id, this.type, value);
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
        this.nodeAsm.innerHTML = this.asm.replace(/ /g, '&nbsp;');
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
        if (bytes.length > 0) {
            e.mem_write(this.address, bytes);
            e.emu_start(this.address, this.address+bytes.length, 0, 0);
            paneRegisters.update();
        }
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
    },
    // Clipboard
    clipCopyAsm: function () {
        var asm = "";
        this.instructions.forEach(function (instr) {
            asm += instr.asm + "\n";
        });
        clipboard.copy(asm);
    },
};

var paneRegisters = {
    registers: [],

    add: function (reg) {
        this.registers.push(reg);
        var regs = document.getElementById('registers');
        regs.appendChild(reg.node);
    },
    update: function () {
        this.registers.forEach(function (reg) {
            reg.update();
        });
    },
    restore: function () {
        this.registers.forEach(function (reg) {
            reg.restore();
        });
    }
};

var paneMemory = {
    address: 0x10000,
    size_w: 16,
    size_h: 10,

    update: function () {
        var memory = $('#memory');
        var buffer = e.mem_read(this.address, this.size_w * this.size_h);
        memory.slice(1).remove();
        for (var y = 0; y < this.size_h; y++) {
            var code = '<tr class="row-memory">';
            // Address
            code += '<td>'
            code += utilIntToHex(this.address + y*this.size_h, 8);
            code += '</td>'
            // Bytes
            code += '<td>'
            for (var x = 0; x < this.size_w; x++) {
                code += utilIntToHex(buffer[y*this.size_h + x], 2) + ' ';
            }
            code += '</td>'
            // ASCII
            code += '<td>'
            for (var x = 0; x < this.size_w; x++) {
                code += utilByteToStr(buffer[y*this.size_h + x]);
            }
            code += '</td>'
            code += '</tr>'
            memory.append(code);
        }
    },
};


$(document).ready(function () {
    Split(['#pane-h', '#pane-l', '#pane-r'], {
        gutterSize: 7,
        sizes: [25, 50, 25],
        cursor: 'col-resize'
    });
    Split(['#pane-lt', '#pane-lb'], {
        direction: 'vertical',
        sizes: [60, 40],
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
