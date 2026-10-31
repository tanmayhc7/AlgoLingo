/* Interview depth: Rabin-Karp. */
window.DEPTH = {
  thesis:
    'Rabin-Karp represents each text window by a hash and compares hashes instead of characters. A rolling hash updates in O(1) when the window slides by one: remove the leading digit, shift by the base, add the new digit, all mod a prime. Equal hashes are only candidates, so a match is verified by comparing characters. Expected O(n + m), worst case O(n x m) if collisions are constant.',
  why: [
    ['Multiple patterns', 'Put all pattern hashes in a set and test each window in O(1).'],
    ['Plagiarism and duplicates', 'Hashing k-grams finds repeated chunks of text, also the basis of "longest duplicate substring" with binary search.'],
    ['2-D matching', 'The idea extends to finding a small grid inside a larger one.'],
    ['Rolling hash technique', 'The same trick appears in rsync, content-defined chunking and many sliding-window string problems.'],
  ],
  edges: [
    ['Negative modulo', 'In C and Java (h - old * top) can be negative: add M before taking the remainder.'],
    ['Overflow', 'Use 64-bit arithmetic and a prime below 2^31, or double hashing, so products do not overflow.'],
    ['Collisions', 'Always verify on equal hashes. Choose a random base or modulus to resist adversarial inputs.'],
    ['Top power', 'Precompute top = B^(m - 1) mod M once with fast modular exponentiation.'],
    ['Small modulus', 'A tiny modulus (as in the demo) gives many spurious hits; production code uses large primes.'],
    ['Pattern longer than text', 'Return early; no windows exist.'],
  ],
  cost: [
    ['Expected time', 'O(n + m) with a good hash.'],
    ['Worst case', 'O(n x m) if every window collides and is verified.'],
    ['Space', 'O(1) for one pattern; O(k) for k patterns in a set.'],
    ['Compared with KMP', 'KMP is deterministic linear; Rabin-Karp is simpler to extend to many patterns and 2-D.'],
  ],
  internals: [
    ['Polynomial hash', 'hash(s) = s[0] B^(m-1) + s[1] B^(m-2) + ... + s[m-1], all mod M.'],
    ['Rolling update', 'new = ((old - s[i] x B^(m-1)) x B + s[i+m]) mod M.'],
    ['False positives only', 'Equal strings always have equal hashes, so no real match is missed.'],
    ['Randomisation', 'Picking the base or modulus at random makes the expected number of collisions small for any input.'],
  ],
  qa: [
    { lvl: 'junior', q: 'What is a rolling hash?', a: 'A hash of a sliding window that is updated in O(1) when the window moves by one position, instead of being recomputed from scratch.', follow: [] },
    { lvl: 'mid', q: 'Why must Rabin-Karp verify when hashes match?', a: 'Different strings can have the same hash (a collision). A match of hashes is only a candidate; comparing characters confirms it.', follow: [] },
    { lvl: 'mid', q: 'Compare Rabin-Karp with KMP.', a: 'KMP is deterministic O(n + m) and needs a table. Rabin-Karp is expected O(n + m), simple to code, and extends naturally to many patterns and 2-D grids, but its worst case is O(n x m) and it needs care with overflow and collisions.', follow: [] },
    { lvl: 'senior', q: 'Find the longest repeated substring.', a: 'Binary search on the length L. For a given L, roll a hash over all windows of length L and store them in a set (verifying on collisions); if a hash repeats, a duplicate of length L exists. Time O(n log n) expected.', follow: [] },
    { lvl: 'senior', q: 'How do you defend against anti-hash tests?', a: 'Choose the modulus or base at random at run time, use a large prime (or two moduli), and always verify candidates. Fixed well-known bases with 2^64 overflow are easy to attack.', follow: [] },
  ],
};
