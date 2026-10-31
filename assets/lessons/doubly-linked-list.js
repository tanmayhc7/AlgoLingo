/* Lesson data: Doubly linked lists and LRU (structure mode). */
(function () {
  var X = function (i) { return 150 + i * 190; };
  var Y = 170;
  function dchain(labels) {
    var ops = [];
    labels.forEach(function (l, i) { ops.push(['node', 'n' + l, String(l), X(i), Y, 'dnode']); });
    for (var j = 0; j < labels.length - 1; j++) {
      ops.push(['edge', 'n' + labels[j], 'n' + labels[j + 1], 'next']);
      ops.push(['edge', 'n' + labels[j + 1], 'n' + labels[j], 'prev']);
    }
    return ops;
  }

  window.LESSON = {
    id: 'doubly-linked-list',
    mode: 'ds',
    title: 'Doubly linked lists and LRU',
    lede:
      'A doubly linked node also keeps a prev link, so you can move in both directions and remove a node you already hold without searching for the node before it. That one property makes O(1) removal possible, and it is exactly what an LRU cache needs: a hash map finds the node in O(1), the doubly linked list reorders it in O(1).',
    scenes: [
      {
        id: 'remove',
        title: 'O(1) removal',
        blurb: 'Given the node itself, unlink it by joining its two neighbours. No scan from the head.',
        trap: 'Handle the ends. If node.prev is None you are removing the head; if node.next is None you are removing the tail. Sentinel nodes at both ends remove both cases.',
        pyCode: ['p = node.prev', 'n = node.next', 'p.next = n', 'n.prev = p'],
        cCode: ['Node *p = node->prev;', 'Node *n = node->next;', 'p->next = n;', 'n->prev = p;  /* then free(node) */'],
        predict: {
          q: 'Why can a singly linked list not remove a given node in O(1)?',
          options: ['It has no next pointer', 'It cannot reach the previous node without walking from the head', 'Memory cannot be freed'],
          answer: 1,
          why: 'To skip a node you must change the previous node\'s next. A singly linked node has no way back, so you would scan from the head, O(n). The prev link removes that scan.',
        },
        steps: [
          { pl: -1, cl: -1, say: 'A list 1, 2, 3. Every node has two arrows. We hold node 2 and want it gone.', csay: 'Each node has next and prev pointers.', ds: dchain([1, 2, 3]).concat([['ptr', 'node', 'n2', 'up']]) },
          { pl: 0, cl: 0, say: 'p = node.prev names the node before it.', csay: 'p = the node before.', ds: [['ptr', 'p', 'n1', 'down'], ['tag', 'n2', 'bad']] },
          { pl: 1, cl: 1, say: 'n = node.next names the node after it.', csay: 'n = the node after.', ds: [['ptr', 'n', 'n3', 'down']] },
          { pl: 2, cl: 2, say: 'p.next = n: the forward arrow skips node 2.', csay: 'Forward arrow skips node 2.', ds: [['edge', 'n1', 'n3', 'next']] },
          { pl: 3, cl: 3, say: 'n.prev = p: the backward arrow skips it too. Node 2 is now unreachable. Four assignments, regardless of list length.', csay: 'Backward arrow skips it too. free(node) would go here.', ds: [['edge', 'n3', 'n1', 'prev'], ['rm', 'n2'], ['unptr', 'node']] },
        ],
      },
      {
        id: 'lru',
        title: 'LRU cache',
        blurb: 'Keep the most recently used key at the front and evict from the back. A dict maps key to node; the list orders them.',
        trap: 'The dict and the list must stay in step. Every move or eviction updates both, and the dict must point at the node, not the value, or you cannot unlink in O(1).',
        pyCode: ['cache.get(3)    # move 3 to the front', 'cache.put(4, "d") # capacity is 3: evict the back'],
        cCode: ['lru_get(c, 3);   /* hash lookup, then move to front */', 'lru_put(c, 4, d); /* evict tail, insert at front */'],
        predict: {
          q: 'The cache holds (front to back) 1, 2, 3 with capacity 3. After <code>get(3)</code> and then <code>put(4)</code>, which key is evicted?',
          options: ['Key 3', 'Key 2', 'Key 1'],
          answer: 1,
          why: 'get(3) moves 3 to the front, giving 3, 1, 2. The back is now 2, the least recently used, so put(4) evicts 2 and the order becomes 4, 3, 1.',
        },
        steps: [
          { pl: -1, cl: -1, say: 'Capacity 3. Front is most recently used. head names the front, tail the back.', csay: 'Same structure. head and tail are the two ends.', ds: dchain([1, 2, 3]).concat([['ptr', 'head', 'n1', 'up'], ['ptr', 'tail', 'n3', 'up']]) },
          { pl: 0, cl: 0, say: 'get(3): the dict finds node 3 in O(1). It is the least recently used, now used again.', csay: 'The hash table returns the node pointer in O(1).', ds: [['hot', 'n3'], ['tag', 'n3', 'cur']] },
          { pl: 0, cl: 0, say: 'Unlink node 3: the prev link tells us who is behind it. The tail becomes node 2.', csay: 'Unlink node 3 using its prev. tail moves to node 2.', ds: [['unedge', 'n2', 'next'], ['unedge', 'n3', 'prev'], ['ptr', 'tail', 'n2', 'up']] },
          { pl: 0, cl: 0, say: 'Relink it at the front. Order is now 3, 1, 2. Four pointer writes, all O(1).', csay: 'Relink at the front: four pointer writes.', ds: [['mv', 'n3', X(0), Y], ['mv', 'n1', X(1), Y], ['mv', 'n2', X(2), Y], ['edge', 'n3', 'n1', 'next'], ['edge', 'n1', 'n3', 'prev'], ['edge', 'n1', 'n2', 'next'], ['edge', 'n2', 'n1', 'prev'], ['ptr', 'head', 'n3', 'up'], ['untag', 'n3', 'cur']] },
          { pl: 1, cl: 1, say: 'put(4): the cache is full. Evict the tail, node 2, which is the least recently used.', csay: 'The cache is full: evict the tail.', ds: [['tag', 'n2', 'bad']] },
          { pl: 1, cl: 1, say: 'Unlink node 2, drop its dict entry, and make node 1 the tail.', csay: 'Unlink the tail, free it and erase its table entry.', ds: [['unedge', 'n1', 'next'], ['rm', 'n2'], ['ptr', 'tail', 'n1', 'up']] },
          { pl: 1, cl: 1, say: 'Insert the new key 4 at the front. Order is 4, 3, 1. Both get and put are O(1) because the dict finds the node and the list reorders it.', csay: 'Insert at the front. get and put are O(1).', ds: [['node', 'n4', '4', X(0) - 190 + 190, Y - 110, 'dnode'], ['mv', 'n4', X(0), Y], ['mv', 'n3', X(1), Y], ['mv', 'n1', X(2), Y], ['edge', 'n4', 'n3', 'next'], ['edge', 'n3', 'n4', 'prev'], ['ptr', 'head', 'n4', 'up']] },
        ],
      },
    ],
    builtins: [
      ['collections.OrderedDict', 'A dict with a hidden doubly linked list. move_to_end and popitem(last=False) give LRU in a few lines.'],
      ['functools.lru_cache(maxsize=n)', 'Built-in LRU memoisation for function calls.'],
      ['collections.deque', 'A doubly linked list of blocks. O(1) at both ends.'],
      ['sentinel nodes', 'A fake head and tail remove the None checks at the ends.'],
    ],
  };
})();
