/* Interview depth: monotonic-deque. */
window.DEPTH = {
  "thesis": "A monotonic deque keeps indexes with monotonically decreasing values so the front is always the window maximum. Each index is pushed and popped once, so sliding window maximum or minimum is O(n).",
  "why": [
    [
      "Linear time",
      "Beats the O(n log k) heap."
    ],
    [
      "Pattern reuse",
      "Also solves shortest subarray with a bound and some DP optimisations."
    ],
    [
      "Related idea",
      "The monotonic stack from chapter 9."
    ],
    [
      "Interview favourite",
      "Hard problem that has a short answer."
    ]
  ],
  "edges": [
    [
      "k = 1 or k >= n",
      "Handle trivial windows."
    ],
    [
      "Equal values",
      "Pop on <= to keep indexes unique and the deque strict, or on < if you prefer."
    ],
    [
      "Expiry check",
      "Compare the front index with i - k."
    ],
    [
      "Empty array",
      "Return an empty list."
    ]
  ],
  "cost": [
    [
      "Time",
      "O(n)."
    ],
    [
      "Space",
      "O(k) for the deque plus O(n) output."
    ],
    [
      "Naive scan",
      "O(nk)."
    ]
  ],
  "internals": [
    [
      "Invariant",
      "Values at deque indexes are strictly decreasing."
    ],
    [
      "Why discard",
      "A smaller earlier element can never beat a larger later one in any window containing both."
    ],
    [
      "Amortised",
      "Total pops are bounded by total pushes."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why store indexes?",
      "a": "To know when the front has left the window.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Why is it O(n) with a loop inside a loop?",
      "a": "Each index is popped at most once, so inner loop work amortises to O(n).",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How would you do window minimum or sum?",
      "a": "Minimum: increasing deque. Sum: use a prefix sum or a running total, no deque needed.",
      "follow": []
    }
  ]
};
