/* Interview depth: Dicts. */
window.DEPTH = {
  thesis:
    'A dict maps hashable keys to values with O(1) average operations and, since Python 3.7, guaranteed insertion order. It is the most used structure in interview solutions (counting, grouping, memoising, indexing), so fluency means knowing the idioms (`get`, `setdefault`, `defaultdict`, `Counter`), the failure modes (`KeyError`, mutation during iteration) and the cost model.',
  why: [
    ['Dicts replace most searches', 'Any time you scan a list repeatedly to find something, ask whether a dict could index it once. Two-sum, anagram groups, first unique character and cache lookups are all "build an index, then query".'],
    ['Pick the missing-key strategy deliberately', '`d[k]` raises, `d.get(k, default)` returns a default without storing, `d.setdefault(k, default)` stores it, `defaultdict` creates on access, `Counter` counts. Each fits a different intent and each has a distinct bug if misused.'],
    ['Order is a feature now', 'Dicts iterate in insertion order, and updating an existing key keeps its position. This enables ordered deduplication, simple LRU variants and deterministic output. It is not sorted order.'],
    ['Keys are by equality, not identity', 'Two equal strings or tuples are the same key even if they are different objects. Keys must be hashable; values can be anything.'],
  ],
  edges: [
    ['`KeyError`', '`d["x"]` on a missing key raises. Use `get`, `in`, `try/except KeyError` or `defaultdict`.'],
    ['Mutating during iteration', 'Adding or deleting keys while looping raises `RuntimeError: dictionary changed size during iteration`. Iterate over `list(d)` or build a new dict. Changing values of existing keys is allowed.'],
    ['`defaultdict` side effect', 'Merely reading `d[k]` inserts the key. `k in d` does not. Checking with indexing can grow the dict unexpectedly.'],
    ['`get` evaluates its default eagerly', '`d.get(k, expensive())` calls `expensive()` every time. Use `if k in d` or `setdefault` with a cheap default.'],
    ['`setdefault(k, [])`', 'Creates a new empty list on each call, discarded when the key exists. Fine for small cases, `defaultdict(list)` is cleaner.'],
    ['Shared mutable values', '`dict.fromkeys(keys, [])` makes all keys share one list. Use a comprehension: `{k: [] for k in keys}`.'],
    ['Merging', '`{**a, **b}` and `a | b` (3.9+) build a new dict where the right side wins; `a |= b` and `a.update(b)` mutate. Merges are shallow.'],
    ['Copying', '`d.copy()` and `dict(d)` are shallow. Nested values are shared; use `copy.deepcopy` when needed.'],
    ['Deleting', '`del d[k]` raises if missing; `d.pop(k, None)` does not. `popitem()` removes the last inserted item (LIFO).'],
    ['Views are live', '`d.keys()`, `.values()` and `.items()` reflect later changes and support set operations (`d1.keys() & d2.keys()`); they are not snapshots.'],
    ['Float and bool keys', '`d[1]`, `d[1.0]` and `d[True]` hit one entry. Keep key types uniform.'],
    ['Sorting a dict', '`sorted(d.items(), key=lambda kv: kv[1])` returns a list of pairs; wrap in `dict(...)` to keep the order.'],
  ],
  cost: [
    ['d[k], d[k] = v, k in d, del d[k]', 'O(1) avg', 'O(n) worst case.'],
    ['len(d)', 'O(1)', ''],
    ['iteration', 'O(n)', 'Insertion order.'],
    ['d.keys() & other.keys()', 'O(min(n, m)) or O(n)', 'Set-like intersection.'],
    ['d.update(e), a | b', 'O(len(e)), O(n + m)', ''],
    ['copy', 'O(n)', 'Shallow.'],
    ['popitem()', 'O(1)', 'Last inserted.'],
    ['sorted(d.items())', 'O(n log n)', 'Returns a list.'],
    ['Counter.most_common(k)', 'O(n log k)', 'Uses a heap; `most_common()` with no argument sorts, O(n log n).'],
    ['memory', 'about 100 bytes/item for small dicts', 'Plus key and value objects. Use `__slots__` objects, arrays or columnar data for millions of records.'],
  ],
  internals: [
    ['Two-array layout', 'A sparse `indices` array holds small integers pointing into a dense `entries` array of (hash, key, value) in insertion order. Lookup probes `indices`, compares the stored hash, then the key. Deleting marks an entry dummy and a later resize compacts them.'],
    ['Key-sharing dicts', 'Instance `__dict__`s of the same class share one key table and store only values per instance, saving memory for object-heavy programs. Adding attributes in different orders defeats the sharing.'],
    ['Why equality checks are cheap', 'The stored hash is compared first, and identity (`is`) is checked before `==`, so most matches skip calling `__eq__`.'],
    ['Resizing and iteration order', 'Resize rebuilds `indices` but keeps entries in order, so insertion order survives growth. Deleting many keys then inserting can reuse space, but order is always insertion order of live keys.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Given a string, return the first non-repeating character.',
      a: 'Count with `Counter(s)` (one pass, O(n)), then scan `s` in order and return the first character whose count is 1; return `None` or -1 if none. O(n) time, O(k) space for k distinct characters (at most the alphabet size). Edge cases: empty string, all repeated, case sensitivity and unicode.',
      follow: [
        ['Can you do it in one pass?', 'Dicts preserve insertion order, so keep counts in a dict and then return the first key with count 1 by scanning the dict (not the string). Still two loops but over distinct characters, not the whole input; for streaming data, maintain an ordered structure and remove characters when they repeat.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Two Sum: return indices of two numbers adding to a target.',
      a: 'One pass with a dict from value to index. For each `x` at index `i`, check whether `target - x` is in the dict; if so return its index and `i`; else store `x: i`. O(n) time, O(n) space. Checking before storing handles the case of using the same element twice; duplicates work because the earlier index is already stored.',
      follow: [
        ['What if the array is sorted?', 'Two pointers from both ends in O(n) time and O(1) space.'],
        ['What if there are multiple answers?', 'Clarify whether to return any, all or a count. For all pairs, store lists of indices (or counts) per value and handle `x == target - x` carefully.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Group anagrams. Discuss key choices.',
      a: 'Use a dict from a canonical key to a list of words. Key options: `tuple(sorted(word))` or `"".join(sorted(word))` costs O(k log k) per word; a 26-count tuple costs O(k) per word and suits lowercase ASCII. Total O(n * k log k) or O(n * k). Edge cases: empty strings, case, non-letters and unicode normalisation. Use `defaultdict(list)` and return `list(groups.values())`.',
      follow: [
        ['Why not use a list as the key?', 'Lists are unhashable. A tuple of counts works; a string of sorted characters works.'],
        ['Is a hash of the counts safe as a key?', 'Not alone: different count vectors could collide. Use the exact tuple (which the dict compares fully on collision).'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain what happens when you modify a dict while iterating over it. How do you do it safely?',
      a: 'If the size changes, the next iteration step raises `RuntimeError` because the dict keeps a version/size check to avoid undefined behaviour. Updating values of existing keys is allowed. Safe patterns: iterate over `list(d.items())`, build a new dict with a comprehension (`{k: v for k, v in d.items() if keep}`), or collect keys to delete and delete after the loop.',
      follow: [
        ['Why not just let it work?', 'Resizing during iteration can move or reorder entries, so the iterator might skip or repeat items. Failing loudly is safer than silently wrong.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'You must count word frequencies in a 500 GB log across a cluster. How?',
      a: 'Map-reduce style: each worker streams its shard and builds a local counter (or a bounded one), then partial counts are shuffled by key hash so each key lands on one reducer that sums them. Concerns: memory per worker (spill or use a count-min sketch for approximate heavy hitters), skewed keys (hot words need a combiner or salting), tokenisation consistency, fault tolerance (idempotent tasks, retries) and the final top-k merge (each reducer returns its top-k, a heap merges them). Say what accuracy is required: exact counts need the full shuffle; approximate top-k can use Space-Saving or Count-Min.',
      follow: [
        ['How would you find the top 10 words only?', 'Local counts, then each partition keeps a size-10 heap, and a final merge of partition heaps. Because a key lives in exactly one reducer after hash partitioning, the global top 10 is among the union of the partition top 10s.'],
      ],
    },
  ],
};
