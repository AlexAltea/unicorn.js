/**
 * (c) 2016-2017 Unicorn.JS
 * Wrapper made by Alexandro Sanchez Bach.
 */

// Unicorn MIPS extensions
uc.extend({
    // Registers
    MIPS_REG_INVALID:             0,
    MIPS_REG_PC:                  1,
    MIPS_REG_0:                   2,
    MIPS_REG_1:                   3,
    MIPS_REG_2:                   4,
    MIPS_REG_3:                   5,
    MIPS_REG_4:                   6,
    MIPS_REG_5:                   7,
    MIPS_REG_6:                   8,
    MIPS_REG_7:                   9,
    MIPS_REG_8:                  10,
    MIPS_REG_9:                  11,
    MIPS_REG_10:                 12,
    MIPS_REG_11:                 13,
    MIPS_REG_12:                 14,
    MIPS_REG_13:                 15,
    MIPS_REG_14:                 16,
    MIPS_REG_15:                 17,
    MIPS_REG_16:                 18,
    MIPS_REG_17:                 19,
    MIPS_REG_18:                 20,
    MIPS_REG_19:                 21,
    MIPS_REG_20:                 22,
    MIPS_REG_21:                 23,
    MIPS_REG_22:                 24,
    MIPS_REG_23:                 25,
    MIPS_REG_24:                 26,
    MIPS_REG_25:                 27,
    MIPS_REG_26:                 28,
    MIPS_REG_27:                 29,
    MIPS_REG_28:                 30,
    MIPS_REG_29:                 31,
    MIPS_REG_30:                 32,
    MIPS_REG_31:                 33,

    // DSP registers
    MIPS_REG_DSPCCOND:           34,
    MIPS_REG_DSPCARRY:           35,
    MIPS_REG_DSPEFI:             36,
    MIPS_REG_DSPOUTFLAG:         37,
    MIPS_REG_DSPOUTFLAG16_19:    38,
    MIPS_REG_DSPOUTFLAG20:       39,
    MIPS_REG_DSPOUTFLAG21:       40,
    MIPS_REG_DSPOUTFLAG22:       41,
    MIPS_REG_DSPOUTFLAG23:       42,
    MIPS_REG_DSPPOS:             43,
    MIPS_REG_DSPSCOUNT:          44,

    // ACC registers
    MIPS_REG_AC0:                45,
    MIPS_REG_AC1:                46,
    MIPS_REG_AC2:                47,
    MIPS_REG_AC3:                48,

    // COP registers
    MIPS_REG_CC0:                49,
    MIPS_REG_CC2:                50,
    MIPS_REG_CC3:                51,
    MIPS_REG_CC4:                52,
    MIPS_REG_CC5:                53,
    MIPS_REG_CC6:                54,
    MIPS_REG_CC7:                55,

    // FPU registers
    MIPS_REG_F0:                 56,
    MIPS_REG_F1:                 57,
    MIPS_REG_F2:                 58,
    MIPS_REG_F3:                 59,
    MIPS_REG_F4:                 60,
    MIPS_REG_F5:                 61,
    MIPS_REG_F6:                 62,
    MIPS_REG_F7:                 63,
    MIPS_REG_F8:                 64,
    MIPS_REG_F9:                 65,
    MIPS_REG_F10:                66,
    MIPS_REG_F11:                67,
    MIPS_REG_F12:                68,
    MIPS_REG_F13:                69,
    MIPS_REG_F14:                70,
    MIPS_REG_F15:                71,
    MIPS_REG_F16:                72,
    MIPS_REG_F17:                73,
    MIPS_REG_F18:                74,
    MIPS_REG_F19:                75,
    MIPS_REG_F20:                76,
    MIPS_REG_F21:                77,
    MIPS_REG_F22:                78,
    MIPS_REG_F23:                79,
    MIPS_REG_F24:                80,
    MIPS_REG_F25:                81,
    MIPS_REG_F26:                82,
    MIPS_REG_F27:                83,
    MIPS_REG_F28:                84,
    MIPS_REG_F29:                85,
    MIPS_REG_F30:                86,
    MIPS_REG_F31:                87,
    MIPS_REG_FCC0:               88,
    MIPS_REG_FCC1:               89,
    MIPS_REG_FCC2:               90,
    MIPS_REG_FCC3:               91,
    MIPS_REG_FCC4:               92,
    MIPS_REG_FCC5:               93,
    MIPS_REG_FCC6:               94,
    MIPS_REG_FCC7:               95,

    // AFPR128 registers
    MIPS_REG_W0:                 96,
    MIPS_REG_W1:                 97,
    MIPS_REG_W2:                 98,
    MIPS_REG_W3:                 99,
    MIPS_REG_W4:                100,
    MIPS_REG_W5:                101,
    MIPS_REG_W6:                102,
    MIPS_REG_W7:                103,
    MIPS_REG_W8:                104,
    MIPS_REG_W9:                105,
    MIPS_REG_W10:               106,
    MIPS_REG_W11:               107,
    MIPS_REG_W12:               108,
    MIPS_REG_W13:               109,
    MIPS_REG_W14:               110,
    MIPS_REG_W15:               111,
    MIPS_REG_W16:               112,
    MIPS_REG_W17:               113,
    MIPS_REG_W18:               114,
    MIPS_REG_W19:               115,
    MIPS_REG_W20:               116,
    MIPS_REG_W21:               117,
    MIPS_REG_W22:               118,
    MIPS_REG_W23:               119,
    MIPS_REG_W24:               120,
    MIPS_REG_W25:               121,
    MIPS_REG_W26:               122,
    MIPS_REG_W27:               123,
    MIPS_REG_W28:               124,
    MIPS_REG_W29:               125,
    MIPS_REG_W30:               126,
    MIPS_REG_W31:               127,
    MIPS_REG_HI:                128,
    MIPS_REG_LO:                129,
    MIPS_REG_P0:                130,
    MIPS_REG_P1:                131,
    MIPS_REG_P2:                132,
    MIPS_REG_MPL0:              133,
    MIPS_REG_MPL1:              134,
    MIPS_REG_MPL2:              135,

    // Alias-registers
    MIPS_REG_ZERO:                2, // MIPS_REG_0
    MIPS_REG_AT:                  3, // MIPS_REG_1
    MIPS_REG_V0:                  4, // MIPS_REG_2
    MIPS_REG_V1:                  5, // MIPS_REG_3
    MIPS_REG_A0:                  6, // MIPS_REG_4
    MIPS_REG_A1:                  7, // MIPS_REG_5
    MIPS_REG_A2:                  8, // MIPS_REG_6
    MIPS_REG_A3:                  9, // MIPS_REG_7
    MIPS_REG_T0:                 10, // MIPS_REG_8
    MIPS_REG_T1:                 11, // MIPS_REG_9
    MIPS_REG_T2:                 12, // MIPS_REG_10
    MIPS_REG_T3:                 13, // MIPS_REG_11
    MIPS_REG_T4:                 14, // MIPS_REG_12
    MIPS_REG_T5:                 15, // MIPS_REG_13
    MIPS_REG_T6:                 16, // MIPS_REG_14
    MIPS_REG_T7:                 17, // MIPS_REG_15
    MIPS_REG_S0:                 18, // MIPS_REG_16
    MIPS_REG_S1:                 19, // MIPS_REG_17
    MIPS_REG_S2:                 20, // MIPS_REG_18
    MIPS_REG_S3:                 21, // MIPS_REG_19
    MIPS_REG_S4:                 22, // MIPS_REG_20
    MIPS_REG_S5:                 23, // MIPS_REG_21
    MIPS_REG_S6:                 24, // MIPS_REG_22
    MIPS_REG_S7:                 25, // MIPS_REG_23
    MIPS_REG_T8:                 26, // MIPS_REG_24
    MIPS_REG_T9:                 27, // MIPS_REG_25
    MIPS_REG_K0:                 28, // MIPS_REG_26
    MIPS_REG_K1:                 29, // MIPS_REG_27
    MIPS_REG_GP:                 30, // MIPS_REG_28
    MIPS_REG_SP:                 31, // MIPS_REG_29
    MIPS_REG_FP:                 32, // MIPS_REG_30
    MIPS_REG_S8:                 32, // MIPS_REG_30
    MIPS_REG_RA:                 33, // MIPS_REG_31
    MIPS_REG_HI0:                45, // MIPS_REG_AC0
    MIPS_REG_HI1:                46, // MIPS_REG_AC1
    MIPS_REG_HI2:                47, // MIPS_REG_AC2
    MIPS_REG_HI3:                48, // MIPS_REG_AC3
    MIPS_REG_LO0:                45, // MIPS_REG_HI0
    MIPS_REG_LO1:                46, // MIPS_REG_HI1
    MIPS_REG_LO2:                47, // MIPS_REG_HI2
    MIPS_REG_LO3:                48, // MIPS_REG_HI3
});
