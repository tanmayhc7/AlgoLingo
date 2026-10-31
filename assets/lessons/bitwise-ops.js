/* Lesson data: bitwise operators and masks (structure mode). Each number is a row of eight bit cells. */
(function () {
  var BX = 290, BDX = 88, IDX_Y = 32, A_Y = 82, B_Y = 130, R_Y = 178;
  function bits(v) { var o = []; for (var i = 7; i >= 0; i--) o.push((v >> i) & 1); return o; }
  function bin(v) { return '0b' + bits(v).join(''); }
  function id(row, i) { return row + i; }
  function layout(rows) {
    var ops = [];
    ops.push(['node', 'lblA', rows[0], 130, A_Y, 'cell'], ['tag', 'lblA', 'dim']);
    if (rows[1]) ops.push(['node', 'lblB', rows[1], 130, B_Y, 'cell'], ['tag', 'lblB', 'dim']);
    ops.push(['node', 'lblR', rows[2], 130, R_Y, 'cell'], ['tag', 'lblR', 'dim']);
    for (var i = 0; i < 8; i++) {
      ops.push(['node', 'ix' + i, String(7 - i), BX + i * BDX, IDX_Y, 'cell'], ['tag', 'ix' + i, 'dim']);
      ['a', 'b', 'r'].forEach(function (r) {
        if (r === 'b' && !rows[1]) return;
        ops.push(['node', id(r, i), '', BX + i * BDX, r === 'a' ? A_Y : r === 'b' ? B_Y : R_Y, 'cell']);
      });
    }
    return ops;
  }
  /* write value v into row r; cur is the previous value or null */
  function setRow(r, v, cur) {
    var o = [], nb = bits(v), pb = cur === null ? null : bits(cur);
    for (var i = 0; i < 8; i++) {
      if (pb === null || pb[i] !== nb[i]) {
        o.push(['lab', id(r, i), String(nb[i])]);
        o.push([nb[i] ? 'tag' : 'untag', id(r, i), 'done']);
      }
    }
    return o;
  }
  function hotBits(i, withB) { var h = ['hot', id('a', i), id('r', i)]; if (withB) h.splice(2, 0, id('b', i)); return h; }

  var A = 0xCA, B = 0xAC;   /* 11001010 and 10101100 */

  function binary(sym, name, fn, ruleText) {
    var steps = [];
    var ops = layout(['a', 'b', 'a ' + sym + ' b']).concat(setRow('a', A, null), setRow('b', B, null));
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Two 8-bit numbers: a = ' + bin(A) + ' (' + A + ') and b = ' + bin(B) + ' (' + B + '). The operator ' + sym + ' (' + name + ') works on every bit position independently: ' + ruleText, csay: 'uint8_t a = 0xCA, b = 0xAC;', ds: ops });
    var res = 0;
    for (var i = 0; i < 8; i++) {
      var pos = 7 - i, x = (A >> pos) & 1, y = (B >> pos) & 1, z = fn(x, y);
      res |= z << pos;
      steps.push({ pl: 1, cl: 1, h: 380, say: 'Bit ' + pos + ': ' + x + ' ' + sym + ' ' + y + ' = ' + z + '.', csay: 'bit ' + pos + ' -> ' + z, ds: [['lab', id('r', i), String(z)], [z ? 'tag' : 'untag', id('r', i), 'done'], ['hot', id('a', i), id('b', i), id('r', i)]] });
    }
    steps.push({ pl: 1, cl: 1, h: 380, say: 'Result: ' + bin(res) + ' = ' + res + '. In Python this is a ' + sym + ' b == ' + res + '; in C the same expression gives ' + res + ' too, because both operands fit in a byte.', csay: 'a ' + sym + ' b == ' + res, ds: [] });
    return steps;
  }

  /* masks: test, set, clear, toggle on one number x */
  function masks() {
    var steps = [], x = 0x24;   /* 00100100 */
    var ops = layout(['x', 'mask', 'result']).concat(setRow('a', x, null));
    steps.push({ pl: 0, cl: 0, h: 380, say: 'x = ' + bin(x) + ' (' + x + '). A mask is a number with 1s where you want to act. The mask for bit k is 1 << k. Four everyday operations: test, set, clear and toggle one bit.', csay: 'uint8_t x = 0x24;', ds: ops });
    var curB = null, curA = x;
    function show(k, resVal, pl, cl, say, csay, xv) {
      var m = 1 << k, o = setRow('b', m, curB).concat(setRow('a', xv, curA));
      curB = m; curA = xv;
      o = o.concat(setRow('r', resVal, steps._r === undefined ? null : steps._r));
      steps._r = resVal;
      o.push(['hot', id('b', 7 - k), id('a', 7 - k), id('r', 7 - k)]);
      steps.push({ pl: pl, cl: cl, h: 380, say: say, csay: csay, ds: o });
    }
    var t = (x >> 5) & 1;
    show(5, x & (1 << 5), 1, 1, 'Test bit 5: mask = 1 << 5 = ' + bin(1 << 5) + '. x & mask keeps only bit 5, so the result is non-zero exactly when bit 5 is set. Here it is ' + t + ': yes, set. (Common form: (x >> 5) & 1.)', '(x >> 5) & 1', x);
    var s1 = x | (1 << 1);
    show(1, s1, 2, 2, 'Set bit 1: x | (1 << 1). OR with a 1 forces that bit to 1 and leaves every other bit alone. Result ' + bin(s1) + '.', 'x |= 1 << 1;', x);
    x = s1;
    var c1 = x & ~(1 << 2);
    show(2, c1, 3, 3, 'Clear bit 2: x & ~(1 << 2). ~mask is all 1s except bit 2, and AND with 0 forces that bit to 0. Result ' + bin(c1) + '.', 'x &= ~(1 << 2);', x);
    x = c1;
    var g = x ^ (1 << 5);
    show(5, g, 4, 4, 'Toggle bit 5: x ^ (1 << 5). XOR with 1 flips the bit, XOR with 0 keeps it. Bit 5 was 1, now 0. Result ' + bin(g) + '.', 'x ^= 1 << 5;', x);
    steps.push({ pl: 4, cl: 4, h: 380, say: 'These four lines are the whole toolkit: test with &, set with |, clear with & ~, toggle with ^. Flags, permissions, feature sets and bitsets all use them.', csay: 'Done.', ds: [] });
    delete steps._r;
    return steps;
  }

  var pyOp = function (op) { return ['a, b = 0b11001010, 0b10101100', 'result = a ' + op + ' b       # compared bit by bit']; };
  var cOp = function (op) { return ['uint8_t a = 0xCA, b = 0xAC;', 'uint8_t result = a ' + op + ' b;   /* compared bit by bit */']; };

  window.LESSON = {
    id: 'bitwise-ops',
    mode: 'ds',
    title: 'Bitwise operators and masks',
    lede:
      'Every integer is a row of bits, and the operators &, |, ^, ~, << and >> work on those bits directly. They are the same in C and Python, with one difference that matters in interviews: a C integer has a fixed width, while a Python int has unlimited width, so ~x is -x - 1 and shifts never overflow. Once you can test, set, clear and toggle a bit with a mask, flags, bitsets and most "bit trick" questions become routine.',
    scenes: [
      { id: 'and', title: 'AND (&)', blurb: 'A result bit is 1 only where both inputs have a 1. AND is how you keep or test bits.', trap: 'Confusing & with and. In Python, a and b is a logical operator that returns one of its operands, while a & b works on bits. Also precedence: == binds tighter than &, so write (x & 4) == 4 with parentheses, in both languages.', pyCode: pyOp('&'), cCode: cOp('&'), predict: { q: 'What is 0b1100 & 0b1010?', options: ['0b1000', '0b1110', '0b0110'], answer: 0, why: 'Only bit 3 is 1 in both numbers, so only bit 3 survives: 0b1000.' }, steps: binary('&', 'AND', function (x, y) { return x & y; }, 'a result bit is 1 only if both input bits are 1.') },
      { id: 'or', title: 'OR (|)', blurb: 'A result bit is 1 where either input has a 1. OR is how you set bits.', trap: 'Using + instead of | to combine flags works only while the flags do not overlap. If the same flag is added twice, + carries into the next bit while | is idempotent: x | x == x.', pyCode: pyOp('|'), cCode: cOp('|'), predict: { q: 'Which operator forces a chosen bit to 1 without disturbing the others?', options: ['x & mask', 'x | mask', 'x ^ mask'], answer: 1, why: 'OR with a 1 gives 1; OR with a 0 leaves the bit as it was.' }, steps: binary('|', 'OR', function (x, y) { return x | y; }, 'a result bit is 1 if at least one input bit is 1.') },
      { id: 'xor', title: 'XOR (^)', blurb: 'A result bit is 1 where the inputs differ. XOR flips bits and cancels equal values.', trap: 'Remembering ^ as "power" from maths. In both languages ^ is XOR; exponent is ** in Python and pow() in C. Also x ^ x == 0 and x ^ 0 == x, which is the basis of many tricks.', pyCode: pyOp('^'), cCode: cOp('^'), predict: { q: 'What is x ^ x for any x?', options: ['x', '0', '1'], answer: 1, why: 'Every bit is compared with itself, so no pair differs and every result bit is 0.' }, steps: binary('^', 'XOR', function (x, y) { return x ^ y; }, 'a result bit is 1 only where the two input bits differ.') },
      { id: 'masks', title: 'Test, set, clear, toggle', blurb: 'One mask, four operations. The mask for bit k is 1 << k.', trap: 'In C, 1 << 31 on a plain int is signed overflow (undefined behaviour); use 1u << 31 or 1ULL << 40 for wide masks. In Python, ~mask is negative (-mask - 1), but x & ~mask still works because Python treats negative ints as infinite two\'s complement.', pyCode: ['x = 0b00100100', 'x & (1 << 5)        # test bit 5', 'x |= 1 << 1         # set bit 1', 'x &= ~(1 << 2)      # clear bit 2', 'x ^= 1 << 5         # toggle bit 5'], cCode: ['uint8_t x = 0x24;', 'x & (1u << 5);       /* test bit 5 */', 'x |= 1u << 1;       /* set bit 1 */', 'x &= ~(1u << 2);    /* clear bit 2 */', 'x ^= 1u << 5;       /* toggle bit 5 */'], predict: { q: 'Which expression clears bit 3 of x?', options: ['x | (1 << 3)', 'x & ~(1 << 3)', 'x ^ (1 << 3)'], answer: 1, why: '~(1 << 3) is all 1s except bit 3, and AND with that mask zeroes bit 3 only.' }, steps: masks() },
    ],
    builtins: [
      ['bin(x), hex(x), int("101", 2)', 'Convert to and from binary and hex text.'],
      ['x.bit_length()', 'Number of bits needed for x, e.g. (37).bit_length() is 6.'],
      ['x.bit_count()', 'Population count: the number of 1 bits (Python 3.10+).'],
      ['x & 0xFF, x & 0xFFFFFFFF', 'Emulate a fixed-width unsigned C integer in Python.'],
      ['__builtin_popcount(x)', 'GCC/Clang intrinsic for counting set bits in C.'],
      ['x << k, x >> k', 'Multiply or divide by 2^k (>> on negatives is arithmetic in Python, implementation-defined in C).'],
    ],
  };
})();
