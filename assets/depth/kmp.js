/* Interview depth: KMP. */
window.DEPTH = {
  thesis:
    'KMP searches for a pattern in a text in O(n + m) by never re-reading text characters. A failure table lps[i] stores the length of the longest proper prefix of pattern[0..i] that is also a suffix. After a mismatch with j characters matched, the pattern slides so that its first lps[j - 1] characters line up with the text already matched; only j changes, i never goes back.',
  why: [
    ['Linear-time search', 'Naive search is O(n x m) in the worst case (text "AAAA...", pattern "AAA...B"). KMP removes that.'],
    ['Borders show up everywhere', 'The lps table solves "shortest repeating unit", "longest happy prefix", "shortest palindrome by prepending", and "is B a rotation of A".'],
    ['Streaming', 'KMP reads the text once, left to right, so it works on streams and files.'],
    ['Classic automaton thinking', 'The table is a compact state machine; it leads to Aho-Corasick for many patterns.'],
  ],
  edges: [
    ['Empty pattern', 'Decide what to return (index 0 by convention) before touching pattern[0].'],
    ['Overlapping matches', 'After a full match set j = lps[m - 1] to continue and find overlapping occurrences.'],
    ['Off-by-one on fallback', 'Fallback uses lps[j - 1], the border of the matched part, not lps[j].'],
    ['Pattern longer than text', 'Return no match immediately.'],
    ['Repeated characters', 'Patterns like "AAAA" have lps [0, 1, 2, 3]: lots of fallback with single steps, still linear overall.'],
    ['Unicode', 'Index by code point, not by byte, or match bytes consistently.'],
  ],
  cost: [
    ['Build lps', 'O(m).'],
    ['Search', 'O(n): j increases at most n times, so it decreases at most n times.'],
    ['Space', 'O(m) for the table.'],
    ['Naive search', 'O(n x m) worst case, O(n) typical on random text.'],
  ],
  internals: [
    ['Border', 'A string that is both a proper prefix and a suffix. lps[i] is the length of the longest one.'],
    ['Amortised argument', 'Each iteration either increases j by one or decreases it through the table. Total decreases cannot exceed total increases, which are at most n.'],
    ['Building lps is KMP on itself', 'The same while-loop matches the pattern against its own earlier part.'],
    ['Why skipping is safe', 'Any alignment between the old and new start has already been shown to mismatch, by the border property.'],
  ],
  qa: [
    { lvl: 'junior', q: 'What problem does KMP solve and how fast?', a: 'Substring search in O(n + m) time, instead of the naive O(n x m).', follow: [] },
    { lvl: 'mid', q: 'What does lps[i] mean?', a: 'The length of the longest proper prefix of pattern[0..i] that is also a suffix of it. It tells how many characters stay matched after a mismatch.', follow: [['What is lps of "AABAAB"?', '[0, 1, 0, 1, 2, 3].']] },
    { lvl: 'mid', q: 'Why is the search O(n) even with the while loop?', a: 'j rises by at most one per text character, and every iteration of the while loop lowers j. So total fallbacks are at most n.', follow: [] },
    { lvl: 'senior', q: 'Find the smallest period of a string using the lps table.', a: 'Let p = m - lps[m - 1]. If m % p == 0 the string is a repetition of its first p characters (p is the period); otherwise it is not periodic and the answer is m.', follow: [] },
    { lvl: 'senior', q: 'Search for many patterns at once.', a: 'Aho-Corasick: build a trie of the patterns and add failure links (the KMP idea generalised), then scan the text once in O(n + total pattern length + matches). Alternatives: Rabin-Karp with a hash set for equal-length patterns.', follow: [] },
  ],
};
