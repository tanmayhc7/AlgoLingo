/* Lesson data: N-Queens backtracking (structure mode). Steps come from running the search. */
(function () {
  var N = 4, X0 = 330, DX = 90, Y0 = 35, DY = 47;
  function id(r, c) { return 'q' + r + c; }
  var py = ['def solve(n):', '    cols, d1, d2, board = set(), set(), set(), []', '    def place(r):', '        if r == n: return True               # every row has a queen', '        for c in range(n):', '            if c in cols or r - c in d1 or r + c in d2: continue   # attacked', '            cols.add(c); d1.add(r - c); d2.add(r + c); board.append(c)   # choose', '            if place(r + 1): return True', '            cols.remove(c); d1.remove(r - c); d2.remove(r + c); board.pop()   # undo', '        return False', '    place(0); return board'];
  var c = ['int place(int r) {', '    if (r == n) return 1;                    /* every row has a queen */', '    for (int c = 0; c < n; c++) {', '        if (col[c] || d1[r - c + n] || d2[r + c]) continue;   /* attacked */', '        col[c] = d1[r - c + n] = d2[r + c] = 1; board[r] = c;   /* choose */', '        if (place(r + 1)) return 1;', '        col[c] = d1[r - c + n] = d2[r + c] = 0;               /* undo */', '    }', '    return 0; }'];

  function build() {
    var ops = [], steps = [];
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) ops.push(['node', id(r, c), '', X0 + c * DX, Y0 + r * DY, 'cell']);
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Place ' + N + ' queens on a ' + N + 'x' + N + ' board so none attacks another (no shared row, column or diagonal). Backtracking puts one queen per row, trying each column, and backs up when a row has no safe square.', csay: 'place(0)', ds: ops });
    var board = [], found = false;
    function attacked(r, c) {
      for (var k = 0; k < r; k++) { var bc = board[k]; if (bc === c || Math.abs(bc - c) === r - k) return board.indexOf(bc) >= 0 ? { r: k, c: bc } : null; }
      return null;
    }
    function place(r) {
      if (r === N) return true;
      for (var c = 0; c < N; c++) {
        var att = attacked(r, c);
        if (att) {
          steps.push({ pl: 5, cl: 3, h: 380, say: 'Row ' + r + ', column ' + c + ': attacked by the queen at row ' + att.r + ', column ' + att.c + '. Skip it.', csay: 'continue;', ds: [['tag', id(r, c), 'bad'], ['hot', id(r, c), id(att.r, att.c)]] });
          steps.push({ pl: 4, cl: 2, h: 380, say: 'Try the next column.', csay: 'c++', ds: [['untag', id(r, c), 'bad']] });
          continue;
        }
        board.push(c);
        steps.push({ pl: 6, cl: 4, h: 380, say: 'Row ' + r + ', column ' + c + ' is safe: place a queen (choose).', csay: 'board[' + r + '] = ' + c + ';', ds: [['lab', id(r, c), 'Q'], ['tag', id(r, c), 'done']] });
        if (place(r + 1)) return true;
        board.pop();
        steps.push({ pl: 8, cl: 6, h: 380, say: 'Row ' + (r + 1) + ' had no safe square, so this choice fails. Remove the queen from row ' + r + ', column ' + c + ' (backtrack) and try its next column.', csay: 'undo', ds: [['lab', id(r, c), ''], ['untag', id(r, c), 'done']] });
      }
      return false;
    }
    place(0);
    steps.push({ pl: 10, cl: 8, h: 380, say: 'Solved: queens in columns ' + JSON.stringify(board).replace(/,/g, ', ') + '. Without pruning there are ' + N + '^' + N + ' = 256 placements; checking attacks as we go cuts the search to about ' + steps.length + ' steps here, and for n = 8 from 16 million placements to a few thousand.', csay: 'return 1;', ds: [] });
    return steps;
  }

  window.LESSON = {
    id: 'n-queens',
    mode: 'ds',
    title: 'N-Queens and pruning',
    lede:
      'N-Queens is the classic example of backtracking with pruning. The search never builds a placement it already knows is illegal: as soon as a square is attacked it is skipped, and when a row has no safe square the previous queen is moved. Three sets (columns, and the two diagonals r - c and r + c) make the attack test O(1). The same shape solves Sudoku, word search and many constraint problems.',
    scenes: [
      { id: 'queens', title: '4-Queens search', blurb: 'One queen per row. Red squares are attacked; when a row is stuck the search backs up.', trap: 'Checking the whole board for each candidate costs O(n) per square. Keep three sets: cols, r - c for the "\\" diagonals and r + c for the "/" diagonals; then every test is O(1). In C offset r - c by n to avoid negative indexes.', pyCode: py, cCode: c, predict: { q: 'Two queens at (r1, c1) and (r2, c2) share a diagonal when:', options: ['r1 + c1 = r2 + c2 only', 'r1 - c1 = r2 - c2 or r1 + c1 = r2 + c2', 'r1 = r2'], answer: 1, why: 'Along one diagonal r - c is constant, along the other r + c is constant.' }, steps: build() },
    ],
    builtins: [
      ['set.add / set.remove', 'Track attacked columns and diagonals with O(1) updates.'],
      ['abs(c1 - c2) == abs(r1 - r2)', 'Direct diagonal test between two queens.'],
      ['"." * c + "Q" + "." * (n - c - 1)', 'Build a printed board row.'],
      ['board[r] = c', 'Store one column per row: the whole board in n numbers.'],
      ['int col[N], d1[2*N], d2[2*N]', 'C attack flags; offset r - c by n.'],
      ['for ... continue', 'Prune: skip an illegal choice before recursing.'],
    ],
  };
})();
