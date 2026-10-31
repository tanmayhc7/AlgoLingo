/* Lesson: counting sort and radix sort, animated as bars. */
(function () {
  /* move the elements into the stable order given by key, one at a time, showing each placement */
  function placeStable(T, keyOf, pl, cl, label, extra) {
    var n = T.n;
    var ids = T.order.slice();
    var tgt = ids.slice().sort(function (x, y) { return keyOf(T.vals[x]) - keyOf(T.vals[y]) || ids.indexOf(x) - ids.indexOf(y); });
    for (var p = 0; p < n; p++) {
      var id = tgt[p], q = T.order.indexOf(id);
      if (q !== p) { T.swap(p, q); T.swaps++; }
      T.frame(pl, cl, label(T.vals[id], keyOf(T.vals[id]), p), { swp: [p], sorted: T.range(0, p - 1), vars: extra });
    }
  }

  var PY_COUNT = ['def counting_sort(a, k):            # values are integers 0..k', '    count = [0] * (k + 1)', '    for x in a: count[x] += 1       # tally', '    for v in range(1, k + 1): count[v] += count[v - 1]   # prefix sums', '    out = [0] * len(a)', '    for x in reversed(a):           # right to left keeps it stable', '        count[x] -= 1', '        out[count[x]] = x', '    return out'];
  var C_COUNT = ['void counting_sort(int a[], int out[], int n, int k) {', '    int count[K + 1] = {0};', '    for (int i = 0; i < n; i++) count[a[i]]++;', '    for (int v = 1; v <= k; v++) count[v] += count[v - 1];', '    /* out has n slots */', '    for (int i = n - 1; i >= 0; i--) {', '        count[a[i]]--;', '        out[count[a[i]]] = a[i];', '    }}'];

  function counting(T) {
    var n = T.n, k = 5, count = [0, 0, 0, 0, 0, 0];
    function cv() { var o = {}; count.forEach(function (c, v) { o['c' + v] = c; }); return o; }
    T.frame(-1, -1, 'Counting sort never compares two values. Values are small integers 0..' + k + ', so it tallies how many of each there are, then rebuilds the array from the tallies. c0..c5 below are the counters.', {});
    for (var i = 0; i < n; i++) {
      count[T.v(i)]++;
      T.frame(2, 2, 'Read ' + T.v(i) + ': add one to its counter c' + T.v(i) + '.', { mark: [i], ptr: { i: i }, vars: cv() });
    }
    var run = 0;
    for (var v = 1; v <= k; v++) { count[v] += count[v - 1]; }
    T.frame(3, 3, 'Prefix sums: c[v] now says how many values are <= v, which is where the block for v ENDS in the sorted output.', { vars: cv() });
    var ids = T.order.slice(), pos = {};
    var tgt = {};
    for (var r = n - 1; r >= 0; r--) {
      var val = T.vals[ids[r]];
      count[val]--;
      tgt[ids[r]] = count[val];
    }
    count = [0, 0, 0, 0, 0, 0];
    ids.forEach(function (id) { count[T.vals[id]]++; });
    for (var v2 = 1; v2 <= k; v2++) count[v2] += count[v2 - 1];
    for (var s = n - 1; s >= 0; s--) {
      var id = ids[s], t = tgt[id], q = T.order.indexOf(id);
      count[T.vals[id]]--;
      if (q !== t) { T.swap(t, q); T.swaps++; }
      T.frame(7, 7, 'Going right to left, ' + T.vals[id] + ' goes to slot ' + t + ' (its counter dropped to ' + t + ').', { swp: [t], vars: cv() });
    }
    T.frame(-1, -1, 'Sorted with no comparisons: O(n + k) time and O(n + k) space. It wins when the range k is small compared with n, and the right-to-left pass keeps equal values in their original order (stable), which radix sort relies on.', { sorted: T.range(0, n - 1) });
  }

  var PY_RADIX = ['def radix_sort(a):                  # non-negative integers', '    exp = 1', '    while max(a) // exp > 0:', '        a = stable_sort_by(a, key=lambda x: (x // exp) % 10)', '        exp *= 10', '    return a'];
  var C_RADIX = ['void radix_sort(int a[], int n) {', '    int exp = 1, m = max_of(a, n);', '    while (m / exp > 0) {', '        counting_sort_by_digit(a, n, exp);   /* stable */', '        exp *= 10;', '    }}'];

  function radix(T) {
    var n = T.n;
    T.frame(-1, -1, 'Radix sort sorts numbers one digit at a time, least significant digit first, using a STABLE sort for each digit. After the last digit the whole array is sorted.', {});
    var exp = 1, maxv = Math.max.apply(null, T.vals);
    while (Math.floor(maxv / exp) > 0) {
      var e = exp;
      T.frame(2, 2, 'Pass on the ' + (exp === 1 ? 'ones' : 'tens') + ' digit. Sort stably by that digit only, ignoring the other digits.', { vars: { exp: exp } });
      placeStable(T, function (x) { return Math.floor(x / e) % 10; }, 3, 3, function (val, key, p) { return val + ': digit ' + key + ', so it goes to slot ' + p + '.'; }, { exp: e });
      T.frame(4, 4, 'End of the ' + (exp === 1 ? 'ones' : 'tens') + '-digit pass.' + (exp === 1 ? ' Values with the same ones digit kept their earlier order; that is why stability matters.' : ''), { vars: { exp: e } });
      exp *= 10;
    }
    T.frame(-1, -1, 'Sorted. Cost is O(d (n + b)) for d digits in base b: for fixed-width integers that is linear in n.', { sorted: T.range(0, n - 1) });
  }

  window.LESSON = {
    id: 'counting-radix',
    mode: 'algo',
    title: 'Counting and radix sort',
    lede:
      'Comparison sorts cannot beat O(n log n). Counting sort and radix sort avoid comparing at all by using the structure of the keys: small integers can be counted, and long integers can be sorted digit by digit. They run in linear time when the key range is bounded, which makes them useful for ages, grades, bytes, or fixed-width IDs. The price is extra memory and being limited to integer-like keys.',
    scenes: [
      { id: 'counting', title: 'Counting sort', blurb: 'Tally each value, turn the tallies into end positions, then place values right to left.', trap: 'The range k matters: sorting 10 numbers between 0 and 10^9 with counting sort needs a billion counters. Also iterate the input from right to left when placing; going left to right still sorts but loses stability, which breaks radix sort.', input: [3, 1, 4, 1, 5, 2, 0, 3], pyCode: PY_COUNT, cCode: C_COUNT, predict: { q: 'Counting sort on n values in the range 0..k has which time complexity?', options: ['O(n log n)', 'O(n + k)', 'O(n x k)'], answer: 1, why: 'One pass to count, one over the k counters for prefix sums, one pass to place.' }, run: counting },
      { id: 'radix', title: 'Radix sort (least significant digit first)', blurb: 'Two passes of a stable sort: first by the ones digit, then by the tens digit.', trap: 'The digit sort MUST be stable, or earlier passes are undone. Negative numbers need special handling (split by sign, or add an offset). Count digits with the maximum value.', input: [53, 12, 91, 35, 20, 17, 48, 61], pyCode: PY_RADIX, cCode: C_RADIX, predict: { q: 'Why must each digit pass of LSD radix sort be stable?', options: ['To save memory', 'So earlier digits stay ordered among equal later digits', 'So it runs in-place'], answer: 1, why: 'The tens pass must keep numbers with equal tens digits in the order the ones pass produced.' }, run: radix },
    ],
    builtins: [
      ['collections.Counter(xs)', 'Tally values in one line: the counting step.'],
      ['itertools.accumulate(counts)', 'Prefix sums of the counters.'],
      ['(x // 10**d) % 10', 'Extract digit d of an integer.'],
      ['sorted(xs, key=...)', 'Python sorts are stable, so a key sort per digit gives radix sort in a few lines.'],
      ['int count[K + 1] = {0};', 'In C, a zero-initialised counter array.'],
      ['memset(count, 0, sizeof count)', 'Reset counters between radix passes.'],
    ],
  };
})();
