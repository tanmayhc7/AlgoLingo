/* Interview depth: Linked list patterns. */
window.DEPTH = {
  thesis:
    'Five ideas cover most linked list interviews: reverse by flipping arrows (prev, cur, nxt), fast and slow pointers for middle and cycles, a dummy head to erase the special case at the front, splicing and merging by relinking, and recursion that mirrors the structure. Each runs in O(n) time with O(1) extra space except the recursive versions. Interviewers care less about the tricks than about whether you can say what invariant your pointers keep.',
  why: [
    ['Reverse is the building block', 'Reverse a whole list, a sub-range, or every k nodes, and many other problems (palindrome check, reorder list, add two numbers stored in reverse) reduce to it. Learn the four-line loop until it is automatic, then learn what the three names mean: `prev` is the reversed part, `cur` is the node being processed, `nxt` is the unprocessed rest.'],
    ['Two speeds give you position without a length', 'When fast moves twice as far as slow, slow sits at the midpoint when fast ends. The gap between them also gives you "n-th from the end": advance one pointer n steps first, then move both.'],
    ['Cycle detection is a gap argument', 'Inside a cycle the gap between fast and slow changes by one per round, modulo the cycle length, so it must hit zero. That also tells you why the speeds must differ by exactly one for the proof to be this simple.'],
    ['A dummy head makes code uniform', 'Every real node gets a predecessor, so insert-before, delete, and merge no longer branch on "is this the first node". The price is one extra node and remembering to return `dummy.next`.'],
  ],
  edges: [
    ['Reverse: empty and one-node lists', 'The loop never runs for empty input and returns `prev` as `None`; for one node it flips one arrow to `None` and returns it. Both fall out naturally if you write it right, which is a good self-check.'],
    ['Reverse: forgetting to terminate the old head', 'The old head ends as the new tail and must point at `None`. The standard loop does this because the first `cur.next = prev` assigns `None`. A hand-rolled version that skips it leaves a cycle.'],
    ['Reverse a sub-range [m, n]', 'Walk to the node before position m, reverse n - m + 1 nodes, then reconnect both ends. The dummy head handles m = 1.'],
    ['Fast and slow: loop condition order', '`while fast and fast.next`. The reverse order crashes on even-length lists when `fast` becomes `None`.'],
    ['Middle of an even-length list', 'The standard loop returns the second middle. To get the first middle, start `fast = head.next` or test `fast.next and fast.next.next`.'],
    ['Cycle start', 'After they meet, reset one pointer to `head` and move both one step at a time. They meet at the cycle entry. Proof: let the head-to-entry distance be a, entry-to-meeting b, cycle length c. At meeting, slow walked a + b and fast walked 2(a + b), so a + b is a multiple of c, meaning walking a more steps from the meeting point returns to the entry.'],
    ['Cycle detection compares identity', 'Use `is` (Python) or pointer equality (C). Comparing values gives false positives.'],
    ['n-th from the end with n larger than the length', 'The lead pointer runs off the end. Validate, or return `None` / the head as the problem specifies.'],
    ['Merge two sorted lists', 'Use a dummy and a tail pointer. When one list runs out, attach the remainder of the other directly instead of looping. Ties: take from the first list to stay stable.'],
    ['Palindrome check', 'Find the middle, reverse the second half, compare, and (politely) restore it. If the problem forbids modifying input, copy values to an array instead and say so.'],
    ['Recursion and stack depth', 'Recursive reverse is elegant but uses O(n) stack and fails around 1000 nodes in default Python. In an interview mention the iterative version as the production choice.'],
    ['Intersection of two lists', 'Walk two pointers; when one ends, restart it at the other list\'s head. Both travel a + b + c nodes and meet at the intersection, or both become `None` together.'],
  ],
  cost: [
    ['reverse (iterative)', 'O(n) time, O(1) space', 'Three pointers.'],
    ['reverse (recursive)', 'O(n) time, O(n) space', 'Call stack depth n.'],
    ['middle via fast/slow', 'O(n), O(1)', 'One pass; about n/2 steps for slow.'],
    ['cycle detection (Floyd)', 'O(n), O(1)', 'Hash-set version is O(n) space.'],
    ['cycle entry', 'O(n), O(1)', 'Second phase of Floyd.'],
    ['n-th from end', 'O(n), O(1)', 'Single pass with a lead pointer.'],
    ['merge two sorted lists', 'O(n + m), O(1)', 'Relink nodes, no new nodes needed.'],
    ['merge k sorted lists', 'O(N log k), O(k)', 'Min-heap of heads, or pairwise merging.'],
    ['sort a list', 'O(n log n), O(log n)', 'Merge sort is the natural fit; no random access is needed.'],
    ['copy with random pointers', 'O(n), O(1) or O(n)', 'Interleave copies, or use a dict old-to-new.'],
  ],
  internals: [
    ['Why merge sort suits linked lists', 'Merging needs only sequential access and relinking, and splitting at the middle is done with fast and slow pointers. Quicksort needs random access for pivoting and swapping, and heap sort needs indexing, so both fit arrays better.'],
    ['The loop invariant for reverse', 'At the top of each iteration, `prev` heads a correctly reversed copy of everything already processed, `cur` heads the unprocessed rest, and the two lists share no nodes. The loop body keeps that true. Stating this is what separates a memorised answer from an understood one.'],
    ['Floyd\'s algorithm and memory', 'It needs two pointers (16 bytes) instead of a set that stores every node address. For a billion-node list, that is the difference between feasible and not. Brent\'s variant uses power-of-two checkpoints and often finishes in fewer steps.'],
    ['Dummy nodes in real code', 'Sentinels appear in kernel lists, skip lists, and many `std::list` implementations (a circular list with one sentinel node). They trade one allocation for the removal of whole classes of branch bugs.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Reverse a singly linked list.',
      a: 'Iterative with three names: `prev = None; cur = head; while cur: nxt = cur.next; cur.next = prev; prev = cur; cur = nxt; return prev`. O(n) time, O(1) space. I save `nxt` first because overwriting `cur.next` destroys the only link to the rest. For an empty list it returns `None`; for one node it returns that node with `next = None`.',
      follow: [
        ['Now write it recursively.', '`def rev(node): if not node or not node.next: return node; new_head = rev(node.next); node.next.next = node; node.next = None; return new_head`. It reverses the tail first, then makes the following node point back at this one. O(n) stack, so it breaks on long lists in Python.'],
        ['Reverse only positions m to n.', 'Use a dummy, walk `m - 1` steps to `before`, then repeatedly move `before.next.next` to the front of the range (head insertion), `n - m` times. Or reverse the sub-list normally and reconnect both ends. Handle m = 1 via the dummy.'],
        ['Reverse in groups of k.', 'Check there are k nodes ahead, reverse them, connect the previous group to the new head, and leave a final short group as is. O(n) time, O(1) space iteratively.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Detect whether a linked list has a cycle, and find where it starts.',
      a: 'Floyd\'s algorithm. Phase one: `slow` moves one step, `fast` two; if they meet there is a cycle, and if `fast` hits `None` there is not. Phase two: put one pointer back at `head`, move both one step at a time; they meet at the cycle\'s entry node. Proof sketch: if the head-to-entry distance is a and the meeting point is b nodes past the entry in a cycle of length c, then slow walked a + b and fast walked 2(a + b), so a + b is a multiple of c. Moving a more steps from the meeting point therefore lands on the entry, exactly where a pointer starting from the head arrives after a steps.',
      follow: [
        ['What is the simpler alternative and why is it worse?', 'A `set` of visited nodes finds a cycle in O(n) time but uses O(n) memory, and in Python it requires nodes to be hashable (identity hash works by default).'],
        ['Why must the speeds differ by one?', 'With a difference of one, the gap closes by exactly one per round and cannot skip over zero. With other ratios the pointers can leap past each other and might need more rounds or never meet for certain cycle lengths.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Merge k sorted linked lists.',
      a: 'Push each non-empty head into a min-heap keyed by value (with an index as tiebreaker, because `Node` objects are not orderable), pop the smallest, append it to the result via a dummy and tail pointer, then push that node\'s `next`. O(N log k) time for N total nodes, O(k) extra space. An alternative with no heap is divide and conquer: merge lists in pairs, then pairs of pairs, again O(N log k), and it reuses the simple two-list merge. Repeatedly merging into one accumulated list is O(N k) and should be avoided.',
      follow: [
        ['What breaks if you push `(node.val, node)` and values tie?', 'Python then compares the `Node` objects and raises `TypeError`. Use `(node.val, i, node)` with a unique counter, or define `__lt__`.'],
        ['What if the lists are on different machines?', 'This is the merge phase of an external sort: each source streams its head, you keep a small heap, and you write results out in order. Memory stays O(k) regardless of list size.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Check whether a linked list is a palindrome in O(1) extra space.',
      a: 'Find the middle with fast and slow, reverse the second half in place, walk the first half and the reversed half together comparing values, and then (if the caller expects the list unchanged) reverse the second half again to restore it. O(n) time, O(1) space. Mention the trade-off: it mutates the list temporarily, which is unsafe if other threads read it. If mutation is not allowed, copy the values into an array and compare it with its reverse, O(n) space.',
      follow: [
        ['Where exactly does the middle land for odd lengths?', 'With the usual loop slow is the exact middle; skip it (compare from `slow.next` reversed) or include it, since it compares equal to itself.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Copy a linked list where each node also has a `random` pointer to any node (or None). Do it in O(1) extra space.',
      a: 'Three passes. One: for each original node create a copy and insert it directly after the original (A, A\', B, B\', ...). Two: set each copy\'s random pointer: `copy.random = orig.random.next if orig.random else None`, which works because the copy of any node sits right after it. Three: split the interleaved list back into the original and the copy by restoring `next` pointers. O(n) time, O(1) extra space beyond the new nodes. The simpler solution uses a dict from old node to new node, two passes, O(n) space; I would write that first and offer the interleaving trick as the space optimisation.',
      follow: [
        ['What can go wrong when splitting?', 'Forgetting to terminate the copy list with `None`, and corrupting the original if you restore `orig.next` after already advancing. Walk with explicit saved references.'],
        ['How do you test it?', 'Check that no copy node is also reachable from the original, that the structure (including random pointers) matches by position, and that mutating the copy leaves the original unchanged. Include a node whose random points to itself and one with None.'],
      ],
    },
  ],
};
