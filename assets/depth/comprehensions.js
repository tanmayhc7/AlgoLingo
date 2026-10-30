/* Interview depth: Comprehensions. */
window.DEPTH = {
  thesis:
    'A comprehension is a for loop that builds a collection, written inside out. The skills interviewers test are reading the clauses in the right order, choosing between a list, a set, a dict and a generator, spotting memory and laziness effects, and knowing when a plain loop is the better answer.',
  why: [
    ['Read it as a loop', '`[f(x) for x in xs if keep(x)]` is `result = []; for x in xs: if keep(x): result.append(f(x))`. Clauses run left to right in the order written; only the item expression is moved to the front.'],
    ['Pick the container by what you do next', 'List when you need order and indexing, set when you need unique items or fast membership, dict when you need a lookup, generator when you will iterate once or the data is large. A list comprehension always builds everything in memory first.'],
    ['`if` has two positions with two meanings', 'At the end it filters (items may be dropped). At the front as `a if cond else b` it is a ternary choosing a value (nothing is dropped). Mixing them up is the classic comprehension bug.'],
    ['Know when to stop', 'More than two `for` clauses, side effects, or a condition you have to re-read are signals to write a loop or a helper function. A comprehension is for building values, not for doing things.'],
  ],
  edges: [
    ['Order of nested `for` clauses', '`[x for row in m for x in row]` flattens: the outer loop is written first. Reversing them raises `NameError` or gives wrong output.'],
    ['Filter versus ternary', '`[x for x in xs if x > 0]` drops items. `[x if x > 0 else 0 for x in xs]` keeps all items. Same words, different structure.'],
    ['Loop variable does not leak (Python 3)', 'The variable lives in the comprehension scope. A walrus target inside, though, does leak into the enclosing scope.'],
    ['Late binding in closures', '`[lambda: i for i in range(3)]` all return 2. Bind with `lambda i=i: i`.'],
    ['Dict comprehension with duplicate keys', 'Later items overwrite earlier ones silently. `{k: v for k, v in pairs}` keeps the last value for each key.'],
    ['Empty braces', '`{}` is an empty dict. A set comprehension needs an expression: `{x for x in xs}`. An empty set is `set()`.'],
    ['Generator expression consumed once', '`g = (x * x for x in xs)`; `sum(g)` then `sum(g)` gives the real total then 0. Make a list if you need two passes.'],
    ['Exceptions inside', 'An error in the item or condition aborts the whole comprehension; there is no partial result. Handle errors in a helper function or filter beforehand.'],
    ['Side effects', '`[print(x) for x in xs]` builds a list of `None`s. Use a plain loop for side effects.'],
    ['Mutation of the source while building', 'Comprehensions over a list that you modify in the item expression are as unsafe as loops over mutated lists.'],
    ['Class-body scoping quirk', 'In a class body, a comprehension cannot see other class attributes in its inner clauses (only the first iterable is evaluated in class scope). 3.12 inlining did not change the visible rules.'],
  ],
  cost: [
    ['[f(x) for x in xs]', 'O(n) time, O(n) space', 'Faster than an append loop, because it avoids a method lookup and call per item.'],
    ['(f(x) for x in xs)', 'O(1) space', 'Lazy. Costs are paid per item as you consume it.'],
    ['{k: v for ...}, {x for ...}', 'O(n) avg', 'Hashing per item; worst case degrades with collisions.'],
    ['nested for over n and m', 'O(n * m)', 'Two clauses are two loops. Estimate before writing.'],
    ['sum(x for x in xs)', 'O(n) time, O(1) space', 'Prefer to `sum([x for x in xs])`, which builds a list first.'],
    ['any(cond(x) for x in xs)', 'O(n) worst, early exit', 'Stops at the first true item.'],
    ['membership inside the condition', 'O(n) per item', '`[x for x in a if x in b]` with a list `b` is O(n * m). Make `b` a set.'],
  ],
  internals: [
    ['Scope and inlining', 'Before 3.12 each comprehension compiled to a hidden function with its own scope, called once. PEP 709 (3.12) inlines list, dict and set comprehensions into the enclosing function, speeding them up while keeping the isolated loop variable.'],
    ['Why it is faster than `append`', 'The loop and the `LIST_APPEND` instruction run inside the VM without a Python-level method call per item. Gains are largest when the body is tiny.'],
    ['Generator expressions are generators', 'They create a generator object with its own suspended frame, keeping the loop state between items. That is where the memory saving comes from, and why they are single-pass.'],
    ['Evaluation order', 'The first iterable is evaluated immediately in the enclosing scope. Everything else is evaluated lazily per iteration. Errors in the first iterable surface at creation, even for generator expressions.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What is the difference between `[x for x in xs if x > 0]` and `[x if x > 0 else 0 for x in xs]`?',
      a: 'The first filters: negative items are dropped, so the result can be shorter. The second maps: every item is kept, and negatives are replaced by 0, so the length is unchanged. The `if` at the end is a filter clause; the `if/else` at the front is a conditional expression.',
      follow: [
        ['Can you have both?', 'Yes: `[x if x % 2 else -x for x in xs if x > 0]` filters first, then maps each remaining item.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Flatten a list of lists with a comprehension and read it aloud.',
      a: '`[x for row in matrix for x in row]`. Read: for each `row` in `matrix`, for each `x` in `row`, collect `x`. The clauses are in the same order as nested loops. For a one-liner without a comprehension, `itertools.chain.from_iterable(matrix)` is lazy and fast.',
      follow: [
        ['What happens for ragged or empty rows?', 'It works: empty rows contribute nothing. If an element is itself a list (deeper nesting), only one level is flattened.'],
        ['How would you flatten arbitrarily deep nesting?', 'A recursive generator that yields non-list items and recurses on lists (and decide whether strings count as lists), or an iterative version with a stack to avoid recursion limits.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'You need the sum of squares of a million numbers. Compare `sum([x*x for x in xs])` and `sum(x*x for x in xs)`.',
      a: 'Both are O(n) time. The list comprehension builds a million-element list first (O(n) extra memory, and slightly faster per item because there is no generator overhead for small data). The generator expression streams one value at a time with O(1) extra memory. For large inputs use the generator form; for small or when you need the list anyway, the list is fine. Measure if it matters.',
      follow: [
        ['What if you need both the sum and the max of those squares?', 'Either build the list once and use both, or make a single pass loop tracking both. A generator can only be consumed once, so two calls would need two generators (two passes over the source).'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Why does this give surprising results?\n`funcs = [lambda: n for n in range(3)]; [f() for f in funcs]`',
      a: 'Each lambda refers to the variable `n`, not the value at creation. All three see the final value 2, so the result is `[2, 2, 2]`. Fix by binding: `lambda n=n: n`, or build functions with a factory, or use `functools.partial`.',
      follow: [
        ['Does using a generator expression change it?', 'No. The late-binding behaviour comes from closures, not from the comprehension type. Calling each function immediately inside the loop would show the right values, because `n` has not moved on yet.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Given a list of words, build a dict from first letter to the list of words starting with it. What are the options?',
      a: 'Dict comprehension cannot do the grouping cleanly (it would overwrite values), so use a loop with `defaultdict(list)`: `for w in words: d[w[0]].append(w)`. Or sort and use `itertools.groupby` (requires sorting by the key first). A comprehension that scans the list once per letter, like `{c: [w for w in words if w[0] == c] for c in letters}`, is O(26 * n), correct, but wasteful. Handle empty strings (`w[0]` raises) explicitly.',
      follow: [
        ['What breaks `groupby` if you forget to sort?', 'It groups only consecutive equal keys, so the same letter appears in several groups.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'When would you ban comprehensions in a code review?',
      a: 'Not ban, but push back when the body has side effects, when a comprehension nests three levels or needs a multi-line condition, when error handling matters per item, or when a name reused across clauses makes order subtle. Prefer a loop or a helper function with a name that explains the intent, and keep comprehensions for simple map and filter. Also flag `[...]` passed to `any`, `all`, `sum` or `join` of huge data where a generator avoids memory spikes.',
      follow: [
        ['What is your rule of thumb?', 'If you cannot explain it in one sentence out loud, or it does not fit on one or two lines, use a loop.'],
      ],
    },
  ],
};
