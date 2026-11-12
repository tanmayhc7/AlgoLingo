/* Glossary: renders glossary.html, and links jargon on every other page to its entry.
   Loaded lazily by site.js together with glossary-data.js. */
(function () {
  'use strict';
  var G = window.GLOSSARY || [];
  var BASE = window.GLOSSARY_BASE || '';
  var byId = {};
  G.forEach(function (e) { byId[e.id] = e; });

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function plainText(s) { return String(s).replace(/`/g, ''); }
  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  /* ---------- the Glossary page ---------- */
  function renderPage(host) {
    var sorted = G.slice().sort(function (a, b) {
      return a.term.toLowerCase() < b.term.toLowerCase() ? -1 : 1;
    });
    var search = document.getElementById('gl-search');
    var jump = document.getElementById('gl-jump');
    var empty = document.getElementById('gl-empty');
    var count = document.getElementById('gl-count');
    var letters = {};
    var cards = [];

    sorted.forEach(function (e) {
      var L = e.term.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(L)) L = '#';
      var sec = letters[L];
      if (!sec) {
        sec = letters[L] = { head: h('h2', { class: 'gl-letter', id: 'letter-' + L, text: L }), items: [] };
        host.appendChild(sec.head);
      }
      var kids = [
        h('h3', { class: 'gl-term' }, [h('a', { href: '#' + e.id, text: e.term })]),
        h('p', { class: 'gl-plain', html: rich(e.plain) })
      ];
      if (e.example) kids.push(h('p', { class: 'gl-ex', html: '<b>Example</b> ' + rich(e.example) }));
      if (e.c) kids.push(h('p', { class: 'gl-c', html: '<b>If you know C</b> ' + rich(e.c) }));
      var foot = [];
      if (e.also && e.also.length) foot.push(h('span', { class: 'gl-also', text: 'Also written: ' + e.also.join(', ') }));
      if (e.see && e.see.length) {
        var s = h('span', { class: 'gl-see' }, [document.createTextNode('See also ')]);
        e.see.forEach(function (id, i) {
          if (!byId[id]) return;
          if (i) s.appendChild(document.createTextNode(', '));
          s.appendChild(h('a', { href: '#' + id, text: byId[id].term }));
        });
        foot.push(s);
      }
      if (e.learn && e.learn.length) {
        var l = h('span', { class: 'gl-learn' }, [document.createTextNode('See it run: ')]);
        e.learn.forEach(function (x, i) {
          if (i) l.appendChild(document.createTextNode(', '));
          l.appendChild(h('a', { href: x[1], text: x[0] }));
        });
        foot.push(l);
      }
      if (foot.length) kids.push(h('div', { class: 'gl-foot' }, foot));
      var card = h('article', { class: 'gl-card', id: e.id }, kids);
      host.appendChild(card);
      cards.push({ el: card, e: e, letter: L });
      sec.items.push(card);
    });

    if (jump) {
      Object.keys(letters).sort().forEach(function (L) {
        jump.appendChild(h('a', { href: '#letter-' + L, text: L }));
      });
    }

    function filter() {
      var q = (search.value || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var hay = (c.e.term + ' ' + (c.e.also || []).join(' ') + ' ' + plainText(c.e.plain)).toLowerCase();
        var on = !q || q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
        c.el.hidden = !on;
        if (on) shown++;
      });
      Object.keys(letters).forEach(function (L) {
        var any = letters[L].items.some(function (el) { return !el.hidden; });
        letters[L].head.hidden = !any;
      });
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = q ? shown + ' of ' + G.length + ' terms' : G.length + ' terms';
    }
    if (search) {
      search.addEventListener('input', filter);
      search.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          filter();
          var q = search.value.trim().toLowerCase();
          var first = (byId[q.replace(/\s+/g, '-')] && document.getElementById(q.replace(/\s+/g, '-'))) || host.querySelector('.gl-card:not([hidden])');
          if (first) first.scrollIntoView({ block: 'center' });
        } else if (ev.key === 'Escape') {
          search.value = '';
          filter();
        }
      });
    }
    filter();
    function mark() {
      Array.prototype.forEach.call(host.querySelectorAll('.gl-hit'), function (x) { x.classList.remove('gl-hit'); });
      Array.prototype.forEach.call(host.querySelectorAll('.gl-from'), function (x) { x.remove(); });
      var t = location.hash && document.getElementById(location.hash.slice(1));
      if (t && t.classList.contains('gl-card')) {
        t.hidden = false;
        t.classList.add('gl-hit');
        if (!t.querySelector('.gl-from')) t.insertBefore(h('p', { class: 'gl-from', text: 'This is the term you clicked.' }), t.firstChild);
        if (t.scrollIntoView) t.scrollIntoView();
      }
    }
    window.addEventListener('hashchange', mark);
    mark();
  }

  /* ---------- linking jargon on other pages ---------- */
  /* common words that would be noisy as links */
  var SKIP_ALIAS = ['raise', 'fake', 'fakes', 'stable', 'memo', 'mask', 'annotations', 'complexity', 'sentinel',
    'probing', 'evaluation', 'extra space', 'dp', 'inheritance', 'bitwise', 'modulo', 'node', 'nodes'];
  var BLOCKS = '.lede, #blurb, #trap-text, #predict-body, .depth-head, .depth-block, #problem, #writeup, .takeaways, .chapter .sub, .outline-head p, .phase-card p';
  var NO_GO = 'a, a.phase-card *, code, pre, button, input, textarea, select, h1, h2, h3, h4, th, svg, .gl';

  /* an entry with pages:[...] only auto-links on those lesson pages (words like "name" mean other things elsewhere) */
  var PAGE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');

  function buildMatcher() {
    var map = {};
    var names = [];
    G.forEach(function (e) {
      if (e.auto === false) return;
      if (e.pages && e.pages.indexOf(PAGE) < 0) return;
      [e.term].concat(e.also || []).forEach(function (n) {
        var k = n.toLowerCase();
        if (SKIP_ALIAS.indexOf(k) >= 0 && k !== e.term.toLowerCase()) return;
        if (map[k]) return;
        map[k] = e;
        names.push(n);
      });
    });
    names.sort(function (a, b) { return b.length - a.length; });
    var parts = names.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); });
    return {
      map: map,
      re: new RegExp('(^|[^A-Za-z0-9_])(' + parts.join('|') + ')(s?)(?![A-Za-z0-9_])', 'gi')
    };
  }

  /* each block links the first mention of every term it contains */
  function linkBlock(block, M) {
    var seen = {};
    Array.prototype.forEach.call(block.querySelectorAll('a.gl'), function (a) { seen[a.getAttribute('data-gl')] = true; });
    var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      var p = n.parentNode;
      if (p.closest && p.closest(NO_GO)) continue;
      nodes.push(n);
    }
    nodes.forEach(function (tn) {
      var text = tn.nodeValue;
      M.re.lastIndex = 0;
      var out = null, last = 0, m;
      while ((m = M.re.exec(text))) {
        var e = M.map[m[2].toLowerCase()];
        if (!e || seen[e.id]) continue;
        seen[e.id] = true;
        if (!out) out = document.createDocumentFragment();
        var start = m.index + m[1].length;
        out.appendChild(document.createTextNode(text.slice(last, start)));
        var a = h('a', {
          class: 'gl', 'data-gl': e.id, href: BASE + 'glossary.html#' + e.id,
          title: 'Glossary: ' + plainText(e.plain), target: '_blank', rel: 'noopener'
        });
        a.textContent = m[2] + m[3];
        out.appendChild(a);
        last = start + m[2].length + m[3].length;
      }
      if (out) {
        out.appendChild(document.createTextNode(text.slice(last)));
        tn.parentNode.replaceChild(out, tn);
      }
    });
  }

  function autolink() {
    var M = buildMatcher();
    var timer = null;
    var obs = null;
    function run() {
      if (obs) obs.disconnect();
      Array.prototype.forEach.call(document.querySelectorAll(BLOCKS), function (b) { linkBlock(b, M); });
      if (obs) obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    obs = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(run, 80);
    });
    run();
  }

  function start() {
    var host = document.getElementById('gl-list');
    if (host) renderPage(host);
    else autolink();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
