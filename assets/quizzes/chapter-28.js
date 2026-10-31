/* Chapter 28 quiz: Data in and out. */
window.QUIZ = {
  "chapter": 28,
  "title": "Data in and out",
  "lede": "JSON, JSONL and text handling.",
  "questions": [
    {
      "type": "mcq",
      "q": "What does <code>json.loads(\"null\")</code> return in Python?",
      "options": [
        "\"null\"",
        "None",
        "It raises an error"
      ],
      "answer": 1,
      "why": "JSON null maps to None, and a bare top-level value is valid JSON."
    },
    {
      "type": "mcq",
      "q": "Why is JSONL (one JSON object per line) good for large datasets?",
      "options": [
        "It compresses better",
        "You can stream it and one bad line only loses that record",
        "It allows comments"
      ],
      "answer": 1,
      "why": "Lines are independent documents, so memory stays constant and errors stay local."
    },
    {
      "type": "complete",
      "q": "Fill in the blanks so <code>read_jsonl</code> parses each non-empty line and counts the lines that are not valid JSON.",
      "starter": "import json\n\ndef read_jsonl(text):\n    rows, bad = [], 0\n    for line in text.splitlines():\n        if not line.strip():\n            continue\n        try:\n            rows.append(json.___(line))\n        except json.___:\n            bad += 1\n    return rows, bad\n",
      "tests": [
        {
          "expr": "read_jsonl('{\"a\": 1}\\n\\nnot json\\n{\"b\": 2}')",
          "want": "([{'a': 1}, {'b': 2}], 1)"
        },
        {
          "expr": "read_jsonl('')",
          "want": "([], 0)"
        },
        {
          "expr": "read_jsonl('[1]\\n[2]')",
          "want": "([[1], [2]], 0)"
        }
      ],
      "hint": "One function parses a string; the error for malformed JSON is a class in the json module.",
      "solution": "import json\n\ndef read_jsonl(text):\n    rows, bad = [], 0\n    for line in text.splitlines():\n        if not line.strip():\n            continue\n        try:\n            rows.append(json.loads(line))\n        except json.JSONDecodeError:\n            bad += 1\n    return rows, bad\n",
      "why": "Catching the error per line keeps one corrupt record from ending the job, and the count tells you how much was skipped."
    },
    {
      "type": "write",
      "q": "Write <code>clean_text(s)</code>: collapse every run of whitespace to a single space, strip the ends and lowercase the result.",
      "starter": "import re\n\ndef clean_text(s):\n    # your code\n",
      "tests": [
        {
          "expr": "clean_text('  Hi  \\tYo \\n')",
          "want": "'hi yo'"
        },
        {
          "expr": "clean_text('')",
          "want": "''"
        },
        {
          "expr": "clean_text('ONE')",
          "want": "'one'"
        },
        {
          "expr": "clean_text('a\\n\\nb')",
          "want": "'a b'"
        }
      ],
      "hint": "re.sub(r\"\\s+\", \" \", s) collapses runs; then strip and lower.",
      "solution": "import re\n\ndef clean_text(s):\n    return re.sub(r\"\\s+\", \" \", s).strip().lower()\n",
      "why": "Small named steps are easy to test: collapse whitespace, strip, lowercase."
    },
    {
      "type": "write",
      "q": "Write <code>chunk(items, size, overlap)</code> returning windows of <code>size</code> items that advance by <code>size - overlap</code> (the last window may be shorter).",
      "starter": "def chunk(items, size, overlap):\n    # your code\n",
      "tests": [
        {
          "expr": "chunk(list(range(8)), 4, 1)",
          "want": "[[0, 1, 2, 3], [3, 4, 5, 6], [6, 7]]"
        },
        {
          "expr": "chunk([1, 2, 3], 5, 1)",
          "want": "[[1, 2, 3]]"
        },
        {
          "expr": "chunk([], 3, 1)",
          "want": "[]"
        },
        {
          "expr": "chunk(list('abcd'), 2, 0)",
          "want": "[['a', 'b'], ['c', 'd']]"
        }
      ],
      "hint": "step = size - overlap; for i in range(0, len(items), step): slice items[i:i + size].",
      "solution": "def chunk(items, size, overlap):\n    step = size - overlap\n    return [items[i:i + size] for i in range(0, len(items), step)]\n",
      "why": "The window advances by size minus overlap, so neighbouring chunks share overlap items."
    },
    {
      "type": "debug",
      "q": "<code>parse_all</code> should return every line that is valid JSON and skip the bad ones, but it stops at the first bad line. Fix it.",
      "starter": "import json\n\ndef parse_all(lines):\n    rows = []\n    try:\n        for line in lines:\n            rows.append(json.loads(line))\n    except json.JSONDecodeError:\n        pass\n    return rows\n",
      "tests": [
        {
          "expr": "parse_all(['{\"a\": 1}', 'oops', '{\"b\": 2}'])",
          "want": "[{'a': 1}, {'b': 2}]"
        },
        {
          "expr": "parse_all(['1', '2'])",
          "want": "[1, 2]"
        },
        {
          "expr": "parse_all(['x', '3'])",
          "want": "[3]"
        }
      ],
      "hint": "The try must wrap one line, not the whole loop.",
      "solution": "import json\n\ndef parse_all(lines):\n    rows = []\n    for line in lines:\n        try:\n            rows.append(json.loads(line))\n        except json.JSONDecodeError:\n            pass\n    return rows\n",
      "why": "With the try outside the loop the first error ends everything. Inside the loop only the bad line is skipped."
    }
  ]
};
