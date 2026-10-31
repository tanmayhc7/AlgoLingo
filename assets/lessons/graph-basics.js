/* Lesson data: Graph basics (structure mode). Adjacency lists, undirected and directed. */
(function () {
  var P = { 0: [150, 120], 1: [400, 60], 2: [400, 200], 3: [650, 60], 4: [650, 200], 5: [850, 130] };
  var EDGES = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 5], [4, 5]];
  var ROW_Y = 300;
  function rowY(i) { return ROW_Y + i * 46; }
  function cx(k) { return 150 + k * 72; }

  function verts() {
    var ops = [];
    for (var i = 0; i < 6; i++) ops.push(['node', 'v' + i, String(i), P[i][0], P[i][1], 'circle']);
    return ops;
  }
  function rows() {
    var ops = [];
    for (var i = 0; i < 6; i++) { ops.push(['node', 'r' + i, String(i), 70, rowY(i), 'cell'], ['tag', 'r' + i, 'mark']); }
    return ops;
  }

  var build = [{ pl: -1, cl: -1, say: 'A graph is a set of vertices joined by edges. Six vertices, no edges yet. The usual way to store one is an adjacency list: for each vertex, the list of its neighbours. Here, each row is one vertex.', csay: 'An array of lists, one per vertex.', h: 600, ds: verts().concat(rows()) }];
  var used = {};
  EDGES.forEach(function (e, n) {
    var u = e[0], v = e[1];
    used[u] = (used[u] || 0);
    used[v] = (used[v] || 0);
    var cu = used[u]++, cv = used[v]++;
    build.push({
      pl: n === 0 ? 2 : 3, cl: n === 0 ? 2 : 3, h: 600,
      say: 'add_edge(' + u + ', ' + v + '): the edge is undirected, so each end is a neighbour of the other. Append ' + v + ' to the list of ' + u + ' and ' + u + ' to the list of ' + v + '.',
      csay: 'Two pushes: ' + u + ' -> ' + v + ' and ' + v + ' -> ' + u + '.',
      ds: [['edge', 'v' + u, 'v' + v, 'u' + v], ['node', 'c' + u + '_' + cu, String(v), cx(cu), rowY(u), 'cell'], ['node', 'c' + v + '_' + cv, String(u), cx(cv), rowY(v), 'cell'], ['hot', 'v' + u, 'v' + v]],
    });
  });
  build.push({ pl: 3, cl: 3, h: 600, say: 'Seven edges, but 14 list entries: every undirected edge is stored twice. Total memory is O(V + E). The degree of a vertex is just the length of its list, so vertex 1 (neighbours 0, 2, 3) has degree 3.', csay: 'O(V + E) memory.', ds: [['note', 'v1', 'degree 3']] });

  /* directed */
  var DP = { 0: [150, 120], 1: [400, 60], 2: [400, 200], 3: [650, 120], 4: [850, 120] };
  var DEDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
  var directed = [{ pl: -1, cl: -1, h: 520, say: 'In a directed graph an edge has a direction, drawn as an arrow: u -> v means you can go from u to v but not back. Think of tasks and prerequisites, or links between web pages.', csay: 'Same structure.', ds: [['node', 'w0', '0', DP[0][0], DP[0][1], 'circle'], ['node', 'w1', '1', DP[1][0], DP[1][1], 'circle'], ['node', 'w2', '2', DP[2][0], DP[2][1], 'circle'], ['node', 'w3', '3', DP[3][0], DP[3][1], 'circle'], ['node', 'w4', '4', DP[4][0], DP[4][1], 'circle']].concat((function () { var o = []; for (var i = 0; i < 5; i++) { o.push(['node', 'q' + i, String(i), 70, 300 + i * 46, 'cell'], ['tag', 'q' + i, 'mark']); } return o; })()) }];
  var k = {};
  DEDGES.forEach(function (e, n) {
    var u = e[0], v = e[1];
    k[u] = (k[u] || 0);
    var c = k[u]++;
    directed.push({ pl: 2, cl: 2, h: 520, say: 'add_edge(' + u + ', ' + v + '): append ' + v + ' to the list of ' + u + ' only. One entry per edge, so memory is exactly E entries plus V lists.', csay: 'One push: ' + u + ' -> ' + v + '.', ds: [['edge', 'w' + u, 'w' + v, 'e' + v], ['node', 'd' + u + '_' + c, String(v), cx(c), 300 + u * 46, 'cell'], ['hot', 'w' + u, 'w' + v]] });
  });
  directed.push({ pl: 2, cl: 2, h: 520, say: 'Vertex 3 appears as a target twice (from 1 and 2) but only once as a source. The list tells you where you can go from a vertex (out-neighbours). To find who points at a vertex (in-neighbours) you would have to scan every list, or keep a second reversed graph.', csay: 'Out-neighbours are cheap, in-neighbours are not.', ds: [['tag', 'w3', 'mark'], ['hot', 'w3']] });

  window.LESSON = {
    id: 'graph-basics',
    mode: 'ds',
    title: 'Graphs and adjacency lists',
    lede:
      'A graph is vertices and edges: networks, maps, dependencies, social links. The first decision is the representation. An adjacency list (a dict or array of neighbour lists) uses O(V + E) memory and lists the neighbours of a vertex in time proportional to its degree. An adjacency matrix uses O(V^2) and answers "is there an edge u-v" in O(1). Most interview graphs are sparse, so the list is the default.',
    scenes: [
      { id: 'build', title: 'Undirected graph', blurb: 'Each edge goes in both neighbour lists.', trap: 'Forgetting the second append in an undirected graph. The traversal then works from one end of the edge and silently fails from the other.', pyCode: ['g = {i: [] for i in range(6)}', 'def add_edge(u, v):', '    g[u].append(v)', '    g[v].append(u)   # undirected: both ways'], cCode: ['Node *adj[6] = {0};', 'void add_edge(int u, int v) {', '    push(&adj[u], v);', '    push(&adj[v], u);   /* both ways */', '}'], predict: { q: 'An undirected graph has 100 vertices and 300 edges. How many entries do all the adjacency lists hold together?', options: ['300', '600', '10,000'], answer: 1, why: 'Each undirected edge appears in two lists, so 2 x 300 = 600.' }, steps: build },
      { id: 'directed', title: 'Directed graph', blurb: 'An edge u -> v is stored once, in the list of u.', trap: 'Mixing up out-neighbours and in-neighbours. The list answers "where can I go from here"; "who points at me" needs a reversed copy of the graph.', pyCode: ['g = {i: [] for i in range(5)}', 'def add_edge(u, v):', '    g[u].append(v)   # one direction only'], cCode: ['Node *adj[5] = {0};', 'void add_edge(int u, int v) {', '    push(&adj[u], v);   /* one direction only */', '}'], predict: { q: 'In a directed graph, how many list entries does an edge produce?', options: ['One', 'Two', 'Depends on the degree'], answer: 0, why: 'u -> v appears once, in the list of u. Undirected edges produce two entries.' }, steps: directed },
    ],
    builtins: [
      ['collections.defaultdict(list)', 'g[u].append(v) without checking whether u exists first.'],
      ['{i: [] for i in range(n)}', 'A dict of empty neighbour lists for vertices 0..n-1.'],
      ['[[] for _ in range(n)]', 'List of lists, indexed by vertex. Never write [[]] * n: every row is the same list.'],
      ['len(g[u])', 'Degree of u (out-degree for a directed graph).'],
      ['sum(map(len, g.values()))', 'Total list entries: 2E undirected, E directed.'],
      ['v in g[u]', 'Edge test, O(degree). Use a set of neighbours for O(1).'],
    ],
  };
})();
