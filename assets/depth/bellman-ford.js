/* Interview depth: Bellman-Ford. */
window.DEPTH = {
  thesis:
    'Bellman-Ford finds single-source shortest paths even when edge weights are negative. It relaxes every edge V - 1 times because a shortest path has at most V - 1 edges. A further pass that still improves something proves a reachable negative cycle. It is O(V x E), slower than Dijkstra, so you choose it only when negative edges are possible or when you must detect negative cycles.',
  why: [
    ['Negative weights', 'Dijkstra can give wrong answers with negative edges. Bellman-Ford is the standard safe choice.'],
    ['Arbitrage and constraints', 'Currency arbitrage is a negative cycle after taking -log of rates; difference constraints (x_j - x_i <= c) reduce to shortest paths.'],
    ['Distributed routing', 'The distance-vector idea behind RIP is Bellman-Ford: each node relaxes using neighbours\' distances.'],
    ['Simple to write', 'Three nested loops, no heap, and the proof is short.'],
  ],
  edges: [
    ['Negative cycle', 'Shortest paths are undefined for vertices reachable from it. Report it; do not return the distances.'],
    ['Unreachable vertices', 'Keep INF and skip edges whose source is INF, otherwise INF + negative looks like a real distance (and overflows in C).'],
    ['Undirected negative edge', 'An undirected edge with negative weight is itself a negative cycle (go back and forth).'],
    ['Early exit', 'If a whole pass changes nothing, stop. Worst case is still V - 1 passes.'],
    ['Cycle not reachable from source', 'It is not detected from that source. Start from a virtual source with 0-weight edges to all vertices to detect any negative cycle.'],
    ['Path reconstruction', 'Record parent[v] = u on each update; to extract the cycle, walk back V steps from a vertex that improved in the extra pass.'],
  ],
  cost: [
    ['Time', 'O(V x E) worst case; O(E) when it converges after one pass.'],
    ['Space', 'O(V) for distances (and parents).'],
    ['Dijkstra', 'O((V + E) log V) but needs non-negative weights.'],
    ['SPFA', 'A queue-based variant: often fast in practice, same worst case.'],
  ],
  internals: [
    ['Why V - 1 passes', 'After pass k, every shortest path using at most k edges has the correct distance. Simple paths have at most V - 1 edges.'],
    ['Relaxation', 'if dist[u] + w < dist[v]: dist[v] = dist[u] + w. Distances only ever decrease and never go below the true value.'],
    ['Negative cycle test', 'If any edge can still be relaxed after V - 1 passes, a negative cycle is reachable.'],
    ['Edge order', 'A lucky order finishes in fewer passes; an unlucky one needs all V - 1.'],
  ],
  qa: [
    {
      lvl: 'junior',
      q: 'Why does Dijkstra fail with negative edges but Bellman-Ford does not?',
      a: 'Dijkstra finalises a vertex when popped, assuming no later path can be shorter. A negative edge can make a later path shorter. Bellman-Ford never finalises early; it keeps relaxing all edges.',
      follow: [],
    },
    {
      lvl: 'mid',
      q: 'Why exactly V - 1 passes?',
      a: 'A shortest path with no repeated vertex has at most V - 1 edges. Pass k fixes all shortest paths of k edges, so V - 1 passes fix all of them.',
      follow: [['Can it stop sooner?', 'Yes, as soon as a pass makes no change.']],
    },
    {
      lvl: 'mid',
      q: 'How do you detect a negative cycle?',
      a: 'Run one more pass after V - 1. If any edge still relaxes, a negative cycle is reachable from the source.',
      follow: [['How do you print the cycle?', 'Keep parent pointers, start at a vertex relaxed in the extra pass, step back V times to land inside the cycle, then follow parents until you return to that vertex.']],
    },
    {
      lvl: 'senior',
      q: 'How would you detect currency arbitrage?',
      a: 'Make each currency a vertex and each rate r an edge with weight -log(r). A cycle with product of rates > 1 has a negative total weight. Run Bellman-Ford from a virtual source connected to all vertices; a negative cycle means arbitrage. Mind floating point error: use a small epsilon.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'When would you pick Bellman-Ford, Dijkstra, or Floyd-Warshall?',
      a: 'Dijkstra for single source with non-negative weights. Bellman-Ford for single source with negative edges or when cycle detection is needed. Floyd-Warshall for all pairs on small dense graphs (O(V^3)). For all pairs on sparse graphs with negative edges, Johnson\'s algorithm combines Bellman-Ford with Dijkstra.',
      follow: [],
    },
  ],
};
