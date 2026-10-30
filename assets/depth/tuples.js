/* Interview depth: Tuples. */
window.DEPTH = {
  thesis:
    'A tuple is an immutable sequence, which gives it three jobs: a fixed record (a struct without names), a safe thing to return several values in, and a hashable composite key for dicts and sets. The depth questions are about what "immutable" does and does not guarantee, and when a different type (`namedtuple`, `dataclass`) is the better answer.',
  why: [
    ['Immutability is shallow', 'A tuple cannot change which objects it holds, but if one of them is mutable (a list), that object can still change. A tuple is hashable only if all its items are hashable, so `(1, [2])` cannot be a dict key.'],
    ['Use it for meaning, not just immutability', 'By convention a tuple is a heterogeneous record whose position has meaning `(row, col)`, `(name, age)`. A list is a homogeneous sequence of the same kind of thing. Following the convention makes code easier to read and review.'],
    ['Why tuples make good keys', 'They are hashable (when their items are), so coordinates `(r, c)`, state tuples and composite keys work in dicts and sets. That is a staple of grid, graph and DP problems.'],
    ['Names beat positions as records grow', 'Past two or three fields, `t[3]` is unreadable. Use `collections.namedtuple`, `typing.NamedTuple` or a frozen dataclass to get named fields with the same immutability and hashability.'],
  ],
  edges: [
    ['One-item tuple', '`(5)` is an int. `(5,)` is a tuple. `x = 1,` is also a tuple, a typo source.'],
    ['Empty tuple', '`()` is a singleton, falsy, hashable, valid as a key.'],
    ['Tuple holding a list', '`t = ([1],)`; `t[0].append(2)` works, and `t[0] += [2]` raises `TypeError` after mutating the list. Surprising but documented.'],
    ['Hashing happens late', '`t = (1, [2])` is created fine; `hash(t)` or using it as a key raises `TypeError: unhashable type`.'],
    ['Unpacking count', '`a, b = (1, 2, 3)` raises `ValueError`. Use `a, b, *rest` or `_`.'],
    ['Comparison', 'Tuples compare lexicographically, so `(1, 2) < (1, 3)` and `(1,) < (1, 0)`. Mixed element types at the first difference raise `TypeError`.'],
    ['`+` and `*`', 'Build new tuples. In a loop `t += (x,)` is O(n^2), the same trap as string `+=`. Collect in a list and convert once.'],
    ['`tuple(xs)` and `tuple(gen)`', 'Consumes the iterable and copies. A tuple from a list is O(n).'],
    ['Slices', '`t[1:]` is a new tuple. A slice of the whole tuple (`t[:]`) returns the same object, since it cannot change.'],
    ['Mutating via conversion', '`list(t)`, change, `tuple(...)` creates a new tuple. The original is unchanged, so other holders do not see it.'],
  ],
  cost: [
    ['t[i], len(t)', 'O(1)', ''],
    ['creation from literal', 'O(1) when constant', 'A tuple of constants is built once at compile time and reused.'],
    ['t + u', 'O(n + m)', 'New tuple.'],
    ['hash(t)', 'O(n)', 'Computed on each call (tuples do not cache their hash, unlike strings), so repeated lookups with large tuple keys cost O(n) each time.'],
    ['t == u', 'O(n)', 'Element by element, stopping at the first difference.'],
    ['x in t, t.index, t.count', 'O(n)', 'Linear scans.'],
    ['memory', '40 + 8n bytes (about)', 'Smaller than a list of the same length: no spare capacity, no separate item block.'],
    ['sorted(t)', 'O(n log n)', 'Returns a list.'],
  ],
  internals: [
    ['Layout', 'A tuple object stores its length and the pointers inline, with no separate array and no capacity field. That is why tuples are smaller and slightly faster to create than lists, and why they cannot grow.'],
    ['Free lists and constant folding', 'CPython recycles small tuples from per-size free lists and folds constant tuples at compile time, so `(1, 2)` as a literal is built once. These are optimisations, not guarantees.'],
    ['`namedtuple` is a tuple subclass', 'It adds named accessors but stays a real tuple: indexable, unpackable, hashable, immutable, with `_replace` and `_asdict`. A frozen dataclass is similar but not a tuple, and offers defaults, type hints and methods.'],
    ['Why tuples are used for `*args`', 'Variable positional arguments are packed into a tuple so the callee cannot change the caller\'s argument list, and the container is cheap to build.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What is the difference between a list and a tuple, beyond mutability?',
      a: 'Tuples are immutable and hashable (if their items are), a little smaller and faster, and conventionally hold fixed-size records of different kinds of things. Lists are mutable, growable, unhashable and conventionally hold a variable number of similar items. Choose by meaning first, then by the need to key a dict or protect from change.',
      follow: [
        ['Can a tuple contain a list? What happens?', 'Yes. The tuple still holds the same list object, but the list\'s contents can change. The tuple stays immutable in its references and loses hashability.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Explain this error and its twist: `t = ([1, 2],); t[0] += [3]`',
      a: '`TypeError: \'tuple\' object does not support item assignment`, but `t` is now `([1, 2, 3],)`. `t[0] += [3]` runs as `tmp = t[0]; tmp += [3]` (in-place, which succeeds), then `t[0] = tmp` (which fails). It shows augmented assignment is read, operate, then assign.',
      follow: [
        ['How would you avoid it?', 'Use `t[0].extend([3])` or `t[0].append(3)` (a method call with no assignment), or avoid putting a mutable list inside a tuple.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Use tuples as keys to solve a grid problem: count islands, or shortest path. Show how.',
      a: 'Represent a cell as `(r, c)`, store visited cells in a `set` of tuples, and iterate neighbours with `for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))`. Check bounds and membership before pushing onto a stack or deque. Tuples are hashable, so `seen.add((r, c))` and `(r, c) in seen` are O(1) average. For dense grids, a 2-D list of booleans or `r * cols + c` ints is faster and lighter.',
      follow: [
        ['What is the memory trade-off?', 'A set of tuples costs roughly 100+ bytes per cell (tuple, ints, set slot). An int key `r * cols + c` or a bytearray grid uses a fraction of it, which matters at millions of cells.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'When would you choose `namedtuple`, a frozen dataclass or a plain tuple?',
      a: 'Plain tuple for tiny, obvious pairs and for dict keys. `namedtuple` (or `typing.NamedTuple`) when you want named fields but still need tuple behaviours: unpacking, sorting, light memory, return values from older APIs. A frozen dataclass when you want type hints, defaults, methods, `__post_init__` validation and clearer equality semantics (it does not compare equal to a plain tuple), at a slightly higher cost. If you need mutation, a regular dataclass or class.',
      follow: [
        ['What do you give up with a dataclass compared to a namedtuple?', 'It is not iterable or indexable by default, and each instance carries a `__dict__` unless you use `slots=True` (3.10+), so memory is higher.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Why do tuples not cache their hash, and what does that mean for large tuple keys?',
      a: 'A tuple\'s hash depends on its items, which might themselves have mutable internals or cached hashes; CPython recomputes it on each call rather than storing it. For small tuples this is negligible. For huge tuple keys, every dict operation pays O(n) to hash, plus O(n) on equality checks of colliding keys. If you look up the same large key repeatedly, intern it once, wrap it in an object that caches the hash, or use a smaller identifier such as an integer id.',
      follow: [
        ['How would you cache the hash yourself?', 'A small class with `__slots__`, storing the tuple and a precomputed `_hash`, defining `__hash__` to return it and `__eq__` to compare the tuples. Make sure the contents truly cannot change.'],
      ],
    },
  ],
};
