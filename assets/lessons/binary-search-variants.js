/* Lesson: binary search beyond sorted arrays: rotated arrays and searching on the answer. */
(function () {
  var R = [26, 31, 35, 40, 44, 2, 8, 12, 17, 21];
  function outside(n, lo, hi) { var r = []; for (var i = 0; i < n; i++) if (i < lo || i > hi) r.push(i); return r; }

  function rotated(target) {
    return function (T) {
      var n = T.n, lo = 0, hi = n - 1;
      var a = function (i) { return T.v(i); };
      T.frame(-1, -1, 'A sorted array that was rotated: 26..44 then 2..21. It is not sorted, but it is two sorted pieces joined. We want ' + target + ' in O(log n).', { vars: { target: target } });
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        T.cmps++;
        T.frame(3, 3, 'mid = ' + mid + ', value ' + a(mid) + '.', { band: [lo, hi], dim: outside(n, lo, hi), ptr: { lo: lo, mid: mid, hi: hi }, cmp: [mid], vars: { target: target, lo: lo, mid: mid, hi: hi } });
        if (a(mid) === target) {
          T.frame(5, 4, 'Found ' + target + ' at index ' + mid + '.', { found: [mid], dim: outside(n, mid, mid), ptr: { mid: mid }, vars: { index: mid } });
          return;
        }
        if (a(lo) <= a(mid)) {
          var inLeft = a(lo) <= target && target < a(mid);
          T.frame(6, 5, 'a[lo] = ' + a(lo) + ' <= a[mid] = ' + a(mid) + ': the left half ' + lo + '..' + mid + ' is sorted (no wrap inside it). Is ' + target + ' in [' + a(lo) + ', ' + a(mid) + ')? ' + (inLeft ? 'Yes: go left.' : 'No: go right.'), { band: [lo, mid], dim: outside(n, lo, hi), mark: T.range(lo, mid), ptr: { lo: lo, mid: mid, hi: hi }, vars: { target: target } });
          if (inLeft) hi = mid - 1; else lo = mid + 1;
        } else {
          var inRight = a(mid) < target && target <= a(hi);
          T.frame(8, 8, 'a[lo] = ' + a(lo) + ' > a[mid] = ' + a(mid) + ': the wrap is in the left half, so the right half ' + mid + '..' + hi + ' is sorted. Is ' + target + ' in (' + a(mid) + ', ' + a(hi) + ']? ' + (inRight ? 'Yes: go right.' : 'No: go left.'), { band: [mid, hi], dim: outside(n, lo, hi), mark: T.range(mid, hi), ptr: { lo: lo, mid: mid, hi: hi }, vars: { target: target } });
          if (inRight) lo = mid + 1; else hi = mid - 1;
        }
      }
      T.frame(13, 13, 'Range empty: not found.', { vars: { result: -1 } });
    };
  }

  function answer(piles, H) {
    function hours(k) { return piles.reduce(function (s, p) { return s + Math.ceil(p / k); }, 0); }
    return function (T) {
      var n = T.n, lo = 1, hi = piles.reduce(function (a, b) { return Math.max(a, b); }, 0);
      T.frame(-1, -1, 'Piles of bananas ' + JSON.stringify(piles) + '; the guard returns in ' + H + ' hours. Find the SMALLEST eating speed k (bananas per hour, one pile per hour) that finishes in time. Each bar is a candidate speed.', { vars: { H: H } });
      while (lo < hi) {
        var mid = (lo + hi) >> 1;
        T.cmps++;
        var hrs = hours(mid), ok = hrs <= H;
        T.frame(5, 3, 'Try k = ' + mid + ': hours = ' + piles.map(function (p) { return 'ceil(' + p + '/' + mid + ')'; }).join(' + ') + ' = ' + hrs + (ok ? ' <= ' + H + ': fast enough.' : ' > ' + H + ': too slow.'), { band: [lo - 1, hi - 1], dim: outside(n, lo - 1, n - 1), sorted: T.range(hi, n - 1), cmp: [mid - 1], ptr: { lo: lo - 1, mid: mid - 1, hi: hi - 1 }, vars: { k: mid, hours: hrs, lo: lo, hi: hi } });
        if (ok) {
          T.frame(7, 4, 'k = ' + mid + ' is fast enough, so the smallest working speed is mid or something smaller: hi = mid (keep mid as a candidate).', { band: [lo - 1, hi - 1], dim: outside(n, lo - 1, n - 1), sorted: T.range(mid - 1, n - 1), ptr: { lo: lo - 1, mid: mid - 1 }, vars: { lo: lo, hi: mid } });
          hi = mid;
        } else {
          T.frame(9, 5, 'k = ' + mid + ' is too slow, and so is every smaller speed. lo = mid + 1.', { band: [lo - 1, hi - 1], dim: outside(n, mid, n - 1), sorted: T.range(hi, n - 1), ptr: { lo: lo - 1, mid: mid - 1 }, vars: { lo: mid + 1, hi: hi } });
          lo = mid + 1;
        }
      }
      T.frame(10, 7, 'lo == hi == ' + lo + ': the smallest speed that works. We tried only ' + T.cmps + ' of the ' + n + ' candidates.', { found: [lo - 1], sorted: T.range(lo, n - 1), dim: T.range(0, lo - 2), vars: { answer: lo } });
    };
  }

  window.LESSON = {
    id: 'binary-search-variants',
    mode: 'algo',
    title: 'Binary search beyond sorted arrays',
    lede:
      'Binary search works whenever you can ask a yes/no question that splits the candidates into two groups with a clean boundary: everything before the boundary says no, everything after says yes. A rotated sorted array still has sorted pieces you can reason about. And "find the smallest value that works" problems (speeds, capacities, deadlines) can search over the answer itself, using a feasibility check instead of an array. Recognising this pattern is a favourite interview skill.',
    scenes: [
      { id: 'rotated', title: 'Rotated sorted array', blurb: 'At every step one half is sorted. Test whether the target lies in that half, and keep or discard it.', trap: 'Comparing against the wrong end: you must first decide which half is sorted (a[lo] <= a[mid]), and use <= so a single-element half is handled. Duplicates break the O(log n) guarantee: when a[lo] == a[mid] == a[hi] you cannot tell which half is sorted and may have to shrink by one.', input: R, run: rotated(8),
        pyCode: ['def search_rotated(a, target):', '    lo, hi = 0, len(a) - 1', '    while lo <= hi:', '        mid = (lo + hi) // 2', '        if a[mid] == target:', '            return mid', '        if a[lo] <= a[mid]:            # left half sorted', '            if a[lo] <= target < a[mid]:', '                hi = mid - 1', '            else:', '                lo = mid + 1', '        else:                          # right half sorted', '            if a[mid] < target <= a[hi]:', '                lo = mid + 1', '            else:', '                hi = mid - 1', '    return -1'],
        cCode: ['int search_rotated(const int *a, int n, int t) {', '    int lo = 0, hi = n - 1;', '    while (lo <= hi) {', '        int mid = lo + (hi - lo) / 2;', '        if (a[mid] == t) return mid;', '        if (a[lo] <= a[mid]) {        /* left half sorted */', '            if (a[lo] <= t && t < a[mid]) hi = mid - 1;', '            else lo = mid + 1;', '        } else {                      /* right half sorted */', '            if (a[mid] < t && t <= a[hi]) lo = mid + 1;', '            else hi = mid - 1;', '        }', '    }', '    return -1;', '}'],
        predict: { q: 'In a rotated sorted array, how do you tell whether the left half [lo, mid] is sorted?', options: ['Check that a[lo] <= a[mid]', 'Check that a[mid] == a[hi]', 'You cannot tell without scanning'], answer: 0, why: 'If the rotation point were inside [lo, mid], the values would wrap down and a[lo] would exceed a[mid]. If a[lo] <= a[mid] the half has no wrap.' } },
      { id: 'answer', title: 'Search on the answer', blurb: 'Candidates are speeds 1 to 11. A speed that is fast enough makes all faster speeds fast enough too, so there is a clean boundary.', trap: 'Forgetting to prove monotonicity: binary search on the answer requires "if k works then every larger k works". Also choose the bounds carefully (lo = smallest possible answer, hi = a value that surely works) and use the lo < hi, hi = mid form so you converge on the minimum.', input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], keys: { sorted: 'Speed works', found: 'Smallest that works', dim: 'Too slow' }, run: answer([3, 6, 7, 11], 8),
        pyCode: ['def min_speed(piles, h):', '    def hours(k):', '        return sum((p + k - 1) // k for p in piles)', '    lo, hi = 1, max(piles)', '    while lo < hi:', '        mid = (lo + hi) // 2', '        if hours(mid) <= h:', '            hi = mid          # works: try slower', '        else:', '            lo = mid + 1      # too slow: need faster', '    return lo'],
        cCode: ['int min_speed(const int *p, int n, int h) {', '    int lo = 1, hi = max_of(p, n);', '    while (lo < hi) {', '        int mid = lo + (hi - lo) / 2;', '        if (hours(p, n, mid) <= h) hi = mid;', '        else lo = mid + 1;', '    }', '    return lo;', '}'],
        predict: { q: 'Why can we binary search over the eating speed?', options: ['The piles are sorted', 'If speed k finishes in time, every faster speed also does: a clean yes/no boundary', 'Speeds are small integers'], answer: 1, why: 'Binary search only needs a monotone predicate over the candidates. Faster never hurts, so the feasible speeds form a suffix.' } },
    ],
    builtins: [
      ['bisect.bisect_left(range(lo, hi), x, key=pred)', 'Search over a virtual range with a key (3.10+); handy for "first index where predicate is true".'],
      ['math.ceil(a / b), -(-a // b), (a + b - 1) // b', 'Integer ceiling division without floats.'],
      ['max(piles), sum(...)', 'Typical bounds and feasibility checks.'],
      ['while lo < hi: ... hi = mid', 'Template for the minimum value where predicate is true.'],
      ['while lo < hi: mid = (lo + hi + 1) // 2', 'Template for the maximum value where predicate is true (round up!).'],
    ],
  };
})();
