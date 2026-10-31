/* Interview depth: Topological sort. */
window.DEPTH = {
  thesis:
    'Topological sort answers "in what order can I do things that depend on each other". It exists exactly when the dependency graph has no cycle, so the same algorithm solves ordering and cycle detection at once. Two classic ways: Kahn\'s algorithm (repeatedly peel off vertices with no unmet prerequisites) and reverse DFS finish order. Both are O(V + E).',
  why: [
    ['Dependencies are everywhere', 'Build systems, package managers, spreadsheet recalculation, course prerequisites and task schedulers all need an order in which every item follows what it depends on.'],
    ['Existence equals acyclicity', 'A valid order exists if and only if the directed graph is acyclic. So "can I finish all courses?" is a cycle question.'],
    ['Order is not unique', 'Whenever two vertices are unrelated, either may come first. Ask whether any order is acceptable or whether you need the lexicographically smallest (use a min-heap in Kahn\'s).'],
    ['It enables dynamic programming on DAGs', 'Processing vertices in topological order guarantees all of a vertex\'s predecessors are finished, so longest path or counting paths in a DAG is a single linear pass.'],
  ],
  edges: [
    ['Edge direction convention', 'Prerequisite pairs like `[a, b]` often mean "b before a". Reading the direction wrongly reverses the order. Say it back to the interviewer.'],
    ['Isolated vertices', 'Courses with no prerequisites and no dependents must still appear in the output. Build the vertex set from 0..n-1, not only from edges.'],
    ['Duplicate edges', 'Counting the same edge twice in the in-degree and once in the adjacency list (or the reverse) leaves in-degrees that never reach zero. Deduplicate or be consistent.'],
    ['Self dependencies', 'An edge u -> u is a cycle by itself. Kahn\'s algorithm handles it, since u never reaches in-degree 0.'],
    ['Multiple components', 'Kahn\'s algorithm starts from all zero in-degree vertices at once, so disconnected graphs are handled without special code.'],
  ],
  cost: [
    ['Kahn\'s algorithm', 'O(V + E) time, O(V) extra space.'],
    ['DFS-based', 'O(V + E) time, O(V) recursion depth.'],
    ['With a min-heap for the smallest order', 'O((V + E) log V).'],
    ['Longest path in a DAG after sorting', 'O(V + E).'],
  ],
  internals: [
    ['Why Kahn\'s output length detects cycles', 'A vertex is output only after all its predecessors are. A vertex on a cycle has a predecessor on the same cycle that can never be output first, so it never reaches in-degree 0 and is never enqueued.'],
    ['Reverse post-order from DFS', 'Append a vertex to a list when its DFS call finishes; the reversed list is a topological order. A vertex finishes after everything reachable from it, so all its successors appear after it once reversed.'],
    ['Why in-degree bookkeeping is O(E) overall', 'Each edge is decremented exactly once, when its source is output. Together with each vertex entering the queue once, the work is V + E.'],
    ['`graphlib.TopologicalSorter`', 'Python 3.9+ ships it. It supports a parallel interface (`get_ready`, `done`) that hands you every currently runnable task, which is how a build runner schedules in parallel.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Course schedule: can you finish all courses given prerequisites?',
      a: 'Model courses as vertices and prerequisites as directed edges from prerequisite to course. You can finish exactly when the graph has no cycle. Run Kahn\'s algorithm: compute in-degrees, queue the zero ones, repeatedly pop, count it, and decrement its successors, enqueueing any that reach zero. If the count equals the number of courses, return True; otherwise a cycle blocked some courses. O(V + E).',
      follow: [
        ['How do you return an order too (Course Schedule II)?', 'Collect the popped vertices in a list; return it if its length equals V, else an empty list.'],
        ['Do it with DFS instead.', 'Use three states and return False on reaching an in-progress vertex. Reverse the finish order for the schedule.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Explain Kahn\'s algorithm and why it is correct.',
      a: 'Maintain the in-degree of each vertex, the number of unprocessed prerequisites. A vertex with in-degree 0 can be placed next because nothing that remains must precede it. Output it, then delete its outgoing edges by decrementing each successor\'s in-degree; any that reach 0 become available. Repeating this builds an order in which every edge goes forward. If the graph is acyclic there is always a zero in-degree vertex among the remaining ones (follow predecessors backwards; without a cycle you must stop), so every vertex is output. A cycle leaves vertices stuck.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Alien dictionary: derive the letter order from a sorted list of words.',
      a: 'Compare each adjacent pair of words and find the first position where they differ; that gives one edge a -> b meaning a precedes b. Also handle the invalid case where a longer word comes before its own prefix (return ""). Build a graph over all letters that appear (including those with no edges), then topologically sort with Kahn\'s. If the output is shorter than the number of distinct letters there is a contradiction, so return "". Many orders may be valid; the problem usually accepts any. O(total characters + alphabet edges).',
      follow: [
        ['Why must you only compare adjacent words?', 'Sortedness is transitive, so adjacent pairs imply every constraint. Comparing all pairs adds redundant edges.'],
        ['What if you need the smallest valid order?', 'Replace the queue by a min-heap.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Find the longest chain of dependent tasks (critical path) and the earliest finish time of each task.',
      a: 'Topologically sort the DAG. Process vertices in that order, keeping `finish[v]`. For a vertex v, `finish[v] = duration[v] + max(finish[u] for u predecessors of v)`, or just the duration if there are none. Because predecessors come first, each value is final when needed. The project duration is the maximum finish time and the critical path is recovered by following the predecessor that attained each maximum. O(V + E). The same pattern counts paths or finds the longest path, which is NP-hard in general graphs but linear on DAGs.',
      follow: [
        ['What changes if tasks can run in parallel?', 'Nothing in the calculation: finish times already assume unlimited parallelism. Limited workers make it a scheduling problem, which is NP-hard in general.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Design the dependency resolver for a package manager.',
      a: 'Packages are vertices; "A needs B" is an edge. Installation order is a topological order, and a cycle is an error to report with the packages involved (use strongly connected components to name them). But real resolvers are harder than sorting: each package has many versions and version constraints, so the problem is choosing one version per package such that all constraints hold, which is NP-complete in general. Practical systems use SAT solvers or backtracking with conflict learning (PubGrub), prefer newest compatible versions, cache metadata, and lock results in a lockfile for reproducibility. Sort for the install order, install independent packages in parallel via the get_ready interface, and make the plan idempotent so a failed run can resume.',
      follow: [
        ['Why is version resolution NP-complete?', 'Choosing versions under arbitrary dependency and conflict constraints encodes boolean satisfiability. Real ecosystems stay tractable because constraints are structured, and solvers exploit that.'],
      ],
    },
  ],
};
