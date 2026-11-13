/* Interview depth: llm-api-basics. */
window.DEPTH = {
  "thesis": "A chat model API takes a list of role-tagged messages and returns the next message plus token usage. It is stateless: every call must carry the conversation. Cost and latency scale with tokens, the context window caps input plus output, and calls can fail, be truncated or be refused, so production code adds timeouts, retries, token budgets and logging.",
  "why": [
    [
      "The core of the job",
      "Forward deployed work is wiring models into customer workflows."
    ],
    [
      "Cost control",
      "Per-call cost times volume decides whether a feature is viable."
    ],
    [
      "Reliability",
      "Rate limits, overloads and truncation are everyday events."
    ],
    [
      "Security awareness",
      "Prompt injection and data leakage start with how messages are built."
    ]
  ],
  "edges": [
    [
      "Stateless",
      "The model does not remember earlier calls; resend what matters."
    ],
    [
      "Truncation",
      "max_tokens too low cuts replies, breaking JSON."
    ],
    [
      "Context overflow",
      "Input plus max output must fit the window; trim or summarise."
    ],
    [
      "Prompt injection",
      "Text from users or documents can contain instructions; treat it as data and limit what the model can do."
    ],
    [
      "Nondeterminism",
      "The same prompt can give different replies; lower temperature for extraction."
    ],
    [
      "Provider differences",
      "Message formats, limits and error codes differ; wrap the client in one place."
    ]
  ],
  "cost": [
    [
      "Per call",
      "input_tokens x input_rate + output_tokens x output_rate."
    ],
    [
      "Conversation growth",
      "Resending history makes cost grow with turns; trim or summarise."
    ],
    [
      "Latency",
      "Grows with output tokens; streaming improves perceived speed."
    ],
    [
      "Caching",
      "Reusing a shared prompt prefix can cut cost and latency on supporting providers."
    ]
  ],
  "internals": [
    [
      "Tokens",
      "Sub-word pieces; English averages about four characters per token."
    ],
    [
      "Roles",
      "system, user, assistant (and tool) tag who said what."
    ],
    [
      "Finish reasons",
      "stop, length (hit the cap), tool call, content filter."
    ],
    [
      "Sampling",
      "Temperature and top-p control randomness in choosing the next token."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Does the model remember my previous call?",
      "a": "No. The API is stateless; you must send the earlier messages again.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Estimate the monthly cost of a ticket-triage feature.",
      "a": "tokens per call x rate x tickets per day x 30, input and output priced separately, plus retries. Add headroom and measure real usage from logged token counts.",
      "follow": [
        [
          "How do you cut it?",
          "Shorter prompts, a smaller model for easy cases, caching a shared prefix, batching, and not sending irrelevant history."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "A reply ends mid-JSON. Why and what do you do?",
      "a": "Probably finish reason \"length\": max_tokens too low or context full. Raise the cap or shorten the input, and detect the finish reason before parsing.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How do you defend against prompt injection from customer documents?",
      "a": "Treat document text as untrusted data, keep instructions in the system message, give the model only the tools and data it needs, validate outputs, require human approval for risky actions, and test with adversarial samples.",
      "follow": []
    }
  ]
};

/* design-why */
window.DEPTH.design = [
 [
  "Why you send the whole conversation each time",
  "The model has no memory between calls. Each request carries the messages it should consider, so a chat is you resending history. That also means cost and delay grow with the length of the conversation."
 ],
 [
  "Why tokens, not characters, set limits and cost",
  "The model reads and writes tokens, pieces of words, so the context window, the maximum output and the price are all counted in tokens. A long document may use far more than you expect, and non-English text often uses more tokens per word."
 ],
 [
  "Why `temperature` exists",
  "The model produces a probability for each next token. Temperature changes how sharply it favours the likely ones: low gives steadier, more repeatable output (good for extraction), higher gives more varied output (good for brainstorming). Even at zero, output is not guaranteed to be identical."
 ],
 [
  "Why you handle errors and rate limits",
  "APIs are shared services with limits, outages and slow responses. Retrying with backoff, timeouts and clear handling of 429 and 5xx responses is what keeps an app working when the provider is under load."
 ]
];
