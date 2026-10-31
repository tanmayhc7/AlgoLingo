/* Lesson data: One-dimensional DP tables (structure mode). */
(function () {
  var Y = 170;
  function cx(i) { return 170 + i * 100; }
  function cell(i, v) { return ['node', 'd' + i, v, cx(i), Y, 'cell']; }

  var coin = [{ pl: -1, cl: -1, h: 360, say: 'Fewest coins to make 6 from coins of 1, 3 and 4. Greedy (take the biggest coin first) gives 4 + 1 + 1 = 3 coins, but 3 + 3 uses only 2. Dynamic programming tries every option. State: dp[a] = fewest coins to make amount a. Recurrence: dp[a] = 1 + min(dp[a - c]) over coins c that fit.', csay: 'An int array of size amount + 1.', ds: [['node', 'lab', 'dp', 70, Y, 'cell'], ['tag', 'lab', 'mark']].concat([0, 1, 2, 3, 4, 5, 6].map(function (i) { return cell(i, i === 0 ? '0' : 'inf'); })).concat([0, 1, 2, 3, 4, 5, 6].map(function (i) { return ['note', 'd' + i, 'a=' + i]; })) }];
  var best = [0];
  var coins = [1, 3, 4];
  var CHOICE = { 1: [1], 2: [1], 3: [1, 3], 4: [1, 3, 4], 5: [1, 3, 4], 6: [1, 3, 4] };
  for (var a = 1; a <= 6; a++) {
    var cands = [];
    var used = [];
    coins.forEach(function (c) { if (c <= a) { cands.push('dp[' + (a - c) + ']+1 = ' + (best[a - c] + 1)); used.push(a - c); } });
    var m = Math.min.apply(null, used.map(function (u) { return best[u] + 1; }));
    best[a] = m;
    var bestFrom = used.filter(function (u) { return best[u] + 1 === m; })[0];
    coin.push({ pl: 4, cl: 4, h: 360, say: 'Amount ' + a + ': try each coin that fits. ' + cands.join(', ') + '. The smallest is ' + m + ', so dp[' + a + '] = ' + m + (a === 6 ? '. That is two 3s: DP beats greedy.' : '.'), csay: 'dp[' + a + '] = ' + m + ';', ds: [['lab', 'd' + a, String(m)], ['tag', 'd' + a, 'done'], ['hot'].concat(used.map(function (u) { return 'd' + u; }).concat(['d' + a])), ['ptr', 'a', 'd' + a, 'down']] });
  }
  coin.push({ pl: 5, cl: 5, h: 360, say: 'Answer: dp[6] = 2. Time O(amount x number of coins), space O(amount). Each cell used only earlier cells, which is why filling left to right is valid: the order of the table is the order of dependency.', csay: 'return dp[amount];', ds: [['unptr', 'a'], ['tag', 'd6', 'mark'], ['hot', 'd6']] });

  var roll = [{ pl: -1, cl: -1, h: 320, say: 'Climbing stairs: ways(n) = ways(n-1) + ways(n-2). A full table would store every value, but each step only needs the previous two. Keep just two variables and slide them forward.', csay: 'Two ints instead of an array.', ds: [['node', 'ta', 'a', 70, 100, 'cell'], ['tag', 'ta', 'mark'], ['node', 'tb', 'b', 70, 200, 'cell'], ['tag', 'tb', 'mark'], ['node', 'va', '1', 150, 100, 'cell'], ['node', 'vb', '1', 150, 200, 'cell'], ['note', 'va', 'ways(0)'], ['note', 'vb', 'ways(1)']] }];
  var a1 = 1, b1 = 1;
  for (var n = 2; n <= 6; n++) {
    var c = a1 + b1;
    roll.push({ pl: 3, cl: 3, h: 320, say: 'ways(' + n + ') = ' + a1 + ' + ' + b1 + ' = ' + c + '. Then slide: a takes the old b, b takes the new value.', csay: 'a = b; b = a + b;', ds: [['lab', 'va', String(b1)], ['lab', 'vb', String(c)], ['note', 'va', 'ways(' + (n - 1) + ')'], ['note', 'vb', 'ways(' + n + ')'], ['hot', 'va', 'vb']] });
    a1 = b1; b1 = c;
  }
  roll.push({ pl: 4, cl: 4, h: 320, say: 'ways(6) = 13. Time is still O(n) but space dropped from O(n) to O(1). Whenever a table cell depends only on the last few cells, you can keep just those.', csay: 'O(1) space.', ds: [['tag', 'vb', 'done']] });

  window.LESSON = {
    id: 'dp-1d',
    mode: 'ds',
    title: 'One-dimensional tables',
    lede:
      'Bottom-up dynamic programming drops the recursion and fills a table in order, so every cell is computed from cells already filled. For a single changing quantity (an amount, a position, a length) the table is a one-dimensional array. The recipe: define the state, write the recurrence, set the base cases, choose the fill order, then ask which earlier cells you really need. Often that last question lets you throw the array away.',
    scenes: [
      { id: 'coins', title: 'Coin change', blurb: 'dp[a] = fewest coins for amount a. Each cell is one more than the best smaller amount.', trap: 'Greedy fails on arbitrary coin sets. Also mind unreachable amounts: initialise with infinity, not 0, and return -1 when dp[amount] is still infinity.', pyCode: ['dp = [0] + [inf] * amount', 'for a in range(1, amount + 1):', '    for c in coins:', '        if c <= a:', '            dp[a] = min(dp[a], dp[a - c] + 1)', 'return dp[amount] if dp[amount] < inf else -1'], cCode: ['int dp[A + 1]; dp[0] = 0; for (i...) dp[i] = INF;', 'for (int a = 1; a <= A; a++)', '    for (int k = 0; k < K; k++)', '        if (coins[k] <= a)', '            dp[a] = min(dp[a], dp[a - coins[k]] + 1);', 'return dp[A] < INF ? dp[A] : -1;'], predict: { q: 'Coins are 1, 3 and 4 and the amount is 6. What does the greedy "biggest coin first" strategy give?', options: ['2 coins', '3 coins', '6 coins'], answer: 1, why: 'Greedy takes 4, then 1, then 1: three coins. The optimum is 3 + 3, two coins.' }, steps: coin },
      { id: 'rolling', title: 'Keeping only what you need', blurb: 'If each cell depends on the last two, store two variables, not the table.', trap: 'Updating the variables in the wrong order and overwriting a value you still need. Use tuple assignment, or a temporary.', pyCode: ['a, b = 1, 1', 'for _ in range(n - 1):', '    # a, b = b, a + b', '    a, b = b, a + b', 'return b'], cCode: ['long a = 1, b = 1;', 'for (int i = 2; i <= n; i++) {', '    long t = a + b;', '    a = b; b = t;', '}'], predict: { q: 'The recurrence needs only the previous two values. After rolling, how much extra space does the algorithm use?', options: ['O(n)', 'O(1)', 'O(log n)'], answer: 1, why: 'Two variables regardless of n.' }, steps: roll },
    ],
    builtins: [
      ['[0] + [float("inf")] * n', 'Table with a base case and "unreachable" for the rest.'],
      ['min(dp[a], dp[a - c] + 1)', 'The typical "best of the options" recurrence.'],
      ['max(a, b)', 'Used for "best value" tables such as house robber.'],
      ['a, b = b, a + b', 'Simultaneous assignment to slide a window of two.'],
      ['math.inf', 'Cleaner infinity constant than float("inf").'],
      ['itertools.accumulate', 'Prefix sums, handy for range-sum states.'],
    ],
  };
})();
