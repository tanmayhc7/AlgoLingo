/* Interview depth: Counting steps and growth rates. */
window.DEPTH = {
  thesis:
    'Complexity analysis is how you decide, before writing code, whether an approach can possibly meet the constraints. The method is mechanical: count how many times the innermost statement runs as a function of the input size, keep the dominant term, drop constants. The judgment is in spotting hidden costs (a slice, a membership test, a string concatenation) and in matching the growth rate to the limits in the problem.',
  why: [
    ['Constraints tell you the target', 'About 10^8 simple operations fit in a second. n = 10^5 allows O(n log n); n = 5000 allows O(n^2); n = 20 allows O(2^n) or O(n!) with pruning. Reading the limits first often reveals the intended solution.'],
    ['Growth rate beats constant factors', 'A well-written O(n^2) loses to a sloppy O(n log n) once n is large. Optimise the asymptotic class first and micro-optimise last.'],
    ['It makes comparisons precise', 'Saying "this is O(n) instead of O(n^2)" or "O(log n) per query" is a claim another engineer can check, unlike "it feels faster".'],
    ['Interviewers always ask', 'After every solution: time, space, can you do better, what is the worst case. A crisp, correct answer with its derivation is part of the grade.'],
  ],
  edges: [
    ['Hidden linear operations', '`x in list`, `list.index`, `list.remove`, `list.insert(0, x)`, `s[i:j]`, `str + str` in a loop, `sum(list)` are all O(n) calls. Inside a loop they make the whole thing quadratic.'],
    ['Two inputs, two variables', 'Looping over words of length L is O(n x L), not O(n). Name the variables for each input: O(m x n), O(V + E).'],
    ['Best, average and worst case', 'Quicksort is O(n log n) on average and O(n^2) worst case; hash lookups are O(1) average and O(n) worst case. Say which one you mean.'],
    ['Logarithm bases', 'log2, ln and log10 differ by constant factors, so O(log n) needs no base.'],
    ['Integer inputs', 'For a number n, the input size is its bit length: an algorithm taking n steps is exponential in the input size (pseudo-polynomial), as with naive primality tests or knapsack.'],
  ],
  cost: [
    ['O(1)', 'Index, dict/set lookup (average), push/pop at the end of a list.'],
    ['O(log n)', 'Binary search, balanced tree operations, heap push/pop.'],
    ['O(n)', 'Single pass, linear scan, BFS/DFS on V + E.'],
    ['O(n log n)', 'Comparison sorts (merge sort, Timsort, heapsort), n heap operations.'],
    ['O(n^2)', 'Check every pair, simple DP tables over two sequences, insertion sort.'],
    ['O(2^n), O(n!)', 'Subsets, permutations, naive recursion without memoisation.'],
  ],
  internals: [
    ['Formal definition', 'f(n) is O(g(n)) if there are constants c and n0 such that f(n) <= c x g(n) for all n >= n0. It is an upper bound. Omega is a lower bound and Theta means both. Interviewers usually use O loosely to mean the tight bound.'],
    ['Summing nested loops', 'Loop j from 0 to i inside loop i from 0 to n gives 0 + 1 + ... + (n-1) = n(n-1)/2, which is O(n^2). A loop whose variable doubles each time (i *= 2) runs log2(n) times; a loop inside it of n steps gives O(n log n).'],
    ['Recurrences', 'Divide and conquer gives T(n) = a T(n/b) + f(n). Merge sort: 2T(n/2) + n = O(n log n). Binary search: T(n/2) + 1 = O(log n). The master theorem compares n^(log_b a) with f(n).'],
    ['Measure, do not guess', 'Time the code at n, 2n and 4n. A ratio near 2 suggests linear, near 4 quadratic, slightly above 2 n log n. `timeit` with doubling inputs verifies an analysis in minutes.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What is the time complexity of the following, and how do you derive it? `for i in range(n): for j in range(i): work()`',
      a: 'The inner loop runs i times for each i, so the total number of calls to work is 0 + 1 + 2 + ... + (n-1) = n(n-1)/2. That is (n^2 - n)/2, whose dominant term is n^2/2, so it is O(n^2): the constant 1/2 is dropped. It is quadratic even though it does roughly half the work of two full nested loops. I derive it by summing the inner-loop counts rather than multiplying the bounds, which gives the same class here but is the correct method when bounds depend on the outer variable.',
      follow: [
        ['What if the inner loop is `for j in range(1, n, j*2)`-style doubling?', 'Then the inner loop runs about log n times per outer iteration, so the total is O(n log n).'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is `result += s` in a loop over n strings sometimes a performance bug?',
      a: 'Strings are immutable, so each `+=` conceptually builds a new string, copying the old contents: the i-th concatenation copies about i characters, and n of them cost O(n^2) overall (CPython has an optimisation that often avoids this, but you should not rely on it). The standard fix is to collect pieces in a list and call `"".join(pieces)` once, which is O(total length). The same pattern applies to repeated `list = list + [x]`, which copies each time, versus `append`.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Give the complexity of building a heap from n items, and of n pushes. Why do they differ?',
      a: 'n pushes cost O(n log n) in the worst case, since each push can sift up through log n levels. `heapify` (sift down from the last internal node up to the root) costs O(n). The reason: sift-down cost depends on the height of the node, and most nodes are near the bottom with small heights. About n/2 nodes have height 0, n/4 have height 1, n/8 height 2, and so on, so the total is the sum of h x n/2^(h+1), which converges to O(n). Pushing does the opposite: most elements are inserted at the bottom and may travel the whole height.',
      follow: [
        ['Does the better build bound change heapsort\'s complexity?', 'No: the n extractions still cost O(n log n), which dominates. It reduces the constant.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Solve T(n) = 2T(n/2) + n, and T(n) = T(n/2) + 1. What are the algorithms?',
      a: 'T(n) = 2T(n/2) + n is merge sort: two half-sized problems plus linear merging. Each of the log2 n levels does n work in total (2 problems of n/2, 4 of n/4, and so on), so T(n) = O(n log n). T(n) = T(n/2) + 1 is binary search: one half-sized problem plus constant work, log2 n levels of constant work gives O(log n). By the master theorem with a = 2, b = 2, f(n) = n = Theta(n^(log_2 2)), the balanced case gives n log n; for the second, a = 1, b = 2, f = 1 = Theta(n^0), giving log n.',
      follow: [
        ['What about T(n) = 2T(n/2) + 1?', 'The leaves dominate: n^(log_2 2) = n beats f(n) = 1, so T(n) = O(n). This is the cost of a full tree traversal.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Your O(n log n) service is slow in production at n = 10^6. How do you reason about it beyond Big-O?',
      a: 'Big-O hides constants, memory behaviour and I/O. I would profile first to find where the time actually goes: allocations, cache misses (pointer chasing in a tree versus a contiguous array), lock contention, serialisation, network round trips, garbage collection. An algorithm with a worse asymptotic class can win on realistic n if it has sequential memory access, which is why a sorted array with binary search often beats a balanced tree, and a hash table with open addressing beats a linked structure. Check that the constants and growth assumptions hold (is n really 10^6, or does it spike to 10^8?). Look for repeated work that could be cached or batched, and for the tail: p99 latency often comes from rare worst cases, resizing or GC pauses that amortised analysis smooths over. Then fix the biggest measured cost and re-measure.',
      follow: [
        ['Where does amortised analysis mislead in latency-sensitive systems?', 'A rare O(n) resize or rehash is "free" on average but can blow a latency budget; incremental resizing or preallocation spreads the cost.'],
      ],
    },
  ],
};
