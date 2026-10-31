/* Interview depth: segment tree. */
window.DEPTH = {
  thesis:
    'A segment tree is a binary tree whose nodes each store a summary (sum, min, max, gcd and so on) of a contiguous segment of the array. A range query combines O(log n) whole segments and a point update rewrites a single leaf-to-root path, so both cost O(log n). With lazy propagation it also supports range updates in O(log n). It handles any associative operation, which makes it more general than a Fenwick tree.',
  why: [
    ['General operations', 'Range min, max, gcd, count, or any associative combine, with updates.'],
    ['Range updates', 'Lazy propagation adds "add v to every element of a range" and "set range to v" in O(log n).'],
    ['Classic problems', 'Range minimum with updates, count of range sums, skyline, and "k-th" queries.'],
    ['Interview signal', 'Shows you can design a recursive structure and reason about its invariants and cost.'],
  ],
  edges: [
    ['Array size', 'A recursive tree over n values needs up to 4n slots when n is not a power of two.'],
    ['Three-case query', 'Every node is outside, fully inside or partial. Missing or overlapping cases cause wrong sums.'],
    ['Identity element', 'Outside nodes return the identity: 0 for sum, +infinity for min, -infinity for max, 0 for gcd.'],
    ['Stale ancestors', 'After a point update every ancestor must be recomputed from its children.'],
    ['Mid computation', 'lo + (hi - lo) / 2 avoids overflow for very large ranges in C.'],
    ['Lazy tags', 'Push pending updates down before descending into a node, or answers use stale children.'],
  ],
  cost: [
    ['Build', 'O(n).'],
    ['Query / point update', 'O(log n).'],
    ['Range update with lazy tags', 'O(log n).'],
    ['Memory', 'O(n): about 2n nodes for a bottom-up tree, up to 4n with the recursive layout.'],
  ],
  internals: [
    ['Heap layout', 'Node k has children 2k and 2k + 1 and parent k // 2. No pointers are needed.'],
    ['Why queries are O(log n)', 'At each level at most two nodes are partially covered, so at most about 4 log n nodes are visited.'],
    ['Bottom-up version', 'With n leaves stored at indexes n..2n-1, queries and updates run in short loops without recursion.'],
    ['Associativity', 'Combining left and right children in order requires only that the operation is associative, not commutative.'],
  ],
  qa: [
    { lvl: 'junior', q: 'What does each node of a sum segment tree store?', a: 'The sum of its segment. Leaves hold single values; a parent holds the sum of its two children. The root holds the sum of the whole array.', follow: [] },
    { lvl: 'mid', q: 'How is a range query answered in O(log n)?', a: 'Recurse from the root. If a node\'s segment is outside the query return the identity; if it is fully inside return its stored value; otherwise combine the answers from both children. Only O(log n) nodes are partial.', follow: [] },
    { lvl: 'mid', q: 'How do you update one element?', a: 'Walk to the leaf, set it, then recompute each ancestor from its children on the way back up. O(log n).', follow: [] },
    { lvl: 'senior', q: 'Add v to every element of a range, many times, with sum queries.', a: 'Lazy propagation: each node keeps a pending add. An update that fully covers a node adds v * length to the node\'s sum and stores v as a tag; before visiting children push the tag down. Queries do the same push-down. All operations stay O(log n).', follow: [] },
    { lvl: 'senior', q: 'Segment tree, Fenwick tree or sqrt decomposition?', a: 'Fenwick for sum/xor with point updates; segment tree for min/max/gcd, range updates and richer queries; sqrt decomposition when the operation is awkward to merge but O(sqrt n) per operation is acceptable. Offline problems may be solvable with sorting and a Fenwick tree instead.', follow: [] },
  ],
};
