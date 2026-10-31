/* Lesson data: Binary trees (structure mode). */
(function () {
  function pos(i) {
    var level = Math.floor(Math.log(i) / Math.LN2);
    var first = Math.pow(2, level);
    return [Math.round((1000 * (2 * (i - first) + 1)) / (Math.pow(2, level + 1) * 1)), 60 + level * 90];
  }
  var VAL = { 1: 4, 2: 2, 3: 6, 4: 1, 5: 3, 6: 5, 7: 7 };
  var NODES = [1, 2, 3, 4, 5, 6, 7];
  function tree() {
    var ops = [];
    NODES.forEach(function (i) { var p = pos(i); ops.push(['node', 't' + i, String(VAL[i]), p[0], p[1], 'circle']); });
    NODES.forEach(function (i) {
      if (2 * i <= 7) ops.push(['edge', 't' + i, 't' + 2 * i, 'l']);
      if (2 * i + 1 <= 7) ops.push(['edge', 't' + i, 't' + (2 * i + 1), 'r']);
    });
    return ops;
  }
  var OUT_Y = 340;
  var STACK_Y = 430;

  /* depth-first traversals */
  var CALL_LINES = {
    pre: { py: ['def pre(n):', '    if not n: return', '    out.append(n.val)', '    pre(n.left)', '    pre(n.right)'], visit: 2, left: 3, right: 4 },
    inorder: { py: ['def inorder(n):', '    if not n: return', '    inorder(n.left)', '    out.append(n.val)', '    inorder(n.right)'], visit: 3, left: 2, right: 4 },
    post: { py: ['def post(n):', '    if not n: return', '    post(n.left)', '    post(n.right)', '    out.append(n.val)'], visit: 4, left: 2, right: 3 },
  };
  var C_LINES = {
    pre: ['void pre(Node *n) {', '    if (!n) return;', '    visit(n->val);', '    pre(n->left);', '    pre(n->right);', '}'],
    inorder: ['void inorder(Node *n) {', '    if (!n) return;', '    inorder(n->left);', '    visit(n->val);', '    inorder(n->right);', '}'],
    post: ['void post(Node *n) {', '    if (!n) return;', '    post(n->left);', '    post(n->right);', '    visit(n->val);', '}'],
  };
  var WHEN = {
    pre: 'before either child',
    inorder: 'after the left subtree and before the right',
    post: 'after both children',
  };

  function dfs(mode) {
    var L = CALL_LINES[mode];
    var steps = [{ pl: -1, cl: -1, say: 'A binary tree: each node has at most a left and a right child. A recursive function visits a node ' + WHEN[mode] + '. The call stack below shows the active calls.', csay: 'The same recursion in C. The call stack is the real machine stack.', ds: tree().concat([['node', 'lo', 'out', 70, OUT_Y, 'cell'], ['tag', 'lo', 'mark'], ['node', 'lc', 'calls', 70, STACK_Y, 'cell'], ['tag', 'lc', 'mark']]) }];
    var outCount = 0;
    var depth = 0;
    var curStack = [];
    function setCur(id) {
      var ops = [];
      curStack.forEach(function (c) { ops.push(['untag', c, 'cur']); });
      if (id) { ops.push(['tag', id, 'cur'], ['ptr', 'n', id, 'up']); } else ops.push(['unptr', 'n']);
      return ops;
    }
    function visit(i) {
      var id = 't' + i;
      var ops = [['hot', id], ['tag', id, 'done'], ['node', 'o' + outCount, String(VAL[i]), 150 + outCount * 80, OUT_Y, 'cell']];
      outCount++;
      return ops;
    }
    function rec(i, line) {
      var id = 't' + i;
      var ops = setCur(id);
      ops.push(['node', 'cs' + depth, String(VAL[i]), 150 + depth * 80, STACK_Y, 'cell']);
      curStack.push(id);
      depth++;
      var enterOps = ops;
      var sayEnter = 'Call ' + (mode === 'inorder' ? 'inorder' : mode) + '(' + VAL[i] + '). A new frame goes on the stack.';
      if (mode === 'pre') {
        enterOps = enterOps.concat(visit(i));
        sayEnter += ' Preorder visits it now, before its children: output ' + VAL[i] + '.';
      }
      steps.push({ pl: line, cl: line, say: sayEnter, csay: 'Call with node ' + VAL[i] + '.', ds: enterOps });
      var left = 2 * i <= 7 ? 2 * i : null;
      var right = 2 * i + 1 <= 7 ? 2 * i + 1 : null;
      if (left) rec(left, L.left);
      else steps.push({ pl: 1, cl: 1, say: 'The left child is None, so that call returns at once. This is the base case.', csay: 'NULL child: return.', ds: [] });
      if (mode === 'inorder') steps.push({ pl: L.visit, cl: L.visit, say: 'Left subtree finished. Inorder visits ' + VAL[i] + ' now: output ' + VAL[i] + '.', csay: 'visit(' + VAL[i] + ').', ds: visit(i) });
      if (right) rec(right, L.right);
      else steps.push({ pl: 1, cl: 1, say: 'The right child is None: return.', csay: 'NULL child: return.', ds: [] });
      var leaveOps = [['rm', 'cs' + (depth - 1)]];
      var sayLeave = 'Both children done. Frame for ' + VAL[i] + ' pops.';
      if (mode === 'post') {
        leaveOps = visit(i).concat(leaveOps);
        sayLeave = 'Both children are finished, so postorder visits ' + VAL[i] + ' now: output ' + VAL[i] + '. Then the frame pops.';
      }
      curStack.pop();
      depth--;
      leaveOps = leaveOps.concat(curStack.length ? [['tag', curStack[curStack.length - 1], 'cur'], ['ptr', 'n', curStack[curStack.length - 1], 'up']] : [['unptr', 'n']]);
      leaveOps.unshift(['untag', id, 'cur']);
      steps.push({ pl: C_LINES[mode].length - 1 === 5 ? 4 : 4, cl: 5, say: sayLeave, csay: 'Return to the caller.', ds: leaveOps });
    }
    rec(1, 0);
    var res = { pre: '4, 2, 1, 3, 6, 5, 7', inorder: '1, 2, 3, 4, 5, 6, 7', post: '1, 3, 2, 5, 7, 6, 4' }[mode];
    steps.push({ pl: -1, cl: -1, say: 'Output: ' + res + '.' + (mode === 'inorder' ? ' Inorder on a binary search tree comes out sorted, which is the key property of a BST.' : mode === 'pre' ? ' Preorder is the order you would copy or serialise a tree in: parents before children.' : ' Postorder is the order you would delete a tree in: children before parents.'), csay: 'Output: ' + res + '.', ds: [] });
    return steps;
  }

  /* breadth-first */
  function bfs() {
    var steps = [{ pl: -1, cl: -1, say: 'Level order uses a queue instead of recursion. It visits all nodes at depth 0, then depth 1, then depth 2.', csay: 'Same with a queue array.', ds: tree().concat([['node', 'lq', 'queue', 70, OUT_Y, 'cell'], ['tag', 'lq', 'mark'], ['node', 'lo', 'out', 70, STACK_Y, 'cell'], ['tag', 'lo', 'mark']]) }];
    var queue = [];
    var qid = 0;
    var outCount = 0;
    function qnode(i) {
      var id = 'q' + qid++;
      queue.push({ id: id, slot: i });
      return ['node', id, String(VAL[i]), 150 + (queue.length - 1) * 80, OUT_Y, 'cell'];
    }
    steps.push({ pl: 0, cl: 0, say: 'Start with the root in the queue.', csay: 'Enqueue the root.', ds: [qnode(1)] });
    while (queue.length) {
      var cur = queue.shift();
      var ops = [['rm', cur.id], ['tag', 't' + cur.slot, 'done'], ['hot', 't' + cur.slot], ['node', 'o' + outCount, String(VAL[cur.slot]), 150 + outCount * 80, STACK_Y, 'cell']];
      outCount++;
      queue.forEach(function (q, k) { ops.push(['mv', q.id, 150 + k * 80, OUT_Y]); });
      var kids = [];
      [2 * cur.slot, 2 * cur.slot + 1].forEach(function (c) { if (c <= 7) { ops.push(qnode(c)); kids.push(VAL[c]); } });
      steps.push({ pl: 2, cl: 2, say: 'Dequeue ' + VAL[cur.slot] + ' and visit it' + (kids.length ? ', then enqueue its children ' + kids.join(' and ') + ' at the back.' : '. It has no children.') + ' Everything already waiting is the same depth or one deeper, so levels stay in order.', csay: 'Dequeue, visit, enqueue the children.', ds: ops });
    }
    steps.push({ pl: -1, cl: -1, say: 'Output: 4, 2, 6, 1, 3, 5, 7, one level at a time. To report levels separately, process exactly len(queue) nodes per round. O(n) time, and the queue can hold up to n/2 nodes, which is O(n) space.', csay: 'O(n) time, O(n) space for the widest level.', ds: [] });
    return steps;
  }

  var builds = [
    { pl: -1, cl: -1, say: 'A tree is nodes joined by parent-to-child references. The node at the top is the root. A node with no children is a leaf.', csay: 'A node is a struct with val, left and right pointers.', ds: [] },
    { pl: 0, cl: 0, say: 'The root holds 4. Both child links start as None.', csay: 'malloc a node; left and right are NULL.', ds: [['node', 't1', '4', pos(1)[0], pos(1)[1], 'circle'], ['ptr', 'root', 't1', 'up']] },
    { pl: 1, cl: 1, say: 'root.left = Node(2) attaches a left child. That child is itself the root of a smaller tree, which is why recursion fits so well.', csay: 'root->left = new_node(2).', ds: [['node', 't2', '2', pos(2)[0], pos(2)[1], 'circle'], ['edge', 't1', 't2', 'l']] },
    { pl: 2, cl: 2, say: 'root.right = Node(6).', csay: 'root->right = new_node(6).', ds: [['node', 't3', '6', pos(3)[0], pos(3)[1], 'circle'], ['edge', 't1', 't3', 'r']] },
    { pl: 3, cl: 3, say: 'Add the two children of node 2. Every node has at most two children.', csay: 'Add node 2\'s children.', ds: [['node', 't4', '1', pos(4)[0], pos(4)[1], 'circle'], ['edge', 't2', 't4', 'l'], ['node', 't5', '3', pos(5)[0], pos(5)[1], 'circle'], ['edge', 't2', 't5', 'r']] },
    { pl: 4, cl: 4, say: 'And the two children of node 6. This tree has 7 nodes in 3 levels: it is "perfect". Height (edges from root to the deepest leaf) is 2.', csay: 'And node 6\'s children.', ds: [['node', 't6', '5', pos(6)[0], pos(6)[1], 'circle'], ['edge', 't3', 't6', 'l'], ['node', 't7', '7', pos(7)[0], pos(7)[1], 'circle'], ['edge', 't3', 't7', 'r']] },
  ];

  window.LESSON = {
    id: 'binary-trees',
    mode: 'ds',
    title: 'Binary trees and traversals',
    lede:
      'A binary tree is a linked list with a second pointer: each node has a left and a right child. Almost every tree problem is a traversal in disguise. Depth-first traversals (preorder, inorder, postorder) use recursion or a stack and differ only in when the node is visited. Breadth-first (level order) uses a queue. The picture is shared by both languages; only the node definition differs: a class in Python, a struct with two pointers in C.',
    scenes: [
      {
        id: 'build',
        title: 'Nodes and links',
        blurb: 'A node holds a value and two references. A tree is just the root: from it, everything else is reachable.',
        trap: 'None is a valid tree (the empty tree), and every recursive function must handle it first. Most tree bugs are a missing base case.',
        pyCode: ['root = Node(4)', 'root.left = Node(2)', 'root.right = Node(6)', 'root.left.left = Node(1); root.left.right = Node(3)', 'root.right.left = Node(5); root.right.right = Node(7)'],
        cCode: ['Node *root = new_node(4);', 'root->left = new_node(2);', 'root->right = new_node(6);', 'root->left->left = new_node(1); root->left->right = new_node(3);', 'root->right->left = new_node(5); root->right->right = new_node(7);'],
        predict: {
          q: 'What is the <b>height</b> of this tree, counting edges on the longest root-to-leaf path?',
          options: ['2', '3', '7'],
          answer: 0,
          why: 'The path root, child, leaf has 2 edges, so the height is 2 (3 if you count levels instead of edges, so always ask which convention).',
        },
        steps: builds,
      },
      {
        id: 'preorder',
        title: 'Preorder',
        blurb: 'Visit the node, then the left subtree, then the right. Parents come before children.',
        trap: 'The three DFS orders share the same code with the visit line moved. If you can write one, you can write all three.',
        pyCode: CALL_LINES.pre.py,
        cCode: C_LINES.pre,
        predict: {
          q: 'What is the preorder output for this tree?',
          options: ['1, 2, 3, 4, 5, 6, 7', '4, 2, 1, 3, 6, 5, 7', '1, 3, 2, 5, 7, 6, 4'],
          answer: 1,
          why: 'Root 4 first, then the whole left subtree (2, 1, 3), then the whole right subtree (6, 5, 7).',
        },
        steps: dfs('pre'),
      },
      {
        id: 'inorder',
        title: 'Inorder',
        blurb: 'Left subtree, then the node, then the right subtree. On a binary search tree this is sorted order.',
        trap: 'Inorder gives sorted output only if the tree really is a BST. It is the quickest way to test one.',
        pyCode: CALL_LINES.inorder.py,
        cCode: C_LINES.inorder,
        predict: {
          q: 'This tree is a binary search tree. What does inorder print?',
          options: ['1, 2, 3, 4, 5, 6, 7', '4, 2, 6, 1, 3, 5, 7', '7, 6, 5, 4, 3, 2, 1'],
          answer: 0,
          why: 'In a BST everything left of a node is smaller and everything right is larger, so left, node, right is ascending.',
        },
        steps: dfs('inorder'),
      },
      {
        id: 'postorder',
        title: 'Postorder',
        blurb: 'Both subtrees first, then the node. Children come before parents, which is what you need to compute heights or free memory.',
        trap: 'In C, freeing a tree needs postorder. Free the root first and you lose the pointers to its children.',
        pyCode: CALL_LINES.post.py,
        cCode: C_LINES.post,
        predict: {
          q: 'Which order would you use to delete every node of a tree in C?',
          options: ['Preorder', 'Inorder', 'Postorder'],
          answer: 2,
          why: 'You must free the children before the parent, otherwise the parent\'s child pointers are gone. That is postorder.',
        },
        steps: dfs('post'),
      },
      {
        id: 'levelorder',
        title: 'Level order',
        blurb: 'Breadth-first with a queue: finish a whole level before the next.',
        trap: 'Use a deque, not a list with pop(0). And enqueue the children when you dequeue the parent, not before.',
        pyCode: ['q = deque([root])', 'while q:', '    n = q.popleft(); out.append(n.val)', '    if n.left: q.append(n.left)', '    if n.right: q.append(n.right)'],
        cCode: ['enqueue(&q, root);', 'while (!empty(&q)) {', '    Node *n = dequeue(&q); visit(n->val);', '    if (n->left) enqueue(&q, n->left);', '    if (n->right) enqueue(&q, n->right);', '}'],
        predict: {
          q: 'Which traversal uses a queue?',
          options: ['Preorder', 'Level order', 'Postorder'],
          answer: 1,
          why: 'Level order is breadth-first, and breadth-first search uses a queue. The three depth-first orders use recursion or a stack.',
        },
        steps: bfs(),
      },
    ],
    builtins: [
      ['class Node: val, left, right', 'A tree node. TreeNode in LeetCode problems.'],
      ['if not node: return', 'The base case for every recursive tree function.'],
      ['collections.deque', 'The queue for level order.'],
      ['len(q) inside the loop', 'Process one level per round by snapshotting the length.'],
      ['sys.setrecursionlimit', 'Deep, skewed trees can exceed the default limit; use an explicit stack.'],
    ],
  };
})();
