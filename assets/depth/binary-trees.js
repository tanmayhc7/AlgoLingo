/* Interview depth: Binary trees and traversals. */
window.DEPTH = {
  thesis:
    'A binary tree is a recursive definition: a node plus two smaller trees. Almost every tree question reduces to choosing when to act on a node relative to its children (before, between or after) and what to pass down or return up. Traversal order is that choice made explicit, and the stack or queue behind it is what separates depth-first from breadth-first.',
  why: [
    ['Recursion mirrors the data', 'A tree is defined in terms of smaller trees, so a function that handles None and combines the results for left and right is usually correct by induction. Prove the base case and the combine step and you are done.'],
    ['Traversal order is a design decision', 'Preorder acts before the children (copying, serialising). Inorder acts between them (sorted output for a BST). Postorder acts after them (height, deletion, evaluating expressions). Pick the order the problem needs.'],
    ['DFS uses a stack, BFS uses a queue', 'Recursive DFS uses the call stack implicitly. An iterative version uses an explicit stack. Swap that for a FIFO queue and the same loop becomes level-order BFS.'],
    ['Space is the height, not the size', 'DFS holds one root-to-node path: O(h). BFS holds one level: up to O(n/2) for the widest level of a complete tree. Which is smaller depends on the shape.'],
  ],
  edges: [
    ['Empty tree and single node', 'The root can be None. Handle it first, or every access to root.left crashes.'],
    ['Skewed tree and recursion depth', 'A chain of 100,000 nodes recurses 100,000 deep. Python stops at about 1,000 frames by default (RecursionError); C overflows the stack. Use an iterative version for untrusted depth.'],
    ['Duplicates', 'Ask how equal values are treated before coding anything BST-related.'],
    ['Shared or cyclic structure', 'If a node can be reached twice, the structure is a DAG or a graph and plain recursion repeats work or loops forever.'],
  ],
  cost: [
    ['Any full traversal', 'O(n) time, since each node is visited once. O(h) extra space for DFS, O(w) for BFS (w = maximum width).'],
    ['Height h', 'About log2(n) when balanced, n - 1 when skewed.'],
    ['Level-order with a list as queue', 'O(n^2) if you pop(0); use collections.deque for O(n).'],
  ],
  internals: [
    ['Node layout', 'A node is a value and two child references. In C, `struct Node { int val; struct Node *left, *right; }` is 24 bytes on a 64-bit machine (4 + padding + 8 + 8). Each node is a separate allocation, so traversal chases pointers and has poor cache locality compared with an array.'],
    ['Heap-array layout', 'A complete tree can live in an array: children of index i are at 2i + 1 and 2i + 2, the parent at (i - 1) // 2. No pointers, good locality. This is how binary heaps are stored.'],
    ['What the call stack holds', 'During recursive DFS each active call is one ancestor on the current path, plus its local state. That is why the stack depth equals the depth of the current node.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Explain preorder, inorder and postorder, and give a use for each.',
      a: 'Preorder visits node, left, right: good for copying a tree or serialising it, since the root comes first. Inorder visits left, node, right: on a BST it yields values in sorted order. Postorder visits left, right, node: children are finished before the parent, which suits computing height, freeing memory, or evaluating an expression tree. All three are O(n) time and O(h) space.',
      follow: [
        ['Which traversal reconstructs a tree from its output?', 'Two orders are needed, for example preorder plus inorder, because preorder gives the root and inorder splits left from right. Preorder alone is ambiguous unless nulls are recorded.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Write level-order traversal. Why a queue?',
      a: 'Put the root in a deque. While the deque is not empty, pop the front, record it, and append its non-null children. FIFO order means every node at depth d is served before any node at depth d + 1. To group by level, capture `len(queue)` at the start of each round and process exactly that many nodes. O(n) time, O(w) space.',
      follow: [
        ['How do you return the right-side view?', 'Do level-order and keep the last node of each level.'],
        ['Why not use a list with pop(0)?', 'pop(0) is O(n), making the traversal O(n^2).'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Convert recursive inorder to iterative. What does the explicit stack represent?',
      a: 'Use a stack and a cursor. Push the cursor and go left until None; then pop, visit, and move to the right child. The stack holds the ancestors whose left subtree is being processed and which still need to be visited, exactly what the call stack held in the recursive version. Space stays O(h). The iterative form avoids RecursionError on deep trees and lets you pause and resume, which is how an iterator over a BST is built.',
      follow: [
        ['Can you do inorder in O(1) extra space?', 'Yes, Morris traversal temporarily threads the rightmost node of the left subtree back to the current node, then removes the thread. O(n) time, O(1) space, but it mutates the tree while running, so it is unsafe for concurrent readers.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Serialise and deserialise a binary tree.',
      a: 'Preorder with explicit null markers, for example `4,2,1,#,#,3,#,#,6,...`. Deserialise by reading tokens in order with a recursive function: a marker returns None, otherwise create a node and build left then right. The markers make the shape unambiguous, so one traversal suffices. O(n) time and space. Level-order with nulls also works and matches the format used by many judges.',
      follow: [
        ['What about a BST?', 'Preorder alone is enough, without markers, because the value ranges determine where each node goes. Insert in preorder, or rebuild with bounds, in O(n).'],
      ],
    },
    {
      lvl: 'staff',
      q: 'A tree has 10 million nodes and may be badly skewed. How do you traverse it safely in production?',
      a: 'Never rely on recursion depth. Use an explicit stack or queue stored on the heap, so depth is limited by memory, not by the call stack. If memory is also tight, Morris traversal gives O(1) extra space for inorder, at the cost of temporarily modifying the tree. For concurrency, snapshot or use persistent structures so readers do not see threads. Measure the real depth distribution, since a skewed tree is also a symptom: if the data should be balanced, fix the insertion path with a self-balancing tree or a B-tree for on-disk data.',
      follow: [
        ['Why are B-trees common for storage?', 'Each node holds many keys sized to a disk page, so the height is tiny (3 or 4 levels for millions of rows) and every level costs one page read.'],
      ],
    },
  ],
};
