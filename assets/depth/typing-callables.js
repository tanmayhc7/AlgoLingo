/* Interview depth: typing functions, iterables and optional values. */
window.DEPTH = {
  thesis: 'Type hints are documentation that tools can check. Callable[[A], R] describes a function you pass around, Iterable[T] describes anything you can loop over, and T | None marks a value that may be missing. Python ignores all of them at run time, so their value comes from checkers such as mypy and pyright, editor help, and readers who can see the contract.',
  why: [
    ['Accept the widest type you need', 'If a function only loops over its input, take Iterable[int], not list[int]. Callers can then pass a tuple, a set, a range or a generator.'],
    ['Return a specific type', 'Be generous in what you accept and precise in what you return, so callers know what they get back.'],
    ['Callbacks need a contract', 'Retry helpers, event handlers and key= functions all take functions. Callable says how many arguments and what return type, so a wrong function is caught early.'],
    ['None must be handled', 'Optional results are the most common bug a type checker finds: using a value that might be None.'],
  ],
  edges: [
    ['Hints are not enforced', 'Python never checks them while running. Use runtime validation (Pydantic, explicit checks) at boundaries where data comes from outside.'],
    ['Callable[..., Any]', 'Use it when arguments really vary, such as a decorator wrapper. It disables checking of the arguments.'],
    ['Iterators are single use', 'A generator passed as Iterable is consumed by the first loop; a second loop sees nothing. If you need two passes, accept a Sequence or build a list first.'],
    ['Iterable versus Sequence', 'Sequence adds len() and indexing. Ask for the weakest type that your function actually uses.'],
    ['Optional means can be None', 'Optional[int] does not mean "the argument may be left out"; give the parameter a default for that.'],
    ['Old and new spellings', 'Optional[int] and Union[int, None] are the older spelling of int | None; the | form needs Python 3.10 or newer at run time.'],
  ],
  cost: [
    ['Hints at run time', 'Almost nothing: they are stored on the function and not checked.'],
    ['Type checker run', 'Part of CI; time grows with project size, results are cached.'],
    ['Runtime validation', 'Costs time per call; do it at boundaries, not inside hot loops.'],
  ],
  internals: [
    ['Annotations', 'Stored in the function\'s __annotations__ dictionary when def runs; typing.get_type_hints reads them.'],
    ['Abstract types', 'Callable, Iterable and Iterator come from collections.abc. They describe behaviour (has __call__, has __iter__), not a concrete class.'],
    ['Generators', 'A function with yield returns a generator object, which is an Iterator. Generator[Y, S, R] also records send and return types.'],
    ['In C', 'Function-pointer typedefs and NULL. The compiler enforces them at build time; there is no iterable type, only pointer and length.'],
  ],
  qa: [
    { lvl: 'junior', q: 'Does Python check type hints?', a: 'No. They are ignored when the program runs. Tools such as mypy or pyright check them before you run, and editors use them for completion and warnings.', follow: [] },
    { lvl: 'mid', q: 'How do you type a function that takes a callback?', a: 'Callable[[ArgTypes], ReturnType], for example Callable[[int], str]. Use Callable[..., Any] when the arguments vary.', follow: [['Why not just write function?', 'There is no function type to name; Callable is the one that carries the argument and return types, which is what a checker needs.']] },
    { lvl: 'mid', q: 'Why type a parameter as Iterable[int] and not list[int]?', a: 'It accepts any loop-able input: lists, tuples, sets, ranges and generators. Using list[int] rejects those for no reason when the function only loops.', follow: [['What is the catch with generators?', 'They can be consumed once. If the function loops twice, a generator input gives empty results the second time, so take a Sequence or convert to a list.']] },
    { lvl: 'senior', q: 'What does int | None mean for a caller?', a: 'The result may be None, so the caller must check before using it. Type checkers flag r + 1 on such a value, which prevents the TypeError. Prefer raising an exception, or returning an empty value, when "missing" is not a normal case.', follow: [] },
  ],
};
