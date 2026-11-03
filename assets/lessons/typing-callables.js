/* Lesson data: typing functions, iterables and optional values (structure mode, Flow helper). */
(function () {
  var call = Flow.steps([
    { pl: 1, cl: 0, say: 'Callable[[int], str] says: f is something you can call with one int, and it gives back a str. The inner list holds the argument types, then comes the return type.', csay: 'typedef const char *(*Fn)(int);  /* int in, string out */', add: [['la', 'f is', 0, 0], ['a', 'takes', 1, 0], ['b', 'int', 2, 0], ['c', 'returns', 3, 0], ['d', 'str', 4, 0]], tag: [['la', 'dim'], ['a', 'dim'], ['c', 'dim']] },
    { pl: 3, cl: 4, say: 'apply(str, 7) passes the function str itself, with no parentheses after the name. str is callable: str(7) gives "7". apply receives the function as a value and calls it.', csay: 'apply(int_to_str, 7);', add: [['lb', 'actual', 0, 1], ['e', 'str', 1, 1], ['f', '7', 2, 1], ['g', 'ok', 4, 1]], tag: [['lb', 'dim'], ['b', 'done'], ['f', 'done'], ['g', 'done'], ['d', 'done']] },
    { pl: 4, cl: 4, say: 'A lambda that takes an int and returns a str matches the same hint. Any callable with that shape can be passed in.', csay: 'apply(other_fn, 3);', lab: [['e', 'lambda'], ['f', '3']], tag: [['e', 'cur']] },
    { pl: 5, cl: 5, say: 'apply(len, "abc") does not match: len takes a sized object, not an int, and returns an int. Python still runs it and returns 3. A type checker such as mypy flags the call before the program runs, and a C compiler would reject the equivalent call. Python itself does not check hints.', csay: 'apply(strlen, "abc");  /* compile error */', lab: [['e', 'len'], ['f', 'abc'], ['g', '3']], untag: [['e', 'cur'], ['f', 'done'], ['g', 'done']], tag: [['e', 'bad'], ['g', 'bad']] },
    { pl: 2, cl: 2, say: 'Why hint functions: callbacks, key= arguments, retries and handlers all pass functions around. The hint documents the shape the function must have, so editors and checkers catch a mismatch.', csay: 'return f(x);', hot: ['a', 'c'] },
  ], { y0: 60, dy: 80 });
  var iter = Flow.steps([
    { pl: 1, cl: 1, say: 'Iterable[int] says: anything you can loop over with for that yields ints. A list, a tuple, a set, a range and a generator all qualify, so the function accepts all of them, not just lists.', csay: 'int *first(const int *xs, size_t n)', add: [['la', 'accepts', 0, 0], ['a', 'list', 1, 0], ['b', 'tuple', 2, 0], ['c', 'set', 3, 0], ['d', 'range', 4, 0], ['e', 'gen', 5, 0]], tag: [['la', 'dim']] },
    { pl: 5, cl: 5, say: 'first([4, 5]) loops once and returns 4, an int, which matches the hint.', csay: 'int *r = first(a, 2);', add: [['lb', 'returns', 0, 1], ['r', '4', 1, 1]], tag: [['lb', 'dim'], ['a', 'cur'], ['r', 'done']] },
    { pl: 6, cl: 6, say: 'A generator expression is an Iterator, which is also Iterable: it hands out items one at a time and can be used once. This one is empty, so the loop body never runs and the function falls through to return None.', csay: 'int *r2 = first(a, 0);  /* NULL */', untag: [['a', 'cur']], tag: [['e', 'cur']], lab: [['r', 'None']] },
    { pl: 1, cl: 2, say: 'int | None (older code writes Optional[int]) says the function may return an int or None. It is an honest warning: the caller must handle both cases.', csay: 'if (n == 0) return NULL;', untag: [['r', 'done']], tag: [['r', 'hot']] },
    { pl: 7, cl: 7, say: 'r + 1 fails when r is None: TypeError at run time, as C would crash on a NULL pointer. A type checker flags this line because it knows r might be None. Fix: test if r is not None before using it.', csay: 'printf("%d", *r2 + 1);  /* crash */', tag: [['r', 'bad']] },
    { pl: 0, cl: 0, say: 'Hints say nothing at run time. Python does not reject first(5) for being an int; the loop simply fails with TypeError when it tries to iterate. Hints are for readers and tools.', csay: '/* C checks types at build time */', hot: ['a', 'd', 'e'] },
  ], { y0: 60, dy: 80 });
  window.LESSON = {
    id: 'typing-callables', mode: 'ds',
    title: 'Typing functions: Callable',
    lede: 'Type hints can describe more than ints and strings. Callable[[int], str] says "a function from int to str", so you can type callbacks and functions passed as arguments. Iterable, Iterator and Generator describe things you loop over, and int | None (or Optional[int]) says a value may be missing. Python does not enforce any of this when the program runs; editors and checkers such as mypy use it to catch mistakes early. In C the equivalents are function-pointer types and NULL, and the compiler does enforce them.',
    scenes: [
      { id: 'callable', title: 'Callable', blurb: 'The hint names the argument types and the return type, so a function can be passed around safely.', trap: 'Assuming the hint is checked. Python runs apply(len, "abc") without complaint; only a type checker would object. Also write Callable[..., Any] when the arguments really vary, and do not call the function in the hint: write Callable, not Callable().',
        pyCode: ['from collections.abc import Callable', 'def apply(f: Callable[[int], str], x: int) -> str:', '    return f(x)', 'apply(str, 7)', 'apply(lambda n: "#" * n, 3)', 'apply(len, "abc")'],
        cCode: ['typedef const char *(*Fn)(int);   /* pointer to function: int in, string out */', 'const char *apply(Fn f, int x) {', '    return f(x);', '}', 'apply(int_to_str, 7);', 'apply(strlen, "abc");   /* compiler rejects: wrong type */'],
        predict: { q: 'The hint says Callable[[int], str]. What happens at run time when you call apply(len, "abc")?', options: ['TypeError before the function runs, because of the hint', 'It runs and returns 3; only a type checker complains', 'Python converts "abc" to an int first'], answer: 1, why: 'Python ignores hints when running. The call works by the normal rules, and a tool such as mypy would report the mismatch.' }, steps: call },
      { id: 'iterables', title: 'Iterable, Iterator, Optional', blurb: 'Describe what you can loop over and whether a value may be missing.', trap: 'Typing a parameter as list[int] when the function only loops, which rejects tuples and generators for no reason: accept Iterable[int]. And forgetting that an Optional result must be checked before use, which is the most common bug that type checkers find.',
        pyCode: ['from collections.abc import Iterable, Iterator, Generator', 'def first(xs: Iterable[int]) -> int | None:', '    for x in xs:', '        return x', '    return None', 'r = first([4, 5])', 'r = first(n for n in range(0))', 'print(r + 1)'],
        cCode: ['/* C: types are checked at build time; there is no "iterable" */', 'int *first(const int *xs, size_t n) {', '    if (n == 0) return NULL;', '    return &xs[0];', '}', 'int *r = first(a, 2);', 'int *r2 = first(a, 0);   /* NULL */', 'printf("%d", *r2 + 1);   /* crash */'],
        predict: { q: 'first(5) is called although the hint says Iterable[int]. What does Python do?', options: ['Rejects the call because of the hint', 'Raises TypeError when the loop tries to iterate over 5, not because of the hint', 'Returns 5'], answer: 1, why: 'The hint is not checked. The for loop is what fails, because an int cannot be iterated.' }, steps: iter },
    ],
    builtins: [
      ['Callable[[A, B], R]', 'A function taking A and B and returning R. Use Callable[..., R] when arguments vary.'],
      ['Iterable[T]', 'Anything you can loop over with for: list, tuple, set, dict, range, file, generator.'],
      ['Iterator[T]', 'An object you step through with next(); can be used only once. Every iterator is also iterable.'],
      ['Generator[Y, S, R]', 'What a function containing yield returns: yields Y, accepts S, finally returns R. Often Iterator[Y] is enough.'],
      ['int | None  /  Optional[int]', 'The value is an int or None. Check for None before using it.'],
      ['mypy, pyright', 'Type checkers: they read hints and report mismatches without running the program.'],
    ],
  };
})();
