/* Lesson data: Topological sort (structure mode). Kahn's algorithm and cycle detection. */
(function () {
  var P = { 0: [120, 130], 1: [360, 60], 2: [360, 210], 3: [620, 90], 4: [860, 130] };
  var Q_Y = 330, O_Y = 410;
  function cx(k) { return 150 + k * 72; }
  function graph(E, pre, indeg, n) {
    var ops = [];
    for (var i = 0; i < n; i++) ops.push(['node', pre + i, String(i), P[i][0], P[i][1], 'circle'], ['note', pre + i, 'in ' + indeg[i]]);
    var kc = {};
    E.forEach(function (e) { kc[e[0]] = (kc[e[0]] || 0) + 1; ops.push(['edge', pre + e[0], pre + e[1], 'e' + kc[e[0]]]); });
    return ops;
  }
  function label(id, t, y) { return [['node', id, t, 70, y, 'cell'], ['tag', id, 'mark']]; }

  var E1 = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 4]];
  var adj = { 0: [1, 2], 1: [3], 2: [3, 4], 3: [4], 4: [] };
  var indeg = { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2 };

  var kahn = [{ pl: -1, cl: -1, h: 480, say: 'A topological order lists the vertices of a directed acyclic graph so that every edge points forward: if u -> v, then u comes before v. Think of courses and prerequisites. First compute each vertex\'s in-degree, the number of edges pointing at it (shown on each node).', csay: 'Count incoming edges first.', ds: graph(E1, 'a', indeg, 5).concat(label('ql', 'queue', Q_Y), label('ol', 'order', O_Y)) }];
  var deg = { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2 };
  var queue = [0];
  var qpos = 1; // next queue slot
  var outn = 0;
  kahn.push({ pl: 3, cl: 3, h: 480, say: 'Start with every vertex whose in-degree is 0: nothing has to come before it. Only vertex 0 qualifies. Enqueue it.', csay: 'Enqueue all zero in-degree vertices.', ds: [['tag', 'a0', 'mark'], ['node', 'q0', '0', cx(0), Q_Y, 'cell'], ['ptr', 'front', 'q0', 'up']] });
  var qi = 0;
  while (qi < queue.length) {
    var u = queue[qi];
    var ops = [['ptr', 'front', 'q' + qi, 'up'], ['node', 'o' + outn, String(u), cx(outn), O_Y, 'cell'], ['tag', 'a' + u, 'done'], ['hot', 'a' + u]];
    outn++;
    var freed = [];
    adj[u].forEach(function (v) {
      deg[v]--;
      ops.push(['note', 'a' + v, 'in ' + deg[v]]);
      if (deg[v] === 0) { queue.push(v); ops.push(['node', 'q' + (queue.length - 1), String(v), cx(queue.length - 1), Q_Y, 'cell'], ['tag', 'a' + v, 'mark']); freed.push(v); }
    });
    kahn.push({ pl: 6, cl: 6, h: 480, say: 'Take ' + u + ' from the queue and append it to the order. Remove its outgoing edges: ' + (adj[u].length ? adj[u].map(function (v) { return v + ' drops to in-degree ' + deg[v]; }).join('; ') + '.' : 'none.') + (freed.length ? ' ' + freed.join(' and ') + ' now ' + (freed.length > 1 ? 'have' : 'has') + ' no unmet prerequisites, so ' + (freed.length > 1 ? 'they join' : 'it joins') + ' the queue.' : ''), csay: 'Output ' + u + (freed.length ? ', enqueue ' + freed.join(', ') : '') + '.', ds: ops });
    qi++;
  }
  kahn.push({ pl: 8, cl: 8, h: 480, say: 'Order: 0, 1, 2, 3, 4. All 5 vertices were output, so the graph has no cycle and the order is valid. There can be many valid orders (1 and 2 could swap). Cost: O(V + E).', csay: 'Output length equals V: valid.', ds: [['unptr', 'front']] });

  /* cycle detection */
  var E2 = [[0, 1], [1, 2], [2, 3], [3, 1]];
  var P2 = { 0: [120, 130], 1: [380, 130], 2: [620, 60], 3: [620, 210] };
  var adj2 = { 0: [1], 1: [2], 2: [3], 3: [1] };
  var d2 = { 0: 0, 1: 2, 2: 1, 3: 1 };
  var cyc = [{ pl: -1, cl: -1, h: 480, say: 'Now add an edge 3 -> 1 so that 1, 2 and 3 form a loop. Each of them needs another to come first, so no valid order can exist.', csay: 'Same algorithm.', ds: (function () { var o = []; for (var i = 0; i < 4; i++) o.push(['node', 'c' + i, String(i), P2[i][0], P2[i][1], 'circle'], ['note', 'c' + i, 'in ' + d2[i]]); var kc = {}; E2.forEach(function (e) { kc[e[0]] = (kc[e[0]] || 0) + 1; o.push(['edge', 'c' + e[0], 'c' + e[1], 'e' + kc[e[0]]]); }); return o.concat(label('ql', 'queue', Q_Y), label('ol', 'order', O_Y)); })() }];
  cyc.push({ pl: 3, cl: 3, h: 480, say: 'Only vertex 0 has in-degree 0. Enqueue it.', csay: 'Queue: 0.', ds: [['tag', 'c0', 'mark'], ['node', 'q0', '0', cx(0), Q_Y, 'cell'], ['ptr', 'front', 'q0', 'up']] });
  cyc.push({ pl: 6, cl: 6, h: 480, say: 'Output 0 and remove its edge. Vertex 1 drops to in-degree 1: it still waits on 3. Nothing else reaches zero, so the queue is now empty.', csay: 'Output 0. Vertex 1 still has in-degree 1.', ds: [['node', 'o0', '0', cx(0), O_Y, 'cell'], ['tag', 'c0', 'done'], ['note', 'c1', 'in 1'], ['hot', 'c0']] });
  cyc.push({ pl: 8, cl: 8, h: 480, say: 'The loop ends with only 1 vertex output, but there are 4. Fewer outputs than vertices means a cycle blocked the rest: vertices 1, 2 and 3 can never reach in-degree 0. This is the standard cycle check for directed graphs, and the same reason a build system reports a circular dependency.', csay: 'Output length 1 < 4: cycle detected.', ds: [['unptr', 'front'], ['tag', 'c1', 'bad'], ['tag', 'c2', 'bad'], ['tag', 'c3', 'bad'], ['hot', 'c1', 'c2', 'c3']] });

  window.LESSON = {
    id: 'topological-sort',
    mode: 'ds',
    title: 'Topological sort',
    lede:
      'A topological order puts the vertices of a directed acyclic graph in a line so that every edge points forward. It answers "in what order can I do these tasks given their prerequisites", and it fails exactly when there is a cycle. Kahn\'s algorithm builds it with a queue of vertices that have no unmet prerequisites; a DFS finish-order does it too. Both are O(V + E).',
    scenes: [
      { id: 'kahn', title: 'Kahn\'s algorithm', blurb: 'Repeatedly take a vertex with in-degree 0, output it, and remove its edges.', trap: 'Forgetting to count in-degrees for vertices that never appear as a source, or building the graph with only some vertices. Every vertex must be in the in-degree table, even with zero edges.', pyCode: ['indeg = {u: 0 for u in g}', 'for u in g:', '    for v in g[u]: indeg[v] += 1', 'q = deque(u for u in g if indeg[u] == 0)', 'order = []', 'while q:', '    u = q.popleft(); order.append(u)', '    for v in g[u]:', '        indeg[v] -= 1', '        if indeg[v] == 0: q.append(v)'], cCode: ['int indeg[N] = {0};', 'for (u...) for (e...) indeg[e->v]++;', 'for (u...) if (indeg[u] == 0) enqueue(u);', 'int out = 0;', 'while (!empty()) {', '    int u = dequeue(); order[out++] = u;', '    for (Node *e = adj[u]; e; e = e->next)', '        if (--indeg[e->v] == 0) enqueue(e->v);', '}'], predict: { q: 'In a DAG, which vertices can be first in a topological order?', options: ['Any vertex', 'Only vertices with in-degree 0', 'Only vertices with out-degree 0'], answer: 1, why: 'A vertex with an incoming edge has a prerequisite that must come before it. Vertices with in-degree 0 have none.' }, steps: kahn },
      { id: 'cycle', title: 'Detecting a cycle', blurb: 'If the output is shorter than the vertex count, a cycle trapped the rest.', trap: 'Returning the partial order as if it were valid. Always compare len(order) with the number of vertices before trusting the result.', pyCode: ['# same loop as before', 'indeg = {u: 0 for u in g}', '...', 'q = deque(u for u in g if indeg[u] == 0)', '...', 'while q: ...', '    ...', '    ...', 'return order if len(order) == len(g) else None'], cCode: ['/* same loop as before */', 'int indeg[N] = {0};', '...', 'enqueue the zero in-degree vertices', '...', 'while (!empty()) { ... }', '...', '...', 'return out == n ? order : NULL;'], predict: { q: 'Kahn\'s algorithm outputs 3 vertices from a graph with 5. What does that tell you?', options: ['The graph has a cycle among the remaining 2 or more vertices', 'The answer is correct; the other two do not matter', 'The graph is disconnected'], answer: 0, why: 'Vertices on a cycle never reach in-degree 0, so they are never enqueued. A short output means at least one cycle blocked the rest.' }, steps: cyc },
    ],
    builtins: [
      ['collections.deque', 'Queue for the zero in-degree vertices (a stack also works; the order differs).'],
      ['graphlib.TopologicalSorter', 'Standard library: add(node, *predecessors), then static_order(). Raises CycleError on a cycle.'],
      ['collections.Counter', 'Count in-degrees from a flat list of edge targets.'],
      ['heapq', 'Replace the queue by a heap to get the lexicographically smallest order.'],
      ['len(order) == len(g)', 'The one-line check that the graph was acyclic.'],
    ],
  };
})();
