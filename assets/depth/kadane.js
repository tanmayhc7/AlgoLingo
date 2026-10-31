/* Interview depth: Kadane's maximum subarray. */
window.DEPTH = {
  thesis:
    'Kadane\'s algorithm finds the contiguous run with the largest sum in one pass. State is one number: the best sum of a run ending at the current index. At each value you either extend that run or start a new one at this value. It is dynamic programming compressed to O(1) space, and the same extend-or-restart pattern appears in many array problems.',
  why: [
    ['Canonical DP-lite problem', 'Shows you can identify the state ("best run ending here") and a one-line recurrence.'],
    ['Optimal complexity', 'O(n) time, O(1) space beats the O(n^2) brute force and the O(n log n) divide and conquer.'],
    ['Many variants', 'Return the indexes, maximum product subarray, circular subarray, maximum sum with one deletion, best time to buy and sell stock.'],
    ['Handles negatives', 'Unlike a sliding window it works for any signs.'],
  ],
  edges: [
    ['All negative input', 'The answer is the largest single element. Initialise from a[0], not from 0.'],
    ['Empty array', 'Decide what to return (0, None or an error) before writing the loop.'],
    ['Returning the run', 'Track start (reset to i when you restart) and the best start and end.'],
    ['Integer overflow in C', 'Sums can exceed int; use long long and avoid starting cur at INT_MIN (cur + x would overflow).'],
    ['Product variant', 'For products you must also track the minimum, because two negatives make a positive.'],
    ['Circular variant', 'Answer = max(Kadane max, total - Kadane min), with a check for the all-negative case.'],
  ],
  cost: [
    ['Kadane', 'O(n) time, O(1) space.'],
    ['Brute force', 'O(n^2) with prefix sums, O(n^3) naively.'],
    ['Divide and conquer', 'O(n log n): best of left half, right half, and crossing the middle.'],
    ['With indexes', 'Still O(n) time and O(1) space.'],
  ],
  internals: [
    ['The recurrence', 'best_end[i] = max(a[i], best_end[i - 1] + a[i]); the answer is max over i of best_end[i].'],
    ['Why restart is safe', 'A negative running total can only reduce any later run, so discarding it never loses the optimum.'],
    ['Prefix-sum view', 'The best run ending at i is p[i + 1] minus the smallest earlier prefix. Kadane keeps that minimum implicitly.'],
    ['DP table compression', 'The DP array best_end only ever looks one step back, so a single variable is enough.'],
  ],
  qa: [
    { lvl: 'junior', q: 'Find the largest sum of a contiguous subarray.', a: 'Kadane: cur = max(x, cur + x) and best = max(best, cur) for each x. O(n) time, O(1) space.', follow: [['What if all numbers are negative?', 'The best run is the single largest element; initialise cur and best from a[0] so this works without a special case.']] },
    { lvl: 'mid', q: 'Return the subarray itself, not just the sum.', a: 'Track the start index: when you restart at i (x > cur + x), set start = i. When best improves, record best_start = start and best_end = i.', follow: [] },
    { lvl: 'mid', q: 'Why is it correct to throw away a negative running sum?', a: 'Any run that includes the negative prefix could be improved by dropping it, because the prefix contributes less than zero to every extension. So the best run ending at i never starts with a negative-sum prefix.', follow: [] },
    { lvl: 'senior', q: 'Maximum product subarray.', a: 'Keep both the maximum and minimum product ending at i. A negative value swaps them. cur_max = max(x, x * prev_max, x * prev_min), and likewise for cur_min. Zero resets both.', follow: [] },
    { lvl: 'senior', q: 'Maximum sum of a circular array.', a: 'Either the best run does not wrap (plain Kadane) or it wraps, in which case it is total minus the minimum-sum run (Kadane on the negated array). Take the larger, but if every element is negative return the plain Kadane result.', follow: [] },
  ],
};
