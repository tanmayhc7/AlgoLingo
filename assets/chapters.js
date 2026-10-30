/* The course outline. Add `href` to a lesson when its page exists (relative to the site root).
   Home page, chapter outline, breadcrumb and prev/next links all read from this list. */
(function () {
  'use strict';

  var CHAPTERS = [
    {
      title: 'Getting started',
      blurb: 'How the two languages run, and what a variable really is.',
      lessons: [
        { id: 'compiled-vs-interpreted', title: 'Compiled versus interpreted: how C and Python run' },
        { id: 'running-python', title: 'Running Python programs' },
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
      blurb: 'Decisions, loops that walk over things, and reading errors.',
      lessons: [
        { id: 'conditions', title: 'Conditions' },
        { id: 'loops', title: 'Loops' },
        { id: 'errors', title: 'Errors and tracebacks' },
      ],
    },
    {
      title: 'Functions and shorthands',
      blurb: 'Functions, the idioms that replace C boilerplate, and comprehensions.',
      lessons: [
        { id: 'functions', title: 'Functions' },
        { id: 'shorthands', title: 'Shorthands and idioms' },
        { id: 'comprehensions', title: 'Comprehensions' },
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

  /* One chapter as a card with its lessons. `base` is '' on the home page and '../' inside lessons/. */
  function chapterCard(c, ci, base, currentId) {
    var sec = el('section', 'card chapter');
    sec.appendChild(el('h2', '', 'Chapter ' + (ci + 1) + ': ' + c.title));
    sec.appendChild(el('p', 'sub', c.blurb));
    var ol = el('ol');
    c.lessons.forEach(function (l, li) {
      var item = el('li');
      item.appendChild(el('span', 'num', ci + 1 + '.' + (li + 1)));
      var title;
      if (l.href && l.id !== currentId) {
        title = el('a', '', l.title);
        title.href = base + l.href;
      } else {
        title = el('span', l.id === currentId ? 'here' : '', l.title);
        if (l.id === currentId) title.setAttribute('aria-current', 'page');
      }
      item.appendChild(title);
      item.appendChild(el('span', 'chip' + (l.href ? ' ready' : ''), l.href ? (l.id === currentId ? 'You are here' : 'Ready') : 'Planned'));
      ol.appendChild(item);
    });
    sec.appendChild(ol);
    return sec;
  }

  function renderHome(root) {
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
