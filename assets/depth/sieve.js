/* Interview depth: sieve. */
window.DEPTH = {
  "thesis": "Primality can be tested in O(sqrt n) by trial division, and all primes up to n are listed in O(n log log n) by the sieve of Eratosthenes, which crosses out multiples of each prime starting at p x p.",
  "why": [
    [
      "Counting primes",
      "The direct use of the sieve."
    ],
    [
      "Factorisation",
      "A sieve of smallest prime factors factorises numbers fast."
    ],
    [
      "Number-theory base",
      "Needed for modular inverses and cryptography."
    ],
    [
      "Common question",
      "Count primes is a LeetCode regular."
    ]
  ],
  "edges": [
    [
      "0 and 1",
      "Not prime."
    ],
    [
      "Even numbers",
      "Only 2 is prime; skip evens to halve the work."
    ],
    [
      "Memory",
      "O(n) flags: use a bytearray for n in the millions."
    ],
    [
      "Square root loop",
      "Use i * i <= n, or math.isqrt, to avoid float error."
    ]
  ],
  "cost": [
    [
      "Trial division",
      "O(sqrt n) per number."
    ],
    [
      "Sieve",
      "O(n log log n) time, O(n) space."
    ],
    [
      "Segmented sieve",
      "O(sqrt n) memory for ranges."
    ]
  ],
  "internals": [
    [
      "Pairing",
      "Divisors come in pairs (d, n/d), one at most sqrt(n)."
    ],
    [
      "Harmonic sum",
      "Total crossings are n/2 + n/3 + n/5 + ..., about n log log n."
    ],
    [
      "Miller-Rabin",
      "A fast probabilistic test for huge numbers."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Is 1 prime?",
      "a": "No. A prime has exactly two divisors.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Why stop at sqrt(n)?",
      "a": "Divisors come in pairs, and one of each pair is at most sqrt(n).",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How would you factorise many numbers?",
      "a": "Build a smallest-prime-factor table with a sieve, then divide repeatedly in O(log n) per number.",
      "follow": []
    }
  ]
};

/* design-why */
window.DEPTH.design = [
 [
  "Why the sieve exists",
  "Testing each number for primality by trial division is slow when you need all primes up to n. The sieve crosses out multiples of each prime, so what is left must be prime, and it finishes in about O(n log log n) time."
 ],
 [
  "Why you start crossing out at `p * p`",
  "Any smaller multiple `p * k` with `k < p` has a smaller prime factor and was already removed by it. Starting at `p²` avoids redoing that work."
 ],
 [
  "Why you only need to go up to the square root",
  "A composite number n has a factor no larger than the square root of n, so once you have crossed out multiples of every prime up to that point, everything composite is gone."
 ],
 [
  "Why a bytearray is used",
  "The sieve needs one flag per number, and a `bytearray` or bit array stores that compactly and runs the crossing-out with slice assignment in C. A list of Python booleans would use many times the memory."
 ]
];
