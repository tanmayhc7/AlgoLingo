/* Lesson: sliding window, animated. The shaded band is the window; it slides or grows and shrinks. */
(function () {
  function fixed(k) {
    return function (T) {
      var n = T.n, a = function (i) { return T.v(i); };
      T.frame(-1, -1, 'Find the largest sum of ' + k + ' consecutive values. Recomputing each sum from scratch is O(n k); sliding the window and updating the sum is O(n).', { vars: { k: k } });
      var window_ = 0;
      for (var i = 0; i < k; i++) window_ += a(i);
      var best = window_, bestAt = 0;
      T.frame(1, 2, 'Add up the first window (positions 0 to ' + (k - 1) + '): ' + window_ + '. That is the best so far.', { band: [0, k - 1], mark: T.range(0, k - 1), vars: { window: window_, best: best } });
      for (i = k; i < n; i++) {
        var out = a(i - k), inn = a(i);
        T.frame(4, 5, 'Slide right by one: add the new value ' + inn + ' and subtract the one that left, ' + out + '. No need to re-add the middle values.', { band: [i - k + 1, i], mark: T.range(i - k + 1, i), cmp: [i], dim: [i - k], ptr: { in: i, out: i - k }, vars: { window: window_ + inn - out, best: best } });
        window_ += inn - out;
        T.cmps++;
        var better = window_ > best;
        if (better) { best = window_; bestAt = i - k + 1; }
        T.frame(5, 6, 'Window sum ' + window_ + (better ? ' beats the old best: new best ' + best + '.' : ' does not beat the best ' + best + '.'), { band: [i - k + 1, i], mark: T.range(i - k + 1, i), found: better ? T.range(i - k + 1, i) : [], vars: { window: window_, best: best } });
      }
      T.frame(6, 8, 'The best window is positions ' + bestAt + ' to ' + (bestAt + k - 1) + ' with sum ' + best + '. One pass, O(n) time, O(1) space.', { band: [bestAt, bestAt + k - 1], found: T.range(bestAt, bestAt + k - 1), dim: T.range(0, bestAt - 1).concat(T.range(bestAt + k, n - 1)), vars: { best: best } });
    };
  }

  function variable(target) {
    return function (T) {
      var n = T.n, a = function (i) { return T.v(i); };
      var left = 0, total = 0, best = n + 1, bl = 0, br = 0;
      T.frame(-1, -1, 'All values are positive. Find the shortest run of consecutive values with sum at least ' + target + '. The window grows on the right and shrinks on the left, and each pointer only moves forward.', { vars: { target: target } });
      for (var right = 0; right < n; right++) {
        total += a(right);
        T.frame(4, 3, 'Grow: take in ' + a(right) + ' on the right. The window sum is ' + total + (total >= target ? ', which reaches ' + target + '.' : ', still below ' + target + '.'), { band: [left, right], mark: T.range(left, right), cmp: [right], ptr: { left: left, right: right }, vars: { total: total, best: best > n ? '-' : best } });
        while (total >= target) {
          T.cmps++;
          var len = right - left + 1;
          if (len < best) { best = len; bl = left; br = right; }
          T.frame(6, 5, 'The window is long enough (length ' + len + '). Record it if it is the shortest: best = ' + best + '.', { band: [left, right], found: T.range(left, right), ptr: { left: left, right: right }, vars: { total: total, best: best } });
          total -= a(left);
          left++;
          T.frame(7, 6, 'Shrink: drop ' + a(left - 1) + ' from the left. The sum falls to ' + total + (total >= target ? ' and is still enough, so keep shrinking.' : ': too small now, so grow again.'), { band: left <= right ? [left, right] : null, mark: T.range(left, right), dim: [left - 1], swp: [left - 1], ptr: { left: Math.min(left, n - 1), right: right }, vars: { total: total, best: best } });
        }
      }
      T.frame(9, 9, best > n ? 'No window reaches the target: return 0.' : 'The shortest window has length ' + best + ' (positions ' + bl + ' to ' + br + '). Each element entered and left the window at most once: O(n) even though there is a loop inside a loop.', { band: [bl, br], found: T.range(bl, br), dim: T.range(0, bl - 1).concat(T.range(br + 1, n - 1)), vars: { best: best } });
    };
  }

  window.LESSON = {
    id: 'sliding-window',
    mode: 'algo',
    title: 'Sliding window',
    lede:
      'A window is a contiguous range of an array, tracked by two indexes. Instead of recomputing the answer for every range (O(n^2) or worse), you slide the window along and update the answer incrementally: add the value that enters, remove the one that leaves. A fixed-size window just slides; a variable window grows until a condition holds and then shrinks while it still holds. It is the standard tool for subarray and substring questions, in Python or C.',
    scenes: [
      { id: 'fixed', title: 'Fixed-size window', blurb: 'Slide by one: add the entering value and subtract the leaving one. Maximum sum of k consecutive values.', trap: 'Recomputing sum(a[i:i+k]) in every step: that is O(n k) and the whole point is lost. Also check k > n and k <= 0 before starting, and watch the first window: initialise it before the loop starts sliding.', input: [2, 1, 5, 1, 3, 2, 9, 4], keys: { cmp: 'Entering', found: 'Best so far', mark: 'In window', dim: 'Leaving' }, run: fixed(3),
        pyCode: ['def max_window_sum(a, k):', '    window = sum(a[:k])', '    best = window', '    for i in range(k, len(a)):', '        window += a[i] - a[i - k]', '        best = max(best, window)', '    return best'],
        cCode: ['int max_window_sum(const int *a, int n, int k) {', '    int window = 0;', '    for (int i = 0; i < k; i++) window += a[i];', '    int best = window;', '    for (int i = k; i < n; i++) {', '        window += a[i] - a[i - k];', '        if (window > best) best = window;', '    }', '    return best;', '}'],
        predict: { q: 'Using the sliding update, how much work is done per step as the window moves right by one?', options: ['O(k): add up the whole window again', 'O(1): add the entering value, subtract the leaving one', 'O(n)'], answer: 1, why: 'Only two values change between neighbouring windows, so a constant amount of work updates the sum.' } },
      { id: 'variable', title: 'Variable-size window', blurb: 'Grow on the right until the sum is enough, then shrink from the left while it stays enough.', trap: 'It relies on all values being positive: then growing only increases the sum and shrinking only decreases it. With negative numbers the logic breaks (use prefix sums and a hash map or a deque instead). Also: the inner while loop does not make it O(n^2), because each element is added once and removed once.', input: [2, 3, 1, 2, 4, 3], keys: { swp: 'Leaving', found: 'Valid window', mark: 'In window', dim: 'Left the window' }, run: variable(7),
        pyCode: ['def min_subarray_len(target, a):', '    left = total = 0', '    best = len(a) + 1', '    for right in range(len(a)):', '        total += a[right]', '        while total >= target:', '            best = min(best, right - left + 1)', '            total -= a[left]', '            left += 1', '    return best if best <= len(a) else 0'],
        cCode: ['int min_subarray_len(int target, const int *a, int n) {', '    int left = 0, total = 0, best = n + 1;', '    for (int right = 0; right < n; right++) {', '        total += a[right];', '        while (total >= target) {', '            if (right - left + 1 < best) best = right - left + 1;', '            total -= a[left++];', '        }', '    }', '    return best <= n ? best : 0;', '}'],
        predict: { q: 'The variable window has a while loop inside the for loop. What is the total time complexity?', options: ['O(n^2)', 'O(n): each index is added once and removed once', 'O(n log n)'], answer: 1, why: 'Both pointers only move forward, so across the whole run there are at most n additions and n removals.' } },
    ],
    builtins: [
      ['sum(a[i:i+k])', 'Recomputes the window: O(k) each time. Use only for the first window.'],
      ['itertools.accumulate(a)', 'Prefix sums: window sum = prefix[j] - prefix[i].'],
      ['collections.deque(maxlen=k)', 'A fixed-size window that drops the oldest item automatically.'],
      ['collections.Counter', 'Track counts inside a window (anagrams, distinct characters).'],
      ['min(best, right - left + 1)', 'Update the answer with the current window length.'],
      ['float("inf"), len(a) + 1', 'Sentinel for "no window found yet".'],
    ],
  };
})();
