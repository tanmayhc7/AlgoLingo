/* Lesson data: segment tree (structure mode). Heap-indexed sum tree over 8 values. */
(function () {
  var A = [2, 5, 1, 4, 9, 3, 7, 6], N = 8;
  var Y = { 1: 32, 2: 80, 3: 80, 4: 128, 5: 128, 6: 128, 7: 128 };
  function px(k) {
    if (k >= 8) return 100 + (k - 8) * 108;
    return (px(2 * k) + px(2 * k + 1)) / 2;
  }
  function py(k) { return k >= 8 ? 176 : Y[k]; }
  function rng(k) { var lo = 0, hi = N - 1, path = []; var d = Math.floor(Math.log2(k)); for (var b = d - 1; b >= 0; b--) path.push((k >> b) & 1); path.forEach(function (bit) { var m = (lo + hi) >> 1; if (bit) lo = m + 1; else hi = m; }); return [lo, hi]; }
  function rs(k) { var r = rng(k); return r[0] === r[1] ? '[' + r[0] + ']' : '[' + r[0] + '..' + r[1] + ']'; }
  function mk(a) { var t = new Array(16).fill(0); for (var i = 0; i < N; i++) t[8 + i] = a[i]; for (var k = 7; k >= 1; k--) t[k] = t[2 * k] + t[2 * k + 1]; return t; }
  function shape(t, full) {
    var ops = [];
    for (var k = 1; k <= 15; k++) {
      if (k >= 8 || full) ops.push(['node', 'n' + k, k >= 8 || full ? String(t[k]) : '', px(k), py(k), 'circle']);
      else ops.push(['node', 'n' + k, '', px(k), py(k), 'circle']);
    }
    for (k = 1; k <= 7; k++) ops.push(['edge', 'n' + k, 'n' + 2 * k, 'l'], ['edge', 'n' + k, 'n' + (2 * k + 1), 'r']);
    return ops;
  }
  function build() {
    var steps = [], t = mk(A);
    var ops = shape(t, false);
    for (var k = 1; k <= 7; k++) ops.push(['lab', 'n' + k, '']);
    steps.push({ pl: 0, cl: 0, h: 380, say: 'A segment tree stores a summary (here the sum) of every segment of an array. Leaves are the single values ' + JSON.stringify(A).replace(/,/g, ', ') + '. Each parent holds the combined value of its two children, so the root is the sum of everything. Nodes are stored in an array: node k has children 2k and 2k + 1.', csay: 'int t[16];  /* t[8..15] = leaves */', ds: ops });
    [4, 5, 2, 6, 7, 3, 1].forEach(function (k) {
      steps.push({ pl: 7, cl: 7, h: 380, say: 'Node ' + k + ' covers ' + rs(k) + ': t[' + k + '] = t[' + 2 * k + '] + t[' + (2 * k + 1) + '] = ' + t[2 * k] + ' + ' + t[2 * k + 1] + ' = ' + t[k] + '. (A recursive build finishes a node only after both of its children, so the order is bottom-up.)', csay: 't[k] = t[2*k] + t[2*k+1];', ds: [['lab', 'n' + k, String(t[k])], ['tag', 'n' + k, 'done'], ['hot', 'n' + 2 * k, 'n' + (2 * k + 1), 'n' + k]] });
    });
    steps.push({ pl: 7, cl: 8, h: 380, say: 'Built in O(n): n - 1 internal nodes, each computed once. The tree has about 2n nodes, so it needs O(n) memory (allocate 4n when n is not a power of two).', csay: 'return;', ds: [] });
    return steps;
  }
  function query() {
    var t = mk(A), L = 2, R = 6, steps = [], total = 0;
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Range query: sum of a[' + L + '..' + R + '] = ' + A.slice(L, R + 1).join(' + ') + '. At each node ask: is its segment outside the query (return 0), fully inside (return its stored sum), or partly inside (ask both children)?', csay: 'query(1, 0, 7, 2, 6);', ds: shape(t, true) });
    function visit(k) {
      var r = rng(k), lo = r[0], hi = r[1];
      if (R < lo || hi < L) { steps.push({ pl: 1, cl: 1, h: 380, say: 'Node ' + k + ' covers ' + rs(k) + ': completely outside [' + L + '..' + R + ']. Return 0.', csay: 'return 0;', ds: [['tag', 'n' + k, 'dim']] }); return; }
      if (L <= lo && hi <= R) { total += t[k]; steps.push({ pl: 3, cl: 3, h: 380, say: 'Node ' + k + ' covers ' + rs(k) + ': completely inside. Take its stored value ' + t[k] + ' without looking at its children. Total so far ' + total + '.', csay: 'return t[node];', ds: [['tag', 'n' + k, 'done'], ['hot', 'n' + k]] }); return; }
      steps.push({ pl: 5, cl: 5, h: 380, say: 'Node ' + k + ' covers ' + rs(k) + ': partly inside. Split and ask both children.', csay: 'mid = (lo + hi) / 2;', ds: [['tag', 'n' + k, 'cur']] });
      visit(2 * k); visit(2 * k + 1);
    }
    visit(1);
    steps.push({ pl: 6, cl: 8, h: 380, say: 'Answer: ' + total + ' (check: ' + A.slice(L, R + 1).join(' + ') + ' = ' + A.slice(L, R + 1).reduce(function (x, y) { return x + y; }, 0) + '). The query touches at most two nodes per level, so it is O(log n) however wide the range is.', csay: 'return left + right;', ds: [] });
    return steps;
  }
  function update() {
    var A2 = A.slice(), t = mk(A2), idx = 5, v = 10, steps = [], k;
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Point update: set a[' + idx + '] from ' + A[idx] + ' to ' + v + '. Only the leaf and its ancestors depend on that value, so only one path from leaf to root changes.', csay: 'update(1, 0, 7, 5, 10);', ds: shape(t, true) });
    var path = []; for (k = 8 + idx; k >= 1; k >>= 1) path.unshift(k);
    path.slice(0, -1).forEach(function (n) { steps.push({ pl: 5, cl: 5, h: 380, say: 'Go down: node ' + n + ' covers ' + rs(n) + ' and contains position ' + idx + '.', csay: 'descend', ds: [['tag', 'n' + n, 'cur']] }); });
    A2[idx] = v; var t2 = mk(A2);
    steps.push({ pl: 2, cl: 2, h: 380, say: 'At the leaf (node ' + (8 + idx) + ') set the value to ' + v + '.', csay: 't[node] = v;', ds: [['lab', 'n' + (8 + idx), String(v)], ['tag', 'n' + (8 + idx), 'hot']] });
    for (k = (8 + idx) >> 1; k >= 1; k >>= 1) steps.push({ pl: 7, cl: 7, h: 380, say: 'Coming back up, recompute node ' + k + ': t[' + k + '] = ' + t2[2 * k] + ' + ' + t2[2 * k + 1] + ' = ' + t2[k] + '.', csay: 't[k] = t[2*k] + t[2*k+1];', ds: [['lab', 'n' + k, String(t2[k])], ['tag', 'n' + k, 'done'], ['hot', 'n' + k]] });
    steps.push({ pl: 7, cl: 8, h: 380, say: 'Four nodes rewritten (the tree height + 1), so a point update is O(log n). Compare: a prefix-sum array would need O(n) work to refresh.', csay: 'return;', ds: [] });
    return steps;
  }
  window.LESSON = {
    id: 'segment-tree',
    mode: 'ds',
    title: 'Segment tree',
    lede:
      'A segment tree is a binary tree over an array in which every node stores a summary of its segment: sum, minimum, maximum, gcd or any associative operation. A range query is answered by combining O(log n) whole segments, and a point update rewrites one leaf-to-root path, so both cost O(log n). It is more general than a Fenwick tree (it handles min and max, and with lazy propagation it supports range updates) at the price of more memory and code. Typical problems: range minimum or maximum with updates, counting points in ranges, and "skyline" style sweeps.',
    scenes: [
      { id: 'build', title: 'Build the tree', blurb: 'Leaves hold the values; every parent is the sum of its two children.', trap: 'Sizing: for n not a power of two, a recursive tree needs up to 4n slots. With the 1-based heap layout, root = 1, children of k are 2k and 2k + 1; mixing 0-based and 1-based indexing is the usual bug.',
        pyCode: ['def build(node, lo, hi):', '    if lo == hi:', '        t[node] = a[lo]', '        return', '    mid = (lo + hi) // 2', '    build(2 * node, lo, mid)', '    build(2 * node + 1, mid + 1, hi)', '    t[node] = t[2 * node] + t[2 * node + 1]'],
        cCode: ['void build(int node, int lo, int hi) {', '    if (lo == hi) { t[node] = a[lo]; return; }', '    int mid = (lo + hi) / 2;', '    build(2 * node, lo, mid);', '    build(2 * node + 1, mid + 1, hi);', '    t[node] = t[2 * node] + t[2 * node + 1];', '}'],
        predict: { q: 'For 8 leaves, how many internal (non-leaf) nodes does the tree have?', options: ['4', '7', '8'], answer: 1, why: 'A binary tree with n leaves has n - 1 internal nodes: 4 + 2 + 1 = 7.' },
        steps: build() },
      { id: 'query', title: 'Range query', blurb: 'Outside: return 0. Inside: return the stored sum. Partly inside: ask both children.', trap: 'Using <= vs < in the overlap tests: the three cases must be exhaustive (outside, fully inside, partial). If a partial node is wrongly treated as inside, the answer includes values outside the range.',
        pyCode: ['def query(node, lo, hi, l, r):', '    if r < lo or hi < l:', '        return 0', '    if l <= lo and hi <= r:', '        return t[node]', '    mid = (lo + hi) // 2', '    return (query(2 * node, lo, mid, l, r)', '          + query(2 * node + 1, mid + 1, hi, l, r))'],
        cCode: ['int query(int node, int lo, int hi, int l, int r) {', '    if (r < lo || hi < l) return 0;', '    if (l <= lo && hi <= r) return t[node];', '    int mid = (lo + hi) / 2;', '    return query(2 * node, lo, mid, l, r)', '         + query(2 * node + 1, mid + 1, hi, l, r);', '}'],
        predict: { q: 'Roughly how many nodes does one range query visit in a tree over n values?', options: ['O(1)', 'O(log n)', 'O(n)'], answer: 1, why: 'At most about two partial nodes per level are expanded, and there are log2(n) levels.' },
        steps: query() },
      { id: 'update', title: 'Point update', blurb: 'Change one leaf and recompute its ancestors on the way back up.', trap: 'Updating the leaf but forgetting to recompute the ancestors leaves stale sums that only show up in later queries. For min/max trees also recompute from the children, never adjust by a delta.',
        pyCode: ['def update(node, lo, hi, i, v):', '    if lo == hi:', '        t[node] = v', '        return', '    mid = (lo + hi) // 2', '    if i <= mid: update(2 * node, lo, mid, i, v)', '    else: update(2 * node + 1, mid + 1, hi, i, v)', '    t[node] = t[2 * node] + t[2 * node + 1]'],
        cCode: ['void update(int node, int lo, int hi, int i, int v) {', '    if (lo == hi) { t[node] = v; return; }', '    int mid = (lo + hi) / 2;', '    if (i <= mid) update(2 * node, lo, mid, i, v);', '    else update(2 * node + 1, mid + 1, hi, i, v);', '    t[node] = t[2 * node] + t[2 * node + 1];', '}'],
        predict: { q: 'How many nodes are rewritten by one point update in a tree with 8 leaves?', options: ['1', '4', '15'], answer: 1, why: 'The leaf plus its three ancestors up to the root: height + 1 = 4 nodes.' },
        steps: update() },
    ],
    builtins: [
      ['2 * node, 2 * node + 1', 'Children of node in the 1-based array layout.'],
      ['(lo + hi) // 2', 'Midpoint; in C write lo + (hi - lo) / 2 for very large ranges.'],
      ['[0] * (4 * n)', 'Safe size for a recursive tree over n values.'],
      ['min / max / gcd', 'Swap the combine step to change what the tree answers.'],
      ['lazy propagation', 'Delay range updates in a pending tag per node to keep range updates O(log n).'],
    ],
  };
})();
