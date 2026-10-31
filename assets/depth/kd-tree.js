/* Interview depth: kd-tree. */
window.DEPTH = {
  "thesis": "A k-D tree is a binary space-partitioning tree: each level splits points on one coordinate, cycling through the axes. It supports nearest-neighbour and range queries in O(log n) on average in low dimensions by pruning regions that cannot beat the current best.",
  "why": [
    [
      "Geometry",
      "Closest point, points in a box, collision checks."
    ],
    [
      "Machine learning",
      "Exact k-nearest-neighbours in low dimensions."
    ],
    [
      "Pruning idea",
      "Same as branch and bound."
    ],
    [
      "Interview extension",
      "Often a follow-up to BSTs and heaps."
    ]
  ],
  "edges": [
    [
      "Curse of dimensionality",
      "Above roughly 20 dimensions pruning fails and search degrades to O(n)."
    ],
    [
      "Duplicates",
      "Points equal on the axis may sit on either side; be consistent."
    ],
    [
      "Dynamic data",
      "Inserts unbalance the tree; rebuild periodically."
    ],
    [
      "Tie-breaking",
      "Choose a median rule for even counts."
    ]
  ],
  "cost": [
    [
      "Build",
      "O(n log n) with presorting, O(n log^2 n) with sorting per level."
    ],
    [
      "Nearest neighbour",
      "O(log n) average, O(n) worst case."
    ],
    [
      "Space",
      "O(n)."
    ]
  ],
  "internals": [
    [
      "Axis cycling",
      "axis = depth mod k."
    ],
    [
      "Pruning test",
      "Compare the distance to the splitting hyperplane with the best distance."
    ],
    [
      "kNN",
      "Keep a max-heap of size k; prune with the heap top."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What does each level split on?",
      "a": "One coordinate, cycling through the dimensions.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Why does nearest neighbour need to backtrack?",
      "a": "The nearest point may lie across a splitting line closer than the best found so far.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "When does a k-D tree stop working?",
      "a": "In high dimensions (embeddings): almost every region needs checking, so use approximate indexes such as HNSW or IVF.",
      "follow": []
    }
  ]
};
