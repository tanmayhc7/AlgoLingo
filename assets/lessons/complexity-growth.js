/* Lesson data: Counting operations and growth rates (structure mode). */
(function () {
  function cx(k, x0, dx) { return (x0 || 150) + k * (dx || 80); }

  /* linear */
  var linear = [{ pl: -1, cl: -1, h: 330, say: 'Big-O describes how the number of basic steps grows as the input size n grows, ignoring constants. To find it, count how many times the innermost statement runs. Take n = 6.', csay: 'Same counting in C.', ds: [['node', 'cn', 'n = 6', 70, 120, 'cell'], ['tag', 'cn', 'mark']] },
    { pl: 0, cl: 0, h: 330, say: 'One statement with no loop runs once, however large n is. That is O(1), constant time. Examples: indexing a list, a dict lookup, pushing on a stack.', csay: 'One step.', ds: [['node', 'one', 'x', cx(0), 120, 'cell'], ['tag', 'one', 'done'], ['note', 'one', 'O(1)']] },
    { pl: 2, cl: 2, h: 330, say: 'A loop over the input runs the body n times: 6 steps here, 6,000,000 for a million items. Doubling n doubles the work. That is O(n), linear time.', csay: 'n steps.', ds: [0, 1, 2, 3, 4, 5].map(function (k) { return ['node', 'l' + k, String(k), cx(k), 230, 'cell']; }).concat([0, 1, 2, 3, 4, 5].map(function (k) { return ['tag', 'l' + k, 'done']; })).concat([['note', 'l0', 'O(n): 6 steps']]) },
    { pl: 3, cl: 3, h: 330, say: 'Constants and lower-order terms are dropped: a loop that does 3 things per item is 3n steps, and a loop plus a few extra lines is n + 5. Both are O(n). Big-O answers "how does it scale", not "how many nanoseconds".', csay: '3n + 5 is still O(n).', ds: [['hot', 'l0', 'l1', 'l2', 'l3', 'l4', 'l5']] },
  ];

  /* quadratic */
  var quad = [{ pl: -1, cl: -1, h: 460, say: 'A loop inside a loop: for each of the n outer values, the inner loop runs n times. Count the grid of (i, j) pairs.', csay: 'Nested loops.', ds: [] }];
  [[0, 0], [1, 2], [3, 5]].forEach(function (rg, n) {
    var ops = [];
    for (var i = rg[0]; i <= rg[1]; i++) for (var j = 0; j < 6; j++) { ops.push(['node', 'g' + i + '_' + j, String(i * 6 + j + 1), cx(j, 200, 78), 40 + i * 52, 'cell']); ops.push(['tag', 'g' + i + '_' + j, 'done']); }
    quad.push({ pl: 2, cl: 2, h: 460, say: n === 0 ? 'i = 0: the inner loop runs 6 times, so 6 steps.' : n === 1 ? 'i = 1 and i = 2: another 12 steps. Every outer value triggers a full inner loop.' : 'i = 3, 4, 5: 18 more steps.', csay: 'inner loop x ' + (rg[1] - rg[0] + 1), ds: ops });
  });
  quad.push({ pl: 2, cl: 2, h: 460, say: '6 x 6 = 36 steps. In general n x n = n^2: O(n^2), quadratic. Doubling n quadruples the work: for a million items that is a trillion steps. Typical causes: comparing every pair, or a hidden O(n) call (such as `x in list` or `list.pop(0)`) inside an O(n) loop.', csay: 'O(n^2).', ds: [['note', 'g0_0', 'n x n = 36']] });

  /* logarithmic */
  var N = 16;
  function sl(k) { return 60 + k * 58; }
  var logs = [{ pl: -1, cl: -1, h: 330, say: 'Some loops cut the problem down each step instead of walking it. Binary search on a sorted array of 16 numbers looking for 11: each probe throws away half of what remains.', csay: 'Sorted array of 16.', ds: Array.apply(null, Array(N)).map(function (_, k) { return ['node', 'a' + k, String(k + 1), sl(k), 130, 'cell']; }).concat([['ptr', 'lo', 'a0', 'up'], ['ptr', 'hi', 'a15', 'up']]) }];
  var lo = 0, hi = N - 1, target = 11;
  var probes = 0;
  while (lo <= hi) {
    var mid = Math.floor((lo + hi) / 2);
    probes++;
    var ops = [['untag', 'a' + (mid), 'cur']];
    var val = mid + 1;
    var say;
    if (val === target) { ops = [['tag', 'a' + mid, 'done'], ['hot', 'a' + mid]]; say = 'Probe ' + probes + ': the middle is ' + val + ', exactly the target. Found after ' + probes + ' probes.'; logs.push({ pl: 4, cl: 4, h: 330, say: say, csay: 'Found.', ds: ops }); break; }
    var ops2 = [['tag', 'a' + mid, 'cur'], ['hot', 'a' + mid]];
    if (val < target) { for (var d = lo; d <= mid; d++) ops2.push(['tag', 'a' + d, 'dim']); lo = mid + 1; ops2.push(['ptr', 'lo', 'a' + lo, 'up']); say = 'Probe ' + probes + ': the middle is ' + val + ', smaller than 11, so the answer is in the right half. Discard the left half: ' + (hi - lo + 1) + (hi - lo + 1 === 1 ? ' candidate remains.' : ' candidates remain.'); }
    else { for (var d2 = mid; d2 <= hi; d2++) ops2.push(['tag', 'a' + d2, 'dim']); hi = mid - 1; ops2.push(['ptr', 'hi', 'a' + hi, 'up']); say = 'Probe ' + probes + ': the middle is ' + val + ', larger than 11, so look left. ' + (hi - lo + 1) + (hi - lo + 1 === 1 ? ' candidate remains.' : ' candidates remain.'); }
    logs.push({ pl: val < target ? 5 : 6, cl: val < target ? 5 : 6, h: 330, say: say, csay: val < target ? 'lo = mid + 1' : 'hi = mid - 1', ds: ops2 });
  }
  logs.push({ pl: 7, cl: 7, h: 330, say: 'Four probes for 16 items. The number of halvings is log2(n): 20 probes for a million items, 30 for a billion. That is O(log n), and it is why sorted data plus binary search is so powerful. The same shape appears in balanced trees and heaps.', csay: 'O(log n).', ds: [] });

  /* growth table */
  var COLS = ['log n', 'n', 'n log n', 'n^2', '2^n'];
  var ROWS = [['10', ['3', '10', '33', '100', '1000']], ['1000', ['10', '1000', '10^4', '10^6', '10^300']], ['10^6', ['20', '10^6', '2x10^7', '10^12', 'never']]];
  function gx(c) { return 240 + c * 150; }
  function gy(r) { return 130 + r * 70; }
  var table = [{ pl: -1, cl: -1, h: 400, say: 'How fast does each growth rate climb? Rows are input sizes, columns are growth rates; each cell is the number of steps. Suppose a computer does about a billion simple steps per second.', csay: 'Steps for each n.', ds: COLS.map(function (c, k) { return ['node', 'h' + k, c, gx(k), 60, 'cell']; }).concat(COLS.map(function (c, k) { return ['tag', 'h' + k, 'mark']; })).concat(ROWS.map(function (r, i) { return ['node', 'r' + i, 'n=' + r[0], 90, gy(i), 'cell']; })).concat(ROWS.map(function (r, i) { return ['tag', 'r' + i, 'mark']; })) }];
  var notes = ['log n and n: even a million items takes at most a millisecond. Both are comfortable for any practical input.', 'n log n (efficient sorting): about 20 million steps for a million items, around 20 milliseconds. Still fine.', 'n^2: 10^12 steps for a million items, about 17 minutes. Fine for a few thousand items, too slow for millions.', '2^n: the cell for n = 1000 has 300 digits; the sun will burn out first. Exponential algorithms only work for tiny inputs (n up to about 25 to 30).'];
  [[0, 1], [2], [3], [4]].forEach(function (cs, k) {
    var ops = [];
    cs.forEach(function (c) { ROWS.forEach(function (r, i) { ops.push(['node', 'v' + i + '_' + c, r[1][c], gx(c), gy(i), 'cell']); }); });
    if (k === 2) ops.push(['tag', 'v2_3', 'bad']);
    if (k === 3) ops.push(['tag', 'v1_4', 'bad'], ['tag', 'v2_4', 'bad']);
    table.push({ pl: 1, cl: 1, h: 400, say: notes[k], csay: 'Billion steps per second.', ds: ops });
  });
  table.push({ pl: 1, cl: 1, h: 400, say: 'Memorise the ladder: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n). Interview constraints hint at the target: n up to 10^5 means you need O(n log n) or better; n up to 3000 allows O(n^2); n up to 20 allows O(2^n).', csay: 'Read the constraints.', ds: [] });

  window.LESSON = {
    id: 'complexity-growth',
    mode: 'ds',
    title: 'Counting steps and growth rates',
    lede:
      'Big-O notation says how the work of an algorithm grows with the size of its input, ignoring constants and lower-order terms. You find it by counting how many times the innermost statement runs: one pass is O(n), a loop in a loop is O(n^2), halving the problem each step is O(log n). The same counting tells you whether a solution will survive the constraints in an interview, long before you run anything.',
    scenes: [
      { id: 'linear', title: 'Constant and linear', blurb: 'No loop runs once; one loop runs n times. Constants do not matter.', trap: 'Treating a hidden linear operation as constant. `x in some_list`, `list.insert(0, x)`, slicing and `sum(...)` are O(n) calls, even though they look like one line.', pyCode: ['x = a[0]            # O(1)', 'for v in a:         # O(n)', '    total += v', '# 3 operations per item is still O(n)'], cCode: ['int x = a[0];       /* O(1) */', 'for (int i = 0; i < n; i++)   /* O(n) */', '    total += a[i];', '/* 3 operations per item: still O(n) */'], predict: { q: 'A function does 5n + 200 basic steps. What is its time complexity?', options: ['O(5n + 200)', 'O(n)', 'O(200)'], answer: 1, why: 'Drop constant factors and lower-order terms: O(n).' }, steps: linear },
      { id: 'quadratic', title: 'Nested loops', blurb: 'Each of n outer steps runs a full inner loop: n x n steps.', trap: 'Forgetting that the inner loop bounds matter. `for j in range(i)` runs about n^2 / 2 steps in total, which is still O(n^2); two loops one after the other (not nested) cost n + n = O(n).', pyCode: ['for i in range(n):', '    for j in range(n):', '        work(i, j)', '# n x n steps'], cCode: ['for (int i = 0; i < n; i++)', '    for (int j = 0; j < n; j++)', '        work(i, j);', '/* n x n steps */'], predict: { q: 'If n doubles, roughly how does the run time of a quadratic algorithm change?', options: ['It doubles', 'It quadruples', 'It stays the same'], answer: 1, why: 'T(2n) = (2n)^2 = 4n^2 = 4 x T(n).' }, steps: quad },
      { id: 'logarithmic', title: 'Halving: O(log n)', blurb: 'Throwing away half of the candidates each step needs only log2(n) steps.', trap: 'Calling something O(log n) when each step only shrinks by one. Halving (or any constant fraction) is what gives the logarithm.', pyCode: ['lo, hi = 0, len(a) - 1', 'while lo <= hi:', '    mid = (lo + hi) // 2', '    if a[mid] == x: return mid', '    if a[mid] < x: lo = mid + 1', '    else: hi = mid - 1', '# each probe halves the range', 'return -1'], cCode: ['int lo = 0, hi = n - 1;', 'while (lo <= hi) {', '    int mid = lo + (hi - lo) / 2;', '    if (a[mid] == x) return mid;', '    if (a[mid] < x) lo = mid + 1;', '    else hi = mid - 1;', '}  /* each probe halves the range */', 'return -1;'], predict: { q: 'About how many probes does binary search need on a sorted array of one million items?', options: ['About 20', 'About 1000', 'About 500,000'], answer: 0, why: 'log2(1,000,000) is about 20: each probe halves the remaining range.' }, steps: logs },
      { id: 'growth', title: 'How fast things grow', blurb: 'Compare the growth rates at n = 10, 1,000 and 1,000,000.', trap: 'Choosing an algorithm by its constant-factor speed on small inputs. The growth rate wins as n gets large, which is exactly where interviews and production load live.', pyCode: ['# n = 10^6 at about 10^9 steps per second', '# O(n):       ~1 millisecond', '# O(n log n): ~20 milliseconds', '# O(n^2):      ~17 minutes', '# O(2^n):      never finishes'], cCode: ['/* n = 10^6 at about 10^9 steps per second */', '/* O(n):       ~1 millisecond */', '/* O(n log n): ~20 milliseconds */', '/* O(n^2):      ~17 minutes */', '/* O(2^n):      never finishes */'], predict: { q: 'The input has up to 200,000 items and the time limit is about a second. Which complexity is realistic?', options: ['O(n^2)', 'O(n log n)', 'O(2^n)'], answer: 1, why: 'n log n is about 3.5 million steps. n^2 would be 4 x 10^10, far too many for one second.' }, steps: table },
    ],
    builtins: [
      ['len(x), x[i]', 'O(1) on list, tuple, dict, str.'],
      ['x in list / list.index / list.remove', 'O(n). Use a set or dict for O(1) membership.'],
      ['sorted(x), x.sort()', 'O(n log n) (Timsort).'],
      ['bisect.bisect_left(a, x)', 'O(log n) on a sorted list.'],
      ['timeit.timeit', 'Measure real run times to confirm a complexity guess.'],
      ['math.log2(n)', 'Number of halvings.'],
    ],
  };
})();
