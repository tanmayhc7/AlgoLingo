/* Interview depth: Heaps. */
window.DEPTH = {
  thesis:
    'A heap is the cheapest structure that answers one question repeatedly: what is the smallest (or largest) item right now? It does not sort. It keeps only the parent/child order, which is just enough to find the extreme in O(1) and repair after a change in O(log n). Because the tree is complete, it fits in an array with no pointers, so it is also compact and cache-friendly.',
  why: [
    ['A priority queue without full sorting', 'Sorting costs O(n log n) up front and O(n) per insert. A heap gives O(log n) per insert and per removal of the minimum, which is what schedulers, Dijkstra and event simulations need.'],
    ['Complete tree means array storage', 'Filling levels left to right keeps the height at floor(log2 n) and lets parent and child positions be computed: children of i are 2i+1 and 2i+2 (0-based), parent is (i-1)//2. No node objects and no pointers.'],
    ['Repair is local', 'A push changes one leaf, so only its ancestors can be wrong. A pop changes the root, so only one downward path can be wrong. Each fix walks one path of length at most log2 n.'],
    ['It is the right tool for partial order', 'If you need only the top k, or only the next one repeatedly, a heap beats a full sort.'],
  ],
  edges: [
    ['Empty heap', '`heappop` on an empty list raises `IndexError`; `h[0]` does too. Check before reading.'],
    ['Max-heap in Python', '`heapq` is min-only. Push negated numbers, or wrap items in a class with reversed `__lt__`.'],
    ['Ties in tuples', '`(priority, item)` compares `item` when priorities are equal, and that fails if items are not comparable. Use `(priority, counter, item)`.'],
    ['Mutating an item in the heap', 'Changing a priority in place breaks the invariant silently. Push a new entry and skip stale ones on pop (lazy deletion), or use an indexed heap that supports decrease-key.'],
    ['Searching or deleting an arbitrary item', 'A heap has no search: O(n). Deleting an arbitrary element needs its index, then swap with last and sift in one direction.'],
  ],
  cost: [
    ['peek min', 'O(1).'],
    ['push / pop', 'O(log n) each. Worst case equals the height.'],
    ['heapify (build from n items)', 'O(n), not O(n log n).'],
    ['heapsort', 'O(n log n) time and O(1) extra space, but it is not stable.'],
    ['search for a value', 'O(n): the heap gives no ordering across branches.'],
  ],
  internals: [
    ['`heapq` is a module of functions on a list', 'It has no heap class. The list is the heap, and the functions maintain the invariant. That is why `h[0]` is the minimum and why you must never `sort` or `append` to it directly.'],
    ['Why pop moves the last item to the root', 'It keeps the shape complete in O(1). The new root is then pushed down along one path, swapping with the smaller child. Python\'s implementation actually sifts the hole to a leaf first and then sifts up, saving comparisons.'],
    ['Why heapify is O(n)', 'Half the nodes are leaves and need no work. A quarter sift down at most one level, an eighth at most two, and so on. The sum n/4 + 2 * n/8 + 3 * n/16 + ... converges to n.'],
    ['Cache and memory', 'An array heap is contiguous, which is why it beats pointer-based priority queues in practice despite the same asymptotics. Wider d-ary heaps lower the height and improve locality at the cost of more comparisons per level.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What is a heap, and why is push O(log n)?',
      a: 'A heap is a complete binary tree stored in an array in which every parent is no larger than its children (min-heap). Push appends at the end, which keeps the tree complete, then sifts up: swap with the parent while smaller. The new value travels along a single leaf-to-root path, and a complete tree with n nodes has height floor(log2 n), so at most that many swaps happen.',
      follow: [
        ['Is the array sorted?', 'No. Only parents are ordered against children. Siblings and cousins have no relationship. Only index 0 is guaranteed to be the minimum.'],
        ['What is the average cost of push?', 'For random input it is O(1) on average, because most new values stay near the bottom. The worst case is O(log n), which is what you quote.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is building a heap with heapify O(n) when each sift down can cost O(log n)?',
      a: 'Most nodes are near the bottom, and sift down cost is bounded by the height of the node, not the height of the tree. About n/2 nodes are leaves (cost 0), n/4 have height 1, n/8 have height 2, and so on. The total is the sum of (height x number of nodes at that height), which converges to O(n). Pushing n items one at a time costs O(n log n) in the worst case, because each sift up can run from the bottom.',
      follow: [
        ['Why must heapify run from the last internal node toward the root?', 'Sift down assumes both subtrees are already heaps. Going bottom-up guarantees that when you process a node, its children are already valid heaps.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Implement a priority queue that supports changing an item\'s priority.',
      a: 'Two approaches. Lazy deletion: push a new entry `(new_priority, counter, item)` and mark the old one stale (keep a dict from item to its current entry). On pop, skip entries that are stale. Simple, but the heap grows by one entry per update. Indexed heap: keep a map from item to its array position, update it on every swap, and implement decrease-key as change then sift up (or sift down for an increase). Each update is O(log n) and the heap does not grow. Dijkstra implementations in interviews usually take the lazy route.',
      follow: [
        ['What does lazy deletion cost?', 'Space grows with the number of updates (up to the number of edges in Dijkstra), and pop may discard many stale entries, but the amortised cost per entry remains O(log n).'],
        ['When does decrease-key actually matter?', 'Fibonacci heaps give O(1) amortised decrease-key and a better theoretical Dijkstra bound, but constants make binary heaps faster in practice.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Merge k sorted lists, and explain the complexity.',
      a: 'Put the head of each list into a min-heap as `(value, list_index, position)` or `(value, counter, node)`. Pop the smallest, append it to the output, and push the next element from the same list. Each of the N total elements is pushed and popped once, and the heap holds at most k items, so the cost is O(N log k) time and O(k) extra space. A divide-and-conquer pairwise merge has the same bound. `heapq.merge` does this lazily.',
      follow: [
        ['Why not just concatenate and sort?', 'That is O(N log N), ignoring that the inputs are already sorted. The heap uses the structure to get log k instead of log N, which matters when k is small.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'A job scheduler needs millions of timers with insert, cancel and "next to fire". What would you use?',
      a: 'A binary heap gives O(log n) insert and O(1) peek, but cancellation requires an index or lazy deletion, and millions of pointer-chasing sifts are expensive. For timers with bounded resolution a hierarchical timing wheel gives O(1) insert and cancel by bucketing expiries, which is what the Linux kernel and many network stacks use. Choose by the workload: far-future timers with arbitrary precision favour a heap; dense, short, frequently cancelled timers (TCP retransmits) favour a wheel. For multiple threads, shard per core to avoid one contended lock. I would measure the real distribution of delays before choosing.',
      follow: [
        ['What is the downside of a timing wheel?', 'Resolution is quantised to the tick, and long timers need cascading levels or an overflow list.'],
      ],
    },
  ],
};
