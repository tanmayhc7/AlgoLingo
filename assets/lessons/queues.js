/* Lesson data: Queues (structure mode). */
(function () {
  var X = function (i) { return 150 + i * 80; };

  /* ----- FIFO with a growing row ----- */
  function fifo() {
    var items = [];
    var steps = [];
    var serial = 0;
    function layout() {
      var ops = [];
      items.forEach(function (it, i) { ops.push(['mv', it, X(i), 130]); });
      ops.push(items.length ? ['ptr', 'front', items[0], 'up'] : ['ptr', 'front', null]);
      ops.push(items.length ? ['ptr', 'back', items[items.length - 1], 'down'] : ['ptr', 'back', null]);
      return ops;
    }
    function enq(label, pl, cl, say, csay) {
      var id = 'q' + serial++;
      items.push(id);
      steps.push({ pl: pl, cl: cl, say: say, csay: csay, ds: [['node', id, label, X(items.length - 1), 130, 'cell']].concat(layout()) });
    }
    function deq(pl, cl, say, csay) {
      var id = items.shift();
      steps.push({ pl: pl, cl: cl, say: say, csay: csay, ds: [['hot', id], ['rm', id]].concat(layout()) });
    }
    steps.push({ pl: -1, cl: -1, say: 'A queue: first in, first out. Items join at the back and leave from the front, like a line at a shop.', csay: 'In C this is usually a linked list with front and back pointers, or a ring buffer (next scene).', ds: [['ptr', 'front', null], ['ptr', 'back', null]] });
    enq('A', 1, 1, 'append("A") joins the back of the line.', 'enqueue: a new node goes at the back.');
    enq('B', 2, 2, 'append("B").', 'enqueue B.');
    enq('C', 3, 3, 'append("C"). The line is A, B, C and A has waited longest.', 'enqueue C.');
    deq(4, 4, 'popleft() serves the front: A leaves first. Everyone shifts forward in line, but nothing is copied, deque just moves its front marker. O(1).', 'dequeue: read the front node, move front to its next, free the old node. O(1).');
    enq('D', 5, 5, 'append("D") joins behind C.', 'enqueue D.');
    deq(6, 6, 'popleft() serves B. The order out is exactly the order in: A, B, and next will be C.', 'dequeue B.');
    return steps;
  }

  /* ----- ring buffer ----- */
  var N = 5;
  var RX = function (i) { return 190 + i * 130; };
  function cells() {
    var ops = [];
    for (var i = 0; i < N; i++) ops.push(['node', 'r' + i, '', RX(i), 130, 'cell'], ['tag', 'r' + i, 'dim'], ['note', 'r' + i, String(i)]);
    return ops;
  }
  var ring = [{ pl: 0, cl: 0, say: 'A fixed array of 5 slots plus two indexes. head is where the next item will be read, tail is where the next will be written. The indexes wrap around with % 5, so the array behaves like a circle.', csay: 'int buf[5]; int head = 0, tail = 0, size = 0.', ds: cells().concat([['ptr', 'head', 'r0', 'up'], ['ptr', 'tail', 'r0', 'down']]) }];
  var head = 0, tail = 0, size = 0;
  function rpush(label, pl, say) {
    var at = tail;
    tail = (tail + 1) % N;
    size++;
    ring.push({ pl: pl, cl: pl, say: say, csay: 'buf[tail] = ' + label + '; tail = (tail + 1) % 5; size = ' + size + '.', ds: [['lab', 'r' + at, label], ['untag', 'r' + at, 'dim'], ['hot', 'r' + at], ['ptr', 'tail', 'r' + tail, 'down']] });
  }
  function rpop(pl, say) {
    var at = head;
    head = (head + 1) % N;
    size--;
    ring.push({ pl: pl, cl: pl, say: say, csay: 'x = buf[head]; head = (head + 1) % 5; size = ' + size + '.', ds: [['hot', 'r' + at], ['lab', 'r' + at, ''], ['tag', 'r' + at, 'dim'], ['ptr', 'head', 'r' + head, 'up']] });
  }
  rpush('A', 1, 'Write A at tail, then move tail forward.');
  rpush('B', 2, 'Write B.');
  rpush('C', 3, 'Write C. Three items, head at slot 0, tail at slot 3.');
  rpop(4, 'Read at head: A. Move head forward. The slot is free to reuse.');
  rpop(5, 'Read B. Head is now at slot 2.');
  rpush('D', 6, 'Write D at slot 3.');
  rpush('E', 7, 'Write E at slot 4, the last slot.');
  rpush('F', 8, 'tail was 4, so (4 + 1) % 5 = 0: it wraps to the front. F lands in slot 0, which A freed. The array is reused as a circle, with no shifting.');
  ring.push({ pl: 8, cl: 8, say: 'Now size is 4 of 5. If size reaches 5 the queue is full. Head and tail alone cannot tell full from empty (they are equal in both), which is why a size counter or a spare slot is used.', csay: 'Keep a size counter: head == tail is ambiguous.', ds: [['hot', 'r0']] });

  /* ----- queue from two stacks ----- */
  var TS = [{ pl: 0, cl: 0, say: 'Build a queue from two stacks. inbox receives pushes. outbox serves pops. Each stack alone is LIFO, but moving everything across once reverses the order back to FIFO.', csay: 'Two arrays used as stacks.', ds: [['node', 'lin', 'inbox', 80, 100, 'cell'], ['node', 'lout', 'outbox', 80, 230, 'cell'], ['tag', 'lin', 'mark'], ['tag', 'lout', 'mark']] }];
  [1, 2, 3].forEach(function (v, i) {
    TS.push({ pl: i + 1, cl: i + 1, say: 'push ' + v + ': append to inbox. O(1).', csay: 'push ' + v + ' onto inbox.', ds: [['node', 'i' + v, String(v), 230 + i * 80, 100, 'cell'], ['ptr', 'in top', 'i' + v, 'up']] });
  });
  TS.push({ pl: 4, cl: 4, say: 'pop(): outbox is empty, so pour inbox into it. Popping 3, 2, 1 off inbox and pushing them onto outbox reverses the order, so the oldest item, 1, ends on top.', csay: 'outbox empty: move every item across.', ds: [['rm', 'i1'], ['rm', 'i2'], ['rm', 'i3'], ['unptr', 'in top'], ['node', 'o3', '3', 230, 230, 'cell'], ['node', 'o2', '2', 310, 230, 'cell'], ['node', 'o1', '1', 390, 230, 'cell'], ['ptr', 'out top', 'o1', 'down']] });
  TS.push({ pl: 5, cl: 5, say: 'Then pop outbox: 1 comes out. First in, first out.', csay: 'Pop outbox: 1.', ds: [['hot', 'o1'], ['rm', 'o1'], ['ptr', 'out top', 'o2', 'down']] });
  TS.push({ pl: 6, cl: 6, say: 'push 4 goes to inbox. It does not disturb outbox.', csay: 'push 4 onto inbox.', ds: [['node', 'i4', '4', 230, 100, 'cell'], ['ptr', 'in top', 'i4', 'up']] });
  TS.push({ pl: 7, cl: 7, say: 'pop(): outbox is not empty, so just pop it: 2. No transfer needed. Each item moves across at most once, so the average cost per operation is O(1) even though one pop can cost O(n).', csay: 'Outbox still has items: pop 2. Amortised O(1).', ds: [['hot', 'o2'], ['rm', 'o2'], ['ptr', 'out top', 'o3', 'down']] });

  window.LESSON = {
    id: 'queues',
    mode: 'ds',
    title: 'Queues',
    lede:
      'A queue is first in, first out: items join at the back and leave from the front. Python gives you collections.deque, which is O(1) at both ends; a list is a poor queue because pop(0) shifts everything. In C you build one from a linked list with two pointers or from a ring buffer, a fixed array whose indexes wrap around. Queues drive breadth-first search, task scheduling and buffering.',
    scenes: [
      {
        id: 'fifo',
        title: 'First in, first out',
        blurb: 'deque.append joins the back, deque.popleft serves the front. Both O(1).',
        trap: 'Using a list and pop(0) works but each pop moves every other item, O(n). A loop of n pops becomes O(n^2). Use collections.deque.',
        pyCode: ['from collections import deque', 'q = deque(); q.append("A")', 'q.append("B")', 'q.append("C")', 'q.popleft()', 'q.append("D")', 'q.popleft()'],
        cCode: ['Queue q = {0};', 'enqueue(&q, \'A\');', 'enqueue(&q, \'B\');', 'enqueue(&q, \'C\');', 'dequeue(&q);', 'enqueue(&q, \'D\');', 'dequeue(&q);'],
        predict: {
          q: 'After the final <code>popleft()</code>, which item will the <b>next</b> popleft return?',
          options: ['A', 'C', 'D'],
          answer: 1,
          why: 'A and B have been served. The line is C, D, so C is next.',
        },
        steps: fifo(),
      },
      {
        id: 'ring',
        title: 'Ring buffer',
        blurb: 'A fixed-size queue in a plain array. Two indexes chase each other around, wrapping with a remainder. No allocation, no shifting.',
        trap: 'head == tail means both empty and full. Track a size (or leave one slot unused) to tell them apart.',
        pyCode: ['buf, head, tail = [None] * 5, 0, 0', 'buf[tail] = "A"; tail = (tail + 1) % 5', 'buf[tail] = "B"; tail = (tail + 1) % 5', 'buf[tail] = "C"; tail = (tail + 1) % 5', 'x = buf[head]; head = (head + 1) % 5', 'x = buf[head]; head = (head + 1) % 5', 'buf[tail] = "D"; tail = (tail + 1) % 5', 'buf[tail] = "E"; tail = (tail + 1) % 5', 'buf[tail] = "F"; tail = (tail + 1) % 5'],
        cCode: ['int buf[5], head = 0, tail = 0, size = 0;', 'buf[tail] = A; tail = (tail + 1) % 5; size++;', 'buf[tail] = B; tail = (tail + 1) % 5; size++;', 'buf[tail] = C; tail = (tail + 1) % 5; size++;', 'x = buf[head]; head = (head + 1) % 5; size--;', 'x = buf[head]; head = (head + 1) % 5; size--;', 'buf[tail] = D; tail = (tail + 1) % 5; size++;', 'buf[tail] = E; tail = (tail + 1) % 5; size++;', 'buf[tail] = F; tail = (tail + 1) % 5; size++;'],
        predict: {
          q: 'The buffer has 5 slots, <code>tail = 4</code>, and you write one more item. Where does tail point afterwards?',
          options: ['5, past the end', '0, wrapped around', '4, it stays'],
          answer: 1,
          why: '(4 + 1) % 5 is 0. The remainder wraps the index back to the start of the array.',
        },
        steps: ring,
      },
      {
        id: 'two-stacks',
        title: 'A queue from two stacks',
        blurb: 'A classic interview question. Reversing twice restores order, and the transfer cost is paid once per item, so it is amortised O(1).',
        trap: 'Only refill outbox when it is empty. Moving items across while outbox still has some mixes up the order.',
        pyCode: ['inbox, outbox = [], []', 'inbox.append(1)', 'inbox.append(2)', 'inbox.append(3)', 'if not outbox: move all from inbox to outbox', 'outbox.pop()', 'inbox.append(4)', 'outbox.pop()'],
        cCode: ['int in[N], out[N], it = -1, ot = -1;', 'in[++it] = 1;', 'in[++it] = 2;', 'in[++it] = 3;', 'if (ot < 0) while (it >= 0) out[++ot] = in[it--];', 'x = out[ot--];', 'in[++it] = 4;', 'x = out[ot--];'],
        predict: {
          q: 'Pushes 1, 2, 3 then one pop. What does the pop return?',
          options: ['3', '1', '2'],
          answer: 1,
          why: 'Moving 3, 2, 1 across puts 1 on top of outbox. The first item pushed is the first one out, which is queue order.',
        },
        steps: TS,
      },
    ],
    builtins: [
      ['from collections import deque', 'The Python queue. O(1) append, appendleft, pop, popleft.'],
      ['q.append(x) / q.popleft()', 'Enqueue at the back, dequeue from the front.'],
      ['deque(maxlen=n)', 'A bounded queue that drops the oldest item when full.'],
      ['queue.Queue', 'Thread-safe, blocking queue for producer and consumer threads.'],
      ['queue.PriorityQueue / heapq', 'A queue that serves the smallest item first. See the heaps chapter.'],
      ['list.pop(0)', 'Avoid for queues: O(n) because it shifts every item.'],
    ],
  };
})();
