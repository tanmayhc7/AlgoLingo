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

/* design-why */
window.DEPTH.design = [
 [
  "Why a Bloom filter exists",
  "Checking whether an item is in a huge set may need disk or network access. A Bloom filter uses a few bits per item to answer \"definitely not present\" or \"possibly present\" in O(1) and with no access to the data."
 ],
 [
  "Why it has false positives but no false negatives",
  "Adding an item sets several bits. If any of those bits is 0 on a check, the item was never added, so \"no\" is always right. If all are 1, other items may have set them, so \"yes\" can be wrong."
 ],
 [
  "Why you cannot delete from one",
  "A bit may be shared by several items, so clearing it could make other items disappear. A counting Bloom filter keeps small counters instead of bits to allow deletes, at the cost of space."
 ],
 [
  "Why it saves work in real systems",
  "Databases check one before reading disk, and browsers or caches use them to skip lookups. A rare false positive costs one extra check, while every true negative saves an expensive one."
 ]
];
