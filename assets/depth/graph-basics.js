/* Interview depth: Graphs and adjacency lists. */
window.DEPTH = {
  thesis:
    'A graph is the most general structure you will be asked about: a tree is a graph with no cycles, a linked list is a graph with out-degree one. Most graph problems are won or lost on two early decisions: how you model the problem (what are the vertices, what are the edges, directed or not) and how you represent it. The representation sets the cost of every later operation.',
  why: [
    ['Modelling is the hard part', 'Word ladder, course scheduling, islands in a grid and currency arbitrage are all graph problems once you decide what a vertex is. Say it aloud: "vertices are cells, edges join neighbouring land cells".'],
    ['Adjacency list for sparse graphs', 'Memory O(V + E), iterating neighbours costs only their degree. Real graphs (roads, social networks, dependencies) are sparse: E is close to V, not V squared.'],
    ['Adjacency matrix for dense graphs or edge tests', 'O(V^2) memory but O(1) "is there an edge u-v". Good when V is small (a few thousand), the graph is dense, or you run Floyd-Warshall.'],
    ['Implicit graphs need no storage', 'In a grid, neighbours are computed from coordinates; in word ladder, from changing one letter. You never build the graph, only a neighbours function.'],
  ],
  edges: [
    ['Disconnected graphs', 'A traversal from one vertex reaches only its component. Loop over all vertices if the question needs everything.'],
    ['Self loops and parallel edges', 'Decide whether input can contain them. A self loop makes a vertex its own neighbour; a multigraph stores duplicate entries.'],
    ['Vertices with no edges', 'If you build the graph only from the edge list, isolated vertices are missing. Initialise a list for every vertex 0..n-1.'],
    ['Directed versus undirected', 'The usual bug is adding only one direction for an undirected edge, or both for a directed one.'],
    ['Labels versus indices', 'Vertices labelled by strings need a dict. Vertices 0..n-1 can use a list, which is faster and smaller.'],
  ],
  cost: [
    ['adjacency list: memory', 'O(V + E). Undirected edges appear twice.'],
    ['adjacency list: iterate neighbours of u', 'O(deg(u)).'],
    ['adjacency list: test edge u-v', 'O(deg(u)); O(1) average if neighbours are sets.'],
    ['adjacency matrix: memory', 'O(V^2) regardless of edges; edge test O(1); neighbours O(V).'],
    ['edge list', 'O(E) memory. Simple input format and good for Kruskal\'s or Bellman-Ford, poor for traversal.'],
  ],
  internals: [
    ['A dict of lists in CPython', 'Each list is a separate heap array that overallocates. For millions of small lists the pointer and header overhead (around 56 bytes per empty list) dominates. Compressed sparse row (CSR) stores all neighbours in one flat array plus an offsets array, which is how big graph libraries get cache-friendly traversal.'],
    ['Grid as a graph', 'Index a cell by r * cols + c. Neighbours are the four (or eight) in-bounds offsets. A direction table `[(1,0),(-1,0),(0,1),(0,-1)]` keeps the loop short and is how almost every grid problem is written.'],
    ['Why `[[]] * n` is a classic bug', 'It makes n references to the same list, so appending to one row appends to all. Use `[[] for _ in range(n)]` or a defaultdict.'],
    ['Degree sum identity', 'The sum of degrees is 2E in an undirected graph, and the sums of in-degrees and out-degrees each equal E in a directed graph. It is why traversals are O(V + E): scanning every list touches every edge a constant number of times.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Compare an adjacency list and an adjacency matrix. Which do you choose by default?',
      a: 'An adjacency list stores for each vertex its neighbours: O(V + E) memory, neighbour iteration costs the degree, an edge test costs the degree unless neighbours are kept in sets. A matrix is a V x V table: O(V^2) memory, O(1) edge test, O(V) neighbour iteration. Default to the list because real graphs are sparse and traversals iterate neighbours. Choose the matrix when the graph is dense, V is small, or you need constant-time edge lookups (Floyd-Warshall, adjacency checks inside tight loops).',
      follow: [
        ['How many entries does an undirected graph with E edges put in the lists?', '2E, since each edge is stored at both ends. A directed graph stores E.'],
        ['What if you need "is there an edge" and iteration both?', 'Keep neighbour sets instead of lists: O(1) average edge test and iteration, at some memory cost.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'How would you turn "number of islands" in a grid into a graph problem?',
      a: 'Each land cell is a vertex; two vertices are joined if the cells are adjacent horizontally or vertically. The graph is implicit: from (r, c) the neighbours are the in-bounds land cells at four offsets. The answer is the number of connected components, found by looping over all cells and flood filling (BFS or DFS) from each unvisited land cell. O(R x C) time and space. Marking land as visited in place avoids a separate set but mutates the input, so ask first.',
      follow: [
        ['What changes if diagonals count?', 'Add four more offsets to the neighbour table. Nothing else changes.'],
        ['What if the grid is huge and does not fit in memory?', 'Process it in strips with a union-find over the boundaries, or stream it, merging component labels row by row.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'A directed graph has 10^7 vertices and 5 x 10^7 edges. How do you store it, and what would you worry about?',
      a: 'A dict of Python lists would cost many gigabytes in object overhead. Use a compressed sparse row layout: one array `targets` of length E and an array `offsets` of length V + 1, so the neighbours of u are `targets[offsets[u]:offsets[u+1]]`. With 32-bit ints that is about (5 x 10^7 + 10^7) x 4 bytes, roughly 240 MB, contiguous and cache-friendly. Build it from an edge list with a counting sort by source. I would also ask whether the graph is static, since CSR is expensive to update, whether I need in-edges (store a reversed copy), and whether it fits in memory or needs a partitioned or out-of-core approach.',
      follow: [
        ['How do you build CSR in linear time?', 'Count the out-degree of each vertex, prefix-sum the counts into offsets, then place each edge at its source\'s next free slot. Two passes over the edges.'],
        ['What about updates?', 'Keep a small mutable delta structure next to the immutable CSR and merge periodically, like an LSM tree.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Detect whether an undirected graph is a tree.',
      a: 'A graph with V vertices is a tree if and only if it is connected and has exactly V - 1 edges (equivalently: connected and acyclic). Check the edge count first, which is O(1) if you have the edge list, then run one traversal from any vertex and confirm that it reaches all V vertices. Total O(V + E). For the acyclic version, track the parent during DFS and flag any visited neighbour that is not the parent. With union-find you can do it in one pass over the edges: if an edge joins two vertices already in the same set, there is a cycle.',
      follow: [
        ['Why is V - 1 edges plus connected enough?', 'A connected graph needs at least V - 1 edges to connect V vertices; any extra edge would close a cycle, so exactly V - 1 means no spare edge, hence no cycle.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'You are asked to model a company\'s service dependencies and answer "what breaks if service X fails" and "is there a circular dependency". Design it.',
      a: 'Vertices are services, a directed edge A -> B means A depends on B. "What breaks if X fails" is the set of vertices that can reach X, found with BFS on the reversed graph, so I store both directions (or build the reverse index). Circular dependencies are cycles, detected with a topological sort (a short output means a cycle) and reported with the strongly connected components (Tarjan or Kosaraju), which name the offending groups. In production the data changes: ingest from service manifests or tracing, version the graph, recompute components incrementally or on a schedule, and expose blast radius with depth limits and weighting by criticality. I would also decide how to handle optional versus hard dependencies, since not every edge propagates failure.',
      follow: [
        ['Why SCCs rather than just "has a cycle"?', 'A bare boolean is useless to the people who must fix it. SCCs list each tangled group, and collapsing them yields a DAG you can order for rollouts.'],
      ],
    },
  ],
};
