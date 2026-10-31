/* The course outline. Add `href` to a lesson when its page exists (relative to the site root).
   Home page, chapter outline, breadcrumb and prev/next links all read from this list. */
(function () {
  'use strict';

  var CHAPTERS = [
    {
      title: 'Getting started',
      quiz: 'quizzes/chapter-1.html',
      blurb: 'How the two languages run, and what a variable really is.',
      lessons: [
        { id: 'compiled-vs-interpreted', title: 'Compiled versus interpreted: how C and Python run', href: 'lessons/compiled-vs-interpreted.html' },
        { id: 'running-python', title: 'Running Python programs', href: 'lessons/running-python.html' },
        { id: 'variables', title: 'Variables and names', href: 'lessons/variables.html' },
      ],
    },
    {
      title: 'Basic types',
      quiz: 'quizzes/chapter-2.html',
      blurb: 'Numbers, truth values and strings, and where they differ from C.',
      lessons: [
        { id: 'numbers', title: 'Numbers, booleans and None', href: 'lessons/numbers.html' },
        { id: 'strings', title: 'Strings as sequences', href: 'lessons/strings.html' },
      ],
    },
    {
      title: 'Control flow',
      quiz: 'quizzes/chapter-3.html',
      blurb: 'Decisions, loops that walk over things, and reading errors.',
      lessons: [
        { id: 'conditions', title: 'Conditions', href: 'lessons/conditions.html' },
        { id: 'loops', title: 'Loops', href: 'lessons/loops.html' },
        { id: 'errors', title: 'Errors and tracebacks', href: 'lessons/errors.html' },
      ],
    },
    {
      title: 'Functions and shorthands',
      quiz: 'quizzes/chapter-4.html',
      blurb: 'Functions, the idioms that replace C boilerplate, and comprehensions.',
      lessons: [
        { id: 'functions', title: 'Functions', href: 'lessons/functions.html' },
        { id: 'shorthands', title: 'Shorthands and idioms', href: 'lessons/shorthands.html' },
        { id: 'comprehensions', title: 'Comprehensions', href: 'lessons/comprehensions.html' },
      ],
    },
    {
      title: 'Memory and arrays',
      quiz: 'quizzes/chapter-5.html',
      blurb: 'How memory holds an array, then lists and tuples.',
      lessons: [
        { id: 'array-memory', title: 'How memory holds an array', href: 'lessons/array-memory.html' },
        { id: 'lists', title: 'Lists', href: 'lessons/lists.html' },
        { id: 'tuples', title: 'Tuples', href: 'lessons/tuples.html' },
      ],
    },
    {
      title: 'Hashing',
      quiz: 'quizzes/chapter-6.html',
      blurb: 'Hash tables built by hand, then dicts and sets.',
      lessons: [
        { id: 'hashing', title: 'Hashing', href: 'lessons/hashing.html' },
        { id: 'dicts', title: 'Dicts', href: 'lessons/dicts.html' },
        { id: 'sets', title: 'Sets', href: 'lessons/sets.html' },
      ],
    },
    {
      title: 'Toolbox',
      quiz: 'quizzes/chapter-7.html',
      blurb: 'The standard-library pieces and patterns you will reach for in problems.',
      lessons: [
        { id: 'sorting-helpers', title: 'Sorting and searching helpers', href: 'lessons/sorting-helpers.html' },
        { id: 'collections', title: 'collections and friends', href: 'lessons/collections.html' },
        { id: 'choosing', title: 'Choosing a container', href: 'lessons/choosing.html' },
        { id: 'patterns', title: 'Patterns you will reuse', href: 'lessons/patterns.html' },
        { id: 'survival-kit', title: 'Python survival kit for coding problems', href: 'lessons/survival-kit.html' },
      ],
    },
    {
      title: 'Linked lists',
      quiz: 'quizzes/chapter-8.html',
      blurb: 'Nodes joined by references: building, walking, reversing and the pointer tricks interviewers love.',
      lessons: [
        { id: 'linked-list-basics', title: 'Linked list basics', href: 'lessons/linked-list-basics.html' },
        { id: 'linked-list-patterns', title: 'Reverse, fast and slow, dummy head', href: 'lessons/linked-list-patterns.html' },
        { id: 'doubly-linked-list', title: 'Doubly linked lists and LRU', href: 'lessons/doubly-linked-list.html' },
      ],
    },
    {
      title: 'Stacks and queues',
      quiz: 'quizzes/chapter-9.html',
      blurb: 'Two disciplines for ordering work: last in first out, and first in first out.',
      lessons: [
        { id: 'stacks', title: 'Stacks', href: 'lessons/stacks.html' },
        { id: 'queues', title: 'Queues', href: 'lessons/queues.html' },
      ],
    },
    {
      title: 'Trees',
      quiz: 'quizzes/chapter-10.html',
      blurb: 'Hierarchies: traversals, search trees and the recursive patterns behind most tree problems.',
      lessons: [
        { id: 'binary-trees', title: 'Binary trees and traversals', href: 'lessons/binary-trees.html' },
        { id: 'bst', title: 'Binary search trees', href: 'lessons/bst.html' },
        { id: 'tree-patterns', title: 'Tree recursion patterns', href: 'lessons/tree-patterns.html' },
      ],
    },
    {
      title: 'Heaps and tries',
      quiz: 'quizzes/chapter-11.html',
      blurb: 'Priority queues in an array, top-k selection, and prefix trees for strings.',
      lessons: [
        { id: 'heaps', title: 'Heaps', href: 'lessons/heaps.html' },
        { id: 'heap-patterns', title: 'Heap patterns', href: 'lessons/heap-patterns.html' },
        { id: 'tries', title: 'Tries', href: 'lessons/tries.html' },
      ],
    },
    {
      title: 'Graphs',
      quiz: 'quizzes/chapter-12.html',
      blurb: 'Vertices and edges: how to store them, walk them, and order tasks with prerequisites.',
      lessons: [
        { id: 'graph-basics', title: 'Graphs and adjacency lists', href: 'lessons/graph-basics.html' },
        { id: 'graph-traversal', title: 'BFS, DFS and components', href: 'lessons/graph-traversal.html' },
        { id: 'topological-sort', title: 'Topological sort', href: 'lessons/topological-sort.html' },
      ],
    },
    {
      title: 'Shortest paths and connectivity',
      quiz: 'quizzes/chapter-13.html',
      blurb: 'Cheapest routes in weighted graphs, and keeping track of groups that merge.',
      lessons: [
        { id: 'dijkstra', title: 'Shortest paths with Dijkstra', href: 'lessons/dijkstra.html' },
        { id: 'union-find', title: 'Union-find', href: 'lessons/union-find.html' },
      ],
    },
    {
      title: 'Dynamic programming',
      quiz: 'quizzes/chapter-14.html',
      blurb: 'Turn exponential recursion into tables: memoisation, one-dimensional and two-dimensional DP.',
      lessons: [
        { id: 'dp-recursion', title: 'From recursion to memoisation', href: 'lessons/dp-recursion.html' },
        { id: 'dp-1d', title: 'One-dimensional tables', href: 'lessons/dp-1d.html' },
        { id: 'dp-2d', title: 'Two-dimensional tables', href: 'lessons/dp-2d.html' },
      ],
    },
    {
      title: 'Complexity analysis',
      quiz: 'quizzes/chapter-15.html',
      blurb: 'Count steps, compare growth rates, and reason about amortised cost and space.',
      lessons: [
        { id: 'complexity-growth', title: 'Counting steps and growth rates', href: 'lessons/complexity-growth.html' },
        { id: 'complexity-amortized', title: 'Amortised cost and space', href: 'lessons/complexity-amortized.html' },
      ],
    },
    {
      title: 'Classes and objects',
      quiz: 'quizzes/chapter-16.html',
      blurb: 'Objects as bundles of data with shared code: attributes, methods, self, and the special methods that make objects behave like built-ins.',
      lessons: [
        { id: 'classes-objects', title: 'Classes and objects', href: 'lessons/classes-objects.html' },
        { id: 'dunder-methods', title: 'Special methods', href: 'lessons/dunder-methods.html' },
      ],
    },
    {
      title: 'Inheritance and composition',
      quiz: 'quizzes/chapter-17.html',
      blurb: 'Reusing behaviour two ways: subclasses with method resolution order, and objects that hold and delegate to other objects.',
      lessons: [
        { id: 'inheritance', title: 'Inheritance and method resolution', href: 'lessons/inheritance.html' },
        { id: 'composition', title: 'Composition and delegation', href: 'lessons/composition.html' },
      ],
    },
    {
      title: 'Iterators, generators and decorators',
      quiz: 'quizzes/chapter-18.html',
      blurb: 'The protocols and tools behind idiomatic Python: lazy iteration, functions that pause, functions that wrap functions, and generated class boilerplate.',
      lessons: [
        { id: 'iterators-generators', title: 'Iterators and generators', href: 'lessons/iterators-generators.html' },
        { id: 'decorators-dataclasses', title: 'Decorators and dataclasses', href: 'lessons/decorators-dataclasses.html' },
      ],
    },
    {
      title: 'Sorting',
      quiz: 'quizzes/chapter-19.html',
      blurb: 'Sorting algorithms as animations: bars that slide and swap while the code runs beside them.',
      lessons: [
        { id: 'sorting-simple', title: 'Simple sorts: bubble, selection, insertion', href: 'lessons/sorting-simple.html' },
        { id: 'sorting-fast', title: 'Fast sorts: merge sort and quicksort', href: 'lessons/sorting-fast.html' },
      ],
    },
    {
      title: 'Binary search',
      quiz: 'quizzes/chapter-20.html',
      blurb: 'Halving the search range: the classic search, first occurrence, rotated arrays, and searching over the answer.',
      lessons: [
        { id: 'binary-search', title: 'Binary search', href: 'lessons/binary-search.html' },
        { id: 'binary-search-variants', title: 'Binary search beyond sorted arrays', href: 'lessons/binary-search-variants.html' },
      ],
    },
    {
      title: 'Two pointers and sliding window',
      quiz: 'quizzes/chapter-21.html',
      blurb: 'Turning quadratic array problems into one pass: pointers from both ends, read and write pointers, and windows that slide, grow and shrink.',
      lessons: [
        { id: 'two-pointers', title: 'Two pointers', href: 'lessons/two-pointers.html' },
        { id: 'sliding-window', title: 'Sliding window', href: 'lessons/sliding-window.html' },
      ],
    },
    {
      title: 'Spanning trees and negative edges',
      quiz: 'quizzes/chapter-22.html',
      blurb: 'Advanced graph algorithms: Kruskal and Prim for minimum spanning trees, and Bellman-Ford for shortest paths with negative weights.',
      lessons: [
        { id: 'mst', title: 'Minimum spanning trees', href: 'lessons/mst.html' },
        { id: 'bellman-ford', title: 'Bellman-Ford and negative edges', href: 'lessons/bellman-ford.html' },
      ],
    },
    {
      title: 'All pairs and guided search',
      quiz: 'quizzes/chapter-23.html',
      blurb: 'Floyd-Warshall for every pair of vertices, and A* for fast point-to-point search with a heuristic.',
      lessons: [
        { id: 'floyd-warshall', title: 'Floyd-Warshall: all pairs', href: 'lessons/floyd-warshall.html' },
        { id: 'a-star', title: 'A* search', href: 'lessons/a-star.html' },
      ],
    },
    {
      title: 'Heaps, selection and counting',
      quiz: 'quizzes/chapter-24.html',
      blurb: 'Heap sort, quickselect for the k-th element, and sorting without comparisons: counting sort and radix sort.',
      lessons: [
        { id: 'heap-select', title: 'Heap sort and quickselect', href: 'lessons/heap-select.html' },
        { id: 'counting-radix', title: 'Counting and radix sort', href: 'lessons/counting-radix.html' },
      ],
    },
    {
      title: 'String matching',
      quiz: 'quizzes/chapter-25.html',
      blurb: 'Finding a pattern in a text without restarting: KMP with its failure table, and Rabin-Karp with a rolling hash.',
      lessons: [
        { id: 'kmp', title: 'KMP string matching', href: 'lessons/kmp.html' },
        { id: 'rabin-karp', title: 'Rabin-Karp rolling hash', href: 'lessons/rabin-karp.html' },
      ],
    },
  ];

  /* Phases group chapters by index range (from and to are inclusive, 0-based). */
  var PHASES = [
    { n: 1, title: 'Python foundations', blurb: 'Python for someone who thinks in C: names and objects, types, control flow, functions, memory and arrays, hashing, and the standard-library toolbox.', from: 0, to: 6 },
    { n: 2, title: 'Core data structures', blurb: 'Linked lists, stacks and queues, trees, heaps and tries, drawn as nodes and pointers that move as the code runs.', from: 7, to: 10 },
    { n: 3, title: 'Graphs, DP and analysis', blurb: 'Graph traversal and shortest paths, dynamic programming, and reasoning about time and space complexity.', from: 11, to: 14 },
    { n: 4, title: 'Object-oriented design', blurb: 'Classes and objects, inheritance and composition, iterators, generators, decorators and dataclasses, in Python with the C equivalents.', from: 15, to: 17 },
    { n: 5, title: 'Algorithms in motion', blurb: 'Sorting, searching and array techniques as animations: bars that slide and swap like a video, with the Python and C code running beside them.', from: 18, to: 20 },
    { n: 6, title: 'Advanced algorithms', blurb: 'Spanning trees, negative edges, and more graph and string algorithms beyond the basics, with the same step-through pictures.', from: 21, to: 24 },
  ];

  function phaseOf(ci) {
    return PHASES.filter(function (p) { return !p.planned && ci >= p.from && ci <= p.to; })[0];
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function flat() {
    var out = [];
    CHAPTERS.forEach(function (c, ci) {
      c.lessons.forEach(function (l, li) {
        out.push({ chapter: c, ci: ci, lesson: l, li: li });
      });
    });
    return out;
  }

  /* One chapter as a row: a big number, the title, and a pill per lesson.
     `base` is '' on the home page and '../' inside lessons/. */
  function chapterCard(c, ci, base, currentId) {
    var sec = el('section', 'chapter');
    sec.appendChild(el('div', 'chapter-num', String(ci + 1)));
    var body = el('div', 'chapter-body');
    var head = el('div', 'chapter-head');
    head.appendChild(el('h2', '', c.title));
    var isReady = c.lessons.some(function (l) { return l.href; });
    head.appendChild(el('span', 'status ' + (isReady ? 'ready' : 'planned'), isReady ? 'Ready' : 'Planned'));
    body.appendChild(head);
    body.appendChild(el('p', 'sub', c.blurb));
    var list = el('div', 'lessons');
    c.lessons.forEach(function (l, li) {
      var pill;
      var n = el('span', 'n', ci + 1 + '.' + (li + 1));
      if (l.id === currentId) {
        pill = el('span', 'pill here');
        pill.setAttribute('aria-current', 'page');
      } else if (l.href) {
        pill = el('a', 'pill ready');
        pill.href = base + l.href;
      } else {
        pill = el('span', 'pill');
      }
      pill.setAttribute('data-id', l.id);
      pill.appendChild(n);
      pill.appendChild(document.createTextNode(l.title));
      if (!l.href) pill.appendChild(el('span', 'sr', ' (planned)'));
      list.appendChild(pill);
    });
    if (c.quiz) {
      var q = el('a', 'pill quiz', 'Chapter quiz');
      q.href = base + c.quiz;
      list.appendChild(q);
    }
    body.appendChild(list);
    sec.appendChild(body);
    return sec;
  }

  function phaseStats(p) {
    var lessons = 0, ready = 0;
    CHAPTERS.slice(p.from, p.to + 1).forEach(function (c) {
      c.lessons.forEach(function (l) { lessons++; if (l.href) ready++; });
    });
    return { chapters: p.to - p.from + 1, lessons: lessons, ready: ready };
  }

  function renderHome(root) {
    var head = el('div', 'outline-head');
    head.appendChild(el('h2', '', 'Choose a phase'));
    var all = flat();
    var ready = all.filter(function (x) { return x.lesson.href; }).length;
    head.appendChild(el('p', '', ready + ' lessons ready'));
    var picker = el('div', 'phases');
    picker.id = 'phases';

    PHASES.forEach(function (p) {
      var open = !p.planned;
      var card = el(open ? 'a' : 'div', 'phase-card' + (open ? '' : ' soon'));
      if (open) card.href = '#phase-' + p.n;
      card.appendChild(el('span', 'phase-tag', 'Phase ' + p.n));
      card.appendChild(el('h3', '', p.title));
      card.appendChild(el('p', '', p.blurb));
      var meta = el('p', 'phase-meta');
      if (open) {
        var st = phaseStats(p);
        meta.textContent = 'Chapters ' + (p.from + 1) + ' to ' + (p.to + 1) + '  \u00b7  ' + st.lessons + ' lessons';
        card.appendChild(meta);
        card.appendChild(el('span', 'phase-go', 'Open phase'));
      } else {
        meta.textContent = 'Coming: ' + p.planned.join(', ');
        card.appendChild(meta);
        card.appendChild(el('span', 'status planned', 'Planned'));
      }
      picker.appendChild(card);
    });
    root.parentNode.insertBefore(head, root);
    root.parentNode.insertBefore(picker, root);
    head.id = 'phases-head';

    PHASES.filter(function (p) { return !p.planned; }).forEach(function (p) {
      var view = el('section', 'phase-view');
      view.id = 'phase-' + p.n;
      view.hidden = true;
      var bar = el('div', 'phase-bar');
      var back = el('a', 'phase-back', 'All phases');
      back.href = '#';
      bar.appendChild(back);
      var t = el('h2', '', 'Phase ' + p.n + ': ' + p.title);
      bar.appendChild(t);
      view.appendChild(bar);
      view.appendChild(el('p', 'phase-blurb', p.blurb));
      var list = el('div', 'chapters');
      CHAPTERS.forEach(function (c, ci) {
        if (ci >= p.from && ci <= p.to) list.appendChild(chapterCard(c, ci, '', null));
      });
      view.appendChild(list);
      root.appendChild(view);
    });

    function route() {
      var h = location.hash || '';
      var m = h.match(/^#phase-(\d+)$/);
      var target = m && document.getElementById('phase-' + m[1]);
      var views = root.querySelectorAll('.phase-view');
      Array.prototype.forEach.call(views, function (v) { v.hidden = v !== target; });
      picker.hidden = !!target;
      head.hidden = !!target;
      var ns = document.querySelector('.next-site'); if (ns) ns.hidden = !!target;
      if (target) {
        var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo(0, Math.max(0, top));
      } else if (h === '' || h === '#') {
        /* leave scroll alone when arriving at the page fresh */
      }
    }
    window.addEventListener('hashchange', route);
    route();
  }

  function renderLesson(id) {
    var all = flat();
    var here = all.filter(function (x) { return x.lesson.id === id; })[0];
    if (!here) return;
    var n = here.ci + 1 + '.' + (here.li + 1);

    var crumb = document.getElementById('crumb');
    if (crumb) {
      var home = el('a', '', 'All phases');
      home.href = '../index.html';
      crumb.appendChild(home);
      var ph = phaseOf(here.ci);
      if (ph) {
        crumb.appendChild(document.createTextNode('  /  '));
        var pa = el('a', '', 'Phase ' + ph.n);
        pa.href = '../index.html#phase-' + ph.n;
        crumb.appendChild(pa);
      }
      crumb.appendChild(document.createTextNode('  /  Chapter ' + (here.ci + 1) + ': ' + here.chapter.title + '  /  Lesson ' + n));
    }

    var outline = document.getElementById('outline');
    if (outline) outline.appendChild(chapterCard(here.chapter, here.ci, '../', id));

    var pager = document.getElementById('pager');
    if (pager) {
      var i = all.indexOf(here);
      [['Previous', all[i - 1]], ['Next', all[i + 1]]].forEach(function (p) {
        var x = p[1];
        var box = el('div', 'pager-item ' + (p[0] === 'Next' ? 'next' : 'prev'));
        if (!x) return pager.appendChild(box);
        box.appendChild(el('span', 'pager-dir', p[0]));
        var label = x.ci + 1 + '.' + (x.li + 1) + ' ' + x.lesson.title;
        if (x.lesson.href) {
          var a = el('a', '', label);
          a.href = '../' + x.lesson.href;
          box.appendChild(a);
        } else {
          box.appendChild(el('span', 'planned', label + ' (planned)'));
        }
        pager.appendChild(box);
      });
    }
  }

  window.CHAPTERS = CHAPTERS;
  window.PHASES = PHASES;
  window.Course = { renderHome: renderHome, renderLesson: renderLesson };
})();
