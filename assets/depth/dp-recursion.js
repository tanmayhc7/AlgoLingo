/* Interview depth: From recursion to memoisation. */
window.DEPTH = {
  thesis:
    'Dynamic programming is recursion with memory. It applies when a problem has overlapping subproblems (the same smaller question is asked many times) and optimal substructure (the best answer is assembled from best answers to smaller questions). The interview skill is not remembering famous recurrences; it is defining the state precisely, writing the recurrence, and then choosing top-down caching or a bottom-up table.',
  why: [
    ['Exponential becomes polynomial', 'Naive fib makes about 1.6^n calls; with a cache it makes n distinct computations. The work equals the number of distinct states times the cost per state.'],
    ['The state is the design', 'A state must contain every variable that affects the answer for the rest of the problem, and nothing more. Too little and the cache returns wrong answers; too much and the table explodes.'],
    ['Top-down is the quick route', 'Write the plain recursion first, add a cache, and you have a correct solution in minutes. Convert to bottom-up only if recursion depth or speed demands it.'],
    ['Recognise it by the question', '"Count the ways", "minimum cost", "is it possible", "longest/shortest" with choices at each step are typical DP smells, especially when greedy fails on a counterexample.'],
  ],
  edges: [
    ['Cache key must be complete', 'If the answer depends on (i, j) and you cache by i alone, results from different j collide silently.'],
    ['Recursion depth', 'Top-down recursion over n = 100,000 states overflows the Python stack. Switch to bottom-up, or iterate in dependency order.'],
    ['Unhashable arguments', '`functools.cache` needs hashable arguments. Convert lists to tuples, or use indices as the state.'],
    ['Cache shared between tests', 'A module-level cache or `lru_cache` persists across calls; if the function depends on global data, it returns stale answers. Clear it, or pass data through the state.'],
    ['Overflow in C', 'fib(93) overflows a signed 64-bit integer. Counting problems often need modulo arithmetic; apply the modulus at every addition.'],
  ],
  cost: [
    ['naive fib', 'O(2^n) time (about 1.618^n), O(n) stack.'],
    ['memoised fib', 'O(n) time, O(n) cache plus O(n) stack.'],
    ['general rule', 'Time = (number of distinct states) x (work per state). Space = states stored.'],
    ['bottom-up with a rolling window', 'Same time, space reduced to the width of the dependency window.'],
  ],
  internals: [
    ['`functools.cache` is a dict wrapper', 'It keys on the argument tuple, so each call costs a hash. For tight inner loops a manual list or array table is faster. The C implementation avoids the Python-level wrapper, but recursion still has call overhead.'],
    ['Top-down versus bottom-up', 'Top-down computes only the states reachable from the question and handles awkward dependency orders for free; bottom-up has no recursion overhead, makes space optimisation easy, and avoids stack limits. Equivalent in complexity for dense state spaces.'],
    ['Why the recursion tree collapses', 'Memoisation turns the call tree into a DAG: each distinct state is one node, evaluated once. The edges are the cache lookups. Time is the number of nodes plus edges.'],
    ['Optimal substructure is not automatic', 'The longest simple path in a graph does not have it, because the best path to a vertex may use vertices the rest of the path needs. Check that sub-answers are independent.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What makes a problem suitable for dynamic programming, and how do you approach one?',
      a: 'Two properties: overlapping subproblems (the recursion revisits the same states) and optimal substructure (an optimal answer is built from optimal answers to subproblems). My approach: (1) write the brute-force recursion, (2) identify the state, meaning the parameters that change, (3) check for repeated states, (4) add a cache for top-down, or order the states and fill a table for bottom-up, (5) state complexity as states times work per state, (6) look for space reduction.',
      follow: [
        ['How do you tell DP from greedy?', 'Try to find a counterexample to the greedy choice. Coin change with coins 1, 3, 4 and amount 6 breaks "largest first". If a local choice can be proven safe (exchange argument), greedy suffices and is simpler.'],
        ['What if there are no overlapping subproblems?', 'Then it is plain divide and conquer (merge sort): caching would not help.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is naive recursive Fibonacci slow, and how do you fix it?',
      a: 'Every call spawns two more, and the same arguments reappear in many branches, so the call count satisfies T(n) = T(n-1) + T(n-2) + 1, which grows like 1.618^n. Memoise: store fib(k) the first time it is computed, so each of the n values is computed once: O(n) time and O(n) space. Or go bottom-up with two variables for O(n) time and O(1) space. A closed form via matrix exponentiation computes it in O(log n) multiplications.',
      follow: [
        ['Which is better, top-down or bottom-up?', 'Same complexity. Bottom-up has no recursion limit and allows O(1) space here. Top-down is quicker to write and computes only reachable states.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'How do you define the state for a DP problem, and what goes wrong when you get it wrong?',
      a: 'The state must capture everything about the choices made so far that affects the future, and nothing else. For house robber the state is the index (whether the previous house was robbed is encoded by transition rules). For stock trading with at most k transactions it is (day, transactions used, holding or not). If a variable that influences the future is missing from the state, two histories that need different continuations share one cache entry and the answer is wrong. If an irrelevant variable is included, the table is larger than necessary (exponentially so in the worst case). I test a candidate state by asking: "if I know only these values, can I finish optimally without knowing how I got here?"',
      follow: [
        ['Example of too much state?', 'Passing the whole list of chosen items as a parameter instead of an index and a running total: unique states grow combinatorially.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'A recursive DP works for n = 1000 but crashes with RecursionError at n = 100000. Options?',
      a: 'Convert to bottom-up so there is no recursion: determine a dependency order (usually increasing index) and fill a table. If the structure is awkward, simulate recursion with an explicit stack of states, or process states in an order obtained by topological sorting the dependency graph. Raising `sys.setrecursionlimit` and running in a thread with a larger stack is a stopgap that risks segfaults. Bottom-up also lets me keep only the needed window of the table to reduce memory.',
      follow: [],
    },
    {
      lvl: 'staff',
      q: 'A DP over 10^9 states is too big to table. What are your options?',
      a: 'First ask whether all states are reachable: top-down with memoisation visits only reachable ones, and sparse dicts can beat dense arrays. Then reduce: find a smaller state (dominance and pruning, monotonicity), or a better dimension order and rolling arrays. If the recurrence has structure, speed it up: convex hull trick or Knuth optimisation for certain cost forms, divide-and-conquer optimisation, monotone queue for sliding-window minimum, or matrix exponentiation for linear recurrences. Meet-in-the-middle halves exponent size for subset problems. If the answer need not be exact, use approximation (FPTAS for knapsack). In a real system I would also question the formulation: maybe a heuristic or an integer programming solver is more appropriate than an exact DP.',
      follow: [
        ['How does matrix exponentiation help?', 'A linear recurrence of order k is a k x k matrix power, computed in O(k^3 log n), so a problem with n = 10^18 becomes feasible.'],
      ],
    },
  ],
};
