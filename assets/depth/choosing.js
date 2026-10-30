/* Interview depth: Choosing the right structure. */
window.DEPTH = {
  thesis:
    'Choosing a data structure is choosing which operations are cheap. Start from the operations your algorithm performs most (lookup, insert at end, pop from front, min, range query, ordering) and pick the structure that makes those O(1) or O(log n). In an interview, say the operations and the cost out loud before naming the structure.',
  why: [
    ['Operations first, names second', 'List the 3 or 4 operations the solution needs, then match them to costs. "I need membership and insert" leads to a set or dict; "I need the smallest repeatedly" leads to a heap; "I need FIFO" leads to a deque.'],
    ['There is always a trade-off', 'Time versus space, average versus worst case, simplicity versus speed, ordering versus hashing. Naming the trade-off you accepted is what interviewers listen for.'],
    ['Constraints select the structure', 'n up to 1e5 allows O(n log n); n up to 1e9 needs O(log n) or O(1). Memory limits may rule out hash tables for dense integer ranges. Read the limits before choosing.'],
    ['Start simple, then optimise', 'State the brute force and its cost, then identify the repeated work and which structure removes it. This shows reasoning, not just recall.'],
  ],
  edges: [
    ['Need order and fast membership', 'A dict (insertion order) or a sorted list with `bisect`. A set alone does not order.'],
    ['Need sorted order with fast insert and delete', 'Python has no built-in balanced tree. Use `sortedcontainers.SortedList` if allowed, or a heap when you only need min or max, or bisect with `insort` for small n.'],
    ['Need min and max both', 'Two heaps, a sorted structure, or a deque-based monotonic window; a single heap gives one end only.'],
    ['Need range queries', 'Prefix sums for static data, a Fenwick tree or segment tree for updates, sorted list with bisect for ordered ranges.'],
    ['Need to remove arbitrary items', 'Set or dict (O(1)); a list is O(n); a heap needs lazy deletion.'],
    ['Need counting with small integer keys', 'A list or `array` indexed by value beats a dict (constant factors and memory). Use 26 slots for lowercase letters.'],
    ['Need stable indexing and appends', 'List. Not deque (O(n) middle index), not linked list (no random access).'],
    ['Unhashable items', 'Convert to tuple or frozenset for set and dict use, or use a list with linear search for small n.'],
    ['Mutable keys', 'Never. Use immutable representations; changing them breaks the table.'],
    ['Tiny inputs', 'A list scan beats a dict for a handful of items; do not over-engineer.'],
  ],
  cost: [
    ['list: index / append / pop end', 'O(1)', ''],
    ['list: insert front / pop front / search', 'O(n)', ''],
    ['deque: ends', 'O(1)', 'Middle index O(n).'],
    ['dict / set: lookup, insert, delete', 'O(1) avg', 'No order guarantees for sets.'],
    ['heap: push / pop min', 'O(log n)', 'Peek O(1).'],
    ['sorted list + bisect: search', 'O(log n)', 'Insert O(n).'],
    ['balanced tree (not built in)', 'O(log n) all', 'Ordered iteration and range queries.'],
    ['Counter: count / update', 'O(1) avg', ''],
    ['prefix sums: range sum', 'O(1)', 'O(n) build; updates O(n).'],
    ['Fenwick / segment tree', 'O(log n)', 'Point update and range query.'],
  ],
  internals: [
    ['Why dict beats list for lookup but loses on memory', 'The hash table spends spare capacity and stores hashes to make lookup constant. A list stores only pointers. For small or dense-integer data, the list or an array is more compact and often faster.'],
    ['Cache effects shift the crossover', 'Linear scans of contiguous memory are fast; for n below a few dozen a scan can beat a hash lookup. Asymptotics tell you what wins at scale; measurement tells you where the crossover is.'],
    ['Python-level overhead', 'Each operation costs interpreter time on top of the structure\'s big-O. Prefer built-in operations (`sum`, `in`, `sorted`, set algebra) that run in C over hand-written loops.'],
    ['Heap versus sorted list for top-k', 'A size-k heap costs O(n log k) with O(k) space and works on streams. Sorting costs O(n log n) and needs all data. For k near n, sort.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'How do you decide between a list, set and dict for a problem?',
      a: 'Ask what operations dominate. Ordered sequence with positional access and appends: list. Membership or uniqueness: set. Association from key to value, or counting and grouping: dict. If I need both order and fast membership, a dict (ordered) or a list plus a set. Then I check hashability of the data and memory limits.',
      follow: [
        ['Give a case where a list beats a set.', 'Small collections, order matters, items unhashable, or you iterate far more than you test membership. Also memory-tight cases.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'You need a queue. Which structure and what goes wrong with the obvious one?',
      a: '`collections.deque`. The obvious list with `pop(0)` shifts all items each time, making each pop O(n) and a BFS quadratic. `queue.Queue` is for thread-safe producer-consumer use and carries locking overhead. `deque(maxlen=n)` gives a bounded ring buffer.',
      follow: [
        ['What about a priority queue?', '`heapq` on a list, with tuples `(priority, tie_breaker, item)`; for threads, `queue.PriorityQueue`.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Design a data structure with insert, delete and get-random-element all in O(1) average.',
      a: 'Keep a list of items and a dict from item to its index in the list. Insert: append to the list and record the index. Delete: look up the index, swap the last item into that slot, update the moved item\'s index in the dict, pop the last. Get random: `random.choice(list)`. All O(1) average. Edge cases: deleting the last item (swap with itself), duplicates (decide whether allowed; for multisets use a dict of sets of indices), and empty structure on random.',
      follow: [
        ['Why not just a set?', '`random.choice` needs an indexable sequence; sets are not indexable, and converting is O(n).'],
        ['How would duplicates change it?', 'Map each value to a set of its indices in the list; on delete pick any index, swap with the last, update both index sets.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Given n up to 10^5 and q up to 10^5 range-sum queries with point updates, what structure?',
      a: 'Naive scanning is O(nq) = 10^10, too slow. Prefix sums give O(1) queries but O(n) updates, still 10^10 worst case. A Fenwick (binary indexed) tree gives O(log n) for both, about 1.7 million operations, and is short to code; a segment tree gives the same and generalises to min, max and range updates with lazy propagation. If there are no updates, prefix sums suffice.',
      follow: [
        ['When do you prefer a segment tree over a Fenwick tree?', 'When the operation is not invertible (min, max, gcd) or you need range updates (lazy propagation). Fenwick relies on subtraction for range queries.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'An interviewer says: "Your solution uses a dict but memory is the constraint." What do you do?',
      a: 'Quantify first: items times roughly 100 bytes for dict entries plus key and value objects. Then reduce: dense integer keys become a list, `array` or bitset; string keys can be interned or hashed to fixed-size ints (accepting collisions or checking against storage); use `__slots__` objects or tuples instead of dict-per-record; process in chunks or sort and merge on disk; use probabilistic structures (Bloom filter, HyperLogLog, Count-Min) if approximate answers are acceptable. State what accuracy or latency you give up.',
      follow: [
        ['How do you estimate memory for a dict of 10 million int-to-int pairs?', 'About 10M times (entry 24 bytes + index 4 to 8 bytes with spare capacity, roughly 40 to 50 bytes) plus int objects (28 to 32 bytes each, for both key and value) which is over 1 GB; NumPy arrays would take 160 MB.'],
      ],
    },
  ],
};
