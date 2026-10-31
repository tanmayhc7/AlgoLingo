/* Chapter 29 quiz: Talking to services. */
window.QUIZ = {
  "chapter": 29,
  "title": "Talking to services",
  "lede": "Status codes, retries, pagination and asyncio.",
  "questions": [
    {
      "type": "mcq",
      "q": "What does HTTP status 429 mean, and what should a client do?",
      "options": [
        "Not found: give up",
        "Too many requests: wait and retry with backoff",
        "Server crashed: never retry"
      ],
      "answer": 1,
      "why": "429 is rate limiting; honour Retry-After if given and reduce your request rate."
    },
    {
      "type": "mcq",
      "q": "Four independent API calls each wait about 1 second. How long does <code>asyncio.gather</code> take for all four?",
      "options": [
        "About 4 seconds",
        "About 1 second",
        "About 0 seconds"
      ],
      "answer": 1,
      "why": "The waits overlap, so total time is close to the longest single call."
    },
    {
      "type": "mcq",
      "q": "Why should a retry loop add random jitter to its delays?",
      "options": [
        "It makes the code shorter",
        "So many clients do not retry at the same instant and overload the server again",
        "HTTP requires it"
      ],
      "answer": 1,
      "why": "Synchronised retries create bursts; jitter spreads them out."
    },
    {
      "type": "debug",
      "q": "<code>should_retry(status)</code> should be True only for 429 and 5xx codes. It retries on every error. Fix it.",
      "starter": "def should_retry(status):\n    return status >= 400\n",
      "tests": [
        {
          "expr": "should_retry(503)",
          "want": "True"
        },
        {
          "expr": "should_retry(429)",
          "want": "True"
        },
        {
          "expr": "should_retry(404)",
          "want": "False"
        },
        {
          "expr": "should_retry(401)",
          "want": "False"
        },
        {
          "expr": "should_retry(200)",
          "want": "False"
        }
      ],
      "hint": "Other 4xx errors mean the request itself is wrong.",
      "solution": "def should_retry(status):\n    return status == 429 or status >= 500\n",
      "why": "A 404 or 401 will fail identically every time; only temporary failures are worth retrying."
    },
    {
      "type": "write",
      "q": "Write <code>backoff_delays(tries, base=1, cap=30)</code> returning the wait before each retry: <code>base</code> doubling each time, never more than <code>cap</code>.",
      "starter": "def backoff_delays(tries, base=1, cap=30):\n    # your code\n",
      "tests": [
        {
          "expr": "backoff_delays(4)",
          "want": "[1, 2, 4, 8]"
        },
        {
          "expr": "backoff_delays(5, 1, 10)",
          "want": "[1, 2, 4, 8, 10]"
        },
        {
          "expr": "backoff_delays(0)",
          "want": "[]"
        },
        {
          "expr": "backoff_delays(3, 2)",
          "want": "[2, 4, 8]"
        }
      ],
      "hint": "delay i is base * 2**i, capped with min(...).",
      "solution": "def backoff_delays(tries, base=1, cap=30):\n    return [min(cap, base * 2 ** i) for i in range(tries)]\n",
      "why": "Exponential growth with a cap gives a struggling server time to recover without waiting forever."
    },
    {
      "type": "complete",
      "q": "Fill in the blank so the delay doubles with each failed attempt (1, 2, 4, ...).",
      "starter": "def get_with_retry(call, tries=4):\n    delays = []\n    for attempt in range(tries):\n        status = call()\n        if status < 500 and status != 429:\n            return status, delays\n        delays.append(2 ** ___)\n    return None, delays\n",
      "tests": [
        {
          "expr": "(lambda it: get_with_retry(lambda: next(it)))(iter([503, 503, 200]))",
          "want": "(200, [1, 2])"
        },
        {
          "expr": "(lambda it: get_with_retry(lambda: next(it), 2))(iter([503, 503]))",
          "want": "(None, [1, 2])"
        },
        {
          "expr": "(lambda it: get_with_retry(lambda: next(it)))(iter([404]))",
          "want": "(404, [])"
        }
      ],
      "hint": "The delay depends on which attempt failed.",
      "solution": "def get_with_retry(call, tries=4):\n    delays = []\n    for attempt in range(tries):\n        status = call()\n        if status < 500 and status != 429:\n            return status, delays\n        delays.append(2 ** attempt)\n    return None, delays\n",
      "why": "2 ** attempt gives 1, 2, 4 and so on, and a 404 is returned at once because it is not retryable."
    },
    {
      "type": "write",
      "q": "Write <code>fetch_all(fetch)</code>. <code>fetch(cursor)</code> returns <code>{\"items\": [...], \"next\": cursor_or_None}</code>; start with <code>None</code> and follow <code>next</code> until it is None, returning all items in order.",
      "starter": "def fetch_all(fetch):\n    # your code\n",
      "tests": [
        {
          "expr": "fetch_all(lambda c: {\"items\": [1, 2], \"next\": \"b\"} if c is None else {\"items\": [3], \"next\": None})",
          "want": "[1, 2, 3]"
        },
        {
          "expr": "fetch_all(lambda c: {\"items\": [], \"next\": None})",
          "want": "[]"
        },
        {
          "expr": "fetch_all(lambda c: {\"items\": [7], \"next\": None})",
          "want": "[7]"
        }
      ],
      "hint": "Loop: page = fetch(cursor); extend; cursor = page[\"next\"]; stop when it is None.",
      "solution": "def fetch_all(fetch):\n    items, cursor = [], None\n    while True:\n        page = fetch(cursor)\n        items.extend(page[\"items\"])\n        cursor = page[\"next\"]\n        if cursor is None:\n            return items\n",
      "why": "Stopping on a missing cursor is safer than assuming a page count."
    }
  ]
};
