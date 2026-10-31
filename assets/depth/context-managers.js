/* Interview depth: context-managers. */
window.DEPTH = {
  "thesis": "A with statement guarantees cleanup: an object with __enter__ and __exit__ (or a generator decorated with contextlib.contextmanager) sets up on entry and tears down on exit, whether the block finishes, returns or raises. It is used for files, locks, HTTP sessions, database transactions and timers.",
  "why": [
    [
      "Leak-proof resources",
      "Files, connections and locks are released on every path."
    ],
    [
      "Cleaner than finally",
      "The setup and teardown live in one reusable place."
    ],
    [
      "Used everywhere",
      "open, threading.Lock, tempfile, sessions and transactions."
    ],
    [
      "Interview staple",
      "Explain how with works and write one with contextmanager."
    ]
  ],
  "edges": [
    [
      "Suppressing errors",
      "If __exit__ returns True the exception is swallowed; do it only deliberately."
    ],
    [
      "Missing finally",
      "In @contextmanager code after yield runs on error only if inside try/finally."
    ],
    [
      "Using a closed file",
      "Reading after the with block raises ValueError."
    ],
    [
      "Multiple resources",
      "with a() as x, b() as y: closes in reverse order."
    ],
    [
      "Async variants",
      "async with for async resources (httpx.AsyncClient)."
    ],
    [
      "Return value of __enter__",
      "The as target is what __enter__ returns, not necessarily self."
    ]
  ],
  "cost": [
    [
      "Overhead",
      "A method call on entry and exit; negligible."
    ],
    [
      "Correctness gain",
      "Prevents leaked handles, deadlocks and half-written files."
    ],
    [
      "ExitStack",
      "Handles a dynamic number of resources."
    ],
    [
      "Nested with",
      "Same cost, clearer than manual nesting."
    ]
  ],
  "internals": [
    [
      "Protocol",
      "with X as v: calls X.__enter__() then the body then X.__exit__(type, value, traceback)."
    ],
    [
      "contextmanager",
      "Wraps a generator: yield marks the body; an exception is thrown into the generator at yield."
    ],
    [
      "C equivalent",
      "A single cleanup label that every error path jumps to, or RAII in C++."
    ],
    [
      "Exit order",
      "Context managers unwind last in, first out."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why use with open(...)?",
      "a": "The file is closed automatically when the block ends, even after an exception.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Write a timer context manager.",
      "a": "Use @contextmanager: record the start, yield inside try, and in finally print the elapsed time with time.perf_counter().",
      "follow": [
        [
          "What if the body raises?",
          "The exception is thrown in at yield; finally still runs, and the exception continues unless you suppress it."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "What does __exit__ receive and return?",
      "a": "The exception type, value and traceback (all None on success). Returning a true value suppresses the exception; normally return None.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Design a context manager for a database transaction.",
      "a": "Enter: begin. Exit: commit if no exception, otherwise rollback and re-raise. Always release the connection in finally. Offer an async version for async drivers.",
      "follow": []
    }
  ]
};
