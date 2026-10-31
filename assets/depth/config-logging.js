/* Interview depth: config-logging. */
window.DEPTH = {
  "thesis": "Settings that vary by environment (model, endpoint, timeouts, keys) are read from flags, environment variables or config files, with defaults, never hard-coded. Secrets stay out of source control and logs. The logging module records events with levels so you can diagnose failures later, on a machine you cannot attach a debugger to.",
  "why": [
    [
      "Customer deployments",
      "The same code runs in their environment with their keys and endpoints."
    ],
    [
      "Security",
      "Leaked API keys are a common, costly incident."
    ],
    [
      "Debugging remotely",
      "Logs are often the only evidence of what happened."
    ],
    [
      "Operations",
      "Cost and latency logging shows when a pipeline degrades."
    ]
  ],
  "edges": [
    [
      "Strings only",
      "Environment variables are strings; \"0\" and \"false\" are truthy."
    ],
    [
      "Missing required values",
      "Fail at startup with a clear message, not deep in a request."
    ],
    [
      "Secrets in logs",
      "Never log keys, full prompts with personal data, or authorisation headers."
    ],
    [
      "Committed .env",
      "Add it to .gitignore; rotate any key that was committed."
    ],
    [
      "print versus logging",
      "print cannot be filtered or redirected per module."
    ],
    [
      "Logging in libraries",
      "Libraries should not configure logging; applications do."
    ]
  ],
  "cost": [
    [
      "getenv",
      "Negligible."
    ],
    [
      "Debug logging",
      "Can be expensive in hot paths; lazy formatting avoids building dropped messages."
    ],
    [
      "Log volume",
      "High-volume logs cost storage and slow I/O; sample or raise the level."
    ],
    [
      "Structured logs",
      "JSON logs are easier to search than free text."
    ]
  ],
  "internals": [
    [
      "Precedence",
      "Command-line flag over environment over config file over default."
    ],
    [
      "Logger hierarchy",
      "getLogger(\"a.b\") inherits from \"a\"; handlers decide where output goes."
    ],
    [
      "Levels",
      "DEBUG 10, INFO 20, WARNING 30, ERROR 40, CRITICAL 50."
    ],
    [
      "In C",
      "getenv, getopt and syslog (or a logging library)."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Where should an API key live?",
      "a": "In an environment variable or secrets manager, read at startup. Never in source code or the repository.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How do you set up logging for a script?",
      "a": "logging.basicConfig(level=INFO, format=...) once in main, logger = logging.getLogger(__name__) per module, and log.exception inside except blocks to capture the traceback.",
      "follow": [
        [
          "What should you not log?",
          "Secrets and sensitive customer content; log ids, counts, latencies and token usage instead."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "Parse an environment variable as a boolean.",
      "a": "value.strip().lower() in (\"1\", \"true\", \"yes\", \"on\"); bool(os.environ.get(...)) is wrong because any non-empty string is truthy.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "A key was committed to git. What now?",
      "a": "Treat it as compromised: revoke and rotate it immediately, remove it from history if needed (but assume it was seen), add scanning to CI, and move secrets to a manager.",
      "follow": []
    }
  ]
};
