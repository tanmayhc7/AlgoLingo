/* Interview depth: lis. */
window.DEPTH = {
  "thesis": "LIS finds the longest strictly increasing subsequence. The DP over end positions costs O(n^2); keeping the smallest possible tail per length and binary searching gives O(n log n).",
  "why": [
    [
      "Common pattern",
      "Appears in scheduling, nested envelopes and stacking problems."
    ],
    [
      "Two solutions",
      "Shows DP and the improved algorithm."
    ],
    [
      "Binary search in disguise",
      "A reusable trick."
    ],
    [
      "Reconstruction",
      "Tests whether you can recover the sequence."
    ]
  ],
  "edges": [
    [
      "Empty input",
      "Answer 0."
    ],
    [
      "Duplicates",
      "Strict versus non-decreasing changes bisect_left to bisect_right."
    ],
    [
      "All equal",
      "Strict answer is 1."
    ],
    [
      "Subsequence versus subarray",
      "Gaps are allowed."
    ]
  ],
  "cost": [
    [
      "DP",
      "O(n^2) time, O(n) space."
    ],
    [
      "Tails with bisect",
      "O(n log n) time, O(n) space."
    ],
    [
      "Reconstruct",
      "Store predecessor indexes, O(n) extra."
    ]
  ],
  "internals": [
    [
      "Invariant",
      "tails is always sorted, so binary search is valid."
    ],
    [
      "Exchange argument",
      "A smaller tail can never be worse than a larger one for the same length."
    ],
    [
      "Length only",
      "tails is not itself a valid subsequence."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Subsequence or subarray?",
      "a": "Subsequence: elements keep their order but need not be adjacent.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How do you reach O(n log n)?",
      "a": "Maintain tails and use binary search to place each element.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How would you return the sequence itself?",
      "a": "Store for each tail the index of its element and a predecessor pointer, then walk back from the last tail.",
      "follow": []
    }
  ]
};
