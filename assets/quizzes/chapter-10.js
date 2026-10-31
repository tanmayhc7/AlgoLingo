/* Chapter 10 quiz: Trees. See assets/quiz.js for the question format. */
(function () {
  var NODE = 'class Node:\n    def __init__(self, val, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n';
  var TREE = 'def tree():\n    return Node(4, Node(2, Node(1), Node(3)), Node(6, Node(5), Node(7)))\n\n';
  window.QUIZ = {
    chapter: 10,
    title: 'Trees',
    lede: 'Traversals, search trees and the recursion patterns behind them.',
    questions: [
      {
        type: 'mcq',
        q: 'Which traversal of a binary <b>search</b> tree visits the values in sorted order?',
        options: ['Preorder', 'Inorder', 'Postorder'],
        answer: 1,
        why: 'Inorder visits left subtree, node, then right subtree. Smaller values are always in the left, so the output is ascending.',
      },
      {
        type: 'mcq',
        q: 'You insert 1, 2, 3, 4, 5, 6, 7 in that order into an empty BST. What is the cost of one search afterwards?',
        options: ['O(log n), because it is a search tree', 'O(n), because the tree is a chain', 'O(1)'],
        answer: 1,
        why: 'Each value is larger than all before it, so every node goes to the right. The height is n - 1 and a search may visit every node.',
      },
      {
        type: 'mcq',
        q: 'To delete a BST node with <b>two children</b>, which node can take its place?',
        options: ['Its parent', 'The smallest node in its right subtree', 'Either child, chosen at random'],
        answer: 1,
        why: 'The inorder successor is the next larger value, so left values stay smaller and right values stay larger. The largest node of the left subtree also works.',
      },
      {
        type: 'complete',
        q: 'Fill in the blanks so <code>height(n)</code> returns -1 for an empty tree and 0 for a single node.',
        starter: NODE + TREE + 'def height(n):\n    if not n:\n        return ___\n    return 1 + max(height(n.left), ___)\n',
        tests: [
          { expr: 'height(None)', want: '-1' },
          { expr: 'height(Node(9))', want: '0' },
          { expr: 'height(tree())', want: '2' },
        ],
        hint: 'The base case is -1. The recursion needs the height of the other child too.',
        solution: NODE + TREE + 'def height(n):\n    if not n:\n        return -1\n    return 1 + max(height(n.left), height(n.right))\n',
        why: 'A leaf is 1 + max(-1, -1) = 0, matching the convention.',
      },
      {
        type: 'write',
        q: 'Write <code>level_order(root)</code> returning a list of lists, one per level, from top to bottom. Return <code>[]</code> for an empty tree.',
        starter: 'from collections import deque\n\n' + NODE + TREE + 'def level_order(root):\n    # your code\n',
        tests: [
          { expr: 'level_order(tree())', want: '[[4], [2, 6], [1, 3, 5, 7]]' },
          { expr: 'level_order(None)', want: '[]' },
          { expr: 'level_order(Node(8))', want: '[[8]]' },
        ],
        hint: 'Use a deque. At the start of each round, take len(queue) nodes: those are exactly one level.',
        solution: 'from collections import deque\n\n' + NODE + TREE + 'def level_order(root):\n    out = []\n    q = deque([root] if root else [])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            n = q.popleft()\n            level.append(n.val)\n            if n.left: q.append(n.left)\n            if n.right: q.append(n.right)\n        out.append(level)\n    return out\n',
        why: 'The queue holds one level at a time; fixing the count at the start of each round separates levels.',
      },
      {
        type: 'debug',
        q: 'This should check whether a tree is a valid BST, but it accepts an invalid one. Fix it.',
        starter: NODE + 'def is_bst(n):\n    if not n:\n        return True\n    if n.left and n.left.val >= n.val:\n        return False\n    if n.right and n.right.val <= n.val:\n        return False\n    return is_bst(n.left) and is_bst(n.right)\n',
        tests: [
          { expr: 'is_bst(Node(5, Node(3), Node(8, Node(4), None)))', want: 'False' },
          { expr: 'is_bst(Node(5, Node(3), Node(8, Node(6), None)))', want: 'True' },
          { expr: 'is_bst(None)', want: 'True' },
        ],
        hint: 'Node 4 is a valid left child of 8, but it sits in the right subtree of 5. Carry a lower and upper bound down.',
        solution: NODE + 'def is_bst(n, lo=float("-inf"), hi=float("inf")):\n    if not n:\n        return True\n    if not lo < n.val < hi:\n        return False\n    return is_bst(n.left, lo, n.val) and is_bst(n.right, n.val, hi)\n',
        why: 'Each node must lie within the range set by all its ancestors, not only its parent.',
      },
    ],
  };
})();
