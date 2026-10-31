/* Interview depth: boyer-moore. */
window.DEPTH = {
  "thesis": "Boyer-Moore voting finds the only possible majority element (more than n/2 occurrences) in one pass and O(1) space by cancelling pairs of different values; a second pass verifies it.",
  "why": [
    [
      "Constant memory",
      "Beats counting with a hash map."
    ],
    [
      "Streaming",
      "Works on data you cannot store."
    ],
    [
      "Clever invariant",
      "Cancelling pairs."
    ],
    [
      "Generalises",
      "Heavy hitters with k - 1 counters (Misra-Gries)."
    ]
  ],
  "edges": [
    [
      "No majority",
      "The candidate must be verified."
    ],
    [
      "Empty array",
      "Return None."
    ],
    [
      "Exactly n/2",
      "Not a majority."
    ],
    [
      "Two answers",
      "Impossible for more than n/2."
    ]
  ],
  "cost": [
    [
      "Time",
      "O(n), two passes."
    ],
    [
      "Space",
      "O(1)."
    ],
    [
      "Hash map alternative",
      "O(n) time, O(n) space."
    ]
  ],
  "internals": [
    [
      "Invariant",
      "The remaining multiset plus cancelled pairs equals the input."
    ],
    [
      "Candidate",
      "Only meaningful if a majority exists."
    ],
    [
      "Misra-Gries",
      "Keeps k - 1 counters to find items above n/k."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What is a majority element?",
      "a": "One that appears more than n/2 times.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Why does it need a second pass?",
      "a": "The first pass returns a candidate even when no majority exists.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How would you find items above n/3?",
      "a": "Keep two candidates and counters (Misra-Gries), then verify both.",
      "follow": []
    }
  ]
};
