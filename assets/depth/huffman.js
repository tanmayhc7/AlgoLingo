/* Interview depth: huffman. */
window.DEPTH = {
  "thesis": "Huffman coding builds an optimal prefix code with a greedy heap: repeatedly merge the two lowest-weight nodes. Frequent symbols get short codes, no code is a prefix of another, and the result underlies zip, gzip and PNG compression.",
  "why": [
    [
      "Greedy proof example",
      "A textbook case where greedy is optimal."
    ],
    [
      "Heap practice",
      "Uses heapq in a new way."
    ],
    [
      "Real compression",
      "Part of DEFLATE and JPEG."
    ],
    [
      "Tree and recursion",
      "Combines both chapters 10 and 11."
    ]
  ],
  "edges": [
    [
      "One symbol",
      "Assign code \"0\"."
    ],
    [
      "Ties",
      "Break ties with a counter so tuples never compare nodes."
    ],
    [
      "Header",
      "The decoder needs the tree or the frequencies."
    ],
    [
      "Skewed data",
      "Codes can get long; limit lengths in practice."
    ]
  ],
  "cost": [
    [
      "Build",
      "O(k log k) for k distinct symbols."
    ],
    [
      "Encode",
      "O(n) bits."
    ],
    [
      "Space",
      "O(k) tree."
    ]
  ],
  "internals": [
    [
      "Prefix property",
      "Symbols live only at leaves."
    ],
    [
      "Optimality",
      "Any optimal tree has the two rarest symbols as deepest siblings."
    ],
    [
      "Canonical Huffman",
      "Store only code lengths; both sides regenerate the same codes."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why are frequent symbols given shorter codes?",
      "a": "It reduces the total bits, because they appear most often.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "What is a prefix code?",
      "a": "No code is a prefix of another, so the bit stream decodes uniquely without separators.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Why is the greedy merge optimal?",
      "a": "The two least frequent symbols can always be deepest siblings in an optimal tree, so merging them leaves a smaller problem of the same kind.",
      "follow": []
    }
  ]
};
