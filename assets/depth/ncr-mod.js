/* Interview depth: ncr-mod. */
window.DEPTH = {
  "thesis": "n choose r can be built from Pascal's triangle in O(n^2), or for large n with precomputed factorials and modular inverses (Fermat: x^(p-2) mod p) in O(log p) per query.",
  "why": [
    [
      "Counting problems",
      "Paths, arrangements and probability use nCr."
    ],
    [
      "Large answers",
      "Output mod a prime."
    ],
    [
      "Combines topics",
      "Modular power and inverses."
    ],
    [
      "Interview use",
      "Grid paths: C(m+n, m)."
    ]
  ],
  "edges": [
    [
      "n >= p",
      "Factorials contain p, so no inverse; use Lucas's theorem."
    ],
    [
      "r > n",
      "Return 0."
    ],
    [
      "Overflow",
      "Reduce after every multiplication."
    ],
    [
      "Composite modulus",
      "Fermat's inverse does not apply; use extended Euclid."
    ]
  ],
  "cost": [
    [
      "Pascal table",
      "O(n^2) time and space."
    ],
    [
      "Factorials then queries",
      "O(N) setup, O(log p) per query."
    ],
    [
      "math.comb",
      "Fast exact integers."
    ]
  ],
  "internals": [
    [
      "Symmetry",
      "C(n, r) = C(n, n - r)."
    ],
    [
      "Fermat",
      "x^(p-1) = 1 mod p for prime p and x not divisible by p."
    ],
    [
      "Inverse",
      "y x inv(y) = 1 mod p."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What is C(5, 2)?",
      "a": "10.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How do you compute nCr mod p for large n?",
      "a": "Precompute factorials mod p, then nCr = fact[n] x inv(fact[r] x fact[n - r]) mod p, with the inverse from pow(x, p - 2, p).",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "What breaks when n is at least p?",
      "a": "The factorials include a factor of p, so the denominator has no inverse; use Lucas's theorem.",
      "follow": []
    }
  ]
};

/* design-why */
window.DEPTH.design = [
 [
  "Why binomials need a modulus",
  "`n choose r` grows enormously, so counting problems ask for the answer modulo a prime such as 10^9 + 7. Working modulo keeps every number small enough to handle."
 ],
 [
  "Why you cannot simply divide",
  "Division does not carry through a modulus like normal division. Instead you multiply by a modular inverse, which exists when the modulus is prime (Fermat's little theorem gives `a^(p-2)` as the inverse of `a`)."
 ],
 [
  "Why you precompute factorials",
  "`n choose r = n! / (r! (n-r)!)`. Computing all factorials and inverse factorials once costs O(n), and then each query is O(1), which pays off with many queries."
 ],
 [
  "Why Pascal's triangle is the alternative",
  "`C(n, r) = C(n-1, r-1) + C(n-1, r)` needs only addition, so it works with any modulus, but it takes O(n·r) time and memory. Use it when the modulus is not prime or n is small."
 ]
];
