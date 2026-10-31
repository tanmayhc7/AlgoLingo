/* Interview depth: structured-output. */
window.DEPTH = {
  "thesis": "To use model output in a program you request JSON in a defined shape, then extract, parse and validate it, because replies can be wrapped in text, truncated or contain invalid values. On failure retry with the model's own reply and the specific error, within a small try limit, and have a fallback when the limit is reached.",
  "why": [
    [
      "Bridge from text to code",
      "Downstream systems need fields, not paragraphs."
    ],
    [
      "Reliability",
      "A validation and retry loop turns a mostly-working demo into a dependable service."
    ],
    [
      "Debuggable",
      "Logging validation failures shows which prompts need work."
    ],
    [
      "Safety",
      "Validating output stops bad values reaching a database or an action."
    ]
  ],
  "edges": [
    [
      "Fenced or chatty replies",
      "Extract between the first { and last } before parsing."
    ],
    [
      "Valid JSON, wrong content",
      "Check required keys, types and allowed values."
    ],
    [
      "Truncation",
      "Check finish reason; a cut-off JSON cannot be repaired reliably."
    ],
    [
      "Retry without feedback",
      "Repeating the same prompt repeats the failure; include the error."
    ],
    [
      "Unbounded retries",
      "Cap tries and define a fallback (default, queue for human)."
    ],
    [
      "Provider JSON modes",
      "They constrain syntax or schema but you still validate and handle refusals."
    ]
  ],
  "cost": [
    [
      "Each retry",
      "Another full call: input and output tokens again."
    ],
    [
      "Retry rate",
      "Track it; a high rate means the prompt or schema needs work."
    ],
    [
      "Validation",
      "Negligible compared with the call."
    ],
    [
      "Lower temperature",
      "Often reduces format errors at no cost."
    ]
  ],
  "internals": [
    [
      "Pipeline",
      "ask, extract, parse, validate, use."
    ],
    [
      "Error feedback",
      "Append the assistant reply and a user message with the exact error."
    ],
    [
      "Schema in the prompt",
      "Show one example of the exact JSON shape and the allowed values."
    ],
    [
      "Constrained decoding",
      "Some APIs restrict generation to a schema; it helps but is not a guarantee of correct content."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why can json.loads fail on a model reply?",
      "a": "The reply may include text or a code fence around the JSON, may be truncated, or may contain invalid syntax such as trailing commas or comments.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Describe a robust structured-output loop.",
      "a": "Prompt with a schema and example, call, extract JSON, parse, validate, and on failure append the reply and the error and retry up to a limit; log each failure; fall back when exhausted.",
      "follow": [
        [
          "What fallback?",
          "A default value, a queue for human review, or an error to the caller; never silently use unvalidated data."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "Valid JSON with a wrong category value. Where do you catch it?",
      "a": "In validation against the allowed set. json.loads only checks syntax.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How do you decide between provider JSON mode and your own validation?",
      "a": "Use JSON or schema mode to reduce errors, but still validate: it does not guarantee semantic correctness, refusals or truncation can still break the output, and you may switch providers.",
      "follow": []
    }
  ]
};
