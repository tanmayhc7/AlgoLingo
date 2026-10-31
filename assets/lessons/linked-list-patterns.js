/* Lesson data: Linked list patterns (structure mode). */
(function () {
  var X = function (i) { return 150 + i * 150; };
  var Y = 190;
  function chain(n, withHead) {
    var ops = [];
    for (var i = 0; i < n; i++) ops.push(['node', 'n' + (i + 1), String(i + 1), X(i), Y]);
    for (var j = 0; j < n - 1; j++) ops.push(['edge', 'n' + (j + 1), 'n' + (j + 2)]);
    if (withHead) ops.push(['ptr', 'head', 'n1', 'up']);
    return ops;
  }

  /* ----- reverse ----- */
  var rev = [
    { pl: -1, cl: -1, say: 'Reverse 1, 2, 3 in place by flipping each arrow. No new nodes are made.', csay: 'Same: flip each next pointer, allocate nothing.', ds: chain(3, true) },
    { pl: 0, cl: 0, say: 'prev starts as None. It will trail one step behind cur.', csay: 'prev starts as NULL.', ds: [['ptr', 'prev', null]] },
    { pl: 1, cl: 0, say: 'cur starts at the head.', csay: 'cur starts at the head.', ds: [['ptr', 'cur', 'n1', 'up'], ['tag', 'n1', 'cur']] },
  ];
  for (var i = 1; i <= 3; i++) {
    var id = 'n' + i;
    var nid = i < 3 ? 'n' + (i + 1) : null;
    var pid = i > 1 ? 'n' + (i - 1) : null;
    rev.push({ pl: 3, cl: 2, say: 'nxt = cur.next saves the rest of the list before we cut the arrow.' + (nid ? '' : ' Here it is None.'), csay: 'Save cur->next first. Without it the rest of the list is lost.', ds: [['ptr', 'nxt', nid, 'up']] });
    rev.push({ pl: 4, cl: 3, say: 'cur.next = prev flips the arrow to point backwards.' + (pid ? '' : ' The first node now points at None, the new end.'), csay: 'cur->next = prev flips the arrow.', ds: pid ? [['edge', id, pid]] : [['unedge', id, 'next']] });
    rev.push({ pl: 5, cl: 4, say: 'prev = cur: prev steps forward onto this node.', csay: 'prev = cur.', ds: [['untag', id, 'cur'], ['tag', id, 'done'], ['ptr', 'prev', id, 'up']] });
    rev.push({ pl: 6, cl: 5, say: 'cur = nxt: cur steps forward along the saved link.', csay: 'cur = nxt.', ds: nid ? [['ptr', 'cur', nid, 'up'], ['tag', nid, 'cur']] : [['ptr', 'cur', null]] });
  }
  rev.push({ pl: 7, cl: 7, say: 'cur is None, so the loop is over. prev is the new first node. head = prev, and the list reads 3, 2, 1. O(n) time, O(1) extra space.', csay: 'head = prev. The list reads 3, 2, 1. O(n) time, O(1) extra space.', ds: [['unptr', 'nxt'], ['ptr', 'head', 'n3', 'up']] });

  /* ----- middle ----- */
  var mid = [
    { pl: -1, cl: -1, say: 'Find the middle without knowing the length. Two walkers: slow moves one node, fast moves two.', csay: 'Same idea in C.', ds: chain(5, true) },
    { pl: 0, cl: 0, say: 'Both start at the head.', csay: 'Both start at the head.', ds: [['ptr', 'slow', 'n1', 'down'], ['ptr', 'fast', 'n1', 'up']] },
    { pl: 1, cl: 1, say: 'fast and fast.next both exist, so keep going.', csay: 'fast && fast->next, so keep going.', ds: [] },
    { pl: 2, cl: 2, say: 'slow takes one step, fast takes two.', csay: 'slow one step, fast two.', ds: [['ptr', 'slow', 'n2', 'down'], ['ptr', 'fast', 'n3', 'up']] },
    { pl: 1, cl: 1, say: 'fast is node 3 and fast.next is node 4, so go again.', csay: 'Still fine to go again.', ds: [] },
    { pl: 2, cl: 2, say: 'slow reaches 3, fast reaches 5.', csay: 'slow reaches 3, fast reaches 5.', ds: [['ptr', 'slow', 'n3', 'down'], ['ptr', 'fast', 'n5', 'up'], ['tag', 'n3', 'cur']] },
    { pl: 1, cl: 1, say: 'fast.next is None, so stop. fast covered the whole list in the time slow covered half.', csay: 'fast->next is NULL, so stop.', ds: [] },
    { pl: 3, cl: 3, say: 'slow is the middle node: 3. For an even length it lands on the second of the two middles.', csay: 'slow is the middle node.', ds: [['hot', 'n3'], ['tag', 'n3', 'done']] },
  ];

  /* ----- cycle ----- */
  var cyc = [
    { pl: -1, cl: -1, say: 'A list whose last node points back to node 3. A normal walk would never end.', csay: 'The last node points back to node 3, so the list has a cycle.', ds: chain(5, true).concat([['edge', 'n5', 'n3']]) },
    { pl: 0, cl: 0, say: 'Same two walkers.', csay: 'Same two walkers.', ds: [['ptr', 'slow', 'n1', 'down'], ['ptr', 'fast', 'n1', 'up']] },
    { pl: 2, cl: 2, say: 'Round 1: slow to 2, fast to 3.', csay: 'Round 1.', ds: [['ptr', 'slow', 'n2', 'down'], ['ptr', 'fast', 'n3', 'up']] },
    { pl: 2, cl: 2, say: 'Round 2: slow to 3, fast to 5.', csay: 'Round 2.', ds: [['ptr', 'slow', 'n3', 'down'], ['ptr', 'fast', 'n5', 'up']] },
    { pl: 2, cl: 2, say: 'Round 3: slow to 4. fast goes 5, then around the back arrow to 3, then 4.', csay: 'Round 3: fast wraps around the cycle.', ds: [['ptr', 'slow', 'n4', 'down'], ['ptr', 'fast', 'n4', 'up']] },
    { pl: 3, cl: 3, say: 'slow is fast: they met, so there is a cycle. Inside a cycle fast gains one node per round, so it must land on slow. No cycle means fast reaches None first. O(n) time, O(1) space.', csay: 'slow == fast: a cycle. O(n) time, O(1) space, with no hash set.', ds: [['hot', 'n4'], ['tag', 'n4', 'bad']] },
  ];

  /* ----- dummy head ----- */
  var dum = [
    { pl: -1, cl: -1, say: 'Remove every node holding 1 from 1, 2, 3. The head itself must go, normally a special case.', csay: 'The head must go, normally a special case.', ds: chain(3, true) },
    { pl: 0, cl: 0, say: 'Add a dummy node in front. It holds nothing useful. Now every real node has a predecessor.', csay: 'A dummy node in front gives every real node a predecessor.', ds: [['mv', 'n1', X(1), Y], ['mv', 'n2', X(2), Y], ['mv', 'n3', X(3), Y], ['node', 'd', '-', X(0), Y], ['edge', 'd', 'n1'], ['ptr', 'head', 'n1', 'up']] },
    { pl: 1, cl: 1, say: 'cur starts at the dummy.', csay: 'cur starts at the dummy.', ds: [['ptr', 'cur', 'd', 'down'], ['tag', 'd', 'cur']] },
    { pl: 2, cl: 2, say: 'cur.next holds 1, which matches. Skip it.', csay: 'cur->next matches. Skip it.', ds: [['hot', 'n1'], ['tag', 'n1', 'bad']] },
    { pl: 3, cl: 3, say: 'cur.next = cur.next.next. The dummy now points at node 2. The old head is out of the list, and no special case was needed.', csay: 'cur->next = cur->next->next. The old head is out, and free() would go here.', ds: [['edge', 'd', 'n2'], ['rm', 'n1']] },
    { pl: 2, cl: 2, say: 'Next: cur.next holds 2, no match. Advance cur.', csay: 'No match. Advance cur.', ds: [['ptr', 'cur', 'n2', 'down'], ['untag', 'd', 'cur']] },
    { pl: 2, cl: 2, say: 'cur.next holds 3, no match. Advance again.', csay: 'No match. Advance again.', ds: [['ptr', 'cur', 'n3', 'down']] },
    { pl: 4, cl: 5, say: 'return dummy.next. That is the real head now, node 2. The dummy is just scaffolding and never leaves the function.', csay: 'return dummy.next. The dummy lived on the stack and vanishes.', ds: [['ptr', 'head', 'n2', 'up'], ['tag', 'n2', 'done']] },
  ];

  window.LESSON = {
    id: 'linked-list-patterns',
    mode: 'ds',
    title: 'Reverse, fast and slow, dummy head',
    lede:
      'Most linked list problems are a handful of pointer tricks. Reversing flips each arrow as you walk. Two walkers at different speeds find the middle or a cycle without extra memory. A dummy node in front removes the special case for the head. Each trick runs in O(n) time and O(1) extra space.',
    scenes: [
      {
        id: 'reverse',
        title: 'Reverse a list',
        blurb: 'Three names do the work: prev (behind), cur (here) and nxt (the saved rest). The order of the four lines matters.',
        trap: 'Forgetting to save cur.next before overwriting it. Once cur.next = prev runs, the only link to the rest of the list is gone. Save it first.',
        pyCode: ['prev = None', 'cur = head', 'while cur:', '    nxt = cur.next', '    cur.next = prev', '    prev = cur', '    cur = nxt', 'head = prev'],
        cCode: ['Node *prev = NULL, *cur = head;', 'while (cur) {', '    Node *nxt = cur->next;', '    cur->next = prev;', '    prev = cur;', '    cur = nxt;', '}', 'head = prev;'],
        predict: {
          q: 'After the loop finishes, what is <code>cur</code> and what is <code>prev</code>?',
          options: ['cur is the new head, prev is None', 'cur is None, prev is the new head', 'both are None'],
          answer: 1,
          why: 'The loop ends when cur runs off the end (None). prev trails cur by one, so it sits on the last real node, which is the first node of the reversed list.',
        },
        steps: rev,
      },
      {
        id: 'middle',
        title: 'Find the middle',
        blurb: 'Fast moves two nodes for each one slow moves. When fast hits the end, slow is halfway. One pass, no length needed.',
        trap: 'Check fast before fast.next. In while fast.next and fast: an empty list or an odd length makes fast None, and fast.next raises AttributeError.',
        pyCode: ['slow = fast = head', 'while fast and fast.next:', '    slow = slow.next', '    fast = fast.next.next', 'return slow'],
        cCode: ['Node *slow = head, *fast = head;', 'while (fast && fast->next) {', '    slow = slow->next;', '    fast = fast->next->next;', '}', 'return slow;'],
        predict: {
          q: 'For a list of 4 nodes (1, 2, 3, 4), which node does <code>slow</code> end on?',
          options: ['Node 2', 'Node 3', 'Node 4'],
          answer: 1,
          why: 'Round 1: slow 2, fast 3. fast.next exists, so round 2: slow 3, fast None. The loop stops with slow on node 3, the second of the two middles.',
        },
        steps: mid,
      },
      {
        id: 'cycle',
        title: 'Detect a cycle',
        blurb: 'Floyd\'s tortoise and hare. If there is a loop, the faster walker laps the slower one and they meet.',
        trap: 'Compare nodes with is (or == on identity in C), not values. Two different nodes can hold the same value, and that is not a cycle.',
        pyCode: ['slow = fast = head', 'while fast and fast.next:', '    slow, fast = slow.next, fast.next.next', '    if slow is fast: return True', 'return False'],
        cCode: ['Node *slow = head, *fast = head;', 'while (fast && fast->next) {', '    slow = slow->next; fast = fast->next->next;', '    if (slow == fast) return 1;', '}', 'return 0;'],
        predict: {
          q: 'Why must the two walkers meet if there is a cycle?',
          options: ['fast gains exactly one node per round on slow inside the cycle', 'Both walkers always take the same path', 'Python detects it automatically'],
          answer: 0,
          why: 'Inside the cycle the gap between them shrinks by one each round, so it must reach zero. They cannot jump over each other, because the gap only drops by one.',
        },
        steps: cyc,
      },
      {
        id: 'dummy',
        title: 'Dummy head',
        blurb: 'Put a fake node in front of the list. Deleting the first real node then uses the same code as deleting any other.',
        trap: 'Return dummy.next, not head. The old head may have been deleted, and head would then point at a removed node.',
        pyCode: ['dummy = Node(0, head)', 'cur = dummy', 'while cur.next:', '    if cur.next.val == 1: cur.next = cur.next.next', '    else: cur = cur.next', 'return dummy.next'],
        cCode: ['Node dummy = {0, head};', 'Node *cur = &dummy;', 'while (cur->next) {', '    if (cur->next->val == 1) cur->next = cur->next->next;', '    else cur = cur->next;', '}', 'return dummy.next;'],
        predict: {
          q: 'What does this return for the list 1, 1, 1 with the target 1?',
          options: ['The original head', 'An empty list (None)', 'A dummy node holding 0'],
          answer: 1,
          why: 'Each match is skipped by cur.next = cur.next.next. cur never advances while matches continue, so all three go. dummy.next ends as None, the empty list.',
        },
        steps: dum,
      },
    ],
    builtins: [
      ['prev, cur = cur, cur.next', 'Python can update two names at once; the right side is evaluated first.'],
      ['slow is fast', 'Identity test: the same node, not just an equal value.'],
      ['while fast and fast.next', 'Short-circuit order protects the second test.'],
      ['dummy = Node(0, head)', 'A sentinel in front. Return dummy.next.'],
      ['id(node)', 'Python object identity; handy when debugging a cycle.'],
    ],
  };
})();
