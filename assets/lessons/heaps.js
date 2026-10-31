/* Lesson data: Heaps (structure mode). A min-heap stored in an array and drawn as a tree. */
(function () {
  function pos(i) {
    var level = Math.floor(Math.log(i) / Math.LN2);
    var first = Math.pow(2, level);
    return [Math.round((1000 * (2 * (i - first) + 1)) / Math.pow(2, level + 1)), 60 + level * 90];
  }
  var ARR_Y = 340;
  function cellX(i) { return 150 + (i - 1) * 80; }
  function draw(vals) {
    var ops = [['node', 'al', 'array', 70, ARR_Y, 'cell'], ['tag', 'al', 'mark']];
    vals.forEach(function (v, k) {
      var i = k + 1; var p = pos(i);
      ops.push(['node', 't' + i, String(v), p[0], p[1], 'circle']);
      ops.push(['node', 'a' + i, String(v), cellX(i), ARR_Y, 'cell']);
    });
    vals.forEach(function (v, k) {
      var i = k + 1;
      if (2 * i <= vals.length) ops.push(['edge', 't' + i, 't' + 2 * i, 'l']);
      if (2 * i + 1 <= vals.length) ops.push(['edge', 't' + i, 't' + (2 * i + 1), 'r']);
    });
    return ops;
  }
  function swap(i, vi, j, vj) {
    /* slot i gets value vj, slot j gets value vi */
    return [['lab', 't' + i, String(vj)], ['lab', 'a' + i, String(vj)], ['lab', 't' + j, String(vi)], ['lab', 'a' + j, String(vi)]];
  }

  var push = [
    { pl: -1, cl: -1, say: 'A min-heap: every parent is no larger than its children, so the smallest value is always at the root. It is stored in a plain array: the children of slot i are slots 2i and 2i+1 (1-based), and the parent of slot i is slot i // 2.', csay: 'Same array, same index arithmetic.', ds: draw([2, 4, 3, 7, 5, 6]) },
    { pl: 1, cl: 1, say: 'Push 1. Append it at the end of the array. That is the next free slot in the tree (slot 7, the right child of slot 3), so the tree stays complete.', csay: 'a[n++] = 1;', ds: [['node', 't7', '1', pos(7)[0], pos(7)[1], 'circle'], ['edge', 't3', 't7', 'r'], ['node', 'a7', '1', cellX(7), ARR_Y, 'cell'], ['tag', 't7', 'cur'], ['tag', 'a7', 'cur']] },
    { pl: 2, cl: 2, say: 'Sift up. The parent of slot 7 is slot 3, holding 3. Since 1 < 3 the order is broken locally, so swap them.', csay: 'a[7] < a[3]: swap.', ds: [['untag', 't7', 'cur'], ['untag', 'a7', 'cur']].concat(swap(7, 1, 3, 3)).concat([['tag', 't3', 'cur'], ['tag', 'a3', 'cur'], ['hot', 't7', 't3']]) },
    { pl: 2, cl: 2, say: 'Now 1 is in slot 3. Its parent is slot 1, holding 2, and 1 < 2, so swap again.', csay: 'a[3] < a[1]: swap.', ds: [['untag', 't3', 'cur'], ['untag', 'a3', 'cur']].concat(swap(3, 1, 1, 2)).concat([['tag', 't1', 'cur'], ['tag', 'a1', 'cur'], ['hot', 't3', 't1']]) },
    { pl: 3, cl: 3, say: 'At the root there is no parent, so stop. The new minimum is at the top. The new value moved along one root-to-leaf path, at most log2(n) swaps: push is O(log n).', csay: 'Reached the root: done.', ds: [['untag', 't1', 'cur'], ['untag', 'a1', 'cur'], ['tag', 't1', 'done'], ['tag', 'a1', 'done'], ['hot', 't1']] },
  ];

  var pop = [
    { pl: -1, cl: -1, say: 'Pop the minimum. The smallest value is always the root, slot 1, so reading it is O(1). Removing it needs care to keep the tree complete.', csay: 'Same heap.', ds: draw([1, 4, 2, 7, 5, 6, 3]) },
    { pl: 1, cl: 1, say: 'Save the root (1) to return. Move the last array element (3) into the root, and shrink the array by one. The shape is a complete tree again, but the root is probably in the wrong place.', csay: 'top = a[1]; a[1] = a[n--];', ds: [['tag', 't1', 'bad'], ['lab', 't1', '3'], ['lab', 'a1', '3'], ['rm', 't7'], ['rm', 'a7']] },
    { pl: 2, cl: 2, say: 'Sift down. The children of slot 1 are 4 and 2. Pick the smaller one, 2, and compare: 3 > 2, so swap with it. (Swapping with the larger child would break the order.)', csay: 'Smaller child is slot 3: swap.', ds: [['untag', 't1', 'bad']].concat(swap(1, 3, 3, 2)).concat([['tag', 't3', 'cur'], ['tag', 'a3', 'cur'], ['hot', 't1', 't3']]) },
    { pl: 3, cl: 3, say: 'Now 3 is in slot 3 and its only child is 6. 3 < 6, so it is in the right place. Stop. The heap is valid again: [2, 4, 3, 7, 5, 6]. Pop is O(log n).', csay: 'Not larger than children: done.', ds: [['untag', 't3', 'cur'], ['untag', 'a3', 'cur'], ['tag', 't3', 'done'], ['tag', 'a3', 'done'], ['hot', 't3']] },
  ];

  window.LESSON = {
    id: 'heaps',
    mode: 'ds',
    title: 'Heaps',
    lede:
      'A heap keeps the smallest (or largest) item instantly available while allowing cheap inserts and removals. It is a complete binary tree stored in an array, with one rule: every parent is no larger than its children. Push appends and sifts up; pop swaps the last item to the root and sifts down. Both take O(log n). Python\'s heapq is a min-heap on a plain list.',
    scenes: [
      { id: 'push', title: 'Push (sift up)', blurb: 'Append to the end, then swap upward while the new value is smaller than its parent.', trap: 'A heap is not sorted. Only the parent/child relation is guaranteed, so a sibling or a cousin can be larger or smaller. Only the root is known to be the minimum.', pyCode: ['# heapq.heappush(h, x) does this', 'h.append(x)', 'while i > 0 and h[i] < h[(i - 1) // 2]:', '    swap with parent', '# stops at the root'], cCode: ['/* 1-based array a[1..n] */', 'a[++n] = x;', 'for (i = n; i > 1 && a[i] < a[i/2]; i /= 2)', '    swap(&a[i], &a[i/2]);', '/* stops at the root */'], predict: { q: 'In a min-heap, where is the largest value?', options: ['At the last slot in the array', 'Somewhere among the leaves; the heap does not say which one', 'At the root'], answer: 1, why: 'Only parents are ordered against their children. The maximum must be a leaf, but any leaf can hold it.' }, steps: push },
      { id: 'pop', title: 'Pop (sift down)', blurb: 'Replace the root with the last element, then swap downward with the smaller child.', trap: 'Swap with the smaller child in a min-heap. Swapping with the larger one leaves the smaller child above a larger parent, and the invariant breaks.', pyCode: ['top = h[0]', 'h[0] = h.pop()   # last item to the root', 'while a child is smaller:', '    swap with the smaller child'], cCode: ['top = a[1];', 'a[1] = a[n--];', 'for (i = 1; 2*i <= n; i = c) {', '    c = smaller child; if (a[i] <= a[c]) break; swap(&a[i], &a[c]);', '}'], predict: { q: 'Why does pop move the <b>last</b> element to the root instead of shifting everything left?', options: ['Shifting is the same cost, but this is neater', 'It keeps the tree complete and the array contiguous in O(1), leaving only one value to repair', 'The last element is always the second smallest'], answer: 1, why: 'Removing the last slot keeps the shape complete without moving anything else. The only problem is the one misplaced value at the root, fixed by one sift down.' }, steps: pop },
    ],
    builtins: [
      ['heapq.heappush(h, x)', 'Push onto a min-heap list: O(log n).'],
      ['heapq.heappop(h)', 'Remove and return the smallest: O(log n).'],
      ['h[0]', 'Peek at the smallest: O(1).'],
      ['heapq.heapify(h)', 'Turn a list into a heap in place: O(n).'],
      ['heapq.heappushpop(h, x)', 'Push then pop in one step, faster than doing both.'],
      ['heapq.nlargest(k, it) / nsmallest', 'The k extremes of an iterable: O(n log k).'],
      ['push -x', 'heapq is min-only; negate numbers to get a max-heap.'],
    ],
  };
})();
