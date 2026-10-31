/* Interview depth: Binary search trees. */
window.DEPTH = {
  thesis:
    'A binary search tree trades one invariant for fast ordered access: all keys in the left subtree are smaller and all keys in the right are larger, at every node. Every operation follows one root-to-leaf path, so cost is O(height). The whole subject then splits in two: how to maintain the invariant (delete is the hard part) and how to keep the height small (balancing).',
  why: [
    ['It keeps data sorted while allowing updates', 'A sorted array searches in O(log n) but inserts in O(n). A hash table inserts in O(1) but cannot answer range or successor queries. A balanced BST does search, insert, delete, min, max, successor and range in O(log n).'],
    ['Inorder traversal gives sorted order', 'That single fact solves validation, kth smallest, range sums and converting to a sorted list.'],
    ['Deletion is where you find out who understands it', 'Leaf and one-child cases are easy. The two-child case needs the successor or predecessor and a second delete. Describing why that preserves the invariant is the whole question.'],
    ['Balance is not free', 'Without it, sorted input builds a linked list. Self-balancing trees (AVL, red-black) pay a rotation cost on updates to guarantee O(log n).'],
  ],
  edges: [
    ['Duplicates', 'Choose a policy: reject, store a count in the node, or always send equal keys to one side. A policy applied inconsistently breaks search and validation.'],
    ['Sorted or nearly sorted input', 'Height becomes O(n). Shuffle the input, or use a balancing tree.'],
    ['Deleting the root', 'The root may have two children. The successor-copy method handles it with no special case, provided you return the new root from the recursive call.'],
    ['Integer bounds in validation', 'Using INT_MIN or INT_MAX as sentinels fails when a node contains that value. Use long, None or float infinities.'],
  ],
  cost: [
    ['search, insert, delete (balanced)', 'O(log n).'],
    ['search, insert, delete (skewed)', 'O(n).'],
    ['inorder traversal', 'O(n) time and O(h) space; yields sorted order.'],
    ['kth smallest', 'O(h + k) with inorder; O(h) if each node stores its subtree size.'],
    ['min / max', 'O(h): follow left (or right) links.'],
  ],
  internals: [
    ['Recursive insert and delete return the subtree root', 'Each call returns the root of the modified subtree and the caller reassigns it (`n.left = insert(n.left, v)`). That is how the new leaf, or the removal, is linked without parent pointers.'],
    ['Successor and predecessor', 'Successor is the leftmost node of the right subtree if there is one; otherwise it is the nearest ancestor for which this node lies in the left subtree.'],
    ['Rotations (the idea behind AVL and red-black)', 'A rotation changes the local shape in O(1) while preserving inorder order. Balancing schemes apply rotations after updates to bound the height: AVL to within 1.44 log2 n, red-black within 2 log2 n, with fewer rotations on average.'],
    ['What Python and C++ give you', 'Python has no built-in BST. Use `bisect` on a list for small or mostly-static data, or `sortedcontainers`. C++ has `std::map` and `std::set` (red-black trees).'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Walk through deleting a node from a BST.',
      a: 'Three cases. Leaf: remove it. One child: replace the node with that child. Two children: find the inorder successor (the leftmost node of the right subtree), copy its value into the node, then delete the successor from the right subtree; the successor has no left child, so that second delete is a leaf or one-child case. The invariant holds because the successor is the smallest value larger than everything on the left and no larger than anything on the right. O(h).',
      follow: [
        ['Could you use the predecessor instead?', 'Yes, the rightmost node of the left subtree works symmetrically. Alternating between the two avoids a systematic lean over many deletes.'],
        ['What do you return in the recursive version?', 'The root of the modified subtree, so the caller can relink it. Forgetting this is the usual bug.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'What is the time complexity of BST operations and what can go wrong?',
      a: 'O(h) for search, insert and delete. For a balanced tree h is about log2 n; for a skewed tree it is n - 1, which is what you get from inserting sorted data. So the honest answer is O(h), with the caveat that a plain BST gives no guarantee. Self-balancing trees guarantee O(log n).',
      follow: [
        ['How would you avoid the worst case without writing an AVL tree?', 'Shuffle the input before inserting if it is available up front (a random BST has expected height O(log n)), or build from a sorted array by always taking the middle as root.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Find the kth smallest element in a BST, then handle frequent queries with updates.',
      a: 'One query: inorder traversal and stop at the kth visited node: O(h + k) time, O(h) space. For frequent queries with inserts and deletes, augment each node with the size of its subtree. At a node, if k <= size(left) go left; if k == size(left) + 1 it is the node; otherwise go right with k - size(left) - 1. That is O(h) per query. Updates must maintain sizes along the path, which is O(h) as well.',
      follow: [
        ['This is an order-statistic tree. What else can you do with it?', 'Rank of a key, count of keys in a range, median maintenance.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Build a height-balanced BST from a sorted array.',
      a: 'Choose the middle element as the root and recurse on the left and right halves. Because each half has about n/2 elements, the two subtrees differ in height by at most one. O(n) time (each element placed once) and O(log n) recursion depth. Careful with the middle index and with slicing: pass indices, not slices, to avoid O(n log n) copying.',
      follow: [
        ['What if the input is a sorted linked list?', 'Either copy it to an array first, or simulate inorder: count the nodes, build the left half recursively while advancing the list pointer, use the current node as root, then build the right half. O(n) time and O(log n) space.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Why do databases use B-trees instead of red-black trees, and when would you pick a skip list?',
      a: 'The cost model differs. In memory a pointer hop is cheap, so a binary tree with small nodes works well. On disk each hop is a page read, so you want a very wide node (hundreds of keys per page) to make the tree 3 or 4 levels deep and read sequentially within a node. B-trees also keep leaves at equal depth and support efficient range scans through linked leaves (B+ trees). A skip list gives expected O(log n) with simpler, lock-friendlier code (insert touches a few forward pointers), which is why concurrent in-memory maps (and Redis sorted sets) use it. A red-black tree is a good general in-memory ordered map where worst-case guarantees matter.',
      follow: [
        ['What breaks if concurrent writers rebalance a tree?', 'Rotations touch several nodes at once, so you need lock coupling, versioning or a lock-free design. That complexity is the usual argument for skip lists and for copy-on-write trees.'],
      ],
    },
  ],
};
