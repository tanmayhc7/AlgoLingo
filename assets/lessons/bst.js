/* Lesson data: Binary search trees (structure mode). */
(function () {
  function pos(i) {
    var level = Math.floor(Math.log(i) / Math.LN2);
    var first = Math.pow(2, level);
    return [Math.round((1000 * (2 * (i - first) + 1)) / Math.pow(2, level + 1)), 60 + level * 90];
  }
  var VAL = { 1: 4, 2: 2, 3: 6, 4: 1, 5: 3, 6: 5, 7: 7 };
  function build(slots) {
    var ops = [];
    slots.forEach(function (i) { var p = pos(i); ops.push(['node', 't' + i, String(VAL[i]), p[0], p[1], 'circle']); });
    slots.forEach(function (i) {
      if (slots.indexOf(2 * i) >= 0) ops.push(['edge', 't' + i, 't' + 2 * i, 'l']);
      if (slots.indexOf(2 * i + 1) >= 0) ops.push(['edge', 't' + i, 't' + (2 * i + 1), 'r']);
    });
    return ops;
  }
  function at(id, dir) { return ['ptr', 'cur', id, dir || 'up']; }

  var search = [
    { pl: -1, cl: -1, say: 'In a binary search tree everything in the left subtree is smaller than the node and everything in the right is larger. Searching for 5: compare, then discard half the tree.', csay: 'Same rule in C.', ds: build([1, 2, 3, 4, 5, 6, 7]) },
    { pl: 0, cl: 0, say: 'Start at the root, 4.', csay: 'cur = root.', ds: [at('t1'), ['tag', 't1', 'cur']] },
    { pl: 1, cl: 1, say: '5 > 4, so 5 can only be in the right subtree. The whole left subtree (2, 1, 3) is ruled out in one comparison.', csay: '5 > 4: go right.', ds: [['untag', 't1', 'cur'], ['tag', 't1', 'dim'], ['tag', 't2', 'dim'], ['tag', 't4', 'dim'], ['tag', 't5', 'dim'], at('t3'), ['tag', 't3', 'cur']] },
    { pl: 1, cl: 1, say: '5 < 6, so go left.', csay: '5 < 6: go left.', ds: [['untag', 't3', 'cur'], ['tag', 't3', 'dim'], ['tag', 't7', 'dim'], at('t6'), ['tag', 't6', 'cur']] },
    { pl: 2, cl: 2, say: 'Found 5. Three comparisons for seven nodes. In a balanced tree the height is about log2(n), so search is O(log n). In a badly lopsided tree it can be O(n).', csay: 'Found: 3 steps, about log2(n).', ds: [['untag', 't6', 'cur'], ['tag', 't6', 'done'], ['hot', 't6']] },
  ];

  var insert = [
    { pl: -1, cl: -1, say: 'Insert 5. The new value always becomes a new leaf, found by the same walk as a search.', csay: 'Same walk, then attach a new leaf.', ds: build([1, 2, 3, 4, 5, 7]) },
    { pl: 1, cl: 1, say: 'At the root, 4: 5 is larger, so go right.', csay: '5 > 4: go right.', ds: [at('t1'), ['tag', 't1', 'cur']] },
    { pl: 1, cl: 1, say: 'At 6: 5 is smaller, go left.', csay: '5 < 6: go left.', ds: [['untag', 't1', 'cur'], at('t3'), ['tag', 't3', 'cur']] },
    { pl: 0, cl: 0, say: 'There is no left child here, so this is the spot. The base case fires and returns a new node.', csay: 'NULL: this is where the new node goes.', ds: [['untag', 't3', 'cur'], ['tag', 't3', 'bad']] },
    { pl: 0, cl: 0, say: 'Create node 5 and attach it as the left child of 6. Nothing else moved: insertion touches one path, O(height).', csay: 'Allocate node 5 and link it into 6->left.', ds: [['node', 't6', '5', pos(6)[0], pos(6)[1], 'circle'], ['edge', 't3', 't6', 'l'], ['untag', 't3', 'bad'], ['tag', 't6', 'done'], ['unptr', 'cur']] },
  ];

  var del = [
    { pl: -1, cl: -1, say: 'Deleting has three cases, easiest first. We will do all three on this tree.', csay: 'Three cases in C as well, plus free().', ds: build([1, 2, 3, 4, 5, 6, 7]) },
    { pl: 0, cl: 0, say: 'Case 1, a leaf: delete 1. Just drop it. Its parent\'s link becomes None.', csay: 'Leaf: unlink and free.', ds: [['tag', 't4', 'bad'], ['hot', 't4'], ['rm', 't4']] },
    { pl: 1, cl: 1, say: 'Case 2, one child: delete 2, which now has only the child 3. Replace the node with its child. Order is preserved because 3 is already in the correct range.', csay: 'One child: splice it into the parent.', ds: [['tag', 't2', 'bad'], ['rm', 't2'], ['mv', 't5', pos(2)[0], pos(2)[1]], ['edge', 't1', 't5', 'l']] },
    { pl: 2, cl: 2, say: 'Case 3, two children: delete the root, 4. Removing it would leave a hole with two subtrees. Find its inorder successor: the smallest value in the right subtree. That is 5 (go right once, then left as far as possible).', csay: 'Two children: find the inorder successor.', ds: [['tag', 't1', 'bad'], ['ptr', 'succ', 't6', 'down'], ['tag', 't6', 'mark']] },
    { pl: 3, cl: 3, say: 'Copy the successor\'s value into the node being deleted. The tree is still ordered, because 5 was the next value after 4.', csay: 'Copy the successor value into the node.', ds: [['lab', 't1', '5'], ['untag', 't1', 'bad']] },
    { pl: 3, cl: 3, say: 'Now delete the successor from the right subtree. It has at most one child (it is the leftmost node), so it falls under case 1 or 2. The BST is valid again.', csay: 'Delete the successor node, then free it.', ds: [['rm', 't6'], ['unptr', 'succ'], ['hot', 't1']] },
  ];

  /* degenerate tree from sorted input */
  var skew = [{ pl: -1, cl: -1, say: 'What if values arrive already sorted? Insert 1, 2, 3, 4, 5 in turn.', csay: 'Same inserts.', ds: [] }];
  [1, 2, 3, 4, 5].forEach(function (v, i) {
    var ops = [['node', 'k' + v, String(v), 160 + i * 150, 60 + i * 70, 'circle']];
    if (i > 0) ops.push(['edge', 'k' + (v - 1), 'k' + v, 'r']);
    skew.push({ pl: 1, cl: 1, say: v + ' is larger than everything so far, so it goes to the right of the last node.' + (i === 4 ? ' The tree is a linked list leaning right. Height is n - 1, so search, insert and delete are all O(n). Self-balancing trees (AVL, red-black) rotate nodes to keep the height near log n.' : ''), csay: 'Always go right.', ds: ops });
  });

  window.LESSON = {
    id: 'bst',
    mode: 'ds',
    title: 'Binary search trees',
    lede:
      'A binary search tree keeps one rule at every node: smaller values to the left, larger to the right. Each comparison then discards a whole subtree, so search, insert and delete cost O(height). Balanced, the height is about log2(n). Fed sorted data, the same code degrades to a linked list. Delete is the tricky operation, with three cases. Python has no built-in BST; the standard library offers bisect on a sorted list and the heap; C++ has std::map.',
    scenes: [
      { id: 'search', title: 'Search', blurb: 'Compare with the node, then go left or right. Each step discards half the remaining tree if it is balanced.', trap: 'The rule is about the whole subtree, not just the children. A tree where each node is merely larger than its left child and smaller than its right child is not necessarily a BST.', pyCode: ['cur = root', 'while cur and cur.val != x:', '    cur = cur.left if x < cur.val else cur.right', 'return cur'], cCode: ['Node *cur = root;', 'while (cur && cur->val != x)', '    cur = x < cur->val ? cur->left : cur->right;', 'return cur;'], predict: { q: 'In a balanced BST with about 1,000,000 nodes, roughly how many comparisons does a search need?', options: ['About 20', 'About 1,000', 'About 500,000'], answer: 0, why: 'Each comparison halves the remaining nodes. log2(1,000,000) is about 20.' }, steps: search },
      { id: 'insert', title: 'Insert', blurb: 'Walk down as if searching. When you fall off the tree, the new value goes right there as a leaf.', trap: 'Decide what happens with duplicates before you code: reject them, count them, or send equal values consistently to one side.', pyCode: ['def insert(n, v):', '    if not n: return Node(v)', '    if v < n.val: n.left = insert(n.left, v)', '    else: n.right = insert(n.right, v)', '    return n'], cCode: ['Node *insert(Node *n, int v) {', '    if (!n) return new_node(v);', '    if (v < n->val) n->left = insert(n->left, v);', '    else n->right = insert(n->right, v);', '    return n;', '}'], predict: { q: 'Why does the recursive insert end with <code>return n</code> and assign <code>n.left = insert(...)</code>?', options: ['To rebuild the links on the way back, so a new child is attached to its parent', 'Python requires every function to return its argument', 'To make a copy of the tree'], answer: 0, why: 'The recursive call returns the (possibly new) subtree root. Assigning it to n.left or n.right is what links the new leaf into the tree.' }, steps: insert },
      { id: 'delete', title: 'Delete', blurb: 'Leaf, one child, two children. The two-child case borrows the next value in sorted order.', trap: 'Do not forget the two-child case, and remember that the successor is the leftmost node of the right subtree. In C, free the node you removed, and be careful not to free the one you copied from while still linked.', pyCode: ['# leaf: n = None', '# one child: n = n.left or n.right', '# two children:', 's = min_node(n.right)', 'n.val = s.val; n.right = delete(n.right, s.val)'], cCode: ['/* leaf: free(n); return NULL; */', '/* one child: child = n->left ? n->left : n->right; free(n); return child; */', '/* two children: */', 'Node *s = min_node(n->right);', 'n->val = s->val; n->right = delete(n->right, s->val);'], predict: { q: 'Which node replaces a deleted node that has two children?', options: ['Its left child', 'The smallest node in its right subtree (the inorder successor)', 'Its parent'], answer: 1, why: 'The inorder successor is the next larger value, so putting it in the vacated position keeps every left value smaller and every right value larger. The largest node of the left subtree (the predecessor) also works.' }, steps: del },
      { id: 'skew', title: 'When it goes wrong', blurb: 'Sorted input makes every new node go to the same side. The BST turns into a linked list.', trap: 'Never assume a BST is balanced. Shuffle input, or use a self-balancing tree. In Python, a sorted list with bisect, or the sortedcontainers library, avoids writing one.', pyCode: ['root = None', 'for v in [1, 2, 3, 4, 5]:', '    root = insert(root, v)'], cCode: ['Node *root = NULL;', 'for (int i = 1; i <= 5; i++)', '    root = insert(root, i);'], predict: { q: 'What is the worst-case search cost in a BST of n nodes?', options: ['O(log n)', 'O(n)', 'O(1)'], answer: 1, why: 'A degenerate tree has height n - 1, so a search can visit every node.' }, steps: skew },
    ],
    builtins: [
      ['bisect.bisect_left(a, x)', 'Binary search on a sorted list: O(log n). A BST-like lookup without nodes.'],
      ['bisect.insort(a, x)', 'Insert into a sorted list: O(log n) search but O(n) shifting.'],
      ['sortedcontainers.SortedList', 'Third-party sorted structure with O(log n) insert and delete.'],
      ['sorted(inorder)', 'Inorder traversal of a BST is sorted.'],
      ['float("-inf"), float("inf")', 'Bounds used to validate a BST.'],
    ],
  };
})();
