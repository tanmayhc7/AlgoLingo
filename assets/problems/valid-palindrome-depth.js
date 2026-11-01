/* Interview depth: LeetCode 125, Valid Palindrome. */
window.DEPTH = {
  thesis: 'Valid Palindrome is the entry point to the two-pointer pattern: two indexes start at the ends and move toward each other, each step discarding part of the search space. The interview signal is doing it in place with correct skipping and no off-by-one on the crossing condition.',
  why: [
    ['Symmetry halves the work', 'A string is a palindrome if s[i] == s[n-1-i] for every i. Two pointers walk exactly those pairs.'],
    ['Skipping instead of filtering', 'Moving a pointer past junk keeps the whole thing O(1) space. Building the cleaned string is simpler but costs O(n) memory.'],
    ['The loop invariant', 'Everything outside [i, j] has already matched. When i >= j nothing remains to compare.']
  ],
  edges: [
    ['No alphanumeric characters', '" " and ".," are palindromes; the guard i < j keeps the pointers from crossing.'],
    ['Digits', '"0P" is False; filtering to letters only would say True.'],
    ['Case', 'Compare lowercased characters, not ASCII offsets.'],
    ['Odd and even length', 'Odd: the pointers meet on the middle character. Even: they cross. Both end the loop.'],
    ['Unicode', 'isalnum and lower work per code point; accented letters, combining marks and case folding (ss versus the sharp s) need normalisation.'],
    ['Signed char in C', 'ctype functions need unsigned char values; negative values are undefined.']
  ],
  cost: [
    ['two pointers', 'O(n) time, O(1) space', 'Each pointer moves at most n steps in total.'],
    ['clean and reverse', 'O(n) time, O(n) space', 'Two extra copies.'],
    ['recursive version', 'O(n) time, O(n) stack', 'Compare ends and recurse inward; no better.']
  ],
  internals: [
    ['Why O(n) and not O(n^2)', 'The inner skip loops look nested, but a pointer only moves forward, so across the whole run each character is passed over once.'],
    ['Two-pointer family', 'The same shape solves Two Sum II (sorted), 3Sum, Container With Most Water and Trapping Rain Water: a decision at each step lets you discard one pointer.']
  ],
  qa: [
    {
      lvl: 'mid', q: 'Check whether a sentence is a palindrome, ignoring non-alphanumeric characters and case.',
      a: 'Two pointers from both ends. Skip non-alphanumeric characters on each side, compare lowercased characters, return False on a mismatch, otherwise move inward. O(n) time and O(1) space.',
      follow: [['What if you may use extra space?', 'Clean to lowercase alphanumerics and compare with the reverse. Same time, O(n) space, shorter code.'], ['Which conditions end the loop?', 'i < j fails: the pointers meet or cross.']]
    },
    {
      lvl: 'mid', q: 'What would you test?',
      a: 'The empty or all-punctuation string, a single character, even and odd lengths, digits ("0P"), mixed case, and long input with long runs of punctuation at either end.',
      follow: []
    },
    {
      lvl: 'senior', q: 'You can delete at most one character to make a palindrome. How?',
      a: 'Use the same two pointers. On the first mismatch, try skipping either s[i] or s[j] and check whether the remaining substring is a palindrome. That is at most two extra linear checks, so O(n) overall.',
      follow: [['Delete at most k characters?', 'That becomes a dynamic programming problem (longest palindromic subsequence); the answer is len(s) - LPS <= k.']]
    }
  ]
};
