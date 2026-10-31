/* Lesson data: with statements and context managers (structure mode, Flow helper). */
(function () {
  var withScene = Flow.steps([
    { pl: 0, cl: 0, say: 'Resources such as files, connections and locks must be released even when something fails. In C that is the cleanup label and goto; in Python it is the with statement. Four steps: enter, body, error?, exit.', csay: 'FILE *f = fopen(path, "r");', add: [['a', 'enter', 1, 0], ['b', 'body', 2, 0], ['c', 'error?', 3, 0], ['d', 'exit', 4, 0]] },
    { pl: 0, cl: 0, say: 'with open(path) as f: calls open() and then f.__enter__(), which returns the file object bound to f.', csay: 'FILE *f = fopen(path, "r"); if (!f) return -1;', tag: [['a', 'done']], ptr: [['at', 'a', 'down']] },
    { pl: 1, cl: 2, say: 'The body runs: read, parse, whatever you need.', csay: 'process(f);', tag: [['b', 'cur']], ptr: [['at', 'b', 'down']] },
    { pl: 1, cl: 3, say: 'The body raises ValueError halfway through. Normal code would skip everything after the error, including the cleanup.', csay: 'if (bad) goto cleanup;', tag: [['c', 'bad']], ptr: [['at', 'c', 'down']] },
    { pl: 2, cl: 5, say: 'Python still calls f.__exit__(exc_type, exc, tb). The file closes, then the exception continues upward. That is the whole guarantee: exit runs on success, return and exception alike.', csay: 'cleanup: fclose(f);', tag: [['d', 'done']], ptr: [['at', 'd', 'down']] },
    { pl: 3, cl: 6, say: 'If __exit__ returns True the exception is suppressed. Do that only on purpose (contextlib.suppress); by default an error must stay visible.', csay: 'return rc;', unptr: ['at'] },
  ]);
  var own = Flow.steps([
    { pl: 0, cl: 0, say: 'You can write your own: the contextlib.contextmanager decorator turns a generator into a context manager. Code before yield is the enter part, code after it is the exit part.', csay: 'void timer_start(void); void timer_stop(void);', add: [['a', 'setup', 1, 0], ['b', 'yield', 2, 0], ['c', 'body', 3, 0], ['d', 'finally', 4, 0]] },
    { pl: 3, cl: 1, say: 'with timer("fetch"): starts the generator and runs until the first yield. Here it records the start time.', csay: 't0 = now();', tag: [['a', 'done']], ptr: [['at', 'a', 'down']] },
    { pl: 4, cl: 2, say: 'At yield control passes to your with body. The value after yield, if any, is what "as x" receives.', csay: 'do_work();', tag: [['b', 'cur'], ['c', 'cur']], ptr: [['at', 'c', 'down']] },
    { pl: 5, cl: 3, say: 'The body ends, normally or with an error, and the generator resumes after yield. Put the cleanup in a try/finally so it runs either way.', csay: 'printf("%s took %.2f\\n", name, now() - t0);', tag: [['d', 'done']], ptr: [['at', 'd', 'down']] },
    { pl: 6, cl: 4, say: 'Typical uses in AI work: time a call, hold a lock, open a database session, temporarily change a setting, or make sure a temporary file is deleted.', csay: 'return;', unptr: ['at'] },
  ]);
  window.LESSON = {
    id: 'context-managers', mode: 'ds',
    title: 'Context managers: with',
    lede: 'The with statement guarantees that cleanup code runs, whether the block ends normally, returns early or raises. An object that defines __enter__ and __exit__ (or a generator wrapped by contextlib.contextmanager) is a context manager. Files, locks, database sessions, HTTP sessions and timers all use it. It is the Python equivalent of the C pattern of one cleanup label that every error path jumps to, minus the chance of forgetting a path.',
    scenes: [
      { id: 'with', title: 'What with guarantees', blurb: 'Enter, run the body, then always exit, even after an exception.', trap: 'Opening a file or session without with and forgetting close on an error path (a leaked handle). Another trap: returning True from __exit__ swallows the exception and hides bugs.',
        pyCode: ['with open(path) as f:', '    data = f.read()', '# f is closed here, even if read() raised', 'print(f.closed)  # True'],
        cCode: ['FILE *f = fopen(path, "r");', 'if (!f) return -1;', 'int rc = process(f);', 'if (rc < 0) goto cleanup;', '/* ... */', 'cleanup:', '    fclose(f);', '    return rc;'],
        predict: { q: 'The body of a with block raises an exception. Is the file closed?', options: ['No, you must close it in except', 'Yes, __exit__ runs before the exception propagates', 'Only if you call close()'], answer: 1, why: 'The exit step is guaranteed; that is the point of the statement.' }, steps: withScene },
      { id: 'own', title: 'Writing your own with contextmanager', blurb: 'Code before yield is setup; code after yield (in finally) is cleanup.', trap: 'Forgetting try/finally around yield: if the body raises, the code after yield does not run unless it is in a finally block.',
        pyCode: ['import time', 'from contextlib import contextmanager', '@contextmanager', 'def timer(name):', '    t0 = time.perf_counter()', '    try:', '        yield', '    finally:', '        print(name, time.perf_counter() - t0)', 'with timer("fetch"):', '    do_work()'],
        cCode: ['double t0 = now();', 'do_work();', 'printf("%s took %.2f\\n", name, now() - t0);', '/* every early return must repeat the print */'],
        predict: { q: 'In a @contextmanager function, which code runs when the with body raises?', options: ['Nothing after yield', 'The finally block after yield, if you wrote one', 'Only the code before yield'], answer: 1, why: 'The exception is raised at the yield point; a try/finally around it still runs the cleanup.' }, steps: own },
    ],
    builtins: [
      ['with open(p) as f', 'Files close automatically.'],
      ['contextlib.contextmanager', 'Turn a generator into a context manager.'],
      ['contextlib.suppress(Err)', 'Deliberately ignore one error type.'],
      ['__enter__ / __exit__', 'The two methods a class defines to support with.'],
      ['threading.Lock()', 'with lock: holds and releases it safely.'],
      ['contextlib.ExitStack', 'Manage a variable number of context managers.'],
    ],
  };
})();
