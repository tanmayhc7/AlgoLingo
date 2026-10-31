# DSA Visualizer: Curriculum

Who this is for: an engineer who thinks in C and is learning Python's idioms and data structures from scratch. Where C makes you build things by hand, Python hands you a built-in. Every lesson shows what the built-in does for you and what it costs underneath.

Status: Phases 1 to 6 are built (26 chapters, 65 lessons, a quiz per chapter). The Phase 1 checkboxes below are the original plan; every item is now a lesson page. Every lesson has an interview-depth section. See the phase table below for what each later phase contains.

## How every lesson is built

1. **From C**: the same idea in C and in Python, side by side.
2. **Step-through**: code with the current line highlighted, a picture of the data next to it, and one sentence of narration per step. Controls: step, back, play, speed, reset. Inputs are editable, so you can try your own array.
3. **Memory view**: a toggle between "objects and references" (how Python programmers think) and "addresses and bytes" (what a C programmer expects).
4. **API tour**: each built-in on the type, with its signature, what it does, its time complexity and a run-it button.
5. **Traps**: the classic mistakes, each reproducible in one click.
6. **Check yourself**: predict the output, then reveal the answer and the trace.

## Chapters

The site groups Phase 1 into seven chapters. The outline lives in `assets/chapters.js`, and the home page, the breadcrumbs and the previous and next links all read from it. Stage 1A is chapters 1 to 4. Stage 1B is chapters 5 and 6, with the toolbox in chapter 7.

| Chapter | Lessons |
|---|---|
| 1. Getting started | 1.1 Compiled versus interpreted, 1.2 Running Python programs, 1.3 Variables and names (built) |
| 2. Basic types | 2.1 Numbers, booleans and None, 2.2 Strings as sequences |
| 3. Control flow | 3.1 Conditions, 3.2 Loops, 3.3 Errors and tracebacks |
| 4. Functions and shorthands | 4.1 Functions, 4.2 Shorthands and idioms, 4.3 Comprehensions |
| 5. Memory and arrays | 5.1 How memory holds an array, 5.2 Lists, 5.3 Tuples |
| 6. Hashing | 6.1 Hashing, 6.2 Dicts, 6.3 Sets |
| 7. Toolbox | 7.1 Sorting and searching helpers, 7.2 collections and friends, 7.3 Choosing a container, 7.4 Patterns you will reuse, 7.5 Survival kit for coding problems |

Inside a lesson, the content is split into scenes (the tabs at the top of the page), each a small program that runs in both languages.

---

## Phase 1: Language basics, then collections and hashing

Phase 1 has two stages. Stage 1A is everything you need before collections make sense. Stage 1B is the "everything arrays" stage: lists, tuples, hashing, dicts, sets.

### Stage 1A: Language basics

- [ ] **1A.0 Compiled versus interpreted: how C and Python actually run**
  - C: source, preprocessor, compiler, assembler, linker, then one native executable that the CPU runs directly. Types are fixed at compile time, and many mistakes are caught before the program ever starts.
  - Python (CPython): source is compiled to bytecode (the `.pyc` files in `__pycache__`), then a virtual machine loop interprets that bytecode one instruction at a time. Types are checked while the program runs.
  - So Python is both compiled and interpreted. The useful question is what is compiled to what, and when.
  - What this means in practice: why Python is slower in tight loops, why a typo in a branch that never runs goes unnoticed, why one `a + b` works on ints, strings and lists, why you can run a file without a build step
  - See the bytecode yourself with the `dis` module
  - Other ways to run Python and what they change: PyPy (JIT), Cython and Numba (compile hot code), and why C extensions such as NumPy are fast
  - Tradeoffs table: speed, startup, portability, error timing, memory use, build step
  - Visual: two pipelines side by side. C goes source, machine code, CPU. Python goes source, bytecode, VM loop. Step through `x = a + b`: C is one add instruction on typed registers, Python is `LOAD_NAME`, `LOAD_NAME`, `BINARY_OP`, `STORE_NAME` with a type check at each step.
  - Traps: an error in code that has not run yet only shows up when it does. `a + b` means different things depending on the types at that moment.

