/* Interview depth: Heap patterns. */
window.DEPTH = {
  thesis:
    'Heap problems fall into a few shapes: keep the k best of a stream (a heap of size k whose root is the weakest winner), repeatedly take the next smallest from several sources (k-way merge, scheduling, Dijkstra), and track a middle value with two heaps. The skill is choosing the heap direction and size so that the root is exactly the value you need to compare against.',
  why: [
    ['Top k needs the opposite heap', 'For the k largest keep a min-heap. Its root is the smallest of the current winners, the single value a newcomer must beat. A max-heap of everything would work but costs O(n log n) and O(n) space.'],
    ['Bounded size gives the log k', 'With a heap capped at k, every operation is O(log k). For k much smaller than n, that is close to linear overall.'],
    ['Streaming', 'The size-k heap needs only the current item, so it handles inputs too large for memory.'],
    ['Two heaps split a distribution', 'A max-heap for the lower half and a min-heap for the upper half expose the median at the roots while supporting inserts in O(log n).'],
  ],
  edges: [
    ['k larger than n', 'The heap never fills, and the answer is the whole input. Clamp or handle explicitly.'],
    ['Ties at the boundary', 'Equal values at the kth position: decide whether any of them is acceptable, or break ties by an index.'],
    ['Quickselect versus heap', 'For a one-off kth element in memory, quickselect is O(n) average. The heap wins when data streams or k is tiny and the structure is reused.'],
    ['Max-heap via negation with other types', 'Negating works for numbers only. For strings or objects, use a wrapper class with reversed comparison.'],
  ],
  cost: [
    ['top k, size-k heap', 'O(n log k) time, O(k) space.'],
    ['top k, sort then slice', 'O(n log n) time, O(n) space.'],
    ['quickselect', 'O(n) average, O(n^2) worst case, mutates the input.'],
    ['median with two heaps', 'O(log n) insert, O(1) median.'],
    ['k-way merge', 'O(N log k).'],
  ],
  internals: [
    ['`heapreplace` versus pop then push', 'It replaces the root and sifts down in one pass, avoiding a second sift. For top-k it halves the work. `heappushpop` is the push-first variant, useful when the new value might be the one that comes straight back out.'],
    ['`nlargest` is a heap algorithm', 'For small k relative to n, `heapq.nlargest(k, it)` uses a size-k heap, and falls back to sorting when k is large. Its cost is O(n log k).'],
    ['Why bottom-up beats push-n-times', 'Pushing sifts up from the bottom, which is the long path for most nodes. Heapify sifts down, and most nodes are near the leaves, so the paths are short.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Find the k largest elements of an array. Compare approaches.',
      a: 'Three options. Sort and slice: O(n log n). Size-k min-heap: push each item; once the heap exceeds k, pop the smallest. At the end it holds the k largest. O(n log k) time, O(k) space. Quickselect partitions around a pivot to find the kth in O(n) average, but mutates the array and has an O(n^2) worst case. For a stream or small k, I pick the heap; for a one-off over an array in memory, quickselect.',
      follow: [
        ['Why a min-heap for the largest?', 'The root is the smallest of the current k, i.e. the one to evict when a bigger value arrives. Checking a new value against the root is O(1).'],
        ['What is the kth largest, not the k largest?', 'Same heap: the answer is the root once all items have been processed.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is `heapq.nlargest(k, data)` not the same as `sorted(data)[-k:]`?',
      a: 'It returns the same values in descending order but avoids a full sort. For small k it keeps a size-k heap, costing O(n log k) time and O(k) space, whereas sorting is O(n log n) and copies the data. When k is close to n the library falls back to sorting because a heap offers no gain.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Design a structure to maintain the median of a stream.',
      a: 'Two heaps: a max-heap `lo` for the smaller half and a min-heap `hi` for the larger half. Invariants: every value in `lo` is at most every value in `hi`, and sizes differ by at most one (let `lo` hold the extra). Insert: push into `lo`, move `lo`\'s max into `hi`, then if `hi` is bigger than `lo` move its min back. Median: the root of `lo` if sizes differ, otherwise the mean of both roots. Insert O(log n), median O(1), space O(n).',
      follow: [
        ['How would you support deleting arbitrary values?', 'Lazy deletion with counts, tracking the logical size of each heap and cleaning the tops when stale. Or use an ordered structure such as a balanced tree or two multisets.'],
        ['What if values are integers in a small range?', 'Use a counting array or a Fenwick tree and find the median by rank in O(log range). It also supports deletes directly.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Schedule tasks with a cooldown, or find the least number of intervals (task scheduler). How do heaps help?',
      a: 'The greedy rule is to run the task with the most remaining occurrences that is not cooling down. Keep available tasks in a max-heap by count, and put just-run tasks in a cooldown queue with the time they become available again. At each tick, release any task whose cooldown finished back into the heap, run the best one, and decrement its count. The heap makes "best available" O(log m) for m distinct tasks. A counting formula (max count and the number of tasks sharing it) gives the answer in O(n) without simulating, but the heap is the general pattern whenever priorities change.',
      follow: [
        ['Why is greedy correct here?', 'Delaying a frequent task can only lengthen the schedule, because the most frequent task determines the minimum number of slots. An exchange argument shows that running the largest available count first never loses.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'You need the top 100 items out of 10 billion across 1000 machines. How do you do it?',
      a: 'Each machine computes its own local top 100 with a size-100 min-heap in one pass over its data, in O(n_local log 100). Send those 100 candidates, 1000 x 100 = 100,000 values, to a coordinator and run one more top-100 merge. This is correct because any global top-100 item must be in its own machine\'s top 100. The network cost is tiny. Complications: ties and the same key appearing on several machines (then you need counts aggregated first, which makes it a different and harder problem: count-min sketch or a shuffle by key); and stragglers or failures, handled by retries, since the local computation is idempotent.',
      follow: [
        ['What if the score of an item is the sum across machines?', 'Local top-k is no longer enough, since an item can be small everywhere yet large in total. Aggregate by key first (shuffle/partition by hash), then take top-k per partition, then merge.'],
      ],
    },
  ],
};
