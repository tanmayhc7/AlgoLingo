/* Interview depth: bitmask-dp. */
window.DEPTH = {
  "thesis": "Bitmask DP represents a subset of up to about 20 items as the bits of an integer and uses it as part of the DP state. Travelling salesman (Held-Karp) runs in O(2^n n^2) instead of n! by remembering the best route per (visited set, last city).",
  "why": [
    [
      "Exact solutions",
      "For small n where greedy is wrong."
    ],
    [
      "Bit tricks",
      "Combines chapter 2 with DP."
    ],
    [
      "Classic problems",
      "TSP, assignment, partition into groups."
    ],
    [
      "Complexity talk",
      "Exponential but practical to n about 20."
    ]
  ],
  "edges": [
    [
      "Large n",
      "2^n explodes beyond about 25."
    ],
    [
      "Unreached states",
      "Use infinity, not 0."
    ],
    [
      "Operator precedence",
      "Parenthesise shifts and masks in C; in Python (mask >> j) & 1."
    ],
    [
      "Start state",
      "dp[1][0] = 0 and a mask that includes the start."
    ]
  ],
  "cost": [
    [
      "Time",
      "O(2^n * n^2) for TSP."
    ],
    [
      "Space",
      "O(2^n * n)."
    ],
    [
      "Subset enumeration",
      "O(2^n)."
    ]
  ],
  "internals": [
    [
      "Mask as set",
      "Union is OR, intersection is AND, difference is AND NOT."
    ],
    [
      "Order",
      "Masks increase, so subsets are computed before supersets."
    ],
    [
      "Submask loop",
      "sub = (sub - 1) & mask enumerates submasks."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "How do you check whether item i is in the mask?",
      "a": "(mask >> i) & 1.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Why does Held-Karp beat brute force?",
      "a": "It remembers the best cost per (set, last city) instead of re-exploring every permutation.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "What limits bitmask DP?",
      "a": "2^n states: practical up to about n = 20 to 25 depending on the per-state work and memory.",
      "follow": []
    }
  ]
};

/* design-why */
window.DEPTH.design = [
 [
  "Why bitmask DP exists",
  "Some problems need to remember which items from a small set are used (visited cities, assigned tasks). A bitmask stores that subset in one integer, so subsets become array indexes and the state can be a table entry."
 ],
 [
  "Why it is limited to small n",
  "There are 2^n subsets, so 20 items give about a million states and 30 give a billion. The method is exact, but exponential, which is why n is usually at most about 20."
 ],
 [
  "Why bit operations do the bookkeeping",
  "`mask | (1 << i)` adds an item, `mask & (1 << i)` tests one and `mask ^ (1 << i)` removes one. Each takes one step, and the whole subset moves as one value."
 ],
 [
  "Why it beats brute force on problems like the travelling salesman",
  "Brute force tries n! orders. DP over subsets reuses the best cost for each (visited set, last city), giving O(2^n · n²), far smaller than n! for n around 20."
 ]
];
