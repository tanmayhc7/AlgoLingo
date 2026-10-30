/* Interview depth: Variables and names. */
window.DEPTH = {
  thesis:
    'In Python a variable is a name bound to an object, and objects carry the type, not the names. Almost every "gotcha" interview question here is the same question in disguise: is this operation rebinding a name, or mutating an object that other names can see? If you can answer that for any line, you can predict the output.',
  why: [
    ['Rebinding versus mutating', '`x = ...` always rebinds a name and never touches the old object. `x.append(...)`, `x[i] = ...`, `x.update(...)` mutate the object itself, so every name pointing at it sees the change. Immutable objects (int, str, tuple, frozenset, bytes) have no mutating operations, which is why aliasing is harmless for them and a trap for lists, dicts and sets.'],
    ['Augmented assignment is the tricky one', '`x += y` calls `x.__iadd__(y)` if it exists, else `x = x + y`. For a list, `+=` extends in place (aliases see it). For an int or a string, it builds a new object and rebinds. Same syntax, two behaviours, decided by the type.'],
    ['Scope follows binding', 'A name assigned anywhere in a function is local to that whole function (decided at compile time). That is why reading a global and then assigning to it inside the function raises `UnboundLocalError`. Lookup order is Local, Enclosing, Global, Built-in (LEGB).'],
    ['Memory is automatic, not absent', 'CPython frees an object the instant its reference count hits zero, and runs a cyclic garbage collector for reference cycles. You still leak by keeping references alive (global caches, lists that only grow, closures, exception tracebacks).'],
  ],
  edges: [
    ['`a = b = []`', 'One list, two names. Use separate literals when you want separate lists.'],
    ['`b = a` then `b += [1]` (list)', 'Mutates the shared list, `a` sees it. With `b = b + [1]` a new list is built and `a` is unchanged.'],
    ['`t = ([1],); t[0] += [2]`', 'Raises `TypeError` (tuple item assignment) but the list inside has already been extended. A famous trick question: both happen.'],
    ['`is` on numbers and strings', 'Small ints (-5 to 256) are cached, and some strings are interned, so `is` may say True. This is an implementation detail. Use `==` for values and `is` only for `None` and singletons.'],
    ['Reading then assigning a global in a function', '`UnboundLocalError`. Declare `global x`, or better, pass in and return values.'],
    ['Loop variable closures', '`fs = [lambda: i for i in range(3)]` makes three functions that all return 2, because the closure sees the variable, not its value at creation. Bind early with `lambda i=i: i`.'],
    ['`del x`', 'Removes the name, never the object. The object is freed only if no other reference remains.'],
    ['Shallow versus deep copy', '`b = a[:]` or `list(a)` copies the outer list only; inner lists are shared. `copy.deepcopy` copies recursively and handles cycles.'],
    ['Comparing to C storage classes', 'No `static`, `volatile` or stack versus heap choice in Python: every object lives on the heap and lifetime follows references. "Static-like" state is a module global, a class attribute or a closure; constants are by convention (`MAX_N`) or `typing.Final`.'],
  ],
  cost: [
    ['name lookup (local)', 'O(1)', '`LOAD_FAST` indexes a fixed array. The fastest case.'],
    ['name lookup (global, builtin)', 'O(1) dict', 'A dict lookup, slower than local. Bind hot built-ins to a local in tight loops if you measure a need.'],
    ['b = a (any object)', 'O(1)', 'Adds a reference. Copies nothing.'],
    ['a[:], list(a), a.copy()', 'O(n)', 'Shallow copy of n pointers.'],
    ['copy.deepcopy(a)', 'O(total size)', 'Recursive, with a memo table to survive cycles. Much slower than a shallow copy.'],
    ['sys.getsizeof(5)', '28 bytes', 'Header plus digits; a small int is shared, so it costs once.'],
  ],
  internals: [
    ['Reference counting', 'Every object has a count of references. Binding, putting in a list and passing as an argument increment it, rebinding or `del` decrement it. At zero the object is freed immediately and deterministically. `sys.getrefcount(x)` reports one more than you expect, because the call itself holds a reference.'],
    ['The cycle collector', 'Reference counting cannot free `a.other = b; b.other = a` after both names are gone. A generational collector finds unreachable cycles of container objects and frees them. `gc.collect()` forces a pass. Tuning is rarely needed, but `gc.freeze()` and disabling GC are known tricks for fork-heavy servers.'],
    ['Small-int cache and interning', 'CPython preallocates ints -5 to 256 and reuses them. Identifier-like string literals and compile-time constants are interned, and `sys.intern` interns on demand. Both are optimisations you must not depend on.'],
    ['Names as dictionary entries', 'At module and class level, names live in a dict (`globals()`, `vars(cls)`). In a function, locals live in a fixed slots array, and closure variables live in cells shared between the inner and outer function.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What does this print?\n`a = [1, 2]; b = a; b.append(3); print(a)`',
      a: '`[1, 2, 3]`. `b = a` does not copy; both names point at one list. `append` mutates that list.',
      follow: [
        ['How do you make `b` an independent copy?', '`b = a.copy()`, `b = a[:]` or `b = list(a)` for a flat list. For nested structures, `copy.deepcopy(a)`.'],
        ['And what if `a` holds lists?', 'A shallow copy shares the inner lists, so `b[0].append(9)` shows in `a[0]`. Deep copy, or rebuild the inner lists, fixes that.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Difference between `is` and `==`?',
      a: '`==` asks whether two objects have equal values (it calls `__eq__`). `is` asks whether two names point at the very same object (compares identity). Use `is` for `None`, `True`, `False` and sentinels, `==` for everything else.',
      follow: [
        ['Why does `256 is 256` print True and `257 is 257` often False?', 'CPython caches small ints and reuses one object for -5 to 256. Beyond that, each evaluation can build a new object. Do not rely on it: in one expression the compiler may even merge equal constants.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain why `x += 1` inside a function raises `UnboundLocalError` when `x` is a module-level variable.',
      a: 'The compiler sees an assignment to `x` in the function body, so it treats `x` as local for the entire function. The right-hand side `x + 1` then reads a local that has no value yet. Fix with `global x` (rarely the best), or pass the value in and return the new one, or keep state in an object.',
      follow: [
        ['What changes if `x` were a list and you wrote `x.append(1)`?', 'Nothing is assigned to `x`, so it is not local. The function reads the global name and mutates the shared list. Works, and is a common source of hidden coupling.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'This builds three functions. What do they return?\n`fs = [lambda: i for i in range(3)]; [f() for f in fs]`',
      a: '`[2, 2, 2]`. Closures capture the variable `i`, not its value at that moment, and after the loop `i` is 2. Fix by binding the value as a default argument (`lambda i=i: i`) or with `functools.partial`.',
      follow: [
        ['Does the same happen with a list comprehension that calls the lambdas immediately?', 'No. If you call each lambda inside the loop, `i` still holds the current value. The problem appears only when the functions are called after the loop moved on.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'How does Python manage memory, and can a Python program leak?',
      a: 'Reference counting frees objects when the count hits zero, and a generational cyclic collector reclaims unreachable cycles. Programs "leak" by holding references: unbounded caches or global lists, listeners never unregistered, closures and bound methods keeping `self` alive, exception tracebacks holding frames, and cycles involving objects with finalisers in older Pythons. Diagnose with `tracemalloc`, `objgraph`, `gc.get_objects()`.',
      follow: [
        ['How do you cache without leaking?', '`functools.lru_cache(maxsize=N)` or `cachetools` with a bound, `weakref.WeakValueDictionary` for caches that should not keep objects alive.'],
        ['Why does memory not always return to the OS after freeing?', 'The allocator (pymalloc arenas and the C library) keeps freed blocks for reuse. Peak usage shows in the process even when the Python-level objects are gone.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'A teammate says "Python passes everything by reference". Correct that precisely.',
      a: 'Python passes object references by value, often called "pass by assignment". The parameter is a new name bound to the same object as the argument. Mutating that object is visible to the caller; rebinding the parameter is not. It is neither C-style by-value copying of the data nor C++ references, where assigning to the reference would change the caller\'s variable.',
      follow: [
        ['Show the one-line experiment.', '`def f(xs): xs = [9]` leaves the caller\'s list unchanged; `def g(xs): xs.append(9)` changes it. Same call shape, different effect, because one rebinds and one mutates.'],
      ],
    },
  ],
};
