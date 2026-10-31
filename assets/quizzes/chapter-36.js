/* Chapter 36 quiz: Python and the machine. */
window.QUIZ = {
  "chapter": 36,
  "title": "Python and the machine",
  "lede": "The GIL, floats, text encoding, byte order, modules and scripts.",
  "questions": [
    {
      "type": "mcq",
      "q": "Two threads each run a long pure-Python arithmetic loop. Compared with one thread, the program is:",
      "options": [
        "About twice as fast",
        "About the same speed or slower",
        "Faster only on Windows"
      ],
      "answer": 1,
      "why": "The GIL allows one thread to run Python bytecode at a time, so CPU-bound threads do not run in parallel."
    },
    {
      "type": "mcq",
      "q": "You need to make 200 slow API calls. What is the simplest speed-up?",
      "options": [
        "ProcessPoolExecutor with 200 processes",
        "A thread pool or asyncio",
        "Nothing helps"
      ],
      "answer": 1,
      "why": "Waiting on the network releases the GIL, so threads or asyncio overlap the waits."
    },
    {
      "type": "mcq",
      "q": "How many bytes does <code>\"€\".encode(\"utf-8\")</code> produce?",
      "options": [
        "1",
        "2",
        "3"
      ],
      "answer": 2,
      "why": "U+20AC is above 0x7FF, so UTF-8 uses three bytes."
    },
    {
      "type": "write",
      "q": "Write <code>is_close(a, b, rel=1e-9)</code>: True when the difference is at most <code>rel</code> times the larger magnitude.",
      "starter": "def is_close(a, b, rel=1e-9):\n    # your code\n",
      "tests": [
        {
          "expr": "is_close(0.1 + 0.2, 0.3)",
          "want": "True"
        },
        {
          "expr": "is_close(1, 2)",
          "want": "False"
        },
        {
          "expr": "is_close(0, 0)",
          "want": "True"
        },
        {
          "expr": "is_close(1e10, 1e10 + 1)",
          "want": "True"
        },
        {
          "expr": "is_close(1, 1.001)",
          "want": "False"
        }
      ],
      "hint": "abs(a - b) <= rel * max(abs(a), abs(b)). Check the zero case.",
      "solution": "def is_close(a, b, rel=1e-9):\n    return abs(a - b) <= rel * max(abs(a), abs(b))\n",
      "why": "A relative tolerance scales with the size of the numbers; exact equality of 0 and 0 still passes because 0 <= 0."
    },
    {
      "type": "complete",
      "q": "Fill in the blank to read the bytes with the <b>least significant byte first</b>.",
      "starter": "def le(b):\n    return int.from_bytes(b, \"___\")\n",
      "tests": [
        {
          "expr": "le(b'\\x02\\x01')",
          "want": "258"
        },
        {
          "expr": "le(b'\\x01\\x00\\x00\\x00')",
          "want": "1"
        },
        {
          "expr": "le(b'\\xff')",
          "want": "255"
        }
      ],
      "hint": "The byte order name for least significant first.",
      "solution": "def le(b):\n    return int.from_bytes(b, \"little\")\n",
      "why": "Most x86 and ARM machines are little-endian; network protocols use big-endian."
    },
    {
      "type": "write",
      "q": "Write <code>parse(argv)</code> using <code>argparse</code>: a required positional <code>path</code> (string) and an optional <code>--limit</code> (int, default 10). Return <code>(path, limit)</code>.",
      "starter": "import argparse\n\ndef parse(argv):\n    # your code\n",
      "tests": [
        {
          "expr": "parse(['a.txt', '--limit', '5'])",
          "want": "('a.txt', 5)"
        },
        {
          "expr": "parse(['b'])",
          "want": "('b', 10)"
        },
        {
          "expr": "parse(['--limit', '3', 'c.md'])",
          "want": "('c.md', 3)"
        }
      ],
      "hint": "p = argparse.ArgumentParser(); p.add_argument(...); args = p.parse_args(argv).",
      "solution": "import argparse\n\ndef parse(argv):\n    p = argparse.ArgumentParser()\n    p.add_argument(\"path\")\n    p.add_argument(\"--limit\", type=int, default=10)\n    a = p.parse_args(argv)\n    return a.path, a.limit\n",
      "why": "argparse converts types, handles option order and gives --help and error messages for free."
    },
    {
      "type": "write",
      "q": "Write <code>parts(path)</code> using <code>PurePosixPath</code>: return <code>(parent, stem, suffix)</code> as strings.",
      "starter": "from pathlib import PurePosixPath\n\ndef parts(path):\n    # your code\n",
      "tests": [
        {
          "expr": "parts('data/in/file.tar.gz')",
          "want": "('data/in', 'file.tar', '.gz')"
        },
        {
          "expr": "parts('x.txt')",
          "want": "('.', 'x', '.txt')"
        },
        {
          "expr": "parts('a/b')",
          "want": "('a', 'b', '')"
        }
      ],
      "hint": "p = PurePosixPath(path); p.parent, p.stem, p.suffix.",
      "solution": "from pathlib import PurePosixPath\n\ndef parts(path):\n    p = PurePosixPath(path)\n    return (str(p.parent), p.stem, p.suffix)\n",
      "why": "pathlib handles separators and suffixes consistently, instead of splitting strings by hand."
    },
    {
      "type": "debug",
      "q": "<code>to_iso(ts)</code> should return a UTC ISO timestamp with the offset, such as <code>2021-01-01T00:00:00+00:00</code>. The result has no timezone. Fix it.",
      "starter": "from datetime import datetime, timezone\n\ndef to_iso(ts):\n    return datetime.fromtimestamp(ts).isoformat()\n",
      "tests": [
        {
          "expr": "to_iso(1609459200)",
          "want": "'2021-01-01T00:00:00+00:00'"
        },
        {
          "expr": "to_iso(0)",
          "want": "'1970-01-01T00:00:00+00:00'"
        }
      ],
      "hint": "Pass a timezone to fromtimestamp.",
      "solution": "from datetime import datetime, timezone\n\ndef to_iso(ts):\n    return datetime.fromtimestamp(ts, timezone.utc).isoformat()\n",
      "why": "A naive datetime depends on the machine's local time zone; storing UTC with an offset is unambiguous."
    }
  ]
};
