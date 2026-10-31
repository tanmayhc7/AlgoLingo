/* Interview depth: gcd-lcm. */
window.DEPTH = {
  "thesis": "Euclid's algorithm computes gcd(a, b) by repeatedly replacing (a, b) with (b, a % b); it takes O(log min(a, b)) steps. lcm(a, b) = a / gcd(a, b) x b.",
  "why": [
    [
      "Fast",
      "Logarithmic, works on huge numbers."
    ],
    [
      "Building block",
      "Fractions, cycles, modular inverses."
    ],
    [
      "Interview staple",
      "Often asked to derive or code it."
    ],
    [
      "Extended Euclid",
      "Also finds x and y with ax + by = gcd."
    ]
  ],
  "edges": [
    [
      "Zero",
      "gcd(a, 0) = a; gcd(0, 0) is 0 by convention."
    ],
    [
      "Negative numbers",
      "Take absolute values or define the sign rule."
    ],
    [
      "Overflow in C",
      "Compute a / g * b, not a * b / g."
    ],
    [
      "Coprime",
      "gcd 1 means lcm = a x b."
    ]
  ],
  "cost": [
    [
      "Time",
      "O(log min(a, b))."
    ],
    [
      "Space",
      "O(1) iterative."
    ],
    [
      "gcd of n numbers",
      "Fold pairwise: O(n log max)."
    ]
  ],
  "internals": [
    [
      "Why it works",
      "Divisors of a and b are the same as divisors of b and a mod b."
    ],
    [
      "Worst case",
      "Consecutive Fibonacci numbers."
    ],
    [
      "Binary gcd",
      "Uses shifts and subtraction; avoids division."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What is gcd(a, 0)?",
      "a": "a: every number divides 0, so the largest common divisor is a.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How do you compute lcm safely?",
      "a": "a // gcd(a, b) * b so the intermediate value does not overflow.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Why is Euclid logarithmic?",
      "a": "The remainder is less than half of a every two steps, so the numbers shrink geometrically.",
      "follow": []
    }
  ]
};
