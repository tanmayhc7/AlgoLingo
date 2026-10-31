/* Lesson data: classic bit tricks (structure mode): XOR cancelling, Kernighan's popcount, subset masks. */
(function () {
  var BX = 290, BDX = 88, IDX_Y = 32, A_Y = 82, B_Y = 130, R_Y = 178;
  function bits(v) { var o = []; for (var i = 7; i >= 0; i--) o.push((v >> i) & 1); return o; }
  function bin(v) { return '0b' + bits(v).join(''); }
  function layout(labels) {
    var ops = [], ys = [A_Y, B_Y, R_Y];
    labels.forEach(function (l, r) { ops.push(['node', 'lbl' + r, l, 130, ys[r], 'cell'], ['tag', 'lbl' + r, 'dim']); });
    for (var i = 0; i < 8; i++) {
      ops.push(['node', 'ix' + i, String(7 - i), BX + i * BDX, IDX_Y, 'cell'], ['tag', 'ix' + i, 'dim']);
      labels.forEach(function (l, r) { ops.push(['node', 'r' + r + '_' + i, '', BX + i * BDX, ys[r], 'cell']); });
    }
    return ops;
  }
  function setRow(r, v, cur) {
    var o = [], nb = bits(v), pb = cur === null ? null : bits(cur);
    for (var i = 0; i < 8; i++) if (pb === null || pb[i] !== nb[i]) {
      o.push(['lab', 'r' + r + '_' + i, String(nb[i])], [nb[i] ? 'tag' : 'untag', 'r' + r + '_' + i, 'done']);
    }
    return o;
  }

  /* 1. single number via XOR */
  function xorScene() {
    var nums = [4, 1, 2, 1, 2], steps = [], acc = 0;
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Every value in ' + JSON.stringify(nums) + ' appears twice except one. Find it in O(n) time and O(1) space, without a hash map. XOR has three useful laws: x ^ x = 0, x ^ 0 = x, and the order does not matter. So paired values cancel and the single one remains.', csay: 'int acc = 0;', ds: layout(['n', 'acc']).concat(setRow(1, 0, null), setRow(0, 0, null)) });
    var curN = 0;
    nums.forEach(function (n) {
      var na = acc ^ n;
      var o = setRow(0, n, curN).concat(setRow(1, na, acc));
      steps.push({ pl: 3, cl: 3, h: 380, say: 'acc = ' + bin(acc) + ' ^ ' + bin(n) + ' = ' + bin(na) + ' (' + acc + ' ^ ' + n + ' = ' + na + ').' + (na < acc ? ' A matching value just cancelled something.' : ''), csay: 'acc ^= ' + n + ';', ds: o.concat([['hot', 'lbl1']]) });
      curN = n; acc = na;
    });
    steps.push({ pl: 4, cl: 4, h: 380, say: 'acc = ' + acc + ': the value that had no partner. Each pair XORed to 0 no matter where it sat in the list.', csay: 'return acc;', ds: [] });
    return steps;
  }

  /* 2. Kernighan popcount */
  function popScene() {
    var n = 0xB4, steps = [], count = 0;   /* 10110100 */
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Count the 1 bits of n = ' + bin(n) + ' (' + n + '). Checking all 8 positions costs 8 steps. Kernighan\'s trick costs one step per 1 bit: n & (n - 1) removes exactly the lowest set bit.', csay: 'int count = 0;', ds: layout(['n', 'n - 1', 'result']).concat(setRow(0, n, null)) });
    var pB = null, pR = null, pA = n;
    while (n) {
      var m = n - 1, r = n & m;
      var o = setRow(1, m, pB).concat(setRow(2, r, pR));
      steps.push({ pl: 3, cl: 3, h: 380, say: 'n - 1 flips the lowest 1 bit to 0 and every 0 below it to 1 (' + bin(m) + '). ANDing with n keeps everything above and clears that bit and everything below it: ' + bin(r) + '.', csay: 'n &= n - 1;', ds: o });
      pB = m; pR = r;
      count++;
      var o2 = setRow(0, r, pA);
      steps.push({ pl: 4, cl: 4, h: 380, say: 'One set bit removed: count = ' + count + '. n becomes ' + bin(r) + '.' + (r ? '' : ' n is 0, so stop.'), csay: 'count++;', ds: o2 });
      pA = r; n = r;
    }
    steps.push({ pl: 5, cl: 5, h: 380, say: 'count = ' + count + ' after ' + count + ' loops. The same expression has another use: n & (n - 1) == 0 means n has at most one set bit, so for n > 0 it tests "n is a power of two".', csay: 'return count;', ds: [] });
    return steps;
  }

  /* 3. subsets by mask */
  function maskScene() {
    var items = ['a', 'b', 'c'], steps = [], ops = [];
    items.forEach(function (it, i) { ops.push(['node', 'it' + i, it, 440 + i * 100, 40, 'cell'], ['tag', 'it' + i, 'dim']); ops.push(['node', 'bt' + i, '0', 440 + i * 100, 120, 'cell']); });
    ops.push(['node', 'lblIt', 'items', 250, 40, 'cell'], ['tag', 'lblIt', 'dim'], ['node', 'lblBits', 'mask', 250, 120, 'cell'], ['tag', 'lblBits', 'dim']);
    ops.push(['node', 'out', '{}', 250, 190, 'cell']);
    steps.push({ pl: 0, cl: 0, h: 380, say: 'A set of 3 items has 2^3 = 8 subsets, one for each 3-bit number from 0 to 7. Bit i of the mask says whether item i is in the subset. A single loop replaces recursion.', csay: 'for (mask = 0; mask < (1 << n); mask++)', ds: ops });
    var prev = 0;
    for (var m = 0; m < 8; m++) {
      var o = [], chosen = [];
      for (var i = 0; i < 3; i++) {
        var bit = (m >> i) & 1;   /* bit i belongs to item i */
        o.push(['lab', 'bt' + i, String(bit)], [bit ? 'tag' : 'untag', 'bt' + i, 'done']);
        if (bit) chosen.push(items[i]);
      }
      o.push(['lab', 'out', chosen.length ? chosen.join('') : '{}']);
      steps.push({ pl: 2, cl: 2, h: 380, say: 'mask = ' + m + ' (binary ' + (m >> 2 & 1) + (m >> 1 & 1) + (m & 1) + ', bit i belongs to item i): ' + (chosen.length ? 'the subset {' + chosen.join(', ') + '}.' : 'the empty subset.'), csay: 'mask = ' + m, ds: o });
    }
    steps.push({ pl: 4, cl: 4, h: 380, say: 'All 8 masks visited, so all 8 subsets. Cost O(n x 2^n). This works while n fits in a machine word (about 20 to 30 in practice), which is exactly where bitmask dynamic programming and "n is small" problems live.', csay: 'done', ds: [] });
    return steps;
  }

  window.LESSON = {
    id: 'bit-tricks',
    mode: 'ds',
    title: 'Bit tricks for interviews',
    lede:
      'A handful of bit ideas cover most interview questions. XOR cancels equal values, so a list where everything is paired except one value collapses to that value. n & (n - 1) drops the lowest set bit, which counts bits in one step per 1 and tests powers of two. And a number from 0 to 2^n - 1 is a subset of n items, so a plain loop enumerates every subset. Each runs in O(1) extra space and has the same code in C and Python.',
    scenes: [
      { id: 'xor-single', title: 'The single number (XOR)', blurb: 'Paired values cancel to 0; what is left is the one without a partner.', trap: 'The trick needs "every other value appears exactly twice" (or an even number of times). If values can appear three times, XOR no longer cancels them: count bits per position modulo 3, or use a hash map.', pyCode: ['def single(nums):', '    acc = 0', '    for n in nums:', '        acc ^= n', '    return acc'], cCode: ['int single(const int *nums, int n) {', '    int acc = 0;', '    for (int i = 0; i < n; i++)', '        acc ^= nums[i];', '    return acc; }'], predict: { q: 'XOR the numbers 7, 3, 7, 3, 9 together. What is the result?', options: ['0', '9', '29'], answer: 1, why: '7 ^ 7 = 0 and 3 ^ 3 = 0, and 0 ^ 9 = 9. Order does not matter.' }, steps: xorScene() },
      { id: 'popcount', title: 'Counting set bits (n & (n - 1))', blurb: 'Each loop clears the lowest 1 bit, so the loop runs once per set bit.', trap: 'In Python n & (n - 1) is fine for non-negative ints, but a negative n has infinitely many leading 1s, so the loop never ends. Mask first (n & 0xFFFFFFFF) or use int.bit_count(). In C use an unsigned type so the shifts and subtraction are well defined.', pyCode: ['def popcount(n):', '    count = 0', '    while n:', '        n &= n - 1     # drop the lowest set bit', '        count += 1', '    return count'], cCode: ['int popcount(unsigned n) {', '    int count = 0;', '    while (n) {', '        n &= n - 1;    /* drop the lowest set bit */', '        count++;', '    } return count; }'], predict: { q: 'For n > 0, n & (n - 1) == 0 tells you that n is:', options: ['even', 'a power of two', 'prime'], answer: 1, why: 'A power of two has a single 1 bit; clearing it leaves 0. Any other positive number still has a 1 left.' }, steps: popScene() },
      { id: 'subsets', title: 'Subsets as bitmasks', blurb: 'Counting from 0 to 2^n - 1 visits every subset exactly once.', trap: 'Shifting 1 << n for large n overflows a C int (use 1ULL << n and n < 64) and is slow in any language past n of about 25. Also bit order: decide whether bit 0 is the first or the last item and stay consistent.', pyCode: ['def subsets(items):', '    n = len(items)', '    for mask in range(1 << n):', '        yield [items[i] for i in range(n) if mask >> i & 1]', '    # 2**n masks'], cCode: ['for (unsigned mask = 0; mask < (1u << n); mask++) {', '    /* bit i of mask set => items[i] is in the subset */', '    for (int i = 0; i < n; i++)', '        if (mask >> i & 1) use(items[i]);', '}'], predict: { q: 'How many masks does the loop for n = 10 items visit?', options: ['10', '100', '1024'], answer: 2, why: '2^10 = 1024 masks, one per subset.' }, steps: maskScene() },
    ],
    builtins: [
      ['x ^ x == 0, x ^ 0 == x', 'The laws behind every XOR-cancelling trick.'],
      ['x & (x - 1)', 'Clear the lowest set bit.'],
      ['x & -x', 'Isolate the lowest set bit (works with two\'s complement in both languages).'],
      ['x & (x - 1) == 0', 'Power-of-two test (for x > 0; mind precedence: use parentheses).'],
      ['x.bit_count(), bin(x).count("1")', 'Library ways to count set bits in Python.'],
      ['1 << n', 'Number of subsets of n items; also the mask for bit n.'],
    ],
  };
})();
