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
      q: 'Why does this print `[1, 1]` on the second call and how do you fix it?\n`def add(x, xs=[]): xs.append(x); return xs`',
      a: 'The default list is created once when `def` runs and stored on the function object, so every call without `xs` shares it. Fix: `def add(x, xs=None): if xs is None: xs = []; xs.append(x); return xs`. Sentinels (`None`) are the standard idiom.',
      follow: [
        ['Is it ever useful?', 'Yes, deliberately, as a cache or counter (`def f(x, _cache={}): ...`), but explicit `functools.lru_cache` or a module-level dict states the intent better.'],
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
