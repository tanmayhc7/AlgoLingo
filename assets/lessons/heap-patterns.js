/* Lesson data: Heap patterns (structure mode). */
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
  function setv(i, v) { return [['lab', 't' + i, String(v)], ['lab', 'a' + i, String(v)]]; }

  var heapify = [
    { pl: -1, cl: -1, say: 'Build a heap from an unordered array [6, 5, 3, 1, 8, 7, 2]. Pushing n times costs O(n log n). Better: treat the array as a tree and sift down every internal node, starting from the last one and moving to the root.', csay: 'Same idea.', ds: draw([6, 5, 3, 1, 8, 7, 2]) },
    { pl: 1, cl: 1, say: 'Leaves are already valid heaps of size one, so start at the last internal node, slot 3 (n // 2). Its children are 7 and 2. 3 > 2, so swap with the smaller child.', csay: 'i = n/2 = 3: sift down.', ds: [['tag', 't3', 'cur']].concat(setv(3, 2)).concat(setv(7, 3)).concat([['hot', 't3', 't7']]) },
    { pl: 2, cl: 2, say: 'Slot 2 holds 5 with children 1 and 8. The smaller child is 1 < 5, so swap.', csay: 'i = 2: sift down.', ds: [['untag', 't3', 'cur'], ['tag', 't2', 'cur']].concat(setv(2, 1)).concat(setv(4, 5)).concat([['hot', 't2', 't4']]) },
    { pl: 2, cl: 2, say: 'The root holds 6 with children 1 and 2. Swap with 1. Then 6 continues down: its new children are 5 and 8, so it swaps with 5 as well.', csay: 'i = 1: sift down, two levels.', ds: [['untag', 't2', 'cur'], ['tag', 't1', 'cur']].concat(setv(1, 1)).concat(setv(2, 5)).concat(setv(4, 6)).concat([['hot', 't1', 't2', 't4']]) },
    { pl: 3, cl: 3, say: 'The array is now a valid min-heap: [1, 5, 2, 6, 8, 7, 3]. The total work is O(n), not O(n log n): half the nodes are leaves (no work), a quarter sift down at most one level, and so on, so the sum converges.', csay: 'O(n) overall.', ds: [['untag', 't1', 'cur'], ['tag', 't1', 'done'], ['tag', 'a1', 'done'], ['hot', 't1']] },
  ];

  var STREAM = [5, 1, 8, 3, 9, 2];
  function streamOps() {
    var ops = [['node', 'sl', 'stream', 70, ARR_Y + 90, 'cell'], ['tag', 'sl', 'mark']];
    STREAM.forEach(function (v, i) { ops.push(['node', 's' + i, String(v), 150 + i * 80, ARR_Y + 90, 'cell']); });
    return ops;
  }
  function ptrAt(i) { return ['ptr', 'x', 's' + i, 'up']; }
  var topk = [
    { pl: -1, cl: -1, say: 'The 3 largest numbers in a stream: [5, 1, 8, 3, 9, 2]. Use a min-heap of size k = 3. It holds the best 3 seen so far, and its root is the weakest of them, the one to beat.', csay: 'Same plan with a heap of size 3.', ds: streamOps() },
    { pl: 2, cl: 2, say: 'Read 5, 1 and 8. The heap has fewer than 3 items, so just push each. The heap is [1, 5, 8] with root 1.', csay: 'Heap not full: push.', ds: [ptrAt(2), ['node', 't1', '1', pos(1)[0], pos(1)[1], 'circle'], ['node', 't2', '5', pos(2)[0], pos(2)[1], 'circle'], ['node', 't3', '8', pos(3)[0], pos(3)[1], 'circle'], ['edge', 't1', 't2', 'l'], ['edge', 't1', 't3', 'r'], ['tag', 't1', 'mark']] },
    { pl: 3, cl: 3, say: 'Read 3. The heap is full and 3 > the root (1), so 3 belongs in the top 3. Replace the root with 3 and sift down: 3 is still smaller than both children, so it stays. Heap: [3, 5, 8].', csay: '3 > heap[0]: replace the root.', ds: [ptrAt(3), ['lab', 't1', '3'], ['hot', 't1']] },
    { pl: 3, cl: 3, say: 'Read 9. 9 > 3, so replace the root with 9. Sift down: swap with the smaller child, 5. Heap: [5, 9, 8].', csay: '9 > heap[0]: replace and sift down.', ds: [ptrAt(4), ['lab', 't1', '5'], ['lab', 't2', '9'], ['hot', 't1', 't2']] },
    { pl: 4, cl: 4, say: 'Read 2. 2 is not larger than the root (5), so it cannot be in the top 3. Skip it. The heap holds the 3 largest: 5, 8, 9. Cost: O(n log k) time and O(k) space, and it works on a stream you cannot store.', csay: 'Skip. Result: 5, 8, 9.', ds: [ptrAt(5), ['tag', 't1', 'done'], ['tag', 't2', 'done'], ['tag', 't3', 'done'], ['hot', 't1']] },
  ];

  window.LESSON = {
    id: 'heap-patterns',
    mode: 'ds',
    title: 'Heap patterns',
    lede:
      'Two moves cover most heap interview questions. Heapify builds a heap from n items in O(n) by sifting down from the last internal node to the root. Top-k keeps a heap of size k so the root is always the weakest of the current best, giving O(n log k) over a stream. Both rest on the same sift-down you saw in the previous lesson.',
    scenes: [
      { id: 'heapify', title: 'Heapify', blurb: 'Sift down each internal node from the bottom up. Total work O(n).', trap: 'Heapify must go bottom-up. Sifting down from the root first would leave the lower levels unordered, and nothing repairs them afterwards.', pyCode: ['import heapq', 'h = [6, 5, 3, 1, 8, 7, 2]', 'for i in range(len(h) // 2 - 1, -1, -1):', '    sift_down(h, i)   # heapq.heapify(h) does this', '# h is now a heap'], cCode: ['int a[] = {6,5,3,1,8,7,2}; /* 1-based a[1..n] */', 'for (int i = n / 2; i >= 1; i--)', '    sift_down(a, i, n);', '/* a is now a heap */'], predict: { q: 'What is the cost of <code>heapq.heapify</code> on n items?', options: ['O(n)', 'O(n log n)', 'O(log n)'], answer: 0, why: 'Most nodes are near the leaves and sift very little. The sum of the work over all levels is bounded by a constant times n.' }, steps: heapify },
      { id: 'topk', title: 'Top-k with a size-k heap', blurb: 'Keep the best k seen so far in a min-heap. A new value only matters if it beats the root.', trap: 'To keep the k LARGEST you want a MIN-heap (the root is the smallest of the winners, the one to evict). It feels backwards. For the k smallest, use a max-heap by negating values.', pyCode: ['h = []', 'for x in stream:', '    if len(h) < k: heapq.heappush(h, x)', '    elif x > h[0]: heapq.heapreplace(h, x)', '    # else: skip x'], cCode: ['for (int i = 0; i < n; i++) {', '    if (size < k) push(x[i]);', '    else if (x[i] > heap[1]) replace_root(x[i]);', '    /* else skip */', '}'], predict: { q: 'You want the 3 largest numbers. Which heap do you keep?', options: ['A max-heap of size 3', 'A min-heap of size 3', 'A min-heap holding all n numbers'], answer: 1, why: 'The root of a min-heap is the smallest of the current top 3, which is exactly the value a new number has to beat.' }, steps: topk },
    ],
    builtins: [
      ['heapq.heapify(h)', 'Build a heap in place in O(n).'],
      ['heapq.heapreplace(h, x)', 'Pop the smallest and push x: replace the root and sift down. Faster than pop then push.'],
      ['heapq.nlargest(k, it, key=)', 'Top k with a key function.'],
      ['heapq.merge(*sorted_iters)', 'Lazily merge sorted inputs (k-way merge).'],
      ['(priority, counter, item)', 'Tuples compare left to right; add a counter to avoid comparing items that cannot be ordered.'],
    ],
  };
})();
