/* LeetCode 1: Two Sum. Statement and write-up come from T's explained.md; scenes are step-through (Flow helper). */
(function () {
  var BRUTE_PY = ['def two_sum(nums, target):', '    for i in range(len(nums)):', '        for j in range(i + 1, len(nums)):', '            if nums[i] + nums[j] == target:', '                return [i, j]'];
  var BRUTE_C = [
    'int* twoSum(int* nums, int numsSize, int target, int* returnSize) {',
    '    int *result = (int*) malloc(2 * sizeof(int));',
    '    bool flag = 0;',
    '    *returnSize = 2;',
    '    for (int i = 0; i < numsSize; i++) {',
    '        for (int j = i + 1; j < numsSize; j++) {',
    '            if (nums[i] + nums[j] == target) {',
    '                result[0] = i; result[1] = j;',
    '                flag = 1; break;',
    '            }',
    '        }',
    '        if (flag == 1) break;',
    '    }',
    '    return result;',
    '}'
  ];
  var MAP_PY = ['class Solution(object):', '    def twoSum(self, nums, target):', '        num_map = {}                      # value -> index', '        for i, num in enumerate(nums):', '            complement = target - num', '            if complement in num_map:', '                return [num_map[complement], i]', '            num_map[num] = i'];
  var MAP_C = [
    '#define SIZE 16384   /* power of two, about 1.6 x the 10^4 maximum */',
    'typedef struct { int key, idx; bool used; } Slot;',
    '',
    'int* twoSum(int* nums, int n, int target, int* returnSize) {',
    '    Slot *t = calloc(SIZE, sizeof(Slot));     /* the "dict" */',
    '    int *res = malloc(2 * sizeof(int));',
    '    *returnSize = 2;',
    '    for (int i = 0; i < n; i++) {',
    '        int want = target - nums[i];',
    '        for (unsigned h = (unsigned)want & (SIZE - 1); t[h].used; h = (h + 1) & (SIZE - 1))',
    '            if (t[h].key == want) { res[0] = t[h].idx; res[1] = i; free(t); return res; }',
    '        unsigned h = (unsigned)nums[i] & (SIZE - 1);',
    '        while (t[h].used) h = (h + 1) & (SIZE - 1);',
    '        t[h] = (Slot){ nums[i], i, true };',
    '    }',
    '    free(t); return res;',
    '}'
  ];
  var O = { x0: 80, dx: 95, y0: 40, dy: 68 };
  function arr(vals) { return vals.map(function (v, i) { return ['a' + i, String(v), i, 0]; }); }

  /* scene 1: brute force on [11, 15, 2, 7], target 9 */
  function pair(i, j, sum, last) {
    var f = {
      pl: 3, cl: 6,
      say: 'nums[' + i + '] + nums[' + j + '] = ' + sum + (last ? ', which is the target.' : ', not 9. Next pair.'),
      csay: 'if (nums[i] + nums[j] == target)',
      lab: [['sm', String(sum)], ['ck', 'checks ' + (pair.n = (pair.n || 0) + 1)]],
      tag: [['a' + i, 'cur'], ['a' + j, 'cur']],
      ptr: [['i', 'a' + i, 'down'], ['j', 'a' + j, 'down']]
    };
    if (last) { f.tag = [['a' + i, 'done'], ['a' + j, 'done']]; f.pl = 4; f.cl = 7; }
    return f;
  }
  pair.n = 0;
  var brute = [
    { pl: 1, cl: 4, say: 'nums = [11, 15, 2, 7] and the target is 9. The brute force tries every pair, so first fix i = 0.', csay: 'for (int i = 0; ...)', add: arr([11, 15, 2, 7]).concat([['tg', 'target 9', 4, 0], ['sm', '·', 5, 0], ['ck', 'checks 0', 6, 0]]), ptr: [['i', 'a0', 'down']] }
  ];
  [[0, 1, 26], [0, 2, 13], [0, 3, 18], [1, 2, 17], [1, 3, 22], [2, 3, 9, true]].forEach(function (p) {
    var f = pair(p[0], p[1], p[2], p[3]);
    var prev = brute[brute.length - 1];
    f.untag = [['a0', 'cur'], ['a1', 'cur'], ['a2', 'cur'], ['a3', 'cur']];
    if (!p[3] && p[1] === p[0] + 1 && p[0] > 0) f.say = 'i moves on to ' + p[0] + ' and j restarts just after it. ' + f.say;
    brute.push(f);
  });
  brute.push({ pl: 4, cl: 13, say: 'Found after 6 checks: return [2, 3]. With n numbers the worst case checks n(n-1)/2 pairs, about 50 million for n = 10,000. That is the O(n^2) cost to beat.', csay: 'return result;', tag: [['a2', 'done'], ['a3', 'done']] });

  /* scene 2: hash map, same input */
  var map = [
    { pl: 2, cl: 4, say: 'Same input. Keep a dict from value to index for every number seen so far. It starts empty.', csay: 'Slot *t = calloc(SIZE, sizeof(Slot));', add: arr([11, 15, 2, 7]).concat([['tg', 'target 9', 4, 0], ['ml', 'map', 0, 2], ['nd', 'need ·', 5, 0]]) }
  ];
  var seen = [[11, -2], [15, -6], [2, 7]];
  seen.forEach(function (s, i) {
    map.push({ pl: 4, cl: 8, say: 'i = ' + i + ', num = ' + s[0] + '. The partner it needs is 9 - ' + s[0] + ' = ' + s[1] + '. Is ' + s[1] + ' in the map? No.', csay: 'int want = target - nums[i];', lab: [['nd', 'need ' + s[1]]], tag: [['a' + i, 'cur']], ptr: [['i', 'a' + i, 'down']], untag: i ? [['a' + (i - 1), 'cur']] : [] });
    map.push({ pl: 7, cl: 13, say: 'Miss, so remember ' + s[0] + ' at index ' + i + ' for later numbers to find.', csay: 't[h] = (Slot){ nums[i], i, true };', add: [['m' + i, s[0] + '>' + i, i + 1, 2]], tag: [['a' + i, 'done']] });
  });
  map.push({ pl: 4, cl: 8, say: 'i = 3, num = 7. It needs 9 - 7 = 2.', csay: 'int want = target - nums[i];', lab: [['nd', 'need 2']], tag: [['a3', 'cur']], untag: [['a2', 'cur']], ptr: [['i', 'a3', 'down']] });
  map.push({ pl: 5, cl: 10, say: 'Is 2 in the map? Yes, at index 2. One lookup answered what the brute force needed several checks for.', csay: 'if (t[h].key == want) ...', tag: [['m2', 'mark'], ['a3', 'mark']] });
  map.push({ pl: 6, cl: 10, say: 'Return [num_map[2], i] = [2, 3]: the earlier index first, then the current one. 4 elements, 4 lookups, at most 3 inserts. For n elements that is O(n).', csay: 'res[0] = t[h].idx; res[1] = i;', tag: [['a2', 'done'], ['a3', 'done']] });

  /* scene 3: why the lookup comes before the store (nums = [3, 2, 4], target 6) */
  var order = [
    { pl: 2, cl: 4, say: 'nums = [3, 2, 4], target 6. The pair is 2 + 4 at indexes 1 and 2. The 3 must not pair with itself, even though 3 + 3 = 6.', csay: '', add: arr([3, 2, 4]).concat([['tg', 'target 6', 4, 0], ['ml', 'map', 0, 2], ['nd', 'need ·', 5, 0]]) },
    { pl: 7, cl: 13, say: 'The wrong order: store 3 first. The map now holds 3 > 0.', csay: 't[h] = (Slot){ nums[i], i, true };  /* too early */', add: [['w0', '3>0', 1, 2]], tag: [['a0', 'cur'], ['w0', 'bad']], ptr: [['i', 'a0', 'down']] },
    { pl: 4, cl: 8, say: 'Then the lookup needs 6 - 3 = 3, finds the 3 we just stored, and answers [0, 0]: the same element twice, which the problem forbids.', csay: '', lab: [['nd', 'need 3']], tag: [['nd', 'bad']] },
    { pl: 4, cl: 8, say: 'The right order: look up first. Remove the early entry and try again at i = 0. The map is empty, and 3 is needed.', csay: 'int want = target - nums[i];', rm: ['w0'], untag: [['nd', 'bad']], lab: [['nd', 'need 3']], tag: [['a0', 'cur']] },
    { pl: 7, cl: 13, say: 'Not found, so now store 3 > 0. The 3 can only be matched by a later element.', csay: 't[h] = (Slot){ nums[i], i, true };', add: [['m0', '3>0', 1, 2]], tag: [['a0', 'done']] },
    { pl: 4, cl: 8, say: 'i = 1, num = 2. It needs 6 - 2 = 4. Not in the map, so store 2 > 1.', csay: 'int want = target - nums[i];', lab: [['nd', 'need 4']], add: [['m1', '2>1', 2, 2]], tag: [['a1', 'done']], untag: [['a0', 'cur']], ptr: [['i', 'a1', 'down']] },
    { pl: 6, cl: 10, say: 'i = 2, num = 4. It needs 2, which is in the map at index 1. Return [1, 2]. For nums = [3, 3] the second 3 finds the first, so real duplicates still work.', csay: 'res[0] = t[h].idx; res[1] = i;', lab: [['nd', 'need 2']], tag: [['m1', 'mark'], ['a1', 'done'], ['a2', 'done']], ptr: [['i', 'a2', 'down']] }
  ];

  window.LESSON = {
    id: 'lc-two-sum', mode: 'ds',
    title: 'Two Sum',
    lede: 'Find two numbers in an array that add up to a target and return their indexes. The brute force checks every pair. Remembering the numbers already seen in a dict turns the search for a partner into a single lookup.',
    scenes: [
      {
        id: 'brute', title: 'Brute force', blurb: 'Try every pair. It is correct and simple, and it is the cost to beat.',
        trap: 'The inner loop must start at i + 1. Starting at 0 would pair an element with itself and recheck pairs you already tried.',
        pyCode: BRUTE_PY, cCode: BRUTE_C,
        predict: { q: 'With nums = [11, 15, 2, 7] and target 9, how many pairs does the brute force check before it returns?', options: ['4', '6', '8'], answer: 1, why: 'The pairs go (0,1) (0,2) (0,3) (1,2) (1,3) (2,3), and the sixth one sums to 9. That is n(n-1)/2 pairs in the worst case.' },
        steps: Flow.steps(brute, O)
      },
      {
        id: 'hash', title: 'One pass with a dict', blurb: 'For each number, ask whether its partner has already been seen. If not, remember the number.',
        trap: 'Return the earlier index first and the current index second: [num_map[complement], i]. Any order is accepted, but the map only holds earlier indexes.',
        pyCode: MAP_PY, cCode: MAP_C,
        predict: { q: 'At i = 3 (num = 7, target 9), what does the code look up and what does it return?', options: ['Looks up 2, returns [2, 3]', 'Looks up 7, returns [3, 3]', 'Looks up 2, returns [3, 2]'], answer: 0, why: 'The complement is 9 - 7 = 2, which sits at index 2. The return is [num_map[2], i] = [2, 3].' },
        steps: Flow.steps(map, O)
      },
      {
        id: 'order', title: 'Look up before you store', blurb: 'The order of the two statements inside the loop is the whole correctness argument.',
        trap: 'Storing first lets a number match itself. For [3, 2, 4] with target 6 you would answer [0, 0] instead of [1, 2].',
        pyCode: MAP_PY, cCode: MAP_C,
        predict: { q: 'If the loop stored num_map[num] = i before the lookup, what would twoSum([3, 2, 4], 6) return?', options: ['[0, 0]', '[1, 2]', '[0, 2]'], answer: 0, why: 'The first 3 is stored, then its complement 3 is found: that is the same element, so the result is [0, 0].' },
        steps: Flow.steps(order, O)
      }
    ],
    builtins: [
      ['enumerate(nums)', 'Gives the index and the value together, so no range(len(nums)).'],
      ['x in d', 'Dict membership test: O(1) on average.'],
      ['d[k] = v', 'Insert or overwrite. Later duplicates overwrite earlier ones, which is fine here because the earlier pair would already have been returned.'],
      ['d.get(k)', 'Lookup that returns None instead of raising KeyError.'],
      ['sorted(range(n), key=nums.__getitem__)', 'Sort the indexes by value: the way to keep indexes in the sort + two pointers variant.']
    ]
  };

  window.PROBLEM = {
    slug: 'two-sum',
    url: 'https://leetcode.com/problems/two-sum',
    statement: [
      'You are given an array of integers `nums` and an integer `target`. Return the indices of the two numbers that add up to `target`.',
      'Exactly one solution exists, you may not use the same element twice, and the answer can be in any order.'
    ],
    examples: [
      ['nums = [2,7,11,15], target = 9', '[0,1]    (nums[0] + nums[1] == 9)'],
      ['nums = [3,2,4], target = 6', '[1,2]'],
      ['nums = [3,3], target = 6', '[0,1]']
    ],
    constraints: ['`2 <= nums.length <= 10^4`', '`-10^9 <= nums[i] <= 10^9`', '`-10^9 <= target <= 10^9`', 'Only one valid answer exists.'],
    followup: 'Can you find an algorithm that is faster than O(n^2)?',
    writeup: [
      { h: 'Key insight', p: ['For each number `num` the partner we need is `target - num`, the complement. Instead of scanning the rest of the array for it, remember every number already seen in a hash map, so the lookup is O(1).'] },
      { h: 'Why check before insert', p: ['The lookup happens before `num_map[num] = i`, so an element can never pair with itself. With `nums = [3, 2, 4]` and `target = 6` the first `3` looks for `3`, finds nothing, and only then gets stored.', 'Real duplicates still work: for `[3, 3]` the second `3` finds the first at index 0 and returns `[0, 1]`.'] },
      { h: 'Complexity', p: ['Let n be `len(nums)`. Time is O(n): one pass, with an O(1) average hash lookup and insert per element. Space is O(n): in the worst case, with the pair at the very end, the map stores nearly every element.'] },
      { h: 'Compared to brute force', table: [['Approach', 'Time', 'Space'], ['Nested loops, every pair', 'O(n^2)', 'O(1)'], ['Hash map, one pass', 'O(n)', 'O(n)']], p: ['The hash map trades O(n) extra memory for dropping the inner loop.'] },
      { h: 'Is there a better solution?', p: ['Not asymptotically: every element must be read at least once, so O(n) time is a lower bound.'], ul: ['Sort + two pointers: O(n log n) time and O(1) extra space if sorted in place. Sorting destroys the original indexes, so you must track them, which brings the space back to O(n). It wins only when the array is already sorted or O(1) space is required.'] },
      { h: 'Edge cases', ul: ['Duplicates: `[3, 3]` with target 6 works.', 'Negatives and zero: `[-1, 0, 1]` with target 0 behaves the same way.', 'No solution: the loop ends and the function returns `None`. The problem guarantees a solution, so this does not occur.'] }
    ]
  };
})();
