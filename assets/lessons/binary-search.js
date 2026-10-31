/* Lesson: binary search on a sorted array, animated. The band is the range that could still hold the answer. */
(function () {
  var A = [3, 8, 12, 17, 21, 26, 31, 35, 40, 44, 49, 53, 58, 62, 67];
  var D = [2, 4, 4, 4, 4, 7, 9, 9, 12, 15, 15, 18];

  function outside(n, lo, hi, extra) {
    var r = [];
    for (var i = 0; i < n; i++) if (i < lo || i > hi) r.push(i);
    return r.concat(extra || []);
  }

  function classic(target, where) {
    return function (T) {
      var n = T.n, lo = 0, hi = n - 1;
      T.frame(-1, -1, 'A sorted array of ' + n + ' values. We look for ' + target + ' by halving the search range each step instead of scanning from the left.', { vars: { target: target } });
      T.frame(1, 1, 'The range that could hold the answer is the whole array: lo = 0, hi = ' + (n - 1) + '.', { band: [lo, hi], ptr: { lo: lo, hi: hi }, vars: { target: target, lo: lo, hi: hi } });
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        T.cmps++;
        var m = T.v(mid);
        T.frame(3, 3, 'Look at the middle: mid = (' + lo + ' + ' + hi + ') // 2 = ' + mid + ', value ' + m + '.', { band: [lo, hi], dim: outside(n, lo, hi), ptr: { lo: lo, mid: mid, hi: hi }, cmp: [mid], vars: { target: target, lo: lo, mid: mid, hi: hi } });
        if (m === target) {
          T.frame(5, 4, m + ' equals the target ' + target + '. Found at index ' + mid + ' after ' + T.cmps + ' comparisons (a linear scan could need ' + n + ').', { found: [mid], dim: outside(n, mid, mid), ptr: { mid: mid }, vars: { index: mid } });
          return;
        }
        if (m < target) {
          T.frame(7, 5, m + ' < ' + target + ': the target must be to the right. Everything up to and including mid is ruled out.', { band: [lo, hi], dim: outside(n, mid + 1, hi), ptr: { lo: lo, mid: mid, hi: hi }, vars: { target: target } });
          lo = mid + 1;
        } else {
          T.frame(9, 6, m + ' > ' + target + ': the target must be to the left. Everything from mid onward is ruled out.', { band: [lo, hi], dim: outside(n, lo, mid - 1), ptr: { lo: lo, mid: mid, hi: hi }, vars: { target: target } });
          hi = mid - 1;
        }
      }
      T.frame(10, 8, 'lo (' + lo + ') has passed hi (' + hi + '): the range is empty, so ' + target + ' is not in the array. Return -1. Only ' + T.cmps + ' comparisons were needed.', { dim: outside(n, 0, -1), vars: { lo: lo, hi: hi, result: -1 } });
    };
  }

  function lower(x) {
    return function (T) {
      var n = T.n, lo = 0, hi = n;
      function ptrs(extra) { var p = { lo: lo }; if (hi < n) p.hi = hi; for (var k in extra) p[k] = extra[k]; return p; }
      T.frame(-1, -1, 'The array has duplicates. We want the FIRST index whose value is >= ' + x + ' (the lower bound). That also tells us the first occurrence of ' + x + ' and where to insert it.', { vars: { x: x } });
      T.frame(1, 1, 'Use a half-open range [lo, hi): lo = 0, hi = n = ' + n + '. The answer can be any index from 0 to n.', { band: [lo, n - 1], ptr: ptrs(), vars: { x: x, lo: lo, hi: hi } });
      while (lo < hi) {
        var mid = (lo + hi) >> 1;
        T.cmps++;
        var m = T.v(mid), small = m < x;
        T.frame(3, 3, 'mid = ' + mid + ', value ' + m + '. Is ' + m + ' < ' + x + '? ' + (small ? 'Yes: the first >= ' + x + ' is to the right of mid.' : 'No: mid could be the answer, so keep it and look left.'), { band: [lo, hi - 1], dim: outside(n, lo, hi - 1), ptr: ptrs({ mid: mid }), cmp: [mid], vars: { x: x, lo: lo, mid: mid, hi: hi } });
        if (small) {
          T.frame(5, 4, 'lo = mid + 1 = ' + (mid + 1) + '. Equal values are never skipped, only strictly smaller ones.', { band: [lo, hi - 1], dim: outside(n, mid + 1, hi - 1), ptr: ptrs({ mid: mid }), vars: { x: x } });
          lo = mid + 1;
        } else {
          T.frame(7, 5, 'hi = mid = ' + mid + ' (mid stays a candidate, because it might be the very first one).', { band: [lo, hi - 1], dim: outside(n, lo, mid - 1), ptr: ptrs({ mid: mid }), vars: { x: x } });
          hi = mid;
        }
      }
      T.frame(8, 7, 'lo == hi == ' + lo + ': the first index with a value >= ' + x + '. ' + (lo < n && T.v(lo) === x ? 'It holds ' + x + ', so this is its first occurrence.' : x + ' is not present; this is where it would be inserted.'), { found: lo < n && T.v(lo) === x ? [lo] : [], dim: outside(n, lo, lo), ptr: { lo: lo }, vars: { result: lo } });
    };
  }

  var BS_PY = ['def binary_search(a, target):', '    lo, hi = 0, len(a) - 1', '    while lo <= hi:', '        mid = (lo + hi) // 2', '        if a[mid] == target:', '            return mid', '        if a[mid] < target:', '            lo = mid + 1', '        else:', '            hi = mid - 1', '    return -1'];
  var BS_C = ['int binary_search(const int *a, int n, int target) {', '    int lo = 0, hi = n - 1;', '    while (lo <= hi) {', '        int mid = lo + (hi - lo) / 2;', '        if (a[mid] == target) return mid;', '        if (a[mid] < target) lo = mid + 1;', '        else hi = mid - 1;', '    }', '    return -1;', '}'];

  window.LESSON = {
    id: 'binary-search',
    mode: 'algo',
    title: 'Binary search',
    lede:
      'If the data is sorted you never need to look at everything. Check the middle: it tells you which half cannot contain the answer, so you throw that half away. The search range halves each step, giving O(log n): a billion items take about thirty comparisons. The algorithm is simple and famously easy to get wrong, so the details matter: the loop condition, whether hi is inclusive, how you move lo and hi, and how you avoid overflow. The shaded band is the range still in play; faded bars are ruled out.',
    scenes: [
      { id: 'found', title: 'Finding a value', blurb: 'Compare with the middle; discard the half that cannot contain the target.', trap: 'Off-by-one errors: lo = mid (instead of mid + 1) or hi = mid (with an inclusive hi) can loop forever. Also (lo + hi) / 2 can overflow a C int for huge arrays; use lo + (hi - lo) / 2. And the input must be sorted: binary search on unsorted data silently returns wrong answers.', input: A, run: classic(44), pyCode: BS_PY, cCode: BS_C,
        predict: { q: 'A sorted array has 1,000,000 elements. About how many comparisons does binary search need in the worst case?', options: ['About 20', 'About 1,000', 'About 500,000'], answer: 0, why: 'Each step halves the range: log2(1,000,000) is about 20.' } },
      { id: 'missing', title: 'When it is not there', blurb: 'The range shrinks until lo passes hi. That is how you know the value is absent.', trap: 'Returning the wrong thing for "not found". Decide the convention up front: -1, None, or the insertion point (bisect_left). Interviewers often follow up with "where would it be inserted?", which is exactly where lo ends.', input: A, run: classic(33), pyCode: BS_PY, cCode: BS_C,
        predict: { q: 'When the loop <code>while lo <= hi</code> ends without finding the target, what is true?', options: ['lo > hi: the range is empty', 'lo == hi: one element is left', 'The array was not sorted'], answer: 0, why: 'The loop continues while the range [lo, hi] is non-empty. It stops when lo has moved past hi, so no candidates remain.' } },
      { id: 'lower', title: 'First occurrence (lower bound)', blurb: 'With duplicates, find the first index whose value is at least x. Never skip equal values.', trap: 'Stopping at the first equal value you meet: with duplicates that could be any of them. Use the lower-bound form: move lo past values strictly less than x and keep mid as a candidate otherwise (hi = mid). It uses a half-open range [lo, hi).', input: D, run: lower(4), pyCode: ['def lower_bound(a, x):', '    lo, hi = 0, len(a)', '    while lo < hi:', '        mid = (lo + hi) // 2', '        if a[mid] < x:', '            lo = mid + 1', '        else:', '            hi = mid', '    return lo   # first index with a[i] >= x'], cCode: ['int lower_bound(const int *a, int n, int x) {', '    int lo = 0, hi = n;', '    while (lo < hi) {', '        int mid = lo + (hi - lo) / 2;', '        if (a[mid] < x) lo = mid + 1;', '        else hi = mid;', '    }', '    return lo;', '}'],
        predict: { q: 'In the lower-bound version, why is it <code>hi = mid</code> and not <code>hi = mid - 1</code>?', options: ['mid might be the first occurrence, so it must stay a candidate', 'It is a typo that still works', 'To avoid overflow'], answer: 0, why: 'When a[mid] >= x, mid could be the very first such index. Excluding it could skip the answer, so the range keeps mid.' } },
    ],
    builtins: [
      ['bisect.bisect_left(a, x)', 'Lower bound: first index with a[i] >= x (the insertion point before equals).'],
      ['bisect.bisect_right(a, x)', 'Upper bound: first index with a[i] > x (the insertion point after equals).'],
      ['bisect.insort(a, x)', 'Insert while keeping a sorted. The search is O(log n) but the insert shifts O(n).'],
      ['bisect(a, x, key=f)', 'Search by a key function (Python 3.10+).'],
      ['bsearch(key, base, n, size, cmp)', 'C standard library binary search with a comparator.'],
      ['x in sorted_set / dict', 'Hash lookup is O(1) average; binary search shines for order queries and sorted arrays.'],
    ],
  };
})();
