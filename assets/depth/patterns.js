/* Interview depth: Common patterns. */
window.DEPTH = {
  thesis:
    'Most interview problems are a small set of patterns wearing different clothes: hash map lookup, two pointers, sliding window, stack, prefix sums, frequency counting and sorting plus scan. Recognising the pattern from the constraints and the shape of the input is the skill; the code afterwards is short.',
  why: [
    ['Pattern recognition drives speed', 'Sorted input suggests two pointers or binary search. "Contiguous subarray" suggests sliding window or prefix sums. "Matching or nesting" suggests a stack. "Have I seen this" suggests a set or dict. Say the signal out loud.'],
    ['Each pattern removes one nested loop', 'Hash map removes the inner search, two pointers removes the inner restart, sliding window removes recomputing the window, prefix sums removes re-adding ranges, a monotonic stack removes scanning for the next greater item. Frame optimisation as "which repeated work disappears".'],
    ['Invariants make them correct', 'Every pattern keeps an invariant: the window contains no duplicates, the stack is decreasing, the left pointer never passes the right. State it, check it at the boundaries, and the code and proof follow.'],
    ['Edge cases cluster by pattern', 'Empty input, single element, all equal, all different, negative numbers (they break sliding windows with a sum target), duplicates, and overflow in typed languages.'],
  ],
  edges: [
    ['Sliding window with negatives', 'Shrinking on "sum too large" fails when negatives exist. Use prefix sums with a hash map of seen sums.'],
    ['Two pointers need sorted or monotone data', 'On unsorted input sort first (O(n log n), indexes lost) or use a hash map instead.'],
    ['Off-by-one in windows', 'Be explicit whether `right` is inclusive or exclusive and compute the length as `right - left + 1` or `right - left` accordingly.'],
    ['Duplicates in two-pointer sums (3Sum)', 'Skip equal neighbours at all levels to avoid duplicate triplets, but only after processing a match.'],
    ['Stack underflow', 'Check non-empty before reading `stack[-1]` or popping; a closing bracket with an empty stack is invalid input.'],
    ['Monotonic stack ties', 'Decide `<` versus `<=` when popping; it changes which duplicate is counted (matters in "sum of subarray minimums").'],
    ['Prefix sums', 'Index shift: `prefix[i]` is the sum of the first `i` items, so the range `[l, r)` sum is `prefix[r] - prefix[l]`. Include the empty prefix 0 in the map for subarrays starting at index 0.'],
    ['Hash map of counts', 'Decrement and delete at zero if comparing maps by equality, since zero entries make otherwise equal maps unequal (not for `Counter`, which compares correctly in modern versions).'],
    ['In-place modification', 'Clarify whether mutating the input is allowed, and whether the original order must be preserved.'],
    ['Integer overflow', 'Python ints do not overflow, but the interviewer may ask how your solution behaves in C or Java: midpoints `lo + (hi - lo) // 2`, sums in 64 bits.'],
  ],
  cost: [
    ['hash map one pass', 'O(n) time, O(n) space', 'Two Sum, duplicates, first unique.'],
    ['two pointers on sorted data', 'O(n) time, O(1) space', 'Plus the sort cost if not sorted.'],
    ['sliding window', 'O(n) time, O(k) space', 'Each pointer moves at most n times.'],
    ['prefix sums', 'O(n) build, O(1) query', 'Static data.'],
    ['monotonic stack', 'O(n)', 'Each item pushed and popped once.'],
    ['sort then scan', 'O(n log n)', 'Intervals, meeting rooms, grouping.'],
    ['binary search on answer', 'O(n log range)', 'Feasibility check per probe.'],
    ['heap top-k', 'O(n log k)', ''],
    ['frequency array of 26', 'O(n), O(1) space', 'Lowercase letters only.'],
  ],
  internals: [
    ['Amortised analysis for nested loops', 'A `while` inside a `for` can still be O(n) when the total movement of the inner pointer across all outer iterations is bounded by n. Argue with totals, not with loop depth.'],
    ['Why the monotonic stack works', 'An element that is smaller than a later element can never be the answer for items after it (it is dominated), so it is popped at once; what remains is exactly the candidates, in order.'],
    ['Prefix sums plus hash map', 'Subarray sum equals k becomes: count earlier prefixes equal to `current - k`. The map stores how many times each prefix occurred, turning an O(n^2) pair search into O(n).'],
    ['Binary search on the answer', 'When feasibility is monotone (if capacity x works, x + 1 works), binary search the answer range with a greedy or counting check. Shipping packages, Koko bananas and split array are the classics.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Valid parentheses with three bracket types.',
      a: 'Use a stack and a map of closing to opening brackets. Push openers; on a closer, the stack must be non-empty and its top must be the matching opener, otherwise return False. At the end the stack must be empty. O(n) time, O(n) space. Edge cases: empty string (valid), odd length (quick reject), other characters (ignore or reject by spec).',
      follow: [
        ['What if only one bracket type?', 'A counter suffices: increment on open, decrement on close, fail if negative, require zero at the end. O(1) space.'],
        ['How would you find the longest valid substring?', 'Stack of indices with a base sentinel `-1`; the length at each closer is `i - stack[-1]` after popping. Or a two-pass counter scan in O(1) space.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Longest substring without repeating characters.',
      a: 'Sliding window with a dict of last seen index. Move `right`; if the character was seen at an index inside the window (`>= left`), jump `left` to one past it. Update the answer with `right - left + 1`. O(n) time, O(min(n, alphabet)) space. The `>= left` check is the classic bug: stale entries outside the window must be ignored.',
      follow: [
        ['What changes for at most k distinct characters?', 'Keep a count dict and shrink from the left while distinct count exceeds k; same O(n) argument.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Subarray sum equals k, with negative numbers allowed.',
      a: 'Prefix sums with a hash map of counts. Keep a running sum; the number of subarrays ending here with sum k equals how many earlier prefixes equal `running - k`. Seed the map with `{0: 1}` for subarrays starting at the beginning. O(n) time and space. A sliding window fails because negatives break monotonicity (extending the window can reduce the sum).',
      follow: [
        ['What if all numbers are positive?', 'Then a sliding window works in O(1) space, since sums grow monotonically as the window extends.'],
        ['How do you adapt it to "sum divisible by k"?', 'Store counts of `prefix % k`; equal remainders mean the subarray between them is divisible. Handle negative remainders with Python\'s modulo (already non-negative) or normalise in other languages.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Daily temperatures: for each day, how many days until a warmer one?',
      a: 'Monotonic decreasing stack of indices. For each day `i`, while the stack is non-empty and `temps[i] > temps[stack[-1]]`, pop `j` and set `answer[j] = i - j`. Then push `i`. Days left on the stack get 0. O(n) because each index is pushed and popped once.',
      follow: [
        ['Why is it O(n) despite the nested while?', 'Each index enters and leaves the stack at most once, so total inner iterations are bounded by n.'],
        ['Next greater element in a circular array?', 'Iterate `2n` indices with `i % n`, pushing only during the first pass.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'You are given a brand new problem. Walk me through how you decide on an approach.',
      a: 'Clarify inputs, outputs, size limits and edge cases. State a brute force and its complexity. Use the constraints to find the target complexity (n of 1e5 means O(n log n) at worst). Identify the bottleneck in the brute force (repeated search, repeated recomputation, repeated sorting) and match it to a pattern: hash map for search, prefix sums or window for ranges, stack for nearest-greater, heap for extremes, binary search if monotone, DP if overlapping subproblems. Verify the invariant on a small example, code it, then test edge cases aloud and give the final complexity.',
      follow: [
        ['What do you do when you get stuck?', 'Say so, work a small example by hand, look for what information is being recomputed, try sorting or a different representation, and ask a clarifying question. Interviewers value visible reasoning over silence.'],
        ['How do you know the problem is DP rather than greedy?', 'Overlapping subproblems with optimal substructure and no safe local choice. Test greedy with a counterexample on small inputs; if it fails, define the state and recurrence.'],
      ],
    },
  ],
};
