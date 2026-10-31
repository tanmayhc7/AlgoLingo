/* Lesson data: Stacks (structure mode). */
(function () {
  var X = function (i) { return 150 + i * 80; };

  function slots(prefix, n, y) {
    var ops = [];
    for (var i = 0; i < n; i++) ops.push(['node', prefix + i, '', X(i), y, 'cell'], ['tag', prefix + i, 'dim']);
    return ops;
  }
  function put(prefix, i, label) {
    return [['lab', prefix + i, label], ['untag', prefix + i, 'dim']];
  }
  function clear(prefix, i) {
    return [['lab', prefix + i, ''], ['tag', prefix + i, 'dim']];
  }

  /* ----- push and pop ----- */
  var pp = [
    { pl: -1, cl: -1, say: 'A stack: last in, first out. All the action happens at one end, the top. Faded cells are spare room.', csay: 'In C a stack is an array plus an index, top, that names the last item. -1 means empty.', ds: slots('s', 6, 130).concat([['ptr', 'top', null]]) },
    { pl: 1, cl: 1, say: 'append(1) puts 1 on top.', csay: 's[++top] = 1: move top up first, then store.', ds: put('s', 0, '1').concat([['ptr', 'top', 's0', 'up']]) },
    { pl: 2, cl: 2, say: 'append(2).', csay: 's[++top] = 2.', ds: put('s', 1, '2').concat([['ptr', 'top', 's1', 'up']]) },
    { pl: 3, cl: 3, say: 'append(3). The stack, bottom to top, is 1, 2, 3.', csay: 's[++top] = 3.', ds: put('s', 2, '3').concat([['ptr', 'top', 's2', 'up']]) },
    { pl: 4, cl: 4, say: 'pop() removes and returns the top, 3. The most recent item leaves first. O(1).', csay: 'x = s[top--]: read, then move top down. The 3 is still in memory but is no longer part of the stack.', ds: [['hot', 's2']].concat(clear('s', 2), [['ptr', 'top', 's1', 'up']]) },
    { pl: 5, cl: 5, say: 'append(4) reuses the freed spot. The stack is 1, 2, 4.', csay: 's[++top] = 4 overwrites the stale 3.', ds: put('s', 2, '4').concat([['ptr', 'top', 's2', 'up']]) },
    { pl: 6, cl: 6, say: 's[-1] peeks at the top without removing it. Peek is also O(1).', csay: 's[top] peeks without changing top.', ds: [['hot', 's2']] },
  ];

  /* ----- brackets ----- */
  function bracketSteps(str, wrongAt) {
    var ops = [];
    var steps = [];
    var n = str.length;
    var cells = [];
    for (var i = 0; i < n; i++) cells.push(['node', 'c' + i, str[i], X(i), 90, 'cell']);
    steps.push({ pl: -1, cl: -1, say: 'Check that every opener is closed by the matching closer, in the right order. The stack holds openers still waiting.', csay: 'An array and an index hold the pending openers.', ds: cells.concat(slots('k', n, 240)).concat([['ptr', 'top', null]]) });
    var top = -1;
    var open = '([{';
    var pairs = { ')': '(', ']': '[', '}': '{' };
    var stack = [];
    for (var j = 0; j < n; j++) {
      var ch = str[j];
      var ptr = [['ptr', 'ch', 'c' + j, 'up'], ['tag', 'c' + j, 'cur']];
      if (j > 0) ptr.push(['untag', 'c' + (j - 1), 'cur']);
      if (open.indexOf(ch) >= 0) {
        top++;
        stack.push(ch);
        steps.push({ pl: 2, cl: 2, say: ch + ' is an opener. Push it and wait for its closer.', csay: 'Opener: push ' + ch + '.', ds: ptr.concat(put('k', top, ch), [['ptr', 'top', 'k' + top, 'down']]) });
      } else {
        var want = pairs[ch];
        var got = stack.pop();
        if (got !== want) {
          steps.push({ pl: 3, cl: 3, say: ch + ' is a closer, so pop the top. It gives ' + got + ', but ' + ch + ' needs ' + want + '. Mismatch: return False.', csay: 'Closer ' + ch + ' but the top is ' + got + '. Return 0.', ds: ptr.concat([['hot', 'k' + top], ['tag', 'c' + j, 'bad'], ['tag', 'k' + top, 'bad']]) });
          return steps;
        }
        steps.push({ pl: 3, cl: 3, say: ch + ' is a closer, so pop the top. It is ' + got + ', the matching opener. Good.', csay: 'Closer ' + ch + ' matches the top (' + got + '). Pop it.', ds: ptr.concat([['tag', 'c' + j, 'done'], ['hot', 'k' + top], ['tag', 'c' + (j - 0), 'done']], clear('k', top), top > 0 ? [['ptr', 'top', 'k' + (top - 1), 'down']] : [['ptr', 'top', null]]) });
        top--;
      }
    }
    steps.push({ pl: 4, cl: 4, say: 'The string is used up and the stack is empty, so every opener found its closer. Return True. O(n) time, O(n) space for the stack.', csay: 'Input used up and top == -1: balanced. O(n) time.', ds: [['unptr', 'ch']] });
    return steps;
  }

  /* ----- monotonic stack: days until a warmer day ----- */
  var temps = [3, 1, 4, 1, 5];
  var mono = [
    { pl: -1, cl: -1, say: 'For each number, how many steps until a bigger one? Brute force is O(n^2). The stack keeps indexes still waiting for a bigger value, so each index is pushed and popped once.', csay: 'Same: the stack holds indexes still waiting.', ds: temps.map(function (t, i) { return ['node', 'v' + i, String(t), X(i), 80, 'cell']; }).concat(temps.map(function (t, i) { return ['node', 'a' + i, '?', X(i), 160, 'cell']; }), [['note', 'v0', 'values'], ['note', 'a0', 'answers'], ['node', 'lst', 'stack', 70, 260, 'cell'], ['tag', 'lst', 'mark']]) },
  ];
  (function () {
    var stack = [];
    var depth = {};
    var spos = 0;
    var ans = [0, 0, 0, 0, 0];
    temps.forEach(function (t, i) {
      var ops = [['ptr', 'i', 'v' + i, 'up'], ['tag', 'v' + i, 'cur']];
      if (i > 0) ops.push(['untag', 'v' + (i - 1), 'cur']);
      var popped = false;
      while (stack.length && temps[stack[stack.length - 1]] < t) {
        var j = stack.pop();
        var d = i - j;
        ans[j] = d;
        mono.push({ pl: 2, cl: 3, say: temps[j] + ' (index ' + j + ') is smaller than ' + t + ', so its wait is over: answer[' + j + '] = ' + i + ' - ' + j + ' = ' + d + '. Pop it.', csay: 'Pop index ' + j + ': answer[' + j + '] = ' + d + '.', ds: ops.concat([['lab', 'a' + j, String(d)], ['tag', 'a' + j, 'done'], ['rm', 'st' + j], stack.length ? ['ptr', 'top', 'st' + stack[stack.length - 1], 'down'] : ['ptr', 'top', null]]) });
        ops = [];
        popped = true;
      }
      stack.push(i);
      mono.push({ pl: 4, cl: 5, say: 'Push index ' + i + '. Everything below it on the stack is at least as large, so the stack never increases from bottom to top.', csay: 'Push index ' + i + '.', ds: ops.concat([['node', 'st' + i, String(i), 230 + (stack.length - 1) * 80, 260, 'cell'], ['ptr', 'top', 'st' + i, 'down']]) });
    });
    mono.push({ pl: 5, cl: 6, say: 'Indexes left on the stack never found a bigger value, so their answer stays 0. The nested loops look like O(n^2), but every index enters and leaves the stack once: O(n).', csay: 'Leftover indexes keep 0. O(n) total.', ds: [['unptr', 'i'], ['untag', 'v4', 'cur'], ['tag', 'a4', 'done'], ['lab', 'a4', '0']] });
  })();

  window.LESSON = {
    id: 'stacks',
    mode: 'ds',
    title: 'Stacks',
    lede:
      'A stack is last in, first out: you only touch the top. It is a list or array where you only call append and pop. That one restriction is exactly what you need to match nested things (brackets, function calls, undo history) and to remember what you have not finished yet. The monotonic stack is the interview favourite: it answers "next bigger item" questions in one pass.',
    scenes: [
      {
        id: 'push-pop',
        title: 'Push and pop',
        blurb: 'In Python a list already is a stack: append pushes and pop takes from the end. In C it is an array with an index that marks the top.',
        trap: 'pop() and s[-1] on an empty list raise IndexError. In C the same mistake underflows the index and reads or writes outside the array. Check for empty first.',
        pyCode: ['s = []', 's.append(1)', 's.append(2)', 's.append(3)', 's.pop()', 's.append(4)', 's[-1]'],
        cCode: ['int s[6]; int top = -1;', 's[++top] = 1;', 's[++top] = 2;', 's[++top] = 3;', 'x = s[top--];', 's[++top] = 4;', 'x = s[top];'],
        predict: {
          q: 'After the pop on line 5, what does <code>s[-1]</code> give?',
          options: ['3', '2', '1'],
          answer: 1,
          why: 'pop removed 3, the most recently added item. The stack is 1, 2 and the top is 2.',
        },
        steps: pp,
      },
      {
        id: 'brackets',
        title: 'Matching brackets',
        blurb: 'Scan left to right. Push each opener. A closer must match the most recent unclosed opener, which is exactly the top of the stack.',
        trap: 'Two failure modes besides a wrong match: a closer arriving when the stack is empty, and openers left over at the end. Both mean the string is not balanced.',
        pyCode: ['stack = []', 'for ch in s:', '    if ch in "([{": stack.append(ch)', '    elif not stack or stack.pop() != pairs[ch]: return False', 'return not stack'],
        cCode: ['char st[N]; int top = -1;', 'for (i = 0; s[i]; i++) {', '    if (strchr("([{", s[i])) st[++top] = s[i];', '    else if (top < 0 || st[top--] != pair(s[i])) return 0;', '} return top == -1;'],
        predict: {
          q: 'Which of these is balanced?',
          options: ['([)]', '([{}])', '((]'],
          answer: 1,
          why: '([{}]) nests properly: } closes {, ] closes [, ) closes (. ([)] has the closers in the wrong order, and ((] mismatches and leaves openers.',
        },
        steps: bracketSteps('([{}])'),
      },
      {
        id: 'mismatch',
        title: 'A mismatch',
        blurb: 'The same scan on ([)]. The order is wrong even though every bracket type appears in a pair.',
        trap: 'Counting each bracket type separately would call ([)] balanced. Order matters, which is why a stack and not counters.',
        pyCode: ['stack = []', 'for ch in s:', '    if ch in "([{": stack.append(ch)', '    elif not stack or stack.pop() != pairs[ch]: return False', 'return not stack'],
        cCode: ['char st[N]; int top = -1;', 'for (i = 0; s[i]; i++) {', '    if (strchr("([{", s[i])) st[++top] = s[i];', '    else if (top < 0 || st[top--] != pair(s[i])) return 0;', '} return top == -1;'],
        predict: {
          q: 'On <code>([)]</code>, which character triggers the failure?',
          options: ['The first )', 'The last ]', 'The first ('],
          answer: 0,
          why: 'After ( and [ the stack top is [. The ) needs a ( on top, but pops [, so it fails right there.',
        },
        steps: bracketSteps('([)]'),
      },
      {
        id: 'monotonic',
        title: 'Next bigger value',
        blurb: 'The monotonic stack: keep indexes whose answer is not known yet. A new bigger value settles every smaller index on top of the stack.',
        trap: 'The loops are nested but the work is not quadratic. Argue with totals: every index is pushed once and popped at most once.',
        pyCode: ['ans = [0] * len(t); st = []', 'for i, x in enumerate(t):', '    while st and t[st[-1]] < x:', '        j = st.pop(); ans[j] = i - j', '    st.append(i)', 'return ans'],
        cCode: ['int ans[N] = {0}, st[N], top = -1;', 'for (int i = 0; i < n; i++) {', '    while (top >= 0 && t[st[top]] < t[i]) {', '        int j = st[top--]; ans[j] = i - j;', '    }', '    st[++top] = i;', '}'],
        predict: {
          q: 'For values <code>[3, 1, 4, 1, 5]</code>, what is <code>ans[0]</code>?',
          options: ['1', '2', '4'],
          answer: 1,
          why: 'From index 0 (value 3) the next bigger value is 4 at index 2, so the distance is 2.',
        },
        steps: mono,
      },
    ],
    builtins: [
      ['s.append(x)', 'Push onto a list-stack. O(1) amortised.'],
      ['s.pop()', 'Pop the top and return it. O(1). IndexError if empty.'],
      ['s[-1]', 'Peek at the top without removing.'],
      ['if s: / if not s:', 'Truthiness test for non-empty or empty.'],
      ['len(s)', 'Number of items.'],
      ['collections.deque', 'Also works as a stack (append, pop) and has O(1) at both ends.'],
    ],
  };
})();
