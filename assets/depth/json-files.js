/* Interview depth: json-files. */
window.DEPTH = {
  "thesis": "JSON is the lingua franca of APIs, model output and datasets. json.loads and json.dumps convert between text and dicts, lists, strings, numbers, booleans and None. Files are read with pathlib or a with block, and large datasets use JSONL so they can be streamed and so one bad record only costs one line. Parsed data is untrusted: check keys and types before using it.",
  "why": [
    [
      "Everything is JSON",
      "API requests and responses, tool calls, model output, config and datasets all use it."
    ],
    [
      "Streaming datasets",
      "JSONL lets you process files larger than memory, one record at a time."
    ],
    [
      "Failure isolation",
      "Per-line error handling means one corrupt row does not stop a million-row job."
    ],
    [
      "First thing in any integration",
      "A forward deployed engineer reads customer data files in the first hour."
    ]
  ],
  "edges": [
    [
      "Missing keys",
      "data[\"x\"] raises KeyError; use .get(\"x\", default) when absence is normal."
    ],
    [
      "Types are not guaranteed",
      "A field may be null, a string instead of a number, or a list of one item."
    ],
    [
      "Non-string keys",
      "dumps turns int keys into strings, so loads(dumps(d)) may differ from d."
    ],
    [
      "Encoding",
      "Open files with encoding=\"utf-8\" and use ensure_ascii=False to keep non-English text readable."
    ],
    [
      "Big numbers and floats",
      "JSON has one number type; very large ints and NaN can behave differently between languages."
    ],
    [
      "Trailing commas and comments",
      "Not valid JSON; a model often adds them, so parsing can fail on a reply that looks fine."
    ]
  ],
  "cost": [
    [
      "loads / dumps",
      "O(size of the text)."
    ],
    [
      "Reading a JSONL file",
      "O(file size) time, O(one line) memory if streamed."
    ],
    [
      "json.load of a huge file",
      "Holds the whole structure in memory, often several times the file size."
    ],
    [
      "Pretty printing",
      "Costs extra bytes and time; use compact output for bulk data."
    ]
  ],
  "internals": [
    [
      "Type mapping",
      "object to dict, array to list, string to str, number to int or float, true/false to bool, null to None."
    ],
    [
      "Why JSONL",
      "Newline-delimited records make the file splittable and appendable without parsing the whole thing."
    ],
    [
      "JSONDecodeError",
      "Subclass of ValueError with line and column of the failure."
    ],
    [
      "In C",
      "A library such as cJSON builds a tree you must free; Python objects are garbage collected."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "How do you read a JSON file in Python?",
      "a": "with open(path, encoding=\"utf-8\") as f: data = json.load(f). Use json.loads for a string you already have.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Why use JSONL for a large dataset?",
      "a": "One object per line can be streamed with constant memory, appended to, split across workers, and a corrupt line only loses that record.",
      "follow": [
        [
          "How do you handle a bad line?",
          "Wrap json.loads of that one line in try/except json.JSONDecodeError, count it, log it, continue."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "A field is sometimes missing and sometimes null. How do you read it?",
      "a": "data.get(\"x\") returns None for both. If you must distinguish them use \"x\" in data. Provide a default where appropriate.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "A customer sends a 20 GB export as one JSON array. What do you do?",
      "a": "Do not json.load it. Use a streaming parser (ijson) or ask for JSONL; failing that convert once to JSONL. Process in a single pass and log counts of skipped records.",
      "follow": []
    }
  ]
};
