/* Chapter 3 quiz: Control flow. Covers the loops lesson so far. See assets/quiz.js. */
window.QUIZ = {
  chapter: 3,
  title: 'Control flow',
  lede: 'Covers lesson 3.2, loops, for now. Conditions and errors will add questions when those lessons arrive. Two multiple choice, one fill-in, one write-it-yourself and one debug with a loop that never ends.',
  questions: [
    {
      type: 'mcq',
      q: 'Which numbers does <code>range(1, 4)</code> hand out?',
      options: ['1, 2, 3', '1, 2, 3, 4', '0, 1, 2, 3'],
      answer: 0,
      why: 'range(a, b) starts at a and stops before b. To count 1 to n you write range(1, n + 1).',
    },
    {
      type: 'mcq',
      q: 'After <code>for i in range(3): pass</code> finishes, what does <code>print(i)</code> show?',
      options: ['2', 'NameError, because i only existed inside the loop', '3'],
      answer: 0,
      why: 'Python gives the loop no scope of its own. The tag i stays on the last number handed out, 2. In C a variable declared in the for header would be gone.',
    },
    {
      type: 'complete',
      q: 'Fill in the blank so <code>sum_to(n)</code> adds 1 + 2 + ... + n.',
      starter: 'def sum_to(n):\n    total = 0\n    for i in ___:\n        total = total + i\n    return total\n',
      tests: [
        { expr: 'sum_to(4)', want: '10' },
        { expr: 'sum_to(1)', want: '1' },
        { expr: 'sum_to(0)', want: '0' },
      ],
      hint: 'You need the numbers 1 up to and including n. The stop value of range is not included.',
      solution: 'def sum_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total = total + i\n    return total\n',
      why: 'range(1, n + 1) starts at 1 and stops after n. For n = 0 it is empty, so the total stays 0.',
    },
    {
      type: 'write',
      q: 'Write <code>count_down(n)</code>. It returns a list counting down from n to 1, such as <code>[3, 2, 1]</code>. For 0 it returns an empty list.',
      starter: 'def count_down(n):\n    pass\n',
      tests: [
        { expr: 'count_down(3)', want: '[3, 2, 1]' },
        { expr: 'count_down(1)', want: '[1]' },
        { expr: 'count_down(0)', want: '[]' },
      ],
      hint: 'range takes a third argument, the step. A step of -1 counts down. Wrap the range in list(...) to get a list.',
      solution: 'def count_down(n):\n    return list(range(n, 0, -1))\n',
      why: 'range(n, 0, -1) starts at n and stops before 0, stepping down by one. list() turns it into a list.',
    },
    {
      type: 'debug',
      q: '<code>digits(n)</code> should count the digits of a positive whole number, but it never finishes. Fix it. (The checker stops runaway code after a moment, so you will see an error and not a frozen page.)',
      starter: 'def digits(n):\n    count = 0\n    while n > 0:\n        count = count + 1\n    return count\n',
      tests: [
        { expr: 'digits(1234)', want: '4' },
        { expr: 'digits(7)', want: '1' },
        { expr: 'digits(100)', want: '3' },
        { expr: 'digits(0)', want: '0' },
      ],
      hint: 'The loop test depends on n, but nothing in the body changes n. Each round should chop off the last digit.',
      solution: 'def digits(n):\n    count = 0\n    while n > 0:\n        count = count + 1\n        n = n // 10\n    return count\n',
      why: 'A while loop needs something in its body that moves the test toward false. n // 10 drops the last digit each round.',
    },
  ],
};
