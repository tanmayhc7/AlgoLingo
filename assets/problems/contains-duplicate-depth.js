/* Interview depth: LeetCode 217, Contains Duplicate. */
window.DEPTH = {
  thesis: 'Contains Duplicate is the smallest hash-set problem: one membership test per element. Interviewers use it to hear you name the trade between O(n) time with O(n) memory and O(n log n) time with O(1) memory, and to see whether you can build the set yourself when the language has none.',
  why: [
    ['Membership, not a pair', 'Unlike Two Sum there is nothing to compute from the current value: you only ask whether it was seen before, so a set (no values attached) is enough.'],
    ['Early exit', 'The set version returns at the first repeat, so inputs with an early duplicate finish fast. `len(set(nums)) != len(nums)` always builds the full set.'],
    ['Time versus space', 'Sorting gives O(1) extra space and O(n log n) time. The hash set gives O(n) time and O(n) space. With a million integers that is a few tens of megabytes against a quick sort.']
  ],
  edges: [
    ['Single element', 'A one-element array is never a duplicate: return false. The loops simply do not run.'],
    ['All equal', '`[7, 7, 7]` returns true at the second element.'],
    ['Negative and extreme values', '`-10^9` and `10^9` hash fine in Python. In C they stay inside `int`; only `INT_MIN` itself would collide with the empty marker.'],
    ['Mutating the input', 'The sort approach changes the order of the caller\'s array. Say so, or copy first.'],
    ['Overflow in the comparator', '`*a - *b` overflows for values far apart. `(x > y) - (x < y)` does not.']
  ],
  cost: [
    ['hash set', 'O(n) time, O(n) space', 'Average case; one lookup and one insert per element.'],
    ['sort + scan', 'O(n log n) time, O(1) extra space', 'In-place sort; destroys input order.'],
    ['brute force pairs', 'O(n^2) time, O(1) space', 'Compare every pair; never the answer here.'],
    ['open-addressing table in C', '2n to 4n slots', 'Power of two at least 2n keeps the load factor at or below 0.5.']
  ],
  internals: [
    ['Why high bits of the product', 'For a multiplicative hash the low bits depend only on the low bits of the key, so many inputs share them. The high bits mix all of the key, so the shift `>> (32 - bits)` picks the well-mixed part.'],
    ['Linear probing and load factor', 'Probe runs lengthen sharply as the table fills. Keeping load at or below 0.5 keeps the expected probe count near 1.5 for a hit and 2.5 for a miss.']
  ],
  qa: [
    {
      lvl: 'mid', q: 'Solve it in O(n) time and say what it costs.',
      a: 'Keep a set of seen values. For each number, if it is already in the set return True, otherwise add it. O(n) average time, O(n) space.',
      follow: [['Can you use O(1) extra space?', 'Sort in place and compare neighbours: O(n log n) time. It reorders the input.'], ['Why not len(set(nums)) != len(nums)?', 'It is correct and short, but it builds the entire set even if the first two elements match.']]
    },
    {
      lvl: 'mid', q: 'Implement the hash set in C.',
      a: 'Allocate a power-of-two table at least twice the input size, fill with an empty marker, hash with a multiplicative hash taking the high bits, and use linear probing. On the same value return true, on a different value step to the next slot, on empty insert.',
      follow: [['What if the empty marker can appear in the input?', 'Keep a parallel array of used flags, or a struct with a used field.'], ['What if the hash is bad?', 'Probe runs grow and operations degrade toward O(n). Mixing the bits first, or randomising a seed, avoids crafted collisions.']]
    },
    {
      lvl: 'senior', q: 'The values are in a stream and you can keep only 1 MB. What can you say?',
      a: 'An exact answer needs memory proportional to the distinct values. With a fixed budget use a Bloom filter: a "possibly seen" answer can be a false positive, never a false negative, so it can only wrongly report a duplicate. Verify positives against a second pass or external storage.',
      follow: []
    }
  ]
};
