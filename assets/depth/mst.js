/* Interview depth: minimum spanning trees. */
window.DEPTH = {
  thesis:
    'A minimum spanning tree connects all V vertices of a weighted undirected graph with V - 1 edges of least total weight. Both classic algorithms are greedy and rest on the cut property: the cheapest edge crossing any cut belongs to some MST. Kruskal sorts edges and uses union-find to refuse cycles; Prim grows one tree outward with a heap, like Dijkstra but keyed on edge weight, not path length.',
  why: [
    ['Network design', 'Cabling, pipelines, road or fibre layouts: connect everything for the least cost.'],
    ['Clustering', 'Cutting the k - 1 heaviest MST edges gives single-linkage clusters.'],
    ['Approximation algorithms', 'The MST gives a 2-approximation for the metric travelling salesman problem.'],
    ['Interview staple', 'Union-find and heap-based graph growth are tested constantly; "connect all points at minimum cost" is a favourite.'],
  ],
  edges: [
    ['Disconnected graph', 'There is no spanning tree, only a spanning forest. Kruskal ends with fewer than V - 1 edges; check the count.'],
    ['Equal weights', 'The MST may not be unique, but its total weight is. Tests should compare the total, not the edge list.'],
    ['Negative weights', 'Both algorithms still work, since only the order of weights matters.'],
    ['Directed graphs', 'MST is for undirected graphs. The directed version (minimum arborescence) needs Chu-Liu/Edmonds.'],
    ['Stale heap entries in Prim', 'With a lazy heap you may pop an edge to a vertex that is already in the tree. Skip it.'],
    ['Points in the plane', 'Do not build all n^2 edges unless n is small; use Prim in O(n^2) with an array, or a Delaunay-based approach.'],
  ],
  cost: [
    ['Kruskal', 'O(E log E) for the sort, plus near-constant union-find work. Space O(V + E).'],
    ['Prim with a binary heap', 'O(E log V). Space O(V + E).'],
    ['Prim with an array', 'O(V^2): best for dense graphs, no heap needed.'],
    ['Union-find', 'With path compression and union by rank each operation is O(alpha(n)), effectively constant.'],
  ],
  internals: [
    ['Cut property', 'For any partition of the vertices, the lightest edge crossing it is in some MST. Prim applies it to (tree, rest); Kruskal applies it implicitly.'],
    ['Cycle property', 'The heaviest edge on any cycle is not needed. That is exactly the edge Kruskal skips.'],
    ['Union-find', 'parent[] array; find follows parents to the root with path compression; union links two roots, by size or rank.'],
    ['Prim vs Dijkstra', 'Same loop and heap. Dijkstra pushes dist[u] + w; Prim pushes just w.'],
  ],
  qa: [
    {
      lvl: 'junior',
      q: 'What is a minimum spanning tree?',
      a: 'A subset of edges that connects every vertex, contains no cycle (so exactly V - 1 edges), and has the smallest possible total weight.',
      follow: [['Is it unique?', 'Not if edge weights repeat, but the total weight is always the same.']],
    },
    {
      lvl: 'mid',
      q: 'Explain Kruskal and why union-find is needed.',
      a: 'Sort edges by weight. Go through them; take an edge if its endpoints are in different components, and merge the components. Union-find answers "same component?" and merges in almost constant time; without it each cycle check would cost a graph search.',
      follow: [['What do you do when you have V - 1 edges?', 'Stop early: the tree is complete.']],
    },
    {
      lvl: 'mid',
      q: 'Kruskal or Prim: how do you choose?',
      a: 'Kruskal is simple with an edge list and good for sparse graphs. Prim with a heap suits adjacency lists and, with an array version, dense graphs (O(V^2)). Both give the same total weight.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Prove that the greedy choice in Prim is safe.',
      a: 'Take the cut (tree so far, remaining vertices). Let e be the lightest crossing edge. If some MST T lacks e, adding e to T creates a cycle that crosses the cut at another edge f with weight >= e. Swapping f for e gives a spanning tree no heavier than T, so an MST containing e exists. Repeating this builds a full MST.',
      follow: [['Where does it break with directed graphs?', 'The exchange argument needs undirected cycles; direction changes reachability, so a different algorithm is required.']],
    },
    {
      lvl: 'senior',
      q: 'How would you find the second-best MST, or check whether an edge is in every MST?',
      a: 'For the second-best: for each non-tree edge, add it to the MST, remove the heaviest edge on the resulting cycle, and take the cheapest result (use binary lifting for max-on-path). An edge is in every MST if it is the unique lightest edge across some cut, which can be tested by comparing with the path maximum between its endpoints in an MST.',
      follow: [],
    },
  ],
};
