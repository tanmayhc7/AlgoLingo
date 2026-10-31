/* Lesson data: Linked list basics (structure mode).
   Structure ops are documented above buildDsSnapshots in assets/engine.js. */
(function () {
  var X = function (i) { return 150 + i * 150; };
  var Y = 130;

  /* a ready-made list 1 -> 2 -> 3 -> 4, with a head pointer */
  function list4() {
    var ops = [];
    for (var i = 0; i < 4; i++) ops.push(['node', 'n' + (i + 1), String(i + 1), X(i), Y]);
    for (var j = 0; j < 3; j++) ops.push(['edge', 'n' + (j + 1), 'n' + (j + 2)]);
    ops.push(['ptr', 'head', 'n1', 'up']);
    return ops;
  }

  var traverse = [
    { pl: -1, cl: -1, say: 'A linked list of four nodes. head is the only name we keep; every other node is reached by following next.', csay: 'Four heap-allocated structs. head holds the address of the first one.', ds: list4() },
    { pl: 0, cl: 0, say: 'cur = head makes a second name for the first node. Nothing is copied.', csay: 'cur gets the same address that head holds.', ds: [['ptr', 'cur', 'n1', 'down'], ['tag', 'n1', 'cur']] },
  ];
  for (var i = 1; i <= 4; i++) {
    var id = 'n' + i;
    traverse.push({ pl: 1, cl: 1, say: 'Is cur truthy? It is a node, so yes. Enter the loop.', csay: 'cur != NULL is true, so the loop body runs.', ds: [['hot', id]] });
    traverse.push({ pl: 2, cl: 2, say: 'Print ' + i + '.', csay: 'Print ' + i + '.', ds: [['hot', id], ['tag', id, 'done']] });
    if (i < 4) {
      traverse.push({ pl: 3, cl: 3, say: 'cur = cur.next follows the arrow. cur now names node ' + (i + 1) + '.', csay: 'cur = cur->next copies the next address into cur.', ds: [['untag', id, 'cur'], ['ptr', 'cur', 'n' + (i + 1), 'down'], ['tag', 'n' + (i + 1), 'cur']] });
    } else {
      traverse.push({ pl: 3, cl: 3, say: 'The last node\'s next is None, so cur becomes None.', csay: 'The last node\'s next is NULL, so cur becomes NULL.', ds: [['untag', id, 'cur'], ['ptr', 'cur', null]] });
      traverse.push({ pl: 1, cl: 1, say: 'None is falsy. The loop ends. The walk touched every node once: O(n).', csay: 'cur == NULL, so the loop ends. The walk touched every node once: O(n).', ds: [] });
    }
  }

  window.LESSON = {
    id: 'linked-list-basics',
    mode: 'ds',
    title: 'Linked list basics',
    lede:
      'A linked list is a chain of nodes. Each node holds a value and a reference to the next node, and you keep one name, head, for the first. There is no index arithmetic: to reach the third node you walk. In Python a node is an object with val and next attributes. In C it is a struct allocated with malloc, and next is a pointer. The picture is the same for both, so one diagram serves both languages.',
    scenes: [
      {
        id: 'build',
        title: 'Build a list',
        blurb: 'Python: class Node with val and next (None at the end). C: struct Node { int val; struct Node *next; }, made with malloc. Watch the links form one by one.',
        trap: 'The node does not know where it is in the list. Only the arrows do. If you overwrite the one arrow that leads to a node and keep no other name for it, that node and everything after it are lost.',
        pyCode: ['a = Node(1)', 'b = Node(2)', 'c = Node(3)', 'a.next = b', 'b.next = c', 'head = a'],
        cCode: ['Node *a = new_node(1);', 'Node *b = new_node(2);', 'Node *c = new_node(3);', 'a->next = b;', 'b->next = c;', 'Node *head = a;'],
        predict: {
          q: 'After these lines, what does <code>head.next.next.val</code> give?',
          options: ['1', '2', '3'],
          answer: 2,
          why: 'head is node 1. head.next is node 2. head.next.next is node 3, whose val is 3. Each .next follows one arrow.',
        },
        steps: [
          { pl: -1, cl: -1, say: 'Press Step. Each new node starts with next set to None.', csay: 'Each new node starts with next set to NULL.', ds: [] },
          { pl: 0, cl: 0, say: 'Node(1) builds an object with val = 1 and next = None. The name a points at it.', csay: 'malloc reserves a struct on the heap. The pointer a holds its address, and next is NULL.', ds: [['node', 'n1', '1', X(0), Y], ['ptr', 'a', 'n1', 'down']] },
          { pl: 1, cl: 1, say: 'A second, separate node. It is not connected to anything yet.', csay: 'A second block on the heap, not linked yet.', ds: [['node', 'n2', '2', X(1), Y], ['ptr', 'b', 'n2', 'down']] },
          { pl: 2, cl: 2, say: 'And a third.', csay: 'And a third.', ds: [['node', 'n3', '3', X(2), Y], ['ptr', 'c', 'n3', 'down']] },
          { pl: 3, cl: 3, say: 'a.next = b stores a reference to node 2 inside node 1. That is the link.', csay: 'a->next = b stores the address of node 2 inside node 1.', ds: [['edge', 'n1', 'n2']] },
          { pl: 4, cl: 4, say: 'b.next = c links node 2 to node 3. c.next is still None, which marks the end.', csay: 'b->next = c links node 2 to node 3. c->next is still NULL.', ds: [['edge', 'n2', 'n3']] },
          { pl: 5, cl: 5, say: 'head = a names the first node. From here a, b and c could all be dropped and head alone keeps the whole list reachable.', csay: 'head holds the first address. In real code you keep only head.', ds: [['ptr', 'head', 'n1', 'up']] },
        ],
      },
      {
        id: 'traverse',
        title: 'Walk the list',
        blurb: 'The loop every list problem starts from. The walker cur moves one arrow per step.',
        trap: 'Do not move head itself while walking. If you write head = head.next you lose the only name for the front, and later code cannot get back to it. Walk with a second pointer.',
        pyCode: ['cur = head', 'while cur:', '    print(cur.val)', '    cur = cur.next'],
        cCode: ['Node *cur = head;', 'while (cur != NULL) {', '    printf("%d\\n", cur->val);', '    cur = cur->next;', '}'],
        predict: {
          q: 'How many times does <code>cur = cur.next</code> run for a list of 4 nodes?',
          options: ['3', '4', '5'],
          answer: 1,
          why: 'It runs once per node, including the last, where it moves cur from the final node to None. That is 4 times. The loop test runs 5 times.',
        },
        steps: traverse,
      },
      {
        id: 'insert',
        title: 'Insert in the middle',
        blurb: 'Insert 9 after node 2. Given a pointer to node 2, this takes a constant number of steps, no shifting like an array.',
        trap: 'Order matters. Writing b.next = new first overwrites the only link to node 3, and the rest of the list is lost. Point the new node at the tail first, then redirect the old link.',
        pyCode: ['new = Node(9)', 'new.next = b.next', 'b.next = new'],
        cCode: ['Node *nw = new_node(9);', 'nw->next = b->next;', 'b->next = nw;'],
        predict: {
          q: 'What goes wrong if you run <code>b.next = new</code> <b>before</b> <code>new.next = b.next</code>?',
          options: ['Nothing, the order does not matter', 'The nodes after b become unreachable and the list is cut short', 'Python raises an error'],
          answer: 1,
          why: 'b.next = new overwrites the only reference to node 3. Then new.next = b.next just points the new node at itself. Node 3 and the rest have no name and no arrow leading to them.',
        },
        steps: [
          { pl: -1, cl: -1, say: 'A list 1, 2, 3, 4 with b naming node 2.', csay: 'The same list. b holds the address of node 2.', ds: list4().concat([['ptr', 'b', 'n2', 'down']]) },
          { pl: 0, cl: 0, say: 'Build the new node first. It floats free, not linked yet.', csay: 'malloc a new block. Not linked yet.', ds: [['node', 'nw', '9', X(1) + 75, Y + 110], ['ptr', 'new', 'nw', 'down']] },
          { pl: 1, cl: 1, say: 'new.next = b.next: the new node now points at node 3. Both node 2 and the new node point at node 3 for a moment, which is fine.', csay: 'nw->next = b->next copies node 3\'s address into the new node.', ds: [['edge', 'nw', 'n3']] },
          { pl: 2, cl: 2, say: 'b.next = new redirects node 2 to the new node. The chain is now 1, 2, 9, 3, 4.', csay: 'b->next = nw redirects node 2. The chain is 1, 2, 9, 3, 4.', ds: [['edge', 'n2', 'nw']] },
          { pl: 2, cl: 2, say: 'Only two arrows changed. Nothing else moved, which is why insertion with a known position is O(1). Finding that position is O(n).', csay: 'Two pointer writes. O(1) once you hold the node.', ds: [['hot', 'nw']] },
        ],
      },
      {
        id: 'delete',
        title: 'Delete a node',
        blurb: 'Delete the node after prev by skipping over it. Python lets the garbage collector reclaim it; C must free it.',
        trap: 'In C, unlink first, then free. If you free the node before you read its next, you read freed memory (use after free). And if you unlink but never free, that memory leaks.',
        pyCode: ['victim = prev.next', 'prev.next = victim.next', 'victim.next = None'],
        cCode: ['Node *victim = prev->next;', 'prev->next = victim->next;', 'free(victim);'],
        predict: {
          q: 'In C, what is wrong with <code>free(victim); prev->next = victim->next;</code>?',
          options: ['It leaks memory', 'It reads victim->next after victim was freed', 'Nothing, the order is irrelevant'],
          answer: 1,
          why: 'After free, the memory may be reused or poisoned, so victim->next is undefined behaviour (use after free). Read what you need first, then free.',
        },
        steps: [
          { pl: -1, cl: -1, say: 'A list 1, 2, 3, 4. We will delete the node holding 2. prev names node 1.', csay: 'The same list. prev holds the address of node 1.', ds: list4().concat([['ptr', 'prev', 'n1', 'down']]) },
          { pl: 0, cl: 0, say: 'victim = prev.next names the node to remove, so we do not lose it.', csay: 'Keep the address of the doomed node.', ds: [['ptr', 'victim', 'n2', 'down'], ['tag', 'n2', 'bad']] },
          { pl: 1, cl: 1, say: 'prev.next = victim.next makes node 1 skip straight to node 3. Node 2 is now unreachable from head.', csay: 'prev->next = victim->next. Node 2 is unlinked but still allocated.', ds: [['edge', 'n1', 'n3']] },
          { pl: 2, cl: 2, say: 'victim.next = None cuts the removed node loose. With no references left, Python\'s reference counting frees it.', csay: 'free(victim) hands the block back to the allocator. victim now dangles, so many people set it to NULL.', ds: [['unptr', 'victim'], ['rm', 'n2']] },
          { pl: 2, cl: 2, say: 'The list is 1, 3, 4. Deleting the head is a special case: there is no prev, so you move head forward instead.', csay: 'Same result. Deleting the head means head = head->next, and you must keep the old head to free it.', ds: [['hot', 'n1', 'n3']] },
        ],
      },
    ],
    builtins: [
      ['class Node: val, next', 'A node is a small object. Use __slots__ to cut memory when you make millions.'],
      ['cur = cur.next', 'Advance a walker one node.'],
      ['while cur:', 'Loop until you run off the end (None).'],
      ['while cur and cur.next:', 'Check cur first, or cur.next raises AttributeError on None.'],
      ['dummy = Node(0); dummy.next = head', 'A dummy head node removes the special case for the front.'],
      ['del x / x = None', 'Drops one reference. The object is freed when its count reaches zero.'],
    ],
  };
})();
