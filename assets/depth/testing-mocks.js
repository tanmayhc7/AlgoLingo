/* Interview depth: testing-mocks. */
window.DEPTH = {
  "thesis": "Tests are small programs that check behaviour. pytest runs functions named test_*, using plain assert. Code that calls a model or service is tested by passing the call in as a parameter and substituting a fake with a fixed reply, so tests are fast, free and deterministic. Keep a few separate checks against the real service.",
  "why": [
    [
      "Safe changes",
      "Tests let you refactor an integration without breaking a customer."
    ],
    [
      "Model calls are slow and paid",
      "Fakes remove cost and randomness from the unit tests."
    ],
    [
      "Interview signal",
      "Writing a clean fake or parametrized test shows engineering maturity."
    ],
    [
      "Reproducing bugs",
      "A failing test captures the bug and proves the fix."
    ]
  ],
  "edges": [
    [
      "Mocking too much",
      "A test that only checks the mock proves nothing."
    ],
    [
      "Patching the wrong name",
      "Patch where the name is used, not where it is defined."
    ],
    [
      "Shared state",
      "Tests must not depend on order or leave files behind; use tmp_path."
    ],
    [
      "Time and randomness",
      "Inject the clock and seed the random generator."
    ],
    [
      "Flaky tests",
      "Network or timing dependence; remove it or retry deliberately."
    ],
    [
      "Only happy paths",
      "Add empty, malformed, huge and boundary inputs."
    ]
  ],
  "cost": [
    [
      "Unit test",
      "Milliseconds when the model is faked."
    ],
    [
      "Real model test",
      "Seconds and money; run rarely, in a separate suite."
    ],
    [
      "Maintenance",
      "Cheap when tests check behaviour, costly when they mirror implementation."
    ],
    [
      "CI",
      "Run unit tests on every push."
    ]
  ],
  "internals": [
    [
      "Collection",
      "pytest finds test_*.py files and test_* functions."
    ],
    [
      "Assertion rewriting",
      "pytest shows the values on both sides of a failed assert."
    ],
    [
      "Dependency injection",
      "Pass collaborators in rather than importing a global."
    ],
    [
      "In C",
      "Function pointers play the same role as injected callables."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "How do you test a function that calls an API?",
      "a": "Pass the API call in as a parameter or patch it, and use a fake returning a canned response so the test needs no network.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "What does a good test of model-calling code check?",
      "a": "Your logic: how it builds the prompt (assert on the recorded prompt), parses a valid reply, handles a malformed one, and retries. Not the model's intelligence.",
      "follow": [
        [
          "How do you test the model itself?",
          "With an evaluation set run against the real model, separate from unit tests."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "What is parametrize for?",
      "a": "Running one test body over many inputs and expected values, with each case reported separately.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How do you keep a test suite trustworthy over time?",
      "a": "Keep tests fast and deterministic, delete flaky ones or fix the cause, review test failures like bugs, and measure what matters rather than chasing coverage numbers.",
      "follow": []
    }
  ]
};

/* design-why */
window.DEPTH.design = [
 [
  "Why tests exist",
  "Code changes, and a test turns \"I think it still works\" into a check you can run in seconds. It allows you to refactor with confidence, which is hard to do on code with no tests."
 ],
 [
  "Why mocks exist",
  "Real calls to a model, a database or the network are slow, cost money and give different results each time. A mock stands in for them, so a test is fast, free and repeatable, and you can force failures that are hard to trigger for real."
 ],
 [
  "Why you mock where the name is looked up",
  "`patch` replaces a name in a particular module. If `app.py` did `from client import call`, you must patch `app.call`, not `client.call`, because `app` already holds its own reference. This is the same names-and-objects rule as everywhere else in Python."
 ],
 [
  "Why too many mocks make tests weak",
  "A test full of mocks mostly checks the mocks, so it passes while real behaviour breaks. Keep a few tests that use real components, and mock only the slow or paid edges."
 ]
];
