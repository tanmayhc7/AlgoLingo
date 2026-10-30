/* Interview depth: Python survival kit. */
window.DEPTH = {
  thesis:
    'The survival kit is the set of idioms you should be able to write without thinking in an interview: reading input, building grids and counters, iterating with `enumerate` and `zip`, sorting with keys, using `heapq`, `deque`, `bisect` and `Counter`, and avoiding the dozen classic Python traps. Fluency here frees your attention for the algorithm.',
  why: [
    ['Fluency is a signal', 'Writing `for i, x in enumerate(xs)` or `Counter(s)` without hesitation tells the interviewer you have solved many problems. Fumbling with syntax burns time and attention you need for reasoning.'],
    ['Traps are asked on purpose', 'Mutable default arguments, `[[0]*n]*m`, late-binding closures, modifying while iterating and `is` versus `==` are common probing questions. Know the cause, not just the fix.'],
    ['Know the standard library boundaries', 'Interviews usually allow `collections`, `heapq`, `bisect`, `itertools` and `functools`. Ask if unsure, and be ready to implement the underlying structure by hand if asked.'],
    ['Complexity of built-ins is part of your solution', '`s += c` in a loop, `list.insert(0, x)`, `x in list`, slicing in recursion: each silently turns O(n) into O(n^2). Cost awareness is a senior expectation.'],
  ],
  edges: [
    ['Mutable default argument', '`def f(x, acc=[])` shares one list across calls. Use `None` and create inside.'],
    ['Late-binding closures', '`[lambda: i for i in range(3)]` all return 2. Bind with a default argument `lambda i=i: i`.'],
    ['`is` versus `==`', '`is` tests identity; use it for `None`, not for numbers or strings. Small-int and string interning make `is` appear to work and then fail.'],
    ['Integer division and modulo', '`//` floors toward negative infinity: `-7 // 2 == -4`; `%` result takes the sign of the divisor. Differs from C. Use `int(a / b)` or `math.trunc` for truncation, with float caveats.'],
    ['Recursion limit', 'Default about 1000 frames. Deep recursion (DFS on 10^5 nodes) raises `RecursionError`; convert to an explicit stack or raise the limit with `sys.setrecursionlimit` (and a thread with bigger stack if needed).'],
    ['String immutability', 'No item assignment. Build a list of characters and `"".join`.'],
    ['Slicing copies', 'Passing `xs[1:]` in recursion costs O(n) per call. Pass indices instead.'],
    ['Infinity', '`float("inf")` for min/max initialisation; `math.inf`. Do not use `sys.maxsize` as infinity when sums may exceed it.'],
    ['Reading input fast', '`sys.stdin.readline` or `sys.stdin.read().split()` is much faster than `input()` for large inputs.'],
    ['Copying nested structures', '`copy.deepcopy` for nested lists; `[row[:] for row in grid]` is faster for 2-D grids of immutables.'],
    ['Sort stability and keys', 'Sort by `(−score, name)` for descending/ascending combos.'],
    ['`range` and large loops', '`range(n)` is lazy and O(1) memory; `list(range(n))` allocates. `range(len(xs) - 1, -1, -1)` iterates backwards, or use `reversed`.'],
  ],
  cost: [
    ['str += c in a loop', 'O(n^2) worst case', 'Use a list and join. CPython sometimes optimises in-place, never rely on it.'],
    ['x in list', 'O(n)', 'Use a set for repeated tests.'],
    ['list.insert(0, x)', 'O(n)', 'Use deque.'],
    ['xs[a:b] in a loop', 'O(k) per slice', 'Pass indices.'],
    ['"".join(parts)', 'O(total)', 'Single allocation.'],
    ['sorted(xs, key=f)', 'O(n log n) + n calls to f', ''],
    ['max(xs), min(xs), sum(xs)', 'O(n)', 'C speed.'],
    ['len(...)', 'O(1)', 'For built-in containers.'],
    ['any / all', 'O(n) worst case', 'Short-circuit on first decisive item.'],
    ['zip / enumerate / map', 'O(1) per step', 'Lazy iterators.'],
  ],
  internals: [
    ['Why built-ins are faster', 'They run in C, avoiding bytecode dispatch and boxed-integer churn per iteration. `sum(xs)` can be an order of magnitude faster than a Python loop; comprehensions are faster than the equivalent `append` loop.'],
    ['Name lookups and locals', 'Local variables are array slots; globals and attributes are dict lookups. Binding a hot function to a local (`push = heap.append`) can speed tight loops, a micro-optimisation to mention, not to lead with.'],
    ['Generators and memory', 'Generator expressions stream values with O(1) memory, ideal for `sum(x*x for x in xs)` or `any(...)`. Use a list comprehension when you need to reuse or index the results.'],
    ['`functools.lru_cache`', 'Memoises on hashable arguments with a dict plus a linked list; `@cache` (3.9+) is unbounded. Great for top-down DP, but recursion depth and mutable arguments (unhashable) are limits.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What is wrong with `def add(x, acc=[]): acc.append(x); return acc`?',
      a: 'The default list is created once at function definition and shared by every call that omits `acc`, so results accumulate across calls. Fix: `def add(x, acc=None): acc = [] if acc is None else acc ...`. The same applies to dict and set defaults. Immutable defaults are safe.',
      follow: [
        ['When is a shared default useful?', 'Rarely, as an intentional cache or memo; if so, make it explicit (a module-level dict or `lru_cache`) so readers do not mistake it for a bug.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Create a 2-D grid of zeros and explain the common mistake.',
      a: '`grid = [[0] * cols for _ in range(rows)]`. The mistake `[[0] * cols] * rows` repeats a reference to one row, so changing one cell changes the whole column. The inner `[0] * cols` is fine because ints are immutable.',
      follow: [
        ['How do you copy a grid?', '`[row[:] for row in grid]` (or `copy.deepcopy`). `grid[:]` copies only the outer list.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Your recursive DFS passes tests locally but crashes on a large input. Why and how do you fix it?',
      a: 'CPython\'s default recursion limit is about 1000 and each frame uses stack memory, so a deep recursion raises `RecursionError` (or in extreme cases crashes the interpreter). Fixes: convert to iteration with an explicit stack (preserving visit order carefully for post-order), increase the limit with `sys.setrecursionlimit` and run in a thread with a larger stack size, or restructure the algorithm (BFS, or union-find). Mention that in C the same issue is a stack overflow with undefined consequences.',
      follow: [
        ['How do you convert recursive post-order DFS to iterative?', 'Push `(node, visited_flag)`; on first pop push the node again as visited followed by its children; on the second pop process it. Or use two stacks / reverse a pre-order of the mirrored traversal.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain `lru_cache` and when it breaks.',
      a: '`functools.lru_cache(maxsize)` wraps a function and stores results keyed by the arguments (which must be hashable), evicting least recently used entries when full. It turns exponential recursion like Fibonacci or grid paths into polynomial time. Breaks when: arguments are unhashable (lists), the function has side effects or depends on external state, the key space is huge (memory), the recursion is deeper than the limit, or results are mutable and callers modify the shared cached object.',
      follow: [
        ['How do you clear it between test cases?', '`func.cache_clear()`. Forgetting it in multi-test runs can leak state or memory.'],
        ['Top-down versus bottom-up DP?', 'Top-down is easier to write and computes only reachable states but pays recursion and cache overhead; bottom-up is iterative, avoids recursion limits and allows space optimisation to a rolling array.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'How would you make a pure-Python solution fast enough when it is just over the time limit?',
      a: 'Profile first; fix the algorithmic complexity before micro-optimising. Then: use built-ins and comprehensions over loops, bind hot attributes to locals, avoid repeated slicing and string concatenation, read input in bulk, use `array` or NumPy for numeric work, use `heapq`, `deque` and `bisect` rather than hand-written structures, memoise with `lru_cache`, and avoid recursion in hot paths. If still short, say what you would do in production: move the hot loop to C via Cython, `numba`, or a native extension, or choose a different language for that component.',
      follow: [
        ['What is the first thing you measure?', 'Where the time goes: `cProfile` for functions, `timeit` for snippets, and a quick look at the input size growth to confirm the complexity class.'],
      ],
    },
  ],
};
