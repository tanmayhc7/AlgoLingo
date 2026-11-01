/* Interview depth: LeetCode 1, Two Sum. */
window.DEPTH = {
  thesis:
    'Two Sum is a test of one move: replace "search the rest of the array for the partner" with "remember what I have seen and look the partner up". That turns O(n^2) into O(n) time at the cost of O(n) space. Interviewers use it to see whether you can state the trade-off, justify the lookup-before-insert order, and adapt when the constraints change.',
  why: [
    ['The complement framing', 'Fixing one number fixes the other: it must equal `target - num`. A search for a pair becomes n searches for a single value, and a single-value search is what hash tables do in O(1).'],
    ['Why one pass is enough', 'If the pair is (a, b) with a earlier than b, then when the loop reaches b, a is already in the map. Every valid pair is therefore found at its later element, so no second pass is needed.'],
    ['Why the order inside the loop matters', 'Lookup before store means the map only holds earlier elements. That single ordering rule is what forbids using an element twice, and it still lets two equal values match each other.'],
    ['The space-for-time trade', 'The map costs O(n) memory. If memory is the binding constraint, sort a copy of the indexes and use two pointers: O(n log n) time with little extra space.']
  ],
  edges: [
    ['Duplicates', '`[3, 3]`, target 6 returns `[0, 1]`. Overwriting an earlier equal value in the map is safe, because the pair that needed it would already have been returned.'],
    ['Same element twice', 'target 6 with `[3, 2, 4]` must not return `[0, 0]`. This is the lookup-before-store rule.'],
    ['Negatives and zero', '`[-1, 0, 1]`, target 0: subtraction and hashing do not care about sign.'],
    ['Overflow in C', '`target - nums[i]` is up to 2 x 10^9 in magnitude, which still fits a 32-bit int (about 2.147 x 10^9). In a variant with larger bounds, use `long long`.'],
    ['No solution', 'The problem guarantees one. In production, return an empty list or raise, rather than falling off the end and returning `None` or garbage.'],
    ['Unhashable or float keys', 'With floats, `target - num` may not equal a stored value exactly. Use integers, or compare with a tolerance and a different structure.'],
    ['Adversarial integers in C', 'A hash of `x & (SIZE - 1)` collides for multiples of the table size, so a crafted input degrades probing to O(n) per lookup. Mix the bits (multiply by a large odd constant first) when input is untrusted.']
  ],
  cost: [
    ['brute force', 'O(n^2) time, O(1) space', 'Every pair, n(n-1)/2 checks.'],
    ['hash map, one pass', 'O(n) time, O(n) space', 'One lookup and at most one insert per element.'],
    ['sort + two pointers', 'O(n log n) time, O(n) or O(1) space', 'Sorting dominates. Tracking original indexes needs O(n); if you may return values, O(1) in place.'],
    ['hash map worst case', 'O(n^2) time', 'Only if every key collides. Not a concern with a sound hash.']
  ],
  internals: [
    ['What `in` and `[]` do on a dict', 'Python hashes the key, probes the compact index table, and compares keys. Integers hash to themselves, so for small ints there are almost no collisions in practice.'],
    ['The same idea in C', 'C has no built-in dict. The C panel uses open addressing with linear probing in a power-of-two table: `h & (SIZE - 1)` is a cheap modulo, and a load factor near 0.6 keeps probe runs short.'],
    ['Why not a set?', 'A set answers "have I seen this value?" but we must return an index, so the map stores value to index.']
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Solve Two Sum and give the complexity.',
      a: 'One pass with a dict from value to index. For each number compute the complement, return the stored index and the current index if the complement is in the dict, otherwise store the number. Time O(n) because dict operations are O(1) on average, space O(n) for the dict.',
      follow: [
        ['Why do you check before you insert?', 'So that an element cannot match itself. With [3, 2, 4] and target 6, inserting first would answer [0, 0].'],
        ['What if there are duplicates?', 'They still work: the second 3 in [3, 3] finds the first one that was stored earlier.']
      ]
    },
    {
      lvl: 'mid',
      q: 'Can you do it without extra memory?',
      a: 'Yes, at higher time cost. Brute force uses O(1) space and O(n^2) time. Sorting plus two pointers takes O(n log n) time and no extra memory if you may return values; to return original indexes you must remember them, which costs O(n) again.',
      follow: [
        ['When is sort + two pointers the better answer?', 'When the input is already sorted (as in Two Sum II) or when memory is very tight and n is large.']
      ]
    },
    {
      lvl: 'senior',
      q: 'The array does not fit in memory. How would you find the pair?',
      a: 'Partition by value: hash each number into one of k buckets on disk so that a number and its complement land in the same bucket (for example by hashing min(x, target - x)). Then solve each bucket in memory with the dict approach. Or sort externally and run two pointers over the sorted stream. Both are O(n) or O(n log n) passes over disk.',
      follow: [
        ['What changes if the data arrives as a stream?', 'Keep the map of seen values and answer each new number with one lookup. This is the "online" version, and it is the same code, one element at a time.'],
        ['How would you make it a reusable service?', 'Keep an add(x) / find(sum) structure. Store counts in a dict so add is O(1) and find is O(n), or maintain a sorted structure if find must be fast.']
      ]
    },
    {
      lvl: 'senior',
      q: 'How does this generalise to 3Sum, 4Sum or k-sum?',
      a: 'Sort, fix the first k - 2 numbers and finish with two pointers: 3Sum is O(n^2), 4Sum O(n^3). A dict can replace the innermost pointers but then duplicates in the output need extra care, which is why the sorted version is preferred.',
      follow: [
        ['How do you avoid duplicate triples?', 'Skip equal neighbours after sorting, both for the fixed element and when moving the two pointers.']
      ]
    },
    {
      lvl: 'staff',
      q: 'Your dict-based solution is slow on a hostile input. What happened and how do you fix it?',
      a: 'Collisions. If the hash function maps many keys to few slots, probes grow and lookups degrade towards O(n). Python randomises string hashes, but integer hashes are predictable, so a crafted set of integers can collide in a naive table. In C, mix the bits before masking (multiply by an odd constant, then shift), or use a randomised seed. As a last resort, switch to sorting, whose worst case is guaranteed.',
      follow: []
    }
  ]
};
