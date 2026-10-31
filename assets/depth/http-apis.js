/* Interview depth: http-apis. */
window.DEPTH = {
  "thesis": "Most integrations are HTTP calls. Status codes tell you what happened (2xx success, 4xx the request is wrong, 429 slow down, 5xx the server failed). A reliable client sets a timeout on every call, retries only temporary failures with exponential backoff and jitter, respects rate limits, makes retried writes idempotent, and follows pagination until the server says there is no more.",
  "why": [
    [
      "The basis of integration work",
      "Customer systems, model providers and internal tools are all reached over HTTP."
    ],
    [
      "Failures are normal",
      "Networks drop and services throttle; handling it is the difference between a demo and a pipeline."
    ],
    [
      "Cost and limits",
      "Rate limits and quotas shape your design (concurrency, batching)."
    ],
    [
      "Debuggability",
      "Knowing the status and headers lets you diagnose in an unfamiliar environment quickly."
    ]
  ],
  "edges": [
    [
      "No default timeout",
      "requests waits forever unless you pass timeout=."
    ],
    [
      "Retrying non-idempotent calls",
      "A retried POST can create two records; use an idempotency key."
    ],
    [
      "Retry storms",
      "Without jitter many clients retry together and prolong the outage."
    ],
    [
      "Retry-After header",
      "Honour it when present, for 429 and 503."
    ],
    [
      "Secrets in URLs",
      "Put keys in headers; URLs end up in logs."
    ],
    [
      "Pagination changes",
      "Data can change between pages; stop on a missing cursor, not a precomputed count."
    ]
  ],
  "cost": [
    [
      "Retries",
      "Worst case delay is the sum of the backoff: 1 + 2 + 4 + 8 seconds for four tries."
    ],
    [
      "Connection reuse",
      "A Session avoids a new TCP and TLS handshake per call."
    ],
    [
      "Pagination",
      "O(pages) round trips; larger page sizes cut latency but raise memory."
    ],
    [
      "Timeouts",
      "Set connect and read timeouts separately for control."
    ]
  ],
  "internals": [
    [
      "Status classes",
      "1xx info, 2xx success, 3xx redirect, 4xx client error, 5xx server error."
    ],
    [
      "Exponential backoff",
      "delay = base x 2^attempt, capped, plus random jitter."
    ],
    [
      "Idempotency",
      "GET, PUT and DELETE are meant to be safe to repeat; POST is not unless you add a key."
    ],
    [
      "In C",
      "libcurl does the transfer; you write the retry loop and the parsing."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What does a 429 mean and what do you do?",
      "a": "Too many requests: you are rate limited. Wait (respect Retry-After if given) and retry with backoff, and reduce your concurrency.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Which errors should a client retry?",
      "a": "Network errors, timeouts, 5xx and 429. Not other 4xx, because the request itself is wrong.",
      "follow": [
        [
          "Why add jitter?",
          "So that many clients do not retry at the same instant and overload the server again."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "How do you page through a large result set?",
      "a": "Follow the next cursor or page token until it is absent, collecting items, with a guard on the number of pages. Prefer cursors to page numbers when data changes.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "A POST that creates an invoice timed out. Can you retry?",
      "a": "Not blindly: it may have succeeded. Send an idempotency key so the server de-duplicates, or look up the resource before creating it again.",
      "follow": []
    }
  ]
};
