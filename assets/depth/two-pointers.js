/* Interview depth: two pointers. */
window.DEPTH = {
  thesis:
    'Two pointers replaces nested loops with one pass by keeping two indexes and a rule that says which one moves. The rule is justified by an argument that the skipped candidates cannot be part of an answer. In interviews you win by naming the shape (opposite ends or read/write), stating why discarding is safe, and handling the boundaries cleanly.',
  why: [
    ['Quadratic to linear', 'Pair sums, container with most water, palindromes, merging sorted arrays and removing duplicates are all O(n) with two pointers, versus O(n^2) brute force.'],
    ['O(1) extra space', 'The read/write form rearranges data in place, which interviewers often require.'],
    ['It is just pointer arithmetic', 'In C the same code uses pointers or indexes, so it is familiar territory for systems-minded candidates.'],
    ['Foundation for harder patterns', '3Sum (fix one, two-pointer the rest), Dutch national flag, and linked list cycle detection (slow and fast pointers) all build on it.'],
  ],
  edges: [
    ['Needs order or structure', 'The opposite-ends argument requires sorted data (or another monotone relationship). On unsorted data sort first (O(n log n)) or use a hash set.'],
    ['Termination condition', 'left < right avoids pairing an element with itself; left <= right is needed for problems that process a single middle element.'],
    ['Duplicates in 3Sum-style problems', 'Skip equal neighbours after moving a pointer, or you will output duplicate triplets.'],
    ['Write pointer ordering', 'The write index must never pass the read index. Swap form keeps the array a permutation; overwrite form (a[w] = a[r]) is faster but needs a final fill.'],
    ['Empty or one-element input', 'The loops should simply not run; verify with n = 0 and n = 1.'],
  ],
  cost: [
    ['opposite ends', 'O(n) time after sorting (O(n log n) with the sort), O(1) space.'],
    ['read/write', 'O(n) time, O(1) space, at most n writes (overwrite form) or n swaps.'],
    ['brute force alternative', 'O(n^2) for pairs, O(n^3) for triples.'],
    ['hash alternative', 'O(n) time but O(n) space; works on unsorted input.'],
  ],
  internals: [
    ['The discard argument', 'Pair sum: if a[l] + a[r] < target, then a[l] + a[x] <= a[l] + a[r] < target for every x <= r, so a[l] can never be part of an answer. That proof is what you say out loud.'],
    ['Slow and fast pointers', 'On a linked list, a pointer moving two steps per iteration meets one moving a single step if there is a cycle (Floyd), and the slow one is at the middle when the fast one reaches the end.'],
    ['Partitioning', 'Dutch national flag uses three regions (low, mid, high) with three indexes: one pass sorts an array of 0, 1, 2 in O(n) and O(1) space.'],
    ['Stability', 'The swap-based move-zeroes keeps non-zero values in order; swapping with the other end (opposite pointers) is fewer writes but breaks order.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Given a sorted array, find two numbers that sum to a target. Explain why the pointer moves are correct.',
      a: 'Put left at the start and right at the end. If the sum is too small, no pair using a[left] can work (even the largest remaining partner is too small), so left moves up. If it is too big, a[right] cannot work with any remaining value, so right moves down. If equal, return. Each step discards one element, so it is O(n) time and O(1) space.',
      follow: [
        ['What if the array is not sorted?', 'Use a set or dict of seen values: for each x check target - x. O(n) time and O(n) space. Or sort a copy of (value, index) pairs and use two pointers.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Remove duplicates from a sorted array in place and return the new length.',
      a: 'Keep w = 1 as the write index. For r from 1 to n - 1, if a[r] != a[w - 1] then a[w] = a[r] and w += 1. Return w. The first w entries are the unique values in order. O(n) time, O(1) space.',
      follow: [
        ['How would you allow each value at most twice?', 'Compare with a[w - 2] instead of a[w - 1].'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Solve 3Sum: all unique triplets that add to zero.',
      a: 'Sort the array. For each index i (skipping duplicates of a[i]) use opposite-end pointers on the rest: l = i + 1, r = n - 1; adjust by the sum, and after finding a triplet skip duplicate values on both sides. Time O(n^2), space O(1) beyond the output (and the sort). It beats the O(n^3) brute force and avoids a hash set of triplets.',
      follow: [
        ['Can it be faster than n^2?', 'Not with comparisons in general; 3SUM is conjectured to need roughly quadratic time.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Container with most water: heights array, choose two lines maximising area. Justify the greedy pointer move.',
      a: 'Start with the widest container (ends). Area = width x min(h[l], h[r]). Move the pointer at the SHORTER line inward: any container using that shorter line with a smaller width has height at most the same short line, so area can only drop; keeping the short line is never better. The taller line might pair with something taller. Track the max. O(n) time, O(1) space.',
      follow: [],
    },
  ],
};
