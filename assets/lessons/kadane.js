/* Lesson data: Kadane's maximum subarray (structure mode). Row 1 is the input, row 2 the best sum ending at each index. */
(function () {
  var A = [-2, 1, -3, 4, -1, 2, 1, -5, 4], N = A.length, BX = 180, DX = 86, IY = 32, AY = 82, EY = 130;
  function cx(i) { return BX + i * DX; }
  function kad() {
    var steps = [], ops = [], i;
    ops.push(['node', 'la', 'a', 90, AY, 'cell'], ['tag', 'la', 'dim'], ['node', 'le', 'cur', 90, EY, 'cell'], ['tag', 'le', 'dim']);
    for (i = 0; i < N; i++) {
      ops.push(['node', 'i' + i, String(i), cx(i), IY, 'cell'], ['tag', 'i' + i, 'dim']);
      ops.push(['node', 'a' + i, String(A[i]), cx(i), AY, 'cell']);
      ops.push(['node', 'e' + i, '', cx(i), EY, 'cell']);
    }
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Find the contiguous run with the largest sum. Checking every run is O(n^2). Kadane\'s idea: let cur be the best sum of a run that ENDS at the current index. Either extend the previous run (cur + a[i]) or start fresh at a[i], whichever is larger.', csay: 'int a[9] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};', ds: ops });
    var cur = A[0], best = A[0], bestEnd = 0, start = 0, bestStart = 0;
    steps.push({ pl: 1, cl: 1, h: 380, say: 'Start with cur = best = a[0] = ' + A[0] + '. (Starting from -infinity or 0 breaks the all-negative case.)', csay: 'cur = best = a[0];', ds: [['lab', 'e0', String(cur)], ['tag', 'e0', 'done'], ['tag', 'a0', 'cur']] });
    for (i = 1; i < N; i++) {
      var ext = cur + A[i], fresh = A[i], restart = fresh > ext;
      if (restart) { cur = fresh; start = i; } else cur = ext;
      var o = [['lab', 'e' + i, String(cur)], ['hot', 'a' + i, 'e' + i]];
      var better = cur > best;
      if (better) { best = cur; bestEnd = i; bestStart = start; }
      steps.push({ pl: 3, cl: 3, h: 380, say: 'i = ' + i + ': extend gives ' + (ext) + ', starting fresh gives ' + fresh + '. ' + (restart ? 'Fresh is bigger, so the old run only hurts: restart here, cur = ' + cur + '.' : 'Extending is at least as good: cur = ' + cur + '.') + (better ? ' New best: ' + best + '.' : ' Best stays ' + best + '.'), csay: 'cur = max(a[i], cur + a[i]);  /* ' + cur + ' */', ds: o.concat([[better ? 'tag' : 'untag', 'e' + i, better ? 'hot' : 'done']]) });
    }
    var f = [];
    for (i = bestStart; i <= bestEnd; i++) f.push(['tag', 'a' + i, 'done']);
    steps.push({ pl: 5, cl: 7, h: 380, say: 'The best run is a[' + bestStart + '..' + bestEnd + '] = ' + A.slice(bestStart, bestEnd + 1).join(', ') + ' with sum ' + best + '. One pass, O(n) time, O(1) space (cur and best are the only state; the second row is just for the picture).', csay: 'return best;', ds: f });
    return steps;
  }
  window.LESSON = {
    id: 'kadane',
    mode: 'ds',
    title: 'Kadane: maximum subarray',
    lede:
      'The maximum subarray problem asks for the contiguous run with the largest sum. Kadane\'s algorithm is dynamic programming with one number of state: the best sum of a run ending at the current index is either the previous best plus this value, or just this value. When the running total goes negative it can only drag the next run down, so it is dropped. One pass, O(n) time, O(1) space. The same extend-or-restart idea solves maximum product subarray, best time to buy and sell stock, and circular subarray variants.',
    scenes: [
      { id: 'kadane', title: 'Extend or restart', blurb: 'At each index choose max(a[i], cur + a[i]). The second row shows the best sum of a run ending there.', trap: 'Initialising best to 0 (wrong when every value is negative: the answer is the largest single value, not an empty run) and returning the sum of the run when you need its indexes. To get the indexes, track where cur restarted.',
        pyCode: ['def max_subarray(a):', '    cur = best = a[0]', '    for x in a[1:]:', '        cur = max(x, cur + x)', '        best = max(best, cur)', '    return best'],
        cCode: ['int max_subarray(const int *a, int n) {', '    int cur = a[0], best = a[0];', '    for (int i = 1; i < n; i++) {', '        cur = (a[i] > cur + a[i]) ? a[i] : cur + a[i];', '        if (cur > best) best = cur;', '    }', '    return best;', '}'],
        predict: { q: 'What does max_subarray return for [-3, -1, -2]?', options: ['0', '-1', '-6'], answer: 1, why: 'The run must be non-empty. The best single value is -1; starting best at 0 would wrongly return 0.' },
        steps: kad() },
    ],
    builtins: [
      ['max(x, cur + x)', 'Extend the run or restart at x.'],
      ['a[1:]', 'Slice copy: use an index loop in C, or itertools.islice(a, 1, None) to avoid the copy in Python.'],
      ['float("-inf")', 'Alternative start for best when you prefer not to special-case a[0].'],
      ['INT_MIN (C)', 'Same idea in C; beware cur + x overflowing if you start cur at INT_MIN.'],
    ],
  };
})();
