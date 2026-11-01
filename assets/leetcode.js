/* LeetCode Visualizer: shared data and renderers.
   PATTERNS lists every planned group; PROBLEMS lists the problems that have a page.
   A problem page sets window.PROBLEM (statement and write-up) next to window.LESSON and window.DEPTH. */
(function () {
  var PATTERNS = [
    { id: 'arrays-hashing', title: 'Arrays and hashing', blurb: 'Trade memory for lookups: a dict or set turns a search into one step.', lesson: 'lessons/hashing.html' },
    { id: 'two-pointers', title: 'Two pointers', blurb: 'Walk two indexes through a sorted or symmetric array instead of nesting loops.' },
    { id: 'sliding-window', title: 'Sliding window', blurb: 'Keep a running window over a sequence and update it as it moves.' },
    { id: 'stack', title: 'Stack', blurb: 'Last in, first out: matching pairs and nearest-greater problems.' },
    { id: 'binary-search', title: 'Binary search', blurb: 'Halve a sorted or monotonic search space.', lesson: 'lessons/binary-search.html' },
    { id: 'linked-list', title: 'Linked lists', blurb: 'Pointer surgery, fast and slow pointers.' },
    { id: 'trees', title: 'Trees', blurb: 'Recursion over nodes, depth-first and breadth-first.' },
    { id: 'heap', title: 'Heaps', blurb: 'Keep the best k items without sorting everything.' },
    { id: 'backtracking', title: 'Backtracking', blurb: 'Try, recurse, undo.' },
    { id: 'graphs', title: 'Graphs', blurb: 'Traversal, shortest paths, connected components.' },
    { id: 'dp', title: 'Dynamic programming', blurb: 'Overlapping subproblems with a remembered answer.' },
    { id: 'intervals', title: 'Intervals and greedy', blurb: 'Sort, then make the locally best choice.' }
  ];
  var PROBLEMS = [
    { id: 'lc-two-sum', slug: 'two-sum', num: 1, title: 'Two Sum', diff: 'Easy', pattern: 'arrays-hashing' }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function code(t) {
    var frag = document.createDocumentFragment();
    String(t).split(/`([^`]+)`/).forEach(function (part, i) {
      if (i % 2) frag.appendChild(el('code', '', part)); else if (part) frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }
  function para(t) { var p = el('p'); p.appendChild(code(t)); return p; }
  function visited() {
    try { return JSON.parse(localStorage.getItem('dsav-visited') || '[]'); } catch (e) { return []; }
  }

  /* leetcode/index.html */
  function renderIndex(host) {
    var seen = visited();
    PATTERNS.forEach(function (pt, i) {
      var list = PROBLEMS.filter(function (p) { return p.pattern === pt.id; });
      var sec = el('section', 'chapter');
      sec.appendChild(el('div', 'chapter-num', String(i + 1)));
      var body = el('div', 'chapter-body');
      var head = el('div', 'chapter-head');
      head.appendChild(el('h2', '', pt.title));
      var open = list.filter(function (p) { return seen.indexOf(p.id) >= 0; }).length;
      head.appendChild(el('span', 'status ' + (list.length ? 'ready' : 'planned'), list.length ? open + ' / ' + list.length : 'Planned'));
      body.appendChild(head);
      body.appendChild(el('p', 'sub', pt.blurb));
      var lessons = el('div', 'lessons');
      list.forEach(function (p) {
        var a = el('a', 'pill ready');
        a.href = 'problems/' + p.slug + '.html';
        a.appendChild(el('span', 'n', String(p.num)));
        a.appendChild(document.createTextNode(p.title + ' · ' + p.diff));
        if (seen.indexOf(p.id) >= 0) a.classList.add('done');
        lessons.appendChild(a);
      });
      if (pt.lesson) {
        var l = el('a', 'pill quiz', 'Learn the pattern first');
        l.href = '../' + pt.lesson;
        lessons.appendChild(l);
      }
      if (list.length) body.appendChild(lessons);
      sec.appendChild(body);
      host.appendChild(sec);
    });
  }

  /* problem pages: statement card (#problem) and the write-up (#writeup) */
  function renderProblem(P) {
    var meta = PROBLEMS.filter(function (p) { return p.slug === P.slug; })[0];
    var pat = PATTERNS.filter(function (x) { return x.id === meta.pattern; })[0];
    var crumb = document.getElementById('crumb');
    if (crumb) {
      var a = el('a', '', 'LeetCode'); a.href = '../index.html';
      crumb.appendChild(a);
      crumb.appendChild(document.createTextNode('  /  ' + pat.title + '  /  Problem ' + meta.num));
    }
    var t = document.getElementById('title');
    if (t) t.textContent = meta.num + '. ' + meta.title;

    var host = document.getElementById('problem');
    host.appendChild(el('h2', '', 'The problem'));
    var tags = el('p', 'lc-tags');
    tags.appendChild(el('span', 'lc-tag lc-' + meta.diff.toLowerCase(), meta.diff));
    tags.appendChild(el('span', 'lc-tag', pat.title));
    var link = el('a', 'lc-link', 'Open on LeetCode');
    link.href = P.url; link.target = '_blank'; link.rel = 'noopener';
    tags.appendChild(link);
    host.appendChild(tags);
    P.statement.forEach(function (s) { host.appendChild(para(s)); });
    host.appendChild(el('h3', '', 'Examples'));
    P.examples.forEach(function (e) {
      var pre = el('pre', 'lc-ex');
      pre.textContent = 'Input:  ' + e[0] + '\nOutput: ' + e[1];
      host.appendChild(pre);
    });
    host.appendChild(el('h3', '', 'Constraints'));
    var ul = el('ul');
    P.constraints.forEach(function (c) { var li = el('li'); li.appendChild(code(c)); ul.appendChild(li); });
    host.appendChild(ul);
    if (P.followup) { var f = para('Follow-up: ' + P.followup); f.className = 'lc-follow'; host.appendChild(f); }

    var w = document.getElementById('writeup');
    w.appendChild(el('h2', '', 'Write-up'));
    P.writeup.forEach(function (blk) {
      w.appendChild(el('h3', '', blk.h));
      (blk.p || []).forEach(function (s) { w.appendChild(para(s)); });
      if (blk.ul) { var u = el('ul'); blk.ul.forEach(function (s) { var li = el('li'); li.appendChild(code(s)); u.appendChild(li); }); w.appendChild(u); }
      if (blk.table) {
        var wrap = el('div', 'table-wrap'); var tb = el('table'); var tbody = el('tbody');
        blk.table.forEach(function (r, ri) {
          var tr = el('tr');
          r.forEach(function (c) { var cell = el(ri === 0 ? 'th' : 'td'); cell.appendChild(code(c)); tr.appendChild(cell); });
          tbody.appendChild(tr);
        });
        tb.appendChild(tbody); wrap.appendChild(tb); w.appendChild(wrap);
      }
    });
  }

  window.LC = { PATTERNS: PATTERNS, PROBLEMS: PROBLEMS, renderIndex: renderIndex, renderProblem: renderProblem };
})();
