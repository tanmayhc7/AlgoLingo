/* Interview depth: type-validation. */
window.DEPTH = {
  "thesis": "Type hints document and statically check what code expects, but Python does not enforce them at run time. Data from outside (API responses, model output, customer files) must be validated at the boundary: check types, ranges and allowed values, collect all errors, then pass a trusted object inward. Libraries such as Pydantic generate this from hints.",
  "why": [
    [
      "Model output is untrusted",
      "A reply can be valid JSON with wrong or missing fields."
    ],
    [
      "Readable contracts",
      "Hints show callers what a function expects and returns."
    ],
    [
      "Earlier bug detection",
      "mypy and editors catch mistakes before running."
    ],
    [
      "SDKs use them",
      "Modern AI SDKs and frameworks rely on typed models and schemas."
    ]
  ],
  "edges": [
    [
      "Hints are not enforced",
      "def f(x: int) accepts a string at run time."
    ],
    [
      "bool is an int",
      "isinstance(True, int) is True; exclude bool when you mean a number."
    ],
    [
      "Optional means maybe None",
      "It does not make an argument optional; add a default."
    ],
    [
      "assert for validation",
      "Removed with python -O; raise an exception instead."
    ],
    [
      "Mutable defaults",
      "def f(x: list = []) shares one list across calls."
    ],
    [
      "Coercion surprises",
      "Pydantic may convert \"7\" to 7; decide strict or lenient on purpose."
    ]
  ],
  "cost": [
    [
      "Validation",
      "O(size of the data), negligible next to a network call."
    ],
    [
      "Static checking",
      "Zero run-time cost; runs in the editor or CI."
    ],
    [
      "Pydantic v2",
      "Core is compiled and fast; still avoid re-validating in hot loops."
    ],
    [
      "Collecting all errors",
      "Slightly more work than failing fast, far fewer retries."
    ]
  ],
  "internals": [
    [
      "__annotations__",
      "Hints are stored as metadata on functions and classes; libraries read them."
    ],
    [
      "typing constructs",
      "Optional, Union, Literal, TypedDict, Protocol and generics describe shapes."
    ],
    [
      "Parsing versus validating",
      "Turn untrusted data into a trusted typed object once, at the edge."
    ],
    [
      "In C",
      "The compiler checks types, but you still validate every parsed field."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What does def add(a: int, b: int) -> int do at run time?",
      "a": "Nothing special: the annotations are stored but not checked. A type checker uses them before you run.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How do you validate a JSON reply from a model?",
      "a": "Parse it, then check each field (type, range, allowed values) and collect all errors; use a schema library such as Pydantic. On failure retry with the error text, with a try limit.",
      "follow": [
        [
          "Why not just try/except KeyError?",
          "It catches only missing keys, not wrong types or values, and stops at the first problem."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "Optional[int] versus a default of None?",
      "a": "Optional[int] describes a value that may be None. A default makes the parameter omittable. They are often used together: def f(x: Optional[int] = None).",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Where should validation live in a service?",
      "a": "At the boundaries: when parsing requests, model replies and files. Inside, pass typed objects and trust them. It keeps checks in one place and errors close to the source.",
      "follow": []
    }
  ]
};
