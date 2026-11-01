/* Interview depth: LeetCode 242, Valid Anagram. */
window.DEPTH = {
  thesis: 'Valid Anagram asks whether two strings have the same multiset of characters. The answer is a frequency comparison, and the interview signal is choosing the right container: a 26-slot array for a known small alphabet, a hash map for anything else, and being able to say why sorting is only the baseline.',
  why: [
    ['Anagram means equal counts', 'Order does not matter, only how many of each character there are, so comparing frequency tables is exactly the definition.'],
    ['One array with plus and minus', 'Instead of two arrays and a compare, one array with +1 from s and -1 from t needs a single final zero check and half the memory.'],
    ['Alphabet size decides the container', 'A fixed alphabet of size k gives O(k) = O(1) space with an array. An open alphabet (Unicode) needs a dict, so space is O(distinct characters).']
  ],
  edges: [
    ['Different lengths', 'Return False immediately. It is also required for correctness of a zip-based loop.'],
    ['Empty strings', 'Both empty means anagrams (true); the constraint rules this out on LeetCode but a service would meet it.'],
    ['Non a-z characters', '`ord(c) - ord("a")` is negative for capitals, wrapping from the end in Python and reading out of bounds in C.'],
    ['Unicode', 'Compare code points with a dict, or normalise first (NFC) so composed and decomposed forms match. Anagrams of grapheme clusters need another step again.'],
    ['Repeated letters', '"aab" and "abb" have the same set of letters but different counts, so they are not anagrams. A set comparison is wrong.']
  ],
  cost: [
    ['count array', 'O(n) time, O(1) space', '26 counters regardless of input size.'],
    ['hash map / Counter', 'O(n) time, O(k) space', 'k distinct characters.'],
    ['sort both', 'O(n log n) time, O(n) space', 'In C, copies plus qsort.']
  ],
  internals: [
    ['Counter is a dict', '`collections.Counter` subclasses `dict`, with missing keys reading as 0. `==` compares contents; zero-count entries can make two Counters unequal in older Python versions, so avoid subtracting then comparing.'],
    ['Why `char - \'a\'` works', 'In ASCII the lowercase letters are consecutive code points, so subtraction gives a dense index.']
  ],
  qa: [
    {
      lvl: 'mid', q: 'Check whether two strings are anagrams in O(n).',
      a: 'If the lengths differ return False. Otherwise count characters: add one for each in s and subtract one for each in t using an array of 26 (or a dict). They are anagrams if all counters end at 0.',
      follow: [['What about Unicode?', 'Use a dict keyed by code point, and normalise the strings first so equivalent forms compare equal.'], ['Why is sorting worse?', 'O(n log n) time and O(n) space against O(n) time and O(1) or O(k) space.']]
    },
    {
      lvl: 'mid', q: 'Why use one counter array instead of two?',
      a: 'The plus and minus cancel for matching letters, so a single pass leaves zeros when the strings match. It halves memory and avoids comparing two arrays.',
      follow: []
    },
    {
      lvl: 'senior', q: 'You must group a billion short strings into anagram classes. What do you do?',
      a: 'Compute a canonical key per string (sorted letters, or a count signature) and group by key with a distributed hash partition. A count signature costs O(k) per string instead of O(k log k) for sorting, and works well as a shuffle key. Watch for skew when common keys dominate.',
      follow: []
    }
  ]
};
