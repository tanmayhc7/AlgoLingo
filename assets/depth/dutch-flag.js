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

/* design-why */
window.DEPTH.design = [
 [
  "Why this problem exists",
  "It sorts three kinds of values (0, 1, 2) in one pass and O(1) space, which a general sort cannot beat. It is the idea behind three-way partitioning in quicksort, which handles many equal keys well."
 ],
 [
  "Why three pointers are used",
  "One marks the end of the 0s, one marks the start of the 2s, and one scans the unknown middle. The invariant is that everything before `low` is 0, everything after `high` is 2, and the region between is known to be 1s or not yet checked."
 ],
 [
  "Why `mid` does not move after swapping with `high`",
  "The item swapped in from the end has not been looked at yet, so it must be checked before moving on. After swapping with `low`, the item that arrives is already known to be 1, so `mid` can advance."
 ],
 [
  "Why it matters for quicksort",
  "With many duplicates, a two-way partition leaves large equal blocks to sort again and can degrade. A three-way partition places all equal items in their final position in one pass."
 ]
];
