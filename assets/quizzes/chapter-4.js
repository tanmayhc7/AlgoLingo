/* Chapter 4 quiz: Functions and shorthands. Covers the comprehensions lesson so far. See assets/quiz.js. */
window.QUIZ = {
  chapter: 4,
  title: 'Functions and shorthands',
  lede: 'Covers lesson 4.3, comprehensions, for now. Functions and shorthands will add questions when those lessons arrive. Two multiple choice, one fill-in, one write-it-yourself and one debug.',
  questions: [
    {
      type: 'mcq',
      q: 'What is <code>[x for x in range(5) if x &gt; 2]</code>?',
      options: ['[3, 4]', '[0, 1, 2]', '[3, 4, 5]'],
      answer: 0,
      why: 'range(5) gives 0 to 4. The filter at the end keeps only the ones above 2, which are 3 and 4.',
    },
    {
      type: 'mcq',
      q: 'What is <code>[x if x % 2 else 0 for x in range(4)]</code>?',
      options: ['[0, 1, 0, 3]', '[1, 3]', '[0, 0, 0, 0]'],
      answer: 0,
      why: 'An if/else at the front picks a value for every item, so nothing is dropped. Odd x is kept (1 and 3), and even x becomes 0. A filter would go at the end, and it would drop items.',
    },
    {
      type: 'complete',
      q: 'Fill in the blank so <code>squares(nums)</code> returns each number multiplied by itself.',
      starter: 'def squares(nums):\n    return [___ for n in nums]\n',
      tests: [
        { expr: 'squares([1, 2, 3])', want: '[1, 4, 9]' },
        { expr: 'squares([])', want: '[]' },
      ],
      hint: 'The part before the for is the item to collect. It can use the loop variable n.',
      solution: 'def squares(nums):\n    return [n * n for n in nums]\n',
      why: 'The item comes first and runs once per number. ** 2 would also work.',
    },
    {
      type: 'write',
      q: 'Write <code>lengths(words)</code> with a dict comprehension. It returns a dict that maps each word to its length.',
      starter: 'def lengths(words):\n    pass\n',
      tests: [
        { expr: "lengths(['a', 'bb'])", want: "{'a': 1, 'bb': 2}" },
        { expr: "lengths(['hello'])", want: "{'hello': 5}" },
        { expr: 'lengths([])', want: '{}' },
      ],
      hint: 'A dict comprehension is {key: value for name in source}. Here the key is the word and the value is len(word).',
      solution: 'def lengths(words):\n    return {w: len(w) for w in words}\n',
      why: 'The curly braces with key: value make a dict. If a word appears twice, the later one simply overwrites the same key.',
    },
    {
      type: 'debug',
      q: '<code>evens(n)</code> should return the even numbers below n, but it returns the odd ones. Fix it.',
      starter: 'def evens(n):\n    return [i for i in range(n) if i % 2]\n',
      tests: [
        { expr: 'evens(7)', want: '[0, 2, 4, 6]' },
        { expr: 'evens(1)', want: '[0]' },
        { expr: 'evens(0)', want: '[]' },
      ],
      hint: 'In an if test, 1 counts as true and 0 as false. i % 2 is 1 for odd numbers. What do you want to be true?',
      solution: 'def evens(n):\n    return [i for i in range(n) if i % 2 == 0]\n',
      why: 'i % 2 is truthy for odd numbers, so the filter kept the odd ones. Comparing with == 0 keeps the even ones.',
    },
  ],
};
