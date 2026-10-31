/* Interview depth: Fenwick tree. */
window.DEPTH = {
  thesis:
    'A Fenwick tree (binary indexed tree) supports point updates and prefix queries in O(log n) with a single array and a few lines of code. tree[i] stores the sum of the last (i & -i) values ending at index i. An update climbs by adding the lowest set bit; a query descends by clearing it. Range sum is two prefix queries. It is the lightest tool for "sum over a range with updates", but it needs an invertible operation (sum, xor), so no min or max.',
  why: [
    ['Tiny and fast', 'About ten lines, one array, small constant factor: preferred over a segment tree when it fits.'],
    ['Counting problems', 'Count inversions, count of smaller numbers after self, dynamic rank and order statistics after coordinate compression.'],
    ['Online updates', 'Interleaved updates and queries that break plain prefix sums.'],
    ['Bit tricks in practice', 'It is the best-known real use of i & -i.'],
  ],
  edges: [
    ['1-based indexing', 'With index 0, i & -i is 0 and loops never advance. Shift inputs by one.'],
    ['Size n + 1', 'Allocate n + 1 entries and use the loop condition i <= n.'],
    ['Range sum', 'prefix(r) - prefix(l - 1); prefix(0) must return 0.'],
    ['Setting a value', 'The tree supports adding a delta, not assigning. To set a[i] = v add (v - a[i]); keep the plain array alongside.'],
    ['Large values', 'Use 64-bit totals; sums of n values can overflow 32 bits.'],
    ['Coordinate compression', 'To count over arbitrary integers first map values to ranks 1..m (sort and dedupe).'],
  ],
  cost: [
    ['Update / prefix query', 'O(log n) each.'],
    ['Build from an array', 'O(n log n) with n updates, or O(n) by pushing each cell into its parent.'],
    ['Memory', 'n + 1 values, no pointers.'],
    ['Find k-th element', 'O(log n) by binary descent over the bits.'],
  ],
  internals: [
    ['What a cell covers', 'tree[i] covers (i - lowbit(i), i]. For i = 12 (1100) it covers 9..12; for i = 8 it covers 1..8.'],
    ['Why update goes up', 'The cells whose range includes position p are p, p + lowbit(p), and so on, each doubling the block size.'],
    ['Why query goes down', 'Clearing the lowest set bit peels off one disjoint block at a time until the whole prefix is covered.'],
    ['At most log n steps', 'Each step moves the lowest set bit at least one place higher (update) or removes one set bit (query).'],
  ],
  qa: [
    { lvl: 'junior', q: 'What does a Fenwick tree do that a prefix-sum array cannot?', a: 'It supports changing a value in O(log n); a prefix array would need an O(n) rebuild. Queries are O(log n) instead of O(1).', follow: [] },
    { lvl: 'mid', q: 'Implement update and prefix query.', a: 'add: while i <= n: tree[i] += v; i += i & -i. prefix: while i > 0: s += tree[i]; i -= i & -i. Indexes are 1-based.', follow: [['Range sum?', 'prefix(r) - prefix(l - 1).']] },
    { lvl: 'mid', q: 'Count the number of smaller elements to the right of each element.', a: 'Compress values to ranks. Scan from right to left: query the prefix count of ranks below the current one, then add 1 at its rank. O(n log n).', follow: [] },
    { lvl: 'senior', q: 'Fenwick tree or segment tree?', a: 'Fenwick: less code, less memory, faster constants, but only invertible operations and point-update prefix queries. Segment tree: any associative operation (min, max, gcd), range updates with lazy propagation, and more flexible queries, at the cost of code and memory.', follow: [] },
    { lvl: 'senior', q: 'Why does i & -i give the lowest set bit?', a: 'In two\'s complement -i = ~i + 1. Flipping all bits then adding one carries through the trailing zeros and stops at the lowest set bit, so below and including that bit the two numbers agree and above it they are complements. ANDing leaves only that bit.', follow: [] },
  ],
};
