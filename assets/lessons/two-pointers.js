/* Lesson: two pointers, animated. Opposite ends on sorted data, and a read/write pair for in-place compaction. */
(function () {
  function pairSum(target) {
    return function (T) {
      var n = T.n, left = 0, right = n - 1;
      var a = function (i) { return T.v(i); };
      T.frame(-1, -1, 'A sorted array. Find two values that add up to ' + target + '. Checking every pair is O(n^2); with two pointers, one from each end, it is O(n).', { vars: { target: target } });
      T.frame(1, 1, 'Start with the smallest value on the left and the largest on the right.', { ptr: { left: left, right: right }, mark: [left, right], vars: { target: target } });
      while (left < right) {
        var s = a(left) + a(right);
        T.cmps++;
        T.frame(3, 3, a(left) + ' + ' + a(right) + ' = ' + s + (s === target ? ': exactly the target.' : s < target ? ' < ' + target + ': the sum is too small.' : ' > ' + target + ': the sum is too big.'), { cmp: [left, right], dim: T.range(0, left - 1).concat(T.range(right + 1, n - 1)), ptr: { left: left, right: right }, vars: { sum: s, target: target } });
        if (s === target) {
          T.frame(5, 4, 'Found: ' + a(left) + ' + ' + a(right) + ' = ' + target + ' at indexes ' + left + ' and ' + right + '. ' + T.cmps + ' sums checked instead of up to ' + (n * (n - 1) / 2) + '.', { found: [left, right], dim: T.range(0, left - 1).concat(T.range(left + 1, right - 1), T.range(right + 1, n - 1)), ptr: { left: left, right: right }, vars: { left: left, right: right } });
          return;
        }
        if (s < target) {
          T.frame(7, 5, 'Too small: ' + a(left) + ' cannot work with ANY remaining value, because the largest partner ' + a(right) + ' is already too small. Discard it and move left up.', { swp: [left], dim: T.range(0, left - 1).concat(T.range(right + 1, n - 1)), ptr: { left: left, right: right }, vars: { sum: s } });
          left++;
        } else {
          T.frame(9, 6, 'Too big: ' + a(right) + ' cannot work with ANY remaining value, because even the smallest partner ' + a(left) + ' overshoots. Discard it and move right down.', { swp: [right], dim: T.range(0, left - 1).concat(T.range(right + 1, n - 1)), ptr: { left: left, right: right }, vars: { sum: s } });
          right--;
        }
      }
      T.frame(10, 8, 'The pointers met without finding a pair: return None.', { vars: { result: 'None' } });
    };
  }

  function moveZeroes(T) {
    var n = T.n, w = 0;
    var a = function (i) { return T.v(i); };
    T.frame(-1, -1, 'Move all zeros to the end, keeping the other values in order, in place. A read pointer r scans every element; a write pointer w marks where the next non-zero belongs.', {});
    for (var r = 0; r < n; r++) {
      T.cmps++;
      var nz = a(r) !== 0;
      T.frame(3, 3, 'r looks at ' + a(r) + (nz ? ': non-zero, it belongs at w.' : ': a zero, skip it (w stays).'), { cmp: [r], sorted: T.range(0, w - 1), ptr: { w: w, r: r }, vars: { r: r, w: w } });
      if (nz) {
        if (w !== r) {
          T.swap(w, r); T.swaps++;
          T.frame(4, 4, 'Swap the non-zero value into position w. The zero it replaced moves to r.', { swp: [w, r], sorted: T.range(0, w - 1), ptr: { w: w, r: r }, vars: { r: r, w: w } });
        }
        w++;
        T.frame(5, 5, 'w moves forward: positions 0 to ' + (w - 1) + ' now hold the non-zero values seen so far, in order.', { sorted: T.range(0, w - 1), ptr: { w: w < n ? w : n - 1, r: r }, vars: { r: r, w: w } });
      }
    }
    T.frame(-1, -1, 'Done in one pass: O(n) time, O(1) extra space, ' + T.swaps + ' swaps. The write pointer lags behind the read pointer and only ever moves forward.', { sorted: T.range(0, w - 1), vars: { w: w } });
  }

  window.LESSON = {
    id: 'two-pointers',
    mode: 'algo',
    title: 'Two pointers',
    lede:
      'Many array problems that look quadratic collapse to a single pass if you keep two indexes and move them with a rule. There are two common shapes. Opposite ends: on sorted data, one pointer starts at each end and they walk towards each other, each step discarding a value that provably cannot be part of the answer. Same direction: a fast read pointer scans while a slow write pointer builds the result in place. In C this is the pointer arithmetic you already know.',
    scenes: [
      { id: 'pair-sum', title: 'Opposite ends: pair sum', blurb: 'On sorted data, move left up if the sum is too small and right down if it is too big. Faded bars are ruled out.', trap: 'Using it on unsorted data (the argument that lets you discard a value depends on order), or moving the wrong pointer. For an unsorted array use a hash set instead: O(n) time, O(n) space. Also stop at left < right so an element is never paired with itself.', input: [1, 3, 4, 6, 8, 10, 13, 15], keys: { swp: 'Discarded now', dim: 'Already discarded', mark: 'In focus' }, run: pairSum(17),
        pyCode: ['def pair_sum(a, target):', '    left, right = 0, len(a) - 1', '    while left < right:', '        s = a[left] + a[right]', '        if s == target:', '            return left, right', '        if s < target:', '            left += 1', '        else:', '            right -= 1', '    return None'],
        cCode: ['int pair_sum(const int *a, int n, int target, int *l, int *r) {', '    int left = 0, right = n - 1;', '    while (left < right) {', '        int s = a[left] + a[right];', '        if (s == target) { *l = left; *r = right; return 1; }', '        if (s < target) left++;', '        else right--;', '    }', '    return 0;', '}'],
        predict: { q: 'In the sorted pair-sum search, the sum is too small. Which pointer moves, and why is that safe?', options: ['right moves down: the largest value is useless', 'left moves up: the current left value cannot pair with anything, because even the largest partner is too small', 'Either one, it does not matter'], answer: 1, why: 'The left value plus the largest remaining value is still below the target, so it cannot be completed by any other remaining value. It is safe to discard.' } },
      { id: 'compact', title: 'Same direction: read and write', blurb: 'A fast read pointer scans; a slow write pointer marks where the next kept value goes.', trap: 'Moving w on every step (then it is just r) or forgetting that w <= r always. Avoid extra passes or extra arrays: the pattern gives O(n) time and O(1) space. The same shape solves remove duplicates, remove element and partition problems.', input: [0, 1, 0, 3, 12, 0, 5, 7], run: moveZeroes,
        pyCode: ['def move_zeroes(a):', '    w = 0', '    for r in range(len(a)):', '        if a[r] != 0:', '            a[w], a[r] = a[r], a[w]', '            w += 1'],
        cCode: ['void move_zeroes(int *a, int n) {', '    int w = 0;', '    for (int r = 0; r < n; r++)', '        if (a[r] != 0) {', '            int t = a[w]; a[w] = a[r]; a[r] = t;', '            w++;', '        }', '}'],
        predict: { q: 'What is the extra space used by the read/write two-pointer solution?', options: ['O(n)', 'O(1)', 'O(log n)'], answer: 1, why: 'It rearranges the array in place using two integer indexes.' } },
    ],
    builtins: [
      ['a[i], a[j] = a[j], a[i]', 'Swap in one statement, no temporary.'],
      ['for r, x in enumerate(a)', 'Read pointer with index and value together.'],
      ['reversed(a), a[::-1]', 'Walk from the other end (the slice makes a copy).'],
      ['collections.deque', 'O(1) operations at both ends when you need to pop from either side.'],
      ['sorted(a)', 'Two pointers on opposite ends usually needs sorted input; sorting costs O(n log n).'],
      ['set(a), dict', 'Hash alternative for unsorted pair problems: O(n) time, O(n) space.'],
    ],
  };
})();
