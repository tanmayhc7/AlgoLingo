/* Interview depth: Two-dimensional DP tables. */
window.DEPTH = {
  thesis:
    'Two-dimensional DP is the same idea with two indices: a cell stands for a pair of prefixes, a pair of positions, or an item index with a capacity. Most of the work is deciding what the two axes mean. Once that is fixed, the recurrence uses the three neighbours (above, left, diagonal) that are already filled. Edit distance, LCS, knapsack, unique paths and many string problems all use this shape.',
  why: [
    ['Two quantities change together', 'Comparing two strings moves a pointer in each; knapsack changes the item and the remaining capacity; a grid moves in both directions. The table covers every combination once.'],
    ['Cells depend on neighbours', 'The dependency pattern (up, left, up-left) fixes the fill order: rows top to bottom, columns left to right. Check that a cell never reads one that is not yet computed.'],
    ['Reconstruct the solution by walking back', 'The table gives the best value; walking from the final cell back to the start, following whichever option produced each value, yields the actual subsequence, edit sequence or item set.'],
    ['Space shrinks to one row', 'A cell reads only the previous row (and the current one), so two rows, or one with care, are enough: O(columns) space.'],
  ],
  edges: [
    ['Off-by-one between table and string', 'dp[i][j] describes the first i and j characters, so compare s[i - 1] with t[j - 1]. This single slip causes more wrong answers than any other.'],
    ['Empty strings', 'The zero row and column encode "one side is empty". For LCS they hold 0; for edit distance dp[i][0] = i and dp[0][j] = j. They are base cases, not padding.'],
    ['Shared row object', '`[[0] * n] * m` makes every row the same list. Use a comprehension.'],
    ['Memory at scale', 'Two strings of 10^5 characters give 10^10 cells, impossible. Use rolling rows, Hirschberg\'s algorithm to recover the solution in linear space, or a different approach (banded alignment).'],
    ['0/1 versus unbounded knapsack', 'In a 1D rolled knapsack, iterate capacity downward for 0/1 (each item once) and upward for unbounded. Wrong direction silently changes the problem.'],
  ],
  cost: [
    ['LCS / edit distance', 'O(m x n) time; O(m x n) space, or O(min(m, n)) for just the value.'],
    ['0/1 knapsack', 'O(items x capacity) time (pseudo-polynomial) and O(capacity) with a rolled array.'],
    ['unique paths', 'O(R x C) time; O(C) space; or O(1) with the closed form C(R + C - 2, R - 1).'],
    ['matrix chain', 'O(n^3) time, O(n^2) space.'],
  ],
  internals: [
    ['Edit distance recurrence', 'If characters match, dp[i][j] = dp[i-1][j-1]; otherwise 1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace)). Each of the three neighbours is one edit operation.'],
    ['Knapsack is pseudo-polynomial', 'O(n x W) is polynomial in the numeric value of W, not in its bit length. The problem is NP-hard in the input size, which is why large W breaks it.'],
    ['Interval DP', 'dp[i][j] over a substring or range; fill by increasing length so smaller ranges are ready. Palindromic substrings, burst balloons and matrix chain multiplication use it.'],
    ['Bitmask DP', 'When one axis is a subset of up to about 20 elements, the state (mask, last) handles travelling-salesman-style problems in O(2^n x n^2).'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Compute the longest common subsequence of two strings.',
      a: 'Let dp[i][j] be the LCS length of s[:i] and t[:j], with the zero row and column as base cases. If s[i-1] == t[j-1], dp[i][j] = dp[i-1][j-1] + 1; otherwise max(dp[i-1][j], dp[i][j-1]). The answer is dp[m][n]. O(m x n) time and space; keeping only two rows reduces space to O(n) but loses the ability to reconstruct the subsequence directly. To reconstruct, walk back from (m, n): on a match take the character and move diagonally; otherwise move to the larger neighbour.',
      follow: [
        ['How does it differ from longest common substring?', 'A substring must be contiguous, so on a mismatch the cell resets to 0 and the answer is the maximum cell anywhere, not the corner.'],
        ['How is LCS related to edit distance?', 'With only insertions and deletions, edit distance = m + n - 2 x LCS.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Write the recurrence for edit distance (Levenshtein) and explain each term.',
      a: 'dp[i][j] is the minimum edits to turn the first i characters of s into the first j of t. Base: dp[i][0] = i (delete i characters) and dp[0][j] = j (insert j). If s[i-1] == t[j-1], no edit is needed: dp[i][j] = dp[i-1][j-1]. Otherwise 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]), corresponding to deleting from s, inserting into s, or replacing a character. O(m x n) time, O(min(m, n)) space for the value.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: '0/1 knapsack: formulate the DP and shrink it to one dimension. Why must you loop capacity downward?',
      a: 'dp[i][w] is the best value using the first i items with capacity w: dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt] + val) when wt <= w. Row i reads only row i - 1, so a single array suffices if each cell still sees the old row. Looping w from W down to wt guarantees dp[w - wt] has not yet been updated for this item, so each item is used at most once. Looping upward would let dp[w - wt] already include this item, which turns it into the unbounded version. Time O(n x W), space O(W).',
      follow: [
        ['Why is O(n x W) not polynomial?', 'W is a number whose size in bits is log W, so the running time is exponential in the input length. It is pseudo-polynomial.'],
        ['How would you get the chosen items?', 'Keep the full 2D table (or a bitset per row) and walk backwards, or store decisions.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Regular expression matching with . and * is a 2D DP. Describe the state and transitions.',
      a: 'dp[i][j] is True if the first i characters of the text match the first j characters of the pattern. dp[0][0] = True; patterns like a*b*c* can match empty text, so fill dp[0][j] using the rule that x* may match zero occurrences. For each cell: if p[j-1] is a normal character or ".", dp[i][j] = dp[i-1][j-1] and the characters match. If p[j-1] is "*", then either zero repetitions, dp[i][j-2], or one more repetition when the preceding pattern character matches s[i-1]: dp[i-1][j]. Answer dp[m][n]. O(m x n). The subtle parts are the base row and what "*" refers to (the preceding element).',
      follow: [],
    },
    {
      lvl: 'staff',
      q: 'Align two genome sequences of length 10^8 with an edit-distance-like score. What changes?',
      a: 'A full 10^16-cell table is impossible. Practical genome aligners avoid quadratic DP over entire sequences: seed-and-extend (find short exact matches with an index such as a suffix array or FM-index, then run banded DP only around them), banded alignment when the sequences are known to be similar (cost O(n x band)), heuristics such as chaining anchors, and Hirschberg\'s divide-and-conquer to recover the alignment in linear space at about twice the time. For exactness with similar sequences, use algorithms whose cost depends on the edit distance d (O(nd) Myers diff, or the wavefront algorithm). Parallelise along anti-diagonals with SIMD or GPUs, since cells on one anti-diagonal are independent. The right choice depends on divergence, accuracy requirements and hardware.',
      follow: [
        ['What is special about anti-diagonals?', 'A cell depends only on the previous two anti-diagonals, so all cells in one anti-diagonal can be computed in parallel.'],
      ],
    },
  ],
};
