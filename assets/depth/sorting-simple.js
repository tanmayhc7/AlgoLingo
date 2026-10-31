/* Interview depth: simple sorts. */
window.DEPTH = {
  thesis:
    'The O(n^2) sorts are about trade-offs more than code. Interviewers ask which sort minimises swaps, which is stable, which is adaptive to nearly sorted data, and why the standard library does not use them for large inputs. Being able to state these properties precisely, and to justify them from the algorithm, is the whole question.',
  why: [
    ['They expose the vocabulary', 'Stable, in-place, adaptive, comparison count versus swap count: every later sorting discussion uses these terms.'],
    ['Insertion sort lives inside fast sorts', 'Timsort and introsort switch to insertion sort for short ranges because the constant factor is tiny.'],
    ['Cost models differ', 'If writes are expensive (flash memory, large records) selection sort\'s O(n) swaps matter; if comparisons are expensive, insertion on nearly sorted data wins.'],
    ['Small tasks come up', 'Maintaining a sorted list of a few items, or inserting one new item into sorted data, is insertion sort in practice.'],
  ],
  edges: [
    ['Stability', 'Bubble and insertion sort are stable (equal items keep their order) if you compare strictly with > ; selection sort is not stable because the long-distance swap can reorder equals.'],
    ['Off-by-one in the inner loop', 'Bubble sort inner bound is end (comparing j and j + 1); insertion sort must check j >= 0 before reading a[j].'],
    ['Early exit', 'Without a swapped flag bubble sort always does n(n-1)/2 comparisons.'],
    ['Empty and one-element input', 'All three should do nothing; check the loop ranges handle n = 0 and n = 1.'],
    ['Duplicates', 'Use strict comparisons so equal values are never swapped needlessly.'],
  ],
  cost: [
    ['bubble sort', 'O(n^2) comparisons and swaps worst and average; O(n) best with the early-exit flag. O(1) space.'],
    ['selection sort', 'Always n(n-1)/2 comparisons, at most n - 1 swaps. O(1) space. Not stable.'],
    ['insertion sort', 'O(n^2) worst, O(n) best (sorted), about n^2/4 average. O(1) space. Stable and adaptive.'],
    ['standard sort for comparison', 'O(n log n) worst case for merge/heap, expected for quick; Timsort is O(n) on sorted input.'],
  ],
  internals: [
    ['Inversions', 'An inversion is a pair out of order. Insertion sort does one swap per inversion, so its running time is O(n + inversions). Reverse-sorted input has n(n-1)/2 inversions.'],
    ['Lower bound', 'Any comparison sort needs Omega(n log n) comparisons in the worst case, because there are n! orderings and each comparison halves the possibilities at best.'],
    ['Binary insertion', 'Finding the insertion point with binary search cuts comparisons to O(n log n) but shifting still costs O(n^2) moves.'],
    ['Hybrid sorts', 'Introsort: quicksort, falling back to heapsort at depth limits and insertion sort below about 16 elements. Timsort: merge runs, using insertion sort to extend short runs.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Compare bubble, selection and insertion sort. Which would you pick for a nearly sorted array, and why?',
      a: 'Insertion sort. Its cost is O(n + inversions), so a nearly sorted array with few inversions costs close to O(n). Bubble sort with an early-exit flag is also O(n) on sorted input but still moves values one step at a time and does more swaps. Selection sort ignores the input order and always makes n(n-1)/2 comparisons.',
      follow: [
        ['Which minimises writes?', 'Selection sort: at most n - 1 swaps.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What does it mean for a sort to be stable, and why does it matter?',
      a: 'A stable sort keeps equal keys in their original relative order. It matters when you sort records by several keys in turn (sort by name, then stably by department gives department groups ordered by name) and for predictable output. Insertion and bubble sort are stable; selection sort and heapsort are not; merge sort and Timsort are.',
      follow: [
        ['How would you make selection sort stable?', 'Instead of swapping, shift the elements between i and the minimum one place right and put the minimum at i. That costs more moves.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Why does Python\'s sorted() not use quicksort, and where do the simple sorts appear in it?',
      a: 'Timsort is stable, has O(n log n) worst case, and exploits existing order: it detects natural runs and merges them, so partly sorted data is fast (O(n) if already sorted). For short runs (below about 32-64 items) it uses binary insertion sort, because for small n the low overhead beats the asymptotically better algorithms. Quicksort is not stable and has an O(n^2) worst case unless hardened.',
      follow: [
        ['What is the worst-case space of Timsort?', 'O(n) for the merge buffer (about n/2 in practice).'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Prove that comparison-based sorting needs Omega(n log n) comparisons.',
      a: 'Model the algorithm as a binary decision tree: each internal node is a comparison, each leaf is an ordering. To be correct it needs at least n! leaves, one per permutation. A binary tree with n! leaves has height at least log2(n!), which is Theta(n log n) by Stirling\'s approximation. So some input forces that many comparisons. Algorithms such as counting or radix sort beat it by not comparing keys.',
      follow: [],
    },
  ],
};
