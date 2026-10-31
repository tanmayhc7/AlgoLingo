/* Interview depth: Special (dunder) methods. */
window.DEPTH = {
  thesis:
    'Dunder methods are the protocol by which your classes plug into the language. Equality and hashing decide how objects behave in sets and dicts, __repr__ decides what you see when debugging, and the arithmetic and container methods let you build types that feel built in. The interview points are the contracts between them: equal objects must hash equally, and a hash must not change while the object is stored.',
  why: [
    ['Sets and dicts depend on the hash contract', 'Using your own objects as keys is common (points, states, nodes in a graph search). A wrong __hash__ silently loses elements.'],
    ['Design questions use value objects', 'Visited-state sets in BFS, memo keys in DP and cache keys all need a correct __eq__ and __hash__.'],
    ['Readable repr saves debugging time', 'A good __repr__ makes failing tests and logs legible.'],
    ['Container protocols make code idiomatic', 'Implementing __len__, __iter__ and __getitem__ lets len, for loops and indexing work on your type.'],
  ],
  edges: [
    ['__eq__ without __hash__', 'Python sets __hash__ to None, so instances are unhashable. Define both or neither.'],
    ['Mutable fields in the hash', 'If an object is mutated after insertion, its hash changes and the object is lost in the wrong bucket. Hash only immutable fields, or make the object immutable.'],
    ['Comparing with other types', 'Return NotImplemented (not False) when the other operand is not your type, so Python can try the reflected operation.'],
    ['Inconsistent ordering', 'Define __lt__ only if it agrees with __eq__; functools.total_ordering builds the others from __eq__ and one ordering.'],
    ['Overriding __repr__ with side effects', 'repr is called by debuggers and logs; it must not raise or mutate.'],
  ],
  cost: [
    ['hash lookup', 'O(1) average if the hash spreads values; O(n) worst case if many objects collide.'],
    ['expensive __hash__', 'Computed on every lookup. Cache it for large immutable objects, or use a tuple of fields (fast, built in).'],
    ['operator dispatch', 'Each operator on a custom class is a Python function call, much slower than on ints.'],
  ],
  internals: [
    ['How dispatch works', 'Operators and built-ins look up the dunder name on the type (not the instance) and call it. That is why defining __add__ on one instance has no effect.'],
    ['Reflected operators', 'If a.__add__(b) returns NotImplemented, Python tries b.__radd__(a). This is how 1 + Vec works if Vec defines __radd__.'],
    ['Dataclasses generate these', '@dataclass writes __init__, __repr__ and __eq__ for you; frozen=True also adds __hash__.'],
    ['Default behaviour', 'Without overrides, == is identity and hash is derived from the object address, so two equal-looking objects are different set members.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'You store `Point(1, 2)` in a set, then look up another `Point(1, 2)` and get False. What is wrong and how do you fix it?',
      a: 'The class uses the default identity-based __eq__ and __hash__, so the two objects are different. Define __eq__ to compare the fields and __hash__ to hash the same fields, for example `hash((self.x, self.y))`. Better still, use a frozen dataclass or a namedtuple which provide both correctly.',
      follow: [
        ['What breaks if you define only __eq__?', 'The class becomes unhashable: __hash__ is set to None, so using it in a set or as a dict key raises TypeError.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What is the difference between __repr__ and __str__?',
      a: '__repr__ is for developers: unambiguous, ideally something you could paste to recreate the object. __str__ is for end users. print and str() use __str__ and fall back to __repr__; containers display their elements with repr.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'State the contract between __eq__ and __hash__ and give a failure scenario.',
      a: 'If a == b then hash(a) == hash(b); the reverse need not hold (collisions are allowed). The hash must also stay constant while the object is in a set or a dict. Failure: a key object with a mutable field in its hash is inserted, the field changes, and the object is now in a bucket that no longer matches its hash: `obj in s` returns False although it is in the set, and removal fails.',
      follow: [
        ['How do hash collisions affect performance?', 'Colliding keys share a probe sequence or bucket, so lookups compare more candidates. Pathological collisions degrade to O(n). Python mitigates attacks on strings with hash randomisation.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'How would you implement a 2D vector class that works with +, scalar *, ==, hashing and printing, and what do you do about `2 * v`?',
      a: 'Implement __add__, __mul__ for scalars (return NotImplemented for other types), __eq__, __hash__ on the immutable (x, y) pair, and __repr__. For `2 * v`, int.__mul__ returns NotImplemented, so Python calls v.__rmul__(2); define __rmul__ = __mul__. Make the class immutable (slots plus no setters, or a frozen dataclass) so hashing is safe.',
      follow: [],
    },
  ],
};
