/* LeetCode 20: Valid Parentheses. Python is T's optimised version (push the expected closer, odd-length and prune checks); the C version was added to match. */
(function () {
  var O = { x0: 80, dx: 95, y0: 40, dy: 68 };
  function chars(s) { return s.split('').map(function (c, i) { return ['c' + i, c, i, 0]; }); }
  var PY = ['class Solution:', '    def isValid(self, s: str) -> bool:', '        n = len(s)', '        if n % 2:', '            return False', '        match = {\'(\': \')\', \'{\': \'}\', \'[\': \']\'}', '        stack = []', '        for i, ch in enumerate(s):', '            if ch in match:', '                stack.append(match[ch])', '                if len(stack) > n - i - 1:', '                    return False', '            elif not stack or stack.pop() != ch:', '                return False', '        return not stack'];
  var C = [
    'bool isValid(char* s) {',
    '    int n = strlen(s);',
    '    if (n % 2) return false;',
    '    char *stack = malloc(n);',
    '    int top = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        char ch = s[i];',
    '        if (ch == \'(\') stack[top++] = \')\';',
    '        else if (ch == \'{\') stack[top++] = \'}\';',
    '        else if (ch == \'[\') stack[top++] = \']\';',
    '        else if (top == 0 || stack[--top] != ch) { free(stack); return false; }',
    '    }',
    '    bool ok = (top == 0); free(stack); return ok;',
    '}'
  ];
  function push(i, ch, closer, k) {
    return { pl: 9, cl: 7, say: 'i = ' + i + ', "' + ch + '" opens a bracket. Push the closer we will expect: ' + closer + '.', csay: 'stack[top++] = \'' + closer + '\';', add: [['k' + k, closer, k + 1, 2]], tag: [['c' + i, 'cur']], untag: i ? [['c' + (i - 1), 'cur']] : [], ptr: [['i', 'c' + i, 'down']] };
  }
  function pop(i, ch, k, last) {
    return { pl: 12, cl: 10, say: 'i = ' + i + ', "' + ch + '" closes a bracket. Pop ' + ch + ' from the stack: it matches.' + (last ? ' The stack is now empty.' : ''), csay: 'stack[--top] != ch', rm: ['k' + k], tag: [['c' + i, 'done']], ptr: [['i', 'c' + i, 'down']] };
  }
  var s1 = [
    { pl: 4, cl: 3, say: 's = "({[]})". Length 6 is even. The stack holds the closers we still owe: whatever was opened last must be closed first.', csay: 'char *stack = malloc(n);', add: chars('({[]})').concat([['sl', 'stack', 0, 2]]) },
    push(0, '(', ')', 0), push(1, '{', '}', 1), push(2, '[', ']', 2),
    pop(3, ']', 2), pop(4, '}', 1), pop(5, ')', 0, true),
    { pl: 14, cl: 12, say: 'The loop is over and the stack is empty: return True. Each character was pushed or popped once, so O(n) time and O(n) space.', csay: 'bool ok = (top == 0);', untag: [['c5', 'cur']] }
  ];
  var s2 = [
    { pl: 4, cl: 3, say: 's = "([)]". Two of each bracket, so the counts balance. The order is the problem.', csay: '', add: chars('([)]').concat([['sl', 'stack', 0, 2]]) },
    push(0, '(', ')', 0), push(1, '[', ']', 1),
    { pl: 12, cl: 10, say: 'i = 2, ")" closes a bracket. Pop the top: it is ] (the [ was opened last), but we have ")". Mismatch.', csay: 'stack[--top] != ch', tag: [['c2', 'bad'], ['k1', 'bad']], ptr: [['i', 'c2', 'down']] },
    { pl: 13, cl: 10, say: 'Return False. Correct nesting means the most recent opener must be closed first, which is what a stack enforces.', csay: 'return false;' }
  ];
  var s3 = [
    { pl: 4, cl: 3, say: 's = "((". Even length, so it passes the first check.', csay: '', add: chars('((').concat([['sl', 'stack', 0, 2]]) },
    push(0, '(', ')', 0),
    { pl: 10, cl: 7, say: 'i = 1, "(" opens another bracket. Push ). The stack now holds 2 closers.', csay: 'stack[top++] = \')\';', add: [['k1', ')', 2, 2]], tag: [['c1', 'cur']], untag: [['c0', 'cur']], ptr: [['i', 'c1', 'down']] },
    { pl: 11, cl: 11, say: 'Characters left after this one: n - i - 1 = 0, but 2 closers are owed. The stack can never empty, so the Python version returns False at once. The C loop simply ends and top != 0 gives the same answer.', csay: 'ok = (top == 0)', tag: [['k0', 'bad'], ['k1', 'bad']] }
  ];

  window.LESSON = {
    id: 'lc-valid-parentheses', mode: 'ds',
    title: 'Valid Parentheses',
    lede: 'Are all the brackets in a string closed, by the right kind, in the right order? The most recently opened bracket must be the first one closed. That is last-in, first-out, which is exactly a stack.',
    scenes: [
      {
        id: 'valid', title: 'Push closers, pop to match', blurb: 'When you see an opener, push the closer you will need. When you see a closer, it must equal the top of the stack.',
        trap: 'Pop only after checking the stack is not empty: ")" on an empty stack has nothing to match and is invalid. And the answer is "stack is empty at the end", not "no mismatch seen", or "((" would pass.',
        pyCode: PY, cCode: C,
        predict: { q: 'For "({[]})", what is at the top of the stack just before i = 3 is processed?', options: ['(', ']', '}'], answer: 1, why: 'Pushing the closers for ( { [ gives ) } ] from bottom to top, so the top is ], and s[3] is ].' },
        steps: Flow.steps(s1, O)
      },
      {
        id: 'order', title: 'Right counts, wrong order: "([)]"', blurb: 'Counting brackets is not enough. Nesting order matters.',
        trap: 'Using one counter per bracket type accepts "([)]". Only a stack remembers the order in which brackets were opened.',
        pyCode: PY, cCode: C,
        predict: { q: 'Is "([)]" valid?', options: ['Yes: two of each bracket', 'No: ) arrives while [ is still open'], answer: 1, why: 'When ) arrives the most recent opener is [, so the pop yields ] instead of ).' },
        steps: Flow.steps(s2, O)
      },
      {
        id: 'prune', title: 'Leftover openers and early exit', blurb: 'If more closers are owed than characters remain, the string cannot be valid.',
        trap: 'Returning True after the loop instead of "not stack" is wrong for inputs like "((".',
        pyCode: PY, cCode: C,
        predict: { q: 'For "((", when can the Python code return False?', options: ['Only after the loop', 'At i = 1, when the stack is longer than the characters left'], answer: 1, why: 'At i = 1 the stack has 2 entries but 0 characters remain, so len(stack) > n - i - 1 is true.' },
        steps: Flow.steps(s3, O)
      }
    ],
    builtins: [
      ['list.append(x)', 'Push on a stack: O(1) amortised.'],
      ['list.pop()', 'Pop from the end: O(1). Raises IndexError if empty, so guard it.'],
      ['not stack', 'Empty-list test: True when the list is empty.'],
      ['enumerate(s)', 'Index and character together.'],
      ['dict {\'(\': \')\'}', 'Opener to closer; one lookup per opener instead of one per closer.']
    ]
  };

  window.PROBLEM = {
    slug: 'valid-parentheses', url: 'https://leetcode.com/problems/valid-parentheses',
    statement: ['Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.', 'It is valid if open brackets are closed by the same type of bracket, in the correct order, and every close bracket has a matching open bracket.'],
    examples: [['s = "()"', 'true'], ['s = "()[]{}"', 'true'], ['s = "(]"', 'false'], ['s = "([])"', 'true'], ['s = "([)]"', 'false']],
    constraints: ['`1 <= s.length <= 10^4`', '`s` consists of parentheses only: `()[]{}`.'],
    writeup: [
      { h: 'Key insight', p: ['The most recently opened bracket must be the first one closed. That is last-in, first-out behaviour, which is exactly what a stack gives you.'] },
      { h: 'Approach', ul: ['Walk through the string one character at a time.', 'Opening bracket: push it (or, in the optimised version, push its matching closer).', 'Closing bracket: if the stack is empty, return `False`. Otherwise pop; if it is not the matching bracket, return `False`.', 'After the loop the string is valid only if the stack is empty. Leftover openers mean something was never closed.'] },
      { h: 'Optimised version (the one in the visualisation)', ul: ['Odd length is always invalid, since brackets come in pairs: return `False` at once.', 'Push the expected closer instead of the opener: when you see `(` push `)`. On a closing bracket just compare `stack.pop() == ch`, with no dict lookup on every closer.', 'Prune: if the stack holds more items than characters remain, it can never empty.'], p: ['Time and space are still O(n), but bad inputs are rejected sooner. On LeetCode the runtime difference is within noise, so the plain version is fine for interviews; mention these as follow-up optimisations.'] },
      { h: 'Walkthrough: "(]"', p: ['`(` is pushed. `]` pops `(`, but `]` expects `[`. Mismatch, so return `False`.'] },
      { h: 'Edge cases', table: [['Input', 'Expected', 'Why'], ['""', 'True', 'nothing to match (the constraints rule it out)'], ['"("', 'False', 'opener never closed; stack not empty'], ['")"', 'False', 'closer with an empty stack'], ['"(("', 'False', 'leftover openers'], ['"([)]"', 'False', 'right counts, wrong nesting']] },
      { h: 'Complexity', p: ['Time O(n): each character is pushed and popped at most once. Space O(n) in the worst case, a string of all opening brackets.'] },
      { h: 'Common bugs', ul: ['A dict used as the stack, then calling `.add` on it.', 'An `elif` that repeats the opener check and never handles closers.', 'Returning `True` at the end instead of `not stack`.', 'Redundant branches for match and mismatch: one `if/else` covers both.'] }
    ]
  };
})();
