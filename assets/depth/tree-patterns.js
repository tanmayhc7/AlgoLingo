/* Interview depth: Tree recursion patterns. */
window.DEPTH = {
  thesis:
    'Nearly every tree problem is one of two moves. Bottom-up: each call returns something about its subtree (height, size, a boolean, a best value) and the parent combines the two answers. Top-down: each call receives constraints from its ancestors (bounds, a running sum, a depth) and passes adjusted ones to its children. Naming which one you are doing, and what the function returns, solves most of the design before you write a line.',
  why: [
    ['Define what the function returns first', 'Say it in a sentence: "height(n) returns the height of the subtree rooted at n, or -1 if empty." Once that sentence is clear, the code writes itself and the base case is obvious.'],
    ['Bottom-up when the answer depends on subtrees', 'Height, diameter, balance check, max path sum and counting all combine children results. They are postorder.'],
    ['Top-down when constraints flow from ancestors', 'BST validation, path-sum with a running total and root-to-leaf paths pass state down as parameters.'],
    ['Sometimes you need both', 'Diameter returns a height (up) while updating a global best at each node. The returned value and the answer being built differ; keep them separate.'],
  ],
  edges: [
    ['Parent-only BST validation', 'Checking a node only against its parent accepts invalid trees. Use bounds or an inorder pass.'],
    ['Height convention', 'Leaf = 0 and empty = -1, or leaf = 1 and empty = 0. Choose one and be consistent, or the diameter and balance checks are off by one.'],
    ['Negative values', 'Max path sum with negative nodes: clamp each child contribution at 0, because you may choose not to extend the path.'],
    ['LCA when p or q is missing', 'The standard algorithm returns the other node as the answer. Confirm both exist if the problem does not guarantee it.'],
  ],
  cost: [
    ['Each pattern', 'O(n) time (each node once), O(h) space for the recursion.'],
    ['BST LCA by walking', 'O(h) time and O(1) space; it does not visit the whole tree.'],
    ['Balance check done naively', 'O(n^2) if you recompute height at every node. Return a sentinel (-2 or None) from one bottom-up pass to get O(n).'],
  ],
  internals: [
    ['Postorder as a return value', 'The call returns after both children are finished, so the combine step sees both results. The return statement is the combine step.'],
    ['Passing state down', 'Bounds and running totals are parameters, so each branch gets its own copy and there is nothing to undo. Mutable shared state (a list, a counter) must be restored on the way back.'],
    ['Global versus returned answers', 'When the quantity you return (height) is not the quantity you want (diameter), keep the best in a nonlocal or a one-element list and update it at each node.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Validate a binary search tree.',
      a: 'Recurse with a lower and an upper bound, initially minus and plus infinity. At each node require `lo < val < hi`, then check the left subtree with `hi = val` and the right with `lo = val`. A parent-only comparison is wrong because a node must satisfy every ancestor. Alternative: inorder traversal that checks each value is strictly greater than the previous one. O(n) time, O(h) space.',
      follow: [
        ['What changes if duplicates are allowed on the left?', 'Make the lower bound exclusive and the upper bound inclusive (or the reverse, matching the policy). Bounds are where the policy shows up.'],
        ['Why not use INT_MIN as the starting bound?', 'A node may contain INT_MIN. Use None, long long or infinities.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Find the height (maximum depth) of a binary tree, recursively and iteratively.',
      a: 'Recursive: `height(n) = -1 if not n else 1 + max(height(n.left), height(n.right))`. Iterative: BFS by levels and count how many levels you process, O(n) time and O(w) space. Both visit each node once. The recursive version uses O(h) stack, which can overflow on a skewed tree, so iterative BFS (or DFS with an explicit stack) is safer in production.',
      follow: [
        ['Minimum depth: why is it not min(height(left), height(right)) + 1?', 'A node with one child is not a leaf, so the path must continue through that child. Treat a missing child as infinite, or stop BFS at the first leaf.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Compute the diameter of a binary tree (longest path between any two nodes).',
      a: 'At each node the longest path through it is height(left) + height(right) + 2 (edges). Compute heights bottom-up and update a running maximum at every node. The function returns the height, but the answer is tracked separately. O(n) time and O(h) space. The naive version calls height at every node, giving O(n^2).',
      follow: [
        ['Generalise to the maximum path sum.', 'Same shape. Return the best downward path from the node (clamping child gains at 0), and update a global best with `val + max(left, 0) + max(right, 0)`.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Lowest common ancestor of two nodes in a general binary tree, not a BST.',
      a: 'Recurse. If the current node is None, p or q, return it. Otherwise search both subtrees. If both return non-null, p and q are in different subtrees, so the current node is the LCA. If only one is non-null, return it (it is either the LCA already found, or a single target that bubbles up). O(n) time, O(h) space. For many queries on a static tree, preprocess with an Euler tour plus a sparse table for O(1) queries, or use binary lifting for O(log n).',
      follow: [
        ['What if p or q might not be in the tree?', 'The simple algorithm returns the one that exists. Track found flags, or run a verification search, if existence is not guaranteed.'],
        ['What if nodes have parent pointers?', 'Treat them as two linked lists meeting at the LCA: advance the deeper node first, or use the two-pointer trick that swaps heads at the end.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'You have a tree-walking function that is too slow and sometimes overflows the stack. How do you approach it?',
      a: 'First measure: profile for the real time sink (repeated height calls turn O(n) into O(n^2); repeated subtrees call for memoisation). Check the actual depth distribution. For the overflow, convert to an explicit stack, which also makes the work resumable. For repeated subproblems on shared structure, memoise by node identity. If the tree is read many times and rarely changed, precompute aggregates in a single pass (subtree sizes, heights, Euler tour) and answer queries from them. If it is huge and on disk, think in pages: a different data structure (B-tree) rather than a faster traversal.',
      follow: [
        ['How do you convert a postorder recursion to iterative?', 'Use two stacks, or one stack with a "visited" marker, or push nodes preorder (root, right, left) and reverse the output. The marker approach keeps the combine step intact.'],
      ],
    },
  ],
};
