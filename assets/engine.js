/* DSA Visualizer step engine.
   A lesson is plain data (see assets/lessons/*.js). Each scene lists the same program in Python and C,
   and every step says which line runs and what changes in memory. The engine replays the changes into
   snapshots, so stepping backwards is exact, then draws both memory models and animates the difference. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = reduce ? 1 : 0.2;

  /* ---------- small helpers ---------- */

  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function h(tag, props, kids) {
    var e = document.createElement(tag);
    for (var k in props || {}) {
      var v = props[k];
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    (kids || []).forEach(function (c) {
      e.appendChild(c);
    });
    return e;
  }

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  var TOKENS = /("(?:[^"\\]|\\.)*")|(#.*|\/\/.*|\/\*.*?\*\/)|\b(\d+)\b|\b(int|del|is|and|or|not|in|def|return|if|else|for|while|sizeof)\b/g;

  function highlight(line) {
    return esc(line).replace(TOKENS, function (m, s, c, n) {
      if (s) return '<span class="t-s">' + m + '</span>';
      if (c) return '<span class="t-c">' + m + '</span>';
      if (n) return '<span class="t-n">' + m + '</span>';
      return '<span class="t-k">' + m + '</span>';
    });
  }

  /* ---------- steps -> snapshots ---------- */

  function buildSnapshots(steps) {
    var st = { objs: [], names: [], rows: [], err: null, flash: [], cflash: [] };
    var objCount = 0;
    var rowCount = 0;
    var snaps = [];

    function row(name) {
      for (var i = 0; i < st.rows.length; i++) if (st.rows[i].name === name) return st.rows[i];
      return null;
    }

    steps.forEach(function (step) {
      st.err = null;
      st.flash = [];
      st.cflash = [];

      (step.py || []).forEach(function (op) {
        var kind = op[0];
        if (kind === 'obj') {
          st.objs.push({
            id: op[1],
            type: op[2],
            val: op[3],
            refs: 0,
            addr: '0x' + (0x7f3a10c0 + objCount++ * 0x30).toString(16),
          });
        } else if (kind === 'bind') {
          var t = st.names.filter(function (n) {
            return n.name === op[1];
          })[0];
          if (t) t.to = op[2];
          else st.names.push({ name: op[1], to: op[2] });
        } else if (kind === 'unbind') {
          st.names = st.names.filter(function (n) {
            return n.name !== op[1];
          });
        } else if (kind === 'set') {
          st.objs.forEach(function (o) {
            if (o.id === op[1]) o.val = op[2];
          });
        } else if (kind === 'flash') {
          st.flash = op.slice(1);
        }
      });

      (step.c || []).forEach(function (op) {
        var kind = op[0];
        var r = op[1] && row(op[1]);
        if (kind === 'var') {
          if (r) r.val = op[3];
          else
            st.rows.push({
              name: op[1],
              kind: 'var',
              type: op[2],
              val: op[3],
              addr: '0x' + (0x7ffee1c0 - rowCount++ * 0x10).toString(16),
            });
        } else if (kind === 'setv') {
          r.val = op[2];
        } else if (kind === 'arr') {
          st.rows.push({
            name: op[1],
            kind: 'arr',
            type: op[2],
            vals: op[3].slice(),
            addr: '0x' + (0x7ffee1c0 - rowCount++ * 0x10).toString(16),
          });
        } else if (kind === 'seti') {
          r.vals[op[2]] = op[3];
        } else if (kind === 'ptr') {
          st.rows.push({
            name: op[1],
            kind: 'ptr',
            type: 'int',
            to: op[2],
            addr: '0x' + (0x7ffee1c0 - rowCount++ * 0x10).toString(16),
          });
        } else if (kind === 'err') {
          st.err = op[1];
        } else if (kind === 'flash') {
          st.cflash = op.slice(1);
        }
      });

      /* Python frees an object when nothing points at it. */
      var refs = {};
      st.names.forEach(function (n) {
        refs[n.to] = (refs[n.to] || 0) + 1;
      });
      st.objs = st.objs.filter(function (o) {
        return refs[o.id];
      });
      st.objs.forEach(function (o) {
        o.refs = refs[o.id];
      });

      snaps.push(JSON.parse(JSON.stringify(st)));
    });
    return snaps;
  }

  /* ---------- animation loop shared by both stages ---------- */

  var stages = [];
  var raf = 0;

  function tick() {
    var moving = false;
    stages.forEach(function (s) {
      if (s.step()) moving = true;
    });
    raf = moving ? requestAnimationFrame(tick) : 0;
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function ease(e, key, target) {
    var d = target - e[key];
    if (Math.abs(d) > 0.3) {
      e[key] += d * EASE;
      return true;
    }
    e[key] = target;
    return false;
  }

  function leave(e) {
    e.inner.classList.add('leave');
    setTimeout(function () {
      e.g.remove();
    }, 520);
  }

  function flashEl(el) {
    el.classList.remove('flash');
    void el.getBoundingClientRect();
    el.classList.add('flash');
    setTimeout(function () {
      el.classList.remove('flash');
    }, 950);
  }

  function bumpEl(el) {
    el.classList.remove('bump');
    void el.getBoundingClientRect();
    el.classList.add('bump');
  }

  function marker(root, id, cls) {
    var defs = svgEl('defs', {}, root);
    var m = svgEl(
      'marker',
      { id: id, viewBox: '0 0 10 10', refX: '7', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto' },
      defs
    );
    svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: cls }, m);
  }

  /* ---------- Python stage: tags, objects, arrows ---------- */

  var P = { W: 420, H: 224, TAG_X: 10, TAG_W: 88, TAG_H: 34, OBJ_X: 232, OBJ_W: 178, OBJ_H: 58, GAP: 70, TAG_GAP: 64 };

  function PyStage(root) {
    this.root = root;
    root.setAttribute('viewBox', '0 0 ' + P.W + ' ' + P.H);
    marker(root, 'ah-py', 'ah');
    this.la = svgEl('g', {}, root);
    this.lo = svgEl('g', {}, root);
    this.lt = svgEl('g', {}, root);
    this.objs = new Map();
    this.tags = new Map();
    this.arrows = new Map();
    stages.push(this);
  }

  PyStage.prototype.reset = function () {
    this.la.textContent = '';
    this.lo.textContent = '';
    this.lt.textContent = '';
    this.objs.clear();
    this.tags.clear();
    this.arrows.clear();
  };

  PyStage.prototype.drawObj = function (e, o) {
    var sig = JSON.stringify([o.type, o.val, o.refs]);
    if (e.sig === sig) return;
    var changed = e.sig !== null;
    e.sig = sig;
    e.body.textContent = '';
    svgEl('rect', { class: 'obj-box', width: P.OBJ_W, height: P.OBJ_H, rx: 10 }, e.body);
    var t = svgEl('text', { class: 'obj-type', x: 12, y: 18 }, e.body);
    t.textContent = o.type;
    var r = svgEl('text', { class: 'obj-refs', x: P.OBJ_W - 12, y: 18, 'text-anchor': 'end' }, e.body);
    r.textContent = o.refs + (o.refs === 1 ? ' tag' : ' tags');
    if (Array.isArray(o.val)) {
      o.val.forEach(function (v, i) {
        var x = 12 + i * 35;
        svgEl('rect', { class: 'cell', x: x, y: 25, width: 32, height: 26, rx: 6 }, e.body);
        var ct = svgEl('text', { class: 'cell-text', x: x + 16, y: 43, 'text-anchor': 'middle' }, e.body);
        ct.textContent = v;
      });
    } else {
      var v = svgEl('text', { class: 'obj-val', x: 12, y: 47 }, e.body);
      v.textContent = o.val;
    }
    var a = svgEl('text', { class: 'addr', x: P.OBJ_W - 12, y: 50, 'text-anchor': 'end' }, e.body);
    a.textContent = o.addr;
    if (changed) bumpEl(e.body);
  };

  PyStage.prototype.apply = function (st) {
    var self = this;
    var liveObjs = {};
    st.objs.forEach(function (o) {
      liveObjs[o.id] = true;
    });
    this.objs.forEach(function (e, id) {
      if (!liveObjs[id]) {
        leave(e);
        self.objs.delete(id);
      }
    });
    st.objs.forEach(function (o, i) {
      var ty = 8 + i * P.GAP;
      var e = self.objs.get(o.id);
      if (!e) {
        var g = svgEl('g', { transform: 'translate(' + P.OBJ_X + ',' + ty + ')' }, self.lo);
        var inner = svgEl('g', { class: 'pop' }, g);
        var body = svgEl('g', {}, inner);
        e = { g: g, inner: inner, body: body, x: P.OBJ_X, y: ty, ty: ty, sig: null };
        self.objs.set(o.id, e);
      }
      e.ty = ty;
      self.drawObj(e, o);
      if (st.flash.indexOf(o.id) >= 0) flashEl(e.inner);
    });

    var liveNames = {};
    st.names.forEach(function (n) {
      liveNames[n.name] = true;
    });
    this.tags.forEach(function (e, name) {
      if (!liveNames[name]) {
        leave(e);
        self.tags.delete(name);
        var a = self.arrows.get(name);
        if (a) {
          a.path.classList.add('leave');
          setTimeout(
            (function (p) {
              return function () {
                p.remove();
              };
            })(a.path),
            520
          );
          self.arrows.delete(name);
        }
      }
    });
    st.names.forEach(function (n, i) {
      var ty = 12 + i * P.TAG_GAP;
      var e = self.tags.get(n.name);
      if (!e) {
        var g = svgEl('g', { transform: 'translate(' + P.TAG_X + ',' + ty + ')' }, self.lt);
        var inner = svgEl('g', { class: 'pop' }, g);
        var w = P.TAG_W,
          hh = P.TAG_H;
        svgEl(
          'path',
          {
            class: 'tag-shape',
            d: 'M6,0 H' + (w - 14) + ' L' + w + ',' + hh / 2 + ' L' + (w - 14) + ',' + hh + ' H6 Q0,' + hh + ' 0,' + (hh - 6) + ' V6 Q0,0 6,0 Z',
          },
          inner
        );
        svgEl('circle', { class: 'tag-hole', cx: w - 12, cy: hh / 2, r: 3.2 }, inner);
        var tx = svgEl('text', { class: 'tag-text', x: 12, y: 23 }, inner);
        tx.textContent = n.name;
        e = { g: g, inner: inner, x: P.TAG_X, y: ty, ty: ty };
        self.tags.set(n.name, e);
      }
      e.ty = ty;

      var target = self.objs.get(n.to);
      var a = self.arrows.get(n.name);
      var tyEnd = target.ty + P.OBJ_H / 2;
      if (!a) {
        var path = svgEl('path', { class: 'arrow', 'marker-end': 'url(#ah-py)' }, self.la);
        a = { path: path, ex: P.TAG_X + P.TAG_W - 12, ey: ty + P.TAG_H / 2, tx: 0, ty: 0 };
        self.arrows.set(n.name, a);
      }
      a.tx = P.OBJ_X - 5;
      a.ty = tyEnd;
    });
    this.step();
    kick();
  };

  PyStage.prototype.step = function () {
    var moving = false;
    var self = this;
    function slide(e) {
      var m = ease(e, 'y', e.ty);
      e.g.setAttribute('transform', 'translate(' + e.x + ',' + e.y + ')');
      if (m) moving = true;
    }
    this.objs.forEach(slide);
    this.tags.forEach(slide);
    this.arrows.forEach(function (a, name) {
      var tag = self.tags.get(name);
      if (!tag) return;
      var sx = P.TAG_X + P.TAG_W - 12;
      var sy = tag.y + P.TAG_H / 2;
      if (ease(a, 'ex', a.tx)) moving = true;
      if (ease(a, 'ey', a.ty)) moving = true;
      var bend = Math.max(40, (a.ex - sx) * 0.55);
      a.path.setAttribute('d', 'M' + sx + ' ' + sy + ' C' + (sx + bend) + ' ' + sy + ' ' + (a.ex - bend) + ' ' + a.ey + ' ' + a.ex + ' ' + a.ey);
    });
    return moving;
  };

  /* ---------- C stage: boxes in a row of stack memory ---------- */

  var C = { W: 420, H: 224, X: 10, GAP: 70, BOX_H: 40, CELL: 50 };

  function CStage(root) {
    this.root = root;
    root.setAttribute('viewBox', '0 0 ' + C.W + ' ' + C.H);
    marker(root, 'ah-c', 'ah-c');
    this.lr = svgEl('g', {}, root);
    this.la = svgEl('g', {}, root);
    this.rows = new Map();
    this.arrows = new Map();
    stages.push(this);
  }

  CStage.prototype.reset = function () {
    this.lr.textContent = '';
    this.la.textContent = '';
    this.rows.clear();
    this.arrows.clear();
  };

  CStage.prototype.drawRow = function (e, r, all) {
    var target = r.kind === 'ptr' ? all.filter(function (x) { return x.name === r.to; })[0] : null;
    var sig = JSON.stringify([r.kind, r.val, r.vals, target && target.addr]);
    if (e.sig === sig) return false;
    var changed = e.sig !== null;
    e.sig = sig;
    e.body.textContent = '';

    var label = r.type + ' ' + (r.kind === 'ptr' ? '*' : '') + r.name + (r.kind === 'arr' ? '[' + r.vals.length + ']' : '');
    var lt = svgEl('text', { class: 'c-label', x: 0, y: 12 }, e.body);
    lt.textContent = label;

    var width;
    if (r.kind === 'arr') {
      r.vals.forEach(function (v, i) {
        svgEl('rect', { class: 'c-box', x: i * C.CELL, y: 20, width: C.CELL - 4, height: C.BOX_H, rx: 8 }, e.body);
        var t = svgEl('text', { class: 'c-text', x: i * C.CELL + (C.CELL - 4) / 2, y: 46, 'text-anchor': 'middle' }, e.body);
        t.textContent = v;
      });
      width = r.vals.length * C.CELL;
    } else if (r.kind === 'ptr') {
      svgEl('rect', { class: 'c-box', x: 0, y: 20, width: 150, height: C.BOX_H, rx: 8 }, e.body);
      var pt = svgEl('text', { class: 'c-ptr', x: 75, y: 45, 'text-anchor': 'middle' }, e.body);
      pt.textContent = target ? target.addr : '0x0';
      width = 150;
    } else {
      svgEl('rect', { class: 'c-box', x: 0, y: 20, width: 118, height: C.BOX_H, rx: 8 }, e.body);
      var vt = svgEl('text', { class: 'c-text', x: 59, y: 46, 'text-anchor': 'middle' }, e.body);
      vt.textContent = r.val;
      width = 118;
    }
    var at = svgEl('text', { class: 'addr', x: width + 10, y: 46 }, e.body);
    at.textContent = '@ ' + r.addr;
    e.width = width;
    if (changed) bumpEl(e.body);
    return true;
  };

  CStage.prototype.apply = function (st) {
    var self = this;
    var live = {};
    st.rows.forEach(function (r) {
      live[r.name] = true;
    });
    this.rows.forEach(function (e, name) {
      if (!live[name]) {
        leave(e);
        self.rows.delete(name);
      }
    });
    st.rows.forEach(function (r, i) {
      var ty = 8 + i * C.GAP;
      var e = self.rows.get(r.name);
      if (!e) {
        var g = svgEl('g', { transform: 'translate(' + C.X + ',' + ty + ')' }, self.lr);
        var inner = svgEl('g', { class: 'pop' }, g);
        var body = svgEl('g', {}, inner);
        e = { g: g, inner: inner, body: body, x: C.X, y: ty, ty: ty, sig: null, width: 0, kind: r.kind, to: r.to };
        self.rows.set(r.name, e);
      }
      e.ty = ty;
      e.kind = r.kind;
      e.to = r.to;
      self.drawRow(e, r, st.rows);
      if (st.cflash.indexOf(r.name) >= 0) flashEl(e.inner);
      if (r.kind === 'ptr' && !self.arrows.has(r.name)) {
        self.arrows.set(r.name, svgEl('path', { class: 'c-arrow draw', 'marker-end': 'url(#ah-c)' }, self.la));
      }
    });
    this.step();
    kick();
  };

  CStage.prototype.step = function () {
    var moving = false;
    var self = this;
    this.rows.forEach(function (e) {
      if (ease(e, 'y', e.ty)) moving = true;
      e.g.setAttribute('transform', 'translate(' + e.x + ',' + e.y + ')');
    });
    this.arrows.forEach(function (path, name) {
      var p = self.rows.get(name);
      var t = p && self.rows.get(p.to);
      if (!p || !t) {
        path.remove();
        self.arrows.delete(name);
        return;
      }
      var sx = C.X + p.width;
      var sy = p.y + 40;
      var ex = C.X + t.width + 3;
      var ey = t.y + 40;
      var bx = Math.max(sx, ex) + 58;
      path.setAttribute('d', 'M' + sx + ' ' + sy + ' C' + bx + ' ' + sy + ' ' + bx + ' ' + ey + ' ' + ex + ' ' + ey);
    });
    return moving;
  };

  /* ---------- lesson page ---------- */

  function mount(L) {
    var scenes = L.scenes;
    var cur = null;
    var idx = 0;
    var timer = 0;
    var snaps = [];
    var speed = 1500;

    var $ = function (id) {
      return document.getElementById(id);
    };

    $('title').textContent = L.title;
    $('lede').textContent = L.lede;

    /* panels */
    function panel(lang, name, sub) {
      var code = h('ol', { class: 'code', 'aria-label': name + ' code' });
      var svg = svgEl('svg', { class: 'stage', role: 'img', 'aria-label': name + ' memory' });
      var cap = h('p', { class: 'caption', 'aria-live': 'polite' });
      var el = h('article', { class: 'panel', 'data-lang': lang }, [
        h('header', {}, [h('h2', { text: name }), h('p', { text: sub })]),
        code,
        svg,
        cap,
      ]);
      return { el: el, code: code, svg: svg, cap: cap };
    }
    var pp = panel('py', 'Python', 'A name is a tag that points at an object');
    var cp = panel('c', 'C', 'A name is a box that holds a value');
    $('panels').appendChild(pp.el);
    $('panels').appendChild(cp.el);
    var py = new PyStage(pp.svg);
    var cs = new CStage(cp.svg);

    /* controls */
    var bReset = h('button', { class: 'btn', type: 'button', text: 'Reset', onclick: function () { go(0); } });
    var bBack = h('button', { class: 'btn', type: 'button', text: 'Back', onclick: function () { stop(); go(idx - 1); } });
    var bStep = h('button', { class: 'btn primary', type: 'button', text: 'Step', onclick: function () { stop(); go(idx + 1); } });
    var bPlay = h('button', { class: 'btn', type: 'button', text: 'Play', onclick: toggle });
    var dots = h('div', { class: 'dots', role: 'group', 'aria-label': 'Steps' });
    var count = h('span', { class: 'count' });
    var addr = h('input', { type: 'checkbox', id: 'addr' });
    var speedSel = h('select', { id: 'speed', 'aria-label': 'Play speed' }, [
      h('option', { value: '2400', text: 'Slow' }),
      h('option', { value: '1500', text: 'Normal', selected: 'selected' }),
      h('option', { value: '800', text: 'Fast' }),
    ]);
    speedSel.value = '1500';
    $('controls').appendChild(h('div', { class: 'btns' }, [bReset, bBack, bStep, bPlay]));
    $('controls').appendChild(dots);
    $('controls').appendChild(count);
    $('controls').appendChild(
      h('div', { class: 'opts-inline' }, [h('label', { for: 'addr' }, [addr, document.createTextNode('Show addresses')]), speedSel])
    );
    addr.addEventListener('change', function () {
      pp.svg.classList.toggle('show-addr', addr.checked);
      cp.svg.classList.toggle('show-addr', addr.checked);
    });
    speedSel.addEventListener('change', function () {
      speed = +speedSel.value;
    });

    function stop() {
      if (timer) clearInterval(timer);
      timer = 0;
      bPlay.textContent = 'Play';
    }
    function toggle() {
      if (timer) return stop();
      if (idx >= snaps.length - 1) go(0);
      bPlay.textContent = 'Pause';
      timer = setInterval(function () {
        if (idx >= snaps.length - 1) return stop();
        go(idx + 1);
      }, speed);
    }

    function renderCode(list, lines) {
      list.textContent = '';
      lines.forEach(function (line, i) {
        list.appendChild(h('li', { html: '<span class="no">' + (i + 1) + '</span><span>' + highlight(line) + '</span>' }));
      });
    }

    function go(i) {
      if (i < 0 || i >= snaps.length) return;
      idx = i;
      var s = snaps[i];
      var step = cur.steps[i];
      py.apply(s);
      cs.apply(s);

      [].forEach.call(pp.code.children, function (li, n) {
        li.classList.toggle('on', n === step.pl);
      });
      [].forEach.call(cp.code.children, function (li, n) {
        li.classList.toggle('on', n === step.cl);
      });
      pp.cap.textContent = step.say;
      cp.cap.textContent = '';
      if (s.err) cp.cap.appendChild(h('span', { class: 'err', text: s.err }));
      cp.cap.appendChild(document.createTextNode(step.csay));

      [].forEach.call(dots.children, function (d, n) {
        d.classList.toggle('now', n === i);
        d.classList.toggle('done', n < i);
        if (n === i) d.setAttribute('aria-current', 'step');
        else d.removeAttribute('aria-current');
      });
      count.textContent = i === 0 ? 'Ready' : 'Step ' + i + ' of ' + (snaps.length - 1);
      bBack.disabled = i === 0;
      bStep.disabled = i === snaps.length - 1;
      bReset.disabled = i === 0;
    }

    /* scene tabs, predict, trap */
    var tabs = $('scenes');
    scenes.forEach(function (sc, n) {
      var b = h('button', { class: 'scene-tab', type: 'button', role: 'tab', id: 'tab-' + sc.id, text: sc.title, onclick: function () { location.hash = sc.id; } });
      tabs.appendChild(b);
    });

    function renderPredict(sc) {
      var box = $('predict-body');
      box.textContent = '';
      box.appendChild(h('p', { class: 'q', html: sc.predict.q }));
      var why = h('p', { class: 'why', hidden: 'hidden', text: sc.predict.why });
      var row = h('div', { class: 'choices' });
      sc.predict.options.forEach(function (o, n) {
        var b = h('button', { class: 'choice', type: 'button', text: o });
        b.addEventListener('click', function () {
          [].forEach.call(row.children, function (c, k) {
            c.disabled = true;
            if (k === sc.predict.answer) c.classList.add('right');
          });
          if (n !== sc.predict.answer) b.classList.add('wrong');
          why.hidden = false;
          why.textContent = (n === sc.predict.answer ? 'Right. ' : 'Not quite. ') + sc.predict.why;
        });
        row.appendChild(b);
      });
      box.appendChild(row);
      box.appendChild(why);
    }

    function select(id) {
      var sc = scenes.filter(function (s) { return s.id === id; })[0] || scenes[0];
      stop();
      cur = sc;
      [].forEach.call(tabs.children, function (t, n) {
        t.setAttribute('aria-selected', scenes[n] === sc ? 'true' : 'false');
      });
      $('blurb').textContent = sc.blurb;
      $('trap-text').textContent = sc.trap;
      renderCode(pp.code, sc.pyCode);
      renderCode(cp.code, sc.cCode);
      snaps = buildSnapshots(sc.steps);
      py.reset();
      cs.reset();
      dots.textContent = '';
      sc.steps.forEach(function (_, n) {
        dots.appendChild(h('button', { class: 'dot', type: 'button', 'aria-label': n === 0 ? 'Start' : 'Go to step ' + n, onclick: function () { stop(); go(n); } }));
      });
      renderPredict(sc);
      go(0);
    }

    /* builtins table */
    var tb = $('builtins');
    L.builtins.forEach(function (r) {
      tb.appendChild(h('tr', {}, [h('th', { html: '<code>' + esc(r[0]) + '</code>' }), h('td', { text: r[1] })]));
    });

    window.addEventListener('hashchange', function () {
      select(location.hash.slice(1));
    });
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { stop(); go(idx + 1); }
      else if (e.key === 'ArrowLeft') { stop(); go(idx - 1); }
    });

    select(location.hash.slice(1));
    window.__dsav = { go: go, snaps: function () { return snaps; }, index: function () { return idx; } };
  }

  window.DSAV = { mount: mount, buildSnapshots: buildSnapshots };
})();
