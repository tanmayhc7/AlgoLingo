/* Interview depth: Lists. */
window.DEPTH = {
  thesis:
    'The list is the default container, and most interview mistakes with it are one of three kinds: sharing when you meant copying, doing an O(n) operation (insert at the front, `in`, slicing) inside a loop, and mutating while iterating. If you can name the cost of each list operation and say whether it copies, mutates or shares, you can answer nearly every question about lists.',
  why: [
    ['Share, shallow copy, deep copy', 'Assignment shares one list. `xs[:]`, `list(xs)`, `xs.copy()` make a new outer list holding the same items (shallow). `copy.deepcopy` copies the items too. Pick the weakest one that is safe for the data: immutable items need only a shallow copy.'],
    ['Methods that return `None`', '`sort`, `reverse`, `append`, `extend`, `insert`, `remove`, `clear` mutate in place and return `None`, to stop you from chaining and thinking you got a new list. `sorted()` and slicing return new lists.'],
    ['Cost follows position', 'The end is cheap (append, pop). The front and middle are expensive (insert, delete, `pop(0)`): items must shift. Searching (`in`, `index`, `count`, `remove`) is O(n). Pick another structure when the hot path touches the front or searches often.'],
    ['Sorting is stable and key-based', 'Python sorts with Timsort: O(n log n), stable (equal items keep their order), and O(n) on already-sorted data. Sort by several criteria by sorting on a tuple key, or by sorting twice from least to most important.'],
  ],
  edges: [
    ['`[[0] * m] * n`', 'n references to one row. Use `[[0] * m for _ in range(n)]`.'],
    ['`xs = xs.sort()`', '`sort()` returns `None`, so `xs` becomes `None`. Use `xs.sort()` or `xs = sorted(xs)`.'],
    ['Mutating while iterating', 'Removing items skips elements. Iterate over a copy or build a new list.'],
    ['`+=` versus `+`', '`xs += ys` mutates in place, so aliases change. `xs = xs + ys` builds a new list. Matters inside functions and for default arguments.'],
    ['`xs * 0` and `xs[:0]`', 'Both give a new empty list. `xs.clear()` and `del xs[:]` empty the list in place.'],
    ['Slice assignment', '`xs[1:3] = [9]` replaces two items with one and changes the length. `xs[::2] = [...]` (extended slice) requires the same length.'],
    ['Comparing lists', '`[1, 2] < [1, 3]` compares element by element. Comparing with `==` is value equality; `[nan] == [nan]` is True only when the same NaN object is used (identity shortcut).'],
    ['`list(str)` and `list(dict)`', '`list("abc")` is characters. `list(d)` is the keys. `list(range(0))` is `[]`.'],
    ['Sorting mixed types', '`TypeError` for `[1, "a"]`. Provide a `key` that maps to a comparable type, or filter first.'],
    ['`xs.index(v)` on missing value', 'Raises `ValueError`. Check with `in`, or catch it.'],
    ['`pop()` on an empty list', '`IndexError: pop from empty list`. Guard with `if xs`.'],
    ['Unhashable items', 'Lists cannot be set members or dict keys. Convert to a tuple for those uses.'],
  ],
  cost: [
    ['xs[i], xs[i] = v, len(xs)', 'O(1)', ''],
    ['append, pop()', 'O(1) amortised', 'At the end.'],
    ['insert(i, x), pop(i), del xs[i]', 'O(n - i)', 'Shifts items after i.'],
    ['remove(v), index(v), count(v), v in xs', 'O(n)', 'Linear scans with `==`.'],
    ['xs[a:b]', 'O(b - a)', 'Copies the slice.'],
    ['xs + ys, xs * k', 'O(n + m), O(nk)', 'New list.'],
    ['extend(ys)', 'O(m)', 'In place.'],
    ['sort(), sorted(xs)', 'O(n log n)', 'O(n) when already sorted; extra space up to O(n).'],
    ['reverse()', 'O(n)', 'In place.'],
    ['min, max, sum', 'O(n)', 'Single pass.'],
    ['copy, list(xs), xs[:]', 'O(n)', 'Shallow.'],
    ['deepcopy', 'O(total)', 'Visits every nested object.'],
  ],
  internals: [
    ['Timsort', 'Finds natural runs (already ordered stretches), extends short runs with insertion sort, and merges runs with a galloping merge. It is stable, performs n - 1 comparisons on sorted input, and needs up to n/2 extra pointers. `list.sort` and `sorted` both use it.'],
    ['In-place identity', 'Methods like `sort`, `+=` and slice assignment keep the same object (same `id`), so every alias sees the change. Rebinding (`xs = sorted(xs)`) creates a new object and leaves aliases pointing at the old one.'],
    ['Iteration state', 'A list iterator stores the list and a position. That explains skipped items after removal, and why appending during iteration extends the loop (the iterator keeps checking the current length).'],
    ['Why the key function runs once per item', 'The decorated keys are computed up front and kept in a temporary array, so an expensive key (parsing, regex) is called n times, not n log n times.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What is the difference between `sort()` and `sorted()`?',
      a: '`xs.sort()` sorts the list in place and returns `None`. `sorted(iterable)` returns a new sorted list from any iterable and leaves the original untouched. Both accept `key=` and `reverse=` and are stable.',
      follow: [
        ['How do you sort by length, then alphabetically?', '`sorted(words, key=lambda w: (len(w), w))`. A tuple key compares item by item.'],
        ['How do you sort descending by one field and ascending by another?', 'Negate numeric keys (`(-score, name)`), or sort twice from least significant to most (stability makes it work), or use `functools.cmp_to_key` for complex rules.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'How do you remove duplicates from a list while keeping order?',
      a: '`list(dict.fromkeys(xs))`. Dicts preserve insertion order, so the first occurrence of each item wins. It is O(n) and requires hashable items. For unhashable items, a loop with a list of seen items works but is O(n^2) in the worst case. `list(set(xs))` removes duplicates but loses order.',
      follow: [
        ['What if items are unhashable (lists)?', 'Convert each to a tuple for the seen-set key, or use a key function, or fall back to O(n^2) comparison with `in`.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Rotate an array by k positions in place. Give two approaches.',
      a: 'Slicing: `xs[:] = xs[-k:] + xs[:-k]` after `k %= len(xs)`, O(n) time and O(n) temporary space. Three reversals: reverse the whole list, then reverse the first k items and the last n - k items, O(n) time, O(1) extra space. Handle `k == 0`, `k > n`, negative k and an empty list explicitly.',
      follow: [
        ['Why does the reversal trick work?', 'Reversing everything moves the last k items to the front but backwards; reversing the two parts restores their internal order, which composes to a rotation.'],
        ['Why `xs[:] = ...` rather than `xs = ...`?', 'The slice assignment mutates the original list object, so callers holding it see the rotation. Rebinding would only change the local name.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Merge two sorted lists and discuss the options.',
      a: 'Two pointers: compare the heads, append the smaller, advance; O(n + m) time, O(n + m) output. `heapq.merge(a, b)` is lazy and generalises to k lists with O(log k) per item. `sorted(a + b)` is simplest and, thanks to Timsort detecting two runs, is close to O(n + m) in practice. In place into a pre-sized buffer (the LeetCode variant), fill from the end to avoid overwriting unread items.',
      follow: [
        ['What is the stability requirement?', 'If equal items from the first list must come first, use `<=` when comparing the heads. `heapq.merge` and Timsort keep the first iterable first for ties.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'A service builds a 10-million item list and then repeatedly checks `if x in big_list`. Production is slow. Diagnose and fix.',
      a: 'Each check is O(n), so the cost is O(queries * n). Profile to confirm, then replace the list with a set (O(1) average membership) built once, or a sorted list with `bisect` (O(log n)) if memory or ordering matters. If items are unhashable, derive hashable keys. Mention memory (a set costs more per item than a list), whether the data changes (a set handles inserts; a sorted list needs `insort` which is O(n)), and measure again.',
      follow: [
        ['What if the set does not fit in memory?', 'Use a Bloom filter for approximate membership with a bounded false-positive rate, a database or key-value store, or partition the data and query the right shard.'],
      ],
    },
  ],
};
