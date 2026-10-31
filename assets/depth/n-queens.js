/* Interview depth: N-Queens. */
window.DEPTH = {
  thesis:
    'N-Queens places n queens on an n x n board with no two attacking each other. The backtracking solution puts one queen per row, so row conflicts are impossible by construction, and checks columns and the two diagonals in O(1) with three sets. A row with no safe square forces the previous queen to move. It is the standard example of pruning a constraint search, and the same pattern solves Sudoku and similar puzzles.',
  why: [
    ['The canonical pruning problem', 'Shows you can cut a search tree early instead of enumerating n^n placements.'],
    ['O(1) constraint checks', 'Encoding diagonals as r - c and r + c is a recurring trick.'],
    ['State discipline', 'Choose, recurse, undo with several pieces of state (three sets and the board).'],
    ['Follow-ups', 'Count solutions, return one solution, print boards, or use bitmasks for speed.'],
  ],
  edges: [
    ['n = 1, 2, 3', 'n = 1 has one solution; n = 2 and 3 have none. Return empty lists rather than crashing.'],
    ['Negative diagonal index', 'In C offset r - c by n - 1 (or n) before using it as an array index.'],
    ['Undo every piece of state', 'Remove the column and both diagonals when backtracking, not just the board entry.'],
    ['Duplicates by symmetry', 'Solutions are counted as distinct boards even if one is a rotation or reflection of another.'],
    ['Output format', 'Rows of strings with "Q" and "."; build them from the column list at the end.'],
    ['Large n', 'Recursion depth is only n, but time grows quickly; use bitmasks for n beyond about 12.'],
  ],
  cost: [
    ['Unpruned placements', 'n^n if every cell is tried, n! if one queen per row and one per column.'],
    ['With pruning', 'Far fewer nodes; roughly 15 thousand for n = 8.'],
    ['Attack test', 'O(1) with sets or boolean arrays; O(n) if you scan the board.'],
    ['Space', 'O(n) for the board and the three sets.'],
  ],
  internals: [
    ['One queen per row', 'Rows never conflict, so the search tree has depth n and each level chooses a column.'],
    ['Diagonal ids', 'Squares on the same "\\" diagonal share r - c; on the same "/" diagonal share r + c.'],
    ['Backtrack point', 'When the loop over columns ends without a placement, return False so the caller undoes its own queen.'],
    ['Bitmask version', 'Three integers hold columns and shifted diagonals; free squares are found with (~(cols | d1 | d2)) & mask.'],
  ],
  qa: [
    { lvl: 'junior', q: 'Why one queen per row?', a: 'Each row must contain exactly one queen anyway, so placing by row makes row conflicts impossible and shrinks the search tree to depth n.', follow: [] },
    { lvl: 'mid', q: 'How do you test a diagonal conflict in O(1)?', a: 'Squares on one diagonal share r - c, on the other share r + c. Keep sets of used columns, r - c values and r + c values; a square is safe if none of its three values is in its set.', follow: [] },
    { lvl: 'mid', q: 'What does the algorithm do when a row has no safe square?', a: 'It returns failure to the previous row, which removes its queen (clearing the column and both diagonals) and tries its next column.', follow: [] },
    { lvl: 'senior', q: 'Count the solutions for n = 14 quickly.', a: 'Use bitmasks: cols, left diagonals and right diagonals as integers; at each row take the free bits with ~(cols | d1 | d2) & full, iterate the set bits, and shift the diagonals for the next row. Use symmetry (only try half the first-row columns and double) for another 2x.', follow: [] },
    { lvl: 'senior', q: 'How is Sudoku similar?', a: 'Same template: pick the empty cell with the fewest options, try each digit allowed by row, column and box sets, recurse, and undo. Choosing the most constrained cell first is the pruning heuristic.', follow: [] },
  ],
};
