/* Interview depth: Hashing. */
window.DEPTH = {
  thesis:
    'A hash table turns a key into an array index with a hash function, so lookup, insert and delete are O(1) on average. Everything interviewers probe follows from three facts: equal keys must hash equal, collisions are unavoidable and must be resolved, and the table must resize as it fills. Worst case is O(n), and knowing when that happens is the senior-level signal.',
  why: [
    ['The hash-equality contract', 'If `a == b` then `hash(a) == hash(b)`. The reverse is not required: different keys may share a hash (a collision). Break the contract and lookups silently miss.'],
    ['Why keys must be immutable (or at least stable)', 'The slot is chosen from the hash at insertion time. If the key later mutates and its hash changes, the entry sits in the wrong slot and cannot be found. Python forbids mutable built-ins as keys for this reason.'],
    ['Collisions are normal, not rare', 'The birthday paradox means collisions appear long before the table is full. A good design keeps chains or probe sequences short through a decent hash, a low load factor and resizing.'],
    ['Average versus worst case', 'Average O(1) assumes a well-spread hash. Adversarial or poor hashes push everything into one bucket and give O(n). That is why Python randomises string hashes per process (hash randomisation) to stop hash-flooding denial of service.'],
  ],
  edges: [
    ['Hash randomisation', '`hash("abc")` differs between runs unless `PYTHONHASHSEED` is set. Never persist hashes or rely on set/dict ordering derived from them (dict order is insertion order, but sets are not ordered).'],
    ['`hash(-1) == hash(-2)`', 'In CPython `-1` is reserved as an error code, so `hash(-1)` returns `-2`. A harmless collision, and a favourite trivia question.'],
    ['`1 == 1.0 == True`', 'They hash equal and compare equal, so `{1: "a", 1.0: "b", True: "c"}` has one key.'],
    ['NaN', '`nan != nan`, so a NaN key can be inserted repeatedly and never found by a fresh `float("nan")`. Same object lookups work through the identity shortcut.'],
    ['Defining `__eq__` only', 'A class that defines `__eq__` without `__hash__` becomes unhashable (hash set to `None`). Define both, and base `__hash__` on the same fields as `__eq__`.'],
    ['Mutable fields in `__hash__`', 'If hash uses fields that change after insertion, the object is lost in its container. Use frozen dataclasses or hash only immutable fields.'],
    ['Integer keys', 'Small ints hash to themselves, so keys that are multiples of the table size collide heavily in a naive modulo scheme. Real tables mix bits or use perturbation.'],
    ['Tuple keys', 'Hash combines the item hashes, so `(1, 2)` and `(2, 1)` differ. A tuple with an unhashable item raises on `hash`.'],
    ['Large tables and memory', 'Tables keep spare slots by design, so a dict of 1 million small items is much larger than the raw data (tens of MB).'],
  ],
  cost: [
    ['lookup, insert, delete (average)', 'O(1)', 'Hash, index, compare.'],
    ['same (worst case)', 'O(n)', 'All keys in one bucket or one probe chain.'],
    ['resize', 'O(n), amortised O(1)', 'Triggered at roughly 2/3 full in CPython; reinserts all entries.'],
    ['hash(str)', 'O(len)', 'Computed once and cached on the string object.'],
    ['hash(tuple)', 'O(len)', 'Recomputed each time (not cached).'],
    ['iteration', 'O(capacity)', 'Skips empty slots, which matters for a large table that has shrunk by deletions.'],
    ['memory', '~ 1.5 to 3x data', 'Load factor and spare capacity.'],
  ],
  internals: [
    ['Open addressing in CPython', 'Python dicts and sets use open addressing: on a collision, probe other slots using a perturbation of the hash rather than chaining. Probing keeps data in one array (good locality) but needs a low load factor and tombstones for deleted slots.'],
    ['Chaining versus open addressing', 'Chaining (Java `HashMap`, many textbook tables) stores a list or tree per bucket: simple deletes, tolerates high load, extra pointers. Open addressing is compact and cache-friendly but degrades sharply near full and needs tombstones. Java 8 converts long chains into balanced trees to cap the worst case at O(log n).'],
    ['Compact dict layout', 'Since 3.6 the dict keeps a small sparse index table pointing into a dense entries array of (hash, key, value). That saves memory (about 20 to 25 percent) and gives insertion order for free.'],
    ['Resize policy', 'The table grows when about 2/3 of slots are used, to a size that depends on the number of items, and rebuilds every entry. Because growth is proportional, inserts are amortised O(1).'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'How does a hash table work, and why is lookup O(1)?',
      a: 'A hash function maps the key to an integer, which is reduced to an index into an array of slots. Lookup computes the hash, jumps to that slot and compares keys, a constant number of steps when collisions are rare. Collisions are handled by chaining or probing, and the table resizes to keep the load factor low, so the average work per operation stays constant.',
      follow: [
        ['What makes a good hash function?', 'Deterministic, fast, uniform (spreads keys evenly), and consistent with equality. For security, also resistant to crafted collisions, which is why Python seeds string hashing randomly.'],
        ['When does lookup become O(n)?', 'When many keys collide: a bad hash function, adversarial input, or an overloaded table that never resized. All keys end in one chain or probe sequence.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why can a list not be a dict key but a tuple can?',
      a: 'Keys need a stable hash consistent with equality. A list is mutable, so its contents and thus hash could change after insertion, orphaning the entry. Tuples are immutable, so their hash is fixed, provided their items are hashable too.',
      follow: [
        ['How would you use a list-like value as a key?', 'Convert to a tuple, or a `frozenset` if order does not matter, or make an immutable wrapper class with consistent `__eq__` and `__hash__`.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Compare chaining and open addressing. Which would you pick and why?',
      a: 'Chaining is simple, deletion is easy and it degrades gracefully as load exceeds 1, at the cost of pointers and poorer locality. Open addressing keeps everything in one array, so it is faster and smaller at moderate load, but clustering and tombstones hurt as it fills, and load must stay below about 0.7. For a general-purpose in-memory table with small keys I would pick open addressing (as Python and many modern tables like Swiss tables do); for a table with unpredictable load, large values or concurrent access, chaining is easier to reason about.',
      follow: [
        ['What are tombstones?', 'Markers left on deletion so probe sequences for other keys do not stop early at an empty slot. They are cleaned on resize; many deletions without inserts can slow lookups.'],
        ['How does the Java HashMap cap the worst case?', 'When a bucket chain exceeds 8 entries (and the table is large enough) it becomes a balanced tree, bounding lookups to O(log n) even under adversarial collisions.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Design an LRU cache with O(1) get and put.',
      a: 'Combine a hash map from key to node with a doubly linked list ordered by recency. On `get`, find the node via the map, move it to the front, return the value. On `put`, update and move to front, or insert a new node at the front and, if over capacity, remove the tail node and its map entry. In Python, `collections.OrderedDict` with `move_to_end` and `popitem(last=False)` does it in a few lines; `functools.lru_cache` is the built-in for functions.',
      follow: [
        ['Why a doubly linked list rather than a list or deque?', 'Removing an arbitrary node must be O(1), which needs both neighbours (prev and next) and a handle to the node, which the map supplies. A list or deque would need an O(n) search.'],
        ['How would you make it thread-safe?', 'A single lock around operations is simplest. For throughput, shard the cache by key hash with a lock per shard, accepting approximate global LRU order.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'A hash map service is slowing down under certain traffic. How do you check for hash collisions attacks, and how do you defend?',
      a: 'Symptoms: CPU rises with request size, latency tail grows, profiles show time in lookup and key comparison, and request parameters contain many keys crafted to collide. Defences: randomised (keyed) hash functions such as SipHash, limits on number of keys or parameters per request, tree-based buckets, and rate limiting. In Python, hash randomisation is on by default; check it was not disabled with `PYTHONHASHSEED=0`, and avoid exposing your own weak hash for untrusted keys.',
      follow: [
        ['How would you test it?', 'Generate many keys that collide under the table\'s hash (feasible if the hash is unkeyed), send them, and plot lookup time versus count. Quadratic growth confirms the vulnerability.'],
      ],
    },
  ],
};
