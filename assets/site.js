/* Theme toggle shared by every page. Follows the system by default; the choice is remembered. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'dsav-theme';

  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {
    /* storage can be blocked; the page still works */
  }

  function current() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme');
    if (!btn) return;
    function label() {
      btn.textContent = current() === 'dark' ? 'Light mode' : 'Dark mode';
    }
    label();
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {
        /* ignore */
      }
      label();
    });
  });

  /* ---------- motion and progress ---------- */
  var DONE = 'dsav-visited';
  function getDone() {
    try { return JSON.parse(localStorage.getItem(DONE) || '[]'); } catch (e) { return []; }
  }
  function markDone(id) {
    var d = getDone();
    if (d.indexOf(id) < 0) {
      d.push(id);
      try { localStorage.setItem(DONE, JSON.stringify(d)); } catch (e) { /* ignore */ }
    }
  }
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.classList.add('js-motion');

    /* (visits are still recorded, but completion now comes from the chapter quiz) */
    if (window.LESSON && window.LESSON.id) {
      var id = window.LESSON.id;
      var armed = false;
      document.addEventListener('click', function (e) {
        if (armed) return;
        var b = e.target.closest && e.target.closest('button');
        if (b && b.id !== 'theme') { armed = true; markDone(id); }
      });
    }

    /* a lesson is completed when every question of its chapter quiz has been answered */
    var done = [];
    if (window.CHAPTERS) {
      window.CHAPTERS.forEach(function (c) {
        var m = c.quiz && c.quiz.match(/chapter-(\d+)/);
        var ok = false;
        try { ok = !!(m && localStorage.getItem('dsav-qdone-' + m[1])); } catch (e) { /* ignore */ }
        if (ok) c.lessons.forEach(function (l) { done.push(l.id); });
      });
    }
    var pills = document.querySelectorAll('a.pill.ready[data-id], .pill.here[data-id]');
    Array.prototype.forEach.call(pills, function (p) {
      if (done.indexOf(p.getAttribute('data-id')) >= 0) p.classList.add('done');
    });

    /* home page: headline words, progress bar, scroll reveal */
    var h1 = document.querySelector('.hero h1');
    if (h1 && !calm && !h1.dataset.split) {
      h1.dataset.split = '1';
      var words = h1.textContent.split(' ');
      h1.textContent = '';
      words.forEach(function (w, i) {
        var span = document.createElement('span');
        span.className = 'word';
        span.style.animationDelay = 80 + i * 70 + 'ms';
        span.textContent = w;
        h1.appendChild(span);
        h1.appendChild(document.createTextNode(' '));
      });
    }

    var track = document.getElementById('progress');
    if (track && window.CHAPTERS) {
      var all = [];
      window.CHAPTERS.forEach(function (c) {
        c.lessons.forEach(function (l) { if (l.href) all.push(l); });
      });
      var seen = all.filter(function (l) { return done.indexOf(l.id) >= 0; }).length;
      var next = all.filter(function (l) { return done.indexOf(l.id) < 0; })[0];
      document.getElementById('progress-label').textContent = seen + ' of ' + all.length + ' lessons completed';
      var nl = document.getElementById('progress-next');
      if (next) {
        nl.href = next.href;
        nl.textContent = seen ? 'Continue: ' + next.title : 'Start: ' + next.title;
      } else {
        nl.hidden = true;
      }
      track.hidden = false;
      var fill = document.getElementById('progress-fill');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { fill.style.width = (all.length ? (seen / all.length) * 100 : 0) + '%'; });
      });
    }

    var cards = document.querySelectorAll('.chapter');
    if (cards.length) {
      if (calm || !('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(cards, function (c) { c.classList.add('in'); });
      } else {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
          });
        }, { threshold: 0.12 });
        Array.prototype.forEach.call(cards, function (c, i) {
          c.style.transitionDelay = Math.min(i, 4) * 60 + 'ms';
          io.observe(c);
        });
      }
    }

    /* depth section: Q&A answers open smoothly, section reveals on scroll */
    var depth = document.getElementById('depth');
    if (depth && !calm && 'IntersectionObserver' in window) {
      depth.classList.add('reveal');
      var io2 = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { depth.classList.add('in'); io2.disconnect(); }
      }, { threshold: 0.05 });
      io2.observe(depth);
    }
  });
})();
