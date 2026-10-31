/* Interview depth: modular-pow. */
window.DEPTH = {
  "thesis": "Modular arithmetic lets you reduce after every + - and x so numbers stay small. Fast exponentiation computes a^b mod m in O(log b) multiplications by squaring the base and reading the bits of b; Python provides it as pow(a, b, m).",
  "why": [
    [
      "Huge answers",
      "Counting problems report results mod 10^9 + 7."
    ],
    [
      "Cryptography idea",
      "RSA is modular exponentiation."
    ],
    [
      "Fast powers",
      "Matrix power and Fibonacci use the same loop."
    ],
    [
      "Interview topic",
      "Implement pow and explain complexity."
    ]
  ],
  "edges": [
    [
      "Negative remainders",
      "C and Java % can be negative; Python is not."
    ],
    [
      "Overflow",
      "Multiply two values below m only if m^2 fits in 64 bits; otherwise use 128-bit or mulmod."
    ],
    [
      "No division",
      "Use a modular inverse instead."
    ],
    [
      "b = 0",
      "Result is 1."
    ]
  ],
  "cost": [
    [
      "Fast power",
      "O(log b) multiplications."
    ],
    [
      "Naive power",
      "O(b) multiplications."
    ],
    [
      "Space",
      "O(1)."
    ]
  ],
  "internals": [
    [
      "Binary view",
      "a^b is the product of a^(2^i) for each set bit i of b."
    ],
    [
      "Congruence",
      "a and b are congruent mod m if m divides a - b."
    ],
    [
      "Residues",
      "The remainders 0..m-1 form a ring."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why take the modulus at each step?",
      "a": "The remainder rules for + and x let you reduce early and avoid giant numbers or overflow.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How does fast exponentiation work?",
      "a": "Square the base each round and multiply it into the result when the current bit of the exponent is 1.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How do you divide modulo a prime?",
      "a": "Multiply by the modular inverse, pow(x, p - 2, p), using Fermat's little theorem.",
      "follow": []
    }
  ]
};
