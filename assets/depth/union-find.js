/* Interview depth: Union-find. */
window.DEPTH = {
  thesis:
    'Union-find answers one question on a set that only ever merges: are these two items in the same group? Each group is a tree stored in a parent array and named by its root. Two cheap ideas make it nearly constant time: attach the smaller tree under the larger (union by size or rank) and flatten paths while you search (path compression). It is the right tool whenever connectivity changes by adding edges, and wrong when edges are removed.',
  why: [
    ['Dynamic connectivity with additions only', 'A BFS answers "are u and v connected" in O(V + E) each time. Union-find answers it in almost O(1) after each added edge, so a stream of edges and queries stays cheap.'],
    ['Cycle detection while building', 'In an undirected graph, an edge whose endpoints already have the same root closes a cycle. That one check powers Kruskal\'s algorithm, redundant connection and many puzzle problems.'],
    ['Tiny code, huge payoff', 'About ten lines and two arrays, with an inverse-Ackermann bound that is effectively constant.'],
    ['Group by an equivalence', 'Accounts that share an email, similar strings, satisfiability of equalities (a == b, b != c) all reduce to merging equivalent items.'],
  ],
  edges: [
    ['Union of roots', 'Always union `find(a)` with `find(b)`. Linking a with b directly leaves the rest of each group unconnected.'],
    ['Already in the same group', 'Union must do nothing when the roots are equal; otherwise size counts and component counts go wrong.'],
    ['Deletions', 'Union-find cannot split a group. For removals, process the operations in reverse (turn deletions into additions), or use offline dynamic connectivity.'],
    ['Recursive find', 'A recursive find with compression can hit the recursion limit on a long chain before it is compressed. Write it iteratively.'],
    ['Labels that are not 0..n-1', 'Map them to indices with a dict, or store the parent in a dict and create entries lazily.'],
  ],
  cost: [
    ['find / union with both optimisations', 'O(alpha(n)) amortised, alpha being the inverse Ackermann function (below 5 for any practical n).'],
    ['only union by size', 'O(log n) per find.'],
    ['only path compression', 'O(log n) amortised.'],
    ['neither', 'O(n) per find in the worst case (a chain).'],
    ['space', 'O(n): the parent array plus a size or rank array.'],
  ],
  internals: [
    ['Union by size versus by rank', 'Size attaches the smaller group under the larger and adds sizes (which you often want anyway). Rank is an upper bound on height and only changes when equal ranks merge. Both give the same asymptotic result.'],
    ['Path halving and splitting', 'Single-pass variants of compression: set `parent[x] = parent[parent[x]]` as you climb. They have the same amortised bound with simpler iterative code and no second pass.'],
    ['Why the bound is inverse Ackermann', 'Tarjan\'s analysis shows the combination of both heuristics gives an amortised cost growing slower than any function you would meet; it is also provably optimal for this problem in the cell-probe model.'],
    ['Kruskal\'s algorithm', 'Sort edges by weight and add each if it connects two different groups. Union-find is the "different groups?" test, so the whole algorithm costs O(E log E), dominated by the sort.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Implement union-find and explain the two optimisations.',
      a: 'Keep `parent` (each element starts as its own root) and `size`. `find(x)` follows parents to the root; with path compression every visited node is re-pointed to the root. `union(a, b)` finds both roots, returns if equal, otherwise attaches the smaller tree under the larger and adds the sizes. Union by size keeps trees shallow (height at most log n), and compression flattens them further as they are used. Together a sequence of m operations costs about O(m x alpha(n)), effectively linear.',
      follow: [
        ['Which optimisation matters more?', 'Together they are far better than either alone, but each gives O(log n) by itself. In interviews, say both and implement at least compression.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Find the redundant connection: an undirected graph that was a tree plus one extra edge.',
      a: 'Process the edges in order with union-find. For each edge, if the two endpoints already have the same root, they were already connected, so this edge closes the cycle: return it. Otherwise union them. O(n x alpha(n)). A DFS would work too, but union-find does it in one pass with no graph construction.',
      follow: [
        ['What if the graph is directed (Redundant Connection II)?', 'It is harder: a node may have two parents, or a cycle may form. Identify a node with in-degree two and test which of its two incoming edges to remove, using union-find to check for cycles.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Number of islands II: land cells are added one at a time; report the island count after each addition.',
      a: 'Treat each cell as an element, mapped to index r * cols + c. Keep a `count` of islands. When land is added at a cell, increment `count`, then for each of its four neighbours that is land, union them; each successful union (different roots) decrements `count`. Report `count` after each addition. Total O(k x alpha(R x C)) for k additions. A BFS recount after every addition would be O(k x R x C), far slower. Care points: ignore a cell added twice, and bounds-check neighbours.',
      follow: [
        ['Why not use BFS here?', 'Connectivity changes after every addition. Union-find updates incrementally, while BFS recomputes from scratch.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Accounts merge: group accounts that share an email, and output the merged lists.',
      a: 'Treat each account index as an element. Map each email to the first account that owned it; when an email is seen again, union the current account with that owner. After processing, group emails by `find(account)`, sort each group, and prepend the name. This is O(N log N) overall for N emails (the sorting), with the unions near-linear. A graph approach (emails as vertices joined within an account, then components) also works; union-find avoids building adjacency lists.',
      follow: [],
    },
    {
      lvl: 'staff',
      q: 'You must maintain connected components of a graph with both edge insertions and deletions, with queries interleaved. What do you do?',
      a: 'Plain union-find cannot split groups. If the operations are known in advance (offline), use the offline dynamic connectivity technique: treat each edge as alive over a time interval, build a segment tree over time, and add each edge to O(log T) nodes; do a DFS over the segment tree with a union-find that supports rollback (union by size without path compression, with a stack to undo), answering queries at the leaves. That is O((n + q) log T log n). If it must be online, use Euler-tour trees or link-cut trees (polylogarithmic updates, much more complex), or approximate with periodic rebuilds. I would first ask whether deletions are really needed, since many problems can be reversed into insertions.',
      follow: [
        ['Why no path compression in the rollback version?', 'Compression rewrites many parent pointers, which makes undo expensive. Union by size alone still gives O(log n) finds and a simple undo stack.'],
      ],
    },
  ],
};
