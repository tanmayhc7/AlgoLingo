/* Interview depth: threads-gil. */
window.DEPTH = {
  "thesis": "The GIL lets one thread run Python bytecode at a time, so threads speed up I/O-bound programs but not CPU-bound ones. For CPU-bound work use processes or native code, and always protect shared mutable state with a lock.",
  "why": [
    [
      "Choose correctly",
      "Wrong tool means no speed-up or extra overhead."
    ],
    [
      "Race conditions",
      "Read-modify-write on shared data is unsafe even with the GIL."
    ],
    [
      "Interview staple",
      "Explain the GIL and when threads help."
    ],
    [
      "AI work",
      "API fan-out uses threads or asyncio; local preprocessing uses processes."
    ]
  ],
  "edges": [
    [
      "Not atomic",
      "count += 1 and check-then-act sequences need a Lock."
    ],
    [
      "Deadlock",
      "Acquire multiple locks in a fixed order."
    ],
    [
      "Process startup",
      "Spawn cost and pickling can exceed the task time."
    ],
    [
      "Daemon threads",
      "Killed abruptly at exit; join important threads."
    ]
  ],
  "cost": [
    [
      "Thread start",
      "Microseconds to a millisecond, shared memory."
    ],
    [
      "Process start",
      "Tens of milliseconds, separate memory."
    ],
    [
      "Context switch",
      "Slice of about 5 ms by default."
    ]
  ],
  "internals": [
    [
      "Eval loop",
      "The GIL is released every few ms and around blocking system calls."
    ],
    [
      "Reference counts",
      "The GIL protects them; removing it needs other schemes."
    ],
    [
      "Free threading",
      "Python 3.13 added an optional build without the GIL."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What is the GIL?",
      "a": "A lock in CPython that allows only one thread to execute Python bytecode at a time.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "100 API calls: threads or processes?",
      "a": "Threads or asyncio: the work is I/O-bound and the GIL is released while waiting.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Why is count += 1 unsafe with the GIL?",
      "a": "It compiles to several bytecodes; a thread switch between read and write loses updates, so use a Lock or an atomic structure such as queue.Queue.",
      "follow": []
    }
  ]
};

/* design-why */
window.DEPTH.design = [
 [
  "Why the GIL exists",
  "CPython tracks object lifetimes with reference counts, and updating them from two threads at once would corrupt memory. One global lock makes that safe and simple, and it made C extensions easy to write."
 ],
 [
  "Why threads still help with I/O",
  "A thread releases the lock while it waits for the network or disk, so other threads run during the wait. For programs that mostly wait, threads give real speed-ups."
 ],
 [
  "Why CPU-heavy work uses processes",
  "Threads take turns on one interpreter, so computation does not run in parallel. Separate processes each have their own interpreter and lock, at the cost of copying data between them."
 ],
 [
  "Why race conditions still happen with a GIL",
  "The lock protects the interpreter's own state, not your logic. `count += 1` is several steps, and a thread switch in the middle loses an update, so shared data still needs a `Lock` or a queue."
 ]
];
