/* Lesson data: Tree recursion patterns (structure mode). */
(function () {
  function pos(i) {
    var level = Math.floor(Math.log(i) / Math.LN2);
    var first = Math.pow(2, level);
    return [Math.round((1000 * (2 * (i - first) + 1)) / Math.pow(2, level + 1)), 60 + level * 90];
  }
  function build(vals) {
    var ops = [];
    Object.keys(vals).forEach(function (k) { var i = +k; var p = pos(i); ops.push(['node', 't' + i, String(vals[i]), p[0], p[1], 'circle']); });
    Object.keys(vals).forEach(function (k) {
      var i = +k;
      if (vals[2 * i] !== undefined) ops.push(['edge', 't' + i, 't' + 2 * i, 'l']);
      if (vals[2 * i + 1] !== undefined) ops.push(['edge', 't' + i, 't' + (2 * i + 1), 'r']);
    });
    return ops;
  }
  var GOOD = { 1: 4, 2: 2, 3: 6, 4: 1, 5: 3, 6: 5, 7: 7 };

  var height = [{ pl: -1, cl: -1, say: 'The height of a tree is 1 + the larger height of its two subtrees. An empty tree has height -1 (so a leaf has height 0). Children must be solved before parents, so this is a postorder computation.', csay: 'Same recursion.', ds: build(GOOD) }];
  [[4, 0], [5, 0], [2, 1], [6, 0], [7, 0], [3, 1], [1, 2]].forEach(function (p) {
    var slot = p[0];
    var h = p[1];
    var kids = slot * 2 <= 7;
    height.push({ pl: 1, cl: 1, say: kids ? 'Node ' + GOOD[slot] + ': both children have finished, so height = 1 + max(' + (h - 1) + ', ' + (h - 1) + ') = ' + h + '.' : 'Node ' + GOOD[slot] + ' is a leaf. Both children are None (height -1), so height = 1 + max(-1, -1) = 0.', csay: 'Return ' + h + '.', ds: [['note', 't' + slot, 'h=' + h], ['tag', 't' + slot, 'done'], ['hot', 't' + slot]] });
  });
  height.push({ pl: 1, cl: 1, say: 'The root answers 2. Each node is visited once, so O(n) time. Space is the recursion depth: O(h), which is O(log n) for a balanced tree and O(n) for a skewed one.', csay: 'O(n) time, O(h) stack.', ds: [] });

  var BAD = { 1: 5, 2: 3, 3: 8, 6: 4 };
  var validate = [
    { pl: -1, cl: -1, say: 'Is this a valid BST? Every node looks fine against its parent: 3 < 5, 8 > 5, and 4 < 8. Checking only parents is the classic mistake.', csay: 'Same tree.', ds: build(BAD) },
    { pl: 0, cl: 0, say: 'Pass an allowed range down. The root may be anything: (-inf, +inf).', csay: 'The root has no limits.', ds: [['note', 't1', '(-inf, inf)'], ['tag', 't1', 'done']] },
    { pl: 1, cl: 1, say: 'Going left, the upper bound becomes the parent: node 3 must be in (-inf, 5). It is.', csay: 'Left child: upper bound = 5.', ds: [['note', 't2', '(-inf, 5)'], ['tag', 't2', 'done']] },
    { pl: 2, cl: 2, say: 'Going right, the lower bound becomes the parent: node 8 must be in (5, inf). It is.', csay: 'Right child: lower bound = 5.', ds: [['note', 't3', '(5, inf)'], ['tag', 't3', 'done']] },
    { pl: 1, cl: 1, say: 'Node 4 is the left child of 8, so its range is (5, 8): it inherits the lower bound 5 from the root. 4 is not greater than 5.', csay: 'Range (5, 8).', ds: [['note', 't6', '(5, 8)']] },
    { pl: 0, cl: 0, say: 'Invalid. 4 sits in the right subtree of 5, so it must be larger than 5. A parent-only check missed it. O(n) time. An inorder traversal that checks strictly increasing values also works.', csay: 'Return false: 4 is outside (5, 8).', ds: [['tag', 't6', 'bad'], ['hot', 't6']] },
  ];

  var lca = [
    { pl: -1, cl: -1, say: 'The lowest common ancestor of two nodes is the deepest node that has both as descendants. In a BST the values tell you where to go. Find the LCA of 1 and 3.', csay: 'Same walk.', ds: build(GOOD).concat([['ptr', 'p', 't4', 'down'], ['ptr', 'q', 't5', 'down']]) },
    { pl: 0, cl: 0, say: 'Start at the root, 4.', csay: 'cur = root.', ds: [['ptr', 'cur', 't1', 'up'], ['tag', 't1', 'cur']] },
    { pl: 1, cl: 1, say: 'Both 1 and 3 are smaller than 4, so both live in the left subtree. The LCA cannot be above them, so go left.', csay: 'Both smaller: go left.', ds: [['untag', 't1', 'cur'], ['tag', 't1', 'dim'], ['tag', 't3', 'dim'], ['tag', 't6', 'dim'], ['tag', 't7', 'dim'], ['ptr', 'cur', 't2', 'up'], ['tag', 't2', 'cur']] },
    { pl: 3, cl: 3, say: 'At 2: 1 is smaller and 3 is larger, so they split here. This is the first node where the two values are on different sides (or one equals the node), so it is the LCA.', csay: 'They split: this is the LCA.', ds: [['untag', 't2', 'cur'], ['tag', 't2', 'done'], ['hot', 't2']] },
  ];

  window.LESSON = {
    id: 'tree-patterns',
    mode: 'ds',
    title: 'Tree recursion patterns',
    lede:
      'Most tree problems fit one shape: solve the problem for the left subtree and the right subtree, then combine the two answers at the node. Whether you combine on the way down (passing bounds) or on the way up (returning heights) decides the pattern. Three examples cover most interview questions: height, validating a BST with bounds, and the lowest common ancestor.',
    scenes: [
      { id: 'height', title: 'Height (bottom-up)', blurb: 'Return a value from each child and combine. The answer for a node depends on its children, so work flows up from the leaves.', trap: 'Agree on the convention. Height of an empty tree is -1 if a leaf is 0, or 0 if a leaf is 1. Mixing them gives off-by-one answers.', pyCode: ['def height(n):', '    if not n: return -1', '    return 1 + max(height(n.left), height(n.right))'], cCode: ['int height(Node *n) {', '    if (!n) return -1;', '    int l = height(n->left), r = height(n->right);', '    return 1 + (l > r ? l : r);', '}'], predict: { q: 'What is the height of a single node with no children, using the convention that None has height -1?', options: ['-1', '0', '1'], answer: 1, why: '1 + max(-1, -1) = 0. A leaf has height 0 and the empty tree -1.' }, steps: height },
      { id: 'validate', title: 'Validate a BST (top-down)', blurb: 'Pass information down: every node must lie strictly between a lower and an upper bound inherited from its ancestors.', trap: 'Comparing a node only with its parent is wrong. A deep node must satisfy every ancestor, which is what the bounds carry.', pyCode: ['def ok(n, lo=-inf, hi=inf):', '    if not n: return True', '    if not lo < n.val < hi: return False', '    return ok(n.left, lo, n.val) and ok(n.right, n.val, hi)'], cCode: ['int ok(Node *n, long lo, long hi) {', '    if (!n) return 1;', '    if (n->val <= lo || n->val >= hi) return 0;', '    return ok(n->left, lo, n->val) && ok(n->right, n->val, hi);', '}'], predict: { q: 'Why use <code>lo</code> and <code>hi</code> instead of comparing each node to its parent?', options: ['It is faster', 'A node must be consistent with all ancestors, not only its parent', 'Python cannot compare to a parent'], answer: 1, why: 'A value in the right subtree of the root must exceed the root even if it is the left child of some deeper node. The bounds carry the constraints from all ancestors.' }, steps: validate },
      { id: 'lca', title: 'Lowest common ancestor', blurb: 'In a BST, walk down until the two values split to different sides. That node is the LCA.', trap: 'For a general binary tree (no ordering) the walk does not work. Recurse into both children and return the node if you find p or q; the first node that gets answers from both sides is the LCA.', pyCode: ['cur = root', 'while cur:', '    if p < cur.val and q < cur.val: cur = cur.left', '    elif p > cur.val and q > cur.val: cur = cur.right', '    else: return cur'], cCode: ['Node *cur = root;', 'while (cur) {', '    if (p < cur->val && q < cur->val) cur = cur->left;', '    else if (p > cur->val && q > cur->val) cur = cur->right;', '    else return cur;', '}'], predict: { q: 'In a BST, what is the LCA of 5 and 7 in the tree shown?', options: ['4', '6', '5'], answer: 1, why: '5 is the left child of 6 and 7 is the right child, so 6 is the first node where they split.' }, steps: lca },
    ],
    builtins: [
      ['max(a, b)', 'Combine two subtree answers.'],
      ['float("-inf"), float("inf")', 'Open bounds for validation.'],
      ['math.inf', 'The same, as a module constant.'],
      ['@functools.cache', 'Memoise tree recursion on shared subtrees (DAGs).'],
      ['def f(n, lo=-inf, hi=inf)', 'Default arguments carry initial bounds.'],
    ],
  };
})();
