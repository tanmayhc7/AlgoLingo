/* Interview depth: dutch-flag. */
window.DEPTH = {
  "thesis": "The Dutch national flag algorithm partitions an array into three groups in one pass and O(1) space using three pointers: low, mid and high. It solves sort colours and gives quicksort a three-way partition that handles many duplicates in linear time.",
  "why": [
    [
      "Linear and in place",
      "One pass, no extra array."
    ],
    [
      "Pointer discipline",
      "Tests reasoning about invariants."
    ],
    [
      "Quicksort helper",
      "Fixes the duplicate problem."
    ],
    [
      "Interview favourite",
      "Sort colours is a classic."
    ]
  ],
  "edges": [
    [
      "Swap with high",
      "Do not advance mid after it."
    ],
    [
      "Empty or single element",
      "Loop does nothing or finishes at once."
    ],
    [
      "Already sorted",
      "Still one pass."
    ],
    [
      "Out of range values",
      "Decide how to treat values other than 0, 1 and 2."
    ]
  ],
  "cost": [
    [
      "Time",
      "O(n) one pass."
    ],
    [
      "Space",
      "O(1)."
    ],
    [
      "Counting alternative",
      "Two passes, O(n) time and O(k) space."
    ]
  ],
  "internals": [
    [
      "Invariant",
      "[0,lo) = 0, [lo,mid) = 1, (hi,end] = 2."
    ],
    [
      "Termination",
      "mid and hi converge; mid > hi ends the loop."
    ],
    [
      "Swaps",
      "At most n swaps in total."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why not just sort?",
      "a": "Sorting is O(n log n); this is O(n) for three values.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Why does mid stay after a swap with high?",
      "a": "The element swapped in is unexamined and may be any value.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How does it help quicksort?",
      "a": "A three-way partition removes all equal keys from the recursion, so arrays with many duplicates run in near-linear time.",
      "follow": []
    }
  ]
};
