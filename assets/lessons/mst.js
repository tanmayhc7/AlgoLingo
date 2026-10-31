/* Lesson data: minimum spanning trees, Kruskal and Prim (structure mode). */
(function () {
  var P = { 0: [120, 130], 1: [360, 60], 2: [360, 210], 3: [620, 90], 4: [860, 130] };
  var E = [[0, 1, 4, 'u1'], [0, 2, 1, 'u2'], [2, 1, 2, 'u1'], [1, 3, 5, 'u3'], [2, 3, 8, 'u3'], [3, 4, 3, 'u4']];
  function wpos(a, b) { return [Math.round((P[a][0] + P[b][0]) / 2), Math.round((P[a][1] + P[b][1]) / 2)]; }
  var names = ['A', 'B', 'C', 'D', 'E'];
  function graph() {
    var ops = [];
    for (var i = 0; i < 5; i++) ops.push(['node', 'v' + i, names[i], P[i][0], P[i][1], 'circle']);
    E.forEach(function (e) { ops.push(['edge', 'v' + e[0], 'v' + e[1], e[3]]); var w = wpos(e[0], e[1]); ops.push(['node', 'w' + e[0] + e[1], String(e[2]), w[0], w[1], 'cell'], ['tag', 'w' + e[0] + e[1], 'dim']); });
    return ops;
  }
  function ed(a, b) { return E.filter(function (e) { return (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a); })[0]; }
  function take(a, b) { var e = ed(a, b); return [['etag', 'v' + e[0], e[3], 'tree'], ['untag', 'w' + e[0] + e[1], 'dim'], ['tag', 'w' + e[0] + e[1], 'done']]; }
  function skip(a, b) { var e = ed(a, b); return [['etag', 'v' + e[0], e[3], 'dim']]; }

  var kr = [
    { pl: -1, cl: -1, h: 380, say: 'A spanning tree connects all the vertices with no cycle, using V - 1 edges. The minimum spanning tree (MST) is the one with the smallest total weight: think cheapest cabling that links every office. Numbers are edge weights.', csay: 'Edges stored as (u, v, w).', ds: graph() },
    { pl: 0, cl: 0, h: 380, say: 'Kruskal sorts all edges by weight: A-C 1, B-C 2, D-E 3, A-B 4, B-D 5, C-D 8. Then it considers them cheapest first and keeps an edge if it does not create a cycle.', csay: 'qsort by weight.', ds: [['hot', 'w02', 'w21', 'w34']] },
    { pl: 5, cl: 5, h: 380, say: 'A-C (1): A and C are in different components, so keep the edge and merge them. Union-find answers "same component?" in almost constant time.', csay: 'unite(A, C).', ds: take(0, 2).concat([['tag', 'v0', 'done'], ['tag', 'v2', 'done']]) },
    { pl: 5, cl: 5, h: 380, say: 'B-C (2): B is alone, C is with A: different components, keep it. Component {A, B, C}.', csay: 'unite(B, C).', ds: take(2, 1).concat([['tag', 'v1', 'done']]) },
    { pl: 5, cl: 5, h: 380, say: 'D-E (3): a new component {D, E}.', csay: 'unite(D, E).', ds: take(3, 4).concat([['tag', 'v3', 'done'], ['tag', 'v4', 'done']]) },
    { pl: 3, cl: 3, h: 380, say: 'A-B (4): find(A) and find(B) are the same component, so this edge would close a cycle (A, C, B). Skip it.', csay: 'find(A) == find(B): skip.', ds: skip(0, 1).concat([['tag', 'v0', 'bad'], ['tag', 'v1', 'bad']]) },
    { pl: 5, cl: 5, h: 380, say: 'B-D (5): {A, B, C} and {D, E} are different components. Keep it: now everything is connected.', csay: 'unite(B, D).', ds: [['untag', 'v0', 'bad'], ['untag', 'v1', 'bad']].concat(take(1, 3)) },
    { pl: 6, cl: 6, h: 380, say: 'We have V - 1 = 4 edges, so we can stop (C-D would only add a cycle). Total weight 1 + 2 + 3 + 5 = 11. Cost: O(E log E), dominated by the sort.', csay: 'MST weight 11.', ds: skip(2, 3).concat([['hot', 'v0', 'v1', 'v2', 'v3', 'v4']]) },
  ];

  var pr = [
    { pl: 0, cl: 0, h: 380, say: 'Prim grows one tree from a start vertex. It always adds the cheapest edge that leaves the tree. Start at A: A is in the tree, and its edges A-B 4 and A-C 1 go into a min-heap.', csay: 'mark A, push its edges.', ds: graph().concat([['tag', 'v0', 'done'], ['etag', 'v0', 'u1', 'on'], ['etag', 'v0', 'u2', 'on']]) },
    { pl: 2, cl: 2, h: 380, say: 'Pop the cheapest edge: A-C (1). C is not in the tree yet, so add it. Push C\'s edges: C-B 2 and C-D 8.', csay: 'add C.', ds: [['tag', 'v2', 'done'], ['etag', 'v0', 'u2', 'tree'], ['untag', 'w02', 'dim'], ['etag', 'v2', 'u1', 'on'], ['etag', 'v2', 'u3', 'on']] },
    { pl: 2, cl: 2, h: 380, say: 'Pop the cheapest edge leaving the tree: C-B (2). Add B. Push B-D 5. The old A-B 4 entry is still in the heap but now joins two tree vertices.', csay: 'add B.', ds: [['tag', 'v1', 'done'], ['etag', 'v2', 'u1', 'tree'], ['etag', 'v1', 'u3', 'on']] },
    { pl: 3, cl: 3, h: 380, say: 'Pop A-B (4): B is already in the tree, so skip it (this is the "if v in seen: continue" test, the same lazy deletion as in Dijkstra).', csay: 'B already marked: skip.', ds: [['etag', 'v0', 'u1', 'dim'], ['hot', 'v1']] },
    { pl: 2, cl: 2, h: 380, say: 'Pop B-D (5): D is new. Add it and push D-E 3.', csay: 'add D.', ds: [['tag', 'v3', 'done'], ['etag', 'v1', 'u3', 'tree'], ['etag', 'v3', 'u4', 'on']] },
    { pl: 2, cl: 2, h: 380, say: 'Pop D-E (3): add E. All five vertices are in the tree. Remaining heap entries (C-D 8) are skipped. Total weight 11, the same tree as Kruskal. Cost O(E log V) with a binary heap.', csay: 'MST weight 11.', ds: [['tag', 'v4', 'done'], ['etag', 'v3', 'u4', 'tree'], ['etag', 'v2', 'u3', 'dim'], ['hot', 'v4']] },
  ];

  window.LESSON = {
    id: 'mst',
    mode: 'ds',
    title: 'Minimum spanning trees',
    lede:
      'A spanning tree links every vertex of a connected graph with exactly V - 1 edges and no cycle. The minimum spanning tree has the least total weight. Two greedy algorithms find it. Kruskal sorts edges and keeps each one that joins two different components (union-find). Prim grows a single tree outward, always taking the cheapest edge that leaves it (a heap, like Dijkstra). Both are correct because of the cut property: the cheapest edge crossing any cut belongs to some MST.',
    scenes: [
      { id: 'kruskal', title: 'Kruskal: sort the edges', blurb: 'Cheapest edge first; keep it unless it closes a cycle (checked with union-find).', trap: 'Forgetting that the graph must be connected: on a disconnected graph you get a spanning forest with fewer than V - 1 edges. Also, edges with equal weights can give different (equally cheap) MSTs; the total is unique, the tree may not be.', pyCode: ['edges.sort(key=lambda e: e[2])', 'dsu = UnionFind(n); mst = []', 'for u, v, w in edges:', '    if dsu.find(u) != dsu.find(v):', '        dsu.union(u, v)', '        mst.append((u, v, w))', 'return mst'], cCode: ['qsort(edges, m, sizeof *edges, by_weight);', 'uf_init(n);', 'for (int i = 0; i < m; i++) {', '    if (find(e[i].u) != find(e[i].v)) {', '        unite(e[i].u, e[i].v);', '        mst[k++] = e[i];', '    }}'], predict: { q: 'Kruskal considers edge B-D whose endpoints are already in the same component. What does it do?', options: ['Adds it anyway', 'Skips it: it would create a cycle', 'Removes a heavier edge'], answer: 1, why: 'Two vertices already connected through other kept edges would form a cycle if joined again, so the edge is discarded.' }, steps: kr },
      { id: 'prim', title: 'Prim: grow one tree', blurb: 'Keep a heap of edges leaving the tree; always take the cheapest one that reaches a new vertex.', trap: 'Using Dijkstra\'s key by mistake: Prim\'s priority is the edge weight alone, not the distance from the start. And remember to skip heap entries whose far end is already in the tree.', pyCode: ['seen = {start}; pq = [(w, start, v) for v, w in adj[start]]; heapify(pq)', 'while pq and len(seen) < n:', '    w, u, v = heappop(pq)', '    if v in seen: continue', '    seen.add(v); mst.append((u, v, w))', '    for x, wx in adj[v]:', '        if x not in seen: heappush(pq, (wx, v, x))'], cCode: ['mark[s] = 1; push all edges of s;', 'while (!empty(pq) && count < n) {', '    Edge e = pop_min(pq);', '    if (mark[e.v]) continue;', '    mark[e.v] = 1; add e to mst;', '    for each edge (v, x, w):', '        if (!mark[x]) push(pq, v, x, w);', '}'], predict: { q: 'What does Prim pop from its heap each time?', options: ['The vertex with the smallest distance from the start', 'The cheapest edge leaving the current tree', 'The heaviest edge'], answer: 1, why: 'Prim keys on the edge weight. Dijkstra keys on the accumulated path length, which is the difference between the two algorithms.' }, steps: pr },
    ],
    builtins: [
      ['heapq.heappush / heappop', 'The priority queue behind Prim.'],
      ['sorted(edges, key=...)', 'Sort edges by weight for Kruskal.'],
      ['UnionFind.find / union', 'Component test for Kruskal (chapter 13).'],
      ['networkx.minimum_spanning_tree', 'Library version (not in the standard library).'],
      ['set / list of tuples', 'Typical edge-list representation: (u, v, w).'],
    ],
  };
})();
