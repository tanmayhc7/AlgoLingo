/* Interview depth: One-dimensional DP tables. */
window.DEPTH = {
  thesis:
    'A 1D DP fills a line of cells where each cell depends on a few earlier ones. The pattern repeats across a huge family of problems: climbing stairs, house robber, coin change, longest increasing subsequence, word break, decode ways. The method never changes: define dp[i], write dp[i] in terms of earlier cells, fix base cases, fill in order, and ask whether a rolling window can replace the table.',
  why: [
    ['One recipe covers many problems', 'Once you can express "best for the first i items" or "best for amount a" as a recurrence, a dozen interview classics are the same problem in different clothes.'],
    ['It beats greedy when choices interact', 'Taking the locally best item can block a better combination. The table considers every predecessor, so interactions are handled.'],
    ['The fill order is dependency order', 'A cell can be computed once everything it reads is ready. For 1D tables that is usually left to right; if it depends on larger indices, fill right to left.'],
    ['Space optimisation is a standard follow-up', 'Interviewers expect you to notice when only the last one or two cells are needed.'],
  ],
  edges: [
    ['Unreachable states', 'Use infinity (or a sentinel) for "impossible", never 0. Adding 1 to infinity stays infinity in Python; in C use a safe large value to avoid overflow.'],
    ['Base case and off-by-one', 'dp[0] often means "empty prefix" or "amount zero". Size the array n + 1 and check n = 0 and n = 1 by hand.'],
    ['Order of loops', 'Counting combinations (order does not matter) loops coins outside and amounts inside; counting permutations swaps them. Same recurrence, different loop nest, different answer.'],
    ['In-place updates', 'Updating a single array while reading from it can reuse items (unbounded knapsack) or must not (0/1 knapsack, iterate amounts downward). The direction is the semantics.'],
    ['Large answers', 'Counts grow quickly. Many problems ask for the answer modulo 10^9 + 7; apply it on each addition.'],
  ],
  cost: [
    ['coin change', 'O(amount x coins) time, O(amount) space.'],
    ['house robber / stairs / fib', 'O(n) time, O(1) with rolling variables.'],
    ['longest increasing subsequence', 'O(n^2) with a table, O(n log n) with patience sorting and binary search.'],
    ['word break', 'O(n x L) with a hash set of words and a longest word length L.'],
  ],
  internals: [
    ['Rolling window', 'If dp[i] reads only dp[i-1] and dp[i-2], replace the list by two variables, updated by tuple assignment. For 2D tables, the same idea keeps the last row (or two).'],
    ['Reconstructing the choice', 'The table gives the value, not the solution. Store a parent pointer (which coin, which predecessor) or walk the table backwards, recomputing which option achieved each value.'],
    ['Combinations versus permutations', 'Looping coins first then amounts counts each multiset once, because a coin type is "finished" before the next is considered. Looping amounts first allows any order of coins, counting each sequence.'],
    ['LIS in O(n log n)', 'Keep `tails[k]`, the smallest tail of an increasing subsequence of length k + 1. Each new number replaces the first tail not smaller than it, found by binary search (`bisect_left`). The array stays sorted, and its length is the answer.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Solve coin change (fewest coins) and explain why greedy does not work.',
      a: 'Let dp[a] be the fewest coins for amount a, with dp[0] = 0 and everything else infinity. For each a from 1 to amount, try each coin c <= a: dp[a] = min(dp[a], dp[a - c] + 1). Return dp[amount] or -1 if it is still infinity. O(amount x coins) time, O(amount) space. Greedy fails because the largest coin can lock you out of the optimum: with coins 1, 3, 4 and amount 6, greedy takes 4 + 1 + 1 (three coins), whereas 3 + 3 uses two.',
      follow: [
        ['How do you count the number of ways instead?', 'dp[0] = 1 and for each coin (outer loop) add dp[a - c] to dp[a] over amounts (inner loop, ascending). The outer loop over coins counts combinations, not orderings.'],
        ['When is greedy correct for coins?', 'For canonical systems such as US coins, but you must prove it or check it; arbitrary sets need DP.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'House robber: no two adjacent houses. Give the recurrence and optimise the space.',
      a: 'Let dp[i] be the best total using the first i houses. Either skip house i (dp[i-1]) or rob it and take dp[i-2] + nums[i-1]: dp[i] = max(dp[i-1], dp[i-2] + nums[i-1]). Base: dp[0] = 0, dp[1] = nums[0]. Each cell reads only the previous two, so keep `prev2` and `prev1`; the loop updates them with tuple assignment. O(n) time, O(1) space. For the circular version, run it twice, once excluding the first house and once excluding the last, and take the larger.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Longest increasing subsequence: give the O(n^2) DP and then the O(n log n) method.',
      a: 'O(n^2): dp[i] is the length of the longest increasing subsequence ending at i; dp[i] = 1 + max(dp[j] for j < i with nums[j] < nums[i]); the answer is the maximum over all i. O(n log n): maintain `tails`, where `tails[k]` is the smallest possible last element of an increasing subsequence of length k + 1. For each number x, find the first index with `tails[idx] >= x` using `bisect_left`; replace it with x or append if none exists. Replacing keeps tails as small as possible, so future numbers can extend more subsequences. `len(tails)` is the answer, but `tails` itself is not a valid subsequence. To recover one, store the index and predecessor for each length.',
      follow: [
        ['Why bisect_left, not bisect_right?', 'For a strictly increasing subsequence equal values must replace, not extend. Use bisect_right for non-decreasing.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Word break and decode ways are both 1D DP over a string. Describe the state and transitions.',
      a: 'Word break: dp[i] is True if the prefix of length i can be segmented. dp[0] = True; dp[i] = any(dp[j] and s[j:i] in words) over j < i. Bound j by the longest word length to get O(n x L). Decode ways: dp[i] is the number of ways to decode the first i characters. Add dp[i-1] if the single digit s[i-1] is 1-9, and add dp[i-2] if the two digits s[i-2:i] form 10-26. Zeroes need care: a lone "0" has no decoding. Both are the same idea: the last piece can have a few possible lengths, and each leaves a smaller prefix to solve.',
      follow: [
        ['How would you return all segmentations (Word Break II)?', 'Top-down with memoisation keyed by start index returning the list of sentences; the number of results can be exponential, so the complexity is output-sensitive.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'A DP\'s inner step is a min over all earlier cells, making it O(n^2). What can you do for n = 10^6?',
      a: 'Look at the structure of the transition. If it is dp[i] = min over j of (dp[j] + cost(j, i)) with cost of a special form, there are standard accelerations: a monotone deque when j ranges over a sliding window (O(n)); the convex hull trick when cost is linear in a parameter of j (O(n) or O(n log n)); divide-and-conquer optimisation or Knuth optimisation when the optimal j is monotone (O(n log n)); a segment tree or Fenwick tree for range minimum over previous values with point updates; or a data structure keyed by value, as in the LIS binary search. I would first check the constraints to see what is intended, write a brute force to validate, and then test the optimised version against it on random inputs, because these optimisations are easy to get subtly wrong.',
      follow: [],
    },
  ],
};
