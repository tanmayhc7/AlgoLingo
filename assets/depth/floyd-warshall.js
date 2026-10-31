/* Interview depth: Floyd-Warshall. */
window.DEPTH = {
  thesis:
    'Floyd-Warshall computes shortest paths between all pairs of vertices with three nested loops. Round k asks whether routing through vertex k improves dist[i][j]. It is dynamic programming over "which vertices may be used as stops", works with negative edges, and detects negative cycles by a negative diagonal. O(V^3) time and O(V^2) space.',
  why: [
    ['All-pairs queries', 'Distance tables, transitive closure, "can A reach B", city-to-city matrices for small graphs.'],
    ['Negative edges, no heap', 'Handles negative weights (but not negative cycles) in about six lines of code.'],
    ['DP in disguise', 'The dist[k][i][j] recurrence and the in-place space trick are a classic DP interview topic.'],
    ['Tiny graphs in practice', 'For V up to a few hundred it beats running Dijkstra V times in simplicity.'],
  ],
  edges: [
    ['Loop order', 'k must be the outermost loop. i-j-k order gives wrong answers.'],
    ['INF overflow', 'Skip a pair when either dist[i][k] or dist[k][j] is INF, or use a large INF such as 1e9 so INF + INF still fits.'],
    ['Negative cycle', 'After the run, any dist[i][i] < 0 means a negative cycle through i. Distances through it are meaningless.'],
    ['Diagonal', 'Initialise dist[i][i] = 0. Parallel edges keep the minimum weight.'],
    ['Path reconstruction', 'Keep next[i][j] (first hop) and set next[i][j] = next[i][k] on each update, then follow hops.'],
    ['Transitive closure', 'Replace + and min with AND and OR on booleans to get reachability (Warshall).'],
  ],
  cost: [
    ['Time', 'O(V^3), always, whatever the edge count.'],
    ['Space', 'O(V^2) in place: dist[k] only reads row k and column k, which do not change during round k.'],
    ['V x Dijkstra', 'O(V (E + V) log V): better for large sparse graphs.'],
    ['Johnson', 'Bellman-Ford once to reweight, then Dijkstra from every vertex: sparse graphs with negative edges.'],
  ],
  internals: [
    ['Recurrence', 'd_k[i][j] = min(d_{k-1}[i][j], d_{k-1}[i][k] + d_{k-1}[k][j]). The shortest path either avoids vertex k or passes through it once.'],
    ['In-place safety', 'Row k and column k do not change in round k (d[k][k] = 0), so one 2-D array is enough.'],
    ['Why O(V^3)', 'V rounds x V^2 pairs, one constant-time check each.'],
    ['Invariant', 'After round k, dist[i][j] is the shortest path using only vertices 0..k as intermediate stops.'],
  ],
  qa: [
    { lvl: 'junior', q: 'What does Floyd-Warshall compute, and how fast?', a: 'The shortest distance between every pair of vertices, in O(V^3) time and O(V^2) space.', follow: [] },
    { lvl: 'mid', q: 'Why must k be the outer loop?', a: 'Round k must finish improving all pairs using stops 0..k before k + 1 is allowed. With k inside, a pair could be updated with distances that do not yet include the earlier stops, breaking the invariant.', follow: [['What if i is outermost?', 'Some answers come out too large, because dist[k][j] may not yet account for the intermediate stops.']] },
    { lvl: 'mid', q: 'How do you detect a negative cycle with it?', a: 'After the loops, check whether any dist[i][i] is negative. A negative value means you can leave i and return to it with negative total cost.', follow: [] },
    { lvl: 'senior', q: 'Floyd-Warshall, V x Dijkstra, or Johnson: when do you use each?', a: 'Floyd-Warshall for small or dense graphs, negative edges allowed and simplicity wanted. V x Dijkstra for large sparse graphs with non-negative weights. Johnson for large sparse graphs with negative edges: reweight with Bellman-Ford, then run Dijkstra from every vertex.', follow: [] },
    { lvl: 'senior', q: 'Compute reachability (transitive closure) of a directed graph.', a: 'Use Warshall: reach[i][j] = reach[i][j] or (reach[i][k] and reach[k][j]) with the same loop order. For many queries on big graphs, condense strongly connected components first, or use bitsets to cut the cost by a word-size factor.', follow: [] },
  ],
};
