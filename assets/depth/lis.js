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

/* design-why */
window.DEPTH.design = [
 [
  "Why LIS exists",
  "It is a clean example of a DP problem with a smarter solution: the O(n²) table says \"best length ending at i\", and a second approach reaches O(n log n) with binary search."
 ],
 [
  "Why the `tails` array is sorted",
  "`tails[k]` holds the smallest possible ending value of an increasing subsequence of length k+1. A smaller tail is always at least as good for extending later, and these tails increase with k, so the array stays sorted."
 ],
 [
  "Why binary search finds the place to update",
  "A new number either extends the longest subsequence (append) or replaces the first tail that is not smaller, which keeps every tail as small as possible. Finding that spot in a sorted array is a binary search."
 ],
 [
  "Why `tails` is not the subsequence itself",
  "It tracks the best possible endings, not one real sequence, so its contents can mix elements from different candidates. Only its length is the answer. To rebuild a real subsequence, keep parent links."
 ]
];
