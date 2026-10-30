/* Interview depth: Shorthands and idioms. */
window.DEPTH = {
  thesis:
    'Idioms are compressed knowledge: each one replaces a few lines of C-style code and also communicates intent. In an interview they signal fluency, but only if you can say what each one really does, what it costs, and when it is wrong. Treat every shorthand as a promise about behaviour, and know the edge case where the promise breaks.',
  why: [
    ['Know the long form', 'Each shorthand has a longer, equivalent form (`a, b = b, a` is "build a tuple, then unpack it"). If you can write the long form from memory, you can reason about corner cases instead of guessing.'],
    ['Readability is a correctness property', 'A clever one-liner that reviewers cannot parse invites bugs. Interviewers reward the clear version first, then the compact one if it is also clear.'],
    ['Laziness changes behaviour', '`map`, `filter`, `zip`, `enumerate`, `reversed` and generator expressions are lazy iterators. They compute on demand, can be consumed once, and defer errors until you iterate. `list(...)` forces them.'],
    ['Cost hides inside built-ins', '`min`, `max`, `sum`, `any`, `all`, `sorted` are O(n) or O(n log n) calls. Putting them inside a loop multiplies the cost. Hoist or reuse the result.'],
  ],
  edges: [
    ['Swap `a, b = b, a`', 'Right side evaluated first. Works for list items too (`xs[i], xs[j] = xs[j], xs[i]`), but `xs[i], i = i, xs[i]` style mixing has order-of-assignment surprises: assignments happen left to right.'],
    ['Starred unpacking', '`first, *rest = []` raises `ValueError` (not enough values). `rest` is always a list, even when empty.'],
    ['`any([])` and `all([])`', '`any([])` is False; `all([])` is True ("vacuous truth"). Mind this on empty inputs.'],
    ['`max([])` and `min([])`', 'Raise `ValueError`. Provide `default=` or check emptiness.'],
    ['`max(key=...)` ties', 'Returns the first maximal item. `sorted` is stable, so ties keep input order. State your tie-break rule.'],
    ['`zip` truncation', 'Stops at the shortest input; `strict=True` (3.10+) raises on mismatch.'],
    ['`x or default`', 'Treats `0`, `""`, `[]` as missing. Use `x if x is not None else default`.'],
    ['`xs[:]` copies shallowly', 'Inner objects are shared. `xs[::-1]` is a reversed copy, not a view.'],
    ['`sum` of strings or lists', '`sum(["a", "b"])` raises `TypeError`; `sum(list_of_lists, [])` works but is O(n^2). Use `"".join` and `itertools.chain.from_iterable`.'],
    ['Walrus operator', '`(n := len(xs)) > 10` assigns inside an expression. The name leaks into the enclosing scope (even out of a comprehension). Do not overuse it.'],
    ['`map(int, ...)` with bad input', 'Errors appear when the iterator is consumed, not when `map` is called.'],
    ['`enumerate(xs, start=1)`', 'Only changes the number, not which items are visited. Off-by-one confusion is common when mixing with slicing.'],
  ],
  cost: [
    ['sum, min, max, any, all', 'O(n)', '`any` and `all` stop early; the others scan everything.'],
    ['sorted(xs)', 'O(n log n)', 'Timsort; O(n) on already sorted or mostly sorted data. Stable.'],
    ['xs[::-1], xs[:]', 'O(n)', 'New list.'],
    ['reversed(xs)', 'O(1) to create', 'A lazy iterator; walking it is O(n).'],
    ['zip(a, b), enumerate(xs)', 'O(1) to create', 'Lazy; one tuple per item, though CPython reuses the tuple when it can.'],
    ['a, b = b, a', 'O(1)', 'Optimised by the compiler to a rotation on the stack, no tuple built for two or three names.'],
    ['x in range(n)', 'O(1)', 'Arithmetic check, not a scan.'],
    ['"".join(parts)', 'O(total)', 'The correct way to build a string.'],
  ],
  internals: [
    ['Unpacking protocol', 'The right side is any iterable; Python iterates it to the exact number of names (or collects the rest into a list for `*rest`). A generator on the right is consumed. Too few or too many items raises `ValueError`.'],
    ['`any` and `all` with generators', '`any(x > 0 for x in xs)` stops at the first true item and never builds a list, so it is both fast and memory-light. Passing a list comprehension (`any([...])`) evaluates everything first.'],
    ['`sorted` and `key`', 'The key function runs once per item, and Python sorts by the keys, then returns the original items (decorate-sort-undecorate). Keys are compared with normal rules, so tuples compare item by item.'],
    ['Why `zip(*matrix)` transposes', '`*matrix` passes each row as an argument; `zip` takes the first element of each, then the second, and so on, producing columns as tuples.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'How does `a, b = b, a` work without a temporary?',
      a: 'The right side `b, a` is evaluated first, producing a tuple of the two current objects. Then the names on the left are assigned from it, left to right. No data is copied: only the names are rebound.',
      follow: [
        ['What does `a, b = b, a + b` do in a Fibonacci loop?', 'The right side uses the old `a` and `b`, so the new `b` is old `a` plus old `b`, and the new `a` is the old `b`. Writing the two assignments sequentially would give a different result.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Transpose a matrix in one line and explain it.',
      a: '`[list(row) for row in zip(*m)]`. `*m` unpacks the rows into arguments, `zip` groups the i-th element of each row, and the comprehension turns each tuple into a list. For ragged rows, `zip` truncates to the shortest row; use `itertools.zip_longest` with a fill value if that matters.',
      follow: [
        ['What is its time and space cost?', 'O(r * c) time and space for an r by c matrix, since it builds a new matrix.'],
        ['How do you rotate it 90 degrees clockwise?', 'Transpose then reverse each row: `[list(r)[::-1] for r in zip(*m)]`, or `list(zip(*m[::-1]))` for tuples.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Find the longest word and its index in a list, handling empty input and ties, in a readable way.',
      a: '`if not words: return None` (decide what empty means). Then `i, w = max(enumerate(words), key=lambda p: len(p[1]))`. `max` returns the first maximal item, so ties go to the earliest index. If ties should go to the last, iterate reversed or use `>=` in a loop. State the empty and tie behaviour explicitly rather than leaving it to defaults.',
      follow: [
        ['What if the list is a generator you can only read once?', 'Use a single loop that tracks the best so far, because `max(enumerate(...))` over a generator is fine (one pass) but you cannot also reuse it. Be explicit about single-pass requirements.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'When are idioms like `x or default` and chained comparisons a liability?',
      a: '`x or default` swallows valid falsy values (`0`, `""`, `[]`), changing behaviour for legitimate inputs. Chained comparisons are great for ranges but hurt when mixed (`a < b > c`) or when operands have side effects. A liability appears when the shorthand hides an assumption that is not true for all inputs. In reviews, ask for the explicit form wherever the falsy cases matter.',
      follow: [
        ['What would you write instead for a timeout that may be zero?', '`timeout = DEFAULT if timeout is None else timeout`.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'A teammate rewrites a readable loop as a nested one-line comprehension with a walrus. What is your review comment?',
      a: 'Weigh clarity and testability: if the logic is non-trivial (multiple conditions, side effects, names reused across clauses), a named function or a short loop is easier to read, debug and instrument. A comprehension is right for a single map or filter. The walrus leaks its name and invites order-dependence. Ask what the change buys (measured speed, or clarity) and suggest extracting a helper with a good name.',
      follow: [
        ['Is the comprehension faster?', 'Often 20-40 percent for simple bodies because of avoided method lookups, and since 3.12 comprehensions are inlined, which helps more. Measure with `timeit` before arguing performance.'],
      ],
    },
  ],
};
