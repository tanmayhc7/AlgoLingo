/* Interview depth: LeetCode 49, Group Anagrams. */
window.DEPTH = {
  thesis: 'Group Anagrams is the "canonical key" pattern: map every item to a representative that is equal for all members of its class, then bucket by it. The choice of key (sorted string versus count tuple) is the whole discussion, and it trades O(k log k) against O(k) per word.',
  why: [
    ['Canonical form', 'Anagram-ness is an equivalence relation. A function f with f(a) == f(b) exactly when a and b are anagrams turns a pairwise question into a dict lookup.'],
    ['Why sorting works', 'Sorting erases order and keeps counts, which is the definition of an anagram.'],
    ['Why a count tuple is faster', 'It builds the key in O(k) by counting letters, instead of O(k log k) by sorting, as long as the alphabet is small and fixed.']
  ],
  edges: [
    ['Empty strings', '"" has key "" and groups with other empty strings.'],
    ['Unhashable keys', 'A list is not hashable. Use a string or tuple.'],
    ['Collisions in a bad key', 'A set of letters, or just the word length, merges non-anagrams.'],
    ['Output order', 'Any order is accepted, but a dict preserves first-seen order, which keeps results deterministic.'],
    ['Large alphabets', 'The 26-count tuple does not apply to Unicode; fall back to the sorted string or a Counter converted to a frozenset of items.']
  ],
  cost: [
    ['sorted-string key', 'O(n k log k) time, O(n k) space', 'n words of length k.'],
    ['count-tuple key', 'O(n k) time, O(n k) space', '26-slot count per word.'],
    ['pairwise anagram check', 'O(n^2 k) time', 'Compare every pair; the brute force.']
  ],
  internals: [
    ['How the dict groups', 'Equal strings hash equal, so words with the same sorted key land in the same slot and the lookup finds the existing list in O(1) average (the key itself costs O(k) to hash).'],
    ['Stable output with sort in C', 'The C version sorts pairs by key. `qsort` is not stable, so the order inside a group may change; add the original index as a tiebreak if you need first-seen order.']
  ],
  qa: [
    {
      lvl: 'mid', q: 'Group a list of words into anagram classes.',
      a: 'Use a dict from sorted word to list. For each word compute "".join(sorted(w)) and append the word to that key\'s list. Return the dict values. O(n k log k) time and O(n k) space.',
      follow: [['Can you avoid sorting each word?', 'Yes: use a tuple of 26 letter counts as the key. That is O(k) per word.'], ['Why not a list as the key?', 'Lists are mutable and unhashable. Tuples and strings are fine.']]
    },
    {
      lvl: 'senior', q: 'The data is too big for one machine.',
      a: 'Compute the key per word on each worker, then shuffle by hash(key) so all members of a class meet on one reducer, which concatenates the lists. This is a classic MapReduce group-by. Watch for skew from very common keys and partition them further if needed.',
      follow: []
    },
    {
      lvl: 'senior', q: 'Strings may contain any Unicode character.',
      a: 'The 26-slot count does not apply. Use a sorted tuple of code points, or a frozenset of (code point, count) pairs, and normalise first so canonically equivalent forms compare equal.',
      follow: []
    }
  ]
};
