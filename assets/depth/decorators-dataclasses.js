/* Interview depth: Decorators and dataclasses. */
window.DEPTH = {
  thesis:
    'A decorator is a callable that receives a function (or class) and returns a replacement, applied once at definition time. It relies on first-class functions and closures. Dataclasses use the same mechanism on classes to generate methods. Interviews ask you to write a decorator from scratch (timing, retry, memoisation), to explain closures, and to show you know the pitfalls of wrapping.',
  why: [
    ['Cross-cutting concerns without changing the function', 'Logging, timing, retries, authentication and caching wrap many functions the same way.'],
    ['Built into the language and libraries', 'property, staticmethod, classmethod, lru_cache, Flask routes, pytest fixtures: all decorators.'],
    ['Tests closures and first-class functions', 'A wrapper that captures fn and state shows you understand scope and lifetime.'],
    ['Dataclasses remove boilerplate', 'Records with correct equality, repr, ordering and immutability take a few lines.'],
  ],
  edges: [
    ['Lost metadata', 'Without functools.wraps the wrapper shadows __name__, __doc__ and signature information.'],
    ['Decorators with arguments', 'You need three layers: a factory that takes the arguments, the decorator that takes the function, and the wrapper. Forgetting a layer gives confusing TypeErrors.'],
    ['Decorating methods', 'The wrapper receives self as its first argument; use *args, **kwargs to pass everything through.'],
    ['Stacking order', 'The decorator nearest the def applies first. @a over @b means a(b(f)).'],
    ['Mutable dataclass defaults', 'A bare list default is rejected; use field(default_factory=list). Mutable dataclasses are unhashable unless frozen or eq=False.'],
  ],
  cost: [
    ['wrapper overhead', 'One extra Python call per invocation; negligible except in very hot loops.'],
    ['lru_cache', 'O(1) lookup per call, memory grows with distinct arguments unless maxsize is set; arguments must be hashable.'],
    ['dataclass creation', 'Generation happens once at import; instances cost the same as ordinary objects (slots=True reduces memory).'],
  ],
  internals: [
    ['Closures', 'The wrapper keeps a reference to fn in a cell variable. That is how it still works after timed() has returned.'],
    ['Decorator syntax', '@d above def f is f = d(f). With arguments, @d(1) is f = d(1)(f).'],
    ['What @dataclass does', 'It inspects __annotations__, builds methods as source text, and attaches them to the class with setattr.'],
    ['Class decorators and metaclasses', 'A class decorator modifies a finished class; a metaclass participates in its creation. Prefer decorators when possible.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Write a decorator `timed` that prints how long a function takes and returns its result.',
      a: 'import time, functools\ndef timed(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        t = time.perf_counter()\n        try:\n            return fn(*args, **kwargs)\n        finally:\n            print(fn.__name__, time.perf_counter() - t)\n    return wrapper\n\nUse *args, **kwargs so any signature works, functools.wraps to keep the metadata, and finally so the time is printed even when the function raises.',
      follow: [
        ['How do you make it take an argument, like a label?', 'Add an outer function: def timed(label): def deco(fn): ... return deco, used as @timed("x").'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What problem does a dataclass solve, and what do you get for free?',
      a: 'It removes boilerplate for classes that mainly hold data. From the annotated fields it generates __init__, __repr__ and __eq__; options add ordering (order=True), immutability and hashing (frozen=True), and slots (slots=True). It also supports default values and field(default_factory=...) for mutable defaults.',
      follow: [
        ['When would you prefer a NamedTuple or a plain class?', 'NamedTuple when you want immutable, tuple-like unpacking; a plain class when you need custom behaviour in most methods.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Implement memoisation with a decorator and discuss its limits.',
      a: 'def memo(fn):\n    cache = {}\n    @functools.wraps(fn)\n    def wrapper(*args):\n        if args not in cache:\n            cache[args] = fn(*args)\n        return cache[args]\n    return wrapper\n\nLimits: arguments must be hashable; the cache grows without bound (functools.lru_cache adds maxsize eviction); it assumes the function is pure; it is not thread-safe without locks; and for recursion the recursive calls must go through the decorated name. In production use functools.cache or lru_cache.',
      follow: [
        ['How does this relate to dynamic programming?', 'It is top-down DP: the cache stores subproblem results keyed by arguments, turning exponential recursion into polynomial time.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain how a closure keeps state, using a counter decorator that tracks how many times a function was called.',
      a: 'The wrapper refers to a variable in the enclosing scope (a cell). Because the wrapper holds a reference to that cell, the variable outlives the call to the decorator. Use nonlocal to rebind it, or store the count as an attribute on the wrapper (wrapper.calls += 1). Each decorated function gets its own enclosing scope, so counts are independent. In C the equivalent is a struct with a function pointer and a state pointer passed together.',
      follow: [],
    },
  ],
};
