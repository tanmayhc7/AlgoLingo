/* Lesson data: Graph traversal (structure mode). BFS, DFS and connected components. */
(function () {
  var P = { 0: [150, 120], 1: [400, 60], 2: [400, 200], 3: [650, 60], 4: [650, 200], 5: [850, 130] };
  var EDGES = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 5], [4, 5]];
  var ADJ = { 0: [1, 2], 1: [0, 2, 3], 2: [0, 1, 4], 3: [1, 5], 4: [2, 5], 5: [3, 4] };
  var ROW1 = 310, ROW2 = 390;
  function cx(k) { return 150 + k * 72; }

  function graph(pref) {
    var ops = [];
    for (var i = 0; i < 6; i++) ops.push(['node', pref + i, String(i), P[i][0], P[i][1], 'circle']);
    var kc = {};
    EDGES.forEach(function (e) { kc[e[0]] = (kc[e[0]] || 0) + 1; ops.push(['edge', pref + e[0], pref + e[1], 'u' + e[1]]); });
    return ops;
  }
  function rowLabel(id, text, y) { return [['node', id, text, 70, y, 'cell'], ['tag', id, 'mark']]; }

  /* BFS from 0 */
  var bfs = [{ pl: -1, cl: -1, h: 470, say: 'Breadth-first search explores in rings: first the start, then everything one edge away, then two edges away. A queue gives that order. Start at vertex 0, mark it visited and enqueue it.', csay: 'Queue plus a visited array.', ds: graph('b').concat(rowLabel('ql', 'queue', ROW1), rowLabel('dl', 'dist', ROW2)) }];
  var qn = 0;
  var order = [];
  var visited = { 0: true };
  var dist = { 0: 0 };
  var q = [0];
  bfs.push({ pl: 3, cl: 3, h: 470, say: 'visited = {0}, queue = [0]. Distance of the start is 0.', csay: 'visited[0] = 1; enqueue(0).', ds: [['tag', 'b0', 'cur'], ['node', 'q0', '0', cx(0), ROW1, 'cell'], ['node', 'd0', '0', cx(0), ROW2, 'cell'], ['ptr', 'front', 'q0', 'up']] });
  var head = 0;
  var enq = 1;
  while (head < q.length) {
    var u = q[head];
    var ops = [['untag', 'b' + (head ? q[head - 1] : 0), 'cur'], ['ptr', 'front', 'q' + head, 'up'], ['tag', 'b' + u, 'done'], ['tag', 'b' + u, 'cur'], ['hot', 'b' + u]];
    var found = [];
    ADJ[u].forEach(function (v) {
      if (!visited[v]) {
        visited[v] = true;
        dist[v] = dist[u] + 1;
        q.push(v);
        ops.push(['node', 'q' + (q.length - 1), String(v), cx(q.length - 1), ROW1, 'cell'], ['node', 'd' + v, String(dist[v]), cx(q.length - 1), ROW2, 'cell'], ['tag', 'b' + v, 'mark']);
        found.push(v);
      }
    });
    var txt = 'Dequeue ' + u + '. Its neighbours are ' + ADJ[u].join(', ') + '. ' + (found.length ? 'New ones: ' + found.join(', ') + ', each at distance ' + (dist[u] + 1) + '. Mark them visited as you enqueue, not later.' : 'All already visited, so nothing is added.');
    bfs.push({ pl: 5, cl: 5, h: 470, say: txt, csay: 'Dequeue ' + u + (found.length ? ', enqueue ' + found.join(', ') : ', nothing new') + '.', ds: ops });
    head++;
  }
  bfs.push({ pl: 6, cl: 6, h: 470, say: 'The queue is empty. Every vertex was reached in order of distance: 0 | 1, 2 | 3, 4 | 5. Because BFS reaches vertices in rings, the first time it reaches a vertex is by a shortest path (fewest edges). Cost: O(V + E), each vertex enqueued once and each list scanned once.', csay: 'O(V + E).', ds: [['untag', 'b5', 'cur'], ['unptr', 'front']] });

  /* DFS from 0 (recursive) */
  var OUT_Y = 390, STK_Y = 310;
  var dfs = [{ pl: -1, cl: -1, h: 470, say: 'Depth-first search goes as far as it can along one path, then backs up. Recursion (the call stack) gives that order. The row "calls" shows the active calls.', csay: 'Same recursion in C.', ds: graph('g').concat(rowLabel('sl', 'calls', STK_Y), rowLabel('ol', 'order', OUT_Y)) }];
  var vis = {};
  var stack = [];
  var outn = 0;
  function dstep(u, from) {
    vis[u] = true;
    var ops = [['tag', 'g' + u, 'cur'], ['node', 's' + stack.length, String(u), cx(stack.length), STK_Y, 'cell'], ['node', 'o' + outn, String(u), cx(outn), OUT_Y, 'cell'], ['ptr', 'cur', 'g' + u, 'up']];
    if (from !== null) ops.push(['etag', 'g' + from, 'u' + u, 'tree'], ['etag', 'g' + u, 'u' + from, 'tree']);
    outn++;
    stack.push(u);
    dfs.push({ pl: 2, cl: 2, h: 470, say: from === null ? 'dfs(0): mark 0 visited and look at its neighbours in order.' : 'From ' + from + ' go to its first unvisited neighbour, ' + u + '. Mark it visited, push a call.', csay: 'dfs(' + u + ')', ds: ops });
    for (var i = 0; i < ADJ[u].length; i++) {
      var v = ADJ[u][i];
      if (!vis[v]) dstep(v, u);
    }
    stack.pop();
  }
  dstep(0, null);
  dfs.push({ pl: 4, cl: 4, h: 470, say: 'Vertex 2 has no unvisited neighbours (0, 1 and 4 are all visited), so its call returns. The same happens to 4, 5, 3 and 1 in turn as the stack unwinds. Order of visit: 0, 1, 3, 5, 4, 2. Cost: O(V + E), and the stack can grow to O(V) deep, which on a path-shaped graph of 100,000 vertices overflows Python\'s recursion limit.', csay: 'Unwind. O(V + E), depth O(V).', ds: [['unptr', 'cur'], ['tag', 'g0', 'done'], ['tag', 'g1', 'done'], ['tag', 'g2', 'done'], ['tag', 'g3', 'done'], ['tag', 'g4', 'done'], ['tag', 'g5', 'done'], ['rm', 's0'], ['rm', 's1'], ['rm', 's2'], ['rm', 's3'], ['rm', 's4'], ['rm', 's5']] });

  /* components */
  var CP = { 0: [120, 80], 1: [300, 60], 2: [240, 200], 3: [520, 100], 4: [680, 160], 5: [880, 120] };
  var CE = [[0, 1], [1, 2], [0, 2], [3, 4]];
  var comp = [{ pl: -1, cl: -1, h: 400, say: 'How many separate pieces does the graph have? Vertices 0, 1, 2 form a triangle, 3 and 4 are joined, and 5 is alone. A connected component is a maximal set of vertices that can reach each other.', csay: 'Same graph.', ds: (function () { var o = []; for (var i = 0; i < 6; i++) o.push(['node', 'k' + i, String(i), CP[i][0], CP[i][1], 'circle']); CE.forEach(function (e) { o.push(['edge', 'k' + e[0], 'k' + e[1], 'u' + e[1]]); }); o.push(['node', 'cl', 'count', 70, 320, 'cell'], ['tag', 'cl', 'mark'], ['node', 'cv', '0', 150, 320, 'cell']); return o; })() }];
  comp.push({ pl: 3, cl: 3, h: 400, say: 'Loop over the vertices. Vertex 0 is unvisited, so it starts a new component: count = 1, and a BFS or DFS from it visits 0, 1 and 2.', csay: 'Unvisited: count++, flood fill.', ds: [['lab', 'cv', '1'], ['tag', 'k0', 'done'], ['tag', 'k1', 'done'], ['tag', 'k2', 'done'], ['hot', 'k0', 'k1', 'k2']] });
  comp.push({ pl: 2, cl: 2, h: 400, say: 'Vertices 1 and 2 are already visited, so the loop skips them. Vertex 3 is unvisited: count = 2, and the fill reaches 3 and 4.', csay: 'Skip 1, 2. Vertex 3 starts another.', ds: [['lab', 'cv', '2'], ['tag', 'k3', 'mark'], ['tag', 'k4', 'mark'], ['hot', 'k3', 'k4']] });
  comp.push({ pl: 3, cl: 3, h: 400, say: 'Vertex 5 has no neighbours: it is a component of one. count = 3. The visited check in the outer loop makes the whole run O(V + E), not O(V x (V + E)).', csay: 'Isolated vertex: count = 3.', ds: [['lab', 'cv', '3'], ['tag', 'k5', 'cur'], ['hot', 'k5']] });

  window.LESSON = {
    id: 'graph-traversal',
    mode: 'ds',
    title: 'BFS, DFS and components',
    lede:
      'Almost every graph algorithm is a traversal with a small twist. Breadth-first search uses a queue and visits by distance, so it finds shortest paths in unweighted graphs. Depth-first search uses a stack (or recursion) and goes deep first, which suits cycle detection, ordering and exploring everything reachable. Both cost O(V + E) because each vertex is visited once and each edge looked at a constant number of times. The one rule you must never forget: keep a visited set.',
    scenes: [
      { id: 'bfs', title: 'Breadth-first search', blurb: 'A queue, a visited set, and a distance per vertex.', trap: 'Mark a vertex visited when you ENQUEUE it, not when you dequeue it. Otherwise the same vertex can be added many times, and the queue (and run time) blows up.', pyCode: ['from collections import deque', 'dist = {s: 0}; q = deque([s])', 'while q:', '    u = q.popleft()', '    for v in g[u]:', '        if v not in dist:', '            dist[v] = dist[u] + 1; q.append(v)'], cCode: ['int dist[N]; fill(dist, -1);', 'dist[s] = 0; enqueue(s);', 'while (!empty()) {', '    int u = dequeue();', '    for (Node *e = adj[u]; e; e = e->next)', '        if (dist[e->v] < 0)', '            { dist[e->v] = dist[u] + 1; enqueue(e->v); }'], predict: { q: 'BFS on an unweighted graph reaches vertex X for the first time after 3 dequeues of distance-2 vertices. What does the distance stored for X represent?', options: ['The length of a shortest path from the start, in edges', 'The number of vertices visited before it', 'The order it was found in'], answer: 0, why: 'BFS processes vertices in nondecreasing distance, so the first time X is found, the path used is a shortest one.' }, steps: bfs },
      { id: 'dfs', title: 'Depth-first search', blurb: 'Go deep, mark visited, back up when stuck. Recursion keeps the path.', trap: 'Without a visited set DFS loops forever on any cycle. And deep recursion can overflow: Python stops near 1000 frames, so use an explicit stack for large graphs.', pyCode: ['seen = set()', 'def dfs(u):', '    seen.add(u)', '    for v in g[u]:', '        if v not in seen: dfs(v)'], cCode: ['int seen[N];', 'void dfs(int u) {', '    seen[u] = 1;', '    for (Node *e = adj[u]; e; e = e->next)', '        if (!seen[e->v]) dfs(e->v);', '}'], predict: { q: 'A graph is a single path of 200,000 vertices. What happens with a recursive DFS in default Python?', options: ['It finishes in O(V + E)', 'RecursionError: the depth reaches 200,000', 'It returns the wrong answer'], answer: 1, why: 'The recursion depth equals the path length. Python defaults to a limit of about 1000, so use an iterative stack or raise the limit with care.' }, steps: dfs },
      { id: 'components', title: 'Connected components', blurb: 'Run a traversal from every unvisited vertex and count how many times you start.', trap: 'Starting the traversal only from vertex 0 finds one component and misses the rest. The outer loop over all vertices is what finds every piece.', pyCode: ['seen = set(); count = 0', 'for u in g:', '    if u not in seen:', '        count += 1; flood(u, seen)   # bfs or dfs'], cCode: ['int count = 0;', 'for (int u = 0; u < n; u++)', '    if (!seen[u]) {', '        count++; flood(u);   /* bfs or dfs */', '    }'], predict: { q: 'A graph has 1000 vertices and no edges. How many components?', options: ['1', '1000', '0'], answer: 1, why: 'Every vertex is alone, so every vertex is its own component.' }, steps: comp },
    ],
    builtins: [
      ['collections.deque', 'popleft() is O(1): the BFS queue. A list with pop(0) is O(n).'],
      ['set / dict as visited', 'O(1) membership. A dist dict doubles as the visited set.'],
      ['dist.get(v, -1)', 'Distance with a default for unseen vertices.'],
      ['sys.setrecursionlimit(n)', 'Raises the limit but a deep recursion can still crash the interpreter; prefer an explicit stack.'],
      ['stack = [s]; stack.pop()', 'Iterative DFS: a list used as a stack.'],
    ],
  };
})();
