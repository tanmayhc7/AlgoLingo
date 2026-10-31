/* Interview depth: Dijkstra. */
window.DEPTH = {
  thesis:
    'Dijkstra is a greedy algorithm whose correctness rests on one inequality: with non-negative weights, a path through a farther vertex cannot beat the closest unfinished vertex. That is why popping the minimum from a heap finalises it. Know the algorithm, the exact condition under which it fails, the complexity with a binary heap, and which alternative (BFS, 0-1 BFS, Bellman-Ford, A*, Floyd-Warshall) fits the case in front of you.',
  why: [
    ['Weighted shortest paths are everywhere', 'Routing, maps, network latency, flight costs, game movement. BFS is only correct when every edge costs the same.'],
    ['The greedy step is provable', 'When u is popped with distance d, any other route to u must leave the finished set through some unfinished vertex w with distance at least d, and then add non-negative weights, so it costs at least d.'],
    ['The heap makes it fast', 'A binary heap gives O((V + E) log V). With a Fibonacci heap O(E + V log V), but constants make binary heaps faster in practice.'],
    ['It generalises', 'Replace sum with other monotone combinations (max edge, product of probabilities as negative logs) and the same skeleton works. A* adds a heuristic to aim the search.'],
  ],
  edges: [
    ['Negative edge weights', 'Dijkstra can return wrong answers. Use Bellman-Ford. A negative cycle makes shortest paths undefined.'],
    ['Zero-weight edges', 'Fine for Dijkstra. Equal-distance ties are broken arbitrarily.'],
    ['Unreachable vertices', 'Their distance stays infinity. Return -1 or None explicitly, and never add to infinity in a language with fixed-width integers (C overflow).'],
    ['Stale heap entries', 'Without decrease-key you push duplicates. Skip entries whose popped distance exceeds the recorded one, otherwise you reprocess vertices and lose the complexity bound.'],
    ['Tuples with unorderable items', 'If two heap entries tie on distance, Python compares the next tuple element. Use `(d, counter, node)` or vertices that compare.'],
  ],
  cost: [
    ['binary heap, adjacency list', 'O((V + E) log V). Each edge may push one heap entry, so the heap has up to E entries and each operation costs log E, which is O(log V).'],
    ['array scan instead of a heap', 'O(V^2). Better for dense graphs where E is about V^2.'],
    ['BFS (unit weights)', 'O(V + E).'],
    ['0-1 BFS (weights 0 or 1)', 'O(V + E) with a deque: push zero-weight neighbours at the front.'],
    ['Bellman-Ford', 'O(V x E); handles negative weights and detects negative cycles.'],
    ['Floyd-Warshall', 'O(V^3) for all pairs; small graphs only.'],
  ],
  internals: [
    ['The invariant', 'At any time every finished vertex has its true shortest distance, and every unfinished vertex\'s tentative distance equals the best path that uses only finished vertices as intermediates. Relaxing the edges of a newly finished vertex maintains it.'],
    ['Lazy deletion instead of decrease-key', '`heapq` has no decrease-key. Pushing a fresh `(nd, v)` and ignoring the older one costs at most E extra entries and keeps the code simple. An indexed heap supports decrease-key at the price of a position map.'],
    ['Reconstructing the path', 'Store `parent[v] = u` whenever you improve `dist[v]`. After the run, walk from the target back to the source and reverse.'],
    ['Early exit', 'For a single target, stop when the target is popped. Its distance is already final.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Walk through Dijkstra\'s algorithm and state its complexity.',
      a: 'Keep `dist` with the source at 0 and a min-heap of `(distance, vertex)`. Repeatedly pop the smallest entry; if its distance is larger than the recorded one it is stale, skip it. Otherwise it is final: for each outgoing edge `(v, w)`, if `d + w` is less than `dist[v]`, update and push. Each vertex is finalised once and each edge relaxed once, with heap operations costing log, so O((V + E) log V).',
      follow: [
        ['Why is the popped vertex\'s distance final?', 'Any other path to it must pass through an unfinished vertex whose tentative distance is at least as large, and non-negative edges cannot reduce a path\'s cost.'],
        ['What if there are several shortest paths?', 'Dijkstra finds one distance; to count or enumerate paths keep a counter and add on ties (when `d + w == dist[v]`).'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Why does Dijkstra fail on negative edge weights, and what do you use instead?',
      a: 'It finalises a vertex when it is popped, assuming nothing can improve it later. A negative edge reached later can improve an already finalised vertex, but Dijkstra never revisits it, so the answer is wrong. Use Bellman-Ford: relax every edge V - 1 times (O(VE)); a further improvement on the V-th pass reveals a negative cycle. For DAGs, relax in topological order for O(V + E), which handles negative weights too.',
      follow: [
        ['Can you fix Dijkstra by adding a constant to every weight?', 'No. Paths with more edges are penalised more, which changes which path is shortest. Johnson\'s algorithm reweights correctly using potentials from Bellman-Ford.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Network delay time, cheapest flights within K stops, and path with minimum effort are all "shortest path" problems. What changes in each?',
      a: 'Network delay is plain Dijkstra, with the answer as the maximum distance (or -1 if some vertex is unreachable). Cheapest flights within K stops adds a constraint on edge count, so the state must be (vertex, stops used): run Dijkstra or BFS over that expanded state, or Bellman-Ford limited to K + 1 rounds, copying the distance array each round. Minimum effort path replaces the sum with the maximum edge along the path; the same skeleton works because that combination is monotone (a path\'s cost never decreases as you extend it), so popping the smallest remains correct. The skill is spotting the state and the combination rule.',
      follow: [
        ['Why can plain Dijkstra fail for K stops?', 'The cheapest path to a vertex might use too many stops, while a more expensive one with fewer stops is the one you need. A single distance per vertex hides that.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'A* versus Dijkstra: when and why?',
      a: 'A* orders the heap by `g + h`, the distance so far plus a heuristic estimate of the remaining distance to the goal. If the heuristic is admissible (never overestimates) it still finds an optimal path, and if it is also consistent (satisfies the triangle inequality) no vertex needs reopening. A good heuristic prunes vast areas: on a map, straight-line distance steers the search toward the target. With h = 0 it is exactly Dijkstra. Use A* for single-pair queries with a meaningful heuristic (maps, grids, puzzles) and Dijkstra when you need distances to many targets.',
      follow: [
        ['What happens with an inadmissible heuristic?', 'It may return a suboptimal path, but faster. Some games accept that trade.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Design route planning for a continental road network with hundreds of millions of edges and millisecond query times.',
      a: 'Plain Dijkstra visits too much, even with A*. The standard answer is preprocessing: contraction hierarchies (order vertices by importance, add shortcut edges when removing a vertex, then answer queries with a bidirectional search that only goes "upward" in the hierarchy), or hub labels for even faster lookups at higher memory. Live traffic changes edge weights, so you need customisable variants (customisable route planning, or CH with weight updates in a separate metric layer) and a way to publish new weights without rebuilding everything. Partition the graph for memory, keep it in compact CSR arrays for cache locality, and keep a fallback of A* with landmarks (ALT) when preprocessing is stale. I would define the latency and freshness targets first, because they determine how much preprocessing is acceptable.',
      follow: [
        ['Why is bidirectional search faster?', 'Two searches of radius r/2 explore far less area than one of radius r, since the area grows with the square of the radius in road-like graphs.'],
      ],
    },
  ],
};
