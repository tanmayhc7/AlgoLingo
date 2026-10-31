/* Lesson data: Iterators and generators (structure mode). */
(function () {
  function box(id, x, y, title, fields) {
    var ops = [['node', id, title, x, y, 'cell'], ['tag', id, 'mark']];
    (fields || []).forEach(function (f, k) { ops.push(['node', id + 'f' + k, f, x, y + 48 * (k + 1), 'cell']); });
    return ops;
  }
  var L = [['node', 'n0', '10', 300, 120, 'cell'], ['node', 'n1', '20', 420, 120, 'cell'], ['node', 'n2', '30', 540, 120, 'cell'], ['node', 'E', 'end', 660, 120, 'cell']];
  var it = [
    { pl: 0, cl: 0, h: 440, say: 'A for loop does not index the list. It asks the list for an iterator, then calls next() on the iterator until it signals the end. The iterator is a separate small object that remembers a position.', csay: 'An array and a pointer that walks it.', ds: L },
    { pl: 1, cl: 1, h: 440, say: 'it = iter(nums) creates the iterator. It points at the first element. The list itself is unchanged and can have many independent iterators.', csay: 'int *it = nums;', ds: [['ptr', 'it', 'n0', 'up']] },
    { pl: 2, cl: 2, h: 440, say: 'next(it) returns 10 and advances the position to the next element.', csay: 'int v = *it++;', ds: [['tag', 'n0', 'done'], ['ptr', 'it', 'n1', 'up']] },
    { pl: 3, cl: 3, h: 440, say: 'next(it) returns 20.', csay: 'v = *it++;', ds: [['tag', 'n1', 'done'], ['ptr', 'it', 'n2', 'up']] },
    { pl: 4, cl: 4, h: 440, say: 'next(it) returns 30. The iterator now sits just past the last element.', csay: 'v = *it++;', ds: [['tag', 'n2', 'done'], ['ptr', 'it', 'E', 'up']] },
    { pl: 5, cl: 5, h: 440, say: 'The next call finds nothing left and raises StopIteration. The for loop catches that exception and ends silently. An exhausted iterator stays exhausted: it must be recreated to loop again.', csay: 'it == nums + 3: stop.', ds: [['tag', 'E', 'bad']] },
  ];
  var gen = [
    { pl: 5, cl: 5, h: 440, say: 'g = count(2) does not run the function body. It builds a generator object holding a suspended frame: the local variables plus a bookmark of where to resume. Nothing has executed yet.', csay: 'A struct with the saved state: Gen g = {0, 2, 0};', ds: box('G', 200, 60, 'g', ['at start', 'i = -']) },
    { pl: 6, cl: 6, h: 440, say: 'next(g) runs the body until the first yield: i = 0, then yield 0 hands the value to the caller and freezes the frame in place.', csay: 'gen_next runs from the saved state and returns after storing 0.', ds: [['lab', 'Gf0', 'at yield'], ['lab', 'Gf1', 'i = 0'], ['tag', 'Gf0', 'cur'], ['node', 'O', 'out = 0', 620, 60, 'cell'], ['tag', 'O', 'done'], ['hot', 'O']] },
    { pl: 7, cl: 7, h: 440, say: 'The second next(g) resumes right after the yield: i += 1 runs, the loop condition holds, and the next yield hands out 1. Local variables survived between calls.', csay: 'The saved state says: continue after the return.', ds: [['lab', 'Gf1', 'i = 1'], ['lab', 'O', 'out = 1'], ['hot', 'O', 'Gf1']] },
    { pl: 8, cl: 8, h: 440, say: 'The third next(g) resumes, i becomes 2, the loop ends and the function returns. A generator that returns raises StopIteration, so the for loop stops. Memory used all along: one frame, no list of results.', csay: 'Returns 0 (done); state stays finished.', ds: [['lab', 'Gf0', 'done'], ['lab', 'Gf1', 'i = 2'], ['untag', 'Gf0', 'cur'], ['tag', 'G', 'dim'], ['lab', 'O', 'StopIteration'], ['untag', 'O', 'done'], ['tag', 'O', 'bad']] },
  ];
  window.LESSON = {
    id: 'iterators-generators',
    mode: 'ds',
    title: 'Iterators and generators',
    lede:
      'An iterator is an object with a next step: ask it for the following value until it says there are no more. Every for loop in Python is built on this protocol. A generator is the easy way to write one: a function that uses yield to produce values one at a time and pauses between them, keeping its local variables. For a C programmer, an iterator is a pointer or index plus a rule for advancing it, and a generator is a function whose state has been saved in a struct so it can resume.',
    scenes: [
      { id: 'iterator', title: 'The iterator protocol', blurb: 'iter() makes an iterator; next() gives one value at a time; StopIteration ends it.', trap: 'Iterating twice over an iterator (or a generator, map or zip object): the second pass is empty because it is already exhausted. Convert to a list if you need two passes, or recreate the iterator.', pyCode: ['nums = [10, 20, 30]', 'it = iter(nums)', 'next(it)   # 10', 'next(it)   # 20', 'next(it)   # 30', 'next(it)   # raises StopIteration'], cCode: ['int nums[] = {10, 20, 30};', 'int *it = nums;', 'int v = *it++;   /* 10 */', 'v = *it++;       /* 20 */', 'v = *it++;       /* 30 */', 'if (it == nums + 3) { /* end: stop */ }'], predict: { q: 'After the loop <code>for x in it:</code> has finished consuming an iterator <code>it</code>, what does a second <code>for x in it:</code> do?', options: ['Starts again from the first value', 'Runs zero times: the iterator is exhausted', 'Raises an error'], answer: 1, why: 'An iterator only moves forward. Once exhausted it keeps raising StopIteration, so the second loop body never runs.' }, steps: it },
      { id: 'generator', title: 'Generators pause and resume', blurb: 'yield hands out a value and freezes the frame; the next call continues from there.', trap: 'Treating a generator like a list: you cannot index it, take len(), or loop twice. Also, a generator function that never reaches a yield is an ordinary function. Use list(gen) only when the sequence is small enough to hold in memory.', pyCode: ['def count(n):', '    i = 0', '    while i < n:', '        yield i', '        i += 1', 'g = count(2)', 'next(g)   # 0', 'next(g)   # 1', 'next(g)   # StopIteration'], cCode: ['typedef struct { int i, n, state; } Gen;', 'int gen_next(Gen *g, int *out) {', '    switch (g->state) { case 0: g->i = 0;', '        while (g->i < g->n) { *out = g->i; g->state = 1; return 1; case 1: g->i++; }', '    } return 0; }', 'Gen g = {0, 2, 0};', 'gen_next(&g, &out);   /* 0 */', 'gen_next(&g, &out);   /* 1 */', 'gen_next(&g, &out);   /* returns 0: done */'], predict: { q: 'What does calling <code>count(2)</code> (the line <code>g = count(2)</code>) execute from the function body?', options: ['The whole body, up to the first yield', 'Nothing yet: it only creates the generator object', 'The whole body, collecting all values'], answer: 1, why: 'The body starts running at the first next(g). Creating the generator just builds the suspended frame.' }, steps: gen },
    ],
    builtins: [
      ['iter(x), next(it, default)', 'Get an iterator; fetch the next value (with a default instead of StopIteration).'],
      ['(expr for x in xs)', 'Generator expression: lazy, one value at a time, O(1) memory.'],
      ['yield from other', 'Delegate to another iterable or generator.'],
      ['itertools', 'islice, chain, count, cycle, groupby, product, permutations, combinations, accumulate.'],
      ['enumerate, zip, map, filter, reversed', 'Lazy iterator-producing built-ins (in Python 3).'],
      ['__iter__ / __next__', 'Make your own class iterable (return self from __iter__, implement __next__).'],
    ],
  };
})();
