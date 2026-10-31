/* Interview depth: heap sort and quickselect. */
window.DEPTH = {
  thesis:
    'Heap sort and quickselect both exploit partial order. Heap sort keeps a max-heap inside the array and repeatedly swaps the maximum to the end: O(n log n) always, O(1) extra space, not stable. Quickselect partitions like quicksort and follows only the side containing the target index: O(n) on average, O(n^2) worst case. For "k-th largest" you choose between a size-k heap (O(n log k), streaming friendly) and quickselect (O(n) average, needs the whole array).',
  why: [
    ['Kth largest / top K', 'One of the most common interview questions; the three answers are sort, heap, and quickselect.'],
    ['Streaming and memory limits', 'A min-heap of size k works on a stream and uses O(k) memory.'],
    ['Guaranteed worst case', 'Heap sort is the in-place sort with no bad input; introsort falls back to it when quicksort recurses too deep.'],
    ['Heap internals', 'Index arithmetic (2i+1, 2i+2), sift-down and build-heap in O(n) are routinely asked.'],
  ],
  edges: [
    ['Max versus min heap', 'Python heapq is a min-heap; for k largest keep a min-heap of size k, or push negated values.'],
    ['Building the heap', 'Sifting down from n/2 - 1 is O(n). Pushing n items one by one is O(n log n).'],
    ['Duplicates in quickselect', 'Lomuto partition degrades with many equal values. Use three-way partitioning (less, equal, greater).'],
    ['Pivot choice', 'A last-element pivot on sorted input gives O(n^2). Random pivot or median of medians avoids it.'],
    ['k out of range', 'Validate 0 <= k < n before searching.'],
    ['Mutating input', 'Quickselect reorders the array in place; copy it if the caller still needs the original order.'],
  ],
  cost: [
    ['Heap sort', 'O(n log n) always. Space O(1).'],
    ['Build-heap', 'O(n) bottom-up.'],
    ['Quickselect', 'O(n) average, O(n^2) worst. Space O(1) iterative.'],
    ['Top-k with a heap', 'O(n log k) time, O(k) space.'],
  ],
  internals: [
    ['Array layout', 'Children of i at 2i + 1 and 2i + 2, parent at (i - 1) // 2. No pointers needed.'],
    ['Sift-down', 'Swap with the larger child until the parent is not smaller than both children.'],
    ['Why build-heap is O(n)', 'Most nodes are near the bottom and sift only a few levels; the sum n/4 + 2 n/8 + 3 n/16 ... is O(n).'],
    ['Why quickselect is O(n)', 'The expected range halves each round: n + n/2 + n/4 + ... = 2n.'],
  ],
  qa: [
    { lvl: 'junior', q: 'How do you find the k-th largest element in an array?', a: 'Sort and index, O(n log n); keep a min-heap of size k, O(n log k); or use quickselect, O(n) on average.', follow: [] },
    { lvl: 'mid', q: 'Why is building a heap O(n) and not O(n log n)?', a: 'Sifting down from the middle upwards costs height-of-node per node, and half the nodes are leaves costing zero, a quarter cost one, an eighth cost two. The sum is bounded by 2n.', follow: [] },
    { lvl: 'mid', q: 'Why is heap sort rarely used in practice despite the O(n log n) guarantee?', a: 'It has poor cache locality (it jumps between parent and child far apart), it is not stable, and its constant factors are larger than quicksort or merge sort. It survives as the fallback inside introsort.', follow: [] },
    { lvl: 'senior', q: 'The data is a stream and you need the median at any time.', a: 'Keep a max-heap for the lower half and a min-heap for the upper half, rebalancing so sizes differ by at most one. Insert in O(log n); the median is the top of one heap or the average of both tops.', follow: [] },
    { lvl: 'senior', q: 'How do you make quickselect worst-case linear?', a: 'Use median of medians to choose the pivot (groups of five, take the median of the group medians). It guarantees a constant fraction is discarded each round, giving O(n) worst case, though with a large constant; most code uses a random pivot instead.', follow: [] },
  ],
};
