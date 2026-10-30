/* Interview depth: Sets. */
window.DEPTH = {
  thesis:
    'A set is a dict with no values: unordered, unique, hashable members with O(1) average membership. Its value in interviews is membership testing, deduplication and set algebra (union, intersection, difference). The senior-level points are what a set costs, what it does not guarantee (order), and when a sorted structure or a Bloom filter is the better answer.',
  why: [
    ['Membership is the point', 'Replacing `x in list` (O(n)) with `x in set` (O(1) average) is the most common optimisation in interview solutions. Build the set once, query many times.'],
    ['Set algebra expresses intent', '`a & b`, `a | b`, `a - b`, `a ^ b` read like the problem statement and run in C. Prefer them to hand-written loops.'],
    ['No order, no indexing', 'Sets are unordered: no `s[0]`, no stable iteration order across runs for strings. If you need order, use a dict (`dict.fromkeys`) or sort when you output.'],
    ['Items must be hashable', 'Lists, dicts and sets cannot be members. Use tuples or `frozenset` for composite or nested members.'],
  ],
  edges: [
    ['`{}` is a dict', 'Empty set is `set()`. `{1, 2}` is a set, `{}` is an empty dict, `{1: 2}` is a dict.'],
    ['`set("hello")`', 'Splits into characters. `set(["hello"])` or `{"hello"}` keeps the word.'],
    ['`remove` versus `discard`', '`remove(x)` raises `KeyError` if absent; `discard(x)` does not. `pop()` removes an arbitrary element and raises on an empty set.'],
    ['Mutating during iteration', 'Changing set size while iterating raises `RuntimeError`, as for dicts.'],
    ['Equality ignores order', '`{1, 2} == {2, 1}`. Subset tests `<=`, `<` (proper), `>=`.'],
    ['`1`, `1.0`, `True`', 'Treated as the same element.'],
    ['`a - b` is not symmetric', 'Elements in `a` not in `b`. Use `a ^ b` for either-but-not-both.'],
    ['Operators versus methods', '`a | b` needs both operands to be sets; `a.union(b)` accepts any iterable. The method form is handy with lists.'],
    ['`frozenset`', 'Immutable and hashable, so it can be a dict key or a set member. Equal frozensets with the same members hash equal.'],
    ['Large integers and strings', 'Fine as members. Set of a million small ints is tens of MB; consider a bitset (`bytearray` or `int`) for dense small ranges.'],
  ],
  cost: [
    ['x in s, add, discard', 'O(1) avg', 'O(n) worst case.'],
    ['a | b', 'O(n + m)', 'New set.'],
    ['a & b', 'O(min(n, m))', 'Iterates the smaller and probes the larger.'],
    ['a - b', 'O(n)', 'Iterates a, probes b.'],
    ['a <= b', 'O(n)', ''],
    ['set(iterable)', 'O(n)', 'Hashes every item.'],
    ['len(s)', 'O(1)', ''],
    ['iteration', 'O(capacity)', ''],
    ['memory', 'about 32 to 64 bytes/item', 'Roughly 2 to 3 times a list of the same items.'],
  ],
  internals: [
    ['Same table as dict, without values', 'A set uses an open-addressing table of (hash, key) entries with the same perturbation probing and resize policy as a dict. Set tables are not insertion-ordered; they are indexed directly by probe position, so order depends on hashes.'],
    ['Why `&` is fast', 'The intersection loops over the smaller set and probes the other, so cost is bounded by the smaller size, not the sum.'],
    ['Small-set tricks', 'Tiny sets use a small embedded table; resizing begins when filled more than 3/5. Details vary by version, but costs stay amortised O(1).'],
    ['Alternatives', 'For ordered unique items use `dict.fromkeys` or a sorted list with `bisect`. For huge membership data with tolerable false positives, a Bloom filter. For dense small integer ranges, a bitset.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Detect whether a list has duplicates.',
      a: '`len(set(xs)) != len(xs)` is O(n) time and O(n) space. For early exit, loop and track a `seen` set: return True when an item is already in it. If extra space is not allowed and mutation is OK, sort and compare neighbours in O(n log n).',
      follow: [
        ['What if the values are in range 1..n?', 'Use index marking in place (negate `xs[abs(x) - 1]`) for O(1) extra space, but only if mutating the input is acceptable.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Find the intersection of two arrays.',
      a: '`set(a) & set(b)` in O(n + m) time. If duplicates matter (multiset intersection), use `Counter(a) & Counter(b)`. If both are sorted, a two-pointer walk uses O(1) extra space.',
      follow: [
        ['What if one array is much larger than the other?', 'Build the set from the smaller one and stream the larger, which saves memory. If the data does not fit in memory, sort externally or use a Bloom filter first pass.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Longest consecutive sequence in O(n).',
      a: 'Put all numbers in a set. For each `x` where `x - 1` is not in the set (a sequence start), walk `x, x+1, ...` while present and track the length. Each element is visited at most twice (once as a candidate, once inside a walk), so O(n) time and O(n) space. Sorting would be O(n log n).',
      follow: [
        ['Why is it not O(n^2)?', 'The inner walk only starts from sequence starts, so every number belongs to exactly one walk.'],
        ['What are the edge cases?', 'Empty input, duplicates (the set removes them), negative numbers and a single element.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Why are sets unordered, and how do you get deterministic output?',
      a: 'Position in the table depends on the hash, and string hashes are randomised per process, so iteration order can change between runs. Do not rely on it. For deterministic output, `sorted(s)`, or keep an ordered structure (`dict.fromkeys(items)`) when order of first appearance matters.',
      follow: [
        ['Can set order bite you in tests?', 'Yes: tests that compare `list(s)` flake across runs. Compare sets directly or sort before comparing.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'You need to check membership for 1 billion URLs with 2 GB of memory. What do you do?',
      a: 'A set will not fit (tens of GB). Options: a Bloom filter sized for a target false-positive rate (about 10 bits per item gives roughly 1 percent, so about 1.2 GB), with exact confirmation from disk or a database only on positives; a cuckoo filter if deletes are required; partitioning by hash across machines; or sorted on-disk files with an in-memory index. State the trade-off: Bloom filters never give false negatives, do give false positives, and cannot delete.',
      follow: [
        ['How do you size a Bloom filter?', 'With n items and target false positive rate p: bits m = -n ln p / (ln 2)^2 and hash count k = (m / n) ln 2. Doubling memory drops p roughly exponentially.'],
      ],
    },
  ],
};
