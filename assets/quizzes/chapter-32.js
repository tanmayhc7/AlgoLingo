/* Chapter 32 quiz: Calling a model. */
window.QUIZ = {
  "chapter": 32,
  "title": "Calling a model",
  "lede": "Messages, tokens, cost and structured output.",
  "questions": [
    {
      "type": "mcq",
      "q": "For a follow-up question, what must you send to a chat model API?",
      "options": [
        "Only the new question",
        "The earlier messages plus the new question",
        "Nothing, the model remembers"
      ],
      "answer": 1,
      "why": "The API is stateless; conversation memory is whatever you put in the messages list."
    },
    {
      "type": "mcq",
      "q": "A reply ends mid-sentence and the finish reason is \"length\". What happened?",
      "options": [
        "The model refused",
        "It hit max_tokens or the context limit",
        "The network dropped"
      ],
      "answer": 1,
      "why": "The token cap was reached; raise it or shorten the prompt, and do not parse truncated JSON."
    },
    {
      "type": "write",
      "q": "Write <code>estimate_cost(in_tok, out_tok, rate_in, rate_out)</code> where rates are dollars per million tokens. Return the cost rounded to 6 decimals.",
      "starter": "def estimate_cost(in_tok, out_tok, rate_in, rate_out):\n    # your code\n",
      "tests": [
        {
          "expr": "estimate_cost(1200, 300, 3.0, 15.0)",
          "want": "0.0081"
        },
        {
          "expr": "estimate_cost(0, 0, 3.0, 15.0)",
          "want": "0.0"
        },
        {
          "expr": "estimate_cost(1000000, 0, 3.0, 15.0)",
          "want": "3.0"
        },
        {
          "expr": "estimate_cost(0, 1000000, 3.0, 15.0)",
          "want": "15.0"
        }
      ],
      "hint": "(in x rate_in + out x rate_out) / 1,000,000, then round(..., 6).",
      "solution": "def estimate_cost(in_tok, out_tok, rate_in, rate_out):\n    return round((in_tok * rate_in + out_tok * rate_out) / 1_000_000, 6)\n",
      "why": "Input and output are priced separately, and volume multiplies the result."
    },
    {
      "type": "write",
      "q": "Write <code>extract_json(reply)</code>: take the text from the first <code>{</code> to the last <code>}</code> of <code>reply</code> and return it parsed with <code>json.loads</code>. Return <code>None</code> if there are no braces.",
      "starter": "import json\n\ndef extract_json(reply):\n    # your code\n",
      "tests": [
        {
          "expr": "extract_json('```json\\n{\"a\": 1}\\n```')",
          "want": "{'a': 1}"
        },
        {
          "expr": "extract_json('Sure! {\"x\": [1, 2]} hope that helps')",
          "want": "{'x': [1, 2]}"
        },
        {
          "expr": "extract_json('{\"a\": 1}')",
          "want": "{'a': 1}"
        },
        {
          "expr": "extract_json('nothing here')",
          "want": "None"
        }
      ],
      "hint": "str.find and str.rfind give the positions of the first { and the last }.",
      "solution": "import json\n\ndef extract_json(reply):\n    i, j = reply.find(\"{\"), reply.rfind(\"}\")\n    if i < 0 or j < i:\n        return None\n    return json.loads(reply[i:j + 1])\n",
      "why": "Models often wrap JSON in fences or chatter, so extract the object before parsing."
    },
    {
      "type": "complete",
      "q": "Fill in the blank so the loop retries when the reply is invalid JSON or fails validation.",
      "starter": "import json\n\ndef ask_structured(ask, tries=3):\n    errors = []\n    for _ in range(tries):\n        reply = ask(errors)\n        try:\n            data = json.loads(reply)\n            if \"priority\" not in data:\n                raise ValueError(\"missing priority\")\n            return data, len(errors)\n        except ___ as e:\n            errors.append(str(e))\n    return None, len(errors)\n",
      "tests": [
        {
          "expr": "(lambda it: ask_structured(lambda errs: next(it)))(iter(['oops', '{\"x\": 1}', '{\"priority\": \"low\"}']))",
          "want": "({'priority': 'low'}, 2)"
        },
        {
          "expr": "(lambda it: ask_structured(lambda errs: next(it)))(iter(['{\"priority\": \"high\"}']))",
          "want": "({'priority': 'high'}, 0)"
        },
        {
          "expr": "(lambda it: ask_structured(lambda errs: next(it), 2))(iter(['a', 'b']))",
          "want": "(None, 2)"
        }
      ],
      "hint": "JSONDecodeError is a subclass of this built-in error, which the validation also raises.",
      "solution": "import json\n\ndef ask_structured(ask, tries=3):\n    errors = []\n    for _ in range(tries):\n        reply = ask(errors)\n        try:\n            data = json.loads(reply)\n            if \"priority\" not in data:\n                raise ValueError(\"missing priority\")\n            return data, len(errors)\n        except ValueError as e:\n            errors.append(str(e))\n    return None, len(errors)\n",
      "why": "ValueError covers both a parse failure and your own validation error, and the try limit prevents endless retries."
    },
    {
      "type": "debug",
      "q": "<code>retry_messages</code> should append the model's bad reply as an <code>assistant</code> message and then the error as a <code>user</code> message. Fix it.",
      "starter": "def retry_messages(messages, reply, err):\n    return messages + [\n        {\"role\": \"user\", \"content\": reply},\n        {\"role\": \"user\", \"content\": \"Invalid: \" + err},\n    ]\n",
      "tests": [
        {
          "expr": "[m['role'] for m in retry_messages([{'role': 'user', 'content': 'q'}], 'bad', 'err')]",
          "want": "['user', 'assistant', 'user']"
        },
        {
          "expr": "retry_messages([], 'bad', 'err')[0]['content']",
          "want": "'bad'"
        },
        {
          "expr": "retry_messages([], 'bad', 'err')[1]['content']",
          "want": "'Invalid: err'"
        }
      ],
      "hint": "The model said the bad reply, so it belongs to the assistant role.",
      "solution": "def retry_messages(messages, reply, err):\n    return messages + [\n        {\"role\": \"assistant\", \"content\": reply},\n        {\"role\": \"user\", \"content\": \"Invalid: \" + err},\n    ]\n",
      "why": "Roles tell the model who said what; the reply is its own earlier message and the error is feedback from you."
    }
  ]
};
