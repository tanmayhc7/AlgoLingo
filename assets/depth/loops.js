/* Interview depth: Loops. */
window.DEPTH = {
  thesis:
    'A Python `for` loop does not count; it asks an object for an iterator and takes items until the iterator says stop. Once you hold that model, off-by-one questions, "why did my list skip an element", generators that run out, and `for ... else` all become predictable. Interviews probe it with mutation during iteration, `range` semantics, and the cost of nested loops.',
  why: [
    ['Iterables and iterators', '`for x in obj` calls `iter(obj)` once, then calls `next()` until `StopIteration`. A list is an iterable that gives a fresh iterator each time; a generator is its own iterator and can be consumed once. Knowing which you hold explains "my second loop got nothing".'],
    ['`range` is a lazy number sequence', '`range(a, b, c)` stores three numbers, not the values. `len`, indexing, slicing, `in` and `reversed` all work without building a list. The stop is exclusive: `range(n)` gives `0..n-1`.'],
    ['Do not change what you walk over', 'Mutating a list while iterating it moves items under the iterator, so elements get skipped. Adding or removing keys of a dict or set during iteration raises `RuntimeError`. Iterate over a copy, collect changes and apply them afterwards, or build a new collection.'],
    ['Cost is the product of nested trip counts', 'The outer loop times the inner loop is the first thing an interviewer estimates. A hidden loop counts too: `x in some_list`, `xs.index`, slicing and `list.pop(0)` are each O(n) inside your loop.'],
  ],
  edges: [
    ['Empty iterable', 'The body never runs and the loop variable is never assigned, so using it after the loop raises `NameError` (or keeps an older value).'],
    ['Loop variable survives the loop', 'After `for i in range(3)`, `i` is 2. That is useful for "last item" and a source of bugs when the name is reused.'],
    ['Off-by-one with `range`', '`range(1, n)` stops at `n - 1`; use `range(1, n + 1)` for 1..n. `range(len(xs) - 1)` pairs each item with the next; check the single-item case.'],
    ['Mutating a list while iterating', '`for x in xs: if bad(x): xs.remove(x)` skips elements after each removal. Use a comprehension (`xs = [x for x in xs if not bad(x)]`) or iterate over `xs[:]`.'],
    ['Mutating a dict during iteration', '`RuntimeError: dictionary changed size during iteration`. Loop over `list(d)` or `list(d.items())`. Changing a value for an existing key is allowed.'],
    ['`zip` stops at the shortest', 'Data is silently dropped. Use `zip(a, b, strict=True)` (3.10+) to raise on a length mismatch, or `itertools.zip_longest`.'],
    ['`for ... else`', 'The `else` block runs only if the loop finished without `break`. Handy for "search and give up" logic, confusing for readers; comment it.'],
    ['Breaking out of nested loops', '`break` leaves only the innermost loop. Use a function and `return`, a flag, or raise a private exception. `for ... else` plus `continue` is a compact trick.'],
    ['Consumed generators and iterators', 'A second loop over the same generator or `map`/`zip`/`filter` object yields nothing. Convert to a list if you need two passes.'],
    ['`while True` without a guaranteed exit', 'Always identify what makes the loop end, and bound retry loops. In an interview, say the loop invariant and the termination argument.'],
    ['Float loop counters', '`while x != 1.0: x += 0.1` never lands exactly on 1.0. Count with integers and scale.'],
  ],
  cost: [
    ['for x in xs', 'O(n)', 'One pass. An iterator over a list is a simple index.'],
    ['for i in range(n)', 'O(n)', 'Creates int objects as it goes; no list is built.'],
    ['len(range(n)), i in range(n)', 'O(1)', 'Computed from start, stop and step.'],
    ['nested for over n and m', 'O(n * m)', 'Estimate this before writing code.'],
    ['x in xs inside a loop over n', 'O(n^2)', 'The most common accidental quadratic. Build a set first.'],
    ['list comprehension vs append loop', 'O(n), faster', 'The comprehension avoids a method lookup and call per item; usually 20-40 percent faster.'],
    ['while with manual counter', 'O(n), slower', 'More bytecode per iteration than `for ... in range`.'],
    ['sum / min / max / any over a generator', 'O(n), O(1) space', 'Streams items without building a list.'],
  ],
  internals: [
    ['The protocol, spelled out', '`it = iter(xs)` then repeatedly `x = next(it)`, ending when `StopIteration` is raised. `for` hides all of it, including catching `StopIteration`. `iter(callable, sentinel)` makes an iterator that calls `callable()` until it returns the sentinel.'],
    ['List iterators and mutation', 'A list iterator remembers an index. If you remove an item before that index, every later item shifts left and the iterator, now one past, skips one. That is the mechanism behind the classic skip bug.'],
    ['Why `range` does not exhaust memory', '`range` is an immutable sequence type with O(1) indexing. `range(10**12)` is valid and tiny. Iterating it still takes as long as the number of items.'],
    ['`enumerate`, `zip`, `reversed` are lazy', 'They return iterators that produce items on demand. `reversed` needs a sequence with `__reversed__` or `__len__` plus `__getitem__`; it does not work on generators.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What does this print, and why?\n`xs = [1, 2, 3, 4]; for x in xs: if x % 2 == 0: xs.remove(x); print(xs)`',
      a: '`[1, 3]` looks right here, but only by luck of the data: removing 2 shifts 3 into index 1, and the iterator moves to index 2, which now holds 4, so 3 is skipped (it is odd, so nothing is lost). With `[2, 4, 6]` the result is `[4]`. Never mutate the list you iterate. Build a new list with a comprehension, or loop over a copy.',
      follow: [
        ['How do you filter in place and keep the same list object?', '`xs[:] = [x for x in xs if keep(x)]`. It replaces the contents of the list object that other names also point at.'],
        ['What if you must remove items from the end while looping?', 'Iterate indices in reverse (`for i in range(len(xs) - 1, -1, -1)`), because removals then do not shift items you have yet to visit.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What does `for ... else` do?',
      a: 'The `else` block runs when the loop ends normally, without hitting `break`. It expresses "searched everything and found nothing": `for x in xs: if ok(x): break; else: handle_missing()`. A `return` in the loop also skips it.',
      follow: [
        ['Would you use it in production code?', 'Sparingly. It is correct and compact but unfamiliar to many readers. A helper function that returns early is usually clearer. If used, add a comment.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'What is the difference between an iterable, an iterator and a generator?',
      a: 'An iterable can produce an iterator (`__iter__`). An iterator has `__next__` and returns itself from `__iter__`; it is single-pass. A generator is an iterator written as a function with `yield`, computing items lazily and keeping its local state between items. Lists are iterables (many passes); generators and file objects are iterators (one pass).',
      follow: [
        ['Why is a `for` loop over a file handle memory-safe?', 'The file object is its own iterator and yields one line at a time with buffering, so only a line (plus buffer) is in memory, however large the file.'],
        ['Write a generator that yields Fibonacci numbers forever and take the first 10.', '`def fib(): a, b = 0, 1\n while True: yield a; a, b = b, a + b` then `list(itertools.islice(fib(), 10))`. `islice` stops the infinite generator without consuming more.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Given a list of n numbers and a target, you wrote two nested loops to find a pair summing to the target. How do you improve it and what is the trade-off?',
      a: 'The nested loop is O(n^2) time, O(1) space. With a dict (or set) of values seen so far, check `target - x` in one pass: O(n) average time, O(n) space. If the list is already sorted, two pointers give O(n) time and O(1) space. The trade-off is time versus extra memory, and hash-table worst case if keys collide.',
      follow: [
        ['What changes if the input has duplicates and you want all pairs?', 'Count occurrences with a `Counter` and handle `x == target - x` separately (needs a count of at least 2). Decide how to report duplicates (indices versus values).'],
      ],
    },
    {
      lvl: 'senior',
      q: '`for i in range(len(xs))` is considered unidiomatic. When is it still the right choice?',
      a: 'When you need the index for something other than reading the item: assigning back (`xs[i] = f(xs[i])`), looking at neighbours (`xs[i-1]`, `xs[i+1]`), or iterating two parallel structures by index. Otherwise `for x in xs`, `for i, x in enumerate(xs)` or `zip` express intent and avoid index mistakes.',
      follow: [
        ['How would you iterate over adjacent pairs?', '`for a, b in zip(xs, xs[1:])` (or `itertools.pairwise(xs)` in 3.10+). It handles empty and single-item lists, doing nothing.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'How would you process an unbounded stream of events in a loop without losing items on errors?',
      a: 'Treat each iteration as a unit with an explicit error policy. Wrap handling of one event in `try/except`, log with context, and decide per error class: retry with bounded backoff for transient failures, dead-letter for poison messages, stop for programmer errors. Keep the loop free of unbounded state, checkpoint progress (offset or ack) only after successful handling, and make handlers idempotent so a replay after a crash is safe.',
      follow: [
        ['What if one slow event blocks the stream?', 'Introduce concurrency with a bounded queue (`asyncio` or a worker pool), per-event timeouts, and backpressure so the producer slows down rather than memory growing.'],
      ],
    },
  ],
};
