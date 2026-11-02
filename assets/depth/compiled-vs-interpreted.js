/* Interview depth: Compiled versus interpreted. Format is documented in assets/engine.js (renderDepth). */
window.DEPTH = {
  thesis:
    'The honest answer to "is Python compiled or interpreted?" is "both, and the interesting part is what happens at run time". CPython compiles source to bytecode once, then a virtual machine executes that bytecode instruction by instruction. Everything that surprises a C programmer (speed, late errors, one `+` for many types) follows from that split.',
  why: [
    ['Two questions hide inside the one', 'Ask "when is the work done?" and "what information is available when it is done?". C does name and type resolution at build time, so the generated code is specialised for `int`. CPython does it on every execution, because the same bytecode must work for whatever objects arrive.'],
    ['Where the speed difference really comes from', 'Not "interpreted is slow" as a slogan. Each bytecode costs dispatch, a type check, a reference-count update and usually a heap allocation (`2 + 3` builds an int object). C pays none of that for an `int` add. The gap shrinks when the loop body is one call into compiled code (`sum`, `sorted`, NumPy).'],
    ['What "dynamic" costs and buys', 'It costs speed and moves errors from build time to run time. It buys duck typing, no build step, REPL-driven exploration, easy monkey-patching and tiny glue code. A senior answer names both sides instead of picking a team.'],
    ['Know the 3.11+ story', 'CPython 3.11 added a specialising adaptive interpreter: hot bytecodes rewrite themselves to type-specific fast paths (for example an int-add after seeing two ints). 3.13 added an experimental JIT and an experimental free-threaded build. The model above still holds; only the constants changed.'],
  ],
  edges: [
    ['A typo in a branch that never runs', 'Python compiles it fine and raises `NameError` only if the line executes. Mitigate with tests, a linter (`pyflakes`, `ruff`) and a type checker (`mypy`, `pyright`).'],
    ['Syntax errors vs everything else', 'Syntax and indentation errors are found at compile time, before any line runs. A name error, type error or attribute error is found at run time.'],
    ['Stale `.pyc` files', 'CPython checks the source mtime and size stored in the `.pyc` header (or a source hash in hash-based pycs) and recompiles when it differs. Deleting `__pycache__` is always safe.'],
    ['`a + b` meaning depends on the objects', 'ints add, strings concatenate, lists join, and `int + str` raises `TypeError`. The decision is made on each execution by looking at the operands.'],
    ['Mixed-type arithmetic in C', 'C silently converts (`int + char`, signed vs unsigned comparisons) and may overflow with undefined behaviour. Python refuses mixed kinds it does not know, and its ints never overflow.'],
    ['Performance cliffs', 'A pure-Python inner loop over millions of items is 10 to 100 times slower than C. Moving the loop into a built-in, NumPy, or an extension is the usual fix before rewriting in another language.'],
    ['Portability', 'A `.pyc` is portable across machines for the same Python minor version, a C binary is not portable across CPU or OS. Bytecode format changes between minor versions, so do not ship `.pyc` as a stable artifact.'],
  ],
  cost: [
    ['C: x = a + b (ints)', '~1 instr', 'Typed add on registers. No allocation, no checks beyond what the CPU does.'],
    ['Python: x = a + b (small ints)', '~50-100 ns', 'Several bytecodes, type dispatch, possibly allocating a new int. A specialised int-add in 3.11+ trims this.'],
    ['Compile to bytecode', 'O(source)', 'Paid once per module import, cached in `__pycache__`. A script you run directly is compiled on every run, only its imports are cached.'],
    ['Startup of the interpreter', '~10-30 ms', 'Why short scripts feel slow in Python and why `python -X importtime` exists.'],
    ['C build step', 'seconds to minutes', 'Paid on every change. Python has none, which is a big part of its iteration speed.'],
  ],
  internals: [
    ['What the VM loop does', 'The eval loop fetches an instruction, jumps to its handler, pops operands from a value stack, performs the operation, and pushes the result. `import dis; dis.dis(f)` prints the instructions: `LOAD_FAST`, `LOAD_CONST`, `BINARY_OP`, `STORE_FAST`, `RETURN_VALUE`.'],
    ['Locals are not dict lookups in functions', 'Inside a function, local variables live in a fixed array and are reached by index (`LOAD_FAST`). At module level, names are entries in the module dict (`LOAD_NAME`, `LOAD_GLOBAL`), which is why code inside functions is faster than the same code at the top of a file.'],
    ['Other implementations', 'PyPy has a tracing JIT and often runs loops many times faster, with a different memory model. Cython and Numba compile marked code to machine code. MicroPython targets microcontrollers. "Python" is a language, CPython is one implementation.'],
    ['Why C extensions are fast', 'NumPy, `re`, `json`, `sorted` and most of the standard library are written in C. A Python loop that makes one call per million items spends its time in C, not in the eval loop.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Is Python compiled or interpreted?',
      a: 'Both. CPython compiles source to bytecode (cached in `__pycache__`), then a virtual machine interprets the bytecode. So the better question is what is compiled to what, and when. C is compiled ahead of time to machine code that the CPU runs directly.',
      follow: [
        ['So why is Python slower?', 'Each bytecode instruction has overhead the C version does not: dispatch, type checks on the operands, reference counting and often an allocation. C settles types at build time and emits a plain machine add.'],
        ['Does that mean a typed Python would be fast?', 'Type hints are ignored at run time, so no by themselves. They help tools. Speed comes from implementations that use type information (Cython, Numba, mypyc) or from specialising interpreters that learn types from execution (3.11+).'],
      ],
    },
    {
      lvl: 'mid',
      q: 'You find `NameError` in production in a code path that tests never hit. How do you stop that class of bug?',
      a: 'Python resolves names when a line runs, so unexecuted branches are unchecked. Layers: unit tests that cover branches, a linter (`ruff`, `pyflakes`) which flags undefined names statically, and a type checker. In CI, fail the build on lint and type errors, and track branch coverage.',
      follow: [
        ['Linters cannot catch everything. What do they miss?', 'Anything depending on run-time values: attribute access on dynamically built objects, `getattr` with computed names, `eval`, and wrong types flowing through untyped code. Type hints plus a strict checker catch much of the last one; tests catch the rest.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'A hot loop in your Python service is too slow. Walk me through what you try, in order.',
      a: '1. Measure first (`cProfile`, `py-spy`, `timeit`). 2. Fix the algorithm and data structure (a set instead of a list scan beats any constant factor). 3. Remove work from the loop: hoist invariants, use built-ins and comprehensions that run in C. 4. Vectorise with NumPy if the data is numeric. 5. Cache with `functools.lru_cache`. 6. Only then consider PyPy, Cython/Numba, or moving the hot function to C, Rust or another service.',
      follow: [
        ['When would you not use NumPy?', 'When data is small or irregular (ragged, many types, branching per element). Conversion overhead and loss of readability outweigh the gain, and a plain loop in C-implemented built-ins is fine.'],
        ['What does the GIL change about this?', 'CPU-bound threads in CPython do not run Python bytecode in parallel (3.13 has an experimental free-threaded build). Use `multiprocessing` or `concurrent.futures.ProcessPoolExecutor` for CPU work, threads or `asyncio` for I/O waits, and note that C extensions can release the GIL.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain what `python script.py` does from the moment you press Enter.',
      a: 'The interpreter starts, initialises built-ins and `sys`, reads the file, compiles it to a code object (parse to AST, then bytecode), and executes it as the `__main__` module. Imports found along the way are located via `sys.path`, compiled if there is no valid `.pyc`, cached in `__pycache__`, and executed once, then stored in `sys.modules`. The main script itself is compiled every run and not cached.',
      diagram: {
        title: 'Your script',
        main: [
          ['Interpreter starts', 'Sets up the built-ins and `sys` (including `sys.path`, the list of folders searched for imports).'],
          ['Read the file', '`script.py` is read as plain text.'],
          ['Parse to an AST', 'The text becomes a tree that describes the program. Syntax errors stop here.', 'warn'],
          ['Compile to bytecode', 'The tree becomes a code object. This happens on every run and is not cached for the main script.', 'warn'],
          ['Run as `__main__`', 'The bytecode executes top to bottom. Each `import` it meets follows the import path below.'],
        ],
        branch: {
          title: 'Import path: each `import` it meets',
          steps: [
            ['Already in `sys.modules`?', 'Yes: reuse it and stop. Importing the same module twice runs it only once.', 'ask'],
            ['Find it on `sys.path`', 'The first matching file wins.'],
            ['Valid `.pyc` in `__pycache__`?', 'Yes: load the saved bytecode. No: parse and compile it, then save the `.pyc`.', 'ask'],
            ['Run it once', 'The module body executes top to bottom, so circular imports can see a half-finished module.', 'cache'],
            ['Store it in `sys.modules`', 'Later imports of the same name reuse this object.', 'cache'],
          ],
        },
      },
      follow: [
        ['What breaks if two modules import each other?', 'What "half-executed" means: Python records a module in `sys.modules` the moment it starts running it, not when it finishes. Say `a.py` starts with `import b`, and `b.py` starts with `from a import hello`, where `hello` is defined further down in `a.py`. When `main.py` runs `import a`, Python registers `a` and runs it line by line. Line 1 imports `b`, so `a` is paused there while `b` runs. `b` asks for `a`, finds it already registered, and does not run it again. But `a` is only at line 1, so `hello` has not been defined yet. That unfinished `a` is the half-executed module. The second import finds the first only half-executed in `sys.modules`, so names defined later in the first module do not exist yet, causing `ImportError` or `AttributeError`. Fix by moving imports into functions, restructuring shared code into a third module, or importing the module rather than names from it.', {
          caption: 'A circular import, one line at a time',
          title: 'What happens',
          main: [
            ['`main.py` runs `import a`', 'Python registers an empty module `a` in `sys.modules`, then starts running `a.py`.'],
            ['`a.py` line 1: `import b`', '`a` pauses here. Nothing below line 1 has run, so `hello` does not exist yet.', 'warn'],
            ['Python registers `b` and runs `b.py`', '`b.py` line 1 is `from a import hello`.'],
            ['`b` finds `a` already in `sys.modules`', 'It does not run `a` again, so it gets the half-finished `a`.', 'ask'],
            ['`hello` is missing, so it fails', '`ImportError: cannot import name hello from partially initialized module a`. With `import a` and `a.hello()` at the top of `b`, the error is `AttributeError`.', 'warn'],
          ],
          branch: {
            title: 'Three ways out',
            steps: [
              ['Import inside the function', 'Put `import a` inside the function that needs it. It runs later, after `a` has finished loading.'],
              ['Move the shared code to a third module', '`c.py` holds what both need, and `a` and `b` both import `c`. No cycle is left.', 'cache'],
              ['Import the module, not the names', 'Write `import a` and use `a.hello()` later, not at import time. The name is looked up when called, by which time `a` is complete.'],
            ],
          },
        }],
      ],
    },
    {
      lvl: 'staff',
      q: 'When is "compiled" the wrong word for C?',
      a: 'Two common cases. C code can be interpreted (Cling, tcc `-run`), and a C compiler does not always emit what you wrote: optimisation may remove, reorder or transform code that relies on undefined behaviour (signed overflow, out-of-bounds reads). So "C does what you say" is false; C does what the abstract machine allows, and the compiler assumes you never trigger UB. Python has no UB in that sense: every operation has a defined result or raises.',
      follow: [
        ['What does UB mean here?', 'UB is undefined behaviour: code the C language gives no meaning to. The standard does not say what must happen, so anything may: a crash, a wrong answer, or code that seems to work today and breaks with the next compiler or optimisation level. Common causes are signed integer overflow (`INT_MAX + 1`), reading past the end of an array, using a pointer after `free`, dereferencing a null pointer, and reading a variable you never set. The key point is that the compiler is allowed to assume UB never happens. It uses that assumption to delete checks and reorder code, so a bug that is "just" an overflow can change code far away. Python avoids this: every operation either has a defined result or raises an exception.'],
        ['Give a concrete example.', '`for (int i = 0; i >= 0; i++)` can be compiled as an infinite loop, because signed overflow is UB and the compiler may assume `i` never becomes negative. In Python the same loop would just keep growing an int.'],
      ],
    },
  ],
};
