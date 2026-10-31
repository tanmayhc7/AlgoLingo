/* Interview depth: avl-tree. */
window.DEPTH = {
  "thesis": "An AVL tree is a binary search tree that stays balanced: after every insert or delete, each node's left and right heights differ by at most 1, restored with rotations. Search, insert and delete are O(log n) in the worst case.",
  "why": [
    [
      "Guaranteed speed",
      "No bad input order can make it slow."
    ],
    [
      "Ordered operations",
      "Range queries, predecessor and successor stay fast."
    ],
    [
      "Interview classic",
      "Draw the four rotation cases."
    ],
    [
      "C and systems",
      "Balanced trees back maps, schedulers and indexes."
    ]
  ],
  "edges": [
    [
      "Duplicates",
      "Decide a rule: reject, count, or send equals to one side."
    ],
    [
      "Delete",
      "Can need rotations all the way up to the root, not just one."
    ],
    [
      "Height update order",
      "Update the lower node, then the new root."
    ],
    [
      "Zig-zag cases",
      "A single rotation does not fix left-right or right-left."
    ]
  ],
  "cost": [
    [
      "Search",
      "O(log n), worst case."
    ],
    [
      "Insert and delete",
      "O(log n): descend, then at most O(log n) rotations."
    ],
    [
      "Space",
      "O(n), plus one height per node."
    ]
  ],
  "internals": [
    [
      "Height bound",
      "An AVL tree with n nodes has height under about 1.44 log2(n)."
    ],
    [
      "Rotation",
      "Local pointer rewiring that preserves in-order order."
    ],
    [
      "Red-black",
      "Looser balance, fewer rotations on update, same O(log n)."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What is a balance factor?",
      "a": "Height of the left subtree minus the height of the right. AVL keeps it in -1, 0 or 1.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "What does a rotation preserve?",
      "a": "The in-order sequence, so the BST property still holds; it only changes the shape.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "AVL or red-black?",
      "a": "AVL is more strictly balanced, so lookups are slightly faster; red-black rotates less on writes. Pick by read-to-write ratio.",
      "follow": []
    }
  ]
};
