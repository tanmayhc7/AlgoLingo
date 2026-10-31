/* Lesson: heap sort and quickselect, animated as bars. */
(function () {
  var PY_HEAP = ['def heap_sort(a):', '    n = len(a)', '    for i in range((n >> 1) - 1, -1, -1): sift_down(a, i, n)   # build max-heap', '    for end in range(n - 1, 0, -1):', '        a[0], a[end] = a[end], a[0]      # max goes to the end', '        sift_down(a, 0, end)', 'def sift_down(a, i, n):', '    while True:', '        big, l, r = i, 2 * i + 1, 2 * i + 2', '        if l < n and a[l] > a[big]: big = l', '        if r < n and a[r] > a[big]: big = r', '        if big == i: return', '        a[i], a[big] = a[big], a[i]; i = big'];
  var C_HEAP = ['void heap_sort(int a[], int n) {', '    /* n known */', '    for (int i = n / 2 - 1; i >= 0; i--) sift_down(a, i, n);   /* build max-heap */', '    for (int end = n - 1; end > 0; end--) {', '        swap(&a[0], &a[end]);             /* max goes to the end */', '        sift_down(a, 0, end);', '    }}', 'void sift_down(int a[], int i, int n) {', '    for (;;) { int big = i, l = 2 * i + 1, r = 2 * i + 2;', '        if (l < n && a[l] > a[big]) big = l;', '        if (r < n && a[r] > a[big]) big = r;', '        if (big == i) return;', '        swap(&a[i], &a[big]); i = big; }'];

  function heapSort(T) {
    var n = T.n, a = function (i) { return T.v(i); };
    T.frame(-1, -1, 'Heap sort: first arrange the array as a max-heap (every parent is at least as big as its children; the children of i are 2i+1 and 2i+2). Then repeatedly move the maximum to the end.', {});
    function sift(i, size, sortedFrom) {
      var srt = sortedFrom < n ? T.range(sortedFrom, n - 1) : [];
      while (true) {
        var big = i, l = 2 * i + 1, r = 2 * i + 2;
        var cmpList = [i];
        if (l < size) cmpList.push(l);
        if (r < size) cmpList.push(r);
        if (l >= size) { T.frame(11, 11, 'Position ' + i + ' has no children inside the heap: it is in place.', { mark: [i], sorted: srt, vars: { i: i, size: size } }); return; }
        T.cmps += (r < size ? 2 : 1);
        if (a(l) > a(big)) big = l;
        if (r < size && a(r) > a(big)) big = r;
        T.frame(10, 10, 'Compare ' + a(i) + ' with its children ' + a(l) + (r < size ? ' and ' + a(r) : '') + ': the largest is ' + a(big) + (big === i ? ', the parent itself.' : '.'), { cmp: cmpList, sorted: srt, ptr: { i: i }, vars: { i: i, size: size } });
        if (big === i) { T.frame(11, 11, 'The parent is already the largest: stop sifting.', { mark: [i], sorted: srt, vars: { i: i } }); return; }
        T.swap(i, big); T.swaps++;
        T.frame(12, 12, 'Swap the parent with the larger child; keep sifting down from position ' + big + '.', { swp: [i, big], sorted: srt, ptr: { i: big }, vars: { i: big, size: size } });
        i = big;
      }
    }
    for (var i = (n >> 1) - 1; i >= 0; i--) {
      T.frame(2, 2, 'Build phase: sift down position ' + i + ' so the subtree below it becomes a heap.', { mark: [i], ptr: { i: i }, vars: { i: i } });
      sift(i, n, n);
    }
    T.frame(2, 2, 'The whole array is now a max-heap: the biggest value, ' + a(0) + ', sits at position 0.', { mark: [0] });
    for (var end = n - 1; end > 0; end--) {
      T.swap(0, end); T.swaps++;
      T.frame(4, 4, 'Move the maximum ' + a(end) + ' to position ' + end + ': it is final. The heap shrinks by one.', { swp: [0, end], sorted: T.range(end, n - 1), vars: { end: end } });
      sift(0, end, end);
    }
    T.frame(-1, -1, 'Sorted: ' + T.cmps + ' comparisons and ' + T.swaps + ' swaps. Always O(n log n), in place, but not stable and unfriendly to CPU caches.', { sorted: T.range(0, n - 1) });
  }

  var PY_SEL = ['def quickselect(a, k):          # k-th smallest, 0-based', '    lo, hi = 0, len(a) - 1', '    while lo < hi:', '        p = partition(a, lo, hi)', '        if p == k: break', '        if p < k: lo = p + 1', '        else: hi = p - 1', '    return a[k]', 'def partition(a, lo, hi):       # Lomuto, pivot = a[hi]', '    i = lo', '    for j in range(lo, hi):', '        if a[j] < a[hi]: a[i], a[j] = a[j], a[i]; i += 1', '    a[i], a[hi] = a[hi], a[i]; return i'];
  var C_SEL = ['int quickselect(int a[], int n, int k) {', '    int lo = 0, hi = n - 1;', '    while (lo < hi) {', '        int p = partition(a, lo, hi);', '        if (p == k) break;', '        if (p < k) lo = p + 1;', '        else hi = p - 1;', '    } return a[k]; }', 'int partition(int a[], int lo, int hi) {   /* pivot = a[hi] */', '    int i = lo;', '    for (int j = lo; j < hi; j++)', '        if (a[j] < a[hi]) swap(&a[i++], &a[j]);', '    swap(&a[i], &a[hi]); return i; }'];

  function quickselect(k) {
    return function (T) {
      var n = T.n, a = function (i) { return T.v(i); };
      var lo = 0, hi = n - 1;
      T.frame(-1, -1, 'Find the ' + (k + 1) + 'rd smallest value (index ' + k + ' once sorted) WITHOUT sorting everything. Partition like quicksort, but then follow only the side that contains index ' + k + '.', { vars: { k: k } });
      while (lo < hi) {
        T.frame(2, 2, 'Search range ' + lo + '..' + hi + '. Partition it around the last value, ' + a(hi) + '.', { band: [lo, hi], pivot: hi, vars: { lo: lo, hi: hi, k: k } });
        var i = lo;
        for (var j = lo; j < hi; j++) {
          T.cmps++;
          var less = a(j) < a(hi);
          T.frame(11, 11, a(j) + (less ? ' < ' : ' >= ') + a(hi) + (less ? ': it goes to the left part.' : ': leave it on the right.'), { band: [lo, hi], pivot: hi, cmp: [j], ptr: { i: i, j: j }, vars: { lo: lo, hi: hi } });
          if (less) { if (i !== j) { T.swap(i, j); T.swaps++; T.frame(11, 11, 'Swap it into the left part.', { band: [lo, hi], pivot: hi, swp: [i, j], ptr: { i: i }, vars: { lo: lo, hi: hi } }); } i++; }
        }
        if (i !== hi) { T.swap(i, hi); T.swaps++; }
        var p = i;
        T.frame(12, 12, 'The pivot lands at index ' + p + ': it is in its final sorted place.', { band: [lo, hi], sorted: [p], swp: i !== hi ? [i, hi] : [], vars: { p: p, k: k } });
        if (p === k) { T.frame(4, 4, 'p = k = ' + k + ': this value, ' + a(p) + ', IS the answer. Stop; the rest stays unsorted.', { found: [p], vars: { p: p, k: k } }); return; }
        if (p < k) { lo = p + 1; T.frame(5, 5, p + ' < ' + k + ': the answer is to the right. Discard the left side and the pivot.', { band: [lo, hi], dim: T.range(0, p), vars: { lo: lo, hi: hi, k: k } }); }
        else { hi = p - 1; T.frame(6, 6, p + ' > ' + k + ': the answer is to the left. Discard the right side and the pivot.', { band: [lo, hi], dim: T.range(p, n - 1), vars: { lo: lo, hi: hi, k: k } }); }
      }
      T.frame(7, 7, 'One value left in range: index ' + k + ' holds ' + a(k) + '.', { found: [k] });
    };
  }

  window.LESSON = {
    id: 'heap-select',
    mode: 'algo',
    title: 'Heap sort and quickselect',
    lede:
      'Two more ways to use order without a full sort. Heap sort builds a max-heap in the array itself and repeatedly moves the maximum to the end: O(n log n) always, no extra memory. Quickselect finds the k-th smallest value by partitioning like quicksort but following only one side, which gives O(n) on average. "Kth largest element" is one of the most common interview questions, and the answer is either a heap of size k or quickselect.',
    scenes: [
      { id: 'heap', title: 'Heap sort', blurb: 'Bars at positions 2i+1 and 2i+2 are the children of position i. Green bars on the right are final.', trap: 'Building the heap by pushing one value at a time costs O(n log n); sifting down from n/2 - 1 builds it in O(n). Also remember heap sort is not stable and jumps around memory, so quicksort usually wins in practice.', input: [4, 10, 3, 5, 1, 8, 7, 2], pyCode: PY_HEAP, cCode: C_HEAP, predict: { q: 'In an array-based heap, where is the left child of position i?', options: ['i + 1', '2i + 1', 'i / 2'], answer: 1, why: 'The children of i are at 2i + 1 and 2i + 2; the parent of i is (i - 1) / 2.' }, run: heapSort },
      { id: 'select', title: 'Quickselect (k-th smallest)', blurb: 'Same partition as quicksort, but only one side is searched. The shaded band is what is left to search.', trap: 'With a bad pivot it degrades to O(n^2) (sorted input and a last-element pivot). Pick a random pivot or use median of medians. Also quickselect reorders the input array: copy it first if the caller needs the original.', input: [7, 2, 9, 4, 1, 8, 5, 3], pyCode: PY_SEL, cCode: C_SEL, predict: { q: 'Why is quickselect O(n) on average while quicksort is O(n log n)?', options: ['It uses a better pivot', 'It recurses into only one side, so the work shrinks geometrically', 'It never compares values'], answer: 1, why: 'n + n/2 + n/4 + ... is about 2n. Quicksort must handle both sides at every level.' }, run: quickselect(2) },
    ],
    builtins: [
      ['heapq.heapify(xs)', 'Turn a list into a min-heap in O(n).'],
      ['heapq.nlargest(k, xs)', 'The k biggest values in O(n log k); nsmallest for the smallest.'],
      ['heapq.heappush / heappop', 'Heap operations in O(log n). Negate values to get a max-heap.'],
      ['sorted(xs)[k]', 'The simple answer for k-th smallest: O(n log n).'],
      ['qsort and a manual heap', 'C has no heap in the standard library; write sift_down yourself.'],
      ['random.randrange(lo, hi + 1)', 'Random pivot for quickselect.'],
    ],
  };
})();
