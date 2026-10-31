/* Lesson data: prefix sums and difference arrays (structure mode). Column c shows P[c] under a[c-1]. */
(function () {
  var A = [3, 1, 4, 1, 5, 9], BX = 250, DX = 96, IY = 32, AY = 82, PY = 130, RY = 178;
  function cx(c) { return BX + c * DX; }
  function base(rows) {
    var ops = [];
    ops.push(['node', 'la', rows[0], 110, AY, 'cell'], ['tag', 'la', 'dim'], ['node', 'lp', rows[1], 110, PY, 'cell'], ['tag', 'lp', 'dim']);
    for (var c = 0; c <= A.length; c++) {
      ops.push(['node', 'i' + c, String(c), cx(c), IY, 'cell'], ['tag', 'i' + c, 'dim']);
      ops.push(['node', 'a' + c, c ? String(A[c - 1]) : '', cx(c), AY, 'cell']);
      ops.push(['node', 'p' + c, '', cx(c), PY, 'cell']);
    }
    ops.push(['tag', 'a0', 'dim']);
    return ops;
  }
  var P = [0]; A.forEach(function (x, i) { P.push(P[i] + x); });

  function build() {
    var steps = [];
    steps.push({ pl: 0, cl: 0, h: 380, say: 'A prefix-sum array p has one extra slot: p[j] is the sum of the first j values, so p[0] = 0 (the empty sum). The values of a are drawn one column to the right so that p[j] sits under the last value it includes.', csay: 'int a[6] = {3, 1, 4, 1, 5, 9}; int p[7];', ds: base(['a', 'p']) });
    steps.push({ pl: 1, cl: 1, h: 380, say: 'p[0] = 0: nothing added yet.', csay: 'p[0] = 0;', ds: [['lab', 'p0', '0'], ['tag', 'p0', 'done']] });
    for (var i = 0; i < A.length; i++) {
      steps.push({ pl: 3, cl: 3, h: 380, say: 'p[' + (i + 1) + '] = p[' + i + '] + a[' + i + '] = ' + P[i] + ' + ' + A[i] + ' = ' + P[i + 1] + '. Each entry reuses the previous one, so the whole table costs O(n).', csay: 'p[i + 1] = p[i] + a[i];  /* i = ' + i + ' */', ds: [['lab', 'p' + (i + 1), String(P[i + 1])], ['tag', 'p' + (i + 1), 'done'], ['hot', 'p' + i, 'a' + (i + 1), 'p' + (i + 1)]] });
    }
    steps.push({ pl: 4, cl: 4, h: 380, say: 'Done: p = ' + JSON.stringify(P).replace(/,/g, ', ') + '. One pass, O(n) time, one extra array of n + 1 values.', csay: 'return;', ds: [] });
    return steps;
  }

  function query() {
    var steps = [], l = 2, r = 4, i;
    var ops = base(['a', 'p']);
    for (i = 0; i <= A.length; i++) { ops.push(['lab', 'p' + i, String(P[i])], ['tag', 'p' + i, 'done']); }
    steps.push({ pl: 0, cl: 0, h: 380, say: 'The table is built. Question: what is the sum of a[' + l + '..' + r + '] (inclusive)? Adding the values costs O(r - l). The prefix table answers in O(1).', csay: 'range_sum(p, 2, 4)', ds: ops });
    var o = [];
    for (i = l; i <= r; i++) o.push(['tag', 'a' + (i + 1), 'cur']);
    steps.push({ pl: 0, cl: 0, h: 380, say: 'The range is a[2], a[3], a[4] = ' + A.slice(l, r + 1).join(', ') + '.', csay: 'l = 2, r = 4', ds: o });
    steps.push({ pl: 1, cl: 1, h: 380, say: 'p[' + (r + 1) + '] = ' + P[r + 1] + ' is the sum of everything up to and including a[' + r + '].', csay: 'p[r + 1] = ' + P[r + 1], ds: [['tag', 'p' + (r + 1), 'hot'], ['ptr', 'hi', 'p' + (r + 1), 'down']] });
    steps.push({ pl: 1, cl: 1, h: 380, say: 'p[' + l + '] = ' + P[l] + ' is the sum of everything before a[' + l + ']. That part is not wanted.', csay: 'p[l] = ' + P[l], ds: [['tag', 'p' + l, 'bad'], ['ptr', 'lo', 'p' + l, 'down']] });
    steps.push({ pl: 1, cl: 1, h: 380, say: 'Subtract: ' + P[r + 1] + ' - ' + P[l] + ' = ' + (P[r + 1] - P[l]) + '. That equals ' + A.slice(l, r + 1).join(' + ') + '. Any range, any length: two reads and a subtraction.', csay: 'return p[r + 1] - p[l];', ds: [['node', 'ans', String(P[r + 1] - P[l]), cx(r + 1), RY, 'cell'], ['tag', 'ans', 'done'], ['hot', 'p' + (r + 1), 'p' + l]] });
    return steps;
  }

  var N = 6, UPD = [[1, 3, 5], [2, 5, 3]];
  function diff() {
    var steps = [], ops = [], i, d = [0, 0, 0, 0, 0, 0, 0];
    ops.push(['node', 'ld', 'd', 110, AY, 'cell'], ['tag', 'ld', 'dim'], ['node', 'lr', 'a', 110, PY, 'cell'], ['tag', 'lr', 'dim']);
    for (i = 0; i <= N; i++) {
      ops.push(['node', 'i' + i, String(i), cx(i), IY, 'cell'], ['tag', 'i' + i, 'dim']);
      ops.push(['node', 'a' + i, '0', cx(i), AY, 'cell']);
      if (i < N) ops.push(['node', 'p' + i, '', cx(i), PY, 'cell']);
    }
    steps.push({ pl: 0, cl: 0, h: 380, say: 'A difference array d is the inverse of a prefix sum: d[i] says how much the running total changes at index i. To add v to every element of a[l..r], touch only two entries: d[l] += v and d[r + 1] -= v. The extra slot at index ' + N + ' avoids a bounds check.', csay: 'int d[7] = {0};', ds: ops });
    UPD.forEach(function (u) {
      var l = u[0], r = u[1], v = u[2];
      d[l] += v; d[r + 1] -= v;
      steps.push({ pl: 3, cl: 1, h: 380, say: 'Add ' + v + ' to a[' + l + '..' + r + ']: d[' + l + '] += ' + v + ' marks where the extra ' + v + ' starts.', csay: 'd[' + l + '] += ' + v + ';', ds: [['lab', 'a' + l, String(d[l])], ['tag', 'a' + l, 'cur'], ['hot', 'a' + l]] });
      steps.push({ pl: 4, cl: 2, h: 380, say: 'd[' + (r + 1) + '] -= ' + v + ' marks where it stops. Two writes, however long the range is.', csay: 'd[' + (r + 1) + '] -= ' + v + ';', ds: [['lab', 'a' + (r + 1), String(d[r + 1])], ['tag', 'a' + (r + 1), 'bad'], ['hot', 'a' + (r + 1)]] });
    });
    var run = 0, res = [];
    steps.push({ pl: 5, cl: 5, h: 380, say: 'All updates done: d = ' + JSON.stringify(d).replace(/,/g, ', ') + '. Now one pass of running totals turns it back into the real array.', csay: 'int run = 0;', ds: [['untag', 'a' + UPD[0][0], 'cur'], ['untag', 'a' + (UPD[0][1] + 1), 'bad']] });
    for (i = 0; i < N; i++) {
      run += d[i]; res.push(run);
      steps.push({ pl: 7, cl: 7, h: 380, say: 'run += d[' + i + '] gives ' + run + ', so a[' + i + '] = ' + run + '.', csay: 'run += d[' + i + '];  a[' + i + '] = ' + run + ';', ds: [['lab', 'p' + i, String(run)], ['tag', 'p' + i, 'done'], ['hot', 'a' + i, 'p' + i]] });
    }
    steps.push({ pl: 9, cl: 9, h: 380, say: 'Result a = ' + JSON.stringify(res).replace(/,/g, ', ') + '. With m range updates the cost is O(m + n) instead of O(m n).', csay: 'return;', ds: [] });
    return steps;
  }

  window.LESSON = {
    id: 'prefix-sums',
    mode: 'ds',
    title: 'Prefix sums and difference arrays',
    lede:
      'A prefix-sum array stores running totals, so the sum of any range becomes one subtraction instead of a loop: O(n) to build once, O(1) per query. A difference array is the mirror image: it makes adding a value to a whole range O(1), and one pass at the end rebuilds the array. Together they turn "many range queries" and "many range updates" from O(n) each into O(1) each. The same idea gives subarray-sum-equals-k (with a hash map of prefix sums), 2D prefix sums for rectangles, and range-sum caches in C.',
    scenes: [
      { id: 'build', title: 'Build the prefix table', blurb: 'p[j] is the sum of the first j values. Each entry is the previous one plus one value.', trap: 'Off-by-one: with the n + 1 convention the sum of a[l..r] is p[r + 1] - p[l], not p[r] - p[l]. Also remember the sums can overflow a 32-bit int in C: use long long when values or n are large.',
        pyCode: ['def prefix_sums(a):', '    p = [0] * (len(a) + 1)', '    for i, x in enumerate(a):', '        p[i + 1] = p[i] + x', '    return p'],
        cCode: ['void prefix_sums(const int *a, int n, long long *p) {', '    p[0] = 0;', '    for (int i = 0; i < n; i++)', '        p[i + 1] = p[i] + a[i];', '}'],
        predict: { q: 'For a = [3, 1, 4, 1, 5, 9], what is p[3]?', options: ['4', '8', '13'], answer: 1, why: 'p[3] is the sum of the first three values: 3 + 1 + 4 = 8.' },
        steps: build() },
      { id: 'query', title: 'Answer a range query', blurb: 'Sum of a[l..r] = p[r + 1] - p[l]: the part before l cancels out.', trap: 'p[r + 1] - p[l] includes both ends of the range. Using p[r] - p[l] silently drops a[r], and with l = 0 the n + 1 layout is what keeps p[l - 1] from going out of bounds.',
        pyCode: ['def range_sum(p, l, r):', '    return p[r + 1] - p[l]'],
        cCode: ['long long range_sum(const long long *p, int l, int r) {', '    return p[r + 1] - p[l];', '}'],
        predict: { q: 'Which is the sum of a[2..4] when p is the prefix table of [3, 1, 4, 1, 5, 9]?', options: ['p[4] - p[2]', 'p[5] - p[2]', 'p[5] - p[1]'], answer: 1, why: 'Inclusive end 4 means p[5], and the start 2 is removed with p[2].' },
        steps: query() },
      { id: 'diff', title: 'Difference array: range updates', blurb: 'Add v to a[l..r] by changing d[l] and d[r + 1], then rebuild with one running total.', trap: 'Forgetting the spare slot: r + 1 can equal n. Also, reading the array in the middle of the updates shows the difference array, not the values; rebuild first.',
        pyCode: ['def range_add(n, updates):', '    d = [0] * (n + 1)', '    for l, r, v in updates:', '        d[l] += v', '        d[r + 1] -= v', '    a, run = [], 0', '    for i in range(n):', '        run += d[i]', '        a.append(run)', '    return a'],
        cCode: ['void range_add(int *d, int l, int r, int v) {', '    d[l] += v;', '    d[r + 1] -= v;', '}', '', '/* rebuild after all updates */', 'int run = 0;', 'for (int i = 0; i < n; i++) {', '    run += d[i];', '    a[i] = run;', '}'],
        predict: { q: 'You apply 1000 range additions to an array of length 100000 and read it once. What is the cost with a difference array?', options: ['O(1000 x 100000)', 'O(1000 + 100000)', 'O(100000 log 100000)'], answer: 1, why: 'Each update is O(1) and the single rebuild is O(n).' },
        steps: diff() },
    ],
    builtins: [
      ['itertools.accumulate(a, initial=0)', 'The prefix table in one call: p[0] = 0 then running totals.'],
      ['sum(a[l:r + 1])', 'Direct range sum: O(r - l) each time. Fine for one query, slow for many.'],
      ['collections.defaultdict(int)', 'Count prefix sums seen so far (subarray sum equals k).'],
      ['p[r + 1] - p[l]', 'The range-sum formula with the n + 1 convention.'],
      ['long long (C)', 'Use a wider type for prefix totals to avoid overflow.'],
    ],
  };
})();
