/* Interview depth: Queues. */
window.DEPTH = {
  thesis:
    'A queue enforces fairness: the oldest item is served first. That is the right model for buffering, scheduling and breadth-first exploration, where you must finish everything at distance d before anything at distance d + 1. The interview content is in the implementation choices (deque, linked list, ring buffer), the amortised argument behind the two-stack queue, and recognising BFS-shaped problems.',
  why: [
    ['FIFO order gives level-by-level processing', 'BFS uses a queue because newly discovered nodes go behind everything already waiting, so closer nodes are always served before farther ones. Swap the queue for a stack and you get DFS.'],
    ['Pick the structure for the cost you need', 'A linked list gives O(1) at both ends and no capacity; a ring buffer gives O(1) with no allocation and great locality but a fixed capacity; `collections.deque` gives both with blocks. A list with `pop(0)` gives O(n).'],
    ['Queues decouple producers from consumers', 'A buffer lets fast producers and slow consumers run at their own speed. Bounded queues add back-pressure; unbounded queues hide overload until memory runs out.'],
    ['Amortised cost is a real argument', 'The two-stack queue has an O(n) worst-case pop, yet any sequence of n operations costs O(n) total. Interviewers want the argument: each element is moved across at most once.'],
  ],
  edges: [
    ['Empty dequeue', '`popleft()` on an empty deque raises `IndexError`; a C implementation may return garbage. Check or return an error code.'],
    ['Full ring buffer', '`head == tail` means empty or full. Track a size or keep one slot spare. Decide whether a full buffer rejects, blocks or overwrites the oldest.'],
    ['Wrap-around arithmetic', 'Use `(i + 1) % cap`. With a power-of-two capacity use `& (cap - 1)`. Index overflow is not an issue if you keep indexes modded, but free-running 32-bit indexes rely on unsigned wrap and `cap` being a power of two.'],
    ['Linked queue: removing the last node', 'When the queue becomes empty set both `front` and `back` to NULL. Forgetting `back` leaves a dangling pointer.'],
    ['Linked queue: enqueue on empty', 'Both `front` and `back` must point at the new node.'],
    ['BFS: mark visited on enqueue', 'Marking on dequeue lets a node be queued many times, inflating time and memory.'],
    ['BFS levels', 'Process exactly `len(queue)` nodes per round to separate levels without storing distances.'],
    ['`deque` index access', '`d[i]` is O(n) in the middle. Do not use a deque as a random-access list.'],
    ['Bounded queues', '`deque(maxlen=n)` silently drops from the opposite end when full. That is a feature for sliding windows and a bug if you expected an error.'],
    ['Thread safety', '`deque.append` and `popleft` are atomic individually, but check-then-act sequences are not. Use `queue.Queue` for blocking producer and consumer code.'],
    ['Priority queues are not FIFO', 'A heap serves the smallest key first, and equal keys come out in arbitrary order unless you add a tiebreaker counter.'],
  ],
  cost: [
    ['enqueue (deque, linked, ring)', 'O(1)', 'Amortised for a growing ring.'],
    ['dequeue', 'O(1)', ''],
    ['peek front', 'O(1)', ''],
    ['list.pop(0) as dequeue', 'O(n)', 'Shifts every element.'],
    ['two-stack queue: push', 'O(1)', ''],
    ['two-stack queue: pop', 'O(1) amortised, O(n) worst', 'Each item moved at most once.'],
    ['ring buffer memory', 'fixed capacity', 'No allocation after setup.'],
    ['linked queue memory', 'node per item', 'Pointer overhead, allocator calls.'],
    ['BFS on a graph', 'O(V + E)', 'Each node enqueued once, each edge examined once.'],
  ],
  internals: [
    ['`collections.deque`', 'A doubly linked list of fixed blocks of 64 pointers. Appends and pops at either end touch only an end block and occasionally allocate or free a block. Memory is close to a list, and iteration stays cache-friendly within blocks.'],
    ['Lock-free queues', 'Single-producer single-consumer ring buffers need no locks: only the producer writes `tail` and only the consumer writes `head`, using release and acquire ordering. Multi-producer queues (Michael-Scott) use CAS loops and face the ABA problem.'],
    ['Kernel and I/O buffers', 'Network cards, pipes, audio drivers and log pipelines use ring buffers because they have fixed memory, no allocation on the hot path and predictable latency. Overflow policy (drop, block, overwrite) is a design decision.'],
    ['Message queues', 'Kafka, SQS and RabbitMQ add durability, ordering guarantees per partition, consumer groups and retries. The in-memory queue is the single-process version of the same idea.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Why is a Python list a bad queue, and what do you use instead?',
      a: '`pop(0)` removes the first element and shifts all the others down one slot, so it costs O(n) and a loop of n dequeues is O(n^2). Use `collections.deque`, which supports O(1) `append` and `popleft` because it is a linked list of blocks. A list is fine as a stack, because the end operations are O(1).',
      follow: [
        ['When is `list.pop(0)` acceptable?', 'For very short lists (tens of items) where the memmove is trivial, or in one-off code. Not in a loop over large input.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Implement a queue using two stacks. What is the complexity?',
      a: 'Keep `inbox` and `outbox`. Push onto `inbox`. For `pop` or `peek`, if `outbox` is empty move every element from `inbox` to `outbox` (reversing order), then pop from `outbox`. Only refill when `outbox` is empty, otherwise order breaks. Each element is moved at most once, so any sequence of n operations costs O(n): amortised O(1) per operation, though a single pop can cost O(n).',
      follow: [
        ['Prove the amortised bound.', 'Use the accounting method: charge each push 2 units, one to pay for the push and one saved to pay for its later transfer. A pop then costs 1 plus transfers already prepaid, so every operation has constant amortised cost.'],
        ['Can you get worst-case O(1)?', 'Yes, with more complex designs (incremental transfer, or a real-time queue using three stacks / lazy rebuilding). Mention it exists; it is rarely asked in depth.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Implement a fixed-capacity circular queue and say how you detect full versus empty.',
      a: 'Use an array of capacity `k`, `head` (next read), `tail` (next write) and `size`. `enqueue`: if `size == k` return false; write at `tail`; `tail = (tail + 1) % k`; `size++`. `dequeue`: if `size == 0` return false; read at `head`; `head = (head + 1) % k`; `size--`. Without `size`, `head == tail` is ambiguous, so either keep a counter, or allocate `k + 1` slots and treat `(tail + 1) % (k + 1) == head` as full. The `size` approach is simpler; the spare-slot approach avoids a shared counter, which matters for single-producer single-consumer lock-free use, because then each side writes only its own index.',
      follow: [
        ['How would you make it lock-free for one producer and one consumer?', 'The producer writes the slot then publishes by storing `tail` with release semantics; the consumer loads `tail` with acquire, reads the slot, then stores `head` with release. Use the spare-slot full test so neither side writes the other\'s index.'],
        ['What changes for overwrite-oldest behaviour?', 'On full, advance `head` as well as `tail`. Used for logging and telemetry where recent data matters more than old.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Walk through BFS for the shortest path in an unweighted grid. Where do the complexity and correctness come from?',
      a: 'Put the start cell in a deque with distance 0 and mark it visited. Repeatedly `popleft` a cell, and for each of its four neighbours inside bounds, not blocked and unvisited: mark visited, record distance + 1, enqueue. The first time the target is dequeued (or enqueued) its distance is the shortest. Correctness: the queue holds cells in nondecreasing distance order, so cells are first reached by a shortest route. Complexity: each cell enters the queue once and each of its 4 edges is examined once, O(rows * cols) time and space. Mark visited on enqueue, not dequeue.',
      follow: [
        ['What if moves have different costs?', 'BFS no longer works because the queue order is not cost order. Use Dijkstra with a priority queue; with only 0 and 1 costs use 0-1 BFS with a deque (push 0-cost neighbours to the front).'],
        ['What if there are many sources?', 'Multi-source BFS: enqueue all sources with distance 0 initially. Rotting oranges and walls-and-gates are this pattern.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Design a bounded work queue between producer threads and a worker pool. What happens under overload?',
      a: 'Use a bounded blocking queue (`queue.Queue(maxsize=n)` or a ring buffer with condition variables). Producers block, or fail fast with a timeout, when it is full, which applies back-pressure upstream instead of growing memory without bound. Decide the overload policy explicitly: block, reject with an error (load shedding), drop oldest, or drop newest, based on whether work is idempotent and whether freshness matters. Add metrics: queue depth, wait time, rejection count. Size the queue from latency goals: depth is roughly arrival rate times acceptable wait. Handle shutdown (sentinel items, close flag), worker crashes (retry with limit, dead-letter queue), and fairness between producers if one can starve the rest.',
      follow: [
        ['Why not an unbounded queue?', 'Under sustained overload latency grows without bound and memory eventually fails, typically at the worst possible time. Bounded queues turn silent failure into a visible, controllable one.'],
        ['How does this change across machines?', 'You move to a durable broker with acknowledgements, visibility timeouts and a dead-letter queue, and you must design for at-least-once delivery with idempotent consumers.'],
      ],
    },
  ],
};
