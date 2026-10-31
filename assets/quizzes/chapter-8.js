/* Chapter 8 quiz: Linked lists. See assets/quiz.js for the question format. */
window.QUIZ = {
  chapter: 8,
  title: 'Linked lists',
  lede: 'Nodes, pointers and the standard tricks. Multiple choice, fill-in, write-it-yourself and debug questions.',
  questions: [
    {
      type: 'mcq',
      q: 'You hold a reference to a node in the <b>middle</b> of a singly linked list. What is the cost of removing the node <b>after</b> it?',
      options: ['O(1)', 'O(n)', 'O(log n)'],
      answer: 0,
      why: 'You only change one link: node.next = node.next.next. No scan is needed because you already hold the predecessor.',
    },
    {
      type: 'mcq',
      q: 'Insert <code>new</code> after <code>b</code>. Which order is correct?',
      options: ['b.next = new; new.next = b.next', 'new.next = b.next; b.next = new', 'Either order works'],
      answer: 1,
      why: 'Point the new node at the tail first. If you redirect b.next first, the only link to the rest of the list is overwritten.',
    },
    {
      type: 'mcq',
      q: 'In a list with a cycle, <code>slow</code> moves 1 node and <code>fast</code> moves 2 nodes per round. Why do they meet?',
      options: ['fast gains one node per round on slow once both are in the cycle', 'The cycle makes both speeds equal', 'They only meet if the cycle has an even length'],
      answer: 0,
      why: 'The gap shrinks by exactly one each round, so it must hit zero. Parity of the cycle length does not matter.',
    },
    {
      type: 'complete',
      q: 'Fill in the blanks so <code>length(head)</code> returns the number of nodes (0 for an empty list).',
      starter: 'class Node:\n    def __init__(self, val, next=None):\n        self.val = val\n        self.next = next\n\ndef build(xs):\n    head = None\n    for x in reversed(xs):\n        head = Node(x, head)\n    return head\n\ndef length(head):\n    n = 0\n    cur = head\n    while ___:\n        n += 1\n        cur = ___\n    return n\n',
      tests: [
        { expr: 'length(build([]))', want: '0' },
        { expr: 'length(build([1]))', want: '1' },
        { expr: 'length(build([4, 5, 6, 7]))', want: '4' },
      ],
      hint: 'Loop while cur is not None, and move cur to cur.next each time.',
      solution: 'class Node:\n    def __init__(self, val, next=None):\n        self.val = val\n        self.next = next\n\ndef build(xs):\n    head = None\n    for x in reversed(xs):\n        head = Node(x, head)\n    return head\n\ndef length(head):\n    n = 0\n    cur = head\n    while cur:\n        n += 1\n        cur = cur.next\n    return n\n',
      why: 'The walk visits each node once, so it is O(n) time and O(1) space.',
    },
    {
      type: 'write',
      q: 'Write <code>reverse(head)</code> that reverses a singly linked list in place and returns the new head. <code>Node</code>, <code>build</code> and <code>to_list</code> are provided.',
      starter: 'class Node:\n    def __init__(self, val, next=None):\n        self.val = val\n        self.next = next\n\ndef build(xs):\n    head = None\n    for x in reversed(xs):\n        head = Node(x, head)\n    return head\n\ndef to_list(head):\n    out = []\n    while head:\n        out.append(head.val)\n        head = head.next\n    return out\n\ndef reverse(head):\n    pass\n',
      tests: [
        { expr: 'to_list(reverse(build([1, 2, 3])))', want: '[3, 2, 1]' },
        { expr: 'to_list(reverse(build([7])))', want: '[7]' },
        { expr: 'to_list(reverse(build([])))', want: '[]' },
        { expr: 'to_list(reverse(build([1, 2])))', want: '[2, 1]' },
      ],
      hint: 'Keep prev, cur and a saved nxt. In the loop: save cur.next, point cur.next at prev, then move prev and cur forward.',
      solution: 'class Node:\n    def __init__(self, val, next=None):\n        self.val = val\n        self.next = next\n\ndef build(xs):\n    head = None\n    for x in reversed(xs):\n        head = Node(x, head)\n    return head\n\ndef to_list(head):\n    out = []\n    while head:\n        out.append(head.val)\n        head = head.next\n    return out\n\ndef reverse(head):\n    prev = None\n    cur = head\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nxt\n    return prev\n',
      why: 'Saving next before overwriting it keeps the rest of the list reachable. O(n) time, O(1) space, and an empty list returns None naturally.',
    },
    {
      type: 'debug',
      q: 'This should return the middle node\'s value (the second middle for even lengths). It crashes on some lists. Fix it.',
      starter: 'class Node:\n    def __init__(self, val, next=None):\n        self.val = val\n        self.next = next\n\ndef build(xs):\n    head = None\n    for x in reversed(xs):\n        head = Node(x, head)\n    return head\n\ndef middle(head):\n    slow = fast = head\n    while fast.next and fast:\n        slow = slow.next\n        fast = fast.next.next\n    return slow.val\n',
      tests: [
        { expr: 'middle(build([1, 2, 3]))', want: '2' },
        { expr: 'middle(build([1, 2, 3, 4]))', want: '3' },
        { expr: 'middle(build([9]))', want: '9' },
      ],
      hint: 'On an even length fast ends as None, and fast.next then fails. Test fast before fast.next.',
      solution: 'class Node:\n    def __init__(self, val, next=None):\n        self.val = val\n        self.next = next\n\ndef build(xs):\n    head = None\n    for x in reversed(xs):\n        head = Node(x, head)\n    return head\n\ndef middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow.val\n',
      why: 'and short-circuits left to right. Checking fast first protects the fast.next access when fast has run off the end.',
    },
  ],
};
