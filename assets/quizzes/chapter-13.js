/* Chapter 13 quiz: Shortest paths and connectivity. */
window.QUIZ = {
  chapter: 13,
  title: 'Shortest paths and connectivity',
  lede: 'Dijkstra, when it fails, and union-find.',
  questions: [
    {
      type: 'mcq',
      q: 'Dijkstra pops vertex X from the heap with distance 7. Why can you treat 7 as X\'s final distance?',
      options: ['Because X was pushed first', 'Every unfinished vertex is at least as far, and non-negative weights mean no other route can undercut 7', 'Because the heap sorts the edges'],
      answer: 1,
      why: 'Any other route to X leaves the finished set through an unfinished vertex at distance 7 or more, then adds non-negative weights.',
    },
    {
      type: 'mcq',
      q: 'A graph has a few edges with negative weights and no negative cycle. Which algorithm do you use for single-source shortest paths?',
      options: ['Dijkstra', 'BFS', 'Bellman-Ford'],
      answer: 2,
      why: 'Bellman-Ford relaxes every edge V - 1 times, so it can correct distances that a negative edge improves later. Dijkstra and BFS assume non-negative or equal weights.',
    },
    {
      type: 'mcq',
      q: 'With union by size and path compression, what does one <code>find</code> cost?',
      options: ['O(n) worst case', 'O(log n) always', 'Effectively constant: O(alpha(n)) amortised'],
      answer: 2,
      why: 'The two optimisations together give inverse-Ackermann amortised time, below 5 for any practical n.',
    },
    {
      type: 'complete',
      q: 'Fill in the blanks so <code>dijkstra(g, s)</code> returns a dict of shortest distances. <code>g[u]</code> is a list of <code>(v, weight)</code>.',
      starter: 'import heapq\n\ndef dijkstra(g, s):\n    dist = {s: 0}\n    pq = [(0, s)]\n    while pq:\n        d, u = heapq.___(pq)\n        if d > dist[u]:\n            continue\n        for v, w in g[u]:\n            nd = ___\n            if nd < dist.get(v, float("inf")):\n                dist[v] = nd\n                heapq.heappush(pq, (nd, v))\n    return dist\n',
      tests: [
        { expr: 'dijkstra({0: [(1, 4), (2, 1)], 1: [(3, 5)], 2: [(1, 2), (3, 8)], 3: []}, 0)', want: '{0: 0, 2: 1, 1: 3, 3: 8}' },
        { expr: 'dijkstra({0: []}, 0)', want: '{0: 0}' },
      ],
      hint: 'Pop the smallest entry. The new distance to v is the distance so far plus the edge weight.',
      solution: 'import heapq\n\ndef dijkstra(g, s):\n    dist = {s: 0}\n    pq = [(0, s)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]:\n            continue\n        for v, w in g[u]:\n            nd = d + w\n            if nd < dist.get(v, float("inf")):\n                dist[v] = nd\n                heapq.heappush(pq, (nd, v))\n    return dist\n',
      why: 'The stale-entry check replaces decrease-key: older heap entries with larger distances are simply skipped.',
    },
    {
      type: 'write',
      q: 'Write a class <code>DSU</code> with <code>__init__(n)</code>, <code>find(x)</code>, <code>union(a, b)</code> (returns True if it merged two groups, False if they were already together) and attribute <code>count</code> for the number of groups.',
      starter: 'class DSU:\n    def __init__(self, n):\n        pass\n\n    def find(self, x):\n        pass\n\n    def union(self, a, b):\n        pass\n',
      tests: [
        { expr: '(lambda d: (d.union(0, 1), d.union(1, 2), d.union(0, 2), d.count, d.find(0) == d.find(2)))(DSU(4))', want: '(True, True, False, 2, True)' },
        { expr: '(lambda d: (d.count, d.find(3)))(DSU(5))', want: '(5, 3)' },
      ],
      hint: 'parent starts as list(range(n)), count starts at n. Union the roots, and decrement count only when the roots differ.',
      solution: 'class DSU:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.size = [1] * n\n        self.count = n\n\n    def find(self, x):\n        root = x\n        while self.parent[root] != root:\n            root = self.parent[root]\n        while self.parent[x] != root:\n            self.parent[x], x = root, self.parent[x]\n        return root\n\n    def union(self, a, b):\n        ra, rb = self.find(a), self.find(b)\n        if ra == rb:\n            return False\n        if self.size[ra] < self.size[rb]:\n            ra, rb = rb, ra\n        self.parent[rb] = ra\n        self.size[ra] += self.size[rb]\n        self.count -= 1\n        return True\n',
      why: 'Union joins roots, ignores same-group pairs, and attaches the smaller tree under the larger.',
    },
    {
      type: 'debug',
      q: 'This should return the first edge that closes a cycle in an undirected graph, but it never finds one. Fix it.',
      starter: 'def first_cycle_edge(n, edges):\n    parent = list(range(n))\n    def find(x):\n        while parent[x] != x:\n            x = parent[x]\n        return x\n    for a, b in edges:\n        parent[a] = b\n        if find(a) == find(b):\n            return (a, b)\n    return None\n',
      tests: [
        { expr: 'first_cycle_edge(3, [(0, 1), (1, 2), (2, 0)])', want: '(2, 0)' },
        { expr: 'first_cycle_edge(3, [(0, 1), (1, 2)])', want: 'None' },
        { expr: 'first_cycle_edge(4, [(0, 1), (2, 3), (1, 3), (0, 2)])', want: '(0, 2)' },
      ],
      hint: 'Check whether the endpoints already share a root BEFORE linking them, and link the roots, not the endpoints.',
      solution: 'def first_cycle_edge(n, edges):\n    parent = list(range(n))\n    def find(x):\n        while parent[x] != x:\n            x = parent[x]\n        return x\n    for a, b in edges:\n        ra, rb = find(a), find(b)\n        if ra == rb:\n            return (a, b)\n        parent[ra] = rb\n    return None\n',
      why: 'The test must come first, or linking makes every pair look connected. Linking the roots keeps whole groups together.',
    },
  ],
};
