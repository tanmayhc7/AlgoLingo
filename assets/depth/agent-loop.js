/* Interview depth: agent-loop. */
window.DEPTH = {
  "thesis": "An agent is a loop around a model: ask, run the requested tool, append the result, repeat until the model answers in text. The loop is ordinary code and needs ordinary limits: a step cap, a token or cost budget, repeat detection, a timeout, and logging on exit, with a defined fallback when a limit is hit.",
  "why": [
    [
      "Real tasks need several steps",
      "Search, fetch, check policy, then answer."
    ],
    [
      "Runaway cost",
      "An unguarded loop can spend heavily or hang."
    ],
    [
      "Customer trust",
      "Predictable failure behaviour matters more than clever success."
    ],
    [
      "Interview topic",
      "Designing an agent with guardrails is a common applied-AI system question."
    ]
  ],
  "edges": [
    [
      "Never-ending loops",
      "Enforce limits in code, not in the prompt."
    ],
    [
      "Repeated calls",
      "Identical call twice means stuck; stop or redirect."
    ],
    [
      "Context growth",
      "Each step resends all messages; trim or summarise."
    ],
    [
      "Partial results",
      "Do not present an interrupted run as a complete answer."
    ],
    [
      "Irreversible actions",
      "Pause for human approval."
    ],
    [
      "Observability",
      "Log steps, tools, tokens, latency and stop reason for every run."
    ]
  ],
  "cost": [
    [
      "Tokens",
      "Grow roughly quadratically with steps because history is resent."
    ],
    [
      "Latency",
      "Sum of model and tool times across steps."
    ],
    [
      "Budget cap",
      "Bounds worst-case spend per run."
    ],
    [
      "Fewer, better tools",
      "Reduce steps and cost."
    ]
  ],
  "internals": [
    [
      "Control flow",
      "while not done: ask, dispatch, append."
    ],
    [
      "State",
      "Messages list plus counters (steps, tokens, seen calls)."
    ],
    [
      "Termination",
      "Text reply, step cap, budget, repeat, timeout or error."
    ],
    [
      "Fallbacks",
      "Retry, escalate to a person, or return a safe default."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What is an agent in practice?",
      "a": "A loop that lets a model call tools repeatedly until it can answer, with your code executing the tools.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How do you stop an agent from running away?",
      "a": "Max steps, a token or cost budget, repeat detection, a wall-clock timeout, all enforced in the loop, plus logging and a clear failure result.",
      "follow": [
        [
          "Why not just tell the model to stop?",
          "The prompt is a request, not a guarantee; code limits are reliable."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "How do you manage a growing message list?",
      "a": "Trim old messages, summarise earlier steps, drop bulky tool output after use, and keep the system message and recent turns.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "When is an agent the wrong choice?",
      "a": "When the steps are known in advance (use a fixed pipeline), when failures are costly and need determinism, or when latency and cost budgets are tight. Fixed workflows are cheaper, faster and easier to test.",
      "follow": []
    }
  ]
};
