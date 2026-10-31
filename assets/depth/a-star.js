/* Interview depth: A* search. */
window.DEPTH = {
  thesis:
    'A* finds a shortest path from a start to a goal by expanding the open node with the smallest f = g + h, where g is the cost so far and h estimates the cost to go. If h never overestimates (admissible), the first time the goal is popped the path is optimal. A good h prunes most of the graph; h = 0 turns A* into Dijkstra.',
  why: [
    ['Point-to-point search', 'Maps, game pathfinding and robot planning care about one goal, not all vertices.'],
    ['Heuristics as design', 'Interviewers ask how to choose h: Manhattan, Chebyshev, Euclidean, or landmark distances.'],
    ['Dijkstra generalised', 'Shows you understand priority-queue search and why correctness depends on the order of expansion.'],
    ['Puzzle solving', 'Sliding puzzles and word ladders use A* with problem-specific h.'],
  ],
  edges: [
    ['Inadmissible h', 'If h can overestimate, A* may return a longer path. Keep h at or below the true remaining cost.'],
    ['Consistency', 'h(a) <= cost(a, b) + h(b). With it, each node is expanded at most once and the closed set is safe.'],
    ['Stale heap entries', 'Pushing duplicates is simpler than decrease-key. Skip a popped entry when its cost is worse than g[node].'],
    ['Ties on f', 'Break ties by larger g (smaller h) to reach the goal sooner.'],
    ['Unreachable goal', 'The open set empties: return "no path". A* can then expand the whole reachable graph.'],
    ['Diagonal moves', 'Use Chebyshev or octile distance, not Manhattan, or h overestimates.'],
  ],
  cost: [
    ['Worst case', 'Same as Dijkstra: O(E log V). A bad h gives no savings.'],
    ['Good h', 'Expands far fewer nodes; time depends on heuristic quality, not a simple formula.'],
    ['Memory', 'O(V) open and closed sets: the usual limit. IDA* trades time for O(depth) memory.'],
    ['Greedy best-first', 'Uses only h: fast but not optimal.'],
  ],
  internals: [
    ['f = g + h', 'g is exact so far; h is an optimistic guess. The heap orders by f.'],
    ['Why optimal', 'When the goal is popped with f = g, every other open node has f >= g, and since h is optimistic none can lead to a cheaper path.'],
    ['Special cases', 'h = 0: Dijkstra. h exact: walks straight to the goal.'],
    ['Data structures', 'Heap for the open set, dictionary for g, set for closed nodes.'],
  ],
  qa: [
    { lvl: 'junior', q: 'How is A* different from Dijkstra?', a: 'Dijkstra orders by g (cost so far). A* orders by g + h, adding a heuristic estimate of the remaining cost, so it explores toward the goal.', follow: [] },
    { lvl: 'mid', q: 'What makes a heuristic admissible, and why does it matter?', a: 'It never overestimates the true remaining cost. Then the first time the goal is popped its path is optimal; an overestimate could hide a cheaper path behind an inflated f.', follow: [['Give an admissible h for a grid with 4-direction moves.', 'Manhattan distance.']] },
    { lvl: 'mid', q: 'What happens with h = 0? With a perfect h?', a: 'h = 0 is Dijkstra (explores everything within the goal distance). A perfect h makes A* expand only nodes on a shortest path.', follow: [] },
    { lvl: 'senior', q: 'Admissible versus consistent: what changes in the implementation?', a: 'With a consistent h, f never decreases along a path, so a node is final when first expanded and a closed set is safe. With only admissible h you must allow re-opening nodes whose g improves.', follow: [] },
    { lvl: 'senior', q: 'A* uses too much memory on a huge map. Options?', a: 'IDA* (depth-first with an f limit, O(depth) memory), weighted A* (f = g + w h for speed at bounded suboptimality), bidirectional search, hierarchical pathfinding, or landmark heuristics (ALT) for road networks.', follow: [] },
  ],
};
