/* Lesson data: Dynamic programming, from recursion to memoisation (structure mode). */
(function () {
  function pos(i) {
    var level = Math.floor(Math.log(i) / Math.LN2);
    var first = Math.pow(2, level);
    return [Math.round((1000 * (2 * (i - first) + 1)) / Math.pow(2, level + 1)), 50 + level * 85];
  }
  /* slot -> n for fib(5) call tree */
  var FIB = { 1: 5, 2: 4, 3: 3, 4: 3, 5: 2, 6: 2, 7: 1, 8: 2, 9: 1, 10: 1, 11: 0, 12: 1, 13: 0, 16: 1, 17: 0 };
  function val(n) { return n < 2 ? n : val(n - 1) + val(n - 2); }
  function drawTree(slots, withNote) {
    var ops = [];
    slots.forEach(function (i) { var p = pos(i); ops.push(['node', 't' + i, 'f' + FIB[i], p[0], p[1], 'circle']); });
    slots.forEach(function (i) {
      if (slots.indexOf(2 * i) >= 0) ops.push(['edge', 't' + i, 't' + 2 * i, 'l']);
      if (slots.indexOf(2 * i + 1) >= 0) ops.push(['edge', 't' + i, 't' + (2 * i + 1), 'r']);
    });
    return ops;
  }
  function post(slots, root) {
    var out = [];
    (function walk(i) { if (slots.indexOf(i) < 0) return; walk(2 * i); walk(2 * i + 1); out.push(i); })(root);
    return out;
  }
  var ALL = Object.keys(FIB).map(Number);

  var naive = [{ pl: -1, cl: -1, h: 480, say: 'Fibonacci defined by recursion: fib(n) = fib(n-1) + fib(n-2). Each node is one call. Watch how the same calls appear again and again: fib(3) twice, fib(2) three times.', csay: 'Same recursion in C.', ds: drawTree(ALL) }];
  var order = post(ALL, 1);
  var calls = 0;
  order.forEach(function (i) {
    calls++;
    var n = FIB[i];
    naive.push({ pl: n < 2 ? 1 : 2, cl: n < 2 ? 1 : 2, h: 480, say: n < 2 ? 'fib(' + n + ') is a base case and returns ' + n + '.' : 'Both children are done, so fib(' + n + ') returns ' + val(n - 1) + ' + ' + val(n - 2) + ' = ' + val(n) + '.', csay: 'return ' + val(n) + ';', ds: [['note', 't' + i, '=' + val(n)], ['tag', 't' + i, 'done'], ['hot', 't' + i]] });
  });
  naive.push({ pl: 2, cl: 2, h: 480, say: 'Fifteen calls to compute fib(5). The tree roughly doubles with every extra n, so fib(40) makes over 300 million calls: O(2^n). Almost all of that work repeats earlier work. The highlighted nodes show it: fib(3) is computed twice and fib(2) three times.', csay: 'O(2^n) calls.', ds: [['tag', 't3', 'bad'], ['tag', 't4', 'bad'], ['tag', 't5', 'mark'], ['tag', 't6', 'mark'], ['tag', 't8', 'mark'], ['hot', 't3', 't4', 't5', 't6', 't8']] });

  /* memoised */
  var USED = [1, 2, 3, 4, 5, 8, 9, 16, 17];
  var CACHE_Y = 470;
  function cx(k) { return 150 + k * 90; }
  var memo = [{ pl: -1, cl: -1, h: 540, say: 'Memoisation: before computing fib(n), look in a cache; after computing it, store the answer. A repeated call then costs one lookup. The row "cache" will fill as answers are stored.', csay: 'A cache array initialised to unknown.', ds: drawTree(USED).concat([['node', 'cl', 'cache', 70, CACHE_Y, 'cell'], ['tag', 'cl', 'mark']]) }];
  var cacheN = 0;
  [[16, 'new'], [17, 'new'], [8, 'new'], [9, 'new'], [4, 'new'], [5, 'hit'], [2, 'new'], [3, 'hit'], [1, 'new']].forEach(function (x) {
    var i = x[0], kind = x[1];
    var n = FIB[i];
    var ops = [['note', 't' + i, '=' + val(n)], ['hot', 't' + i]];
    var say, csay;
    if (kind === 'hit') {
      ops.push(['tag', 't' + i, 'mark']);
      say = 'fib(' + n + ') is already in the cache: return ' + val(n) + ' at once. This subtree is never explored; its children do not even exist in the picture.';
      csay = 'cache hit: return ' + val(n) + '.';
    } else {
      ops.push(['tag', 't' + i, 'done']);
      if (n >= 2) { ops.push(['node', 'k' + n, 'f' + n + '=' + val(n), cx(cacheN), CACHE_Y, 'cell']); cacheN++; }
      say = n < 2 ? 'fib(' + n + ') is a base case and returns ' + n + '.' : 'fib(' + n + ') computed as ' + val(n - 1) + ' + ' + val(n - 2) + ' = ' + val(n) + ' and stored in the cache.';
      csay = n < 2 ? 'return ' + n + ';' : 'cache[' + n + '] = ' + val(n) + ';';
    }
    memo.push({ pl: kind === 'hit' ? 2 : (n < 2 ? 1 : 4), cl: kind === 'hit' ? 2 : (n < 2 ? 1 : 4), h: 540, say: say, csay: csay, ds: ops });
  });
  memo.push({ pl: 4, cl: 4, h: 540, say: 'Only five real computations (fib 5, 4, 3, 2 and the base cases), with two cache hits. Each value of n is computed once, so the time is O(n), with O(n) cache plus O(n) recursion depth. This is dynamic programming in its top-down form: recursion plus a cache.', csay: 'O(n) time, O(n) space.', ds: [] });

  window.LESSON = {
    id: 'dp-recursion',
    mode: 'ds',
    title: 'From recursion to memoisation',
    lede:
      'Dynamic programming applies when a problem breaks into overlapping subproblems with an optimal substructure: the best answer is built from best answers to smaller pieces. Naive recursion recomputes the same subproblem again and again, which is why it can explode exponentially. Store each answer the first time and reuse it: memoisation turns exponential into polynomial. The core skill is to define the state (what identifies a subproblem) and the recurrence (how it is built from smaller ones).',
    scenes: [
      { id: 'naive', title: 'Plain recursion repeats work', blurb: 'The call tree for fib(5): the same subproblems show up many times.', trap: 'Not noticing the overlap. If a recursive function has several branches and the arguments come from a small set, the same call is probably repeating.', pyCode: ['def fib(n):', '    if n < 2: return n', '    return fib(n - 1) + fib(n - 2)'], cCode: ['int fib(int n) {', '    if (n < 2) return n;', '    return fib(n - 1) + fib(n - 2);', '}'], predict: { q: 'Roughly how many calls does the naive fib(30) make?', options: ['About 30', 'About 900', 'About 2.7 million'], answer: 2, why: 'The number of calls grows like 1.6^n, about 2.7 million for n = 30, and the work for n = 40 is a hundred times larger.' }, steps: naive },
      { id: 'memo', title: 'Memoisation', blurb: 'Look up the cache first; store each result once. Each subproblem is computed once.', trap: 'Using a mutable default argument as the cache, or forgetting to include every parameter that affects the answer in the cache key. The key must identify the subproblem completely.', pyCode: ['cache = {}', 'def fib(n):', '    if n < 2: return n', '    if n in cache: return cache[n]', '    cache[n] = fib(n - 1) + fib(n - 2)', '    return cache[n]'], cCode: ['long cache[N];   /* -1 = unknown */', 'long fib(int n) {', '    if (n < 2) return n;', '    if (cache[n] >= 0) return cache[n];', '    cache[n] = fib(n - 1) + fib(n - 2);', '    return cache[n];', '}'], predict: { q: 'With memoisation, how many times is fib(3) actually computed (not looked up)?', options: ['Once', 'Twice', 'Three times'], answer: 0, why: 'The first call computes and stores it. Every later call is a cache lookup.' }, steps: memo },
    ],
    builtins: [
      ['functools.cache', 'Decorator that memoises a function with hashable arguments (unbounded cache).'],
      ['functools.lru_cache(maxsize=None)', 'Same, with an optional size limit. Works on any hashable arguments.'],
      ['fib.cache_info()', 'Hits, misses and size, handy to confirm the cache is working.'],
      ['fib.cache_clear()', 'Reset between test cases.'],
      ['sys.setrecursionlimit', 'Deep top-down recursion hits the limit near 1000 frames; a bottom-up table avoids it.'],
    ],
  };
})();
