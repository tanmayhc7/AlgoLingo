/* Lesson: O(n log n) sorts, animated. Merge sort rearranges bars through the merge; quicksort partitions around a pivot. */
(function () {
  var IN = [6, 3, 8, 2, 7, 1, 5, 4];
  var SORTED = [1, 2, 3, 4, 5, 6, 7, 8];

  function merge(T) {
    var n = T.n;
    var fin = [];
    function val(id) { return T.vals[id]; }
    T.frame(-1, -1, 'Merge sort splits the list in half, sorts each half, then merges two sorted halves. The shaded band is the part being worked on.', {});
    function ms(lo, hi) {
      if (hi <= lo) return;
      var mid = (lo + hi) >> 1;
      T.frame(3, 2, 'Split positions ' + lo + '..' + hi + ' at the middle (' + mid + ').', { band: [lo, hi], ptr: { mid: mid }, vars: { lo: lo, hi: hi } });
      ms(lo, mid);
      ms(mid + 1, hi);
      var L = T.order.slice(lo, mid + 1), R = T.order.slice(mid + 1, hi + 1), out = [];
      function arrange() {
        var arr = out.concat(L, R);
        for (var k = 0; k < arr.length; k++) T.order[lo + k] = arr[k];
      }
      T.frame(6, 5, 'Both halves are sorted. Merge them: repeatedly take the smaller of the two front values.', { band: [lo, hi], vars: { lo: lo, hi: hi } });
      while (L.length && R.length) {
        var pl = lo + out.length, pr = lo + out.length + L.length;
        T.cmps++;
        var takeL = val(L[0]) <= val(R[0]);
        T.frame(11, 7, 'Compare the fronts ' + val(L[0]) + ' (left) and ' + val(R[0]) + ' (right): take the ' + (takeL ? 'left' : 'right') + ' one.', { band: [lo, hi], cmp: [pl, pr], mark: T.range(lo, lo + out.length - 1), vars: { out: out.length } });
        out.push(takeL ? L.shift() : R.shift());
        T.swaps++;
        arrange();
        T.frame(takeL ? 12 : 14, 7, 'Place ' + val(out[out.length - 1]) + ' next in the merged output.', { band: [lo, hi], swp: [lo + out.length - 1], mark: T.range(lo, lo + out.length - 2), vars: { out: out.length } });
      }
      var rest = L.length + R.length;
      if (rest) {
        out = out.concat(L, R); L = []; R = [];
        T.swaps += rest;
        arrange();
        T.frame(15, 8, 'One side is empty: the rest of the other side is already sorted, so copy it over.', { band: [lo, hi], mark: T.range(lo, hi) });
      }
      T.frame(15, 10, 'Positions ' + lo + '..' + hi + ' are now sorted.', { band: [lo, hi], sorted: hi - lo + 1 === n ? T.range(lo, hi) : [], mark: hi - lo + 1 === n ? [] : T.range(lo, hi) });
    }
    ms(0, n - 1);
    T.frame(-1, -1, 'Sorted with ' + T.cmps + ' comparisons. Every level of the recursion does at most n comparisons and there are log2(n) levels: O(n log n), always.', { sorted: T.range(0, n - 1) });
  }

  function quick(T, worst) {
    var n = T.n;
    var fin = [];
    function a(i) { return T.v(i); }
    T.frame(-1, -1, worst ? 'The same quicksort, but the input is already sorted and the pivot is always the last element. Watch how unbalanced the splits are.' : 'Quicksort picks a pivot, moves smaller values to its left and larger to its right, then sorts each side recursively.', {});
    function qs(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) { fin.push(lo); T.frame(1, 1, 'A range of one element is already sorted.', { sorted: fin.slice() }); return; }
      var i = lo;
      T.frame(8, 7, 'Sort positions ' + lo + '..' + hi + '. The pivot is the last value, ' + a(hi) + '.', { band: [lo, hi], pivot: hi, sorted: fin.slice(), ptr: { i: lo }, vars: { lo: lo, hi: hi, pivot: a(hi) } });
      for (var j = lo; j < hi; j++) {
        T.cmps++;
        var less = a(j) < a(hi);
        T.frame(11, 9, 'Is ' + a(j) + ' smaller than the pivot ' + a(hi) + '? ' + (less ? 'Yes: it belongs on the left side.' : 'No: leave it on the right side.'), { band: [lo, hi], pivot: hi, cmp: [j], sorted: fin.slice(), ptr: { i: i, j: j }, vars: { i: i, j: j } });
        if (less) {
          if (i !== j) {
            T.swap(i, j); T.swaps++;
            T.frame(12, 9, 'Swap it into the left region (position ' + i + ').', { band: [lo, hi], pivot: hi, swp: [i, j], sorted: fin.slice(), ptr: { i: i, j: j }, vars: { i: i, j: j } });
          }
          i++;
        }
      }
      if (i !== hi) { T.swap(i, hi); T.swaps++; }
      fin.push(i);
      T.frame(14, 10, 'Put the pivot ' + a(i) + ' between the two regions, position ' + i + '. It is now in its final place.', { band: [lo, hi], swp: i !== hi ? [i, hi] : [], sorted: fin.slice(), ptr: { p: i }, vars: { p: i } });
      qs(lo, i - 1);
      qs(i + 1, hi);
    }
    qs(0, n - 1);
    T.frame(-1, -1, worst ? 'Sorted, but with ' + T.cmps + ' comparisons: the splits were 7 + 0, 6 + 0, and so on, so the recursion went n levels deep. That is the O(n^2) worst case (and O(n) stack depth).' : 'Sorted with ' + T.cmps + ' comparisons. A good pivot halves the range each time, giving O(n log n) on average.', { sorted: T.range(0, n - 1) });
  }

  var MERGE_PY = ['def merge_sort(a):', '    if len(a) <= 1:', '        return a', '    mid = len(a) // 2', '    left = merge_sort(a[:mid])', '    right = merge_sort(a[mid:])', '    return merge(left, right)', '', 'def merge(left, right):', '    out, i, j = [], 0, 0', '    while i < len(left) and j < len(right):', '        if left[i] <= right[j]:', '            out.append(left[i]); i += 1', '        else:', '            out.append(right[j]); j += 1', '    return out + left[i:] + right[j:]'];
  var MERGE_C = ['void merge_sort(int *a, int *tmp, int lo, int hi) {', '    if (hi - lo < 1) return;', '    int mid = (lo + hi) / 2;', '    merge_sort(a, tmp, lo, mid);', '    merge_sort(a, tmp, mid + 1, hi);', '    int i = lo, j = mid + 1, k = lo;', '    while (i <= mid && j <= hi)', '        tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];', '    while (i <= mid) tmp[k++] = a[i++];', '    while (j <= hi) tmp[k++] = a[j++];', '    memcpy(a + lo, tmp + lo, (hi - lo + 1) * sizeof *a);', '}'];
  var QS_PY = ['def quick_sort(a, lo, hi):', '    if lo >= hi:', '        return', '    p = partition(a, lo, hi)', '    quick_sort(a, lo, p - 1)', '    quick_sort(a, p + 1, hi)', '', 'def partition(a, lo, hi):', '    pivot = a[hi]', '    i = lo', '    for j in range(lo, hi):', '        if a[j] < pivot:', '            a[i], a[j] = a[j], a[i]', '            i += 1', '    a[i], a[hi] = a[hi], a[i]', '    return i'];
  var QS_C = ['void quick_sort(int *a, int lo, int hi) {', '    if (lo >= hi) return;', '    int p = partition(a, lo, hi);', '    quick_sort(a, lo, p - 1);', '    quick_sort(a, p + 1, hi);', '}', 'int partition(int *a, int lo, int hi) {', '    int pivot = a[hi], i = lo;', '    for (int j = lo; j < hi; j++)', '        if (a[j] < pivot) { swap(&a[i], &a[j]); i++; }', '    swap(&a[i], &a[hi]);', '    return i;', '}'];

  window.LESSON = {
    id: 'sorting-fast',
    mode: 'algo',
    title: 'Fast sorts: merge sort and quicksort',
    lede:
      'To beat O(n^2) you split the problem. Merge sort splits by position and does the work when merging; quicksort does the work first by partitioning around a pivot and then splits by value. Both are divide and conquer with O(n log n) typical cost. The differences are what interviewers care about: merge sort is stable and always O(n log n) but needs extra space; quicksort is in place and usually faster in practice but has an O(n^2) worst case. Scrub back and forth to see the recursion.',
    scenes: [
      { id: 'merge', title: 'Merge sort', blurb: 'Split in half, sort each half, merge. The band marks the range being merged; watch values slide into the output.', trap: 'Slicing in Python (a[:mid]) copies, so the code above uses O(n log n) total extra memory; a careful version passes indexes and uses one temporary array of size n. Also: use <= when comparing fronts, so equal values keep their order (stability).', input: IN, run: merge, pyCode: MERGE_PY, cCode: MERGE_C,
        predict: { q: 'Merge sort splits n items in half repeatedly. How many levels of splitting are there?', options: ['About n', 'About log2(n)', 'About 2'], answer: 1, why: 'Halving n items each level takes log2(n) levels to reach single items. Each level merges n items in total, so the cost is n log2(n).' } },
      { id: 'quick', title: 'Quicksort', blurb: 'Pick a pivot, partition, recurse on both sides. Green values are in their final place.', trap: 'Choosing the first or last element as pivot on sorted or reversed input gives O(n^2) time and O(n) recursion depth. Use a random or median-of-three pivot, and recurse into the smaller side first (loop on the larger) to bound the stack to O(log n).', input: IN, run: function (T) { quick(T, false); }, pyCode: QS_PY, cCode: QS_C,
        predict: { q: 'After one partition step, what do we know about the pivot?', options: ['It is the smallest value', 'It is in its final sorted position', 'It is the median'], answer: 1, why: 'Everything to its left is smaller and everything to its right is larger or equal, so the pivot is exactly where it will end up.' } },
      { id: 'worst', title: 'Quicksort worst case', blurb: 'Already sorted input with a last-element pivot: every partition peels off a single value.', trap: 'Assuming "average O(n log n)" means you are safe. Adversarial or structured input (sorted, all equal) can trigger the worst case; real libraries use introsort, which switches to heapsort when recursion gets too deep.', input: SORTED, run: function (T) { quick(T, true); }, pyCode: QS_PY, cCode: QS_C,
        predict: { q: 'Quicksort with a last-element pivot runs on an already sorted array of n items. What is the time complexity?', options: ['O(n log n)', 'O(n^2)', 'O(n)'], answer: 1, why: 'The pivot is the maximum every time, so one side is empty and the other has n - 1 items: n levels of work shrinking by one each time.' } },
    ],
    builtins: [
      ['sorted(xs), xs.sort()', 'Timsort (a merge-sort hybrid): stable, O(n log n) worst case.'],
      ['heapq.merge(*iterables)', 'Lazy merge of already sorted inputs: the merge step on its own.'],
      ['sorted(xs, key=len)', 'Sort by a key function; keys are computed once per item.'],
      ['qsort(base, n, size, cmp)', 'C standard library sort (usually introsort); you supply the comparator.'],
      ['bisect.bisect_left(a, x)', 'Binary search on sorted data (next lesson).'],
      ['random.shuffle(xs)', 'Randomise order, sometimes used to avoid quicksort worst cases.'],
    ],
  };
})();
