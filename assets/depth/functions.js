/* Interview depth: Functions. */
window.DEPTH = {
  thesis:
    'A Python function is an object, arguments are passed by handing over references, and a name\'s scope is fixed by where it is assigned. Interviews use functions to test whether you understand mutation across a call, default arguments, closures and recursion limits, and whether you can say what a function costs in time, stack and memory.',
  why: [
    ['Pass by assignment', 'Each parameter is a new name bound to the caller\'s object. Mutating that object is visible to the caller; rebinding the parameter is not. Predicting any "does the caller see this?" question is a matter of asking: rebind or mutate?'],
    ['Defaults are evaluated once', 'Default values are computed when `def` runs and stored on the function object. A mutable default is therefore shared across calls. The idiom is `None` plus creation inside.'],
    ['Closures capture variables, not values', 'An inner function keeps a reference to the enclosing variable (a cell), so later changes are visible, and loops that create closures all see the final value. Bind early with a default argument or `functools.partial`.'],
    ['Recursion is a stack, and Python limits it', 'Each call pushes a frame. CPython has no tail-call optimisation and a default limit of about 1000 frames, raising `RecursionError`. For deep problems, convert to a loop with an explicit stack, or raise the limit when you know the bound.'],
  ],
  edges: [
    ['Mutable default argument', '`def f(x, acc=[])` shares `acc`. Use `acc=None; if acc is None: acc = []`.'],
    ['Function with no `return`', 'Returns `None`. A common bug is `xs = xs.sort()`, or unpacking the result of a function that forgot to return.'],
    ['Returning several values', 'Really returns one tuple. Unpacking requires matching counts, else `ValueError`.'],
    ['Argument order and keywords', 'Positional arguments must come before keyword arguments in a call. Use `*` to force keyword-only parameters and `/` for positional-only ones (3.8+).'],
    ['`*args` and `**kwargs`', '`args` is a tuple, `kwargs` a dict. Passing them on is `f(*args, **kwargs)`. Name collisions raise `TypeError`.'],
    ['`UnboundLocalError`', 'Assigning to a name anywhere in a function makes it local everywhere in that function. Declare `global` or `nonlocal` if you really need to assign to outer names.'],
    ['Recursion without a base case or with the wrong one', '`RecursionError`. Always state the base case and show that each call moves toward it.'],
    ['Recursion depth on valid input', 'A recursive DFS on a 10^5-node path-shaped tree fails at depth 1000. Switch to iteration or raise the limit (and consider the C stack: very high limits can crash the interpreter).'],
    ['Decorators and metadata', 'A decorator that wraps a function replaces it; use `functools.wraps` to keep `__name__` and docstring. Forgetting it breaks introspection and tooling.'],
    ['Late-bound defaults', 'Defaults cannot refer to other parameters (`def f(a, b=a)` is a `NameError`). Compute inside.'],
    ['Type hints', 'They are not enforced. `def f(x: int)` accepts a string at run time. Use `mypy` or `pyright` in CI; use `pydantic` or explicit checks for validation at boundaries.'],
  ],
  cost: [
    ['function call overhead', '~50-100 ns', 'Frame creation and argument binding. Significant in tight loops; 3.11 cut it noticeably.'],
    ['recursive call depth d', 'O(d) stack', 'Each frame holds locals and a return address. Default limit about 1000 (`sys.getrecursionlimit()`).'],
    ['naive recursive fib(n)', 'O(2^n)', 'Recomputes subproblems.'],
    ['fib with `lru_cache`', 'O(n)', 'Each value computed once; space O(n) for the cache and recursion depth.'],
    ['args passing', 'O(1)', 'Passes references, never copies the object.'],
    ['*args packing / unpacking', 'O(k)', 'Builds a tuple of k items.'],
    ['lambda / closure creation', 'O(1)', 'Allocates a function object and cells.'],
  ],
  internals: [
    ['Frames and cells', 'A call creates a frame with a fixed slots array for locals. Variables used by inner functions live in "cell" objects shared between frames, which is how closures keep state after the outer function has returned. `fn.__closure__` shows the cells.'],
    ['What a function object holds', '`__code__` (bytecode, names, constants), `__defaults__`, `__kwdefaults__`, `__closure__`, `__globals__`, `__doc__` and annotations. Defaults living on the object explain the shared mutable default.'],
    ['Why no tail-call optimisation', 'Python keeps full tracebacks and frame information for debugging; collapsing frames would erase them. The design position is to use loops. Do not write deep recursion in Python expecting it to be optimised.'],
    ['Generators are functions that pause', 'A function containing `yield` returns a generator object. Its frame is suspended and resumed, keeping locals alive between values. That is how lazy sequences and coroutines work.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Does Python pass by value or by reference?',
      a: 'Neither exactly: it passes object references by value ("pass by assignment"). The parameter becomes a new name for the same object. Mutating it is visible to the caller; rebinding it is not.',
      follow: [
        ['Show an example where the caller sees the change and one where it does not.', '`def a(xs): xs.append(1)` changes the caller\'s list; `def b(xs): xs = xs + [1]` does not, because `+` builds a new list and only the local name moves.'],
        ['How would a C programmer map this?', 'It is like passing a pointer by value: you can modify what it points at, but reassigning your copy of the pointer does not affect the caller\'s pointer.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What is wrong with `def append_to(x, target=[]): target.append(x); return target`?',
      a: 'The default list is created once and reused for every call that omits `target`, so values accumulate across calls. Use `target=None` and create a new list inside the function.',
      follow: [
        ['Which other defaults are dangerous?', 'Any mutable object: dicts, sets, `datetime.now()` (evaluated once at definition), `uuid.uuid4()`, and instances of your own classes.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Implement memoised Fibonacci three ways and compare them.',
      a: '1) `functools.cache` on the recursive function: simplest, O(n) time and space, recursion depth O(n). 2) A dict passed or stored explicitly: same cost, more visible state. 3) Bottom-up loop with two variables: O(n) time, O(1) space, no recursion limit. Prefer the loop when only the last values are needed; use the cache when subproblems are irregular.',
      follow: [
        ['What breaks for `fib(5000)` with the cached recursive version?', '`RecursionError`: depth 5000 exceeds the limit. Fix by iterating, by warming the cache from small values upward, or by raising the limit.'],
        ['What does the cache do to memory over time?', '`lru_cache(maxsize=None)` grows without bound. For long-running services use a bounded size and think about cache invalidation.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain closures with an example that goes wrong.',
      a: 'A closure is an inner function that keeps access to variables of the enclosing function. `adders = [lambda x: x + i for i in range(3)]` makes three functions that all use the same `i`, which ends at 2, so `adders[0](10)` is 12, not 10. Fix with `lambda x, i=i: x + i`, or `functools.partial`, or a factory function that takes `i` as an argument.',
      follow: [
        ['When is that late binding actually useful?', 'When you want callbacks to see the latest configuration, for example a function that reads a module-level setting updated later. Be explicit about it in a comment.'],
        ['What does `nonlocal` do?', 'It lets an inner function assign to a variable in the enclosing function (not the global one). Without it, assignment creates a new local.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'You need to traverse a very deep tree. Recursion hits the limit. What do you do?',
      a: 'Convert to an iterative traversal with an explicit stack (a list) holding the nodes (or node and state) still to visit. It uses O(depth) heap memory rather than interpreter frames and has no recursion limit. For post-order or when you need results from children, push a marker or use two stacks. Raising `sys.setrecursionlimit` is a stop-gap; very deep recursion can crash the interpreter.',
      follow: [
        ['What state do you need to simulate for an in-order traversal?', 'Walk left pushing nodes, pop and visit, then move to the right child. The stack replaces the call stack exactly.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'When would you choose a decorator, a context manager, or a higher-order function?',
      a: 'A decorator wraps behaviour around every call of a function (timing, caching, retry, auth) and is applied at definition. A context manager scopes setup and cleanup around a block (locks, transactions, temporary state) and is applied at the call site. A higher-order function takes behaviour as an argument (`sorted(key=...)`, `map`), best when the caller varies the policy per call. The deciding question is the lifetime: per function, per block, or per call.',
      follow: [
        ['What can go wrong with decorators?', 'Lost metadata without `functools.wraps`, changed signature (confuses type checkers unless typed with `ParamSpec`), hidden state shared across calls, and surprising order when stacked: the one closest to `def` applies first.'],
      ],
    },
  ],
};
