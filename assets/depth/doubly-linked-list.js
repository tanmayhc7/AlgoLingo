/* Interview depth: Doubly linked lists and LRU. */
window.DEPTH = {
  thesis:
    'A doubly linked list buys O(1) removal of a node you already hold, at the price of a second pointer per node and twice as many pointer updates to keep consistent. The famous use is the LRU cache: a hash map finds a node in O(1) and the list moves it to the front or evicts the back in O(1). Interviews test whether you can keep the map and the list in step and handle the ends cleanly.',
  why: [
    ['Two pointers, one invariant', 'For every node, `node.next.prev is node` and `node.prev.next is node`. Every insert and delete must update both directions, and most bugs are one forgotten line that breaks this symmetry.'],
    ['Sentinels remove the ends', 'With a dummy head and a dummy tail, every real node has both neighbours, so insert and remove are four assignments with no `if node.prev` or `if node.next` branches. LRU code with sentinels is much shorter and safer.'],
    ['Map plus list is a pattern', 'A hash map gives O(1) lookup by key; a list gives O(1) ordering updates by node. Storing the node (not the value) in the map is what makes the list operation O(1). The same combination appears in LFU caches, ordered sets and sliding-window structures.'],
    ['Why not just a dict?', 'A Python dict preserves insertion order and `OrderedDict.move_to_end` already does exactly this. In interviews they ask you to build it to see whether you understand what the library does for you.'],
  ],
  edges: [
    ['Removing the only node', 'With sentinels it becomes head sentinel to tail sentinel. Without them both ends must become `None`.'],
    ['Removing the head or tail', 'Update the `head` or `tail` reference. Forgetting this leaves a dangling pointer to a removed node.'],
    ['Capacity of zero or one', 'Capacity 0 stores nothing; capacity 1 evicts on every new key. Test both.'],
    ['`put` of an existing key', 'Update the value and move the node to the front. Do not create a duplicate node and do not evict.'],
    ['Evicting', 'Remove the node from the list and delete its key from the map. Removing only one of them leaks entries or leaves ghost keys.'],
    ['`get` of a missing key', 'Return the sentinel value (-1 or None) without touching the order.'],
    ['Node must store its key', 'When you evict the tail you only have the node, and you need its key to delete the map entry.'],
    ['Move to front when already at front', 'Harmless if your unlink-then-insert is correct, but a common place for self-link bugs when you skip the unlink.'],
    ['Thread safety', 'Even a read (`get`) mutates order, so a read-write lock is not enough. Use a mutex, or shard the cache.'],
    ['C: ownership', 'Decide who frees the node: the list on eviction. Free the value as well if the cache owns it, and never free a node still in the map.'],
    ['Python: reference cycles', 'prev and next create two-node cycles, so removed nodes are freed by the cycle collector, not by refcount, unless you clear their pointers (`node.prev = node.next = None`) when removing. Good hygiene in long-running caches.'],
  ],
  cost: [
    ['insert at head or tail (with ends known)', 'O(1)', 'Four pointer writes.'],
    ['remove a held node', 'O(1)', 'Four pointer writes, no search.'],
    ['find by value', 'O(n)', 'Unless a map points at the node.'],
    ['LRU get / put', 'O(1)', 'Hash lookup plus list relink.'],
    ['traverse backwards', 'O(n)', 'The reason to have `prev`.'],
    ['memory per node (C)', '24 bytes + malloc overhead', 'Value, prev, next.'],
    ['memory per node (Python)', '~64 to 72 bytes + value', 'Larger than singly linked; use `__slots__`.'],
    ['OrderedDict.move_to_end', 'O(1)', 'Backed by a doubly linked list in C.'],
  ],
  internals: [
    ['`OrderedDict` is this structure', 'CPython\'s C implementation keeps a dict for lookup plus a doubly linked list of key nodes. `move_to_end(key)` and `popitem(last=False)` are the LRU operations. A pure-Python reimplementation is slower and uses more memory, which is why you only write it in interviews.'],
    ['`functools.lru_cache`', 'Implemented in C with a circular doubly linked list and a dict, protected by the GIL. It is faster than any pure-Python LRU, and `cache_info()` shows hits and misses.'],
    ['XOR linked lists', 'A curiosity: store `prev XOR next` in one field, saving a pointer per node, and traverse in either direction if you know the neighbour you came from. It defeats garbage collectors and debuggers, so it appears only in constrained C.'],
    ['Intrusive lists in kernels', 'Linux embeds `struct list_head` inside the objects themselves, so one allocation per object, O(1) membership in several lists at once, and no separate node allocation. `container_of` recovers the object from the link.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Why does a doubly linked list allow O(1) deletion of a given node, and a singly linked list does not?',
      a: 'To unlink a node you must change the `next` of the node before it. A doubly linked node stores `prev`, so you reach the predecessor directly: `node.prev.next = node.next; node.next.prev = node.prev`. A singly linked node has no way back, so you would walk from the head to find the predecessor, which is O(n). The cost is an extra pointer per node and the discipline to keep both directions consistent.',
      follow: [
        ['What changes at the ends?', 'The head has no `prev` and the tail has no `next`, so the assignments must be guarded, and the list\'s `head` or `tail` reference updated. Sentinel nodes make the same four lines work everywhere.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Design an LRU cache with O(1) `get` and `put`.',
      a: 'A dict from key to node, plus a doubly linked list with dummy head and tail ordered from most to least recently used. `get`: look up the node, move it right after the head, return its value. `put`: if the key exists, update and move to front; otherwise create a node at the front, add it to the dict, and if size exceeds capacity remove the node before the tail and delete its key from the dict. All steps are O(1). The node stores its key so eviction can delete the dict entry.',
      follow: [
        ['Write the helper functions.', '`remove(node): node.prev.next = node.next; node.next.prev = node.prev`. `add_front(node): node.next = head.next; node.prev = head; head.next.prev = node; head.next = node`. Both are four lines; `move_to_front = remove then add_front`.'],
        ['How would you do it in Python in five lines?', '`OrderedDict`: `get` does `move_to_end(key)` and returns the value; `put` sets the value, `move_to_end`, and `popitem(last=False)` if over capacity.'],
        ['What if keys expire after a time limit?', 'Add a timestamp per node and check on `get`; also evict lazily. Or keep a second structure (a heap or timing wheel) to expire proactively. State the trade-off between extra memory and stale entries.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Extend the LRU cache to an LFU cache (evict the least frequently used, breaking ties by recency) with O(1) operations.',
      a: 'Keep a dict `key -> node`, where each node stores key, value and a frequency; a dict `freq -> doubly linked list` of nodes with that frequency (ordered by recency); and a variable `min_freq`. On access, unlink the node from its frequency list, increase its frequency, append it to the next list, and if the old list is now empty and equals `min_freq`, increment `min_freq`. On insertion of a new key (after evicting from the `min_freq` list\'s least recent end if full) set `min_freq = 1`. Everything is O(1) because each step is a dict lookup or a doubly linked relink.',
      follow: [
        ['Why do you need a list per frequency instead of one sorted structure?', 'A heap or tree would give O(log n). Because frequency only ever increases by one, moving a node to the neighbouring frequency bucket is a constant-time relink.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Your Python LRU cache leaks memory under load even though capacity is bounded. Why might that be?',
      a: 'Evicted nodes still reference each other (`prev` and `next` form cycles), so reference counting alone cannot free them, and they wait for the cyclic garbage collector, which runs based on allocation thresholds and can be slow to catch up when you churn millions of nodes. Fixes: clear `node.prev` and `node.next` (and the value) when removing, use `__slots__`, use `weakref` for one direction, or use `OrderedDict`. Also check that the dict entry is deleted on eviction and that values are not retained elsewhere (callers, logs, closures).',
      follow: [
        ['How would you confirm it?', 'Use `gc.get_stats()` and `gc.get_objects()` counts by type, `tracemalloc` snapshots before and after a load run, and look for growth in `Node` instances relative to the dict size.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Make the LRU cache scale across many threads.',
      a: 'A single lock is correct but serialises everything, and `get` mutates order so even reads contend. Options: shard the cache into N independent LRUs by key hash, each with its own lock, accepting approximate global LRU order; buffer recency updates (record accesses in a thread-local or lock-free ring and apply them in batches, as Caffeine does) so reads do not take the main lock; use a CLOCK or segmented policy that approximates LRU with a single reference bit per entry and no list manipulation on read; or use a concurrent hash map with per-entry atomics. I would measure first: a mutex-protected cache often handles hundreds of thousands of operations per second per shard, and most services never need more.',
      follow: [
        ['What do you give up with sharding?', 'Exact LRU. One shard can evict an item that is more recently used than items in another shard. Skewed key distributions can also make one shard hot.'],
        ['How do you avoid cache stampedes on a miss?', 'Coalesce concurrent loads for the same key (a "single flight" or per-key future), so one thread computes and the others wait for its result.'],
      ],
    },
  ],
};
