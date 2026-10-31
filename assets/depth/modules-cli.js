/* Interview depth: modules-cli. */
window.DEPTH = {
  "thesis": "A module is a file, a package is a folder with __init__.py, and import runs a module once and caches it. Production scripts use pathlib for paths, datetime with timezones for times and argparse for arguments, and exit with a meaningful status code.",
  "why": [
    [
      "Reusable code",
      "Split logic into modules instead of one huge script."
    ],
    [
      "Portable scripts",
      "pathlib handles Windows and Unix paths."
    ],
    [
      "Tools others can run",
      "argparse gives validation and --help."
    ],
    [
      "Pipelines",
      "Exit codes make scripts composable in CI and cron."
    ]
  ],
  "edges": [
    [
      "Shadowing",
      "A local file named random.py hides the standard library."
    ],
    [
      "Circular imports",
      "Move shared code to a third module or import inside the function."
    ],
    [
      "Naive datetimes",
      "No timezone means ambiguous times; use UTC."
    ],
    [
      "Relative paths",
      "They depend on the current directory; resolve from __file__ or an argument."
    ]
  ],
  "cost": [
    [
      "First import",
      "Disk search plus executing the module."
    ],
    [
      "Later imports",
      "Dictionary lookup in sys.modules."
    ],
    [
      "Path operations",
      "Cheap string handling plus system calls."
    ]
  ],
  "internals": [
    [
      "sys.modules",
      "The import cache, a dict of name to module."
    ],
    [
      "Import system",
      "Finders and loaders look through sys.path entries."
    ],
    [
      "__main__",
      "The module name when a file is run as a script."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What does if __name__ == \"__main__\" do?",
      "a": "Runs the code only when the file is executed directly, not when it is imported.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Why use pathlib over string paths?",
      "a": "It is cross-platform and gives readable operations such as p / \"x\", exists(), read_text() and glob().",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "How do you debug a circular import?",
      "a": "Find the import cycle, move shared definitions to a lower-level module or defer one import into a function, and avoid top-level side effects.",
      "follow": []
    }
  ]
};
