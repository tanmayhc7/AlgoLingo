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
      "a": "Runs the code only when the file is executed directly, not when it is imported. Python sets `__name__` to `\"__main__\"` in the file you start, and to the module's own name in a file that is imported. The check asks which of the two this is. It is the nearest thing Python has to C's `main()`.",
      "diagram": {
        "caption": "Same file, two ways of using it",
        "title": "`python tools.py` (run directly)",
        "main": [
          ["Python runs the file top to bottom", "Definitions such as `def add` are created."],
          ["`__name__` is `\"__main__\"`", "Python sets it for the file you started."],
          ["`if __name__ == \"__main__\":` is true", "The demo or start-up code runs, for example `print(add(2, 3))` prints 5."]
        ],
        "branch": {
          "title": "`import tools` (used by another file)",
          "steps": [
            ["Python runs the file top to bottom", "Definitions such as `def add` are created."],
            ["`__name__` is `\"tools\"`", "The module's own name, not `__main__`."],
            ["The `if` is false, so it is skipped", "Nothing runs automatically. The other file can now call `tools.add(2, 3)`.", "cache"]
          ]
        }
      },
      "follow": [
        ["Why not just put the code at the top of the file?", "An import runs the whole file once, top to bottom. Without the guard, importing the file would also run its demo, tests or start-up work, such as starting a server or reading a file. The guard lets one file be both a library other files can import safely and a script you can run."],
        ["Why do people write a `main()` function and call it from the guard?", "Variables created inside `main()` stay out of the global scope, and `main()` can be imported and tested without running anything. The usual layout is `def main(): ...` followed by `if __name__ == \"__main__\": main()`."],
        ["Why can a module seem to run twice?", "A file run directly is registered as `__main__`, not under its file name. If `a.py` is run directly and something inside it imports `a`, Python loads a second copy under the name `a`. The top of the file then runs twice, once per copy. Fix it by moving shared code into a separate module that both sides import."]
      ]
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

/* design-why */
window.DEPTH.design = [
 [
  "Why modules exist",
  "One big file is hard to read, reuse and test. A module groups related code under a name, so you import it where you need it and each file has a single purpose."
 ],
 [
  "Why `if __name__ == \"__main__\"` is used",
  "When a file is run directly Python sets `__name__` to `\"__main__\"`, and when it is imported it is the module's name. The check lets one file serve as both a script and a library, without running the script part on import."
 ],
 [
  "Why use `argparse`",
  "Hand-written argument parsing is long and misses cases. `argparse` gives you types, defaults, error messages and `--help` from a short declaration, so your script behaves like standard tools."
 ],
 [
  "Why scripts return exit codes",
  "Other programs and shells decide what to do next from the exit status: 0 means success and non-zero means failure. A script that always exits 0 hides failures from pipelines and schedulers."
 ]
];
