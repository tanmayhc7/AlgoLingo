/* Chapter 6 quiz: Hashing. See assets/quiz.js for the question format. */
window.QUIZ = {
  chapter: 6,
  title: 'Hashing',
  lede: 'Hash tables, dicts and sets. Multiple choice, fill-in, two write-it-yourself questions and a debug.',
  questions: [
    {
      type: 'mcq',
      q: 'Two different keys hash to the same slot in a table. What is this called, and is it an error?',
      options: ['A collision, and it is normal', 'A collision, and the second key is lost', 'An overflow, and the program stops'],
      answer: 0,
      why: 'Collisions happen in every hash table. The table stores both keys, by probing for another slot or by chaining. Lookups stay fast as long as the table is not too full.',
    },
    {
      type: 'mcq',
      q: 'Which line raises an error?',
      options: ['<code>d = {(1, 2): "a"}</code>', '<code>d = {[1, 2]: "a"}</code>', '<code>d = {"x": [1, 2]}</code>'],
      answer: 1,
      why: 'A dict key must be hashable, and a list can change after it is stored, so it is not. A tuple is fine as a key. A list as a value is fine too.',
    },
    {
      type: 'complete',
      q: 'Fill in the blank so <code>word_count(words)</code> returns a dict mapping each word to how many times it appears.',
      starter: 'def word_count(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.___(w, 0) + 1\n    return counts\n',
      tests: [
        { expr: "word_count(['a', 'b', 'a'])", want: "{'a': 2, 'b': 1}" },
        { expr: 'word_count([])', want: '{}' },
      ],
      hint: 'The method that returns a default instead of raising KeyError.',
      solution: 'def word_count(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts\n',
      why: 'get(w, 0) gives the current count, or 0 for a new word. Adding 1 and storing it back counts the word.',
    },
    {
      type: 'write',
      q: 'Write <code>first_repeat(xs)</code>. It returns the first item that has already appeared earlier in the list, or <code>None</code> if every item is new. Aim for one pass.',
      starter: 'def first_repeat(xs):\n    pass\n',
      tests: [
        { expr: 'first_repeat([2, 5, 1, 5, 2])', want: '5' },
        { expr: 'first_repeat([1, 2, 3])', want: 'None' },
        { expr: 'first_repeat([])', want: 'None' },
        { expr: "first_repeat(['a', 'b', 'a'])", want: "'a'" },
      ],
      hint: 'Keep a set of items seen so far. Check membership before adding.',
      solution: 'def first_repeat(xs):\n    seen = set()\n    for x in xs:\n        if x in seen:\n            return x\n        seen.add(x)\n    return None\n',
      why: 'Membership in a set is O(1) on average, so the whole function is O(n). Checking x in a list would make it O(n squared).',
    },
    {
      type: 'write',
      q: 'Write <code>group_by_length(words)</code>. It returns a dict that maps each length to the list of words of that length, in the order they appear.',
      starter: 'def group_by_length(words):\n    pass\n',
      tests: [
        { expr: "group_by_length(['a', 'bb', 'c'])", want: "{1: ['a', 'c'], 2: ['bb']}" },
        { expr: 'group_by_length([])', want: '{}' },
        { expr: "group_by_length(['hi', 'yo'])", want: "{2: ['hi', 'yo']}" },
      ],
      hint: 'd.setdefault(key, []) gives you the list for key, creating it if missing. Then append.',
      solution: 'def group_by_length(words):\n    groups = {}\n    for w in words:\n        groups.setdefault(len(w), []).append(w)\n    return groups\n',
      why: 'setdefault returns the existing list or stores a new empty one first. It replaces an if-key-in-d check.',
    },
    {
      type: 'debug',
      q: 'This should return an empty <i>set</i>, but it does not. Fix it.',
      starter: 'def empty_set():\n    return {}\n',
      tests: [
        { expr: 'empty_set()', want: 'set()' },
        { expr: 'len(empty_set())', want: '0' },
      ],
      hint: 'Empty braces make an empty dict. There is a function for the empty set.',
      solution: 'def empty_set():\n    return set()\n',
      why: '{} is an empty dict, because dicts came first. set() is the only way to write an empty set.',
    },
  ],
};
