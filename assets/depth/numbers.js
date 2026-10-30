/* Interview depth: Numbers, booleans and None. */
window.DEPTH = {
  thesis:
    'Numbers are where C intuition misleads most: ints cannot overflow, `/` is never integer division, `//` and `%` round toward minus infinity, floats are ordinary IEEE 754 doubles, and `bool` is a kind of int. Senior interviews probe these corners because real bugs hide there: index arithmetic on negatives, emulating 32-bit overflow, and comparing floats.',
  why: [
    ['The floor-division identity', 'Python guarantees `(a // b) * b + a % b == a`, with `a % b` taking the sign of `b`. That single rule explains every negative case. It is why `-1 % n` is a valid index (`n - 1`) and why `-7 // 2` is `-4`.'],
    ['Arbitrary precision is a tradeoff', 'No overflow means you never need `long long` anxiety, but it also means you must add limits yourself (modulo, masks) and that huge numbers cost time proportional to their digit count. "Python ints are fast" is only true for small ones.'],
    ['Floats are not decimals', 'A float stores the nearest binary fraction. `0.1` has no exact binary form, so sums drift and `==` is unreliable. Choose the representation by the problem: integers (cents) for money, `decimal.Decimal` for exact decimal rules, `fractions.Fraction` for exact ratios, floats with `math.isclose` for science.'],
    ['Truthiness is a protocol', 'Any object can define truth (`__bool__` or `__len__`). Zero, empty containers and `None` are false. That makes `if not xs` idiomatic for empty, but also makes `if x:` wrong when `0` is a valid value.'],
  ],
  edges: [
    ['`-7 // 2` and `-7 % 2`', 'Gives `-4` and `1`. C gives `-3` and `-1`. In an interview that mixes languages, state which semantics you rely on.'],
    ['`int(-3.5)` versus `-3.5 // 1`', '`int()` truncates toward zero (`-3`). `//` and `math.floor` go down (`-4`). Pick the one that matches the spec.'],
    ['`round(2.5)` and `round(3.5)`', 'Banker\'s rounding (half to even): 2 and 4. For half-up use `int(x + 0.5)` for non-negatives or `decimal` with `ROUND_HALF_UP`.'],
    ['`0.1 + 0.2 == 0.3`', 'False. Use `math.isclose(a, b, rel_tol=1e-9, abs_tol=...)`. Remember an `abs_tol` is needed when comparing to zero.'],
    ['NaN', '`float("nan") != float("nan")`. NaN breaks sorting and `min`/`max`. Test with `math.isnan`. `nan in [nan]` can be True by identity, which is another trap.'],
    ['Negative zero and infinity', '`-0.0 == 0.0` is True. `float("inf")` compares as expected, `inf - inf` is NaN. `math.inf` is the same constant.'],
    ['Huge ints and strings', 'Since 3.11, converting an int with more than 4300 digits to or from `str` raises `ValueError` by default (a denial-of-service guard). `sys.set_int_max_str_digits(0)` lifts it.'],
    ['`float(10**400)`', 'Raises `OverflowError`. Python ints are unbounded; floats are not.'],
    ['Bitwise on negatives', 'Python ints behave as infinite two\'s complement. `~x == -x - 1`. To emulate 32-bit use `x & 0xFFFFFFFF`, and convert back with `x - (1 << 32) if x >> 31 else x`.'],
    ['`bool` is an `int`', '`True + True == 2`, `sum([True, False, True]) == 2`, `isinstance(True, int)` is True. Handy for counting, a trap for type checks.'],
    ['Chained comparison', '`1 < x < 5` evaluates `x` once and short-circuits. `a == b == c` is chained too, but `a < b > c` is legal and rarely what you meant.'],
  ],
  cost: [
    ['a + b, a - b (ints)', 'O(n digits)', 'Constant for machine-size values, linear in digits for huge ones.'],
    ['a * b (ints)', 'O(n^1.58)', 'Karatsuba for large operands. Schoolbook for small ones.'],
    ['a // b, a % b', 'O(n*m) digits', 'Big-int division is quadratic in the worst case.'],
    ['a ** b', 'O(log b) mults', 'Square-and-multiply, but each multiply grows. `pow(a, b, m)` keeps numbers small.'],
    ['str(n), int(s)', 'O(n^2) digits', 'Quadratic for huge numbers, hence the 4300-digit guard.'],
    ['math.gcd, math.isqrt', 'fast', 'Implemented in C. `isqrt` is exact for any size int, unlike `int(n ** 0.5)`.'],
    ['float ops', 'O(1)', 'Hardware doubles, plus the cost of allocating a float object.'],
  ],
  internals: [
    ['How an int is stored', 'A variable-length array of 30-bit digits, plus a header with size and sign. Small values fit in one digit. That is why `sys.getsizeof(0)` is 28 and a huge int grows 4 bytes per 30 bits.'],
    ['How a float is stored', 'A C `double` inside an object: 1 sign bit, 11 exponent bits, 52 fraction bits. `float.hex()` shows the exact bits, and `decimal.Decimal(0.1)` prints the exact value the float holds.'],
    ['`bool` and `None`', '`bool` is a subclass of `int` with exactly two instances. `None` is the single instance of `NoneType`. Because they are singletons, `is` is the right test and is also faster.'],
    ['`and` and `or` return operands', '`x or y` evaluates `x`; if truthy returns it, else returns `y`. `x and y` returns `x` if falsy, else `y`. That is why `a or default` works, and why a function returning `x and x.name` can return a non-bool.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What are `-7 // 2`, `-7 % 2` and `int(-7 / 2)` in Python?',
      a: '`-4`, `1` and `-3`. `//` floors to minus infinity, `%` follows so that `(a // b) * b + a % b == a`, and `int(-3.5)` truncates toward zero.',
      follow: [
        ['Why does that matter for indexing?', 'With a circular buffer or wrap-around, `(i - 1) % n` is always in `[0, n)` in Python. In C you must write `(i - 1 + n) % n`.'],
        ['What does C give and why do they differ?', 'C99 truncates toward zero, so `-7 / 2` is `-3` and `-7 % 2` is `-1`. Python chose floor division so that the remainder has the sign of the divisor, which is the mathematically consistent modulus.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is `0.1 + 0.2 != 0.3` and what do you do about it?',
      a: '0.1 and 0.2 have no exact binary representation, so each is the nearest double, and their sum is a different double than the nearest to 0.3. Compare with a tolerance (`math.isclose`), use integers for money, or use `Decimal` or `Fraction` when you need exact decimal or rational arithmetic.',
      follow: [
        ['How would you sum a long list of floats accurately?', '`math.fsum` tracks partial sums exactly and returns a correctly rounded result. Plain `sum` accumulates rounding error, and sorting ascending first reduces it a little.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'LeetCode "Reverse Integer" says to return 0 if the result overflows a signed 32-bit int. Python ints do not overflow. How do you handle it?',
      a: 'Compute the reversal with Python ints, then check the range explicitly: `if not -2**31 <= r <= 2**31 - 1: return 0`. In C you would check before multiplying by 10 to avoid UB. The interview point is that the spec describes 32-bit behaviour, so you enforce it yourself.',
      follow: [
        ['How would you emulate 32-bit wraparound in Python?', 'Mask and sign-extend: `x &= 0xFFFFFFFF; x = x - (1 << 32) if x & 0x80000000 else x`. Needed for hash functions, checksums and bit puzzles that expect modular behaviour.'],
        ['Why `lo + (hi - lo) // 2` in binary search if Python cannot overflow?', 'It is the portable habit: in C, Java and Go `(lo + hi) / 2` can overflow for big indices. In Python both are fine, but interviewers like seeing you know the reason.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Is `x == None` wrong? Why do people write `x is None`?',
      a: '`is None` tests identity against the one `None` object, cannot be fooled, and is faster. `==` calls `__eq__`, which a class may override (NumPy arrays return an array of booleans), producing surprising results. Style guides (PEP 8) require `is None`.',
      follow: [
        ['When is `if not x` wrong for a None check?', 'When falsy values like `0`, `""` or `[]` are valid inputs. `if not x` conflates them with `None`. Use `if x is None` when you mean absent.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'What does `bool([]) or "fallback"` return, and what does `0 or None or "x"` return?',
      a: '`"fallback"`, because the empty list is falsy and `or` returns its right operand. Then `"x"`: `or` returns the first truthy operand, or the last operand if none are truthy. `and` returns the first falsy operand, or the last.',
      follow: [
        ['Where does this bite in real code?', '`timeout = user_timeout or 30` turns an explicit timeout of `0` into 30. Use `30 if user_timeout is None else user_timeout`.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Design the data type for money in a billing system and explain the choice.',
      a: 'Store integer minor units (cents) with an explicit currency, so addition and comparison are exact, and do rounding in one place with a defined mode (often half-even for aggregates, half-up where law requires). `Decimal` is acceptable when you need fractional cents or tax rules, with context precision set deliberately. Never `float`. Cover serialisation (strings, not JSON numbers, to avoid precision loss in JavaScript consumers) and database types (`NUMERIC`).',
      follow: [
        ['How do you split 100 cents among 3 people?', 'Allocate `divmod(100, 3) = (33, 1)`: everyone gets 33 and one extra cent goes to a deterministic recipient. The invariant is that the parts sum exactly to the whole.'],
      ],
    },
  ],
};
