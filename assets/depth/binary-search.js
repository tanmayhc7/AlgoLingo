/* Interview depth: binary search. */
window.DEPTH = {
  thesis:
    'Binary search is the most commonly botched easy algorithm. The idea is trivial; the interview is about invariants and boundaries. Pick a convention (inclusive [lo, hi] or half-open [lo, hi)), state what the range means, and make every update preserve that meaning and shrink the range. If you can say the invariant out loud, the off-by-ones disappear.',
  why: [
    ['O(log n) is a huge win', 'About 30 steps for a billion items, 20 for a million. It turns sorted data into an index you can search.'],
    ['The template solves many problems', 'First or last occurrence, insertion point, count of values in a range, square root, rotated arrays and "minimum capacity that works" are all the same loop with a different predicate.'],
    ['It tests precision', 'Interviewers watch how you reason about boundaries, termination and empty input.'],
    ['It appears in real systems', 'Database index pages, git bisect, version rollback, searching sorted logs, and rate-limit tuning use it.'],
  ],
  edges: [
    ['Infinite loops', 'With lo < hi and mid = (lo + hi) // 2, using lo = mid never makes progress when hi = lo + 1. Pair lo = mid + 1 with hi = mid, or round mid up when moving lo = mid.'],
    ['Overflow', 'In C or Java, lo + hi can overflow; use lo + (hi - lo) / 2. Python integers do not overflow.'],
    ['Empty and single element', 'Check n = 0 (hi = -1 so the loop never runs) and n = 1.'],
    ['Duplicates', 'Plain binary search returns any matching index. For first or last, use lower or upper bound forms.'],
    ['Unsorted or not monotone', 'The predicate must flip exactly once. Verify the monotonic property before reaching for binary search.'],
  ],
  cost: [
    ['search', 'O(log n) time, O(1) space (iterative); recursion would use O(log n) stack.'],
    ['sorting first', 'O(n log n) once, so it pays off when you search many times.'],
    ['inserting', 'bisect.insort finds the spot in O(log n) but shifting is O(n) in an array.'],
    ['versus hashing', 'A hash set is O(1) average for exact lookup, but binary search gives order: nearest value, rank, range counts.'],
  ],
  internals: [
    ['Invariants', 'Inclusive form: the target, if present, lies in [lo, hi]. Half-open form: the answer lies in [lo, hi] as an index in 0..n and everything before lo is "too small", everything from hi on is "not too small".'],
    ['Lower and upper bound', 'lower_bound: first i with a[i] >= x. upper_bound: first i with a[i] > x. Count of x is upper - lower. bisect_left and bisect_right in Python.'],
    ['Predicate view', 'Think of a boolean array F F F T T T. Binary search finds the first T. All variants differ only in the predicate.'],
    ['Floating point', 'For real-valued answers (square root, bisection for roots) loop a fixed number of iterations or until hi - lo < epsilon rather than comparing floats for equality.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Implement binary search and state its invariant.',
      a: 'lo, hi = 0, n - 1. While lo <= hi: mid = lo + (hi - lo) // 2; if a[mid] == target return mid; if a[mid] < target then lo = mid + 1 else hi = mid - 1. Return -1. Invariant: if the target is in the array, its index is within [lo, hi]. Each iteration discards mid and at least half the range, so the loop terminates in about log2(n) steps.',
      follow: [
        ['What changes if hi starts at n?', 'You use the half-open form: while lo < hi, a[mid] < target then lo = mid + 1 else hi = mid, and the result is lo (an insertion point), checked against the array.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Find the first and last position of a value in a sorted array with duplicates.',
      a: 'Use two lower-bound style searches: first = bisect_left(a, x); last = bisect_right(a, x) - 1. If first == n or a[first] != x the value is absent. Each search is O(log n), so the total is O(log n), unlike scanning outward from a found index which is O(n) for many duplicates.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Given a sorted array, find the element closest to a target, and count how many values lie in [lo, hi].',
      a: 'Closest: i = bisect_left(a, x); the answer is whichever of a[i-1] and a[i] (when in range) is nearer. Count in range: bisect_right(a, hi) - bisect_left(a, lo). Both are O(log n) after sorting. This is why sorted arrays with binary search are the basis for order statistics and range queries.',
      follow: [
        ['What if the data changes frequently?', 'Use a balanced tree or sorted container (such as a skip list or SortedList) so insertions are also O(log n).'],
      ],
    },
    {
      lvl: 'senior',
      q: 'A function is_bad(version) is monotone (false for old versions, true from the first bad one). Find the first bad version with the fewest calls.',
      a: 'Binary search on the predicate: lo = 1, hi = n; while lo < hi: mid = lo + (hi - lo) // 2; if is_bad(mid): hi = mid else lo = mid + 1; return lo. It makes ceil(log2 n) calls. Keep mid in the range when it is bad because it might be the first one.',
      follow: [],
    },
  ],
};
