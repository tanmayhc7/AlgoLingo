/* Lesson data: Two-dimensional DP tables (structure mode). */
(function () {
  var X0 = 230, DX = 90, Y0 = 130, DY = 62;
  function gx(j) { return X0 + j * DX; }
  function gy(i) { return Y0 + i * DY; }
  function id(i, j) { return 'c' + i + '_' + j; }
  var S = 'ACE', T = 'ABCDE';
  function frame() {
    var ops = [];
    ops.push(['node', 'hz', '', gx(0), gy(0) - 62, 'cell']);
    for (var j = 1; j <= T.length; j++) ops.push(['node', 'ht' + j, T[j - 1], gx(j), gy(0) - 62, 'cell'], ['tag', 'ht' + j, 'mark']);
    for (var i = 1; i <= S.length; i++) ops.push(['node', 'hs' + i, S[i - 1], gx(0) - 90, gy(i), 'cell'], ['tag', 'hs' + i, 'mark']);
    for (var r = 0; r <= S.length; r++) for (var c = 0; c <= T.length; c++) {
      if (r === 0 || c === 0) ops.push(['node', id(r, c), '0', gx(c), gy(r), 'cell'], ['tag', id(r, c), 'dim']);
    }
    return ops;
  }
  var dp = [];
  for (var i0 = 0; i0 <= S.length; i0++) { dp.push([]); for (var j0 = 0; j0 <= T.length; j0++) dp[i0].push(0); }
  for (var i1 = 1; i1 <= S.length; i1++) for (var j1 = 1; j1 <= T.length; j1++) dp[i1][j1] = S[i1 - 1] === T[j1 - 1] ? dp[i1 - 1][j1 - 1] + 1 : Math.max(dp[i1 - 1][j1], dp[i1][j1 - 1]);

  var lcs = [{ pl: -1, cl: -1, h: 400, say: 'Longest common subsequence of "ACE" and "ABCDE": the longest sequence of letters that appears in both in the same order, not necessarily contiguous. State: dp[i][j] = LCS length of the first i letters of s and the first j letters of t. The zero border means "one string is empty".', csay: '2D array with a zero first row and column.', ds: frame() }];
  var shown = {};
  for (var row = 1; row <= S.length; row++) {
    var ops = [];
    var explain = '';
    for (var col = 1; col <= T.length; col++) {
      ops.push(['node', id(row, col), String(dp[row][col]), gx(col), gy(row), 'cell']);
      if (S[row - 1] === T[col - 1]) { ops.push(['tag', id(row, col), 'done']); explain += ' "' + S[row - 1] + '" matches in column ' + col + ': take the diagonal value ' + dp[row - 1][col - 1] + ' plus 1 = ' + dp[row][col] + '.'; }
    }
    lcs.push({ pl: 4, cl: 4, h: 400, say: 'Row ' + row + ' (letter "' + S[row - 1] + '"). Where the letters differ, copy the larger of the cell above and the cell to the left.' + explain, csay: 'Fill row ' + row + '.', ds: ops });
  }
  lcs.push({ pl: 6, cl: 6, h: 400, say: 'The answer is the bottom-right cell: 3, the subsequence "ACE". To recover it, walk back from that corner: on a match go diagonally (that letter is in the answer), otherwise move toward the larger neighbour. Time and space O(len(s) x len(t)); keeping only the previous row would cut the space to O(len(t)).', csay: 'return dp[m][n];', ds: [['tag', id(3, 5), 'mark'], ['tag', id(2, 3), 'mark'], ['tag', id(1, 1), 'mark'], ['hot', id(3, 5), id(2, 3), id(1, 1)]] });

  /* unique paths */
  var R = 3, C = 4;
  function gid(i, j) { return 'g' + i + '_' + j; }
  var paths = [{ pl: -1, cl: -1, h: 340, say: 'A robot starts at the top-left of a 3 x 4 grid and can only move right or down. How many different routes reach the bottom-right? State: ways[i][j] = routes to cell (i, j). Recurrence: ways[i][j] = ways[i-1][j] + ways[i][j-1], since you arrive from above or from the left.', csay: 'Same table, no recursion needed.', ds: [] }];
  var w = [];
  for (var a = 0; a < R; a++) { w.push([]); for (var b = 0; b < C; b++) w[a].push(a === 0 || b === 0 ? 1 : w[a - 1][b] + w[a][b - 1]); }
  for (var r2 = 0; r2 < R; r2++) {
    var o2 = [];
    for (var c2 = 0; c2 < C; c2++) o2.push(['node', gid(r2, c2), String(w[r2][c2]), 270 + c2 * 130, 70 + r2 * 70, 'cell']);
    if (r2 > 0) for (var c3 = 1; c3 < C; c3++) o2.push(['tag', gid(r2, c3), 'done']);
    paths.push({ pl: r2 === 0 ? 1 : 3, cl: r2 === 0 ? 1 : 3, h: 340, say: r2 === 0 ? 'The top row: only one way to reach each cell, by always moving right. Likewise the left column has one way each.' : 'Row ' + (r2 + 1) + ': each cell is the cell above plus the cell to its left. For example, cell (' + (r2 + 1) + ', 2) = ' + w[r2 - 1][1] + ' + ' + w[r2][0] + ' = ' + w[r2][1] + '.', csay: 'Fill row ' + (r2 + 1) + '.', ds: o2 });
  }
  paths.push({ pl: 4, cl: 4, h: 340, say: 'The bottom-right cell holds ' + w[R - 1][C - 1] + ' routes. O(R x C) time. The same value is a binomial coefficient, C(5, 2) = 10, because every route is a sequence of 2 downs and 3 rights.', csay: 'return ways[R-1][C-1];', ds: [['tag', gid(R - 1, C - 1), 'mark'], ['hot', gid(R - 1, C - 1)]] });

  window.LESSON = {
    id: 'dp-2d',
    mode: 'ds',
    title: 'Two-dimensional tables',
    lede:
      'When a subproblem is identified by two quantities (two string positions, a row and a column, an item index and a remaining capacity), the table has two dimensions. Each cell is built from neighbours that are already filled: above, left and diagonal. Longest common subsequence, edit distance, knapsack and grid path counting all share this skeleton. The state definition is the whole problem; once it is right, the recurrence is usually three lines.',
    scenes: [
      { id: 'lcs', title: 'Longest common subsequence', blurb: 'A cell compares two prefixes: diagonal plus one on a match, otherwise the better of above and left.', trap: 'Mixing up the table index and the string index. dp[i][j] covers the first i and j characters, so the characters being compared are s[i - 1] and t[j - 1].', pyCode: ['dp = [[0] * (n + 1) for _ in range(m + 1)]', 'for i in range(1, m + 1):', '    for j in range(1, n + 1):', '        # fill dp[i][j]', '        if s[i-1] == t[j-1]: dp[i][j] = dp[i-1][j-1] + 1', '        else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])', 'return dp[m][n]'], cCode: ['int dp[M + 1][N + 1] = {0};', 'for (int i = 1; i <= m; i++)', '    for (int j = 1; j <= n; j++)', '        /* fill dp[i][j] */', '        dp[i][j] = s[i-1] == t[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);', '/* next row */', 'return dp[m][n];'], predict: { q: 'Two strings have lengths 2000 and 3000. How many cells does the full LCS table hold?', options: ['About 5,000', 'About 6,000,000', 'About 2^2000'], answer: 1, why: '(2000 + 1) x (3000 + 1) is about 6 million cells: polynomial, where brute force over subsequences is exponential.' }, steps: lcs },
      { id: 'paths', title: 'Counting grid paths', blurb: 'Each cell is the sum of the cell above and the cell to the left.', trap: 'Forgetting the first row and column. If they start as 0 instead of 1, every cell stays 0.', pyCode: ['ways = [[1] * C for _ in range(R)]', 'for i in range(1, R):', '    for j in range(1, C):', '        ways[i][j] = ways[i-1][j] + ways[i][j-1]', 'return ways[R-1][C-1]'], cCode: ['int ways[R][C]; /* first row and column = 1 */', 'for (int i = 1; i < R; i++)', '    for (int j = 1; j < C; j++)', '        ways[i][j] = ways[i-1][j] + ways[i][j-1];', 'return ways[R-1][C-1];'], predict: { q: 'A 3 x 4 grid, moving only right or down. How many routes reach the far corner?', options: ['7', '10', '12'], answer: 1, why: 'Filling the table gives 10, which equals C(5, 2): choose which 2 of the 5 moves go down.' }, steps: paths },
    ],
    builtins: [
      ['[[0] * (n + 1) for _ in range(m + 1)]', 'The safe way to build a 2D table. Never [[0] * n] * m: all rows would be the same list.'],
      ['dp[-1][-1]', 'The bottom-right answer cell.'],
      ['max(a, b), min(a, b)', 'The usual cell combinators.'],
      ['math.comb(n, k)', 'Binomial coefficient, a closed form for grid path counts.'],
      ['functools.cache', 'Top-down alternative: write the recurrence as a function of (i, j).'],
    ],
  };
})();
