/* Algorithm animations: bars that slide and swap like a video, with the code beside them.
   A scene supplies `input` (array of numbers) and `run(T)`, which executes the algorithm in JavaScript
   and records frames through the tracer T. The player then plays the frames back with smooth movement,
   a scrubber, and the current line highlighted in both the Python and the C listing.

   Tracer API (positions are indexes in the array at the moment of the call):
     T.frame(pl, cl, say, o)   record a frame. pl/cl are 0-based code lines (-1 for none).
        o: { cmp:[pos], swp:[pos], sorted:[pos], pivot:pos, found:[pos], dim:[pos], min:pos, mark:[pos],
             ptr:{name:pos}, band:[lo,hi], vars:{name:value} }
     T.swap(i, j)              exchange the elements at two positions (no frame)
     T.put(pos, id)            place element id at pos (merge steps use T.order directly)
     T.v(pos)                  value at position
     T.cmps++ / T.swaps++      counters shown under the animation
     T.range(a, b)             [a..b]
*/
(function () {
  'use strict';
  var U = window.DSAV.util;
  var h = U.h;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Tracer(vals) {
    this.vals = vals.slice();
    this.order = vals.map(function (_, i) { return i; });
    this.frames = [];
    this.cmps = 0;
    this.swaps = 0;
    this.n = vals.length;
  }
  Tracer.prototype.v = function (pos) { return this.vals[this.order[pos]]; };
  Tracer.prototype.swap = function (i, j) {
    var t = this.order[i];
    this.order[i] = this.order[j];
    this.order[j] = t;
  };
  Tracer.prototype.range = function (a, b) {
    var r = [];
    for (var i = a; i <= b; i++) r.push(i);
    return r;
  };
  Tracer.prototype.frame = function (pl, cl, say, o) {
    o = o || {};
    var self = this;
    var cls = {};
    function tag(list, c) {
      (list || []).forEach(function (p) { if (p >= 0 && p < self.n) cls[self.order[p]] = (cls[self.order[p]] ? cls[self.order[p]] + ' ' : '') + c; });
    }
    tag(o.sorted, 'sorted');
    tag(o.dim, 'dim');
    tag(o.mark, 'mark');
    tag(o.cmp, 'cmp');
    tag(o.swp, 'swp');
    tag(o.found, 'found');
    if (o.min != null) tag([o.min], 'min');
    if (o.pivot != null) tag([o.pivot], 'pivot');
    var ptr = [];
    Object.keys(o.ptr || {}).forEach(function (k) { if (o.ptr[k] != null && o.ptr[k] >= 0) ptr.push([k, o.ptr[k]]); });
    this.frames.push({
      pl: pl, cl: cl, say: say,
      order: this.order.slice(), cls: cls, ptr: ptr, band: o.band || null,
      vars: o.vars || null, cmps: this.cmps, swaps: this.swaps,
    });
  };

  function mount(L) {
    var $ = function (id) { return document.getElementById(id); };
    var scenes = L.scenes;
    var cur = null, frames = [], idx = 0, timer = 0, speed = 1, bars = {}, ptrEls = {};
    var dragging = false;

    $('title').textContent = L.title;
    document.title = L.title + ' | DSA Visualizer';
    $('lede').textContent = L.lede;

    /* ---- panels ---- */
    var stage = h('div', { class: 'astage' });
    var band = h('div', { class: 'aband' });
    var barsBox = h('div', { class: 'abars' });
    var ptrBox = h('div', { class: 'aptrs' });
    stage.appendChild(band);
    stage.appendChild(barsBox);
    var vars = h('p', { class: 'avars', 'aria-live': 'polite' });
    var stats = h('p', { class: 'astats' });
    var legend = h('p', { class: 'alegend' });
    var cap = h('p', { class: 'caption acap', 'aria-live': 'polite' });
    var video = h('article', { class: 'panel a-panel', 'data-lang': 'algo' }, [
      h('header', {}, [h('h2', { text: 'Animation' }), h('p', { text: 'Press play, or drag the bar to scrub' })]),
      stage, ptrBox, h('div', { class: 'ameta' }, [vars, stats]), legend, cap,
    ]);
    function codePanel(lang, name, sub) {
      var code = h('ol', { class: 'code', 'aria-label': name + ' code' });
      return { el: h('article', { class: 'panel', 'data-lang': lang }, [h('header', {}, [h('h2', { text: name }), h('p', { text: sub })]), code]), code: code };
    }
    var pp = codePanel('py', 'Python', 'The code that is running');
    var cp = codePanel('c', 'C', 'The same algorithm');
    $('panels').classList.add('apanels');
    $('panels').appendChild(video);
    $('panels').appendChild(pp.el);
    $('panels').appendChild(cp.el);

    /* ---- transport ---- */
    var bPlay = h('button', { class: 'btn primary', type: 'button', text: 'Play', onclick: toggle });
    var bBack = h('button', { class: 'btn', type: 'button', 'aria-label': 'Previous frame', text: '‹', onclick: function () { stop(); go(idx - 1); } });
    var bFwd = h('button', { class: 'btn', type: 'button', 'aria-label': 'Next frame', text: '›', onclick: function () { stop(); go(idx + 1); } });
    var bReset = h('button', { class: 'btn ghost', type: 'button', text: 'Restart', onclick: function () { stop(); go(0); } });
    var scrub = h('input', { type: 'range', class: 'scrub', min: '0', max: '0', value: '0', step: '1', 'aria-label': 'Playback position' });
    var count = h('span', { class: 'count' });
    var speedSel = h('select', { id: 'speed', 'aria-label': 'Play speed' }, [
      h('option', { value: '0.25', text: '0.25x' }), h('option', { value: '0.5', text: '0.5x' }), h('option', { value: '1', text: '1x' }), h('option', { value: '2', text: '2x' }), h('option', { value: '4', text: '4x' }),
    ]);
    speedSel.value = '1';
    $('controls').classList.add('adock');
    $('controls').appendChild(h('div', { class: 'btns' }, [bReset, bBack, bPlay, bFwd]));
    $('controls').appendChild(scrub);
    $('controls').appendChild(count);
    $('opts').appendChild(h('label', { for: 'speed' }, [document.createTextNode('Speed'), speedSel]));
    speedSel.addEventListener('change', function () { speed = +speedSel.value; if (timer) { stop(); toggle(); } });

    scrub.addEventListener('input', function () {
      stop();
      dragging = true;
      stage.style.setProperty('--dur', '90ms');
      go(+scrub.value);
    });
    scrub.addEventListener('change', function () { dragging = false; });

    function interval() { return 760 / speed; }
    function setDur() {
      var d = reduce ? 0 : Math.max(120, Math.min(560, interval() * 0.75));
      stage.style.setProperty('--dur', d + 'ms');
    }
    function stop() {
      if (timer) clearTimeout(timer);
      timer = 0;
      bPlay.textContent = 'Play';
    }
    function tickPlay() {
      if (idx >= frames.length - 1) return stop();
      go(idx + 1);
      timer = setTimeout(tickPlay, interval());
    }
    function toggle() {
      if (timer) return stop();
      if (idx >= frames.length - 1) { setDur(); go(0); }
      setDur();
      bPlay.textContent = 'Pause';
      timer = setTimeout(tickPlay, interval() * 0.6);
    }

    /* ---- drawing ---- */
    function build(sc) {
      barsBox.textContent = '';
      ptrBox.textContent = '';
      bars = {}; ptrEls = {};
      var n = sc.input.length;
      var max = Math.max.apply(null, sc.input);
      var w = (100 / n) + '%';
      sc.input.forEach(function (v, id) {
        var fill = h('i', { class: 'afill' });
        fill.style.height = Math.max(6, (v / max) * 86) + '%';
        var val = h('span', { class: 'aval', text: String(v) });
        val.style.bottom = 'calc(' + Math.max(6, (v / max) * 86) + '% + 3px)';
        var el = h('div', { class: 'abar' }, [fill, val]);
        el.style.width = w;
        el.style.transform = 'translateX(' + id * 100 + '%)';
        if (n > 18) val.style.display = 'none';
        barsBox.appendChild(el);
        bars[id] = el;
      });
      stage.classList.toggle('dense', n > 18);
    }
    function ptrEl(name, n) {
      if (ptrEls[name]) return ptrEls[name];
      var el = h('div', { class: 'aptr' }, [h('span', { class: 'ar', text: '▲' }), h('b', { text: name })]);
      el.style.width = (100 / n) + '%';
      ptrBox.appendChild(el);
      ptrEls[name] = el;
      return el;
    }
    function draw(f) {
      var n = cur.input.length;
      var posOf = {};
      f.order.forEach(function (id, pos) { posOf[id] = pos; });
      Object.keys(bars).forEach(function (id) {
        var el = bars[id];
        el.style.transform = 'translateX(' + posOf[id] * 100 + '%)';
        el.className = 'abar' + (f.cls[id] ? ' ' + f.cls[id] : '');
        el.style.zIndex = /swp|cmp|pivot/.test(f.cls[id] || '') ? 2 : 1;
      });
      /* pointers: stack the ones that share a position */
      var seen = {};
      var live = {};
      f.ptr.forEach(function (p) {
        var el = ptrEl(p[0], n);
        var k = seen[p[1]] || 0;
        seen[p[1]] = k + 1;
        el.style.transform = 'translate(' + p[1] * 100 + '%,' + k * 26 + 'px)';
        el.style.opacity = '1';
        live[p[0]] = true;
      });
      Object.keys(ptrEls).forEach(function (k) { if (!live[k]) ptrEls[k].style.opacity = '0'; });
      if (f.band) {
        band.style.opacity = '1';
        band.style.left = (f.band[0] * 100 / n) + '%';
        band.style.width = ((f.band[1] - f.band[0] + 1) * 100 / n) + '%';
      } else band.style.opacity = '0';
      vars.textContent = '';
      if (f.vars) Object.keys(f.vars).forEach(function (k) {
        vars.appendChild(h('span', { class: 'avar' }, [h('em', { text: k }), document.createTextNode(' = ' + f.vars[k])]));
      });
      stats.textContent = 'Comparisons ' + f.cmps + '   Swaps/moves ' + f.swaps;
    }
    function renderCode(list, lines) {
      list.textContent = '';
      lines.forEach(function (line, i) {
        list.appendChild(h('li', { html: '<span class="no">' + (i + 1) + '</span><span>' + U.highlight(line) + '</span>' }));
      });
    }
    function go(i) {
      if (i < 0 || i >= frames.length) return;
      idx = i;
      var f = frames[i];
      draw(f);
      [].forEach.call(pp.code.children, function (li, n) { li.classList.toggle('on', n === f.pl); });
      [].forEach.call(cp.code.children, function (li, n) { li.classList.toggle('on', n === f.cl); });
      cap.textContent = f.say;
      scrub.value = String(i);
      scrub.style.setProperty('--pos', (frames.length > 1 ? (i / (frames.length - 1)) * 100 : 0) + '%');
      count.textContent = (i === 0 ? 'Start' : i === frames.length - 1 ? 'Done' : 'Frame ' + i + ' of ' + (frames.length - 1));
      bBack.disabled = i === 0;
      bFwd.disabled = i === frames.length - 1;
      bReset.disabled = i === 0;
    }

    var tabs = $('scenes');
    scenes.forEach(function (sc) {
      tabs.appendChild(h('button', { class: 'scene-tab', type: 'button', role: 'tab', id: 'tab-' + sc.id, text: sc.title, onclick: function () { location.hash = sc.id; } }));
    });

    function renderPredict(sc) {
      var box = $('predict-body');
      box.textContent = '';
      box.appendChild(h('p', { class: 'q', html: sc.predict.q }));
      var why = h('p', { class: 'why', hidden: 'hidden' });
      var row = h('div', { class: 'choices' });
      sc.predict.options.forEach(function (o, n) {
        var b = h('button', { class: 'choice', type: 'button', text: o });
        b.addEventListener('click', function () {
          [].forEach.call(row.children, function (c, k) { c.disabled = true; if (k === sc.predict.answer) c.classList.add('right'); });
          if (n !== sc.predict.answer) b.classList.add('wrong');
          why.hidden = false;
          why.textContent = (n === sc.predict.answer ? 'Right. ' : 'Not quite. ') + sc.predict.why;
        });
        row.appendChild(b);
      });
      box.appendChild(row);
      box.appendChild(why);
    }

    var KEYS = { cmp: 'Comparing', swp: 'Swapping', sorted: 'Sorted', pivot: 'Pivot', found: 'Found', min: 'Minimum', mark: 'In focus', dim: 'Ruled out' };
    function select(id) {
      var sc = scenes.filter(function (s) { return s.id === id; })[0] || scenes[0];
      stop();
      cur = sc;
      [].forEach.call(tabs.children, function (t, n) { t.setAttribute('aria-selected', scenes[n] === sc ? 'true' : 'false'); });
      $('blurb').textContent = sc.blurb;
      $('trap-text').textContent = sc.trap;
      renderCode(pp.code, sc.pyCode);
      renderCode(cp.code, sc.cCode);
      var T = new Tracer(sc.input);
      sc.run(T);
      frames = T.frames;
      build(sc);
      var used = {};
      frames.forEach(function (f) { Object.keys(f.cls).forEach(function (k) { f.cls[k].split(' ').forEach(function (c) { used[c] = 1; }); }); });
      legend.textContent = '';
      Object.keys(KEYS).forEach(function (k) {
        if (used[k]) legend.appendChild(h('span', { class: 'akey ' + k }, [h('i'), document.createTextNode((sc.keys && sc.keys[k]) || KEYS[k])]));
      });
      scrub.max = String(frames.length - 1);
      renderPredict(sc);
      setDur();
      go(0);
    }

    renderDepthSafe();
    function renderDepthSafe() { U.renderDepth(window.DEPTH); }
    var tb = $('builtins');
    L.builtins.forEach(function (r) {
      tb.appendChild(h('tr', {}, [h('th', { html: '<code>' + U.esc(r[0]) + '</code>' }), h('td', { text: r[1] })]));
    });

    window.addEventListener('hashchange', function () { select(location.hash.slice(1)); });
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'BUTTON' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { stop(); go(idx + 1); }
      else if (e.key === 'ArrowLeft') { stop(); go(idx - 1); }
      else if (e.key === ' ') { e.preventDefault(); toggle(); }
    });

    select(location.hash.slice(1));
    window.__dsav = { go: go, snaps: function () { return frames; }, index: function () { return idx; }, play: toggle };
  }

  window.DSAV.mountAlgo = mount;
  window.DSAV.Tracer = Tracer;
})();
