/* Interview depth: Iterators and generators. */
window.DEPTH = {
  thesis:
    'Iteration in Python is a protocol: an iterable returns an iterator from iter(), and the iterator yields values with next() until StopIteration. Generators are the concise way to write iterators, and they make laziness cheap: values are produced on demand, so a pipeline can process data far larger than memory. Interviewers ask about this to test memory reasoning, streaming design and understanding of exhaustion.',
  why: [
    ['Constant memory for large data', 'Reading a huge file line by line, or generating a sequence, never needs the whole thing in memory.'],
    ['Infinite and on-demand sequences', 'Fibonacci, primes, event streams: a generator can be unbounded because only the next value is ever computed.'],
    ['Composable pipelines', 'Chain generator expressions and itertools functions; each stage pulls from the previous one, one item at a time.'],
    ['Core of many interview solutions', 'Tree and graph traversals, permutations and combinations, and sliding windows are naturally written with yield.'],
  ],
  edges: [
    ['Single use', 'An iterator or generator can be consumed once. A second loop sees nothing. Re-create it, or store a list.'],
    ['Iterable versus iterator', 'A list is iterable (iter() gives a fresh iterator each time); an iterator returns itself from iter() and is its own state.'],
    ['Late binding in generator expressions', 'The outermost iterable is evaluated immediately, but inner names are looked up when values are produced; mutating variables in between changes results.'],
    ['Exceptions inside generators', 'StopIteration raised manually inside a generator becomes a RuntimeError (PEP 479). Use return to finish.'],
    ['Cleanup', 'A generator holding a file or lock needs try/finally or a with block; if abandoned it is closed when garbage collected, which may be late.'],
  ],
  cost: [
    ['generator expression sum', 'O(n) time, O(1) extra memory, versus O(n) memory for a list comprehension.'],
    ['next() call', 'Resuming a frame is cheap but slower than a plain loop in C; per-item overhead matters for tight loops.'],
    ['itertools functions', 'Implemented in C, so chaining them is usually faster than hand-written generators.'],
  ],
  internals: [
    ['Generator object', 'Holds a frame (locals, instruction pointer, value stack) that is not discarded when yield suspends it. next() resumes the frame until the next yield or return.'],
    ['send, throw, close', 'Generators are also coroutines: gen.send(v) resumes and makes the yield expression evaluate to v; throw raises inside; close raises GeneratorExit.'],
    ['yield from', 'Delegates to a sub-iterator and forwards sends and exceptions; essential for recursive generators such as tree traversals.'],
    ['async iterators', 'async def with yield and async for use the same idea with awaiting between items.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What is the difference between `[x*x for x in range(10**7)]` and `(x*x for x in range(10**7))`?',
      a: 'The list comprehension builds all ten million results in memory immediately (hundreds of megabytes). The generator expression builds a small object and produces each square only when asked. If you only need to sum or scan the values once, the generator uses O(1) memory and can stop early.',
      follow: [
        ['When is the list better?', 'When you need random access, len(), several passes, or the cost of recomputation is high.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Write a generator that yields the Fibonacci numbers forever, and use it to get the first ten.',
      a: 'def fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\nUse itertools.islice(fib(), 10) to take ten values. The infinite loop is safe because values are produced lazily.',
      follow: [
        ['Why not return a list?', 'There is no last element; a list would never finish.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'How would you process a 50 GB log file to count errors per hour on a machine with 4 GB of memory?',
      a: 'Stream it: iterate over the file object (it yields lines lazily), parse each line in a generator, and update a dict of counters keyed by hour. Memory is proportional to the number of distinct hours, not the file size. Chain stages with generators (read, parse, filter, aggregate) so each line flows through once. For speed, read in large binary chunks or parallelise by splitting the file on line boundaries and merging the dicts.',
      follow: [
        ['What if the keys are unbounded?', 'Use an on-disk structure, sort and merge external partitions, or a probabilistic sketch if approximate counts are acceptable.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain how yield from helps write a recursive in-order tree traversal, and what the complexity is.',
      a: 'def inorder(n):\n    if n:\n        yield from inorder(n.left)\n        yield n.val\n        yield from inorder(n.right)\n\nIt is concise and lazy: the caller can stop after k values. Time is O(n) overall, but each value passes through up to h nested generators, so the real cost is O(n h) in the worst case, and space is O(h) for the generator stack. For performance-critical traversals an explicit stack in an iterator class avoids that overhead.',
      follow: [],
    },
  ],
};
