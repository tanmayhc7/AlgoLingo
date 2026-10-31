/* Chapter 31 quiz: Shipping code. */
window.QUIZ = {
  "chapter": 31,
  "title": "Shipping code",
  "lede": "Configuration, logging, tests and fakes.",
  "questions": [
    {
      "type": "mcq",
      "q": "What does <code>bool(os.environ.get(\"DEBUG\"))</code> give when DEBUG is set to <code>\"false\"</code>?",
      "options": [
        "False",
        "True, because any non-empty string is truthy",
        "It raises ValueError"
      ],
      "answer": 1,
      "why": "Environment variables are strings; parse booleans explicitly."
    },
    {
      "type": "mcq",
      "q": "The logger level is INFO. Which of debug, info, warning and error are shown?",
      "options": [
        "Only info",
        "info, warning and error",
        "All four"
      ],
      "answer": 1,
      "why": "Messages at or above the threshold are kept."
    },
    {
      "type": "mcq",
      "q": "Why pass the model call into a function as a parameter?",
      "options": [
        "It is shorter",
        "A test can substitute a fast fake with a fixed reply",
        "Python requires it"
      ],
      "answer": 1,
      "why": "Injecting the dependency lets you test your own logic without the network or randomness."
    },
    {
      "type": "write",
      "q": "Write <code>env_bool(env, key, default=False)</code>: return True for values <code>1, true, yes, on</code> (any case, spaces ignored), False for any other value, and <code>default</code> when the key is absent. <code>env</code> is a dict.",
      "starter": "def env_bool(env, key, default=False):\n    # your code\n",
      "tests": [
        {
          "expr": "env_bool({'X': 'true'}, 'X')",
          "want": "True"
        },
        {
          "expr": "env_bool({'X': ' YES '}, 'X')",
          "want": "True"
        },
        {
          "expr": "env_bool({'X': '0'}, 'X')",
          "want": "False"
        },
        {
          "expr": "env_bool({'X': 'false'}, 'X', True)",
          "want": "False"
        },
        {
          "expr": "env_bool({}, 'X', True)",
          "want": "True"
        }
      ],
      "hint": "Check \"key in env\" first, then lowercase and strip the value.",
      "solution": "def env_bool(env, key, default=False):\n    if key not in env:\n        return default\n    return env[key].strip().lower() in (\"1\", \"true\", \"yes\", \"on\")\n",
      "why": "Parsing explicitly avoids the trap where any non-empty string, including \"false\", is truthy."
    },
    {
      "type": "write",
      "q": "Write <code>load_settings(env)</code> returning <code>{\"model\": ..., \"timeout\": ...}</code>. <code>model</code> comes from <code>MODEL</code> (default <code>\"default-1\"</code>); <code>timeout</code> from <code>TIMEOUT</code> as an int (default 30).",
      "starter": "def load_settings(env):\n    # your code\n",
      "tests": [
        {
          "expr": "load_settings({})",
          "want": "{'model': 'default-1', 'timeout': 30}"
        },
        {
          "expr": "load_settings({'MODEL': 'm', 'TIMEOUT': '5'})",
          "want": "{'model': 'm', 'timeout': 5}"
        },
        {
          "expr": "load_settings({'TIMEOUT': '12'})",
          "want": "{'model': 'default-1', 'timeout': 12}"
        }
      ],
      "hint": "env.get(key, default) and int(...) for the number.",
      "solution": "def load_settings(env):\n    return {\"model\": env.get(\"MODEL\", \"default-1\"), \"timeout\": int(env.get(\"TIMEOUT\", \"30\"))}\n",
      "why": "Defaults keep the program working when a variable is missing, and numbers must be converted from strings."
    },
    {
      "type": "complete",
      "q": "Fill in the blank so the logger only keeps messages at or above <code>level</code>.",
      "starter": "import logging, io\n\ndef capture(level):\n    stream = io.StringIO()\n    log = logging.getLogger(\"quiz-\" + str(level))\n    log.handlers.clear()\n    log.propagate = False\n    log.___(level)\n    log.addHandler(logging.StreamHandler(stream))\n    log.debug(\"d\")\n    log.info(\"i\")\n    log.warning(\"w\")\n    log.error(\"e\")\n    return stream.getvalue().split()\n",
      "tests": [
        {
          "expr": "capture(logging.INFO)",
          "want": "['i', 'w', 'e']"
        },
        {
          "expr": "capture(logging.WARNING)",
          "want": "['w', 'e']"
        },
        {
          "expr": "capture(logging.DEBUG)",
          "want": "['d', 'i', 'w', 'e']"
        },
        {
          "expr": "capture(logging.ERROR)",
          "want": "['e']"
        }
      ],
      "hint": "A logger method sets its threshold level.",
      "solution": "import logging, io\n\ndef capture(level):\n    stream = io.StringIO()\n    log = logging.getLogger(\"quiz-\" + str(level))\n    log.handlers.clear()\n    log.propagate = False\n    log.setLevel(level)\n    log.addHandler(logging.StreamHandler(stream))\n    log.debug(\"d\")\n    log.info(\"i\")\n    log.warning(\"w\")\n    log.error(\"e\")\n    return stream.getvalue().split()\n",
      "why": "setLevel decides the threshold; everything below it is dropped."
    },
    {
      "type": "write",
      "q": "Write <code>summarise(text, ask)</code>: call <code>ask(\"Summarise: \" + text)</code> and return the reply with a leading <code>\"OK: \"</code> removed. <code>ask</code> is any function from prompt to reply.",
      "starter": "def summarise(text, ask):\n    # your code\n",
      "tests": [
        {
          "expr": "summarise('abc', lambda p: 'OK: 3 items')",
          "want": "'3 items'"
        },
        {
          "expr": "(lambda seen: (summarise('xyz', lambda p: seen.append(p) or 'OK: z'), seen))([])",
          "want": "('z', ['Summarise: xyz'])"
        },
        {
          "expr": "summarise('q', lambda p: 'no prefix')",
          "want": "'no prefix'"
        }
      ],
      "hint": "str.removeprefix removes the prefix only when it is present.",
      "solution": "def summarise(text, ask):\n    reply = ask(\"Summarise: \" + text)\n    return reply.removeprefix(\"OK: \")\n",
      "why": "Because the model call is a parameter, a test passes a fake and can even record the prompt it received."
    }
  ]
};
