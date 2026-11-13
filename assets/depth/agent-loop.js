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

/* design-why */
window.DEPTH.design = [
 [
  "Why an agent is a loop",
  "Real tasks need several steps, and the result of one step decides the next. The loop is: ask the model, run any tool it requests, add the result to the conversation and ask again, until it gives a final answer."
 ],
 [
  "Why you need a step limit",
  "A model can keep calling tools without making progress, and each turn costs money and time. A maximum number of steps (and a token or cost budget) stops runaway loops."
 ],
 [
  "Why every step is logged",
  "When an agent does something odd, the trace of messages, tool calls and results is the only way to see why. It is also the basis for evaluating and improving the agent."
 ],
 [
  "Why failures are returned as data",
  "If a tool fails, passing the error text back lets the model try something else. Raising an exception and crashing the loop throws away that chance, though persistent failures still need a limit."
 ]
];
