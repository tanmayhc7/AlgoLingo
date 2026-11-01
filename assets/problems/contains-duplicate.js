/* LeetCode 217: Contains Duplicate. Code from T's folder (set in Python, open-addressing set in C); write-up condensed from EXPLAINED.md. */
(function () {
  var O = { x0: 80, dx: 95, y0: 40, dy: 68 };
  function arr(vals) { return vals.map(function (v, i) { return ['a' + i, String(v), i, 0]; }); }
  var SORT_PY = ['def contains_duplicate(nums):', '    nums.sort()', '    for i in range(len(nums) - 1):', '        if nums[i] == nums[i + 1]:', '            return True', '    return False'];
  var SORT_C = [
    'int compare(const void *a, const void *b) {',
    '    int x = *(const int *)a, y = *(const int *)b;',
    '    return (x > y) - (x < y);      /* -1, 0 or 1, no overflow */',
    '}',
    '',
    'bool containsDuplicate(int* nums, int numsSize) {',
    '    qsort(nums, numsSize, sizeof(int), compare);',
    '    for (int i = 0; i < numsSize - 1; i++) {',
    '        if (nums[i] == nums[i + 1])',
    '            return true;',
    '    }',
    '    return false;',
    '}'
  ];
  var SET_PY = ['class Solution(object):', '    def containsDuplicate(self, nums):', '        seen = set()', '        for num in nums:', '            if num in seen:', '                return True', '            seen.add(num)', '        return False'];
  var SET_C = [
    'bool containsDuplicate(int* nums, int numsSize) {',
    '    int bits = 1;',
    '    while ((1 << bits) < 2 * numsSize) bits++;   // table size >= 2n keeps it sparse',
    '    int size = 1 << bits;',
    '    int mask = size - 1;',
    '',
    '    int* table = malloc(size * sizeof(int));',
    '    for (int i = 0; i < size; i++) table[i] = INT_MIN;   // empty marker',
    '',
    '    for (int i = 0; i < numsSize; i++) {',
    '        unsigned h = ((unsigned)nums[i] * 2654435761u) >> (32 - bits);',
    '        while (table[h] != INT_MIN) {            // slot taken',
    '            if (table[h] == nums[i]) {           // same value: duplicate',
    '                free(table);',
    '                return true;',
    '            }',
    '            h = (h + 1) & mask;                  // linear probe to next slot',
    '        }',
    '        table[h] = nums[i];                      // empty slot: insert',
    '    }',
    '    free(table);',
    '    return false;',
    '}'
  ];

  var sort = [
    { pl: 0, cl: 5, say: 'nums = [3, 2, 1, 3]. If equal values end up next to each other, a duplicate is just an equal neighbouring pair.', csay: 'bool containsDuplicate(int* nums, int numsSize)', add: arr([3, 2, 1, 3]) },
    { pl: 1, cl: 6, say: 'Sort first (in place): [1, 2, 3, 3]. The two 3s are now neighbours. This costs O(n log n) and reorders the caller\'s array.', csay: 'qsort(nums, numsSize, sizeof(int), compare);', lab: [['a0', '1'], ['a1', '2'], ['a2', '3'], ['a3', '3']] },
    { pl: 3, cl: 8, say: 'i = 0: 1 and 2 differ.', csay: 'if (nums[i] == nums[i + 1])', tag: [['a0', 'cur'], ['a1', 'cur']], ptr: [['i', 'a0', 'down']] },
    { pl: 3, cl: 8, say: 'i = 1: 2 and 3 differ.', csay: '', untag: [['a0', 'cur'], ['a1', 'cur']], tag: [['a1', 'cur'], ['a2', 'cur']], ptr: [['i', 'a1', 'down']] },
    { pl: 4, cl: 9, say: 'i = 2: 3 and 3 are equal, so return True. Extra memory: none. If the input must not be reordered, copy it first and the O(1) space is gone.', csay: 'return true;', untag: [['a1', 'cur']], tag: [['a2', 'mark'], ['a3', 'mark']], ptr: [['i', 'a2', 'down']] }
  ];
  var set = [
    { pl: 2, cl: 6, say: 'nums = [1, 2, 3, 1]. A set answers "have I seen this value?" in one step. It starts empty.', csay: 'int* table = malloc(size * sizeof(int));', add: arr([1, 2, 3, 1]).concat([['sl', 'seen', 0, 2]]) }
  ];
  [1, 2, 3].forEach(function (v, i) {
    set.push({ pl: 6, cl: 18, say: 'num = ' + v + '. Is ' + v + ' in seen? No. Add it.', csay: 'table[h] = nums[i];', tag: [['a' + i, 'done']], add: [['s' + i, String(v), i + 1, 2]], ptr: [['i', 'a' + i, 'down']] });
  });
  set.push({ pl: 4, cl: 12, say: 'num = 1 again. Is 1 in seen? Yes, we added it at the start. That is a duplicate.', csay: 'if (table[h] == nums[i])', tag: [['a3', 'mark'], ['s0', 'mark']], ptr: [['i', 'a3', 'down']] });
  set.push({ pl: 5, cl: 14, say: 'Return True after 4 elements, without sorting. One pass, O(n) average time, O(n) space for the set.', csay: 'return true;', tag: [['a3', 'done']] });

  window.LESSON = {
    id: 'lc-contains-duplicate', mode: 'ds',
    title: 'Contains Duplicate',
    lede: 'Decide whether any value appears twice. Sort and look at neighbours, or remember what you have seen in a set. This is the same "trade memory for a lookup" move as Two Sum, with no pair to find.',
    scenes: [
      {
        id: 'sort', title: 'Sort and compare neighbours', blurb: 'After sorting, equal values sit side by side, so one scan of adjacent pairs finds any duplicate.',
        trap: 'The classic C comparator return *a - *b can overflow. Use (x > y) - (x < y). Also remember that the sort reorders the caller\'s array.',
        pyCode: SORT_PY, cCode: SORT_C,
        predict: { q: 'After sorting [3, 2, 1, 3], how many adjacent pairs are compared before the function returns True?', options: ['1', '3', '4'], answer: 1, why: 'The sorted array is [1, 2, 3, 3]. Pairs (1,2) and (2,3) differ; the third pair (3,3) matches. Three comparisons in all.' },
        steps: Flow.steps(sort, O)
      },
      {
        id: 'set', title: 'One pass with a set', blurb: 'Remember each value as you go. If the current value is already remembered, you have your duplicate.',
        trap: 'Test membership before adding. Adding first would make every value look like a duplicate of itself.',
        pyCode: SET_PY, cCode: SET_C,
        predict: { q: 'With nums = [1, 2, 3, 1], at which index does the set version return?', options: ['Index 1', 'Index 3', 'Only after the loop ends'], answer: 1, why: 'The first three values are new. At index 3 the value 1 is already in the set, so the function returns there.' },
        steps: Flow.steps(set, O)
      }
    ],
    builtins: [
      ['set()', 'Unordered collection of unique hashable values.'],
      ['x in s', 'Membership test: O(1) on average.'],
      ['s.add(x)', 'Insert; adding an existing value changes nothing.'],
      ['len(set(nums)) != len(nums)', 'One-line version: duplicates exist if the set is smaller. Builds the whole set, so it never exits early.'],
      ['nums.sort()', 'In-place Timsort, O(n log n).']
    ]
  };

  window.PROBLEM = {
    slug: 'contains-duplicate', url: 'https://leetcode.com/problems/contains-duplicate',
    statement: ['Given an integer array `nums`, return `true` if any value appears at least twice in the array, and `false` if every element is distinct.'],
    examples: [['nums = [1,2,3,1]', 'true'], ['nums = [1,2,3,4]', 'false'], ['nums = [1,1,1,3,3,4,3,2,4,2]', 'true']],
    constraints: ['`1 <= nums.length <= 10^5`', '`-10^9 <= nums[i] <= 10^9`'],
    writeup: [
      { h: 'Three solutions', table: [['Approach', 'Time', 'Space', 'Mutates input'], ['Hash set (open addressing in C, set in Python)', 'O(n) average', 'O(n)', 'No'], ['Sort and compare neighbours', 'O(n log n)', 'O(1) extra', 'Yes']] },
      { h: 'Key insight', p: ['"Have I seen this value before?" is a membership test, and a hash table answers it in O(1) on average. C has no built-in hash set, so the C solution builds a small one: an array where each value hashes to a slot, and a collision moves to the next free slot (linear probing).'] },
      { h: 'The C hash set, step by step', ul: ['Size the table to a power of two that is at least `2n`, so it is at most half full and probe runs stay short. A power of two lets `& mask` replace `% size`.', 'Mark every slot empty with `INT_MIN`.', 'Hash with `nums[i] * 2654435761u` (Knuth\'s multiplicative constant) and take the high bits with `>> (32 - bits)`; the low bits of a multiplicative hash are poorly mixed.', 'Probe: an empty slot means insert; the same value means duplicate (free the table, return true); a different value means collision, so step to the next slot with wraparound.', 'Cast to `unsigned` before multiplying: signed overflow is undefined behaviour, unsigned wraparound is not.'] },
      { h: 'Notes', ul: ['`INT_MIN` as the empty marker is safe because `nums[i]` is within about +-10^9. If `INT_MIN` could be input, track used slots in a separate boolean array.', 'Free the table on every return path, including the early `return true`.', 'Worst case is O(n^2) if many values collide; very unlikely with this hash.'] },
      { h: 'Sort and check neighbours', p: ['After sorting, equal values are adjacent, so a duplicate exists exactly when some `nums[i] == nums[i + 1]`. It needs no extra memory but is O(n log n) and reorders the input.'] },
      { h: 'Is there a better solution?', p: ['Not asymptotically: every element must be read, so O(n) is a lower bound. The set version meets it. Choose sorting only when memory is the binding constraint and reordering is allowed.'] }
    ]
  };
})();
