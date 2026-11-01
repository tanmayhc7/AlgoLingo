/* LeetCode 125: Valid Palindrome. Python (if/elif two pointers) and C (nested skip loops) from T's folder; write-up condensed from EXPLAINED.md. */
(function () {
  var O = { x0: 80, dx: 95, y0: 40, dy: 68 };
  function chars(s) { return s.split('').map(function (c, i) { return ['c' + i, c === ' ' ? '_' : c, i, 0]; }); }
  var PY = ['class Solution(object):', '    def isPalindrome(self, s):', '        i, j = 0, len(s) - 1', '        while i < j:', '            if not s[i].isalnum():', '                i += 1', '            elif not s[j].isalnum():', '                j -= 1', '            elif s[i].lower() == s[j].lower():', '                i += 1', '                j -= 1', '            else:', '                return False', '        return True'];
  var C = [
    'bool isPalindrome(char* s) {',
    '    int i = 0, j = strlen(s) - 1;   // needs <string.h>',
    '    while (i < j) {',
    '        while (i < j && !isalnum((unsigned char)s[i])) i++;',
    '        while (i < j && !isalnum((unsigned char)s[j])) j--;',
    '        if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j]))',
    '            return false;',
    '        i++;',
    '        j--;',
    '    }',
    '    return true;',
    '}'
  ];
  /* "A b,B a" : A _ b , B _ a  (underscore stands for a space) */
  var s1 = [
    { pl: 2, cl: 1, say: 'The string is "A b,B a" (the underscores are spaces). i starts at the left end, j at the right end. Only letters and digits count.', csay: 'int i = 0, j = strlen(s) - 1;', add: chars('A b,B a'), ptr: [['i', 'c0', 'down'], ['j', 'c6', 'down']] },
    { pl: 8, cl: 5, say: 's[0] = A and s[6] = a. Both are alphanumeric and equal ignoring case. Move both pointers inward.', csay: 'tolower(s[i]) != tolower(s[j])', tag: [['c0', 'done'], ['c6', 'done']], ptr: [['i', 'c1', 'down'], ['j', 'c5', 'down']] },
    { pl: 4, cl: 3, say: 's[1] is a space, not alphanumeric. Skip it by moving i right.', csay: 'while (i < j && !isalnum(s[i])) i++;', tag: [['c1', 'dim']], ptr: [['i', 'c2', 'down']] },
    { pl: 6, cl: 4, say: 's[5] is a space too. Skip it by moving j left.', csay: 'while (i < j && !isalnum(s[j])) j--;', tag: [['c5', 'dim']], ptr: [['j', 'c4', 'down']] },
    { pl: 8, cl: 5, say: 's[2] = b and s[4] = B: equal ignoring case. Move both inward: they land on the same character (the comma), so one marker stands for both i and j.', csay: 'tolower(s[i]) != tolower(s[j])', tag: [['c2', 'done'], ['c4', 'done']], unptr: ['j'], ptr: [['i', 'c3', 'down']] },
    { pl: 13, cl: 10, say: 'i and j meet at the comma, so i < j is false and the loop ends. Every pair matched: return True. O(n) time, O(1) space.', csay: 'return true;', tag: [['c3', 'dim']] }
  ];
  /* "0P" */
  var s2 = [
    { pl: 2, cl: 1, say: 'The string is "0P". A digit counts, so both characters are compared.', csay: 'int i = 0, j = strlen(s) - 1;', add: chars('0P'), ptr: [['i', 'c0', 'down'], ['j', 'c1', 'down']] },
    { pl: 8, cl: 5, say: '"0" and "P" are both alphanumeric, so neither is skipped. Lowercased they are "0" and "p": different.', csay: 'tolower(s[i]) != tolower(s[j])', tag: [['c0', 'bad'], ['c1', 'bad']] },
    { pl: 12, cl: 6, say: 'Mismatch: return False. A filter that kept letters only would have dropped the 0 and wrongly returned True.', csay: 'return false;' }
  ];
  /* ".," */
  var s3 = [
    { pl: 2, cl: 1, say: 'The string is ".,": no letters or digits at all. Such a string counts as a palindrome (an empty one is).', csay: '', add: chars('.,'), ptr: [['i', 'c0', 'down'], ['j', 'c1', 'down']] },
    { pl: 4, cl: 3, say: 's[0] is not alphanumeric: move i right. The guard i < j in the C loop stops it from running past j.', csay: 'while (i < j && !isalnum(s[i])) i++;', tag: [['c0', 'dim']], unptr: ['j'], ptr: [['i', 'c1', 'down']] },
    { pl: 13, cl: 10, say: 'i has reached j, so nothing is left to compare. Return True. Without the guard, i and j could cross and read out of range.', csay: 'return true;', tag: [['c1', 'dim']] }
  ];

  window.LESSON = {
    id: 'lc-valid-palindrome', mode: 'ds',
    title: 'Valid Palindrome',
    lede: 'Is a sentence a palindrome if you ignore punctuation, spaces and case? Compare from both ends moving inward, skipping anything that is not a letter or digit. No copy of the string is ever made.',
    scenes: [
      {
        id: 'pointers', title: 'Two pointers moving inward', blurb: 'Compare the outer characters, then step both pointers toward the middle. Skip junk as you go.',
        trap: 'Skipping inside a loop needs the i < j guard, otherwise the pointers cross on strings with no alphanumeric characters.',
        pyCode: PY, cCode: C,
        predict: { q: 'In "A b,B a", which pair is compared right after A and a?', options: ['The space and the space', 'b and B', 'b and the comma'], answer: 1, why: 'Spaces and the comma are skipped, so the next alphanumeric characters from each end are b (index 2) and B (index 4).' },
        steps: Flow.steps(s1, O)
      },
      {
        id: 'digit', title: 'Digits count: "0P"', blurb: 'Digits are valid characters, so a letters-only filter gives the wrong answer here.',
        trap: 'Do not use the "differ by 32" ASCII trick for case: 0 is 48 and P is 80, so 48 + 32 == 80 falsely matches. Compare s[i].lower() with s[j].lower() instead.',
        pyCode: PY, cCode: C,
        predict: { q: 'Is "0P" a palindrome under these rules?', options: ['Yes', 'No'], answer: 1, why: 'The cleaned string is "0p", which reversed is "p0". They differ, so the answer is False.' },
        steps: Flow.steps(s2, O)
      },
      {
        id: 'empty', title: 'Nothing to compare', blurb: 'A string with no letters or digits is a palindrome by definition.',
        trap: 'The inner skip loops must test i < j. Otherwise they can run past each other on input like ".,".',
        pyCode: PY, cCode: C,
        predict: { q: 'What should isPalindrome(".,") return?', options: ['True', 'False'], answer: 0, why: 'After removing non-alphanumeric characters the string is empty, and an empty string reads the same both ways.' },
        steps: Flow.steps(s3, O)
      }
    ],
    builtins: [
      ['s[i].isalnum()', 'True for letters and digits only.'],
      ['s[i].lower()', 'Case-insensitive compare without ASCII arithmetic.'],
      ['isalnum((unsigned char)c)', 'C: cast first, ctype functions are undefined on negative char.'],
      ['cleaned[::-1]', 'A reversed copy: the alternative solution, O(n) extra space.'],
      ['str.isalpha()', 'Letters only. Wrong here, because digits must count.']
    ]
  };

  window.PROBLEM = {
    slug: 'valid-palindrome', url: 'https://leetcode.com/problems/valid-palindrome',
    statement: ['A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome, and `false` otherwise.'],
    examples: [['s = "A man, a plan, a canal: Panama"', 'true'], ['s = "race a car"', 'false'], ['s = " "', 'true']],
    constraints: ['`1 <= s.length <= 2 * 10^5`', '`s` consists only of printable ASCII characters.'],
    writeup: [
      { h: 'Approaches', table: [['Approach', 'Time', 'Space'], ['Two pointers', 'O(n)', 'O(1)'], ['Clean, then compare to reverse', 'O(n)', 'O(n)']] },
      { h: 'Key insight', p: ['A palindrome reads the same from both ends, so compare the first and last meaningful characters and move inward. Skip anything that is not a letter or digit as you go, so no filtered copy of the string is built.'] },
      { h: 'How it works', ul: ['`i` starts at the left end and `j` at the right end.', 'Move `i` right and `j` left past anything that is not alphanumeric (`isalnum()` is true for letters and digits only).', 'Compare lowercased characters. A mismatch returns `False` immediately; a match moves both pointers inward.', 'When the pointers meet or cross, every pair matched: return `True`.', 'The C version guards its skip loops with `i < j`, so a string with no alphanumeric characters cannot make the pointers cross.'] },
      { h: 'Trace: "race a car"', p: ['Cleaned it is "raceacar", reversed "racaecar". They differ at index 3 (e against a), so the answer is False.'] },
      { h: 'Clean and compare to reverse', p: ['`cleaned = [c.lower() for c in s if c.isalnum()]` then `return cleaned == cleaned[::-1]`. The most readable version, but it stores a filtered copy and a reversed copy: O(n) space.'] },
      { h: 'Which to use', ul: ['Interview: the two-pointer version. "Can you do it without extra space?" is the usual follow-up and it already answers it.', 'Quick scripting: clean and reverse.'], p: ['Not asymptotically improvable: every character must be examined, so O(n) time is a lower bound.'] },
      { h: 'Common pitfalls', ul: ['C operators in Python: use `not`, `and`, `or`.', '`len - 1` instead of `len(s) - 1`.', 'The +-32 case trick: it fails on digits.', 'Treating only letters as valid: "0P" must be False.', 'Missing `i < j` in the C skip loops.', 'Skipping the `(unsigned char)` cast before ctype functions.'] }
    ]
  };
})();
