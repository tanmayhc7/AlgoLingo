/* Interview depth: Running Python programs. */
window.DEPTH = {
  thesis:
    'Running a Python file is a small topic with a lot of folklore around it. What an interviewer wants is that you know what actually executes (top-to-bottom statements, `def` as a run-time statement), what `__name__` means, and that you can reason about imports, scripts versus modules, and input in a judge environment.',
  why: [
    ['Everything is a statement that runs', '`def`, `class` and `import` are executed when control reaches them. A `def` builds a function object and binds a name. That explains why a function must be defined before the line that calls it runs, not before it appears in the file.'],
    ['Scripts and modules are the same thing', 'Any `.py` file is a module. When you run it, its `__name__` is `"__main__"`. When another file imports it, `__name__` is the module name. The guard `if __name__ == "__main__":` separates "run" from "import".'],
    ['Indentation is syntax, not style', 'The compiler converts changes in indentation into block start and end tokens. That is why mixing tabs and spaces is an error (`TabError`) and why a mis-indented `return` silently changes logic instead of failing.'],
    ['Know your input and output habits', 'Coding sites usually call your function directly. When they do not, `input()` is slow for large input; `sys.stdin.readline` or `sys.stdin.read().split()` is the idiom. `print` is also slow in tight loops: collect lines and write once.'],
  ],
  edges: [
    ['Code at the top of a module with no guard', 'Runs on import, including side effects like network calls or heavy computation. Put the entry point under the guard.'],
    ['Mutable default argument', 'The default is evaluated once when `def` runs, so a `[]` default is shared across calls. Use `None` and create the list inside.'],
    ['`print` buffering', 'Output to a pipe is block-buffered, to a terminal line-buffered. Interleaving `print` and `stderr`, or a crash before flush, can drop or reorder lines. Use `flush=True` when it matters.'],
    ['`input()` strips the trailing newline', 'Unlike C `fgets`, which keeps it. At end of input it raises `EOFError`.'],
    ['Tabs and spaces', 'Python 3 refuses to guess: `TabError: inconsistent use of tabs and spaces`. Use four spaces and configure your editor.'],
    ['Line continuation', 'Inside `()`, `[]`, `{}` lines continue freely. A trailing backslash works but is fragile. Prefer parentheses.'],
    ['Script name shadows a module', 'Naming your file `random.py` or `json.py` makes `import random` pick up your file. A classic confusing error.'],
  ],
  cost: [
    ['print(x) per item, 10^5 items', '~100 ms+', 'Each call goes through the I/O layer. Build a list and `"\\n".join(...)` once.'],
    ['input() per line, 10^6 lines', 'seconds', 'Use `sys.stdin.readline` or read everything at once.'],
    ['import of a module (first time)', 'ms to s', 'Locate, compile or load `.pyc`, execute top-level. Later imports hit `sys.modules` and cost a dict lookup.'],
    ['python -X importtime', 'diagnostic', 'Shows where start-up time goes. Useful for CLIs.'],
  ],
  internals: [
    ['What the guard compares', 'Before running your file, Python sets the global `__name__` of the main module to `"__main__"`. Imported modules get their dotted path. `python -m pkg.mod` also runs `pkg.mod` as `__main__`, with package-relative imports working.'],
    ['The REPL versus a script', 'The REPL compiles and runs one statement at a time in a persistent namespace. A script is compiled as a whole first, so a syntax error anywhere stops it before the first line runs.'],
    ['`sys.path` and the import system', 'Imports search `sys.path`: the script directory first, then standard library and site-packages. Modules are cached in `sys.modules`, so each is executed once per process. `importlib.reload` re-executes one.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What does `if __name__ == "__main__":` do and why use it?',
      a: 'It runs a block only when the file is executed directly, not when it is imported. Without it, importing the module (for tests or reuse) would run the program. It also lets a file be both a library and a script.',
      follow: [
        ['What is `__name__` when the file is imported?', 'The module name (for example `utils` or `pkg.utils`). Only the entry module is `"__main__"`.'],
        ['How do tests benefit?', 'A test file can `import` the module and call functions without triggering the main program, and without needing a subprocess.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why does this print `[1, 1]` on the second call, and how do you fix it?',
      qcode: 'def add(x, xs=[]):\n    xs.append(x)\n    return xs\n\nprint(add(1))   # [1]\nprint(add(1))   # [1, 1]  <- surprise',
      a: 'Python creates the default list once, when the `def` line runs, and stores it on the function object. It is not rebuilt on each call. So every call that does not pass its own `xs` uses that same list. The first call appends 1 to it, and the second call appends another 1 to the same list, giving `[1, 1]`. This only bites with mutable defaults (list, dict, set), because appending changes the object in place. A default such as `0` or `"abc"` is safe, because those cannot be changed in place. For C programmers it behaves like a `static` variable inside the function: one piece of storage shared by every call.',
      acode: 'def add(x, xs=None):\n    if xs is None:\n        xs = []        # a fresh list on every call\n    xs.append(x)\n    return xs\n\nprint(add(1))   # [1]\nprint(add(1))   # [1]',
      diagram: {
        caption: 'Why the second call sees the first call\'s data',
        title: 'With `xs=[]` (the bug)',
        main: [
          ['`def add(x, xs=[])` runs', 'Python builds the function and creates one empty list. It stores that list on the function as the default for `xs`.'],
          ['`add(1)` is called', 'No list passed, so `xs` is that stored list. 1 is appended and it returns `[1]`.'],
          ['`add(1)` is called again', 'No list passed, so `xs` is the same stored list, which already holds 1.', 'warn'],
          ['Result: `[1, 1]`', 'The second call saw the first call\'s data, because both used one list.', 'warn'],
        ],
        branch: {
          title: 'With `xs=None` (the fix)',
          steps: [
            ['`def add(x, xs=None)` runs', 'The stored default is `None`, which cannot be changed in place.'],
            ['`add(1)` is called', '`xs` is `None`, so the `if` runs and creates a new list inside the call. It returns `[1]`.'],
            ['`add(1)` is called again', '`xs` is `None` again, so another new list is created. It returns `[1]`.', 'cache'],
          ],
        },
      },
      follow: [
        ['Why is `None` safe when the empty list is not?', 'The default is still created once, but `None` cannot be changed in place, so nothing is shared that can pile up. The `[]` in the body runs on every call, because the body runs on every call, so each call gets its own new list.'],
        ['Why check `xs is None` and not `if not xs`?', '`if not xs` is also true for an empty list the caller passed in, so the function would quietly replace the caller\'s list with a new one, and appends would not show up in the list they handed over. `is None` only replaces the "nothing was passed" case. `None` is used as a sentinel, a placeholder value that means "the caller gave me nothing".'],
        ['Is it ever useful?', 'Yes, deliberately, as a cache or counter, but it surprises readers, so `functools.lru_cache` or a module-level dict states the intent better. Treat a mutable default as a bug unless you meant it. Linters such as `ruff` and `flake8` flag it.', null, 'def f(x, _cache={}):\n    if x not in _cache:\n        _cache[x] = expensive(x)\n    return _cache[x]', 'Intentional use: a shared cache'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Two modules import each other and you get an `ImportError` or `AttributeError`. What happened and how do you fix it?',
      a: 'The first module starts executing, hits `import b`, which starts `b`, which does `from a import name`. `a` is in `sys.modules` but only partly executed, so `name` is not defined yet. Fixes in order of preference: move shared code to a third module; import the module rather than names (`import a`, use `a.name` later); or defer the import into the function that needs it. Circular imports usually signal a design problem.',
      follow: [
        ['Which fix hides the problem rather than solving it?', 'Moving an import inside a function: it works and avoids the cycle at load time, but the dependency still exists and can surprise later. Restructuring is the real fix.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'How would you make a command-line script robust: arguments, exit codes, and structure?',
      a: 'Put logic in functions, keep `main(argv=None)` testable, parse with `argparse` (or `typer`), return an int and `sys.exit(main())` under the guard. Use exit code 0 for success and non-zero for errors, write errors to `stderr`, and keep imports at the top except for heavy optional ones.',
      follow: [
        ['Why `main(argv=None)`?', 'Tests can call `main(["--flag"])` directly instead of patching `sys.argv`. `None` falls back to `sys.argv[1:]` inside `argparse`.'],
      ],
    },
  ],
};

/* design-why */
window.DEPTH.design = [
 [
  "Why there is no required `main` function",
  "A script is just statements run from top to bottom, so nothing special is needed to start. This lets one file work as a script and as an importable module, and the `__main__` check tells the two cases apart. C needs `main` because the linker must know the single entry point of a compiled program."
 ],
 [
  "Why indentation is syntax",
  "The layout you see becomes the structure the computer uses, so code cannot look right and mean something else. It also removes braces and the arguments over where to put them. The cost is that mixing tabs and spaces is an error, not a style choice."
 ],
 [
  "Why `print` is a function",
  "Python 3 made it a function so it can take arguments (`sep`, `end`, `file`) and can be passed around or replaced. In Python 2 it was a statement with special syntax and none of that flexibility."
 ],
 [
  "Why importing runs the file",
  "`import x` really runs `x.py` once and caches the result in `sys.modules`. That is why top-level code in a module executes on import. C's `#include` only pastes text and runs nothing."
 ]
];
