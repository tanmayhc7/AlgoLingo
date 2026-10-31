/* Chapter 38 quiz: Number theory. */
window.QUIZ = {
  "chapter": 38,
  "title": "Number theory",
  "lede": "gcd, lcm, primes, modular arithmetic and combinations.",
  "questions": [
    {
      "type": "mcq",
      "q": "What is gcd(a, 0) for a positive a?",
      "options": [
        "0",
        "a",
        "1"
      ],
      "answer": 1,
      "why": "Every number divides 0, so the greatest common divisor of a and 0 is a."
    },
    {
      "type": "mcq",
      "q": "For (a x b) mod m, which is valid?",
      "options": [
        "Reduce a and b first, multiply, then reduce again",
        "Divide a by m first",
        "Only reduce at the very end"
      ],
      "answer": 0,
      "why": "Both reducing early and reducing at the end give the same remainder, but reducing early keeps numbers small."
    },
    {
      "type": "write",
      "q": "Write <code>gcd(a, b)</code> with Euclid's algorithm (no <code>math.gcd</code>).",
      "starter": "def gcd(a, b):\n    # your code\n",
      "tests": [
        {
          "expr": "gcd(48, 18)",
          "want": "6"
        },
        {
          "expr": "gcd(7, 13)",
          "want": "1"
        },
        {
          "expr": "gcd(0, 5)",
          "want": "5"
        },
        {
          "expr": "gcd(12, 12)",
          "want": "12"
        },
        {
          "expr": "gcd(1071, 462)",
          "want": "21"
        }
      ],
      "hint": "while b: a, b = b, a % b.",
      "solution": "def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a\n",
      "why": "Each step replaces (a, b) by (b, a % b), which has the same common divisors and smaller numbers."
    },
    {
      "type": "write",
      "q": "Write <code>lcm(a, b)</code> using <code>math.gcd</code>, dividing before multiplying.",
      "starter": "from math import gcd\n\ndef lcm(a, b):\n    # your code\n",
      "tests": [
        {
          "expr": "lcm(4, 6)",
          "want": "12"
        },
        {
          "expr": "lcm(5, 7)",
          "want": "35"
        },
        {
          "expr": "lcm(1, 9)",
          "want": "9"
        },
        {
          "expr": "lcm(12, 18)",
          "want": "36"
        }
      ],
      "hint": "a // gcd(a, b) * b.",
      "solution": "from math import gcd\n\ndef lcm(a, b):\n    return a // gcd(a, b) * b\n",
      "why": "Dividing first keeps the intermediate value small, which matters in C where a * b can overflow."
    },
    {
      "type": "write",
      "q": "Write <code>sieve(n)</code>: the list of all primes up to and including <code>n</code>.",
      "starter": "def sieve(n):\n    # your code\n",
      "tests": [
        {
          "expr": "sieve(20)",
          "want": "[2, 3, 5, 7, 11, 13, 17, 19]"
        },
        {
          "expr": "sieve(1)",
          "want": "[]"
        },
        {
          "expr": "sieve(2)",
          "want": "[2]"
        },
        {
          "expr": "len(sieve(100))",
          "want": "25"
        }
      ],
      "hint": "A list of booleans; for each prime p, mark multiples starting at p * p.",
      "solution": "def sieve(n):\n    if n < 2:\n        return []\n    is_p = [True] * (n + 1)\n    is_p[0] = is_p[1] = False\n    for p in range(2, int(n ** 0.5) + 1):\n        if is_p[p]:\n            for m in range(p * p, n + 1, p):\n                is_p[m] = False\n    return [i for i, ok in enumerate(is_p) if ok]\n",
      "why": "Crossing out multiples of each prime up to sqrt(n) leaves exactly the primes, in about O(n log log n)."
    },
    {
      "type": "debug",
      "q": "<code>is_prime(n)</code> must be True only for primes. It misses the square root itself, so 4 and 9 come out as prime. Fix it.",
      "starter": "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n ** 0.5)):\n        if n % i == 0:\n            return False\n    return True\n",
      "tests": [
        {
          "expr": "is_prime(4)",
          "want": "False"
        },
        {
          "expr": "is_prime(9)",
          "want": "False"
        },
        {
          "expr": "is_prime(7)",
          "want": "True"
        },
        {
          "expr": "is_prime(2)",
          "want": "True"
        },
        {
          "expr": "is_prime(1)",
          "want": "False"
        },
        {
          "expr": "is_prime(25)",
          "want": "False"
        }
      ],
      "hint": "range excludes its upper bound.",
      "solution": "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n",
      "why": "range stops before its end, so the upper bound must be sqrt(n) + 1 to include the case n = i x i."
    },
    {
      "type": "write",
      "q": "Write <code>power(a, b, m)</code> computing a to the power b mod m with a loop in O(log b) (no <code>pow</code> and no <code>**</code>).",
      "starter": "def power(a, b, m):\n    # your code\n",
      "tests": [
        {
          "expr": "power(2, 10, 1000)",
          "want": "24"
        },
        {
          "expr": "power(3, 0, 7)",
          "want": "1"
        },
        {
          "expr": "power(7, 128, 13)",
          "want": "pow(7, 128, 13)"
        },
        {
          "expr": "power(5, 117, 19)",
          "want": "pow(5, 117, 19)"
        }
      ],
      "hint": "Loop on the bits of b: multiply the result when the bit is set, then square a.",
      "solution": "def power(a, b, m):\n    result = 1\n    a %= m\n    while b:\n        if b & 1:\n            result = result * a % m\n        a = a * a % m\n        b >>= 1\n    return result\n",
      "why": "Each loop handles one binary digit of b, so a million-sized exponent takes about 20 rounds."
    },
    {
      "type": "complete",
      "q": "Fill in the blank: by Fermat's little theorem the inverse of x modulo a prime p is <code>pow(x, ___, p)</code>.",
      "starter": "def inv(x, p):\n    return pow(x, ___, p)\n",
      "tests": [
        {
          "expr": "inv(3, 7)",
          "want": "5"
        },
        {
          "expr": "inv(2, 5)",
          "want": "3"
        },
        {
          "expr": "inv(10, 13)",
          "want": "4"
        },
        {
          "expr": "inv(6, 7) * 6 % 7",
          "want": "1"
        }
      ],
      "hint": "The exponent is p minus something small.",
      "solution": "def inv(x, p):\n    return pow(x, p - 2, p)\n",
      "why": "x^(p-1) = 1 mod p, so x^(p-2) times x is 1: x^(p-2) is the inverse."
    },
    {
      "type": "write",
      "q": "Write <code>nCr_mod(n, r, p)</code> for a prime <code>p</code> greater than n: the number of ways to choose r of n, mod p. Return 0 if r is out of range. Use factorials mod p and <code>pow(x, p - 2, p)</code>.",
      "starter": "def nCr_mod(n, r, p):\n    # your code\n",
      "tests": [
        {
          "expr": "nCr_mod(5, 2, 13)",
          "want": "10"
        },
        {
          "expr": "nCr_mod(10, 3, 1000000007)",
          "want": "120"
        },
        {
          "expr": "nCr_mod(4, 5, 7)",
          "want": "0"
        },
        {
          "expr": "nCr_mod(6, 0, 7)",
          "want": "1"
        },
        {
          "expr": "nCr_mod(30, 15, 1000000007)",
          "want": "155117520 % 1000000007"
        }
      ],
      "hint": "fact = product of 1..n mod p; answer = fact(n) * inverse(fact(r) * fact(n - r)) mod p.",
      "solution": "def nCr_mod(n, r, p):\n    if r < 0 or r > n:\n        return 0\n    def f(k):\n        v = 1\n        for i in range(2, k + 1):\n            v = v * i % p\n        return v\n    den = f(r) * f(n - r) % p\n    return f(n) * pow(den, p - 2, p) % p\n",
      "why": "Division becomes multiplication by the modular inverse, so everything stays an integer below p."
    }
  ]
};
