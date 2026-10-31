/* Interview depth: Linked list basics. */
window.DEPTH = {
  thesis:
    'A linked list trades random access for cheap rearrangement. Reaching item i costs O(i), but once you hold a node, inserting after it or removing the node after it is a couple of pointer writes. In practice arrays beat lists on almost everything because of cache locality, so the interview value of linked lists is pointer reasoning: order of assignments, aliasing, edge cases at the ends, and memory ownership.',
  why: [
    ['Nodes, not indexes', 'There is no `xs[i]`. All you have is a reference to one node and the arrows out of it. Every algorithm is "which pointer do I hold, which arrow do I change, and what do I lose if I change it first".'],
    ['Pointer assignment order is the whole game', 'Overwriting an arrow can orphan everything after it. The safe pattern is: save what you will need, link the new thing to the old tail, then redirect the old arrow.'],
    ['Walkers are copies of references', '`cur = head` creates a second name for the same node, not a copy. Moving `cur` does not move `head`. Mutating through either name changes the shared node.'],
    ['Ownership is a C question, reachability is a Python question', 'In C every `malloc` needs exactly one `free`, and a freed node must never be touched again. In Python a node lives while something references it, so unlinking is enough, unless a cycle keeps it alive until the cycle collector runs.'],
  ],
  edges: [
    ['Empty list', '`head is None`. Every function must handle it before touching `head.next`.'],
    ['Single node', 'Head and tail are the same node. Delete, reverse and middle-finding all have a one-node case worth tracing.'],
    ['Deleting the head', 'No predecessor exists. Either special-case it (`head = head.next`) or use a dummy head.'],
    ['Deleting the tail', 'You must stop at the second-to-last node: loop `while cur.next and cur.next.next`. A single pointer cannot do it.'],
    ['Inserting at the tail', 'O(n) without a tail pointer. Keep a `tail` reference for O(1) appends, and remember to update it when you delete the last node.'],
    ['Deleting a node you only have a pointer to', 'You cannot unlink it without its predecessor. The classic trick copies the next node\'s value into this one and deletes the next node. It fails for the tail and changes node identity.'],
    ['Cycles', 'A traversal loop on a cyclic list never ends. Guard with a step counter or Floyd\'s algorithm when input is untrusted.'],
    ['Aliased nodes', 'Two lists can share a tail (a "Y" shape). Mutating the shared part changes both lists.'],
    ['C: use after free and double free', 'Read `next` before `free`. After `free(p)`, set `p = NULL`. Never free a node that is still linked from elsewhere.'],
    ['C: head passed by value', 'A function that changes the head needs `Node **head` or must return the new head. Assigning to a local copy of `head` changes nothing for the caller.'],
    ['Python: recursion depth', 'Recursive traversal or recursive reverse on 10^5 nodes exceeds the default recursion limit. Prefer loops.'],
    ['Python: `__eq__` on nodes', 'Without it, `==` is identity, which is usually what you want for cycle checks. Use `is` to be explicit.'],
  ],
  cost: [
    ['access i-th node', 'O(i)', 'Walk from head.'],
    ['search by value', 'O(n)', 'Linear scan.'],
    ['insert at head', 'O(1)', 'Two pointer writes.'],
    ['insert after a held node', 'O(1)', 'Two pointer writes.'],
    ['insert at tail', 'O(n) or O(1)', 'O(1) with a tail pointer.'],
    ['delete after a held node', 'O(1)', 'One pointer write.'],
    ['delete by value', 'O(n)', 'Find, then unlink.'],
    ['length', 'O(n) or O(1)', 'O(1) if you maintain a counter.'],
    ['memory per node (Python)', '~56 bytes + value', 'Object header, `__dict__` or slots, plus the int. `__slots__` cuts it to about 48.'],
    ['memory per node (C)', '16 bytes + malloc overhead', '4 byte int, padding, 8 byte pointer, and 8 to 16 bytes of allocator bookkeeping.'],
  ],
  internals: [
    ['Why arrays usually win', 'A list node is a separate allocation, so walking it chases pointers across memory and misses the cache. A contiguous array streams through the cache. Even `insert(0, x)` on a short Python list often beats a linked list because the memmove is so fast.'],
    ['Where linked lists really win', 'Stable references that survive insertions and removals (an iterator or handle stays valid), O(1) splice of one list into another, lock-free queues, intrusive lists in kernels (the Linux `list_head` embeds the links inside the object), and free lists in allocators.'],
    ['Reference counting in CPython', 'Unlinking the last reference to a node drops its refcount to zero and frees it immediately, which frees its `next` in turn. A very long chain therefore frees recursively and can overflow the C stack on deletion; CPython uses a "trashcan" mechanism to limit that.'],
    ['`__slots__`', 'Declaring `__slots__ = ("val", "next")` removes the per-instance dict, roughly halving memory for millions of nodes and speeding attribute access a little.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Why can\'t you insert after a node by writing `b.next = new; new.next = b.next`?',
      a: 'After the first assignment `b.next` is `new`, so the second line sets `new.next = new`, a self-loop, and the old tail is unreachable. The correct order is `new.next = b.next` first, then `b.next = new`. The general rule: link the new node to what it must point at before you overwrite the only arrow that holds that information.',
      follow: [
        ['How would you write it with a tuple assignment?', '`b.next, new.next = new, b.next`. Python evaluates the right side first, so it captures the old `b.next` before either assignment happens. It is neat but easy to misread, so many teams prefer two lines.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Implement `delete(head, target)` that removes the first node with the given value.',
      a: 'Handle the head separately: `if head and head.val == target: return head.next`. Otherwise walk with `cur = head` while `cur.next`, and when `cur.next.val == target` do `cur.next = cur.next.next` and stop. Return head. With a dummy node the special case disappears: `dummy = Node(0, head); cur = dummy; ...; return dummy.next`. Time O(n), space O(1). Edge cases: empty list, target at head, at tail, absent, duplicates (decide first or all).',
      follow: [
        ['What changes to delete all occurrences?', 'Do not advance `cur` after a deletion, because the new `cur.next` may also match. Advance only in the else branch.'],
        ['What do you do in C?', 'Free the removed node after unlinking, and take `Node **head` (or return the new head) so a deleted head is visible to the caller.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'You are given only a pointer to a node in the middle of a singly linked list (not the head, not the tail). Delete it.',
      a: 'You cannot unlink the node itself because you cannot reach its predecessor. Copy the next node\'s value into this node, then bypass the next node: `node.val = node.next.val; node.next = node.next.next`. This works in O(1) but has costs: it does not work for the tail (there is no next), it changes which node object holds which value (any other reference to the next node now dangles or points at removed data), and in C you free the next node, not the one you were given. I would only do this when the API forces it, and I would say so.',
      follow: [
        ['Why is it a hack?', 'The operation deletes a value, not the node you named. Any outside holder of the next node\'s address now has a stale pointer, and any invariant that ties identity to a node breaks.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Compare an array-backed list and a linked list for a queue and for a text editor buffer.',
      a: 'Queue: a linked list gives O(1) enqueue and dequeue with head and tail pointers, but a ring buffer or `collections.deque` (blocks of 64 items) gives the same O(1) with far better locality and less memory, so I would use those. Text editor: inserting in the middle of a big array is O(n) memmove, which is fine for small files but poor for huge ones. Real editors use a gap buffer (an array with a movable hole, great for local edits), a rope (a balanced tree of chunks), or a piece table. A plain linked list of characters would waste 16 to 24 bytes per character and destroy locality.',
      follow: [
        ['When would you actually pick a linked list?', 'When you need stable handles and O(1) removal from the middle given a handle (LRU caches, timers, intrusive kernel lists), or when splicing whole lists together must be O(1).'],
      ],
    },
    {
      lvl: 'staff',
      q: 'How would you implement a lock-free stack with a linked list, and what goes wrong?',
      a: 'Push: allocate a node, read `head`, set `node.next = head`, then `compare_and_swap(&head, old, node)`; retry on failure. Pop: read `head`, read `head.next`, CAS head to next. The danger is the ABA problem: between reading `head.next` and the CAS, other threads pop A, pop B, and push A back. The CAS sees `head == A` and succeeds, but `A.next` is no longer what you read, so you install a stale pointer and corrupt the stack. Fixes: tagged pointers (a version counter packed with the pointer, or a double-width CAS), hazard pointers, or epoch-based reclamation, which also solves safe memory reclamation (you must not free a node another thread may still be reading).',
      follow: [
        ['Why does a garbage-collected language make this easier?', 'The collector never reuses a node address while any thread still references it, so ABA from address reuse cannot happen and there is no unsafe reclamation problem. You can still get logical ABA if you recycle nodes yourself.'],
      ],
    },
  ],
};
