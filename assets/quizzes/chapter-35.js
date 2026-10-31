/* Chapter 35 quiz: Advanced structures. */
window.QUIZ = {
  "chapter": 35,
  "title": "Advanced structures",
  "lede": "Balanced trees, skip lists, Bloom filters and k-D trees.",
  "questions": [
    {
      "type": "mcq",
      "q": "A Bloom filter says an item is \"possibly present\". What is guaranteed?",
      "options": [
        "It was added",
        "It might not have been added",
        "It was added exactly once"
      ],
      "answer": 1,
      "why": "Bloom filters can give false positives. Only \"definitely absent\" is certain."
    },
    {
      "type": "mcq",
      "q": "What balance factors does an AVL tree allow at every node?",
      "options": [
        "0 only",
        "-1, 0 or 1",
        "Any, as long as the tree is a BST"
      ],
      "answer": 1,
      "why": "Height of left minus height of right must stay within one."
    },
    {
      "type": "mcq",
      "q": "Why does k-D tree nearest-neighbour search check the far side of a split sometimes?",
      "options": [
        "The tree might be unsorted",
        "The splitting line may be closer than the best point found so far",
        "To count the nodes"
      ],
      "answer": 1,
      "why": "A closer point can lie across the line if the line is nearer than the current best distance."
    },
    {
      "type": "write",
      "q": "Write <code>is_avl(t)</code> for a tree of nested tuples <code>(key, left, right)</code> or <code>None</code>. Return True when every node's left and right heights differ by at most 1. (Ignore key order.)",
      "starter": "def is_avl(t):\n    # your code\n",
      "tests": [
        {
          "expr": "is_avl(None)",
          "want": "True"
        },
        {
          "expr": "is_avl((2, (1, None, None), (3, None, None)))",
          "want": "True"
        },
        {
          "expr": "is_avl((1, None, (2, None, (3, None, None))))",
          "want": "False"
        },
        {
          "expr": "is_avl((2, (1, (0, None, None), None), (3, None, None)))",
          "want": "True"
        },
        {
          "expr": "is_avl((3, (2, (1, (0, None, None), None), None), (4, None, None)))",
          "want": "False"
        }
      ],
      "hint": "A helper can return the height, or -1 when the subtree is unbalanced.",
      "solution": "def is_avl(t):\n    def h(n):\n        if n is None:\n            return 0\n        l = h(n[1])\n        r = h(n[2])\n        if l < 0 or r < 0 or abs(l - r) > 1:\n            return -1\n        return 1 + max(l, r)\n    return h(t) >= 0\n",
      "why": "Returning -1 propagates the failure up without recomputing heights, so the check is O(n)."
    },
    {
      "type": "write",
      "q": "Write <code>rotate_right(t)</code> for a tuple tree <code>(key, left, right)</code>: the left child becomes the root, the old root becomes its right child, and the left child's old right subtree becomes the old root's left subtree. Assume the left child exists.",
      "starter": "def rotate_right(t):\n    # your code\n",
      "tests": [
        {
          "expr": "rotate_right((3, (2, (1, None, None), None), None))",
          "want": "(2, (1, None, None), (3, None, None))"
        },
        {
          "expr": "rotate_right((2, (1, None, None), (3, None, None)))",
          "want": "(1, None, (2, None, (3, None, None)))"
        },
        {
          "expr": "rotate_right((5, (3, (2, None, None), (4, None, None)), (6, None, None)))",
          "want": "(3, (2, None, None), (5, (4, None, None), (6, None, None)))"
        }
      ],
      "hint": "key, left, right = t; then left = (lk, ll, lr); return (lk, ll, (key, lr, right)).",
      "solution": "def rotate_right(t):\n    key, left, right = t\n    lk, ll, lr = left\n    return (lk, ll, (key, lr, right))\n",
      "why": "Only three links change, and the in-order sequence of keys stays the same."
    },
    {
      "type": "complete",
      "q": "Fill in the blank so a Bloom filter reports \"possibly present\" only when <b>all</b> of its bits are set.",
      "starter": "class Bloom:\n    def __init__(self, m, k):\n        self.bits = [0] * m\n        self.m, self.k = m, k\n\n    def _idx(self, x):\n        return [(x * 31 + i * 17) % self.m for i in range(self.k)]\n\n    def add(self, x):\n        for j in self._idx(x):\n            self.bits[j] = 1\n\n    def contains(self, x):\n        return ___(self.bits[j] for j in self._idx(x))\n",
      "tests": [
        {
          "expr": "(lambda b: (b.add(5), b.add(9), [b.contains(5), b.contains(9)])[2])(Bloom(16, 3))",
          "want": "[True, True]"
        },
        {
          "expr": "Bloom(16, 3).contains(5)",
          "want": "False"
        },
        {
          "expr": "(lambda b: (b.add(5), b.contains(6))[1])(Bloom(16, 3))",
          "want": "False"
        }
      ],
      "hint": "A built-in returns True only if every item is truthy.",
      "solution": "class Bloom:\n    def __init__(self, m, k):\n        self.bits = [0] * m\n        self.m, self.k = m, k\n\n    def _idx(self, x):\n        return [(x * 31 + i * 17) % self.m for i in range(self.k)]\n\n    def add(self, x):\n        for j in self._idx(x):\n            self.bits[j] = 1\n\n    def contains(self, x):\n        return all(self.bits[j] for j in self._idx(x))\n",
      "why": "any would accept an item that merely shares one bit with something already added; all demands every bit."
    },
    {
      "type": "debug",
      "q": "<code>levels(coins, cap)</code> counts the heads before the first tails (a skip-list node's level), but it must never exceed <code>cap</code>. It ignores the cap. Fix it.",
      "starter": "def levels(coins, cap):\n    lvl = 0\n    for c in coins:\n        if not c:\n            break\n        lvl += 1\n    return lvl\n",
      "tests": [
        {
          "expr": "levels([1, 1, 1, 0], 2)",
          "want": "2"
        },
        {
          "expr": "levels([0], 3)",
          "want": "0"
        },
        {
          "expr": "levels([1, 1, 1, 1], 3)",
          "want": "3"
        },
        {
          "expr": "levels([1, 0, 1], 5)",
          "want": "1"
        }
      ],
      "hint": "Stop counting once lvl reaches cap.",
      "solution": "def levels(coins, cap):\n    lvl = 0\n    for c in coins:\n        if not c or lvl == cap:\n            break\n        lvl += 1\n    return lvl\n",
      "why": "Without a cap one lucky run could create an enormous node; real skip lists bound the level near log2(n)."
    }
  ]
};
