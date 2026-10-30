/* Chapter 2 quiz: Basic types. See assets/quiz.js for the question format. */
window.QUIZ = {
  chapter: 2,
  title: 'Basic types',
  lede: 'Numbers, truth values, None and strings. Two multiple choice, one fill-in, one write-it-yourself and one debug.',
  questions: [
    {
      type: 'mcq',
      q: 'What does <code>-9 // 4</code> give in Python?',
      options: ['-2', '-3', '-2.25'],
      answer: 1,
      why: '// rounds down, toward minus infinity. -9 / 4 is -2.25, and rounding down gives -3. C would truncate to -2.',
    },
    {
      type: 'mcq',
      q: 'Which expression is <b>true</b>?',
      options: ['<code>bool([])</code>', '<code>bool("0")</code>', '<code>bool(None)</code>'],
      answer: 1,
      why: 'An empty list and None are false. The string "0" has one character, so it is true.',
    },
    {
      type: 'complete',
      q: 'Fill in the blank so <code>last_two(s)</code> returns the last two characters of a string.',
      starter: 'def last_two(s):\n    return s[___]\n',
      tests: [
        { expr: "last_two('python')", want: "'on'" },
        { expr: "last_two('ab')", want: "'ab'" },
      ],
      hint: 'A negative number counts from the end. A slice with an empty end runs to the end of the string.',
      solution: 'def last_two(s):\n    return s[-2:]\n',
      why: 's[-2:] starts two from the end and runs to the end. It also copes with strings shorter than two characters.',
    },
    {
      type: 'write',
      q: 'Write <code>is_palindrome(s)</code>. It returns True when the string reads the same forwards and backwards, ignoring case.',
      starter: 'def is_palindrome(s):\n    pass\n',
      tests: [
        { expr: "is_palindrome('Level')", want: 'True' },
        { expr: "is_palindrome('abca')", want: 'False' },
        { expr: "is_palindrome('')", want: 'True' },
      ],
      hint: 'Lower-case the string first. s[::-1] is the string reversed.',
      solution: 'def is_palindrome(s):\n    t = s.lower()\n    return t == t[::-1]\n',
      why: 'Slicing with a step of -1 builds the reversed string, and == compares the contents.',
    },
    {
      type: 'debug',
      q: 'This function should turn <code>"hello"</code> into <code>"Jello"</code> by changing the first letter, but it crashes. Fix it.',
      starter: 'def swap_first(s, c):\n    s[0] = c\n    return s\n',
      tests: [
        { expr: "swap_first('hello', 'J')", want: "'Jello'" },
        { expr: "swap_first('a', 'b')", want: "'b'" },
      ],
      hint: 'Strings are immutable. Build a new string from the new letter and the rest.',
      solution: 'def swap_first(s, c):\n    return c + s[1:]\n',
      why: 'Strings cannot be edited in place. Build a new one: the new first letter plus s[1:].',
    },
  ],
};
