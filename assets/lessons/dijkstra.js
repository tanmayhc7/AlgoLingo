/* Lesson data: Dijkstra's shortest paths (structure mode). */
(function () {
  var P = { 0: [120, 130], 1: [360, 60], 2: [360, 210], 3: [620, 90], 4: [860, 130] };
  var E = [[0, 1, 4, 'u1'], [0, 2, 1, 'u2'], [2, 1, 2, 'u1'], [1, 3, 5, 'u3'], [2, 3, 8, 'u3'], [3, 4, 3, 'u4']];
  function wpos(a, b) { return [Math.round((P[a][0] + P[b][0]) / 2), Math.round((P[a][1] + P[b][1]) / 2)]; }
  function graph() {
    var ops = [];
    var names = ['S', 'A', 'B', 'C', 'D'];
    for (var i = 0; i < 5; i++) ops.push(['node', 'v' + i, names[i], P[i][0], P[i][1], 'circle'], ['note', 'v' + i, i === 0 ? 'd=0' : 'd=inf']);
    E.forEach(function (e) { ops.push(['edge', 'v' + e[0], 'v' + e[1], e[3]]); var w = wpos(e[0], e[1]); ops.push(['node', 'w' + e[0] + e[1], String(e[2]), w[0], w[1], 'cell'], ['tag', 'w' + e[0] + e[1], 'dim']); });
    return ops;
  }
  function relax(e, from, to) { return ['etag', 'v' + e[0], e[3], 'on']; }
  var d = [{ pl: -1, cl: -1, h: 380, say: 'Dijkstra finds the cheapest path from a source to every vertex when edge weights are non-negative. Numbers on edges are weights. Each vertex carries its best known distance d, which starts at infinity everywhere except the source S.', csay: 'Priority queue of (distance, vertex).', ds: graph() },
    { pl: 1, cl: 1, h: 380, say: 'Push (0, S) onto a min-heap. The heap always hands back the unfinished vertex with the smallest known distance.', csay: 'push (0, S).', ds: [['tag', 'v0', 'mark']] },
    { pl: 5, cl: 5, h: 380, say: 'Pop S (distance 0), now final. Relax its edges: S to A costs 0 + 4 = 4, S to B costs 0 + 1 = 1. Both beat infinity, so update them and push them.', csay: 'Pop S; relax A=4, B=1.', ds: [['untag', 'v0', 'mark'], ['tag', 'v0', 'done'], ['note', 'v1', 'd=4'], ['note', 'v2', 'd=1'], ['etag', 'v0', 'u1', 'on'], ['etag', 'v0', 'u2', 'on'], ['hot', 'v1', 'v2']] },
    { pl: 5, cl: 5, h: 380, say: 'Pop the smallest, B (1). Relax B to A: 1 + 2 = 3, better than 4, so improve A. B to C: 1 + 8 = 9.', csay: 'Pop B; A improves to 3, C=9.', ds: [['tag', 'v2', 'done'], ['note', 'v1', 'd=3'], ['note', 'v3', 'd=9'], ['etag', 'v2', 'u1', 'on'], ['etag', 'v2', 'u3', 'on'], ['etag', 'v0', 'u1', 'dim'], ['hot', 'v1', 'v3']] },
    { pl: 3, cl: 3, h: 380, say: 'The heap still holds the stale entry (4, A). When it is popped later its distance is larger than the recorded d, so it is skipped. That "if d > dist[u]: continue" test replaces a decrease-key operation.', csay: 'Skip stale entries.', ds: [['hot', 'v1']] },
    { pl: 5, cl: 5, h: 380, say: 'Pop A (3). Relax A to C: 3 + 5 = 8, better than 9. Update C.', csay: 'Pop A; C improves to 8.', ds: [['tag', 'v1', 'done'], ['note', 'v3', 'd=8'], ['etag', 'v1', 'u3', 'on'], ['etag', 'v2', 'u3', 'dim'], ['hot', 'v3']] },
    { pl: 5, cl: 5, h: 380, say: 'Pop C (8). Relax C to D: 8 + 3 = 11.', csay: 'Pop C; D=11.', ds: [['tag', 'v3', 'done'], ['note', 'v4', 'd=11'], ['etag', 'v3', 'u4', 'on'], ['hot', 'v4']] },
    { pl: 5, cl: 5, h: 380, say: 'Pop D (11): nothing left to improve. The shortest path to D is S, B, A, C, D with cost 11. Keep a parent per vertex to rebuild it. Cost: O((V + E) log V) with a binary heap.', csay: 'Done: S-B-A-C-D costs 11.', ds: [['tag', 'v4', 'done'], ['etag', 'v0', 'u2', 'tree'], ['etag', 'v2', 'u1', 'tree'], ['etag', 'v1', 'u3', 'tree'], ['etag', 'v3', 'u4', 'tree'], ['hot', 'v4']] },
  ];

  /* negative weights */
  var N = { s: [150, 130], a: [480, 50], b: [480, 210] };
  var neg = [{ pl: -1, cl: -1, h: 380, say: 'Why no negative weights? S to A costs 2, S to B costs 3, but B to A costs -2. The true cheapest route to A is S, B, A = 3 - 2 = 1.', csay: 'Edge B to A is negative.', ds: [['node', 'ns', 'S', N.s[0], N.s[1], 'circle'], ['node', 'na', 'A', N.a[0], N.a[1], 'circle'], ['node', 'nb', 'B', N.b[0], N.b[1], 'circle'], ['note', 'ns', 'd=0'], ['note', 'na', 'd=inf'], ['note', 'nb', 'd=inf'], ['edge', 'ns', 'na', 'e1'], ['edge', 'ns', 'nb', 'e2'], ['edge', 'nb', 'na', 'e1'], ['node', 'x1', '2', 300, 70, 'cell'], ['node', 'x2', '3', 300, 210, 'cell'], ['node', 'x3', '-2', 520, 130, 'cell'], ['tag', 'x1', 'dim'], ['tag', 'x2', 'dim'], ['tag', 'x3', 'bad']] },
    { pl: 5, cl: 5, h: 380, say: 'Pop S. A gets 2, B gets 3.', csay: 'A=2, B=3.', ds: [['tag', 'ns', 'done'], ['note', 'na', 'd=2'], ['note', 'nb', 'd=3']] },
    { pl: 5, cl: 5, h: 380, say: 'Pop A (2): it is the smallest, so Dijkstra declares it final. The algorithm\'s promise is that no later path can be cheaper, because all weights are non-negative so any longer path can only cost more.', csay: 'A is finalised at 2.', ds: [['tag', 'na', 'done']] },
    { pl: 5, cl: 5, h: 380, say: 'Pop B (3). Relaxing B to A would give 3 + (-2) = 1, better than 2, but A is already final and is never revisited. Dijkstra reports 2 for A, and the real answer is 1. Wrong. Negative edges break the "smallest is final" argument; use Bellman-Ford (O(VE)) instead.', csay: 'Wrong answer: 2 instead of 1.', ds: [['tag', 'nb', 'done'], ['tag', 'na', 'bad'], ['note', 'na', 'true 1, found 2'], ['hot', 'na']] },
  ];

  window.LESSON = {
    id: 'dijkstra',
    mode: 'ds',
    title: 'Shortest paths with Dijkstra',
    lede:
      'BFS finds shortest paths when every edge costs the same. With different weights you need Dijkstra: always finalise the unfinished vertex with the smallest known distance, then relax its edges, offering its neighbours a cheaper route. A min-heap makes it O((V + E) log V). It rests on one assumption, that no edge weight is negative, and gives wrong answers when that fails.',
    scenes: [
      { id: 'dijkstra', title: 'Dijkstra step by step', blurb: 'A heap of (distance, vertex); pop the closest, relax its edges, repeat.', trap: 'Marking a vertex as done when you push it rather than when you pop it. The first distance you find is not necessarily the best; only the popped minimum is final.', pyCode: ['dist = {s: 0}; pq = [(0, s)]', 'while pq:', '    d, u = heappop(pq)', '    if d > dist[u]: continue   # stale entry', '    for v, w in g[u]:', '        if d + w < dist.get(v, inf):', '            dist[v] = d + w; heappush(pq, (d + w, v))'], cCode: ['dist[s] = 0; push(0, s);', 'while (!empty()) {', '    pop(&d, &u);', '    if (d > dist[u]) continue;   /* stale */', '    for (Edge *e = adj[u]; e; e = e->next)', '        if (d + e->w < dist[e->v]) {', '            dist[e->v] = d + e->w; push(dist[e->v], e->v); }'], predict: { q: 'Why is a vertex\'s distance final at the moment it is POPPED from the heap?', options: ['Because it was pushed first', 'Every other unfinished vertex is at least as far, and weights are non-negative, so no other route can undercut it', 'Because Dijkstra checks all paths'], answer: 1, why: 'Any route to it through an unfinished vertex already costs at least the popped distance, and extra edges only add non-negative cost.' }, steps: d },
      { id: 'negative', title: 'Why weights must not be negative', blurb: 'A negative edge can make an already-finalised vertex cheaper.', trap: 'Reaching for Dijkstra on any weighted graph. If there are negative edges use Bellman-Ford; if there are negative cycles, shortest paths are not even defined.', pyCode: ['# same loop as before', 'dist = {s: 0}; pq = [(0, s)]', '...', '...', '...', '    # B -> A has weight -2: relax A after it was finalised', '    ...'], cCode: ['/* same loop as before */', 'dist[s] = 0; push(0, s);', '...', '...', '...', '    /* B->A is -2: A was already finalised */', '    ...'], predict: { q: 'Which algorithm handles negative edge weights (but no negative cycles)?', options: ['Dijkstra with a bigger heap', 'Bellman-Ford', 'BFS'], answer: 1, why: 'Bellman-Ford relaxes every edge V - 1 times, so it can correct earlier distances. It costs O(V x E).' }, steps: neg },
    ],
    builtins: [
      ['heapq.heappush / heappop', 'The priority queue: O(log n) each.'],
      ['(dist, vertex) tuples', 'Compare by distance first. Add a counter if vertices are not comparable.'],
      ['float("inf") / math.inf', 'Initial distance for unreached vertices.'],
      ['dist.get(v, inf)', 'Distance with a default, so unseen vertices need no initialisation.'],
      ['parent[v] = u', 'Record the predecessor on each improvement to rebuild the path.'],
    ],
  };
})();
