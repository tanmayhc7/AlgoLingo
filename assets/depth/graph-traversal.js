/* Interview depth: BFS, DFS and components. */
window.DEPTH = {
  thesis:
    'BFS and DFS are the same loop with a different container. Take the next vertex from a queue and you explore by distance; take it from a stack and you explore by depth. Choose by what the question needs: shortest path in edges means BFS, anything about structure, ordering, cycles or exhaustive search means DFS. Both are O(V + E) provided a visited set stops you from processing a vertex twice.',
  why: [
    ['BFS finds shortest paths in unweighted graphs', 'It visits vertices in nondecreasing distance, so the first time it reaches a vertex is along a shortest path. This is the correct tool for word ladder, minimum moves, nearest exit and similar.'],
    ['DFS gives structure', 'Discovery and finish times show cycles, bridges, articulation points, topological order and strongly connected components. They all rest on the nesting of recursive calls.'],
    ['Both are O(V + E)', 'Every vertex is expanded once, every edge examined once (twice if undirected). The visited set is what bounds the work.'],
    ['Multi-source BFS', 'Start with several vertices in the queue at distance 0 to get the distance to the nearest of many sources in one pass (rotting oranges, walls and gates).'],
  ],
  edges: [
    ['Marking visited too late', 'Marking on dequeue lets a vertex be enqueued once per incoming edge. The result is still correct but the queue can grow to O(E) and the run time suffers.'],
    ['Recursion depth', 'Python\'s default limit is about 1000. A path-shaped graph or a 1000 x 1000 grid DFS will crash. Use an explicit stack.'],
    ['Cycles in undirected graphs', 'In DFS, every neighbour is visited except the parent; seeing another visited vertex means a cycle. In a directed graph you must distinguish "on the current path" from "finished".'],
    ['Weighted edges', 'BFS counts edges, not weight. With non-uniform weights use Dijkstra; with weights 0 or 1 a deque (0-1 BFS) works.'],
    ['Grid bounds', 'Check the bounds before indexing. Negative indices in Python wrap around silently instead of failing.'],
  ],
  cost: [
    ['BFS / DFS time', 'O(V + E) with an adjacency list; O(V^2) with a matrix.'],
    ['BFS space', 'O(V): the queue can hold a whole level, often the widest part of the graph.'],
    ['DFS space', 'O(V) worst case for the stack or recursion; O(depth) in practice on shallow graphs.'],
    ['Components', 'O(V + E) in total, because the outer loop skips visited vertices.'],
    ['Shortest path reconstruction', 'Store a parent per vertex, then walk back from the target: O(path length).'],
  ],
  internals: [
    ['Why BFS gives distances', 'The queue always holds vertices at distance d followed by vertices at distance d + 1, never anything farther. Induction on d: when a vertex at distance d is dequeued, all vertices at distance d + 1 reachable from it are appended behind everything at d.'],
    ['Iterative DFS has two flavours', 'Push the start, then pop and push all unvisited neighbours: a valid DFS-like order but not the same as recursion. To get true recursive order and finish times, push (vertex, iterator) pairs, or push a marker for "exit" after the children.'],
    ['Three-colour DFS', 'White (unseen), grey (on the current path), black (finished). A directed edge to a grey vertex is a back edge, which is exactly a cycle. A visited set alone cannot tell grey from black.'],
    ['Parent array as a tree', 'The edges that first discover each vertex form a BFS tree or DFS tree. BFS tree paths are shortest; DFS tree has no cross edges in an undirected graph, which is the basis of many theorems.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'When would you use BFS over DFS, and why does BFS find the shortest path?',
      a: 'Use BFS when you need the fewest edges from a source, or when the answer is likely near the source and you want to stop early. BFS expands vertices in order of distance because its FIFO queue holds all distance-d vertices before any distance d + 1 vertex. The first time a vertex is discovered is therefore along a path with the minimum number of edges. It does not generalise to weighted edges. DFS is better for exhaustive exploration, ordering, cycle detection and backtracking, and uses less memory on wide graphs.',
      follow: [
        ['Which uses more memory on a binary tree?', 'BFS holds a whole level (up to about n/2 nodes); DFS holds one path (log n if balanced). On a long thin graph the situation reverses.'],
        ['How do you return the path, not just the length?', 'Record parent[v] = u when discovering v, then walk from the target back to the source and reverse.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Write an iterative BFS that returns the distance to every reachable vertex.',
      a: 'Initialise `dist = {s: 0}` and a deque with s. While the deque is not empty, pop the left vertex u; for each neighbour v not in dist, set `dist[v] = dist[u] + 1` and append v. The dict is both the visited set and the result, and marking on enqueue prevents duplicates. O(V + E). Use `deque.popleft()`, because `list.pop(0)` shifts the list and makes it O(V^2).',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Detect a cycle in a directed graph with DFS.',
      a: 'Use three states per vertex: unseen, in-progress (on the current recursion path), done. Visit u: mark it in-progress; for each neighbour v, if v is in-progress there is a back edge, so a cycle; if unseen, recurse; after all neighbours, mark u done. A visited-only set would wrongly flag vertices reached by two different paths (cross or forward edges), which are not cycles. O(V + E). The same colouring gives topological order: append each vertex to a list when it finishes and reverse it.',
      follow: [
        ['How is undirected cycle detection different?', 'Track the parent. A visited neighbour that is not the parent is a cycle. Directed graphs need the in-progress state instead.'],
        ['Compare with Kahn\'s algorithm.', 'Both detect cycles in O(V + E). Kahn\'s is iterative and avoids deep recursion; DFS also yields strongly connected components and finish times.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Rotting oranges: find the minutes until all oranges rot (multi-source BFS).',
      a: 'Push every initially rotten cell into the queue at once with time 0, and count the fresh oranges. Run BFS by levels: each round turns all fresh neighbours of the current frontier rotten, decrements the fresh count, and enqueues them; one round is one minute. The answer is the number of rounds, or -1 if fresh oranges remain at the end. Starting from all sources simultaneously is the same as adding a virtual super-source joined to each rotten cell with zero cost. O(R x C).',
      follow: [
        ['Why not run a separate BFS from each rotten orange?', 'It would repeat work and cost O(sources x cells). Multi-source BFS computes the distance to the nearest source in one pass.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'The graph is a web crawl with billions of pages, spread over many machines. How do you do a BFS?',
      a: 'A single queue and visited set do not fit or scale. Partition vertices by hash of the URL; each worker owns the visited set for its shard. Run BFS in rounds (bulk synchronous): each worker expands its frontier, sends discovered vertices to their owner shards, and the owners deduplicate against their visited sets to form the next frontier. A Bloom filter can cheapen the visited test at the price of occasional skipped pages. Real crawlers replace pure BFS with a priority frontier (politeness per host, freshness, importance), rate limit per domain, and checkpoint state so a failed worker can resume. The main costs are network shuffling of frontiers and skew from very high-degree hubs.',
      follow: [
        ['What is the danger of a Bloom filter for visited?', 'False positives mean some unvisited vertices are wrongly treated as seen and skipped. Acceptable for a crawl, not for exact shortest paths.'],
      ],
    },
  ],
};
