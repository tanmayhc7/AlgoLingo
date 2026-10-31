/* Interview depth: evals. */
window.DEPTH = {
  "thesis": "An evaluation is a fixed set of cases with expected results, run on every change to a prompt, model or code. It reports a score and the list of misses, and comparing two versions case by case shows what improved and what regressed. For free-text outputs use rubrics or a model as judge, validated against human labels.",
  "why": [
    [
      "Evidence over feeling",
      "Know whether a change helped."
    ],
    [
      "Catch regressions",
      "Customers notice what used to work."
    ],
    [
      "Model upgrades",
      "Re-run the set when a provider changes a model."
    ],
    [
      "Interview signal",
      "Talking about evals separates builders from demo makers."
    ]
  ],
  "edges": [
    [
      "Too few cases",
      "Noisy results; grow the set."
    ],
    [
      "Leakage",
      "Do not tune on the held-out cases."
    ],
    [
      "Equal totals",
      "Different cases can fail; compare per case."
    ],
    [
      "Non-determinism",
      "Repeat runs or lower temperature; report variance."
    ],
    [
      "Judge bias",
      "A model judge can favour verbose or its own style; calibrate with humans."
    ],
    [
      "Metric choice",
      "Accuracy hides class imbalance; add precision, recall or per-category scores."
    ]
  ],
  "cost": [
    [
      "Running the set",
      "n calls per version: budget it, cache unchanged cases."
    ],
    [
      "Judge calls",
      "Add another call per case."
    ],
    [
      "Building the set",
      "The real cost: collecting and labelling realistic cases."
    ],
    [
      "Maintenance",
      "Add every production failure as a new case."
    ]
  ],
  "internals": [
    [
      "Golden set",
      "Inputs with expected outputs, stored as JSONL in the repo."
    ],
    [
      "Metrics",
      "Accuracy, precision and recall for classification; rubric scores for text."
    ],
    [
      "Regression report",
      "Lists fixed and broken cases between versions."
    ],
    [
      "CI integration",
      "Run a small fast set on every change and the full set before release."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why evaluate a prompt change?",
      "a": "A prompt that works on a few examples may fail on others; a fixed set gives repeatable evidence of better or worse.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Two prompts both score 80 percent. Which is better?",
      "a": "Not decidable from totals: compare per case, look at the severity of the failures, and check cost and latency.",
      "follow": [
        [
          "How many cases do you need?",
          "Enough that a few cases do not swing the score, often hundreds for important features; start small and grow from production failures."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "How do you evaluate free-text answers?",
      "a": "Write a rubric (correct, grounded in sources, tone), score with humans on a sample, then use a model as judge calibrated against those labels; spot-check regularly.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Design an evaluation for a support-ticket triage feature.",
      "a": "Collect real tickets labelled by experts, split dev and held-out sets, measure per-category precision and recall plus cost and latency, track regressions per release, and feed production errors back as new cases.",
      "follow": []
    }
  ]
};
