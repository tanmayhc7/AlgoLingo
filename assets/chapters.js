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
      blurb: 'Numbers, truth values and strings, and where they differ from C.',
      lessons: [
        { id: 'numbers', title: 'Numbers, booleans and None' },
        { id: 'strings', title: 'Strings as sequences' },
      ],
    },
    {
      title: 'Control flow',
      quiz: 'quizzes/chapter-3.html',
      blurb: 'Decisions, loops that walk over things, and reading errors.',
      lessons: [
        { id: 'conditions', title: 'Conditions' },
        { id: 'loops', title: 'Loops', href: 'lessons/loops.html' },
        { id: 'errors', title: 'Errors and tracebacks' },
      ],
    },
    {
      title: 'Functions and shorthands',
      quiz: 'quizzes/chapter-4.html',
      blurb: 'Functions, the idioms that replace C boilerplate, and comprehensions.',
      lessons: [
        { id: 'functions', title: 'Functions' },
        { id: 'shorthands', title: 'Shorthands and idioms' },
        { id: 'comprehensions', title: 'Comprehensions', href: 'lessons/comprehensions.html' },
      ],
    },
    {
      title: 'Memory and arrays',
      blurb: 'How memory holds an array, then lists and tuples.',
      lessons: [
        { id: 'array-memory', title: 'How memory holds an array' },
        { id: 'lists', title: 'Lists' },
        { id: 'tuples', title: 'Tuples' },
      ],
    },
    {
      title: 'Hashing',
      blurb: 'Hash tables built by hand, then dicts and sets.',
      lessons: [
        { id: 'hashing', title: 'Hashing' },
        { id: 'dicts', title: 'Dicts' },
        { id: 'sets', title: 'Sets' },
      ],
    },
    {
      title: 'Toolbox',
      blurb: 'The standard-library pieces and patterns you will reach for in problems.',
      lessons: [
        { id: 'sorting-helpers', title: 'Sorting and searching helpers' },
        { id: 'collections', title: 'collections and friends' },
        { id: 'choosing', title: 'Choosing a container' },
        { id: 'patterns', title: 'Patterns you will reuse' },
        { id: 'survival-kit', title: 'Python survival kit for coding problems' },
      ],
    },
  ];

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

  function renderHome(root) {
    var all = flat();
    var ready = all.filter(function (x) { return x.lesson.href; }).length;
    var bar = el('div', 'outline-head');
    bar.appendChild(el('h2', '', 'Course outline'));
    bar.appendChild(el('p', '', ready + ' of ' + all.length + ' lessons ready'));
    root.parentNode.insertBefore(bar, root);
    CHAPTERS.forEach(function (c, ci) {
      root.appendChild(chapterCard(c, ci, '', null));
    });
  }

  function renderLesson(id) {
    var all = flat();
    var here = all.filter(function (x) { return x.lesson.id === id; })[0];
    if (!here) return;
    var n = here.ci + 1 + '.' + (here.li + 1);

    var crumb = document.getElementById('crumb');
    if (crumb) {
      var home = el('a', '', 'All chapters');
      home.href = '../index.html';
      crumb.appendChild(home);
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
  window.Course = { renderHome: renderHome, renderLesson: renderLesson };
})();
