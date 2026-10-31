/* Interview depth: backtracking on subsets. */
window.DEPTH = {
  thesis:
    'Backtracking is depth-first search over a tree of choices that is never stored: the recursion stack is the current path. The template is choose, explore, un-choose. Subsets, permutations, combinations and combination sums all share it; they differ only in what the choices are and when a path counts as an answer. When the output itself has 2^n or n! items, exponential time is unavoidable, so the interview skill is writing the template cleanly and pruning.',
  why: [
    ['A whole family of problems', 'Subsets, permutations, combination sum, palindrome partitioning, generate parentheses, word search: one template.'],
    ['Recursion fluency', 'Interviewers use it to test state management: what is shared, what is copied, what is undone.'],
    ['Complexity reasoning', 'You must count the tree: 2^n leaves for subsets, n! for permutations, and say why that is optimal when you list everything.'],
    ['Pruning', 'Cutting a branch early (sorted input plus a break, a running sum over the target) is the usual follow-up.'],
  ],
  edges: [
    ['Storing the path, not a copy', 'res.append(path) stores the same list many times; always copy at the leaf.'],
    ['Forgetting to undo', 'If you do not pop after exploring, later branches see a corrupted path.'],
    ['Duplicates in the input', 'Sort first and skip a value equal to the previous one at the same level to avoid duplicate subsets.'],
    ['Empty input', 'Subsets of [] is [[]], one answer, not zero.'],
    ['Recursion depth', 'Depth equals n, which is fine for n up to a few dozen (the output is exponential anyway).'],
    ['Order of results', 'Take-first and skip-first give different orders; if the problem needs a specific order, say which you chose.'],
  ],
  cost: [
    ['Subsets', 'O(n x 2^n) time (copying each result), O(n) recursion space plus output.'],
    ['Permutations', 'O(n x n!) time.'],
    ['Combinations C(n, k)', 'O(k x C(n, k)).'],
    ['Pruned searches', 'Worst case unchanged, but often far smaller in practice.'],
  ],
  internals: [
    ['Decision tree', 'Each node is a state (index, path); edges are choices; leaves are complete answers.'],
    ['Call stack = path', 'Going down pushes a choice, returning pops it, which is the un-choose step.'],
    ['Two styles for subsets', 'Take or skip each element (binary tree), or loop over later elements and record at every node (each node is an answer).'],
    ['Bitmask alternative', 'Iterate masks 0..2^n - 1; bit i says whether nums[i] is in the subset.'],
  ],
  qa: [
    { lvl: 'junior', q: 'What is backtracking?', a: 'A recursive search that builds a candidate step by step, and when a step leads nowhere (or after recording an answer) undoes it and tries the next option.', follow: [] },
    { lvl: 'mid', q: 'Generate all subsets of a list.', a: 'dfs(i): if i == n, append a copy of path. Otherwise take nums[i] (append, recurse, pop) and skip it (recurse). Time O(n 2^n).', follow: [['How do you handle duplicates?', 'Sort, then in the loop style skip a value equal to the previous one at the same depth.']] },
    { lvl: 'mid', q: 'Why copy the path when recording an answer?', a: 'path is one list mutated throughout the search. Appending the list itself stores references to the same object, so every stored answer ends up equal to the final state of the list.', follow: [] },
    { lvl: 'senior', q: 'Can you do better than O(2^n) for subsets?', a: 'Not when you must list them: the output has 2^n entries. If the question is only about counts or sums (e.g. number of subsets with sum s), dynamic programming over the sum is pseudo-polynomial.', follow: [] },
    { lvl: 'senior', q: 'How would you add pruning to combination sum?', a: 'Sort the candidates, and stop a loop as soon as candidate > remaining, since all later ones are larger. Also pass the start index so combinations are not generated in several orders.', follow: [] },
  ],
};
