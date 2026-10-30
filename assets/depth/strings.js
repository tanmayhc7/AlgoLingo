/* Interview depth: Strings as sequences. */
window.DEPTH = {
  thesis:
    'A Python `str` is an immutable sequence of Unicode code points. That one sentence answers most interview questions about it: why indexing is O(1) but "changing" a string is O(n), why strings are valid dict keys, why concatenating in a loop is risky, and why `len` is not the byte count or the number of characters a user sees.',
  why: [
    ['Immutability buys four things', 'Hashability (strings can be dict keys and set members), safe sharing between names and threads, the possibility of interning, and cached hashes. The price is that every "change" builds a new string, so use a list of pieces and `"".join` when building.'],
    ['Think in code points, bytes and glyphs', '`str` holds code points. `bytes` holds raw bytes, produced by `.encode("utf-8")`. What a user sees as one character can be several code points (an accent as a separate combining mark, an emoji with a skin tone). Be able to say which of the three a problem means.'],
    ['Slicing is copying', '`s[a:b]` builds a new string of that length. It never raises for out-of-range bounds, which is convenient and hides bugs. Indexing `s[i]` does raise `IndexError`.'],
    ['Methods return new strings', '`s.upper()`, `s.strip()`, `s.replace()` all return a new string and leave `s` alone. Forgetting to use the return value (`s.strip()` on its own line) is the most common beginner bug.'],
  ],
  edges: [
    ['Empty string', '`""` is falsy, `"".split()` is `[]`, `"".join([])` is `""`, `max("")` raises `ValueError`, and `"abc".startswith("")` is True. Name it as a case in every string problem.'],
    ['`split()` versus `split(" ")`', '`"a  b".split()` gives `["a", "b"]`; `.split(" ")` gives `["a", "", "b"]`. The no-argument form splits on any whitespace run and drops leading and trailing blanks.'],
    ['`strip("abc")` takes a set of characters', 'It removes any of those characters from the ends, not the substring "abc". Use `removeprefix` and `removesuffix` (3.9+) for substrings.'],
    ['`str.isdigit()` is broader than 0-9', '`"²".isdigit()` is True but `int("²")` fails. `isdecimal()` is stricter. Meanwhile `int("٣")` (Arabic-Indic three) works. Validate with `isascii() and isdigit()` when only ASCII is acceptable.'],
    ['Case folding', '`"ß".lower()` is `"ß"`, but `"ß".casefold()` is `"ss"`. For caseless comparison use `casefold()`, and consider `unicodedata.normalize("NFC", s)` first.'],
    ['`len` counts code points', '`len("e\\u0301")` is 2 even though it displays as one character. `len("😀".encode())` is 4 bytes but `len("😀")` is 1.'],
    ['Comparison', 'Lexicographic by code point, so `"Z" < "a"` and `"10" < "9"`. Sorting strings of digits as strings is wrong for numeric order; give `key=int`.'],
    ['Reversing', '`s[::-1]` reverses code points, which can split combining marks from their base. Fine for ASCII problems, not for arbitrary text.'],
    ['Mutation attempts', '`s[0] = "x"` raises `TypeError`. Convert to a list, edit, and join: `chars = list(s); chars[0] = "x"; "".join(chars)`.'],
  ],
  cost: [
    ['len(s), s[i]', 'O(1)', 'Length is stored; the string uses a fixed width per character (1, 2 or 4 bytes) so indexing is direct.'],
    ['s[a:b]', 'O(b - a)', 'Copies the slice.'],
    ['s + t', 'O(len(s) + len(t))', 'Builds a new string. Repeated in a loop it is O(n^2) overall.'],
    ['"".join(parts)', 'O(total)', 'Computes the final size once, then copies each piece once.'],
    ['t in s, s.find(t)', 'O(n) typical', 'Optimised search (a mix of Boyer-Moore-Horspool and Two-Way). Worst case was made linear in 3.10 for long needles.'],
    ['s == t', 'O(n)', 'Compares lengths and contents; interned strings may short-circuit on identity.'],
    ['s.split(), s.replace()', 'O(n)', 'One pass, plus allocating each piece.'],
    ['sorted(s)', 'O(n log n)', 'Returns a list of characters. Basis of the anagram key.'],
    ['hash(s)', 'O(n) once', 'Cached on the object after the first call, so dict lookups are fast afterwards.'],
  ],
  internals: [
    ['Flexible string representation (PEP 393)', 'CPython stores a string using 1 byte per character if all code points are below 256, 2 bytes if below 65536, otherwise 4. One emoji in a megabyte of ASCII quadruples the memory. Indexing stays O(1) because the width is uniform within a string.'],
    ['`+=` sometimes looks fast', 'CPython has an optimisation: if the left string has a single reference, `s += t` can resize in place. It is an implementation detail that does not hold for attributes, other implementations, or when another name shares the string. Do not rely on it.'],
    ['Interning', 'Identifier-like literals and compile-time constants are interned so equal ones share one object, which speeds dict lookup by identity. `sys.intern(s)` interns on demand, useful when you compare a few distinct strings millions of times.'],
    ['`str` versus `bytes`', 'Reading a file in binary mode gives `bytes`; text mode decodes with an encoding (UTF-8 by default in most setups, but pass `encoding="utf-8"` explicitly). Mixing them raises `TypeError`. Network and file protocols are bytes; user-facing text is `str`.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Why can you use a string as a dict key but not a list?',
      a: 'Dict keys must be hashable, meaning the hash must never change while the key is stored. Strings are immutable, so their hash is stable (and cached). A list can change, so its hash would change and the key would be lost in the table, so Python refuses to hash it.',
      follow: [
        ['What would you use as a key if you had a list?', 'Convert to a tuple (if its items are hashable): `d[tuple(xs)]`. For a set of items, `frozenset(xs)`.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What is the cost of building a string with `+=` in a loop, and what do you do instead?',
      a: 'Each concatenation allocates a new string and copies the old contents, so total work is O(n^2) in the worst case. Append the pieces to a list and call `"".join(parts)` once, which is O(n). CPython sometimes optimises `+=` in place, but it is not guaranteed.',
      follow: [
        ['Does `+` on two strings ever get faster than O(n)?', 'No, the result must hold every character, so the copy is at least linear in the result size. The saving from `join` is avoiding the repeated copies of the intermediate results.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Check whether two strings are anagrams. Give two approaches and their costs.',
      a: 'Sorting: `sorted(a) == sorted(b)`, O(n log n) time, O(n) space. Counting: `Counter(a) == Counter(b)`, O(n) time, O(k) space for k distinct characters; for lowercase ASCII a fixed 26-slot array works. First check `len(a) == len(b)` to exit early. Handle case and spaces according to the spec.',
      follow: [
        ['How would you group a list of words into anagram classes?', 'Use a canonical key per word: `"".join(sorted(w))`, or a tuple of 26 counts, and a dict from key to list of words. Cost O(N * L log L) with sorted keys, or O(N * L) with count tuples.'],
        ['What changes with Unicode input?', 'Normalise (NFC or NFKC) and case-fold first, and decide whether combining marks count. Counting by code point still works; counting by 26 slots does not.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'What does `len("é")` return, and why might it differ from what the user sees?',
      a: 'It depends on how the text was written. Precomposed `"\\u00e9"` has length 1; `"e\\u0301"` (e plus a combining accent) has length 2 and looks identical. `len` counts code points. `unicodedata.normalize("NFC", s)` composes where possible; grapheme-aware counting needs a library such as `regex` with `\\X`.',
      follow: [
        ['How does that affect comparison and dict lookups?', 'The two forms are different strings, so `==` is False and they are different dict keys. Normalise on input (usually NFC) before storing or comparing.'],
        ['How many bytes is it in UTF-8?', 'The precomposed one is 2 bytes, the decomposed is 3 (1 for e, 2 for the combining mark). `len(s.encode("utf-8"))` gives the byte count.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Implement "reverse the words in a string" and discuss edge cases.',
      a: '`" ".join(reversed(s.split()))`. `split()` handles multiple, leading and trailing spaces and the empty string, returning `[]`, which joins to `""`. Cost O(n). If the spec says to preserve the original spacing, use `re.split(r"(\\s+)", s)` and reverse the non-space tokens. In-place requirements (C-style) mean a list of characters: reverse the whole buffer, then reverse each word.',
      follow: [
        ['Why is "in place" not possible on a Python str?', 'Strings are immutable. You can only convert to a list or `bytearray`, edit, and convert back, so the O(1) extra space claim does not apply to Python the way it does to C.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'You parse a 5 GB log of text lines. What string-handling choices keep memory and time reasonable?',
      a: 'Stream: iterate over the file object line by line rather than `read()` or `readlines()`. Open in binary and work on `bytes` if the format is ASCII-safe, to skip decoding. Use `str.partition` or `split(maxsplit=n)` to avoid full splits, compiled `re` for patterns used repeatedly, `sys.intern` or a dict to share repeated tokens, and generators to avoid materialising lists. Profile before choosing; an `mmap` or a vectorised tool (`pandas`, `polars`, `ripgrep`) may beat hand-written loops.',
      follow: [
        ['What goes wrong if one line is enormous?', 'A line iterator buffers the whole line, so a single multi-gigabyte line exhausts memory. Read fixed-size chunks and handle boundaries yourself, or reject lines over a limit.'],
      ],
    },
  ],
};
