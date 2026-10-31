/* Chapter 30 quiz: Typed, safe code. */
window.QUIZ = {
  "chapter": 30,
  "title": "Typed, safe code",
  "lede": "Type hints, validation and context managers.",
  "questions": [
    {
      "type": "mcq",
      "q": "At run time, what happens when you pass a str to a parameter annotated <code>int</code>?",
      "options": [
        "TypeError immediately",
        "Nothing special: Python does not check hints",
        "It is converted to int"
      ],
      "answer": 1,
      "why": "Annotations are metadata; only a type checker or a validation library enforces them."
    },
    {
      "type": "mcq",
      "q": "A <code>with</code> block raises an exception. Is the resource cleaned up?",
      "options": [
        "No, you must use finally",
        "Yes, __exit__ runs before the exception propagates",
        "Only if you return normally"
      ],
      "answer": 1,
      "why": "The exit step is guaranteed on success, return and exception."
    },
    {
      "type": "write",
      "q": "Write <code>validate_ticket(d)</code> returning <code>(ok, errors)</code>. Errors, in this order: <code>\"id must be a positive int\"</code> (id must be an int, not a bool, and above 0), <code>\"priority must be low, medium or high\"</code>, <code>\"title is empty\"</code> (missing or only spaces).",
      "starter": "def validate_ticket(d):\n    # your code\n",
      "tests": [
        {
          "expr": "validate_ticket({'id': 7, 'priority': 'high', 'title': 'x'})",
          "want": "(True, [])"
        },
        {
          "expr": "validate_ticket({'id': -1, 'priority': 'urgent', 'title': '  '})",
          "want": "(False, ['id must be a positive int', 'priority must be low, medium or high', 'title is empty'])"
        },
        {
          "expr": "validate_ticket({})",
          "want": "(False, ['id must be a positive int', 'priority must be low, medium or high', 'title is empty'])"
        },
        {
          "expr": "validate_ticket({'id': True, 'priority': 'low', 'title': 't'})",
          "want": "(False, ['id must be a positive int'])"
        }
      ],
      "hint": "Build an errors list; isinstance(True, int) is True, so exclude bool explicitly.",
      "solution": "def validate_ticket(d):\n    errs = []\n    i = d.get(\"id\")\n    if not isinstance(i, int) or isinstance(i, bool) or i <= 0:\n        errs.append(\"id must be a positive int\")\n    if d.get(\"priority\") not in (\"low\", \"medium\", \"high\"):\n        errs.append(\"priority must be low, medium or high\")\n    if not str(d.get(\"title\", \"\")).strip():\n        errs.append(\"title is empty\")\n    return (not errs, errs)\n",
      "why": "Collecting every error gives the caller (or a retrying model) the whole list at once."
    },
    {
      "type": "complete",
      "q": "Fill in the blank to turn <code>Tracker</code> into a context manager that logs <code>\"exit\"</code> even when the body raises.",
      "starter": "class Tracker:\n    def __init__(self, log):\n        self.log = log\n\n    def __enter__(self):\n        self.log.append(\"enter\")\n        return self\n\n    def ___(self, exc_type, exc, tb):\n        self.log.append(\"exit\")\n        return False\n\ndef run(fail):\n    log = []\n    try:\n        with Tracker(log):\n            if fail:\n                raise ValueError(\"boom\")\n    except ValueError:\n        log.append(\"caught\")\n    return log\n",
      "tests": [
        {
          "expr": "run(False)",
          "want": "['enter', 'exit']"
        },
        {
          "expr": "run(True)",
          "want": "['enter', 'exit', 'caught']"
        }
      ],
      "hint": "The method Python calls when the block ends has a double-underscore name.",
      "solution": "class Tracker:\n    def __init__(self, log):\n        self.log = log\n\n    def __enter__(self):\n        self.log.append(\"enter\")\n        return self\n\n    def __exit__(self, exc_type, exc, tb):\n        self.log.append(\"exit\")\n        return False\n\ndef run(fail):\n    log = []\n    try:\n        with Tracker(log):\n            if fail:\n                raise ValueError(\"boom\")\n    except ValueError:\n        log.append(\"caught\")\n    return log\n",
      "why": "__exit__ runs on both paths, and returning False lets the exception continue to the caller."
    },
    {
      "type": "write",
      "q": "Write the context manager <code>temp_set(d, key, value)</code> with <code>@contextmanager</code>: inside the block <code>d[key]</code> is <code>value</code>; afterwards the old value is restored (or the key removed if it did not exist), even if the block raises.",
      "starter": "from contextlib import contextmanager\n\n@contextmanager\ndef temp_set(d, key, value):\n    # your code\n\ndef demo(d, key, value):\n    seen = None\n    try:\n        with temp_set(d, key, value):\n            seen = d.get(key)\n            raise RuntimeError\n    except RuntimeError:\n        pass\n    return seen, dict(d)\n",
      "tests": [
        {
          "expr": "demo({'a': 1}, 'a', 5)",
          "want": "(5, {'a': 1})"
        },
        {
          "expr": "demo({}, 'k', 'v')",
          "want": "('v', {})"
        },
        {
          "expr": "demo({'x': 0, 'y': 1}, 'y', 9)",
          "want": "(9, {'x': 0, 'y': 1})"
        }
      ],
      "hint": "Save the old value, set the new one, then yield inside try; restore in finally.",
      "solution": "from contextlib import contextmanager\n\n@contextmanager\ndef temp_set(d, key, value):\n    missing = object()\n    old = d.get(key, missing)\n    d[key] = value\n    try:\n        yield\n    finally:\n        if old is missing:\n            del d[key]\n        else:\n            d[key] = old\n\ndef demo(d, key, value):\n    seen = None\n    try:\n        with temp_set(d, key, value):\n            seen = d.get(key)\n            raise RuntimeError\n    except RuntimeError:\n        pass\n    return seen, dict(d)\n",
      "why": "The finally block runs when the body raises, so the dictionary is always restored."
    },
    {
      "type": "debug",
      "q": "<code>guard</code> should log <code>\"end\"</code> even when the body raises, but it does not. Fix it.",
      "starter": "from contextlib import contextmanager\n\n@contextmanager\ndef guard(log):\n    log.append(\"start\")\n    yield\n    log.append(\"end\")\n\ndef run(fail):\n    log = []\n    try:\n        with guard(log):\n            if fail:\n                raise ValueError\n    except ValueError:\n        pass\n    return log\n",
      "tests": [
        {
          "expr": "run(True)",
          "want": "['start', 'end']"
        },
        {
          "expr": "run(False)",
          "want": "['start', 'end']"
        }
      ],
      "hint": "The exception is raised at the yield; code after it needs a try/finally.",
      "solution": "from contextlib import contextmanager\n\n@contextmanager\ndef guard(log):\n    log.append(\"start\")\n    try:\n        yield\n    finally:\n        log.append(\"end\")\n\ndef run(fail):\n    log = []\n    try:\n        with guard(log):\n            if fail:\n                raise ValueError\n    except ValueError:\n        pass\n    return log\n",
      "why": "Without finally the generator is aborted at yield and the cleanup line never runs."
    }
  ]
};
