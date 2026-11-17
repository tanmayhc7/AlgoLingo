/* AlgoLingo progress as a file.
   The site keeps progress in this browser's localStorage. This script turns it into a plain algolingo_progress.json
   (and back), so it can be read and edited by a person or an LLM, kept in git, and moved between devices.

   - AlgoProgress.snapshot()      -> the progress object (see PROGRESS.md for the shape)
   - AlgoProgress.apply(obj, mode) -> 'merge' (only adds) or 'replace'; returns the number of changes
   - Every page fetches <site>/algolingo_progress.json and merges it in (a file can add progress, never remove it).
   - progress.html (element #pg-root) gets the UI: download, import, copy.
*/
(function () {
  'use strict';

  var VISITED = 'dsav-visited';
  var DATES = 'dsav-dates';
  var BASE = window.SITE_BASE || '';

  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function ldel(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  function lj(k, def) { try { return JSON.parse(ls(k) || ''); } catch (e) { return def; } }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()); }

  function chapters() { return window.CHAPTERS || []; }
  function problems() { return (window.LC && window.LC.PROBLEMS) || []; }

  /* ---------- local state -> object ---------- */
  function snapshot() {
    var visited = lj(VISITED, []);
    var dates = lj(DATES, {}) || {};
    var out = {
      app: 'AlgoLingo',
      version: 1,
      updated: today(),
      instructions: 'To mark something done, set its "done" to true and add "date" (YYYY-MM-DD). Keep the ids and keys as they are. Add free notes to "log". Full format: PROGRESS.md.',
      lessons: {},
      quizzes: {},
      problems: {},
      notes: {},
      log: [],
    };
    chapters().forEach(function (c, i) {
      var n = i + 1;
      var qdone = !!ls('dsav-qdone-' + n);
      c.lessons.forEach(function (l) {
        if (!l.href) return;
        var d = visited.indexOf(l.id) >= 0 || qdone;
        var e = { chapter: n, title: l.title, done: d };
        if (d && dates[l.id]) e.date = dates[l.id];
        out.lessons[l.id] = e;
      });
      var q = { title: c.title, done: qdone };
      var meta = lj('dsav-qmeta-' + n, null);
      if (meta && typeof meta.total === 'number') { q.correct = meta.correct; q.total = meta.total; }
      if (qdone && dates['quiz-' + n]) q.date = dates['quiz-' + n];
      out.quizzes[n] = q;
      var note = ls('dsav-notes-' + n);
      if (note) out.notes[n] = note;
    });
    problems().forEach(function (p) {
      var d = visited.indexOf(p.id) >= 0;
      var e = { number: p.num, title: p.title, difficulty: p.diff, pattern: p.pattern, done: d };
      if (d && dates[p.id]) e.date = dates[p.id];
      out.problems[p.id] = e;
    });
    return out;
  }

  /* ---------- object -> local state ---------- */
  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }

  function check(f) {
    if (!isObj(f) || (!isObj(f.lessons) && !isObj(f.quizzes) && !isObj(f.problems))) {
      throw new Error('This does not look like an AlgoLingo progress file (no "lessons", "quizzes" or "problems").');
    }
  }

  function flag(e) { return e === true || (isObj(e) && e.done === true); }
  function edate(e) { return isObj(e) && typeof e.date === 'string' ? e.date : ''; }

  function apply(f, mode) {
    check(f);
    var replace = mode === 'replace';
    var changes = 0;
    var visited = lj(VISITED, []);
    var dates = lj(DATES, {}) || {};
    var wanted = {};

    function mark(id, e) {
      if (!flag(e)) return;
      wanted[id] = true;
      if (visited.indexOf(id) < 0) { visited.push(id); changes++; }
      var d = edate(e);
      if (d && dates[id] !== d && (replace || !dates[id])) { dates[id] = d; }
    }
    Object.keys(f.lessons || {}).forEach(function (id) { mark(id, f.lessons[id]); });
    Object.keys(f.problems || {}).forEach(function (id) { mark(id, f.problems[id]); });
    if (replace) {
      var keep = visited.filter(function (id) { return wanted[id]; });
      changes += visited.length - keep.length;
      visited = keep;
    }
    lset(VISITED, JSON.stringify(visited));

    Object.keys(f.quizzes || {}).forEach(function (n) {
      var q = f.quizzes[n];
      var have = !!ls('dsav-qdone-' + n);
      if (flag(q)) {
        if (!have) { lset('dsav-qdone-' + n, 'file'); changes++; }
        /* a file can say "5 of 6 right" without the answers: rebuild a plain record so the quiz page agrees */
        if (isObj(q) && typeof q.total === 'number' && typeof q.correct === 'number' && !ls('dsav-quiz-' + n)) {
          var map = {};
          for (var i = 0; i < q.total; i++) map[i] = i < q.correct;
          lset('dsav-quiz-' + n, JSON.stringify(map));
          lset('dsav-qmeta-' + n, JSON.stringify({ correct: q.correct, total: q.total }));
        }
        var d = edate(q);
        if (d && (replace || !dates['quiz-' + n])) dates['quiz-' + n] = d;
      } else if (replace && have) {
        ldel('dsav-qdone-' + n);
        changes++;
      }
    });
    lset(DATES, JSON.stringify(dates));

    Object.keys(f.notes || {}).forEach(function (n) {
      if (typeof f.notes[n] === 'string' && f.notes[n] && (replace || !ls('dsav-notes-' + n))) {
        if (ls('dsav-notes-' + n) !== f.notes[n]) { lset('dsav-notes-' + n, f.notes[n]); changes++; }
      }
    });
    return changes;
  }

  window.AlgoProgress = { snapshot: snapshot, apply: apply, today: today };

  /* ---------- every page: merge algolingo_progress.json from the site, if it exists ---------- */
  function autoMerge() {
    if (!BASE || typeof fetch !== 'function') return;
    fetch(BASE + 'algolingo_progress.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (f) {
        if (!f) return;
        var n = 0;
        try { n = apply(f, 'merge'); } catch (e) { return; }
        /* the page already drew itself from the old state: reload once so badges and ticks show the file's progress */
        var tab = null;
        try { tab = sessionStorage.getItem('dsav-filesync'); } catch (e) { /* ignore */ }
        if (n > 0 && !tab) {
          try { sessionStorage.setItem('dsav-filesync', '1'); } catch (e) { /* ignore */ }
          if (!document.getElementById('pg-root')) location.reload();
        }
        var pg = document.getElementById('pg-root');
        if (pg && n > 0) renderPage(pg);
      })
      .catch(function () { /* no file, or opened from disk: nothing to merge */ });
  }

  /* ---------- the Progress page ---------- */
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  function renderPage(root) {
    root.textContent = '';
    var s = snapshot();
    var L = Object.keys(s.lessons), Q = Object.keys(s.quizzes), P = Object.keys(s.problems);
    function count(map, keys) { return keys.filter(function (k) { return map[k].done; }).length; }

    var tiles = h('div', { class: 'pg-tiles' }, [
      tile('Lessons', count(s.lessons, L), L.length),
      tile('Chapter quizzes', count(s.quizzes, Q), Q.length),
      tile('LeetCode problems', count(s.problems, P), P.length),
    ]);
    root.appendChild(tiles);

    var json = JSON.stringify(s, null, 2);
    var msg = h('p', { class: 'pg-msg', role: 'status', 'aria-live': 'polite' });

    var dl = h('button', { class: 'tool', type: 'button', text: 'Download algolingo_progress.json' });
    dl.addEventListener('click', function () {
      var a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: 'algolingo_progress.json' });
      document.body.appendChild(a); a.click(); a.remove();
      msg.textContent = 'Downloaded. Put it at the top of the repo as algolingo_progress.json, or hand it to your LLM.';
    });
    var cp = h('button', { class: 'tool', type: 'button', text: 'Copy JSON' });
    cp.addEventListener('click', function () {
      var ok = function () { msg.textContent = 'Copied.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(json).then(ok, function () { ta.select(); });
      else { ta.select(); }
    });
    var file = h('input', { type: 'file', accept: 'application/json,.json', id: 'pg-file' });
    var mode = h('select', { id: 'pg-mode', 'aria-label': 'Import mode' }, [
      h('option', { value: 'merge', text: 'Merge (only adds progress)' }),
      h('option', { value: 'replace', text: 'Replace (make this device match the file)' }),
    ]);
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var n = apply(JSON.parse(String(r.result)), mode.value);
          renderPage(root);
          root.querySelector('.pg-msg').textContent = 'Imported ' + f.name + ': ' + n + ' change' + (n === 1 ? '' : 's') + '.';
        } catch (e) {
          msg.textContent = 'Could not import: ' + e.message;
        }
      };
      r.readAsText(f);
    });

    root.appendChild(h('div', { class: 'pg-actions' }, [
      dl, cp,
      h('label', { class: 'pg-import' }, [h('span', { text: 'Import a file' }), file]),
      mode,
    ]));
    root.appendChild(msg);

    /* by chapter */
    var list = h('div', { class: 'pg-chapters' });
    chapters().forEach(function (c, i) {
      var n = i + 1;
      var items = c.lessons.filter(function (l) { return l.href; });
      if (!items.length) return;
      var q = s.quizzes[n];
      var done = items.filter(function (l) { return s.lessons[l.id] && s.lessons[l.id].done; }).length;
      var row = h('div', { class: 'pg-chapter' }, [
        h('h3', {}, [
          h('span', { class: 'pg-num', text: String(n) }),
          h('span', { text: c.title }),
          h('span', { class: 'pg-count' + (done === items.length ? ' full' : ''), text: done + ' / ' + items.length }),
        ]),
        h('ul', { class: 'pg-lessons' }, items.map(function (l) {
          var d = s.lessons[l.id] && s.lessons[l.id].done;
          var li = h('li', { class: d ? 'done' : '' });
          li.appendChild(h('a', { href: BASE + l.href, text: l.title }));
          return li;
        })),
        h('p', { class: 'pg-quiz' + (q && q.done ? ' done' : '') }, [
          h('a', { href: BASE + c.quiz, text: 'Chapter quiz' }),
          h('span', { text: q && q.done ? (typeof q.total === 'number' ? ' · done, ' + q.correct + ' of ' + q.total + ' right' : ' · done') : ' · not finished' }),
        ]),
      ]);
      list.appendChild(row);
    });
    root.appendChild(list);

    var ta = h('textarea', { class: 'pg-json', readonly: 'readonly', rows: '10', 'aria-label': 'Progress as JSON' });
    ta.value = json;
    root.appendChild(h('details', { class: 'pg-raw' }, [h('summary', { text: 'See the file contents' }), ta]));
  }

  function tile(label, n, total) {
    return h('div', { class: 'pg-tile' }, [
      h('div', { class: 'pg-big', text: n + ' / ' + total }),
      h('div', { class: 'pg-label', text: label }),
    ]);
  }

  function boot() {
    var root = document.getElementById('pg-root');
    if (root) renderPage(root);
    autoMerge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
