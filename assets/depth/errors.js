/* Interview depth: Errors and tracebacks. */
window.DEPTH = {
  thesis:
    'Python signals problems with exceptions that unwind the stack until a handler catches them. The senior-level skill is not syntax; it is deciding what to catch, where, and what to do next: catch narrow errors you can actually handle, let the rest propagate with their context, and always release resources. Reading a traceback bottom-up is the other half.',
  why: [
    ['Exceptions are control flow with a type', 'Raising unwinds frames until a matching `except` is found; if none is, the program prints a traceback and exits. The handler is chosen by class, through the hierarchy, so the order of `except` clauses matters (first match wins).'],
    ['Catch what you can handle', 'A handler should either recover, translate (raise a better error with `raise NewError(...) from e`), or add context and re-raise. Catching `Exception` and printing hides bugs. A bare `except:` also swallows `KeyboardInterrupt` and `SystemExit`.'],
    ['Guarantee cleanup with `with` and `finally`', '`finally` runs on success, on exception and on `return`. A `with` statement is `try/finally` with a protocol (`__enter__`/`__exit__`) and is the idiom for files, locks, connections and temporary state.'],
    ['EAFP versus LBYL', '"Easier to ask forgiveness than permission" (`try: d[k]`) avoids races (a file can vanish between a check and an open) and double lookups. "Look before you leap" (`if k in d`) reads better when failure is common. Choose on whether the failure is the exceptional case.'],
  ],
  edges: [
    ['Bare `except:`', 'Catches `KeyboardInterrupt`, `SystemExit` and `GeneratorExit`, so Ctrl-C stops working. Use `except Exception:` at the very least, and a specific class where possible.'],
    ['Order of `except` clauses', 'A broad clause before a specific one makes the specific one unreachable. Put subclasses first.'],
    ['`return` inside `finally`', 'Overrides any exception in flight and discards it silently. Avoid it.'],
    ['Exception inside `except`', 'A new exception during handling is chained: `__context__` shows the original. Use `raise ... from e` to mark a deliberate translation and `from None` to hide the chain.'],
    ['Swallowing errors', '`except Exception: pass` turns bugs into silent wrong answers. If you must ignore, narrow the class and use `contextlib.suppress(FileNotFoundError)`.'],
    ['`KeyError` versus `.get`', 'Missing keys are common. Use `.get(k, default)` when absence is normal, and let `KeyError` bubble when it signals a bug.'],
    ['`assert` is not validation', 'Stripped under `-O`. Raise `ValueError` or `TypeError` for bad input. Asserts are for "this cannot happen" internal invariants.'],
    ['`StopIteration` inside a generator', 'Since 3.7 it is converted into `RuntimeError`. Return from the generator instead of raising it.'],
    ['Exceptions in threads and tasks', 'An exception in a thread does not stop the main thread; it prints and the thread ends. In `asyncio`, an exception in a task not awaited is only reported when the task is garbage collected. Always await or add a done callback.'],
    ['Catching too much code', 'Keep the `try` body to the single risky statement. A large body can catch an unrelated error from another line and mislead you.'],
    ['Exception groups', '3.11 added `ExceptionGroup` and `except*` for concurrent failures (for example from `asyncio.TaskGroup`).'],
  ],
  cost: [
    ['try block with no exception', '~0', 'Zero-cost since 3.11: no runtime work unless an exception is raised.'],
    ['raising and catching an exception', '~1 microsecond', 'Creating the exception, capturing the traceback and unwinding is hundreds of times slower than a branch. Fine for rare events, wrong as the common path of a hot loop.'],
    ['EAFP when failure is rare', 'faster', 'One lookup instead of check then access.'],
    ['EAFP when failure is common', 'slower', 'Exceptions cost more than an `if`. Use LBYL or `.get`.'],
    ['traceback formatting', 'O(depth)', 'Only paid when printed or logged.'],
  ],
  internals: [
    ['The hierarchy', '`BaseException` is the root. `Exception` is the base for ordinary errors. `KeyboardInterrupt`, `SystemExit` and `GeneratorExit` derive from `BaseException` directly, so `except Exception` leaves Ctrl-C and `sys.exit()` working. `LookupError` covers `IndexError` and `KeyError`; `ArithmeticError` covers `ZeroDivisionError` and `OverflowError`.'],
    ['Tracebacks', 'Each frame the exception passes through is added to `__traceback__`. The last line of the printed traceback is the error; the line above is where it was raised; earlier frames show callers. Chained errors show "The above exception was the direct cause of..." (explicit `from`) or "During handling of the above exception, another exception occurred" (implicit context).'],
    ['`with` expands to try/finally', '`with A() as a: body` calls `__enter__`, runs the body, and always calls `__exit__(type, value, tb)`. If `__exit__` returns true, the exception is suppressed. `contextlib.contextmanager` lets a generator play that role.'],
    ['Custom exceptions', 'Subclass `Exception` (or a domain base such as `AppError`), give a clear name, and carry data as attributes. Library code exposes one base class so callers can catch everything from your package without catching everything else.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What is the difference between `except Exception` and a bare `except`?',
      a: 'A bare `except:` catches every `BaseException`, including `KeyboardInterrupt` and `SystemExit`, so you cannot stop the program with Ctrl-C and `sys.exit()` is swallowed. `except Exception` catches ordinary errors only. Best is the narrowest class you can actually handle.',
      follow: [
        ['When is catching `Exception` acceptable?', 'At a boundary that must not crash (a request handler, a worker loop, a top-level CLI), where you log the full traceback with `logging.exception` and return an error response or continue.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What does `finally` guarantee and when does it not run?',
      a: 'It runs after the `try` (and any `except`/`else`) whether the block succeeded, raised, or returned. It does not run if the process is killed (`os._exit`, SIGKILL, power loss) or the interpreter crashes. A `return` or `break` inside `finally` replaces any pending exception.',
      follow: [
        ['What is the order of `try/except/else/finally`?', '`try` body; if it raises a matching exception, the `except` block; if it did not raise, the `else` block; then always `finally`. Put code that depends on success in `else`, so errors there are not caught by your `except`.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'How do you design error handling for a function that parses user input and writes to a database?',
      a: 'Validate early and raise specific, documented errors (`ValueError` or a domain `ValidationError`) with the offending value. Use `with` for the connection and a transaction so partial writes roll back. Catch database-specific errors only where you can act (retry on deadlock with a bounded backoff, translate to a domain error otherwise), log once at the boundary with context, and never leak raw internal errors to callers. Make writes idempotent so retries are safe.',
      follow: [
        ['What do you log, and where?', 'Log at the boundary that decides the outcome, not at every layer, to avoid duplicate noise. Include request id, operation and parameters (redacting secrets) and the traceback via `logging.exception`.'],
        ['Why not retry everything?', 'Non-transient errors (constraint violations, bad input) will fail again. Retries on those waste time and can hide bugs. Retry only classified transient errors, with jitter and a cap.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain `raise X from Y`, `raise X from None` and a bare `raise`.',
      a: '`raise X from Y` sets `X.__cause__ = Y`, showing the traceback as a deliberate chain ("direct cause"). `raise X from None` suppresses the chain display when the original is an implementation detail. A bare `raise` inside an `except` re-raises the current exception with its original traceback, which is the right way to log and propagate.',
      follow: [
        ['Why not `raise e` to re-raise?', 'It keeps the original traceback but adds an extra entry for the re-raise line, which is noise. A bare `raise` re-raises exactly what is being handled, and cannot go wrong if you rebound `e` meanwhile.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Read this traceback: the last line is `KeyError: "id"`, raised in `utils.py:42` called from `handler.py:17` called from `app.py:5`. How do you debug?',
      a: 'Read bottom-up: the error is a missing key `"id"` at `utils.py:42`. Look at that line to see which dict is indexed, then at the caller `handler.py:17` to see where the dict came from, and so on up. Reproduce with the failing input, add a test, then decide the fix: guard with `.get`, validate the payload at the boundary, or fix the producer that omitted the key.',
      follow: [
        ['What if the traceback is from a different thread or a library you do not own?', 'Look at the top-most frame that is your code, since the library frames show what it did with your data. For threads, ensure exceptions are captured (`concurrent.futures` stores them in the future) and logged with context.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'How do exceptions interact with resource cleanup in generators and async code?',
      a: 'A generator suspended at `yield` holds its `try/finally`; the `finally` runs when the generator is closed (`close()` raises `GeneratorExit` inside it) or garbage collected, which may be late. Use `with`/`contextlib` inside the generator and close it explicitly (or use `contextlib.closing`). In `asyncio`, cancellation is delivered as `CancelledError` at an `await`; handlers must not swallow it, and cleanup in `finally` may itself await, so protect it with `asyncio.shield` or timeouts when needed. Use `TaskGroup` (3.11+) so one failure cancels siblings and errors propagate as an `ExceptionGroup`.',
      follow: [
        ['Why must you re-raise `CancelledError`?', 'Swallowing it makes the task look alive when the caller asked it to stop, breaking timeouts and shutdown. Catch it only to clean up, then re-raise.'],
      ],
    },
  ],
};
