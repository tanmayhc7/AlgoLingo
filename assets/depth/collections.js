/* Interview depth: collections module. */
window.DEPTH = {
  thesis:
    'The `collections` module exists to replace patterns you would otherwise hand-roll badly: `Counter` for tallies, `defaultdict` for grouping, `deque` for queues and sliding windows, `OrderedDict` for recency, `namedtuple` for records. Knowing the cost model of each (especially that `deque` indexing is O(n) in the middle) is what separates fluent from merely familiar.',
  why: [
    ['Use the type that states your intent', '`Counter(words)` says "count"; `defaultdict(list)` says "group"; `deque` says "queue or window". Readers and reviewers see the intent immediately, and the standard types are faster than manual versions.'],
    ['`deque` fixes the list queue problem', 'A list `pop(0)` is O(n). A deque offers O(1) at both ends, which is what BFS, sliding windows and queues need.'],
    ['Counter is a multiset', 'Beyond counting, it supports arithmetic: `+`, `-`, `&` (min), `|` (max), `most_common`, and `elements()`. Useful for anagrams, ransom notes and multiset comparison.'],
    ['Know when not to use them', 'A plain dict is fine for most cases. `deque` is wrong for random access; `Counter` hides zero and negative counts subtly; `OrderedDict` is mostly superseded by ordered dicts except for `move_to_end` and order-sensitive equality.'],
  ],
  edges: [
    ['`Counter` missing key', 'Returns 0 and does not insert. A `defaultdict(int)` inserts on read.'],
    ['`Counter` subtraction', '`c1 - c2` drops zero and negative counts; `c1.subtract(c2)` keeps them (in place).'],
    ['`most_common` ties', 'Order among equal counts is by first insertion (stable). Do not rely on it unless specified.'],
    ['`deque(maxlen=n)`', 'Appending beyond `maxlen` silently discards from the other end. Great for sliding windows, surprising if unexpected.'],
    ['`deque` indexing', '`d[i]` is O(n) in the middle (O(1) near the ends). Slicing a deque is not supported.'],
    ['`deque` is not thread-safe for compound operations', 'Single `append`/`popleft` are atomic, but check-then-act sequences are not. Use `queue.Queue` for producer-consumer with blocking.'],
    ['`defaultdict` factory', 'Takes a callable with no arguments: `defaultdict(list)`, not `defaultdict([])`. `defaultdict(lambda: [0, 0])` for composite defaults.'],
    ['`defaultdict.get` and `in`', 'These do not trigger the factory; only `d[k]` does.'],
    ['`namedtuple` mutation', 'Immutable: use `_replace` to make a modified copy.'],
    ['`popleft` on an empty deque', '`IndexError`. Check truthiness first.'],
    ['`OrderedDict` equality', 'Compares order too, unlike a plain dict. `OrderedDict == dict` ignores order.'],
  ],
  cost: [
    ['deque append, appendleft, pop, popleft', 'O(1)', 'Blocks of 64 pointers.'],
    ['deque d[i]', 'O(n) worst case', 'Middle indexing walks blocks.'],
    ['deque rotate(k)', 'O(k)', ''],
    ['Counter(iterable)', 'O(n)', 'Single pass.'],
    ['Counter.most_common(k)', 'O(n log k)', 'Heap based; no argument sorts.'],
    ['Counter a + b, a & b', 'O(n + m)', ''],
    ['defaultdict access', 'O(1) avg', 'Plus factory call on miss.'],
    ['OrderedDict move_to_end, popitem', 'O(1)', 'Doubly linked list under the hood.'],
    ['namedtuple field access', 'O(1)', 'Slightly slower than plain index in older versions; fine today.'],
  ],
  internals: [
    ['deque is a doubly linked list of blocks', 'Each block holds 64 items; appends and pops at the ends touch only the end blocks. That gives O(1) ends, good cache behaviour within blocks, and O(n/64) middle access.'],
    ['Counter is a dict subclass', 'It overrides `__missing__` to return 0 and adds multiset methods. Counting uses a C helper (`_count_elements`) so `Counter(xs)` is much faster than a Python loop.'],
    ['defaultdict hooks `__missing__`', '`dict.__getitem__` calls `__missing__` on a miss; `defaultdict` implements it by calling the factory and storing the result. Any dict subclass can do likewise.'],
    ['`namedtuple` generates a class', 'It builds a tuple subclass with `__slots__ = ()` and property accessors, so instances have no `__dict__` and are as small as a tuple.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Implement BFS on a grid. Which container and why?',
      a: 'A `deque` as the frontier: `popleft` and `append` are O(1). Mark visited when enqueuing (not when dequeuing) to avoid duplicate entries. Store `(r, c, dist)` or process level by level using `len(queue)`. A list with `pop(0)` would make the whole search O(n^2).',
      follow: [
        ['Why mark visited on enqueue?', 'If you mark on dequeue, the same cell can be queued multiple times before it is processed, wasting time and memory (and in bad cases blowing up the queue).'],
        ['How do you track the distance?', 'Store the distance in the queue entry, or iterate in layers: for each level, process exactly `len(queue)` items and increment a level counter.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Check whether two strings are anagrams, and a ransom note can be built from a magazine.',
      a: 'Anagram: `Counter(a) == Counter(b)`, O(n). Ransom note: `not (Counter(note) - Counter(magazine))` — subtraction keeps only positive deficits, so empty means the magazine has enough of each letter. Edge cases: case, spaces, unicode, different lengths (quick reject).',
      follow: [
        ['How do you do it with O(1) space for lowercase letters?', 'A fixed array of 26 counts, incremented for one string and decremented for the other; all zeros means anagrams.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Sliding window maximum in O(n).',
      a: 'Keep a deque of indices whose values are in decreasing order. For each new index `i`: pop from the back while the new value is greater or equal (they can never be the max), append `i`, pop from the front if its index has left the window, and the front is the current maximum. Every index is pushed and popped at most once, so O(n) time and O(k) space.',
      follow: [
        ['Why store indices, not values?', 'To know when the front has slid out of the window, and to handle duplicates by position.'],
        ['What breaks if you use a heap instead?', 'It works in O(n log n) with lazy deletion of expired indices; the deque solution is faster and simpler.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'When would you use `defaultdict` versus `dict.setdefault` versus `Counter`?',
      a: '`Counter` when the value is a count and you want multiset operations. `defaultdict(factory)` when many keys need a fresh container (list, set, int) and you access with `d[k]` frequently; it is the cleanest and fastest. `setdefault` for a one-off default without changing the dict type, or when you must not insert on read elsewhere. Beware that `defaultdict` inserts on mere reads, which can cause surprising growth and make `len(d)` misleading.',
      follow: [
        ['How do you stop a defaultdict from creating keys on lookup?', 'Use `d.get(k)` or `k in d` for read-only checks, or convert to a plain dict (`dict(d)`) after building.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Design a rate limiter that allows N requests per minute per user using these structures.',
      a: 'Sliding-window log: per user, a `deque` of request timestamps; on each request pop timestamps older than 60 seconds from the left, reject if `len(dq) >= N`, otherwise append now. O(1) amortised per request and O(N) memory per user. A `defaultdict(deque)` keys users. Alternatives: fixed window counters (cheap but allow bursts at boundaries), token bucket (smooth, O(1) memory per user), sliding-window counter (approximation using two windows). In a distributed setting, state goes in Redis with atomic scripts, with clock-skew and failure-mode decisions (fail open or closed).',
      follow: [
        ['What are the memory risks?', 'Inactive users leave deques behind; evict by TTL. Large N means large deques; switch to a token bucket or counter approximation.'],
      ],
    },
  ],
};
