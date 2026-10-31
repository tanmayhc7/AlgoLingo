/* Interview depth: tool-calling. */
window.DEPTH = {
  "thesis": "Tool calling lets a model request a function call: you describe tools (name, purpose, argument schema), the model replies with a call instead of text, your code validates and runs it, and you send the result back for the final answer. The model never executes anything; your dispatcher is the security boundary.",
  "why": [
    [
      "Connects models to real systems",
      "Orders, tickets and databases become reachable."
    ],
    [
      "The agent building block",
      "Agents are loops of tool calls."
    ],
    [
      "Security-critical",
      "Poorly guarded tools are how prompt injection causes damage."
    ],
    [
      "Frequently asked",
      "Explaining the round trip and the safety checks is common in applied AI interviews."
    ]
  ],
  "edges": [
    [
      "Unknown tool names",
      "Refuse anything not in the allow-list."
    ],
    [
      "Bad arguments",
      "Validate and return an error message the model can use to retry."
    ],
    [
      "Prompt injection",
      "Document text can try to trigger tools; limit tool power and confirm risky actions."
    ],
    [
      "Parallel calls",
      "A reply may request several calls; return a result for each, matching ids."
    ],
    [
      "Tool errors",
      "Return short safe errors; log the details."
    ],
    [
      "Side effects",
      "Read-only tools by default; require approval for writes and deletions."
    ]
  ],
  "cost": [
    [
      "Round trip",
      "At least two model calls per tool use, so more latency and tokens."
    ],
    [
      "Tool descriptions",
      "Count as input tokens on every call."
    ],
    [
      "Many tools",
      "Large tool lists confuse the model and cost tokens; offer only relevant ones."
    ],
    [
      "Tool latency",
      "Runs between model calls; use asyncio for several independent calls."
    ]
  ],
  "internals": [
    [
      "Schema",
      "JSON Schema for arguments plus a description the model reads."
    ],
    [
      "Dispatcher",
      "A dict from name to function, with validation and error handling."
    ],
    [
      "Message roles",
      "The result goes back as a tool-role message tied to the call id."
    ],
    [
      "In C",
      "A table of function pointers keyed by name."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Who runs the tool when a model \"calls\" it?",
      "a": "Your program. The model only emits a request with a name and arguments.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How do you make tool calling safe?",
      "a": "Allow-list names, validate arguments, least-privilege tools, safe error messages, timeouts, logging, and human confirmation for irreversible actions.",
      "follow": [
        [
          "What if the arguments come from a malicious document?",
          "That is prompt injection; do not let document text widen what tools can do, and validate every argument as untrusted."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "The model keeps sending a bad argument. What do you do?",
      "a": "Return the validation error as the tool result so it can correct itself, improve the tool description and schema, and cap retries.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Design tools for a support agent.",
      "a": "Few, narrow, well-named tools (lookup_order, search_kb, create_refund_request); read tools run freely; write tools need approval and idempotency keys; every call logged with who, what and result.",
      "follow": []
    }
  ]
};
