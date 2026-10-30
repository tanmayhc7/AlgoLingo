/* Chapter 5 quiz: Memory and arrays. See assets/quiz.js for the question format. */
window.QUIZ = {
  chapter: 5,
  title: 'Memory and arrays',
  lede: 'Lists, tuples and what sits in memory underneath. Multiple choice, fill-in, write-it-yourself and debug questions.',
  questions: [
    {
      type: 'mcq',
      q: 'What does each slot of a Python list actually hold?',
      options: ['The value itself, like a C array', 'A pointer to an object', 'A copy of the object, always'],
      answer: 1,
      why: 'A list is an array of pointers. That is why one list can hold different types, and why the objects can be anywhere in memory.',
    },
    {
      type: 'mcq',
      q: 'You run <code>grid = [[0] * 3] * 2</code> and then <code>grid[0][0] = 7</code>. What is <code>grid</code>?',
      options: ['[[7, 0, 0], [0, 0, 0]]', '[[7, 0, 0], [7, 0, 0]]', '[[7, 7, 7], [0, 0, 0]]'],
      answer: 1,
      why: 'The outer * 2 repeats the same inner list twice. Both rows are one list, so the change shows in both.',
    },
    {
      type: 'mcq',
      q: 'Which of these is <b>not</b> legal?',
      options: ['<code>t = (1, 2); x, y = t</code>', '<code>t = (1, 2); t[0] = 5</code>', '<code>t = (1, 2); u = t + (3,)</code>'],
      answer: 1,
      why: 'Tuples cannot be changed in place. Unpacking and building a new tuple with + are fine.',
    },
    {
      type: 'complete',
      q: 'Fill in the blank so <code>make_grid(rows, cols)</code> returns a rows-by-cols grid of zeros whose rows are independent lists.',
      starter: 'def make_grid(rows, cols):\n    return [___ for _ in range(rows)]\n',
      tests: [
        { expr: 'make_grid(2, 3)', want: '[[0, 0, 0], [0, 0, 0]]' },
        { expr: '(lambda g: (g[0].__setitem__(0, 1), g)[1])(make_grid(2, 2))', want: '[[1, 0], [0, 0]]' },
      ],
      hint: 'The part before the for runs once per row, so it must build a new row each time.',
      solution: 'def make_grid(rows, cols):\n    return [[0] * cols for _ in range(rows)]\n',
      why: 'Because [0] * cols is evaluated again for every row, each row is a separate list.',
    },
    {
      type: 'write',
      q: 'Write <code>rotate_left(xs, k)</code>. It returns a new list with the items moved left by k places, wrapping around. <code>rotate_left([1, 2, 3, 4], 1)</code> is <code>[2, 3, 4, 1]</code>. It must not change <code>xs</code>.',
      starter: 'def rotate_left(xs, k):\n    pass\n',
      tests: [
        { expr: 'rotate_left([1, 2, 3, 4], 1)', want: '[2, 3, 4, 1]' },
        { expr: 'rotate_left([1, 2, 3, 4], 5)', want: '[2, 3, 4, 1]' },
        { expr: 'rotate_left([], 3)', want: '[]' },
        { expr: 'rotate_left([1, 2, 3], 0)', want: '[1, 2, 3]' },
      ],
      hint: 'Reduce k with %, taking care of the empty list. Then join two slices: xs[k:] and xs[:k].',
      solution: 'def rotate_left(xs, k):\n    if not xs:\n        return []\n    k %= len(xs)\n    return xs[k:] + xs[:k]\n',
      why: 'Slicing gives two new lists and + joins them. The % keeps k inside the list length, so extra turns wrap.',
    },
    {
      type: 'debug',
      q: 'This should return a copy of <code>xs</code> with the first item removed, leaving <code>xs</code> alone. It changes the original. Fix it.',
      starter: 'def drop_first(xs):\n    ys = xs\n    ys.pop(0)\n    return ys\n',
      tests: [
        { expr: 'drop_first([1, 2, 3])', want: '[2, 3]' },
        { expr: '(lambda a: (drop_first(a), a)[1])([1, 2, 3])', want: '[1, 2, 3]' },
        { expr: 'drop_first([5])', want: '[]' },
      ],
      hint: 'ys = xs only makes a second tag. Copy the list, or slice it.',
      solution: 'def drop_first(xs):\n    return xs[1:]\n',
      why: 'xs[1:] builds a new list from the second item on. The original keeps all its items.',
    },
  ],
};
