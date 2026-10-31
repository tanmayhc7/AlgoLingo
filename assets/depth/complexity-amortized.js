/* Interview depth: Amortised cost and space. */
window.DEPTH = {
  thesis:
    'Worst-case cost per operation can be misleading when expensive operations are rare and pay for themselves. Amortised analysis bounds the total cost of a sequence of operations and divides by the number of operations: a guarantee over any sequence, not an average over random inputs. The other half of complexity is space, which includes the recursion stack and auxiliary structures, not only the answer. Interviewers expect both, and the difference between "average" and "amortised".',
  why: [
    ['It explains the structures you use daily', 'Python lists, C++ vectors, Java ArrayLists, hash table resizing, and two-stack queues all rely on amortised O(1). Knowing why prevents wrong complexity claims.'],
    ['It separates guarantee from luck', 'Average-case relies on a distribution of inputs (hash functions behaving randomly). Amortised is a worst-case guarantee over any sequence of operations.'],
    ['Space is a real constraint', 'Memory limits, cache footprints and stack depth cause failures that time analysis does not predict. O(n) extra memory on a billion items is a design problem.'],
    ['Space-time trade-offs are the design space', 'Memoisation trades memory for time; streaming and rolling arrays trade code complexity for memory.'],
  ],
  edges: [
    ['Amortised does not bound a single operation', 'One append can be O(n). In latency-sensitive code (real-time, tail latency), a rare long pause matters even if the total is fine.'],
    ['Growth factor', 'Doubling copies at most 2n items over n appends. A fixed increment (+c) gives O(n^2). Python grows lists by about 1.125x, a smaller factor that wastes less memory at slightly more copying but still O(1) amortised.'],
    ['Shrinking arrays', 'If you halve capacity when the array is half full, alternating push and pop at the boundary thrashes. Shrink when it falls to a quarter full.'],
    ['Recursion space', 'Depth counts: O(n) for a skewed tree DFS, O(log n) balanced, O(n) for naive recursive sum. Tail-call elimination does not exist in CPython.'],
    ['Auxiliary versus total space', 'Say whether you count the input and the output. In-place algorithms use O(1) auxiliary space even though the input takes O(n).'],
  ],
  cost: [
    ['dynamic array append', 'O(1) amortised, O(n) worst case for a single call.'],
    ['hash table insert', 'O(1) amortised (resize doubles), O(1) average lookup, O(n) worst case under collisions.'],
    ['two-stack queue dequeue', 'O(1) amortised, O(n) worst case when the outbox is refilled.'],
    ['recursion depth', 'DFS on a tree: O(height). Merge sort: O(log n) stack plus O(n) buffer.'],
    ['in-place sorting', 'Heapsort O(1) auxiliary; quicksort O(log n) stack on average.'],
  ],
  internals: [
    ['Three ways to prove amortised bounds', 'Aggregate: total cost of n operations divided by n. Accounting: charge each operation a fixed amount and keep credit for future expensive steps. Potential: define a potential function (the number of used slots beyond half capacity) whose change pays for the expensive operations.'],
    ['Accounting argument for doubling', 'Charge each append 3 units: 1 to write it, 2 saved on the item. When the array of size k doubles, the k/2 items added since the last doubling carry 2 credits each, which pay for copying all k items. Every operation costs O(1).'],
    ['CPython list over-allocation', 'The list resizes to roughly newsize + (newsize >> 3) + 6, about 12.5% extra, rounded to a multiple of 4. It is still geometric growth, so appends are amortised O(1) with less wasted memory than doubling.'],
    ['Stack frames', 'A CPython frame is a heap object, so recursion depth is limited by `sys.getrecursionlimit()` (default about 1000), not by the machine stack. C frames use the real stack, typically 8 MB on Linux, which overflows silently into a segmentation fault.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Why is appending to a Python list O(1) amortised, even though resizing copies the whole list?',
      a: 'The list over-allocates capacity geometrically, so a resize happens only after a number of appends proportional to the current size. Over n appends the total number of copied elements is a geometric series, 1 + 2 + 4 + ... < 2n (with doubling; with CPython\'s 1.125x factor the constant is larger but still linear). So n appends cost O(n) in total, O(1) each on average over the sequence. A single append can still cost O(n), which is why the claim is "amortised" and not "worst case".',
      follow: [
        ['What if the array grew by a constant 10 each time?', 'There would be about n/10 resizes each copying up to n items: O(n^2) total, so O(n) amortised per append. Geometric growth is essential.'],
        ['How is amortised different from average case?', 'Average case assumes a probability distribution over inputs. Amortised is a guarantee for any sequence of operations.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What is the space complexity of recursive DFS on a graph with V vertices?',
      a: 'The recursion depth can reach V (a path), so the call stack uses O(V), plus O(V) for the visited set. The graph itself takes O(V + E) but is part of the input. On a balanced binary tree the stack is only O(log n). For a deep graph in Python the recursion limit is the practical problem, so an iterative version with an explicit stack is safer; its space is also O(V) but lives on the heap and is not capped by the recursion limit.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Prove that a queue built from two stacks has O(1) amortised dequeue.',
      a: 'Elements are pushed onto `inbox`. A dequeue pops from `outbox`; if it is empty, all elements are moved from `inbox` to `outbox`. Each element is pushed to inbox once, moved once, and popped from outbox once, so it participates in at most three O(1) operations over its lifetime. Therefore any sequence of n operations does at most 3n elementary steps, giving O(1) amortised per operation. With the accounting method: charge each enqueue 2 units (one for the push, one saved for the future move) and each dequeue 1. The credit is always sufficient to pay for the moves.',
      follow: [
        ['Is the worst case also O(1)?', 'No: one dequeue can move the whole inbox, O(n). Real-time queues use more elaborate structures for worst-case O(1).'],
      ],
    },
    {
      lvl: 'senior',
      q: 'A hash map doubles when its load factor passes 0.75. Analyse insert complexity and discuss the worst case.',
      a: 'Resizing allocates a table twice the size and rehashes every entry: O(n) for that insert. Doubling means the number of rehashed entries over n inserts is at most about n + n/2 + n/4 + ... < 2n, so inserts are O(1) amortised. Lookups are O(1) on average assuming a good hash function and a low load factor, but O(n) in the worst case when many keys collide (adversarial input, or poor hashing). Mitigations: randomised hash seeds (Python salts string hashes), treeifying long chains (Java 8), or open addressing with good probing. For latency-critical systems the resize pause matters, so incremental rehashing (Redis) moves a few buckets per operation to flatten the spike.',
      follow: [],
    },
    {
      lvl: 'staff',
      q: 'You are asked to reduce memory on a service that holds 500 million records in memory. What do you try?',
      a: 'Measure first (tracemalloc, heap profiles) to find the dominant allocations; Python objects carry large overheads (a small int object is 28 bytes, a list header 56, a dict much more). Then reduce per-record cost: store columns in arrays (`array`, NumPy, Arrow) instead of lists of objects, use `__slots__` or tuples, intern repeated strings, replace dictionaries with sorted arrays plus binary search, and encode small values compactly. Use probabilistic structures (Bloom filters, count-min sketch, HyperLogLog) when exactness is not needed. Move cold data to disk or memory-mapped files with an index, or shard across machines. Always state the trade-off: each saving usually costs CPU, complexity or accuracy, so decide using the latency and correctness requirements.',
      follow: [
        ['Why are arrays of structs smaller than lists of objects?', 'No per-object header, no pointers, no alignment padding per item, and contiguous memory with better cache behaviour.'],
      ],
    },
  ],
};
