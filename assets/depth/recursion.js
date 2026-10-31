/* Interview depth: recursion. */
window.DEPTH = {
  "thesis": "A recursive function has a base case, a call on a smaller input and a combine step. The call stack holds one frame per active call, so recursion costs O(depth) space and is limited by Python's recursion limit (about 1000) or the C stack.",
  "why": [
    [
      "Natural fit",
      "Trees, graphs, backtracking, divide and conquer and DP all start as recursion."
    ],
    [
      "Interview staple",
      "Expect to write it and analyse its stack depth."
    ],
    [
      "Reasoning tool",
      "Define the answer for the smaller case, then build on it."
    ],
    [
      "Foundation",
      "Memoisation and backtracking build on it."
    ]
  ],
  "edges": [
    [
      "Missing base case",
      "Infinite recursion until RecursionError or a crash."
    ],
    [
      "Not shrinking",
      "The argument must move toward the base case."
    ],
    [
      "Repeated work",
      "fib(n) = fib(n-1) + fib(n-2) recomputes subproblems: add a cache."
    ],
    [
      "Mutable arguments",
      "Copy lists before changing them, or undo changes on the way back."
    ]
  ],
  "cost": [
    [
      "Time",
      "Number of calls times work per call."
    ],
    [
      "Space",
      "O(depth) for frames, even with no data structure."
    ],
    [
      "Naive fib",
      "O(2^n) calls; O(n) with memoisation."
    ]
  ],
  "internals": [
    [
      "Call frame",
      "Return address, parameters and locals; one per active call."
    ],
    [
      "Stack versus heap",
      "Frames live on the stack; objects live on the heap."
    ],
    [
      "Tail calls",
      "Python and C compilers at -O2 may not remove them; Python never does."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What are the two parts of every recursive function?",
      "a": "A base case that returns directly, and a recursive case that calls itself on a smaller input.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How would you avoid RecursionError on a very deep input?",
      "a": "Convert to a loop with an explicit stack, or restructure (for example iterate a linked list instead of recursing).",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "What does recursion cost?",
      "a": "O(depth) stack space plus per-call overhead; for repeated subproblems memoise so the call count drops from exponential to polynomial.",
      "follow": []
    }
  ]
};
