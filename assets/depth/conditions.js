/* Interview depth: Conditions. */
window.DEPTH = {
  thesis:
    'Conditions look simple, and interviews use them to test two things: whether you know what Python treats as true (any object, via truthiness), and whether you can write branches that are correct at the boundaries. Most real bugs here are a wrong boundary (`<` versus `<=`), a test that is true for the wrong reason (`x == 1 or 2`), or a falsy value mistaken for "missing".',
  why: [
    ['Truthiness, not booleans', 'An `if` calls `bool()` on its test. Zero numbers, empty containers and `None` are false; nearly everything else is true. That gives short idioms (`if not items`) and one sharp edge: `0`, `""` and `[]` are all "falsy", so use `is None` when "missing" and "empty or zero" mean different things.'],
    ['Boundaries before branches', 'Before writing a condition, write the inputs that sit on each side of every boundary: empty, one item, exactly at the limit, one past it. Interviewers watch for whether you choose `<` or `<=` by reasoning, not by trying.'],
    ['Prefer flat over nested', 'Guard clauses (`if bad: return`) keep the main path unindented and make each condition independent. Long `if/elif` chains on one value often want a dict dispatch or `match`. Deep nesting is a smell that interviewers read as unclear thinking.'],
    ['Short-circuit is a feature you can rely on', '`a and b` does not evaluate `b` if `a` is false; `a or b` does not evaluate `b` if `a` is true. That is how `if node and node.next:` is safe. It is also why side effects in conditions are fragile.'],
  ],
  edges: [
    ['`if x == 1 or 2:`', 'Always true: it parses as `(x == 1) or 2`, and `2` is truthy. Write `x in (1, 2)`.'],
    ['`if x in ("a")`', 'The parentheses do not make a tuple, so this is a substring test on the string `"a"`. Write `("a",)` or a list or set.'],
    ['`if not x` when 0 is valid', 'Treats `0`, `0.0`, `""`, `[]` and `None` the same. Use `is None` when only absence matters.'],
    ['Chained comparison versus C habit', '`0 < x < n` works. In C the same text means `(0 < x) < n`. Do not carry the C meaning of `a < b < c` into Python or the reverse.'],
    ['`is` for values', '`x is 5` or `s is "a"` can pass or fail by interning. Use `==`. `is` is for `None`, `True`, `False` and sentinels.'],
    ['Floats in conditions', '`if total == 0.3:` is unreliable. Use `math.isclose` or compare against a tolerance.'],
    ['NumPy and pandas truthiness', '`if arr:` raises `ValueError` for arrays with more than one element. Use `arr.any()`, `arr.all()` or `arr.size`.'],
    ['`assert` for validation', 'Asserts are removed with `python -O`. Never use them to validate user input; raise a real exception.'],
    ['`match` captures names', 'In `case x:` the bare name captures anything and always matches. Use a dotted name (`Color.RED`) to compare to a constant, and put `case _:` last.'],
    ['Ternary precedence', '`a if c else b + 1` means `a if c else (b + 1)`. Parenthesise when mixing with other operators.'],
  ],
  cost: [
    ['if / elif chain of k tests', 'O(k)', 'Tests run top to bottom until one is true. Put the common case first when it matters.'],
    ['dict dispatch `table[key]()`', 'O(1)', 'One hash lookup. Better than a long chain, and extensible.'],
    ['x in (1, 2, 3)', 'O(k)', 'Compared in order. Constant tuples and lists in `in` tests are turned into constants by the compiler.'],
    ['x in set_of_values', 'O(1) avg', 'The right tool when the value set is large or reused.'],
    ['match with k literal cases', 'O(k)', 'Cases are tried in order, like if/elif. Not a jump table.'],
  ],
  internals: [
    ['How truthiness is decided', 'Python calls `__bool__` if the type defines it, else `__len__` (zero means false), else the object is true. That is why user-defined containers become falsy when `len()` is zero, and why a class that defines neither is always true.'],
    ['Short-circuit in bytecode', '`and` and `or` compile to conditional jumps that keep the deciding value on the stack. That is why they return an operand, not necessarily a bool.'],
    ['Constant folding', 'The compiler evaluates constant conditions at compile time. `if 0:` blocks are dropped from the bytecode, and `if __debug__:` blocks disappear under `-O`.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What values are falsy in Python?',
      a: '`None`, `False`, zero of any numeric type (`0`, `0.0`, `0j`, `Decimal(0)`), and empty sequences and collections (`""`, `[]`, `()`, `{}`, `set()`, `range(0)`). User-defined objects are falsy if `__bool__` returns False or `__len__` returns 0.',
      follow: [
        ['Is `"0"` falsy? Is `[0]`?', 'No to both. A non-empty string and a non-empty list are truthy regardless of contents.'],
        ['How do you check "this argument was not provided" robustly?', 'Use a sentinel: `_MISSING = object()` as the default and test `arg is _MISSING`. `None` is itself a legitimate value for many APIs.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is `if x == 3 or 4:` a bug?',
      a: 'It parses as `(x == 3) or 4`. The `4` is always truthy, so the condition is always true. Write `x == 3 or x == 4`, or `x in (3, 4)`.',
      follow: [
        ['Is `if x in (3, 4)` slower than the two comparisons?', 'No, for a constant tuple the difference is negligible, and the compiler treats it as a constant. Readability wins.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'You are handed a 40-line `if/elif` chain mapping command names to behaviour. How would you restructure it?',
      a: 'Replace it with a dispatch table: a dict from command name to function, and `handler = table.get(name)`; if `handler is None`, handle the unknown command in one place. It makes adding a command a one-line change, each handler testable on its own, and lookup O(1). For commands with shapes (tuples, class instances), `match` is clearer.',
      follow: [
        ['What do you lose with a dispatch table?', 'Locality (conditions and bodies are in different places), and early-exit logic that depends on the order of tests. Use a table when branches are independent; keep `if` when order or compound conditions matter.'],
        ['How do you test that every command is covered?', 'Iterate over the table in a test, and compare its keys to a canonical list (an `Enum`) so a missing handler fails fast.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'What is wrong with this guard?\n`if user and user.profile and user.profile.email == target:`',
      a: 'It works through short-circuit, but it mixes absence checks with business logic and fails on `""` or other falsy-but-present values (a `user` object with `__len__ == 0`). Prefer `is not None` checks, or model absence explicitly (`Optional`, null objects), or `getattr(user, "profile", None)`. Long chains usually point at a Law-of-Demeter problem: give `User` a method like `user.email()`.',
      follow: [
        ['What would the same look like with EAFP?', '`try: return user.profile.email == target\nexcept AttributeError: return False`. It is concise but can mask unrelated `AttributeError`s inside the property, so keep the try body tiny.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain `match` and when you would not use it.',
      a: 'Structural pattern matching (3.10+) tests a value against patterns: literals, sequences (`[x, y]`), mappings, class patterns (`Point(x=0)`), alternatives (`1 | 2`), guards (`case n if n > 0`), and captures names. It is excellent for parsing tagged data and ASTs. Avoid it for simple equality tests (`if` is clearer), when you must support Python older than 3.10, or when order-dependent captures could mislead readers.',
      follow: [
        ['What does `case x:` do?', 'It matches anything and binds it to `x`, so it is an irrefutable pattern that shadows later cases (a SyntaxError if followed by more cases). Use `case _:` as the explicit default.'],
      ],
    },
  ],
};
