/* Chapter 12 quiz: Graphs. See assets/quiz.js for the question format. */
window.QUIZ = {
  chapter: 12,
  title: 'Graphs',
  lede: 'Representations, BFS and DFS, components and topological order.',
  questions: [
    {
      type: 'mcq',
      q: 'An <b>undirected</b> graph has 50 vertices and 200 edges, stored as adjacency lists. How many entries do the lists hold in total?',
      options: ['200', '400', '2,500'],
      answer: 1,
      why: 'Each undirected edge is stored in the lists of both endpoints, so 2 x 200 = 400.',
    },
    {
      type: 'mcq',
      q: 'You need the minimum number of moves between two states in an unweighted graph. Which traversal, and why?',
      options: ['DFS, because it goes deepest first', 'BFS, because it visits vertices in order of distance', 'Either; both always find the shortest path'],
      answer: 1,
      why: 'BFS expands in rings of increasing distance, so the first time it reaches a vertex is along a shortest path. DFS can reach it first by a long path.',
    },
    {
      type: 'mcq',
      q: 'Kahn\'s algorithm outputs 6 vertices from a directed graph with 9. What does that tell you?',
      options: ['The graph has a cycle', 'The graph is disconnected', 'The output is a valid order for all 9'],
      answer: 0,
      why: 'Vertices on a cycle never reach in-degree 0, so they are never output. A short result means a cycle blocked some vertices.',
    },
    {
      type: 'complete',
      q: 'Fill in the blanks so <code>bfs_dist(g, s)</code> returns a dict of the shortest distance (in edges) from <code>s</code> to every reachable vertex.',
      starter: 'from collections import deque\n\ndef bfs_dist(g, s):\n    dist = {s: 0}\n    q = deque([s])\n    while q:\n        u = q.___()\n        for v in g[u]:\n            if v not in dist:\n                dist[v] = ___\n                q.append(v)\n    return dist\n',
      tests: [
        { expr: 'bfs_dist({0: [1, 2], 1: [0, 3], 2: [0], 3: [1]}, 0)', want: '{0: 0, 1: 1, 2: 1, 3: 2}' },
        { expr: 'bfs_dist({0: [], 1: []}, 0)', want: '{0: 0}' },
      ],
      hint: 'Take from the left of the deque. A new vertex is one edge farther than the vertex it was found from.',
      solution: 'from collections import deque\n\ndef bfs_dist(g, s):\n    dist = {s: 0}\n    q = deque([s])\n    while q:\n        u = q.popleft()\n        for v in g[u]:\n            if v not in dist:\n                dist[v] = dist[u] + 1\n                q.append(v)\n    return dist\n',
      why: 'The dist dict is both the visited set and the answer. Marking on enqueue keeps each vertex in the queue only once.',
    },
    {
      type: 'write',
      q: 'Write <code>count_components(n, edges)</code>: vertices are <code>0..n-1</code>, <code>edges</code> is a list of undirected pairs. Return the number of connected components.',
      starter: 'def count_components(n, edges):\n    # your code\n',
      tests: [
        { expr: 'count_components(5, [(0, 1), (1, 2), (3, 4)])', want: '2' },
        { expr: 'count_components(4, [])', want: '4' },
        { expr: 'count_components(3, [(0, 1), (1, 2), (0, 2)])', want: '1' },
        { expr: 'count_components(0, [])', want: '0' },
      ],
      hint: 'Build adjacency lists for all n vertices, then start a traversal from every unvisited vertex and count the starts.',
      solution: 'def count_components(n, edges):\n    g = [[] for _ in range(n)]\n    for u, v in edges:\n        g[u].append(v)\n        g[v].append(u)\n    seen = set()\n    count = 0\n    for s in range(n):\n        if s in seen:\n            continue\n        count += 1\n        stack = [s]\n        seen.add(s)\n        while stack:\n            u = stack.pop()\n            for v in g[u]:\n                if v not in seen:\n                    seen.add(v)\n                    stack.append(v)\n    return count\n',
      why: 'Every vertex gets a list (so isolated ones count), edges go both ways, and the outer loop starts a fill only from unvisited vertices.',
    },
    {
      type: 'debug',
      q: 'This should return a valid course order or <code>[]</code> if impossible, but it returns a partial order on cyclic input. Fix it.',
      starter: 'from collections import deque\n\ndef course_order(n, prereqs):\n    g = [[] for _ in range(n)]\n    indeg = [0] * n\n    for a, b in prereqs:\n        g[b].append(a)\n        indeg[a] += 1\n    q = deque(i for i in range(n) if indeg[i] == 0)\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in g[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n    return order\n',
      tests: [
        { expr: 'course_order(2, [(1, 0)])', want: '[0, 1]' },
        { expr: 'course_order(2, [(1, 0), (0, 1)])', want: '[]' },
        { expr: 'course_order(3, [(1, 0), (2, 1), (1, 2)])', want: '[]' },
        { expr: 'course_order(1, [])', want: '[0]' },
      ],
      hint: 'A cycle leaves some vertices out of the output. Compare the length of the order with n before returning it.',
      solution: 'from collections import deque\n\ndef course_order(n, prereqs):\n    g = [[] for _ in range(n)]\n    indeg = [0] * n\n    for a, b in prereqs:\n        g[b].append(a)\n        indeg[a] += 1\n    q = deque(i for i in range(n) if indeg[i] == 0)\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in g[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n    return order if len(order) == n else []\n',
      why: 'Vertices on a cycle are never output, so a complete order has exactly n entries.',
    },
  ],
};
