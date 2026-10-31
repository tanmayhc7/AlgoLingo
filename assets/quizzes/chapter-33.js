/* Chapter 33 quiz: Tools and agents. */
window.QUIZ = {
  "chapter": 33,
  "title": "Tools and agents",
  "lede": "Tool calling, dispatching and agent loops.",
  "questions": [
    {
      "type": "mcq",
      "q": "Who actually runs the function when a model \"calls\" a tool?",
      "options": [
        "The model",
        "Your program",
        "The API provider, always"
      ],
      "answer": 1,
      "why": "The model only produces a request. Your code decides whether and how to run it."
    },
    {
      "type": "mcq",
      "q": "The model asks for a tool you never defined. What should the dispatcher do?",
      "options": [
        "Try to run it anyway",
        "Return an error result and do nothing else",
        "Crash the program"
      ],
      "answer": 1,
      "why": "Refuse unknown names and tell the model so it can choose a valid tool."
    },
    {
      "type": "write",
      "q": "Write <code>dispatch(call, tools)</code>. <code>call</code> is <code>{\"name\": ..., \"args\": {...}}</code> and <code>tools</code> maps names to functions. Return the tool result; <code>\"error: unknown tool\"</code> for an unknown name; <code>\"error: bad arguments\"</code> when the arguments do not fit (TypeError); <code>\"error: tool failed\"</code> for any other exception.",
      "starter": "def dispatch(call, tools):\n    # your code\n",
      "tests": [
        {
          "expr": "dispatch({'name': 'add', 'args': {'a': 1, 'b': 2}}, {'add': lambda a, b: a + b})",
          "want": "3"
        },
        {
          "expr": "dispatch({'name': 'rm', 'args': {}}, {'add': lambda a, b: a + b})",
          "want": "'error: unknown tool'"
        },
        {
          "expr": "dispatch({'name': 'add', 'args': {'a': 1}}, {'add': lambda a, b: a + b})",
          "want": "'error: bad arguments'"
        },
        {
          "expr": "dispatch({'name': 'boom', 'args': {}}, {'boom': lambda: 1 / 0})",
          "want": "'error: tool failed'"
        }
      ],
      "hint": "Look the name up with tools.get, then call fn(**args) inside try with two except clauses.",
      "solution": "def dispatch(call, tools):\n    fn = tools.get(call[\"name\"])\n    if fn is None:\n        return \"error: unknown tool\"\n    try:\n        return fn(**call[\"args\"])\n    except TypeError:\n        return \"error: bad arguments\"\n    except Exception:\n        return \"error: tool failed\"\n",
      "why": "The model's request is untrusted: allow-list the name, and return safe error strings it can react to."
    },
    {
      "type": "write",
      "q": "Write <code>run_agent(ask, tools, max_steps=5)</code>. Start with <code>messages = []</code>. Each step call <code>ask(messages)</code>: if the reply has <code>\"text\"</code>, return it; if it has <code>\"tool_call\"</code>, run it with <code>dispatch</code> (already defined) and append <code>{\"role\": \"tool\", \"content\": str(result)}</code>. Return <code>None</code> if <code>max_steps</code> is reached.",
      "starter": "def dispatch(call, tools):\n    fn = tools.get(call[\"name\"])\n    if fn is None:\n        return \"error: unknown tool\"\n    try:\n        return fn(**call[\"args\"])\n    except Exception:\n        return \"error: tool failed\"\n\ndef run_agent(ask, tools, max_steps=5):\n    # your code\n",
      "tests": [
        {
          "expr": "(lambda it: run_agent(lambda m: next(it), {'add': lambda a, b: a + b}))(iter([{'tool_call': {'name': 'add', 'args': {'a': 1, 'b': 2}}}, {'text': 'sum is 3'}]))",
          "want": "'sum is 3'"
        },
        {
          "expr": "run_agent(lambda m: {'tool_call': {'name': 'add', 'args': {'a': 1, 'b': 1}}}, {'add': lambda a, b: a + b}, 3)",
          "want": "None"
        },
        {
          "expr": "run_agent(lambda m: {'text': 'hi'}, {})",
          "want": "'hi'"
        },
        {
          "expr": "(lambda seen: (run_agent(lambda m: {'text': 'done'} if m else (seen.append(1) or {'tool_call': {'name': 'add', 'args': {'a': 2, 'b': 2}}}), {'add': lambda a, b: a + b}), seen))([])",
          "want": "('done', [1])"
        }
      ],
      "hint": "for step in range(max_steps): reply = ask(messages); return text, or dispatch and append the tool message.",
      "solution": "def dispatch(call, tools):\n    fn = tools.get(call[\"name\"])\n    if fn is None:\n        return \"error: unknown tool\"\n    try:\n        return fn(**call[\"args\"])\n    except Exception:\n        return \"error: tool failed\"\n\ndef run_agent(ask, tools, max_steps=5):\n    messages = []\n    for _ in range(max_steps):\n        reply = ask(messages)\n        if \"text\" in reply:\n            return reply[\"text\"]\n        result = dispatch(reply[\"tool_call\"], tools)\n        messages.append({\"role\": \"tool\", \"content\": str(result)})\n    return None\n",
      "why": "The for loop is the guardrail: the agent cannot run more than max_steps even if the model never answers."
    },
    {
      "type": "complete",
      "q": "Fill in the blank so the function detects the same tool call (same name and same arguments) appearing twice.",
      "starter": "def has_repeat(calls):\n    seen = set()\n    for name, args in calls:\n        key = (name, tuple(sorted(args.___())))\n        if key in seen:\n            return True\n        seen.add(key)\n    return False\n",
      "tests": [
        {
          "expr": "has_repeat([('a', {'x': 1}), ('a', {'x': 1})])",
          "want": "True"
        },
        {
          "expr": "has_repeat([('a', {'x': 1}), ('a', {'x': 2})])",
          "want": "False"
        },
        {
          "expr": "has_repeat([('a', {'x': 1}), ('b', {'x': 1})])",
          "want": "False"
        },
        {
          "expr": "has_repeat([])",
          "want": "False"
        }
      ],
      "hint": "Dicts are not hashable; turn the arguments into a sorted tuple of (key, value) pairs.",
      "solution": "def has_repeat(calls):\n    seen = set()\n    for name, args in calls:\n        key = (name, tuple(sorted(args.items())))\n        if key in seen:\n            return True\n        seen.add(key)\n    return False\n",
      "why": "An identical repeated call rarely gives new information, so it is a good stuck-loop signal."
    },
    {
      "type": "debug",
      "q": "<code>should_stop</code> must be True when ANY limit is reached: steps used up (<code>step >= max_steps</code>), tokens over budget, or time over the timeout. It only stops when all three are exceeded. Fix it.",
      "starter": "def should_stop(step, max_steps, tokens, budget, elapsed, timeout):\n    return step >= max_steps and tokens > budget and elapsed > timeout\n",
      "tests": [
        {
          "expr": "should_stop(1, 8, 100, 1000, 5, 60)",
          "want": "False"
        },
        {
          "expr": "should_stop(8, 8, 100, 1000, 5, 60)",
          "want": "True"
        },
        {
          "expr": "should_stop(2, 8, 2000, 1000, 5, 60)",
          "want": "True"
        },
        {
          "expr": "should_stop(2, 8, 100, 1000, 90, 60)",
          "want": "True"
        }
      ],
      "hint": "Any one limit being hit should stop the run.",
      "solution": "def should_stop(step, max_steps, tokens, budget, elapsed, timeout):\n    return step >= max_steps or tokens > budget or elapsed > timeout\n",
      "why": "Guardrails are independent safety nets; combining them with and would let a runaway loop continue."
    }
  ]
};
