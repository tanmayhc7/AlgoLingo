/* Interview depth: How memory holds an array. */
window.DEPTH = {
  thesis:
    'A C array is values side by side, so element i is at `base + i * size`: one multiply, one load, and the neighbours share a cache line. A Python list is a block of pointers to objects stored elsewhere, so every access is a hop and every element is its own allocation. Almost every performance and memory question about lists and arrays comes back to that difference.',
  why: [
    ['Contiguity is a performance feature', 'CPUs load memory in cache lines (typically 64 bytes). Scanning a C `int[]` uses every byte of each line it loads. Scanning a Python list loads pointers, then chases each one to an object that may be anywhere, so it misses the cache far more often. This is why numeric loops are 10 to 100 times slower in pure Python.'],
    ['Pointers are why lists are flexible', 'Because slots only hold addresses, the same list can hold an int, a string, another list and `None`, and an element can be shared by several lists. The price is the extra allocation per element and the indirection.'],
    ['Amortised growth, not magic', 'A list reserves spare slots and grows by a proportional amount when full, so a sequence of appends costs O(1) each on average even though an occasional append copies everything. The same argument applies to a C `realloc` growth policy and to hash table resizes.'],
    ['Choose the representation to match the data', 'Heterogeneous or small data: `list`. Large homogeneous numeric data: `array.array`, `bytearray` or NumPy. Fixed record: `tuple`, `namedtuple` or a dataclass. Millions of tiny objects: consider `__slots__` or columnar storage.'],
  ],
  edges: [
    ['Out-of-bounds access', 'Python raises `IndexError` at the line that made it. C reads or writes adjacent memory: undefined behaviour, a classic source of crashes and security bugs (buffer overflow).'],
    ['Negative indexes', '`xs[-1]` is the last item, `xs[-len(xs)]` is the first, and `xs[-len(xs) - 1]` is an error. Off-by-one in negative indexing is as easy as in positive.'],
    ['Sizes of C arrays', '`sizeof` on an array parameter gives the pointer size, because arrays decay to pointers when passed. Pass the length explicitly.'],
    ['Element sharing', '`[obj] * n` puts the same object in all slots. Fine for immutable values, a bug for lists and dicts.'],
    ['Empty list', 'Allocates no item block until the first append. `max([])` raises `ValueError`; `sum([])` is 0.'],
    ['Shrinking', 'A list releases spare room when its length falls below about half the allocation, so repeated append and pop at a boundary does not thrash.'],
    ['Alignment and padding in C', 'Structs are padded to alignment boundaries, so `sizeof(struct)` can exceed the sum of fields. Reorder fields (largest first) to shrink them.'],
    ['Mixed types and sorting', 'A list holding `1` and `"a"` is legal, but sorting it raises `TypeError` in Python 3.'],
    ['Row-major order', 'C stores a 2-D array row by row. Looping over columns in the inner loop jumps by whole rows and thrashes the cache; swap loops to walk memory in order. The same principle applies to NumPy (C order by default).'],
  ],
  cost: [
    ['C a[i]', 'O(1), 1 load', 'Address arithmetic plus one memory read.'],
    ['Python xs[i]', 'O(1), 2 loads', 'Read the pointer, then the object. Plus bounds check and type dispatch.'],
    ['append (amortised)', 'O(1)', 'Occasionally O(n) when the block grows by about 12.5 percent plus a constant.'],
    ['insert(0, x), pop(0), del xs[0]', 'O(n)', 'Moves every item (a `memmove` of pointers).'],
    ['pop() from the end', 'O(1)', 'Decrements the length.'],
    ['xs + ys', 'O(n + m)', 'New list.'],
    ['xs.extend(ys), xs += ys', 'O(m) amortised', 'In place.'],
    ['x in xs', 'O(n)', 'Scans; compares by identity first, then equality.'],
    ['sort()', 'O(n log n)', 'Timsort, stable, adaptive to runs; O(n) on sorted input.'],
    ['memory per int in a list', '8 + 32 bytes', 'An 8-byte slot plus a 28-byte int object rounded up to 32 by the allocator (small ints are shared).'],
    ['array.array("i")', '4 bytes/item', 'Raw machine ints. About 10 times smaller than a list of ints.'],
  ],
  internals: [
    ['The list object', 'A list is a header (reference count, type, length, allocated size) and a pointer to a separate, heap-allocated array of `PyObject*`. `len` reads the stored length; `append` writes into spare capacity or reallocates. The growth formula is roughly `new = n + n/8 + 6`, rounded down to a multiple of 4, which gives capacities 4, 8, 16, 24, 32, 40, 52, 64...'],
    ['Why `array.array` and NumPy are faster', 'They store raw values contiguously with a single type, so loops run in C over packed memory, avoid per-element objects, and can use SIMD instructions. Conversion costs apply when moving between a list and an array.'],
    ['What is inside an int object', 'Reference count (8 bytes), type pointer (8), size (8) and one or more 30-bit digits (4 each) give 28 bytes for small values. A float object is 24 bytes. That overhead is why Python memory use is several times the "natural" size of the data.'],
    ['`memoryview` and the buffer protocol', 'A `memoryview` is a zero-copy window onto the bytes of an object that exposes a buffer (`bytes`, `bytearray`, `array`, NumPy). Slicing it does not copy, which matters when parsing big binary data.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'How is a Python list stored in memory and how does it differ from a C array?',
      a: 'A Python list is an object holding a pointer to a heap array of pointers to objects, with a length and a capacity. A C array stores the values themselves, contiguously. So a list can be heterogeneous and can grow, but each access follows a pointer, each element is a separate object, and memory use is several times higher.',
      follow: [
        ['How much memory does a list of one million small ints take?', 'About 8 MB for the pointers. Small ints are shared (up to 256), but values beyond that are separate 28 to 32-byte objects, so roughly 40 MB in total. `array.array("i")` would be 4 MB.'],
        ['Why is iterating a NumPy array faster than a list?', 'Contiguous typed storage (good cache use), no per-element objects or pointer chasing, and the loop runs in compiled C, not in the bytecode interpreter.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why is `append` O(1) amortised and `insert(0, x)` O(n)?',
      a: '`append` writes into spare capacity. When capacity runs out, the list allocates a larger block and copies the pointers, but because capacity grows proportionally, the total copying over n appends is O(n), giving O(1) average per append. `insert(0, x)` must move every existing pointer one slot to make room, which is O(n) every time.',
      follow: [
        ['Prove amortised O(1) for doubling.', 'With capacity doubling, resize copies cost 1 + 2 + 4 + ... + n/2 < n in total across n appends, so the average extra cost per append is under one copy. For CPython\'s smaller factor (about 1.125) the argument is the same with a larger constant.'],
        ['What would you use for a queue?', '`collections.deque`: O(1) appends and pops at both ends, built from linked blocks. The trade-off is O(n) indexing in the middle.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'You have to store 100 million small integers in Python. What are your options and trade-offs?',
      a: 'A list would cost around 4 GB or more (pointers plus int objects). Options: `array.array("I")` or `numpy.ndarray` with a fitting dtype (400 MB for 32-bit values) with fast vectorised operations; `bytearray` for byte-sized values; memory-mapping a file (`numpy.memmap`) when data exceeds RAM; or a compressed or columnar format (Parquet). Trade-offs: typed arrays hold one type, appends and resizes are costlier, and Python-level loops over them are slower than list loops, so vectorise.',
      follow: [
        ['What changes if values need arbitrary precision?', 'Typed arrays overflow or cannot represent them. You would use a list of Python ints, `numpy` object arrays (slow), or split into limbs, or rethink the representation (modular arithmetic, a big-number library).'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain cache locality using a C 2-D array and show a fix.',
      a: 'C stores `a[i][j]` row-major. Looping `for j: for i: sum += a[i][j]` jumps a whole row between accesses, so each load can miss the cache. Swapping to `for i: for j:` walks consecutive addresses, using each cache line fully, and can be several times faster for large arrays. The same applies to NumPy (C order by default) and to image or matrix code in any language; blocking (tiling) improves it further for matrix multiply.',
      follow: [
        ['Does the interchange matter in pure Python lists of lists?', 'Less, because the elements are objects scattered in memory anyway, and interpreter overhead dominates. It matters a lot for NumPy and C.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'What is the difference between `del xs[i]`, `xs.pop(i)` and `xs.remove(v)`?',
      a: '`del xs[i]` removes by position and returns nothing. `pop(i)` removes by position and returns the item (default last). `remove(v)` searches for the first item equal to `v` (O(n)) and removes it, raising `ValueError` if absent. All except removing the last item shift later elements, so they are O(n).',
      follow: [
        ['How do you remove many items efficiently?', 'Build a new list with a comprehension in one O(n) pass (`xs[:] = [x for x in xs if keep(x)]` to keep the same object), not repeated `remove` calls, which would be O(n^2).'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Design an append-only buffer in C that grows safely, and say how it relates to Python lists.',
      a: 'Keep `data`, `len`, `cap`. On push, if `len == cap`, grow `cap` (double, or by 1.5 to reuse freed blocks), call `realloc` into a temporary and check for NULL before replacing `data` (otherwise you leak and lose the original on failure). Guard against overflow in `cap * sizeof(T)`. Python lists do the same with a smaller growth factor, store pointers rather than values, and shrink when length drops below half. Return an error code instead of aborting where the caller can recover.',
      follow: [
        ['Why not grow by a fixed amount each time?', 'Adding a constant k makes n pushes cost O(n^2 / k), because every k pushes you copy everything. Proportional growth keeps it linear overall.'],
        ['What are the iterator invalidation rules?', 'After a realloc, previously held pointers into the buffer are dangling. Hold indexes, or re-derive pointers after any operation that can grow the buffer. Python lists avoid the problem by exposing indexes only.'],
      ],
    },
  ],
};
