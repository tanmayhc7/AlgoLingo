/* Lesson data: Fenwick tree / binary indexed tree (structure mode). tree[i] covers the last lowbit(i) values ending at i. */
(function () {
  var A0 = [3, 2, 1, 4, 5, 1, 2, 3], N = 8, BX = 170, DX = 100, IY = 32, AY = 82, TY = 130;
  function cx(i) { return BX + (i - 1) * DX; }
  function low(i) { return i & -i; }
  function mk(a) { var t = [0]; for (var i = 1; i <= N; i++) { var s = 0; for (var j = i - low(i) + 1; j <= i; j++) s += a[j - 1]; t.push(s); } return t; }
  function base(a, t) {
    var ops = [];
    ops.push(['node', 'la', 'a', 80, AY, 'cell'], ['tag', 'la', 'dim'], ['node', 'lt', 'tree', 80, TY, 'cell'], ['tag', 'lt', 'dim']);
    for (var i = 1; i <= N; i++) {
      ops.push(['node', 'i' + i, String(i), cx(i), IY, 'cell'], ['tag', 'i' + i, 'dim']);
      ops.push(['node', 'a' + i, String(a[i - 1]), cx(i), AY, 'cell']);
      ops.push(['node', 't' + i, String(t[i]), cx(i), TY, 'cell'], ['note', 't' + i, i - low(i) + 1 === i ? 'a' + i : 'a' + (i - low(i) + 1) + '..' + i]);
      ops.push(['tag', 't' + i, 'done']);
    }
    return ops;
  }
  function update() {
    var a = A0.slice(), t = mk(a), steps = [], idx = 3, v = 5;
    steps.push({ pl: 0, cl: 0, h: 380, say: 'A Fenwick tree stores partial sums in one array. tree[i] holds the sum of the last lowbit(i) values ending at i (lowbit(i) = i & -i, the lowest set bit). The small note under each cell shows the range it covers. Index 1-based: slot 0 is unused.', csay: 'long long tree[9];  /* 1-based */', ds: base(a, t) });
    steps.push({ pl: 1, cl: 1, h: 380, say: 'Update: add ' + v + ' to a[' + idx + ']. Every tree cell whose range contains position ' + idx + ' must change. Those cells are found by repeatedly adding the lowest set bit: i += i & -i.', csay: 'add(3, 5);', ds: [['tag', 'a' + idx, 'cur'], ['lab', 'a' + idx, String(a[idx - 1] + v)]] });
    var i = idx;
    while (i <= N) {
      t[i] += v;
      var nx = i + low(i);
      steps.push({ pl: 2, cl: 2, h: 380, say: 'i = ' + i + ' (binary ' + i.toString(2) + '): tree[' + i + '] += ' + v + ' -> ' + t[i] + '. Next i = ' + i + ' + ' + low(i) + ' = ' + nx + (nx > N ? ', past the end: stop.' : '.'), csay: 'tree[i] += v;  i += i & -i;', ds: [['lab', 't' + i, String(t[i])], ['tag', 't' + i, 'hot'], ['ptr', 'i', 't' + i, 'down']] });
      i = nx;
    }
    steps.push({ pl: 4, cl: 5, h: 380, say: 'Only 3 cells changed out of 8. The number of steps is at most log2(n) + 1, so a point update is O(log n).', csay: 'return;', ds: [['unptr', 'i']] });
    return steps;
  }
  function query() {
    var a = A0.slice(), t = mk(a), steps = [], q = 7, i = q, sum = 0, used = [];
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Prefix query: the sum of a[1..' + q + ']. Walk down by clearing the lowest set bit: i -= i & -i. Each tree cell visited covers a separate block, and together they tile 1..' + q + '.', csay: 'prefix(7);', ds: base(a, t) });
    while (i > 0) {
      sum += t[i];
      var nx = i - low(i);
      steps.push({ pl: 3, cl: 3, h: 380, say: 'i = ' + i + ' (binary ' + i.toString(2) + '): add tree[' + i + '] = ' + t[i] + ' (covers a[' + (i - low(i) + 1) + '..' + i + ']). Running sum ' + sum + '. Next i = ' + i + ' - ' + low(i) + ' = ' + nx + (nx === 0 ? ': stop.' : '.'), csay: 'sum += tree[i];  i -= i & -i;', ds: [['tag', 't' + i, 'cur'], ['ptr', 'i', 't' + i, 'down'], ['hot', 't' + i]] });
      used.push(i); i = nx;
    }
    var exp = 0; for (var k = 0; k < q; k++) exp += a[k];
    steps.push({ pl: 5, cl: 6, h: 380, say: 'The prefix sum is ' + sum + ' (check: 3+2+1+4+5+1+2 = ' + exp + '). A range sum [l..r] is prefix(r) - prefix(l - 1): two O(log n) walks.', csay: 'return sum;', ds: [['unptr', 'i']] });
    return steps;
  }
  window.LESSON = {
    id: 'fenwick',
    mode: 'ds',
    title: 'Fenwick tree (binary indexed tree)',
    lede:
      'Prefix sums answer range queries in O(1) but a single change forces an O(n) rebuild. A Fenwick tree balances both: point updates and prefix queries each cost O(log n), using one array and about ten lines of code. The trick is the lowest set bit: tree[i] stores the sum of the last (i & -i) values ending at i, so an update walks upward by adding the lowest bit and a query walks downward by clearing it. Use it for counting inversions, dynamic rank queries and "sum of a range with updates". It is smaller and faster than a segment tree but only works for operations that can be subtracted (sum, xor), not for min or max.',
    scenes: [
      { id: 'update', title: 'Point update', blurb: 'Add v at position p: walk up with i += i & -i, adding to every cell whose range includes p.', trap: 'The structure is 1-indexed: with index 0, i & -i is 0 and the loop never ends. Convert from 0-based input (use i + 1) at the boundary.',
        pyCode: ['def add(tree, i, v):', '    while i < len(tree):', '        tree[i] += v', '        i += i & -i'],
        cCode: ['void add(long long *tree, int n, int i, long long v) {', '    while (i <= n) {', '        tree[i] += v;', '        i += i & -i;', '    }', '}'],
        predict: { q: 'After tree[3] changes, which cell is updated next (n = 8)?', options: ['tree[4]', 'tree[6]', 'tree[8]'], answer: 0, why: '3 is 011 and its lowest set bit is 1, so the next index is 3 + 1 = 4. After that 4 + 4 = 8.' },
        steps: update() },
      { id: 'query', title: 'Prefix query', blurb: 'Sum a[1..q] by repeatedly clearing the lowest set bit.', trap: 'prefix(r) - prefix(l - 1) gives the range sum; with a 1-based tree prefix(0) is 0 and the loop does not run. Sums can overflow int: use long long.',
        pyCode: ['def prefix(tree, i):', '    total = 0', '    while i > 0:', '        total += tree[i]', '        i -= i & -i', '    return total'],
        cCode: ['long long prefix(const long long *tree, int i) {', '    long long sum = 0;', '    while (i > 0) {', '        sum += tree[i];', '        i -= i & -i;', '    }', '    return sum;', '}'],
        predict: { q: 'How many tree cells does prefix(7) read? (7 is 111 in binary)', options: ['1', '3', '7'], answer: 1, why: 'Each step clears one set bit: 7 -> 6 -> 4 -> 0, so three reads.' },
        steps: query() },
    ],
    builtins: [
      ['i & -i', 'The lowest set bit of i (two\'s complement trick).'],
      ['[0] * (n + 1)', 'A 1-indexed tree array; slot 0 stays unused.'],
      ['bisect', 'Not used here, but a Fenwick tree can be descended by bit to find the k-th element.'],
      ['sortedcontainers.SortedList', 'Not in the standard library; a Fenwick tree is the usual interview alternative.'],
    ],
  };
})();
