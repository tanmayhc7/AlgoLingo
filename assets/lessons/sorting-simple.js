/* Lesson: simple sorts, animated as bars. Each scene executes the algorithm and records frames. */
(function () {
  var IN = [6, 3, 8, 2, 7, 1, 5, 4];

  function bubble(T) {
    var n = T.n, a = function (i) { return T.v(i); };
    T.frame(-1, -1, 'Eight bars, unsorted. Bubble sort repeatedly compares neighbours and swaps them if they are in the wrong order. Press play.', {});
    for (var end = n - 1; end > 0; end--) {
      var swapped = false;
      for (var j = 0; j < end; j++) {
        T.cmps++;
        var wrong = a(j) > a(j + 1);
        T.frame(4, 3, 'Compare ' + a(j) + ' and ' + a(j + 1) + (wrong ? ': the left one is bigger, so they swap.' : ': already in order, leave them.'), { cmp: [j, j + 1], ptr: { j: j, 'j+1': j + 1 }, sorted: T.range(end + 1, n - 1), vars: { end: end, j: j } });
        if (wrong) {
          T.swap(j, j + 1); T.swaps++; swapped = true;
          T.frame(5, 4, 'Swapped. The larger value has moved one step to the right.', { swp: [j, j + 1], ptr: { j: j }, sorted: T.range(end + 1, n - 1), vars: { end: end, j: j } });
        }
      }
      T.frame(2, 1, 'End of pass: the largest remaining value, ' + a(end) + ', has bubbled to position ' + end + ' and is now final.', { sorted: T.range(end, n - 1), vars: { end: end } });
    }
    T.frame(-1, -1, 'Sorted. n = 8 needed ' + T.cmps + ' comparisons: always about n(n-1)/2, so O(n^2).', { sorted: T.range(0, n - 1) });
  }

  function selection(T) {
    var n = T.n, a = function (i) { return T.v(i); };
    T.frame(-1, -1, 'Selection sort scans the unsorted part to find the smallest value, then swaps it to the front. It does at most one swap per pass.', {});
    for (var i = 0; i < n - 1; i++) {
      var m = i;
      T.frame(2, 2, 'Pass ' + (i + 1) + ': assume the first unsorted value, ' + a(i) + ', is the minimum.', { min: m, ptr: { i: i, m: m }, sorted: T.range(0, i - 1), vars: { i: i, m: m } });
      for (var j = i + 1; j < n; j++) {
        T.cmps++;
        var less = a(j) < a(m);
        T.frame(4, 4, 'Is ' + a(j) + ' smaller than the current minimum ' + a(m) + '? ' + (less ? 'Yes: remember its position.' : 'No.'), { cmp: [j], min: m, ptr: { i: i, j: j, m: m }, sorted: T.range(0, i - 1), vars: { i: i, j: j, m: m } });
        if (less) {
          m = j;
          T.frame(5, 5, 'New minimum: ' + a(m) + ' at position ' + m + '.', { min: m, ptr: { i: i, j: j, m: m }, sorted: T.range(0, i - 1), vars: { i: i, j: j, m: m } });
        }
      }
      if (m !== i) {
        T.swap(i, m); T.swaps++;
        T.frame(6, 6, 'Swap the minimum into position ' + i + '. One swap this pass, however many comparisons.', { swp: [i, m], ptr: { i: i }, sorted: T.range(0, i - 1), vars: { i: i } });
      } else T.frame(6, 6, 'The minimum was already in place: no swap needed.', { ptr: { i: i }, sorted: T.range(0, i - 1) });
      T.frame(1, 1, 'Position ' + i + ' is final.', { sorted: T.range(0, i) });
    }
    T.frame(-1, -1, 'Sorted with ' + T.cmps + ' comparisons (always n(n-1)/2) but only ' + T.swaps + ' swaps. Handy when writes are expensive.', { sorted: T.range(0, n - 1) });
  }

  function insertion(T) {
    var n = T.n, a = function (i) { return T.v(i); };
    T.frame(-1, -1, 'Insertion sort keeps a sorted prefix on the left and inserts each new value into its place, like sorting playing cards in your hand.', { sorted: [0] });
    for (var i = 1; i < n; i++) {
      T.frame(2, 2, 'Take the next value, key = ' + a(i) + ', and slide it left into the sorted prefix.', { mark: [i], ptr: { i: i }, sorted: T.range(0, i - 1), vars: { i: i, key: a(i) } });
      var j = i;
      while (j > 0) {
        T.cmps++;
        var bigger = a(j - 1) > a(j);
        T.frame(4, 4, 'Is ' + a(j - 1) + ' bigger than the key ' + a(j) + '? ' + (bigger ? 'Yes: shift it right.' : 'No: the key belongs here.'), { cmp: [j - 1, j], ptr: { key: j }, sorted: T.range(0, i).filter(function (p) { return p !== j; }), vars: { i: i, key: a(j) } });
        if (!bigger) break;
        T.swap(j - 1, j); T.swaps++;
        T.frame(5, 5, 'The larger value moved right; the key moved left one step.', { swp: [j - 1, j], ptr: { key: j - 1 }, sorted: T.range(0, i).filter(function (p) { return p !== j - 1; }), vars: { i: i } });
        j--;
      }
      T.frame(7, 8, 'The key is in place. The prefix up to position ' + i + ' is sorted.', { sorted: T.range(0, i), vars: { i: i } });
    }
    T.frame(-1, -1, 'Sorted. On this input: ' + T.cmps + ' comparisons and ' + T.swaps + ' moves. On already-sorted input it would need only n - 1 comparisons.', { sorted: T.range(0, n - 1) });
  }

  window.LESSON = {
    id: 'sorting-simple',
    mode: 'algo',
    title: 'Simple sorts: bubble, selection, insertion',
    lede:
      'Three sorts you can write in a few lines. All take O(n^2) time in the worst case, but they behave differently: bubble sort does many swaps, selection sort does very few, and insertion sort is fast when the data is nearly sorted. Interviews rarely ask you to write them, but they ask you to explain them, compare them, and say when each is the right tool. Watch the bars move: yellow is being compared, red is being swapped, green is finished.',
    scenes: [
      { id: 'bubble', title: 'Bubble sort', blurb: 'Compare neighbours and swap the wrong ones. After each pass the largest value has bubbled to the end.', trap: 'Forgetting that every pass shrinks the range by one (the last items are already sorted), and forgetting the early-exit flag: if a whole pass makes no swap, the list is sorted and you can stop. With the flag, sorted input costs O(n).', input: IN, run: bubble,
        pyCode: ['def bubble_sort(a):', '    n = len(a)', '    for end in range(n - 1, 0, -1):', '        for j in range(end):', '            if a[j] > a[j + 1]:', '                a[j], a[j + 1] = a[j + 1], a[j]'],
        cCode: ['void bubble_sort(int *a, int n) {', '    for (int end = n - 1; end > 0; end--) {', '        for (int j = 0; j < end; j++) {', '            if (a[j] > a[j + 1]) {', '                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;', '            }', '        }', '    }', '}'],
        predict: { q: 'After the first full pass of bubble sort, which value is guaranteed to be in its final position?', options: ['The smallest value, at the front', 'The largest value, at the end', 'The middle value'], answer: 1, why: 'Each comparison pushes the larger of the pair to the right, so the maximum is carried all the way to the last position.' } },
      { id: 'selection', title: 'Selection sort', blurb: 'Find the minimum of the unsorted part and swap it to the front. Few swaps, many comparisons.', trap: 'Assuming it is adaptive: selection sort does the same n(n-1)/2 comparisons even on sorted input. It is also not stable: swapping a distant minimum can jump over an equal value and reorder equal keys.', input: IN, run: selection,
        pyCode: ['def selection_sort(a):', '    for i in range(len(a)):', '        m = i', '        for j in range(i + 1, len(a)):', '            if a[j] < a[m]:', '                m = j', '        a[i], a[m] = a[m], a[i]'],
        cCode: ['void selection_sort(int *a, int n) {', '    for (int i = 0; i < n; i++) {', '        int m = i;', '        for (int j = i + 1; j < n; j++)', '            if (a[j] < a[m])', '                m = j;', '        int t = a[i]; a[i] = a[m]; a[m] = t;', '    }', '}'],
        predict: { q: 'Selection sort sorts n items. What is the maximum number of swaps it performs?', options: ['About n^2 / 2', 'At most n - 1', 'About n log n'], answer: 1, why: 'Each pass does at most one swap (placing the minimum), so the swap count is O(n) even though comparisons are O(n^2).' } },
      { id: 'insertion', title: 'Insertion sort', blurb: 'Grow a sorted prefix. Each new value slides left until it meets a smaller one.', trap: 'Using it on large random data (O(n^2)) when it only shines on small or nearly sorted input. That is exactly why production sorts such as Timsort use insertion sort for short runs.', input: IN, run: insertion,
        pyCode: ['def insertion_sort(a):', '    for i in range(1, len(a)):', '        key = a[i]', '        j = i - 1', '        while j >= 0 and a[j] > key:', '            a[j + 1] = a[j]', '            j -= 1', '        a[j + 1] = key'],
        cCode: ['void insertion_sort(int *a, int n) {', '    for (int i = 1; i < n; i++) {', '        int key = a[i];', '        int j = i - 1;', '        while (j >= 0 && a[j] > key) {', '            a[j + 1] = a[j];', '            j--;', '        }', '        a[j + 1] = key;', '    }', '}'],
        predict: { q: 'Which input makes insertion sort fastest?', options: ['Reverse sorted', 'Already sorted', 'All values different'], answer: 1, why: 'On sorted input the while condition fails immediately for every key, so the whole run is n - 1 comparisons: O(n).' } },
    ],
    builtins: [
      ['sorted(xs, key=, reverse=)', 'Returns a new sorted list. Timsort: O(n log n), stable, fast on partly sorted data.'],
      ['xs.sort()', 'Sorts in place (returns None). Same algorithm.'],
      ['heapq.nsmallest(k, xs)', 'The k smallest without sorting everything: O(n log k).'],
      ['bisect.insort(xs, v)', 'Insert into a sorted list, keeping it sorted (insertion sort in one step).'],
      ['qsort(base, n, size, cmp)', 'C library sort with a comparator function pointer.'],
      ['functools.cmp_to_key', 'Use an old-style comparison function as a key.'],
    ],
  };
})();
