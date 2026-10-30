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
})();
