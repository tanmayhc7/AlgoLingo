/* Interview depth: merge sort and quicksort. */
window.DEPTH = {
  thesis:
    'Merge sort and quicksort are the two divide and conquer sorts every candidate must be able to write, analyse and compare. The questions are always the same family: complexity (best, average, worst), space, stability, pivot choice, recursion depth, and what real libraries do. Writing correct partition code under pressure, with boundaries right, is the practical skill.',
  why: [
    ['They are the baseline for "fast" sorting', 'Almost every n log n discussion refers to one of them, and heapsort, Timsort and introsort are built from the same ideas.'],
    ['They teach divide and conquer analysis', 'The recurrence T(n) = 2T(n/2) + O(n) gives O(n log n), and the unbalanced quicksort recurrence T(n) = T(n-1) + O(n) gives O(n^2).'],
    ['Partition is reused everywhere', 'Quickselect (kth smallest), Dutch national flag, moving zeros and "sort colors" all use the partition idea.'],
    ['Merge is reused everywhere', 'Merging sorted lists, counting inversions, external sorting and merging k sorted streams.'],
  ],
  edges: [
    ['Pivot choice', 'First or last element on sorted data is O(n^2). Use random, median-of-three or median-of-medians for guarantees.'],
    ['Many equal keys', 'Lomuto partition degrades to O(n^2) when all values are equal. Use Hoare partition or a three-way partition (less, equal, greater).'],
    ['Recursion depth', 'Quicksort can recurse n deep. Recurse into the smaller half and loop on the larger to bound the stack at O(log n).'],
    ['Index bounds in merge', 'Handle the leftover tail of either half, and use <= so equal items from the left half come first.'],
    ['Midpoint overflow in C', '(lo + hi) / 2 can overflow for huge ints; use lo + (hi - lo) / 2.'],
  ],
  cost: [
    ['merge sort', 'O(n log n) always; O(n) extra space for arrays (O(log n) stack); stable. For linked lists O(1) extra space.'],
    ['quicksort', 'O(n log n) expected, O(n^2) worst; O(log n) expected stack with the smaller-side trick; in place; not stable.'],
    ['heapsort', 'O(n log n) always, O(1) space, not stable, poor cache behaviour.'],
    ['Timsort / introsort', 'Timsort: O(n log n), stable, O(n) on sorted data. Introsort: quicksort with a depth guard, O(n log n) worst case.'],
  ],
  internals: [
    ['Why quicksort is fast in practice', 'Partitioning scans memory sequentially (cache friendly) and does few writes; the inner loop is tiny.'],
    ['Lomuto versus Hoare', 'Lomuto (shown here) is simple: one scan, one pivot position. Hoare scans from both ends and does about a third as many swaps, but its boundary conditions are easy to get wrong.'],
    ['Counting inversions', 'During a merge, every time a right element is taken before remaining left elements, it jumps over len(left remaining) inversions. Summing that gives the inversion count in O(n log n).'],
    ['External sorting', 'When data exceeds memory, sort chunks that fit, write them as sorted runs, and k-way merge them with a heap.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Walk through quicksort and state its time complexity in the best, average and worst case.',
      a: 'Choose a pivot, partition so smaller values are left and larger are right (the pivot is then final), and recurse on both sides. Best and average are O(n log n): balanced splits give log n levels, each doing O(n) partition work. Worst case is O(n^2): when the pivot is always the min or max (sorted input with a naive pivot), the recursion is n deep. Space is O(log n) for the stack on average.',
      follow: [
        ['How do you avoid the worst case?', 'Random pivot, median-of-three, or switch to heapsort when depth exceeds 2 log n (introsort).'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is merge sort stable and what does that cost you?',
      a: 'When the two fronts are equal the merge takes the left one first, so equal items keep their original order. The cost is O(n) auxiliary memory for arrays, because merging in place efficiently is complicated. For linked lists merge sort needs no extra array and is the sort of choice.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Find the k-th largest element without sorting everything.',
      a: 'Quickselect: partition around a pivot; if the pivot lands at index n - k you are done, otherwise recurse into only the side that contains it. Expected O(n) (n + n/2 + n/4 + ...), worst case O(n^2) unless the pivot is randomised or chosen by median of medians (O(n) worst case). The alternative is a min-heap of size k: O(n log k) time, O(k) space, and it works on streams.',
      follow: [
        ['When would you prefer the heap?', 'Streaming data, small k, or when you cannot modify or hold the whole array.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'How do you sort a file much larger than memory?',
      a: 'External merge sort. Read chunks that fit in memory, sort each (any in-memory sort), write them to disk as sorted runs. Then do a k-way merge of the runs using a min-heap of the current front of each run, reading each run through a buffer. With M memory and N data, the number of passes is about log_{M/B}(N/M) where B is the block size; usually one merge pass is enough. Sequential I/O is the key cost, so favour large buffers.',
      follow: [],
    },
  ],
};
