/* Interview depth: skip-list. */
window.DEPTH = {
  "thesis": "A skip list is a randomised sorted linked list with express lanes. Each key is promoted to the next lane with probability 1/2, so search, insert and delete are expected O(log n) and the code is simpler than a balanced tree.",
  "why": [
    [
      "Simple",
      "No rotations or rebalancing logic."
    ],
    [
      "Concurrency friendly",
      "Local pointer changes are easier to make lock-free."
    ],
    [
      "Ordered",
      "Range scans walk lane 0."
    ],
    [
      "Real systems",
      "Redis sorted sets and LevelDB."
    ]
  ],
  "edges": [
    [
      "Randomness",
      "Bounds hold in expectation, not in the worst case."
    ],
    [
      "Level cap",
      "Choose max level near log2 of the maximum number of keys."
    ],
    [
      "Duplicates",
      "Decide whether to update or allow equal keys."
    ],
    [
      "Memory",
      "About 2 pointers per key on average."
    ]
  ],
  "cost": [
    [
      "Search, insert, delete",
      "Expected O(log n), worst case O(n)."
    ],
    [
      "Space",
      "Expected O(n)."
    ],
    [
      "Range scan",
      "O(log n + k) for k results."
    ]
  ],
  "internals": [
    [
      "Lane structure",
      "next[] holds one pointer per lane the node belongs to."
    ],
    [
      "Update array",
      "Track the last node visited per lane during search to link or unlink."
    ],
    [
      "Geometric levels",
      "P(level >= k) = 2^-k."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why add express lanes?",
      "a": "They let search skip many nodes: drop down only when the next key is too large.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How is the height chosen?",
      "a": "Flip a fair coin until tails; the number of heads is the extra lanes.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Skip list versus balanced tree?",
      "a": "Simpler and more concurrency friendly, with expected rather than worst-case bounds and a few more pointers per key.",
      "follow": []
    }
  ]
};