- [ ] **1A.0b Running Python**
  - REPL versus scripts (`python3 file.py`), comments, indentation instead of braces, no semicolons, no `main()` required, `if __name__ == "__main__":`
  - `print` (`sep`, `end`), `input`, `help()`, `dir()`, `type()`
  - Visual: the same small program in C and Python, with the braces fading into indentation

- [ ] **1A.1 Variables and names**
  - A name is a label bound to an object, not a box that holds a value. This is the biggest shift from C.
  - Assignment binds and never copies. Rebinding versus mutating. `id()`, `is` versus `==`
  - Dynamic typing, `type()`, `isinstance()`, multiple assignment, swap with `a, b = b, a`, chained `a = b = 0`
  - Naming rules and conventions, `del`, `None`, constants by convention
  - Reference counting and garbage collection: when does an object go away. Small ints (-5 to 256) are shared, strings can be interned.
  - Visual: name tags pointing at objects. Step through `b = a` then `a += 1` and watch which tag moves.
  - Traps: `b = a` on a list shares it. `is` on numbers and strings.

- [ ] **1A.2 Numbers, booleans, None**
  - `int` has no overflow (arbitrary precision). `float` is IEEE 754. `bool` is a kind of int.
  - Operators: `/` is always float, `//` floors (negatives differ from C's truncation), `%` takes the divisor's sign, `**`, `divmod`, bitwise operators
  - No `++` or `--`. Use `+=`.
  - Chained comparisons (`1 < x < 5`). `and`, `or`, `not` return operands and short-circuit.
  - Truthiness: what counts as False (`0`, `""`, `[]`, `{}`, `None`, ...)
  - Conversions: `int()`, `float()`, `str()`, `bool()`, `round()` (banker's rounding), `float('inf')`
  - Visual: number line showing `//` and `%` on negatives next to what C gives. A big int growing in memory.
  - Traps: `-7 // 2`, `0.1 + 0.2`, `round(2.5)`, float equality

- [ ] **1A.3 Strings as sequences**
  - No char type. Indexing, negative indexing, slicing `s[a:b:c]`, immutability
  - Methods: `split`, `join`, `strip`, `replace`, `find`, `index`, `count`, `startswith`, `endswith`, `upper`, `lower`, `isdigit`, `isalpha`, `zfill`
  - f-strings and format specs, escapes, raw strings, triple quotes
  - `ord` and `chr`, `str` versus `bytes`, Unicode in one page
  - `in` for substrings, comparing strings, iterating characters
  - Visual: a slicing ruler with indices on the boundaries. "Modifying" a string creates a new object.
  - Traps: `s[0] = 'x'`. `+=` in a loop is O(n²), so use `"".join`.

- [ ] **1A.4 Conditions**
  - `if` / `elif` / `else`, ternary `a if cond else b`, `match` (3.10+), `pass`
  - Idiomatic checks: `if not items:`, `is None`, `in`
  - Visual: flowchart that lights up the branch taken

- [ ] **1A.5 Loops**
  - `for` loops over things, not indices. What `for (i = 0; i < n; i++)` becomes.
  - `range(start, stop, step)`: lazy, exclusive stop, counting down, off-by-one cases
  - `while`, `while True` with `break`, `continue`, `for ... else`, nested loops
  - `enumerate`, `zip` (and what happens with unequal lengths), `reversed`, `sorted`
  - What `for` does behind the scenes: iterable, iterator, `next()`, `StopIteration`
  - The loop variable stays alive after the loop. Changing a list while looping over it.
  - Visual: a pointer walking a list with the loop variable shown. `range` as a ticket machine that stores nothing. Step-through of the iterator protocol.
  - Traps: `range(n)` stops at n-1, mutating while iterating

- [ ] **1A.6 Functions (essentials)**
  - `def`, parameters, `return`, returning several values (it is a tuple), no `return` means `None`
  - Default arguments and the mutable-default trap, keyword arguments, `*args`, `**kwargs`
  - Pass by object reference: why changing a list inside a function changes the caller's list but rebinding does not. Compare with C values and pointers.
  - Scope (local, enclosing, global, built-in), `global`, `nonlocal`
  - `lambda` and passing functions around (`key=`)
  - Recursion: the call stack, base case, recursion limit
  - Type hints (`list[int]`, `Optional`), docstrings
  - The `class Solution` and `self` shape used by LeetCode, kept minimal. Full classes come in Phase 2.
  - Visual: call stack growing and shrinking. A reference arrow from the function's parameter into the caller's list.

- [ ] **1A.7 Shorthands and idioms**
  Each one shown next to its long-hand version, with the same trace.
  - Augmented assignment, chained comparison, ternary, walrus `:=`
  - Unpacking: swap, `first, *rest = xs`, `_` for throwaways, `for k, v in d.items()`
  - `any`, `all`, `sum`, `min`, `max` (with `key=`), `sorted`, `abs`, `divmod`
  - `enumerate(xs, start=1)`, `zip(a, b)`, `zip(*matrix)`
  - `x or default`, `if not xs`
  - Slicing tricks: `xs[::-1]`, `xs[:k]`, `xs[-k:]`, `xs[:]`
  - `map` and `filter`, and why comprehensions usually read better
  - Ask forgiveness versus ask permission: `try/except` versus checking first

- [ ] **1A.8 Comprehensions**
  - A list comprehension is a loop written inside out: `[expr for x in xs if cond]`, and how to read it
  - `if` at the end filters. `if/else` at the front is a ternary. They sit in different places.
  - Several `for` clauses in one comprehension, nested comprehensions (matrix, flatten), and the order of the `for`s
  - Dict and set comprehensions, generator expressions (`sum(x*x for x in xs)`)
  - When not to use one: side effects, long conditions
  - Memory: an eager list versus a lazy generator
  - Visual: the signature lesson. Left side is a plain C-style loop, right side is the comprehension. Hover a piece of one to highlight its counterpart in the other, and step both in lockstep.

- [ ] **1A.9 Errors and reading tracebacks**
  - `try` / `except` / `else` / `finally`, `raise`, `assert`
  - The errors you will actually hit: `IndexError`, `KeyError`, `TypeError`, `ValueError`, `ZeroDivisionError`, `AttributeError`, `NameError`, `IndentationError`, `RecursionError`, `StopIteration`
  - Reading a traceback from the bottom up
  - Visual: "break it, read the error, fix it" mini-puzzles built from the mistakes people really make (for example `d[0]` on a dict, or assigning to `a[i]` on an empty list)

- [ ] **1A.10 Python survival kit for coding problems**
  - `class Solution` signatures, type hints, reading input with `input()` and `sys.stdin`
  - `float('inf')`, integer division on negatives, no overflow
  - The imports you keep reaching for: `collections`, `heapq`, `bisect`, `itertools`, `functools`, `math`
  - Hidden costs: `x in list`, slicing copies, string `+=`, `list.pop(0)`

### Stage 1B: Collections and hashing

- [ ] **1B.1 How memory holds an array**
  - C: contiguous, same-size elements, address = base + i × size, fixed length, no bounds check
  - Python list: a contiguous array of pointers to objects. That is why it can hold mixed types, and why every element lives somewhere else in memory.
  - Over-allocation and amortized O(1) `append`, `sys.getsizeof`
  - What is inside one `int` object: header, reference count, type pointer, value
  - `array.array`, `bytes`, `bytearray` and NumPy as the "real C array" options. Cache locality and why Python is slower for number crunching.
  - Visual: a memory strip with addresses. A C `int[5]` next to a Python list of arrows. `append` triggering a resize and copy.

- [ ] **1B.2 Lists**
  - Creating, indexing, negative indexes, slicing (a slice is a copy), extended slices
  - Methods: `append`, `extend`, `insert`, `pop`, `remove`, `index`, `count`, `sort`, `reverse`, `copy`, `clear`, and `del xs[i]`
  - Operators: `+`, `*`, `in` (O(n)), `==` (compares element by element), `+=` versus `+`
  - Why `insert(0, x)` and `pop(0)` are O(n): the shifting animation
  - Aliasing (`b = a`), shallow versus deep copy (`copy.deepcopy`)
  - 2D lists and the `[[0] * n] * m` trap, transposing with `zip(*m)`
  - Lists as stacks. Why not as queues (see `deque`).
  - `sort()` returns `None`, so `xs = xs.sort()` wipes the list
  - Visual: insert and delete as elements sliding; two names pointing at one list; the 2D-list trap drawn as rows that are all one object

- [ ] **1B.3 Tuples**
  - Creating (the one-element `(1,)` trap), packing and unpacking, tuples as return values
  - Immutable, hashable if their contents are hashable, so they work as dict keys and set members
  - Tuple comparison, `count`, `index`, `namedtuple`
  - Immutable container holding a mutable item: what is and is not frozen
  - Memory: a fixed pointer array with no over-allocation. When to choose a tuple over a list.
  - Visual: list and tuple side by side, trying to change each

- [ ] **1B.4 Hashing**
  - What a hash function is. `hash()` in Python and what it returns for ints, strings, tuples.
  - Building a hash table by hand: buckets, collisions, chaining versus open addressing (CPython uses open addressing with probing), load factor, resizing
  - Why lookup is O(1) on average and O(n) in the worst case
  - Hashable versus unhashable: the `__hash__` and `__eq__` contract, why lists and dicts cannot be keys
  - String hash randomization (`PYTHONHASHSEED`)
  - Visual: type keys in and watch each one hash to a slot, collide, probe to the next slot, and trigger a resize. This is the foundation for dicts and sets.

- [ ] **1B.5 Dicts**
  - Syntax: literals, `dict()`, `dict(zip(k, v))`, `dict.fromkeys`, comprehensions
  - Access and update: `d[k]`, `get`, `setdefault`, `update`, `|` merge, `pop`, `popitem`, `del`, `in`
  - Views: `keys()`, `values()`, `items()`, live views, iterating
  - Why insertion order is kept: the compact layout of a sparse index array pointing into a dense entries array
  - Changing the size while iterating raises `RuntimeError`
  - Sorting a dict by key or value, `max(d, key=d.get)`, nested dicts
  - Patterns: counting, grouping, "have I seen this", lookup by complement, adjacency list
  - Visual: the hash table from 1B.4 with real keys and values, plus the entries array growing in order
  - Traps: `d[0]` is a key lookup, not a position. Missing key raises `KeyError`. Checking `in d.values()` instead of `in d`.

- [ ] **1B.6 Sets**
  - `set()` versus `{}` (which is a dict), `add`, `remove` versus `discard`, `pop`, `clear`
  - Operations: union, intersection, difference, symmetric difference, subset and superset checks
  - Set comprehensions, `frozenset`, deduplicating a list
  - Why there is no indexing and no stable order: a hash table with keys and no values
  - O(1) membership versus a list: a benchmark you can run in the page
  - Visual: a Venn diagram driven by the operators, and the hash table view underneath

- [ ] **1B.7 Sorting and searching helpers**
  - `sorted()` versus `.sort()`, `key=`, `reverse=`, stability, sorting by several fields, `functools.cmp_to_key`
  - `bisect_left`, `bisect_right`, `insort` on a sorted list
  - Visual: a stable sort keeping ties in their original order

- [ ] **1B.8 `collections` and friends**
  - `Counter` (`most_common`), `defaultdict`, `deque`, `OrderedDict`, `namedtuple`
  - `heapq` (`heappush`, `heappop`, `nlargest`, `nsmallest`), peeking only. Heaps get their own lesson in Phase 3.
  - `itertools` basics (`combinations`, `permutations`, `product`, `accumulate`), `functools.lru_cache`

- [ ] **1B.9 Choosing a container**
  - Decision chart: ordered or not, unique or not, mutable or not, lookup by position or by key
  - Complexity table for list, tuple, dict, set, deque
  - "Which would you use?" quiz

- [ ] **1B.10 Patterns you will reuse** (optional, as visual mini-lessons)
  - Frequency count, "seen" set, group by key, lookup by complement, top k by count

### API coverage the API tour cards will include

| Type | Methods and functions |
|---|---|
| list | `append`, `extend`, `insert`, `pop`, `remove`, `index`, `count`, `sort`, `reverse`, `copy`, `clear` |
| tuple | `count`, `index`, unpacking, `namedtuple` |
| dict | `get`, `setdefault`, `update`, `pop`, `popitem`, `keys`, `values`, `items`, `fromkeys`, `copy`, `clear`, `\|` |
| set | `add`, `remove`, `discard`, `pop`, `union`, `intersection`, `difference`, `symmetric_difference`, `issubset`, `issuperset`, `copy`, `clear` |
| str | `split`, `join`, `strip`, `replace`, `find`, `index`, `count`, `startswith`, `endswith`, `upper`, `lower`, `isdigit`, `isalpha`, `zfill` |
| built-ins | `len`, `sum`, `min`, `max`, `sorted`, `reversed`, `enumerate`, `zip`, `any`, `all`, `map`, `filter`, `range`, `abs`, `divmod`, `round`, `isinstance`, `type`, `id`, `hash`, `ord`, `chr` |
| modules | `collections`, `heapq`, `bisect`, `itertools`, `functools`, `math`, `copy`, `sys` |

---

## Phases built after Phase 1

Every phase is built to the interview-depth standard: each lesson has the visual trace plus an "Interview depth" section (thesis, reasoning, edge-case checklist, complexity table, internals, and mid/senior/staff Q&A with follow-ups). The home page groups chapters into phases (`PHASES` in `assets/chapters.js`).

| Phase | Chapters | Lessons |
|---|---|---|
| 1. Python foundations | 1 to 7 | 22 lessons (see above) |
| 2. Core data structures | 8 Linked lists (singly, doubly, patterns), 9 Stacks and queues (stack, queue/deque, monotonic and patterns), 10 Trees (basics and traversals, BST, tree patterns), 11 Heaps and tries (heaps, heap patterns, tries) | 11 lessons |
| 3. Graphs, DP and analysis | 12 Graphs (basics, traversal BFS/DFS, topological sort), 13 Shortest paths and connectivity (Dijkstra, union-find), 14 Dynamic programming (recursion and memo, 1D, 2D), 15 Complexity analysis (growth rates, amortised cost and space) | 10 lessons |
| 4. Object-oriented design | 16 Classes and objects (classes, dunder methods), 17 Inheritance and composition (MRO and super, composition and delegation), 18 Iterators, generators and decorators (iterators and generators, decorators and dataclasses) | 6 lessons |
| 5. Algorithms in motion | 19 Sorting (simple sorts, merge sort and quicksort), 20 Binary search (classic and lower bound, rotated and search-on-answer), 21 Two pointers and sliding window | 6 lessons |

Phase 5 uses a different player: bars slide and swap smoothly like a video, with a scrubber, speed control, and the current line highlighted in the Python and C listings beside the animation.

Ideas not yet built: heap sort, counting and radix sort, quickselect, backtracking (permutations, N-Queens), intervals and sweep line, prefix sums and difference arrays, bit manipulation, string algorithms (KMP, rolling hash), greedy.

---

## Open decisions

1. **How the visuals run.** Hand-authored traces give precise narration and memory pictures with no runtime, but every example is fixed. Running real Python in the browser (Pyodide) lets people edit any code, but the memory pictures are harder to narrate. Suggestion: hand-authored traces for lessons, an editable sandbox later.
2. **Stack.** Suggestion: plain HTML, CSS and JavaScript with no build step, one file per lesson plus a shared step engine, hosted on GitHub Pages.
3. **Order of 1B.** Hashing comes before dicts and sets in this plan. Swap it if you would rather meet dicts first.
4. **Python version.** Target 3.12 or newer, so `match`, `list[int]` and the `|` dict merge are all fair game.
5. **Anything to cut or add** in Stage 1A and 1B.
