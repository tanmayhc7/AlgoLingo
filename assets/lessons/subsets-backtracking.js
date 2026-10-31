/* Lesson data: backtracking on subsets (structure mode). The recursion tree grows as the search runs. */
(function () {
  var NUMS = [1, 2, 3], n = NUMS.length;
  var py = ['def subsets(nums):', '    res, path = [], []', '    def dfs(i):', '        if i == len(nums):', '            res.append(path[:]); return      # record a copy', '        path.append(nums[i]); dfs(i + 1)     # choose: take nums[i]', '        path.pop()                           # undo the choice (backtrack)', '        dfs(i + 1)                           # choose: skip nums[i]', '    dfs(0); return res'];
  var c = ['void dfs(int i) {', '    if (i == n) { record(path, len); return; }   /* copy path */', '    path[len++] = nums[i]; dfs(i + 1);           /* choose: take */', '    len--;                                       /* undo: backtrack */', '    dfs(i + 1);                                  /* choose: skip */', '}'];

  function build() {
    var steps = [], count = 0, res = [];
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Backtracking explores every combination of choices as a tree. For each number we make two choices: take it, or skip it. The tree below grows as the search runs. Each box shows the numbers chosen so far (- means none).', csay: 'dfs(0)', ds: [] });
    function dfs(i, path, x, y, off, parent, kind) {
      var id = 'n' + (count++);
      var label = path.length ? path.join('') : '-';
      var ops = [['node', id, label, x, y, 'cell'], ['tag', id, 'cur']];
      if (parent) ops.push(['edge', parent, id, kind], ['etag', parent, kind, 'on']);
      var leaf = i === n;
      steps.push({ pl: leaf ? 3 : 2, cl: leaf ? 1 : 0, h: 380, say: (parent ? (kind === 'l' ? 'Take ' + NUMS[i - 1] : 'Skip ' + NUMS[i - 1]) + ': move down. ' : 'Start with nothing chosen. ') + (leaf ? 'All ' + n + ' numbers have been decided.' : 'Next decision: number ' + NUMS[i] + '.'), csay: 'dfs(' + i + ')', ds: ops });
      if (leaf) {
        res.push(path.slice());
        steps.push({ pl: 4, cl: 1, h: 380, say: 'Record the subset [' + path.join(', ') + ']. That is ' + res.length + ' of ' + Math.pow(2, n) + ' subsets found. Then return to the caller.', csay: 'Record a copy of path.', ds: [['tag', id, 'done'], ['untag', id, 'cur']] });
        if (parent) steps[steps.length - 1].ds.push(['euntag', parent, kind, 'on']);
        return;
      }
      dfs(i + 1, path.concat([NUMS[i]]), x - off, y + 62, off / 2, id, 'l');
      steps.push({ pl: 6, cl: 3, h: 380, say: 'Back at this node: undo the choice (remove ' + NUMS[i] + ' from the path) so the other branch starts from the same state. This undo is what makes it "backtracking".', csay: 'len--;', ds: [['tag', id, 'cur']] });
      dfs(i + 1, path, x + off, y + 62, off / 2, id, 'r');
      var back = [['untag', id, 'cur'], ['tag', id, 'done']];
      if (parent) back.push(['euntag', parent, kind, 'on']);
      steps.push({ pl: 7, cl: 4, h: 380, say: 'Both choices at this node are explored; return to the parent.', csay: 'return;', ds: back });
    }
    dfs(0, [], 500, 40, 220, null, null);
    steps.push({ pl: 8, cl: 5, h: 380, say: 'Done: ' + res.length + ' subsets, ' + res.map(function (r) { return '[' + r.join(',') + ']'; }).join(' ') + '. The tree has 2^n leaves, so the cost is O(2^n x n): there is no shortcut when you must list every answer.', csay: 'return res;', ds: [] });
    return steps;
  }

  window.LESSON = {
    id: 'subsets-backtracking',
    mode: 'ds',
    title: 'Backtracking: subsets',
    lede:
      'Backtracking builds an answer one choice at a time and undoes the choice to try the next one. It is depth-first search over a tree of decisions that is never stored: the recursion call stack IS the path from the root. The template has three parts: choose, explore, un-choose. Subsets, permutations, combination sums, and word search all use it, and pruning dead branches early is what makes it fast.',
    scenes: [
      { id: 'subsets', title: 'Take it or skip it', blurb: 'The tree of decisions for [1, 2, 3]: left branch takes the number, right branch skips it.', trap: 'Appending path itself to the results instead of a copy: every entry then shows the same final (empty) list because they are all the same object. Python: res.append(path[:]); C: copy into the output.', pyCode: py, cCode: c, predict: { q: 'How many subsets does a set of n distinct numbers have?', options: ['n^2', '2^n', 'n!'], answer: 1, why: 'Each of the n numbers is either in or out, so 2 x 2 x ... x 2 = 2^n.' }, steps: build() },
    ],
    builtins: [
      ['path[:] or list(path)', 'Copy the current path before storing it.'],
      ['list.append / list.pop', 'Choose and un-choose on the shared path list.'],
      ['itertools.combinations(xs, k)', 'Library version of choosing k items.'],
      ['itertools.permutations(xs)', 'All orderings; backtracking is how it works inside.'],
      ['1 << n', 'The number of subsets, and the bitmask way to enumerate them.'],
      ['sys.setrecursionlimit', 'Deep recursion limits; backtracking depth is usually small.'],
    ],
  };
})();
