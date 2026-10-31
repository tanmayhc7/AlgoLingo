/* Interview depth: bloom-filter. */
window.DEPTH = {
  "thesis": "A Bloom filter is a compact bit array with k hash functions that answers \"possibly present\" or \"definitely absent\". It has no false negatives, tunable false positives, constant time operations and no way to list or delete items.",
  "why": [
    [
      "Tiny memory",
      "About 10 bits per item at 1% error."
    ],
    [
      "Fast rejection",
      "Skip disk or network lookups for unseen keys."
    ],
    [
      "Used in practice",
      "Databases, caches, crawlers, malware lists."
    ],
    [
      "Probabilistic thinking",
      "A common design-interview trade-off."
    ]
  ],
  "edges": [
    [
      "False positives",
      "Rate rises as the filter fills beyond its planned n."
    ],
    [
      "No deletion",
      "Use a counting filter or rebuild."
    ],
    [
      "Hash quality",
      "Poor or correlated hashes inflate errors."
    ],
    [
      "Cannot enumerate",
      "You cannot read items back."
    ]
  ],
  "cost": [
    [
      "add and check",
      "O(k), independent of n."
    ],
    [
      "Space",
      "m bits, about 1.44 n log2(1/p)."
    ],
    [
      "Merging",
      "Bitwise OR of two filters with the same m and k."
    ]
  ],
  "internals": [
    [
      "Double hashing",
      "Derive k hashes from two: h1 + i * h2."
    ],
    [
      "Fill ratio",
      "About half the bits are 1 at the optimal k."
    ],
    [
      "Blocked filters",
      "Keep the k bits in one cache line for speed."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Can a Bloom filter return a false negative?",
      "a": "No. An added item always has all its bits set.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How do you reduce false positives?",
      "a": "Use more bits per item and the optimal number of hashes, sized for the real n.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Where would you use one?",
      "a": "In front of a slow store: reject keys that are definitely absent before a disk or network read; accept occasional wasted lookups.",
      "follow": []
    }
  ]
};
