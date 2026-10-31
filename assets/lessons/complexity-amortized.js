/* Lesson data: Amortised cost and space (structure mode). */
(function () {
  function sl(k) { return 60 + k * 58; }
  var Y = 150, CY = 270;

  var steps = [{ pl: -1, cl: -1, h: 400, say: 'A dynamic array (a Python list, a C++ vector) stores items in a block of fixed capacity. Appending is cheap while there is room, but when the block is full it must allocate a bigger one and copy everything. How can append be called O(1)? Start with capacity 1.', csay: 'Array with capacity and size.', ds: [['node', 's0', '', sl(0), Y, 'cell'], ['tag', 's0', 'dim'], ['note', 's0', 'cap 1'], ['node', 'cl', 'copies', 70, CY, 'cell'], ['tag', 'cl', 'mark'], ['node', 'cv', '0', 160, CY, 'cell']] }];
  var cap = 1, size = 0, copies = 0;
  for (var n = 1; n <= 9; n++) {
    var ops = [];
    var say;
    if (size === cap) {
      var newcap = cap * 2;
      for (var k = cap; k < newcap; k++) ops.push(['node', 's' + k, '', sl(k), Y, 'cell'], ['tag', 's' + k, 'dim']);
      copies += cap;
      ops.push(['note', 's0', 'cap ' + newcap], ['lab', 'cv', String(copies)]);
      var hot = ['hot']; for (var h = 0; h < cap; h++) hot.push('s' + h);
      ops.push(hot);
      say = 'append(' + n + '): the array is full (size ' + size + ' = capacity ' + cap + '). Allocate capacity ' + newcap + ', copy the ' + size + ' existing items (cost ' + size + '), then write the new one. Total copies so far: ' + copies + '.';
      cap = newcap;
    } else {
      say = 'append(' + n + '): there is room, so just write the item. One step, no copying.';
    }
    ops.push(['lab', 's' + size, String(n)], ['untag', 's' + size, 'dim'], ['tag', 's' + size, 'done']);
    size++;
    steps.push({ pl: size === 1 || ops.some(function (o) { return o[0] === 'lab' && o[1] === 'cv'; }) ? 2 : 4, cl: size === 1 || ops.some(function (o) { return o[0] === 'lab' && o[1] === 'cv'; }) ? 2 : 4, h: 400, say: say, csay: 'append ' + n, ds: ops });
  }
  steps.push({ pl: 5, cl: 5, h: 400, say: 'Nine appends caused 15 element copies in total, fewer than two per append. Because the capacity doubles, the copies form 1 + 2 + 4 + 8 + ... which sums to less than 2n. So n appends cost O(n) in total: O(1) amortised per append, even though one unlucky append costs O(n). If capacity grew by a fixed +10 instead of doubling, the copies would add up to O(n^2).', csay: 'Amortised O(1).', ds: [['tag', 'cv', 'mark'], ['hot', 'cv']] });

  /* space */
  var SY = 180;
  function ck(k) { return 150 + k * 90; }
  var space = [{ pl: -1, cl: -1, h: 360, say: 'Time is not the only cost: memory counts too. A recursive sum of 1..4 must keep every unfinished call alive until the deepest call returns. Each cell in the "stack" row is one frame.', csay: 'Each call pushes a frame on the machine stack.', ds: [['node', 'sl', 'stack', 70, SY, 'cell'], ['tag', 'sl', 'mark']] }];
  for (var d = 0; d <= 4; d++) space.push({ pl: 1, cl: 1, h: 360, say: 'total(' + (4 - d) + ') is called' + (d === 4 ? ': the base case, n = 0, so the recursion stops going deeper. The stack holds 5 frames.' : ', and waits for total(' + (3 - d) + '). Frames on the stack: ' + (d + 1) + '.'), csay: 'push frame ' + (d + 1), ds: [['node', 'f' + d, 't(' + (4 - d) + ')', ck(d), SY, 'cell'], ['tag', 'f' + d, d === 4 ? 'done' : 'cur']].concat(d > 0 ? [['untag', 'f' + (d - 1), 'cur']] : []) });
  space.push({ pl: 2, cl: 2, h: 360, say: 'The calls return one by one and the frames disappear. The peak was n + 1 frames, so the recursive version uses O(n) extra space. At about 100 bytes per frame, a depth of a million would need 100 MB, and Python would raise RecursionError long before that.', csay: 'Peak stack: O(n).', ds: [['rm', 'f4'], ['rm', 'f3'], ['rm', 'f2'], ['rm', 'f1'], ['rm', 'f0']] });
  space.push({ pl: 5, cl: 5, h: 360, say: 'The loop version keeps a single running variable, whatever n is: O(1) extra space and the same O(n) time. Space complexity counts everything extra the algorithm allocates, including the call stack, not the input itself.', csay: 'One variable.', ds: [['node', 'acc', '10', ck(0), SY, 'cell'], ['tag', 'acc', 'done'], ['note', 'acc', 'total: O(1)']] });

  window.LESSON = {
    id: 'complexity-amortized',
    mode: 'ds',
    title: 'Amortised cost and space',
    lede:
      'Two refinements complete the picture. Amortised analysis averages the cost over a sequence of operations: a dynamic array append is occasionally expensive (a copy) but averages O(1), because expensive steps are rare enough that their cost is paid for by the cheap ones. And complexity has a second axis, space: extra memory used, including the recursion stack. Interviewers ask for both, and for the worst case versus the average case.',
    scenes: [
      { id: 'doubling', title: 'Dynamic array doubling', blurb: 'Most appends are cheap; occasionally one copies everything. Doubling makes the average constant.', trap: 'Quoting the worst case of a single operation as the cost of the sequence. One append can be O(n), but n appends in a row are O(n) in total, which is what O(1) amortised means. It is not a probabilistic average either; it is a guarantee over the sequence.', pyCode: ['# CPython list.append, idealised', 'if size == capacity:', '    capacity *= 2; copy all items', 'items[size] = x', 'size += 1', '# n appends: O(n) total'], cCode: ['/* realloc-based vector */', 'if (size == capacity) {', '    capacity *= 2; items = realloc(items, capacity * sizeof *items); }', 'items[size++] = x;', '/* n appends: O(n) total */', '/* amortised O(1) */'], predict: { q: 'Growing the array by a fixed 10 slots each time (instead of doubling), what does n appends cost in total?', options: ['O(n)', 'O(n^2)', 'O(log n)'], answer: 1, why: 'There are about n / 10 resizes, each copying up to n items, so the copying alone is O(n^2 / 10) = O(n^2).' }, steps: steps },
      { id: 'space', title: 'Space: the call stack counts', blurb: 'Recursion keeps a frame per unfinished call. The depth is the extra space.', trap: 'Reporting "O(1) space" for a recursive algorithm. If the recursion depth is n (or log n), that is O(n) (or O(log n)) stack space. Include output size only if the interviewer wants it, and say so.', pyCode: ['def total(n):', '    if n == 0: return 0', '    return n + total(n - 1)   # depth n: O(n) space', '', '# iterative version', 'acc = 0; for i in range(1, n + 1): acc += i   # O(1)'], cCode: ['int total(int n) {', '    if (n == 0) return 0;', '    return n + total(n - 1);   /* depth n: O(n) stack */', '}', '/* iterative version */', 'int acc = 0; for (int i = 1; i <= n; i++) acc += i;   /* O(1) */'], predict: { q: 'A recursive depth-first search on a balanced binary tree with n nodes uses how much stack space?', options: ['O(1)', 'O(log n)', 'O(n)'], answer: 1, why: 'The stack depth equals the tree height, about log2(n) for a balanced tree (but O(n) for a skewed one).' }, steps: space },
    ],
    builtins: [
      ['list.append / pop()', 'O(1) amortised at the end.'],
      ['list.insert(0, x) / pop(0)', 'O(n): every element shifts.'],
      ['sys.getsizeof(obj)', 'Shallow size in bytes: measures space.'],
      ['tracemalloc', 'Measure real peak memory of a code block.'],
      ['collections.deque', 'O(1) at both ends.'],
      ['sys.getrecursionlimit()', 'The default recursion depth limit (about 1000).'],
    ],
  };
})();
