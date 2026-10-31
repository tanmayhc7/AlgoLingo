/* Interview depth: prefix sums and difference arrays. */
window.DEPTH = {
  thesis:
    'A prefix-sum array turns "sum of a range" from a loop into one subtraction after an O(n) build. A difference array does the reverse for updates: adding a value to a whole range touches two cells, and one running total at the end restores the array. Together they are the standard answer to many range queries or many range updates on a static array. If the array changes between queries, use a Fenwick or segment tree instead.',
  why: [
    ['Many queries', 'q range sums cost O(n + q) instead of O(n q).'],
    ['Many range updates', 'm range additions cost O(n + m) instead of O(n m).'],
    ['Subarray-sum questions', 'Subarray sum equals k, longest subarray with sum zero, and equal zeros and ones all reduce to "have I seen this prefix sum before?" with a hash map.'],
    ['2D generalisation', 'A 2D prefix table answers any rectangle sum in O(1) with four lookups.'],
  ],
  edges: [
    ['Off-by-one', 'With p[0] = 0, sum(l..r) = p[r + 1] - p[l]. Using p[r] - p[l - 1] needs special handling for l = 0.'],
    ['Overflow in C', 'Prefix totals grow with n. Use long long when values are large.'],
    ['Difference array size', 'Allocate n + 1 so that d[r + 1] -= v is valid when r = n - 1.'],
    ['Static data only', 'Any change to a[i] invalidates every p[j] with j > i. Rebuilding costs O(n).'],
    ['Negative values', 'Prefix sums work with negatives (unlike a sliding window), which is why they solve subarray-sum questions the window cannot.'],
    ['Reading mid-update', 'Until the running-total pass, a difference array holds differences, not values.'],
  ],
  cost: [
    ['Build prefix', 'O(n) time, O(n) space.'],
    ['Range query', 'O(1).'],
    ['Range update (difference)', 'O(1) per update, O(n) to materialise.'],
    ['Subarray sum = k', 'O(n) time, O(n) space with a hash map of prefix counts.'],
  ],
  internals: [
    ['Prefix and difference are inverses', 'The prefix sum of d is a, and the difference of p is a. Each undoes the other.'],
    ['Why the map trick works', 'sum(i..j) = p[j + 1] - p[i] = k means p[i] = p[j + 1] - k, so look up that earlier prefix value.'],
    ['In place', 'itertools.accumulate or a running variable can overwrite the input when the original is not needed.'],
    ['2D table', 'P[i][j] = a[i][j] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]; a rectangle is four corners with inclusion-exclusion.'],
  ],
  qa: [
    { lvl: 'junior', q: 'How do you answer many range-sum queries on a fixed array quickly?', a: 'Build a prefix-sum array once in O(n); each query is p[r + 1] - p[l] in O(1).', follow: [['What if the array can change?', 'A point update would need an O(n) rebuild, so switch to a Fenwick tree or segment tree with O(log n) update and query.']] },
    { lvl: 'mid', q: 'Count the subarrays whose sum equals k.', a: 'Walk the array keeping a running prefix sum and a dictionary of how often each prefix value has occurred. For each position add the count of (prefix - k), then record the prefix. O(n) time, O(n) space, and it works with negative numbers.', follow: [['Why not a sliding window?', 'A window needs non-negative values so that growing only increases the sum; with negatives the sum is not monotone.']] },
    { lvl: 'mid', q: 'You get 10^5 range-add operations and then must print the array. How?', a: 'Use a difference array: d[l] += v and d[r + 1] -= v for each, then one prefix-sum pass. O(n + m).', follow: [] },
    { lvl: 'senior', q: 'Range sum of a submatrix, many queries.', a: 'Build a 2D prefix table with inclusion-exclusion, then each query is four lookups: P[r2][c2] - P[r1-1][c2] - P[r2][c1-1] + P[r1-1][c1-1]. Mention padding with a zero row and column to avoid bounds checks.', follow: [] },
    { lvl: 'senior', q: 'Updates and queries are interleaved. What do you use?', a: 'Neither prefix nor difference arrays alone: a Fenwick tree (point update, prefix query) or a segment tree (also min, max, lazy range updates), both O(log n). Sqrt decomposition is a simpler middle ground.', follow: [] },
  ],
};
