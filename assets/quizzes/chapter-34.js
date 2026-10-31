/* Chapter 34 quiz: Retrieval and evaluation. */
window.QUIZ = {
  "chapter": 34,
  "title": "Retrieval and evaluation",
  "lede": "Embeddings, retrieval and measuring quality.",
  "questions": [
    {
      "type": "mcq",
      "q": "Two vectors point in exactly the same direction. What is their cosine similarity?",
      "options": [
        "0",
        "1",
        "-1"
      ],
      "answer": 1,
      "why": "Same direction means an angle of zero, and cos(0) = 1; length does not matter."
    },
    {
      "type": "mcq",
      "q": "The right passage exists but is not among the top k retrieved. What happens to the answer?",
      "options": [
        "The model finds it anyway",
        "The model cannot use it, so the answer is likely wrong or vague",
        "The pipeline retries automatically"
      ],
      "answer": 1,
      "why": "The model sees only what is in the prompt, so retrieval recall caps answer quality."
    },
    {
      "type": "mcq",
      "q": "Two prompt versions both score 5 of 6. Are they equally good?",
      "options": [
        "Yes",
        "Not necessarily: they may fail different cases",
        "The newer one is always better"
      ],
      "answer": 1,
      "why": "Equal totals can hide one fix and one regression; compare per case."
    },
    {
      "type": "write",
      "q": "Write <code>cosine(a, b)</code> for two equal-length lists of numbers: dot product divided by the product of their lengths. Return <code>0.0</code> if either vector is all zeros.",
      "starter": "import math\n\ndef cosine(a, b):\n    # your code\n",
      "tests": [
        {
          "expr": "cosine([1, 0], [1, 0])",
          "want": "1.0"
        },
        {
          "expr": "cosine([1, 0], [0, 1])",
          "want": "0.0"
        },
        {
          "expr": "cosine([0, 0], [1, 1])",
          "want": "0.0"
        },
        {
          "expr": "round(cosine([0.9, 0.1], [0.8, 0.2]), 2)",
          "want": "0.99"
        },
        {
          "expr": "round(cosine([1, 2], [-1, -2]), 6)",
          "want": "-1.0"
        }
      ],
      "hint": "dot = sum(x * y ...); lengths with math.sqrt(sum(x * x ...)); guard against zero.",
      "solution": "import math\n\ndef cosine(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = math.sqrt(sum(x * x for x in a))\n    nb = math.sqrt(sum(y * y for y in b))\n    if na == 0 or nb == 0:\n        return 0.0\n    return dot / (na * nb)\n",
      "why": "Dividing by the lengths removes magnitude, so only the direction (meaning) is compared."
    },
    {
      "type": "write",
      "q": "<code>cosine</code> is given. Write <code>top_k(query, vectors, k)</code> returning the indexes of the <code>k</code> vectors most similar to <code>query</code>, best first.",
      "starter": "import math\n\ndef cosine(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = math.sqrt(sum(x * x for x in a))\n    nb = math.sqrt(sum(y * y for y in b))\n    return dot / (na * nb) if na and nb else 0.0\n\ndef top_k(query, vectors, k):\n    # your code\n",
      "tests": [
        {
          "expr": "top_k([1, 0], [[0, 1], [1, 0.1], [1, 1]], 2)",
          "want": "[1, 2]"
        },
        {
          "expr": "top_k([1, 0], [[0, 1]], 3)",
          "want": "[0]"
        },
        {
          "expr": "top_k([0, 1], [[1, 0], [0, 2], [1, 1]], 1)",
          "want": "[1]"
        }
      ],
      "hint": "Rank (score, index) pairs with sorted(..., reverse=True) and slice [:k].",
      "solution": "import math\n\ndef cosine(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = math.sqrt(sum(x * x for x in a))\n    nb = math.sqrt(sum(y * y for y in b))\n    return dot / (na * nb) if na and nb else 0.0\n\ndef top_k(query, vectors, k):\n    scored = sorted(((cosine(query, v), i) for i, v in enumerate(vectors)), reverse=True)\n    return [i for _, i in scored[:k]]\n",
      "why": "Sorting scored pairs and slicing gives the best k; heapq.nlargest does the same without sorting everything."
    },
    {
      "type": "complete",
      "q": "Fill in the blank so <code>evaluate</code> counts a case as correct when the answer equals the expected one, and collects the inputs that missed.",
      "starter": "def evaluate(classify, cases):\n    correct, misses = 0, []\n    for text, want in cases:\n        got = classify(text)\n        if got ___ want:\n            correct += 1\n        else:\n            misses.append(text)\n    return correct / len(cases), misses\n",
      "tests": [
        {
          "expr": "evaluate(lambda t: t.upper(), [('a', 'A'), ('b', 'x')])",
          "want": "(0.5, ['b'])"
        },
        {
          "expr": "evaluate(lambda t: t, [('a', 'a')])",
          "want": "(1.0, [])"
        },
        {
          "expr": "evaluate(lambda t: 'z', [('a', 'a'), ('b', 'b')])",
          "want": "(0.0, ['a', 'b'])"
        }
      ],
      "hint": "A comparison operator.",
      "solution": "def evaluate(classify, cases):\n    correct, misses = 0, []\n    for text, want in cases:\n        got = classify(text)\n        if got == want:\n            correct += 1\n        else:\n            misses.append(text)\n    return correct / len(cases), misses\n",
      "why": "The score tells you how good a version is; the list of misses tells you what to fix next."
    },
    {
      "type": "write",
      "q": "Write <code>compare(a, b)</code>. <code>a</code> and <code>b</code> are equal-length lists of booleans (case passed under version 1 and version 2). Return <code>(fixed, broken)</code>: the indexes that failed in <code>a</code> but pass in <code>b</code>, and the indexes that passed in <code>a</code> but fail in <code>b</code>.",
      "starter": "def compare(a, b):\n    # your code\n",
      "tests": [
        {
          "expr": "compare([True, True, False, True], [True, True, True, False])",
          "want": "([2], [3])"
        },
        {
          "expr": "compare([True], [True])",
          "want": "([], [])"
        },
        {
          "expr": "compare([False, False], [True, True])",
          "want": "([0, 1], [])"
        },
        {
          "expr": "compare([True, True], [False, False])",
          "want": "([], [0, 1])"
        }
      ],
      "hint": "Walk the indexes with enumerate and zip, and test the two conditions separately.",
      "solution": "def compare(a, b):\n    fixed = [i for i, (x, y) in enumerate(zip(a, b)) if y and not x]\n    broken = [i for i, (x, y) in enumerate(zip(a, b)) if x and not y]\n    return fixed, broken\n",
      "why": "Per-case comparison reveals regressions that equal totals hide."
    }
  ]
};
