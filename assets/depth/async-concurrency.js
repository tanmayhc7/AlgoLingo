/* Interview depth: async-concurrency. */
window.DEPTH = {
  "thesis": "asyncio runs many waiting tasks on one thread: a coroutine pauses at await and the event loop runs another. gather starts several together, a semaphore caps how many run at once, and wait_for adds a timeout. It speeds up I/O-bound work (network calls to models and APIs) and does nothing for CPU-bound work, which needs processes.",
  "why": [
    [
      "Many model calls",
      "Batch jobs over thousands of tickets finish in minutes instead of hours."
    ],
    [
      "Rate limits",
      "A semaphore keeps you under the provider's concurrency cap."
    ],
    [
      "Responsive services",
      "Handling many requests with few threads."
    ],
    [
      "Common interview topic",
      "Explaining the event loop, await and the difference from threads is a standard question."
    ]
  ],
  "edges": [
    [
      "Blocking calls",
      "requests.get or time.sleep inside async code freezes the whole loop; use async clients and asyncio.sleep."
    ],
    [
      "Forgotten await",
      "Calling an async function without await returns a coroutine object that never runs."
    ],
    [
      "One failure cancels gather",
      "Use return_exceptions=True, or handle errors inside each task."
    ],
    [
      "Unbounded tasks",
      "Creating 100,000 tasks at once exhausts memory or hits limits; use a semaphore or batches."
    ],
    [
      "asyncio.run twice",
      "Call it once at the top level; inside a notebook a loop may already be running."
    ],
    [
      "Shared state",
      "No threads, but a task can still be interrupted at an await; keep critical sections free of awaits."
    ]
  ],
  "cost": [
    [
      "N waits of t seconds",
      "About t with gather, N x t serially."
    ],
    [
      "Memory per task",
      "Small (kilobytes), far cheaper than a thread."
    ],
    [
      "CPU-bound work",
      "No speedup; use multiprocessing or an executor."
    ],
    [
      "Semaphore of k",
      "Throughput up to k concurrent calls."
    ]
  ],
  "internals": [
    [
      "Event loop",
      "Runs ready tasks; when a task awaits I/O it yields, and the loop resumes it when the OS reports readiness (epoll, kqueue)."
    ],
    [
      "Coroutines",
      "async def functions return objects that run when awaited or scheduled."
    ],
    [
      "Threads versus asyncio",
      "Threads switch anywhere (needs locks); asyncio switches only at await."
    ],
    [
      "GIL",
      "Only one thread runs Python bytecode at a time, so threads do not speed up CPU-bound Python."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What does await do?",
      "a": "It pauses the current coroutine until the awaited result is ready and lets the event loop run other tasks meanwhile.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Run 1,000 API calls with at most 10 in flight.",
      "a": "Create an asyncio.Semaphore(10); each task does async with sem: await call(i); gather all tasks. Handle errors per task.",
      "follow": [
        [
          "What if one raises?",
          "gather raises the first exception by default; use return_exceptions=True or catch inside the task."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "asyncio, threads or processes?",
      "a": "asyncio for many I/O waits with async libraries; threads for blocking I/O libraries; processes for CPU-bound work because of the GIL.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Your async service stalls under load. What do you check?",
      "a": "A blocking call in a coroutine (sync HTTP, file or CPU work), unbounded task creation, a missing timeout, or a semaphore that is too large. Profile with debug mode and move blocking work to run_in_executor.",
      "follow": []
    }
  ]
};
