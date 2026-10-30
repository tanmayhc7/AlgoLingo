/* Chapter 1 quiz: Getting started. Types: mcq, write, complete, debug. See assets/quiz.js. */
window.QUIZ = {
  chapter: 1,
  title: 'Getting started',
  lede: 'Covers lessons 1.1 to 1.3: how the two languages run, running Python, and names versus boxes. Two multiple choice, two debugging and one write-it-yourself.',
  questions: [
    {
      type: 'mcq',
      q: 'In Python: <code>x = [1, 2]</code>, then <code>y = x</code>, then <code>y.append(3)</code>. What does <code>print(x)</code> show?',
      options: ['[1, 2]', '[1, 2, 3]', 'An error, because x is read-only'],
      answer: 1,
      why: 'y = x sticks a second tag on the same list. append changes the list itself, so x sees the new item. In C, an array copied into a second array would not.',
    },
    {
      type: 'mcq',
      q: 'A misspelled name sits inside an <code>if</code> branch that never runs. When does Python report it?',
      options: ['Before the program starts, like a C compiler', 'Only if that line actually runs', 'Never, because Python ignores unknown names'],
      answer: 1,
      why: 'Python compiles to bytecode without looking names up. A name is looked up when its line runs, so the NameError appears only then. (Real syntax errors, like a missing colon, are caught before the program starts.)',
    },
    {
      type: 'debug',
      q: 'This function should swap its two arguments, but it returns the same value twice. Fix it.',
      starter: 'def swap(a, b):\n    a = b\n    b = a\n    return a, b\n',
      tests: [
        { expr: 'swap(1, 2)', want: '(2, 1)' },
        { expr: "swap('x', 'y')", want: "('y', 'x')" },
      ],
      hint: 'After a = b, both tags point at the same object, and the old object a pointed at has no tag. Nothing is left to copy into b.',
      solution: 'def swap(a, b):\n    return b, a\n',
      why: 'Returning b, a builds a pair from the two objects without moving any tag first. This is also how a, b = b, a works.',
    },
    {
      type: 'debug',
      q: 'This function has two syntax errors. Python tells you about them one at a time. Fix both.',
      starter: 'def clamp(n, low, high)\n    if n < low:\n        return low\n    if n > high\n        return high\n    return n\n',
      tests: [
        { expr: 'clamp(5, 0, 3)', want: '3' },
        { expr: 'clamp(-2, 0, 3)', want: '0' },
        { expr: 'clamp(2, 0, 3)', want: '2' },
      ],
      hint: 'Every line that opens a block, def and if included, ends with a colon. Read the error message: it names the line.',
      solution: 'def clamp(n, low, high):\n    if n < low:\n        return low\n    if n > high:\n        return high\n    return n\n',
      why: 'The colon is the Python version of the opening brace. The indentation that follows is the block.',
    },
    {
      type: 'write',
      q: 'Write <code>copy_and_add(items, x)</code>. It returns a <em>new</em> list with <code>x</code> added to the end, and must not change <code>items</code>.',
      starter: 'def copy_and_add(items, x):\n    pass\n',
      tests: [
        { expr: '(lambda l: (copy_and_add(l, 9), l))([1, 2])', want: '([1, 2, 9], [1, 2])' },
        { expr: "copy_and_add([], 'a')", want: "['a']" },
      ],
      hint: 'items.append(x) changes the list everyone shares. Build a different list instead: items + [x], or items.copy() first.',
      solution: 'def copy_and_add(items, x):\n    return items + [x]\n',
      why: 'items + [x] builds a brand new list object, so the caller’s list keeps its old contents.',
    },
  ],
};
