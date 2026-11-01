/* LeetCode 242: Valid Anagram. Count-array solution from T's EXPLAINED.md (Python and C); hash-map and Counter versions are in the write-up. */
(function () {
  var O = { x0: 80, dx: 95, y0: 40, dy: 68 };
  function word(prefix, s, row) { return s.split('').map(function (c, i) { return [prefix + i, c, i + 1, row]; }); }
  var PY = ['class Solution:', '    def isAnagram(self, s: str, t: str) -> bool:', '        if len(s) != len(t):', '            return False', '', '        count = [0] * 26', '        for a, b in zip(s, t):', '            count[ord(a) - ord(\'a\')] += 1', '            count[ord(b) - ord(\'a\')] -= 1', '', '        return all(c == 0 for c in count)'];
  var C = [
    'bool isAnagram(char* s, char* t) {',
    '    int count[26] = {0};',
    '    int i;',
    '',
    '    for (i = 0; s[i] && t[i]; i++) {',
    '        count[s[i] - \'a\']++;',
    '        count[t[i] - \'a\']--;',
    '    }',
    '    if (s[i] || t[i]) return false;      // different lengths',
    '',
    '    for (int k = 0; k < 26; k++) {',
    '        if (count[k] != 0) return false;',
    '    }',
    '    return true;',
    '}'
  ];
  /* scene 1: tea / eat. Counters for the letters in play only (e, a, t) */
  function pair(i, sc, tc, cnt) {
    var lab = [];
    ['e', 'a', 't'].forEach(function (L) { lab.push(['c' + L, L + ':' + cnt[L]]); });
    return { pl: 7, cl: 5, say: 's[' + i + '] = ' + sc + ' adds one to ' + sc + '; t[' + i + '] = ' + tc + ' subtracts one from ' + tc + '.' + (sc === tc ? ' Same letter, so it nets to zero.' : ''), csay: 'count[s[i] - \'a\']++;  count[t[i] - \'a\']--;', lab: lab, tag: [['s' + i, 'cur'], ['t' + i, 'cur']], untag: i ? [['s' + (i - 1), 'cur'], ['t' + (i - 1), 'cur']] : [], ptr: [['i', 's' + i, 'down']] };
  }
  var yes = [
    { pl: 5, cl: 1, say: 's = "tea" and t = "eat". Walk both strings together with one array of 26 counters (shown only for e, a, t). s adds, t subtracts.', csay: 'int count[26] = {0};', add: word('s', 'tea', 0).concat(word('t', 'eat', 2), [['sl', 's =', 0, 0], ['tl', 't =', 0, 2], ['ce', 'e:0', 5, 0], ['ca', 'a:0', 6, 0], ['ct', 't:0', 7, 0]]) },
    pair(0, 't', 'e', { e: -1, a: 0, t: 1 }),
    pair(1, 'e', 'a', { e: 0, a: -1, t: 1 }),
    pair(2, 'a', 't', { e: 0, a: 0, t: 0 }),
    { pl: 10, cl: 13, say: 'Every counter is 0, so each letter appeared equally often in both strings. Return True. One pass, 26 counters: O(n) time and O(1) space.', csay: 'return true;', tag: [['ce', 'done'], ['ca', 'done'], ['ct', 'done']] }
  ];
  /* scene 2: rat / car */
  var no = [
    { pl: 5, cl: 1, say: 's = "rat" and t = "car". Same length, so the loop runs. Counters shown for r, a, t, c.', csay: 'int count[26] = {0};', add: word('s', 'rat', 0).concat(word('t', 'car', 2), [['sl', 's =', 0, 0], ['tl', 't =', 0, 2], ['cr', 'r:0', 5, 0], ['ca', 'a:0', 6, 0], ['ct', 't:0', 7, 0], ['cc', 'c:0', 8, 0]]) },
    { pl: 7, cl: 5, say: 'i = 0: r goes up, c goes down.', csay: '', lab: [['cr', 'r:1'], ['cc', 'c:-1']], tag: [['s0', 'cur'], ['t0', 'cur']], ptr: [['i', 's0', 'down']] },
    { pl: 7, cl: 5, say: 'i = 1: a up, a down. It cancels.', csay: '', untag: [['s0', 'cur'], ['t0', 'cur']], tag: [['s1', 'cur'], ['t1', 'cur']], ptr: [['i', 's1', 'down']] },
    { pl: 7, cl: 5, say: 'i = 2: t goes up, r goes down. r is back to 0, but t is stuck at 1 and c is at -1.', csay: '', lab: [['cr', 'r:0'], ['ct', 't:1']], untag: [['s1', 'cur'], ['t1', 'cur']], tag: [['s2', 'cur'], ['t2', 'cur']], ptr: [['i', 's2', 'down']] },
    { pl: 10, cl: 11, say: 'Scan the counters: t is 1 and c is -1, not 0. Return False. A non-zero counter means a letter appears a different number of times.', csay: 'if (count[k] != 0) return false;', tag: [['ct', 'bad'], ['cc', 'bad']] }
  ];

  window.LESSON = {
    id: 'lc-valid-anagram', mode: 'ds',
    title: 'Valid Anagram',
    lede: 'Are two strings made of the same letters in the same quantities? Count letters, then compare. With a fixed alphabet the "map" is just an array indexed by the letter, so the whole check is O(n) time and O(1) space.',
    scenes: [
      {
        id: 'yes', title: 'Anagram: counters cancel', blurb: 'Add one for each letter of s and subtract one for each letter of t. If they are anagrams, everything cancels.',
        trap: 'Check the lengths first. Without it, zip silently drops the tail of the longer string, and in C the loop would stop early.',
        pyCode: PY, cCode: C,
        predict: { q: 'For s = "tea" and t = "eat", what are the counters after the loop?', options: ['All zero', 'e is 1, t is -1', 'They cannot be known until sorted'], answer: 0, why: 'Each letter is added once by s and subtracted once by t, so every counter returns to 0.' },
        steps: Flow.steps(yes, O)
      },
      {
        id: 'no', title: 'Not an anagram: a counter is left over', blurb: 'The letters differ, so some counters cannot return to zero.',
        trap: 'Using the 26-slot array on input with capitals, digits or Unicode indexes out of range (negative in Python, out of bounds in C). Use a dict or Counter for arbitrary characters.',
        pyCode: PY, cCode: C,
        predict: { q: 'For s = "rat" and t = "car", which counters are non-zero at the end?', options: ['None', 't and c', 'r only'], answer: 1, why: 'r is added then subtracted and a cancels, but t is only added (+1) and c is only subtracted (-1).' },
        steps: Flow.steps(no, O)
      }
    ],
    builtins: [
      ['ord(ch) - ord(\'a\')', 'Letter to index 0..25.'],
      ['zip(s, t)', 'Walk two strings in step; stops at the shorter one, so check lengths first.'],
      ['collections.Counter(s)', 'Frequency dict; Counter(s) == Counter(t) compares by contents.'],
      ['dict.get(k, 0)', 'Read a count with a default, avoiding a KeyError.'],
      ['sorted(s) == sorted(t)', 'Shortest solution: O(n log n) time, O(n) space.']
    ]
  };

  window.PROBLEM = {
    slug: 'valid-anagram', url: 'https://leetcode.com/problems/valid-anagram',
    statement: ['Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.', 'An anagram uses all the original letters exactly once, rearranged.'],
    examples: [['s = "anagram", t = "nagaram"', 'true'], ['s = "rat", t = "car"', 'false']],
    constraints: ['`1 <= s.length, t.length <= 5 * 10^4`', '`s` and `t` consist of lowercase English letters.'],
    followup: 'What if the inputs contain Unicode characters? How would you adapt the solution?',
    writeup: [
      { h: 'Approaches', table: [['Approach', 'Time', 'Space'], ['Hash map or Counter', 'O(n)', 'O(k) distinct characters'], ['Count array (lowercase a-z)', 'O(n)', 'O(1)'], ['Sort both and compare', 'O(n log n)', 'O(n)']] },
      { h: 'Count array (best for a-z)', p: ['If the alphabet is a fixed 26 letters you do not need a hash map. Use one array of 26 counters indexed by `char - \'a\'`: add one for each character of `s`, subtract one for each character of `t`. The strings are anagrams exactly when every counter ends at 0.'], ul: ['Letters are contiguous in ASCII, so `\'a\'` maps to 0 and `\'z\'` to 25.', 'In C the loop ends when either string reaches `\'\\0\'`. If one still has characters left, the lengths differ.', 'It only works for `a-z`. For capitals, digits or Unicode (the usual follow-up) use a hash map or `Counter`, or size the array for the larger alphabet (128 for ASCII).'] },
      { h: 'Hash map version', p: ['Count each string into its own dict with `map[ch] = map.get(ch, 0) + 1` and compare the dicts with `==`. `Counter(s) == Counter(t)` is the same logic in one line.'] },
      { h: 'Sort both and compare', p: ['Anagrams become identical once sorted: `sorted(s) == sorted(t)`. It is the shortest correct answer but costs O(n log n) time and O(n) space.'] },
      { h: 'Is there a better solution?', p: ['Not asymptotically: every character must be read, so O(n) is a lower bound.'] },
      { h: 'Common pitfalls', ul: ['`KeyError` on a missing key: use `.get(ch, 0)` or `Counter`.', 'A stray comma: `for i, j in sorted(a), sorted(b)` iterates over a tuple of two lists, not paired elements. Use `zip`.', 'Sorting a dict yields only keys, ignoring counts, so "aab" and "abb" would look equal. Compare the maps directly.', 'Forgetting the length check.', 'Using the array on non-lowercase input.'] }
    ]
  };
})();
