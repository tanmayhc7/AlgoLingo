/* Interview depth: bit tricks. */
window.DEPTH = {
  thesis:
    'A few identities solve most bit-manipulation questions. XOR is its own inverse (x ^ x = 0, x ^ 0 = x), so equal values cancel. x & (x - 1) clears the lowest set bit, which counts bits in one step per 1 and tests for a power of two. x & -x isolates the lowest set bit. And an integer from 0 to 2^n - 1 is a subset of n items, so a loop over integers enumerates all subsets. All use O(1) extra space.',
  why: [
    ['Classic questions', 'Single number, missing number, number of 1 bits, power of two, counting bits for 0..n, subsets, reverse bits, hamming distance.'],
    ['O(1) space solutions', 'XOR and masks often replace a hash set or a visited array.'],
    ['Bitmask DP', 'Travelling salesman on small n, assignment problems and "which items are used" states store a set in an int.'],
    ['Low-level fluency', 'Shows comfort with representation, which matters for embedded and systems roles.'],
  ],
  edges: [
    ['Negative numbers in Python', 'n & (n - 1) loops forever when n is negative (infinitely many leading 1s). Mask to a width or use int.bit_count().'],
    ['Zero', 'n & (n - 1) == 0 is also true for 0. For a power-of-two test require n > 0.'],
    ['More than two of each', 'XOR cancelling needs pairs. For values appearing three times, count each bit position modulo 3.'],
    ['Overflow in C', '1 << n overflows int at n = 31 and long long at 63; use unsigned types and bound n.'],
    ['Bit order', 'Decide whether bit 0 is the first or last item and stay consistent between the loop and the output.'],
    ['Large n for subset masks', 'The loop is 2^n iterations; beyond about n = 25 it is too slow even though the code is trivial.'],
  ],
  cost: [
    ['XOR single number', 'O(n) time, O(1) space.'],
    ['Kernighan popcount', 'O(k) where k is the number of set bits (at most the word width).'],
    ['Subsets by mask', 'O(n x 2^n) time to build each subset, O(1) extra space for the mask.'],
    ['Counting bits for 0..n', 'O(n) with dp[i] = dp[i >> 1] + (i & 1).'],
  ],
  internals: [
    ['Why n - 1 works', 'Subtracting 1 borrows from the lowest set bit: that bit becomes 0 and all lower zeros become 1. ANDing with n erases them all.'],
    ['Lowest set bit', 'n & -n: -n is ~n + 1, which keeps the lowest 1 and flips everything above it, so the AND leaves exactly that bit.'],
    ['XOR as addition mod 2', 'XOR is addition without carry, so it is commutative, associative and self-inverse.'],
    ['Mask enumeration', 'for mask in range(1 << n): bit i of mask tells whether item i is chosen. Iterating all sub-masks of a mask uses sub = (sub - 1) & mask.'],
  ],
  qa: [
    { lvl: 'junior', q: 'Every number appears twice except one. Find it in O(n) time and O(1) space.', a: 'XOR all the numbers: pairs cancel to 0 and the single value remains.', follow: [['What if every number appears three times except one?', 'Add up each bit position across all numbers modulo 3; the remaining bits form the answer. Or use two accumulators (ones and twos).']] },
    { lvl: 'mid', q: 'Count the number of 1 bits in an integer.', a: 'Loop while n: n &= n - 1; count += 1. It runs once per set bit. Alternatives: a 256-entry lookup table per byte, or the hardware popcount (bit_count, __builtin_popcount).', follow: [] },
    { lvl: 'mid', q: 'Is n a power of two?', a: 'n > 0 and (n & (n - 1)) == 0. A power of two has exactly one 1 bit.', follow: [['And a power of four?', 'Also check the single bit is in an even position: n & 0x55555555 != 0.']] },
    { lvl: 'senior', q: 'Return the number of 1 bits for every number from 0 to n.', a: 'dp[i] = dp[i >> 1] + (i & 1): a number has the bits of itself shifted right plus its last bit. O(n) time and space, with no per-number loop.', follow: [] },
    { lvl: 'senior', q: 'Find the two numbers that appear once when all others appear twice.', a: 'XOR everything to get x ^ y. Pick any set bit of it (lowbit = d & -d); that bit separates x and y. XOR the numbers having that bit set into one accumulator and the rest into another; the two accumulators are the answers.', follow: [] },
  ],
};
