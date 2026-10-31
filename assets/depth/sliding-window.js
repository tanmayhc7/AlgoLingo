/* Interview depth: sliding window. */
window.DEPTH = {
  thesis:
    'A sliding window maintains an answer for a contiguous range and updates it incrementally as the range moves. The interview skill is deciding what state the window needs (a sum, a count map, a max), when it is valid, and when to shrink. The complexity argument is always the same: each element enters the window once and leaves once, so the whole thing is O(n).',
  why: [
    ['Subarray and substring problems', 'Longest substring without repeats, minimum window substring, maximum sum of k items, longest run with at most k changes: all windows.'],
    ['Linear time with bounded state', 'Replaces O(n^2) rescans with O(n) and a small hash map or counter.'],
    ['Streaming friendly', 'A window works on data that arrives one element at a time, e.g. moving averages or rate limiters.'],
    ['A frequent interview topic', 'It is among the most common patterns after hash maps and two pointers.'],
  ],
  edges: [
    ['Negative numbers', 'The shrink-while-valid logic assumes adding grows the sum and removing shrinks it. With negatives use prefix sums with a hash map (count subarrays with sum k) or monotonic deques.'],
    ['Initial window', 'For fixed size, build the first window before sliding, and check k > n.'],
    ['Shrinking condition', 'Shrink while the window is invalid (for "longest" problems) or while it is valid (for "shortest" problems). Mixing them up is the usual bug.'],
    ['Updating the answer at the right time', 'Longest: update after the window becomes valid again. Shortest: update inside the while loop before shrinking.'],
    ['Counts that reach zero', 'When removing a character from a count map, delete the key (or compare against the number of distinct keys) so validity checks stay correct.'],
  ],
  cost: [
    ['fixed window', 'O(n) time, O(1) space for sums; O(n) time and O(k) space with a deque for max.'],
    ['variable window', 'O(n) time (amortised), O(alphabet or distinct values) space for counts.'],
    ['naive alternative', 'O(n k) for fixed windows, O(n^2) for variable windows.'],
    ['sliding window maximum', 'O(n) with a monotonic deque, O(n log k) with a heap.'],
  ],
  internals: [
    ['Amortised argument', 'right moves forward n times in total; left moves forward at most n times in total. So the nested while loop costs O(n) overall, not O(n^2).'],
    ['Window state', 'Choose the cheapest state that can be updated in O(1): running sum, counts in a dict, a set of members, or a monotonic deque of candidates for the max.'],
    ['Monotonic deque', 'For window maximum keep indexes in decreasing value order; pop from the back while the new value is bigger, pop from the front when the index falls out of the window.'],
    ['Prefix sums alternative', 'prefix[j] - prefix[i] gives any window sum in O(1) after O(n) preprocessing; use it when windows are queried at arbitrary positions.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Find the length of the longest substring without repeating characters.',
      a: 'Keep a window [left, right] and a dict mapping each character to its last index. For each right, if s[right] was seen at an index >= left, move left to last + 1. Record the window length and update last[s[right]] = right. O(n) time, O(min(n, alphabet)) space. The window is always valid, so we only ever grow it or jump left past the repeat.',
      follow: [
        ['Why must you check last >= left?', 'An old occurrence before the window start is irrelevant; moving left backwards would break the window.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is the variable-size window O(n) even though it has a loop inside a loop?',
      a: 'The pointers only move forward. right advances once per outer iteration (n total) and left advances inside the while loop but can never pass right, so it advances at most n times in total. The total work is at most 2n steps, not n x n.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Find the maximum of every window of size k in O(n).',
      a: 'Use a monotonic deque of indexes whose values are in decreasing order. For each i: pop from the back while a[back] <= a[i]; append i; pop from the front if its index <= i - k; once i >= k - 1 the front is the maximum for the window. Each index is pushed and popped at most once, so O(n) time and O(k) space. A heap would be O(n log k).',
      follow: [
        ['Why store indexes and not values?', 'To know when the front has left the window.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Count subarrays whose sum equals k when the array can contain negative numbers.',
      a: 'A sliding window fails because sums are not monotone. Use prefix sums and a hash map of how many times each prefix has occurred: for each position, add count[prefix - k] to the answer, then record the current prefix. O(n) time, O(n) space. For positive-only arrays, a window with two pointers works in O(1) space.',
      follow: [],
    },
  ],
};
