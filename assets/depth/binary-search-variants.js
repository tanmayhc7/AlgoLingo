/* Interview depth: binary search variants. */
window.DEPTH = {
  thesis:
    'Binary search is really a search over a monotone yes/no predicate. Once you see that, rotated arrays, peak finding, square roots, and "minimise the maximum" or "smallest capacity that works" problems become the same template. The skill interviewers look for is recognising the hidden sorted structure, defining the predicate, and setting bounds that keep the answer inside the range.',
  why: [
    ['Recognising the pattern is the question', 'Phrases such as "minimum possible maximum", "smallest value such that", "at least k" and "can we do it within T" signal binary search on the answer.'],
    ['Feasibility checks are usually easy', 'Checking one candidate is often an O(n) greedy pass, and the search wraps it in O(log range), for O(n log range) total.'],
    ['Rotated and bitonic arrays test reasoning', 'You must decide which half is ordered and whether the target can be in it.'],
    ['Appears in scheduling and capacity problems', 'Shipping packages in D days, splitting arrays into k parts, allocating books, aggressive cows.'],
  ],
  edges: [
    ['Bounds', 'lo must be a value that could be the answer (or below), hi a value that definitely works. For "shipping capacity", lo = max weight, hi = sum of weights.'],
    ['Round-up mid', 'When searching for the maximum feasible value (lo = mid), use mid = (lo + hi + 1) // 2 or the loop will not terminate.'],
    ['Duplicates in rotated arrays', 'If a[lo] == a[mid] == a[hi] you cannot decide which half is sorted; shrink lo and hi by one and accept O(n) worst case.'],
    ['Non-monotone predicate', 'If feasibility is not monotone (works for 4, fails for 5, works for 6) binary search can return a wrong answer. Prove monotonicity.'],
    ['Integer versus real answers', 'For real answers iterate a fixed number of times (such as 100) instead of looping until equality.'],
  ],
  cost: [
    ['rotated search', 'O(log n) time, O(1) space (O(n) worst case with many duplicates).'],
    ['search on answer', 'O(cost(check) x log(range)). For hours(k) = O(n) and range = max pile: O(n log max).'],
    ['finding the rotation point', 'O(log n): compare a[mid] with a[hi].'],
    ['compared to linear scan', 'Linear is O(n) per query; binary search wins as soon as n or the number of queries is large.'],
  ],
  internals: [
    ['Predicate framing', 'Define can(x) that is false for small x and true for large x (or reverse). The answer is the boundary. Write the check function first, then wrap it in the search.'],
    ['Minimise the maximum', 'Classic form: "split into k parts minimising the largest sum". Guess the largest sum L; greedily count parts needed; if parts <= k then L is feasible. Binary search the smallest feasible L.'],
    ['Peak finding', 'In an array where neighbours differ, compare a[mid] with a[mid + 1]: climb towards the larger side; a peak must exist there. O(log n).'],
    ['Why rotated search works', 'At least one half of [lo, mid] and [mid, hi] is always sorted, so you can test membership in that half and know which half to keep.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Find the minimum element in a rotated sorted array (no duplicates) in O(log n).',
      a: 'Compare a[mid] with a[hi]. If a[mid] > a[hi] the minimum is to the right of mid, so lo = mid + 1. Otherwise it is at mid or to the left, so hi = mid. Stop when lo == hi. The comparison with a[hi] is reliable because a[hi] is on the right side of the rotation point or equal to the minimum.',
      follow: [
        ['What changes with duplicates?', 'If a[mid] == a[hi] you cannot tell; do hi -= 1. Worst case O(n), for example all equal values.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Explain how to compute an integer square root with binary search.',
      a: 'Search the range [0, x] for the largest r with r*r <= x. The predicate r*r <= x is true for small r and false for large r. Use the round-up form: while lo < hi: mid = (lo + hi + 1) // 2; if mid*mid <= x then lo = mid else hi = mid - 1. Return lo. O(log x) time with integer arithmetic only.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Split an array of positive integers into k contiguous parts so the largest part sum is minimised.',
      a: 'Binary search on the answer L between max(a) and sum(a). can(L): greedily extend the current part until adding the next element would exceed L, then start a new part; count parts. If parts <= k then L is feasible. The feasible values form a suffix (larger L never needs more parts), so find the smallest feasible L. Time O(n log(sum)). A dynamic programming solution exists but is O(k n^2) or O(k n log n).',
      follow: [
        ['Why is greedy correct inside can(L)?', 'Packing as much as possible into each part never increases the number of parts needed, by an exchange argument.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'How would you find the first bad commit in a history of 10,000 commits with a test that takes ten minutes?',
      a: 'Binary search the history (git bisect): test the middle commit; if it fails the first bad one is at or before it, otherwise after. About 14 tests instead of 10,000: under three hours rather than 70 days. It requires that once a commit is bad all later ones stay bad (monotone); if the bug is flaky or intermittent the predicate is not reliable and you need repeats.',
      follow: [],
    },
  ],
};
