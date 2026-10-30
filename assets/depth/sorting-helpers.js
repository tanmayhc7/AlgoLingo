/* Interview depth: Sorting helpers. */
window.DEPTH = {
  thesis:
    'Python gives you a stable O(n log n) sort, key functions, `bisect` for binary search on sorted lists, and `heapq` for priority queues. Interview fluency means choosing the right one for the access pattern: sort once and binary search many times, or keep a heap when you only need the smallest or largest k.',
  why: [
    ['Key functions beat comparators', '`key=` computes one sort value per item up front, so it is faster and simpler than a pairwise comparison function. Use `functools.cmp_to_key` only when the order cannot be expressed as a key.'],
    ['Stability enables multi-key sorts', 'Equal items keep their original order, so sorting by a secondary key first and the primary key second gives a combined order. It is also what makes `sorted(..., key=...)` predictable.'],
    ['Sorted data unlocks binary search', '`bisect` finds a position in O(log n) on a sorted list. Inserting is still O(n) because of shifting, so `insort` suits small or read-mostly data.'],
    ['A heap is a partial order', 'A heap guarantees only that the smallest item is at index 0. That is cheaper than a full sort when you need the top k or a running minimum: O(n log k) instead of O(n log n).'],
  ],
  edges: [
    ['`heapq` is a min-heap only', 'For a max-heap push negated values, or negated priorities in tuples. For non-numeric items, wrap or use a comparator class.'],
    ['Tuples in a heap', 'Ties compare the next tuple element; if that element is not comparable (dicts, custom objects) you get `TypeError`. Add a unique counter as a tie-breaker: `(priority, count, item)`.'],
    ['`bisect_left` versus `bisect_right`', 'Left returns the first index where `x` could be inserted keeping order (before equals); right inserts after equals. Use left for lower bound, right for upper bound or counting.'],
    ['`bisect` on unsorted data', 'No error, wrong answer. The list must already be sorted by the same key.'],
    ['`key` with `bisect`', 'Supported since 3.10 (`key=`). Before that you must bisect a separate list of keys.'],
    ['Sorting descending and stable', '`reverse=True` keeps stability (equal items keep original order), unlike reversing the sorted result.'],
    ['`sort()` returns None', 'Do not assign it. `sorted()` returns a new list.'],
    ['Mixed types', '`TypeError` comparing `int` and `str`. `None` is not orderable with numbers either.'],
    ['Floats and NaN', 'NaN breaks the total order, so sorting a list with NaN gives unpredictable placement. Filter or map NaN first.'],
    ['`heapify` is in place', 'It rearranges the list you pass, in O(n). Copy first if you need the original order.'],
    ['`nlargest`/`nsmallest` versus `sorted`', 'For k much smaller than n they use a heap and win; when k is close to n, `sorted(...)[:k]` is faster. For k = 1 use `max`/`min`.'],
  ],
  cost: [
    ['sorted, list.sort', 'O(n log n)', 'O(n) when nearly sorted. O(n) extra space.'],
    ['bisect_left / right', 'O(log n)', 'Comparisons only; no shifting.'],
    ['insort', 'O(n)', 'Search O(log n) plus list insert shifting.'],
    ['heapify', 'O(n)', 'Bottom-up build.'],
    ['heappush / heappop', 'O(log n)', ''],
    ['heap[0]', 'O(1)', 'Peek at the smallest.'],
    ['heapq.nlargest(k, xs)', 'O(n log k)', 'Keeps a heap of k.'],
    ['heapq.merge of m streams', 'O(N log m)', 'Lazy.'],
    ['removing an arbitrary item from a heap', 'O(n)', 'Find then re-heapify; use lazy deletion (mark and skip on pop) instead.'],
    ['updating priority', 'O(n) naive', 'Push a new entry and ignore stale ones on pop (the standard Dijkstra approach).'],
  ],
  internals: [
    ['Timsort', 'Detects natural runs, extends them to a minimum run length with insertion sort, then merges runs with galloping, maintaining invariants on run sizes so merges stay balanced. Worst case O(n log n), best case O(n), stable.'],
    ['Binary heap in a list', 'The heap is a complete binary tree laid out in a list: the children of index `i` are `2i + 1` and `2i + 2`, the parent is `(i - 1) // 2`. `heappush` appends and sifts up; `heappop` swaps the last item to the root and sifts down.'],
    ['Why `heapify` is O(n)', 'Sifting down from the last parent upward: most nodes are near the leaves and move very little. The sum of the work converges to O(n), not O(n log n).'],
    ['Decorate-sort-undecorate', 'What `key=` does internally: compute keys once, sort pairs, return the items. That is why a costly key runs n times, not n log n.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Find the k-th largest element in an array.',
      a: 'Options: sort and index, O(n log n). A min-heap of size k: push each item, pop when size exceeds k, answer is the heap top, O(n log k) time, O(k) space. Quickselect averages O(n) with O(1) extra space but is O(n^2) worst case without a good pivot (use randomisation or median-of-medians). In Python, `heapq.nlargest(k, xs)[-1]` is the idiomatic version.',
      follow: [
        ['Which would you choose for a stream?', 'The size-k min-heap, because it processes items one at a time with bounded memory.'],
        ['What are the edge cases?', 'k greater than n, k of 0 or negative, duplicates (clarify whether k-th largest counts distinct values), empty input.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Search for a value in a sorted array and return the insertion point.',
      a: '`bisect_left(xs, x)` returns the leftmost index where `x` fits; check `i < len(xs) and xs[i] == x` for presence. O(log n). If asked to write it by hand, use `lo, hi = 0, len(xs)` with a half-open interval, `mid = (lo + hi) // 2`, and move `lo = mid + 1` or `hi = mid` until `lo == hi`.',
      follow: [
        ['Why prefer half-open intervals?', 'They avoid off-by-one confusion and infinite loops: the invariant "answer is in [lo, hi]" is simple and the loop always shrinks.'],
        ['How would you search a rotated sorted array?', 'Binary search where at each step one half is sorted; decide which half the target can lie in using the sorted half\'s endpoints. O(log n), with care for duplicates, which can degrade to O(n).'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Merge k sorted lists.',
      a: 'Push the head of each list onto a min-heap as `(value, list_index, position)` and repeatedly pop the smallest, appending it and pushing the next element from that list. O(N log k) time for N total items, O(k) extra space. `heapq.merge(*lists)` does exactly this lazily. Alternative: divide and conquer, merging pairs, also O(N log k).',
      follow: [
        ['Why include the list index in the tuple?', 'To break ties without comparing the items themselves, and to know which list to advance. It also avoids comparing unorderable payloads.'],
        ['What if the lists are on disk?', 'This is the merge phase of external sort: read each in blocks, keep one buffer per input, and stream output.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain the running-median problem and a data-structure solution.',
      a: 'Keep two heaps: a max-heap of the lower half and a min-heap of the upper half, balanced so sizes differ by at most one. Insert into the correct heap, rebalance, and the median is the top of the larger heap or the mean of the two tops. O(log n) per insert, O(1) to read. In Python the max-heap stores negated values.',
      follow: [
        ['What if you also need deletions (sliding window median)?', 'Heaps cannot delete arbitrary items efficiently; use lazy deletion with counters, or a sorted container (`sortedcontainers.SortedList`, or a balanced tree) giving O(log n) insert, delete and index.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Your priority queue needs to support decrease-key (changing priorities), as in Dijkstra. How do you handle it with `heapq`?',
      a: '`heapq` has no decrease-key. Use lazy deletion: push a new `(priority, item)` entry whenever the priority improves, and when popping, skip entries that are stale (the priority is worse than the recorded best, or the item is already finalised). The heap may hold O(E) entries, so pops cost O(log E) = O(log V) and Dijkstra runs in O((V + E) log V). Alternatives: an indexed heap with a position map giving true O(log n) decrease-key, or a Fibonacci heap for theoretical O(1) amortised, which is rarely faster in practice.',
      follow: [
        ['Why is the indexed heap rarely used in Python?', 'It must be written in Python, which is slower than the C `heapq`, so lazy deletion is usually faster despite the larger heap.'],
      ],
    },
  ],
};
