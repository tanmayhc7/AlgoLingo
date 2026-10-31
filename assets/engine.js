/* DSA Visualizer step engine.
   A lesson is plain data (see assets/lessons/*.js). Each scene lists the same program in Python and C,
   and every step says which line runs and what changes in memory. The engine replays the changes into
   snapshots, so stepping backwards is exact, then draws both memory models and animates the difference. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* Restart a one-shot CSS animation class. */
  function restart(el, cls, ms) {
    el.classList.remove(cls);
    void el.getBoundingClientRect();
    el.classList.add(cls);
    if (ms) {
      setTimeout(function () {
        el.classList.remove(cls);
      }, ms);
    }
  }

  /* ---------- steps -> snapshots ---------- */

  function buildSnapshots(steps) {
    var st = { objs: [], names: [], rows: [], err: null, flash: [], cflash: [] };
    var objCount = 0;
    var nameCount = 0;
    var cursor = 0x1000;
    var snaps = [];

    /* Dummy addresses: Python names live in slots from 0x1000, objects from 0x2000 (32 bytes each).
       C boxes are laid out one after another from 0x1000, sized by type (int 4 bytes, pointer 8). */
    function hex(n) {
      return '0x' + n.toString(16);
    }
    var cursors = { stack: 0x1000, static: 0x4000, heap: 0x8000 };
    function alloc(size, align, region) {
      var k = region || 'stack';
      if (k === 'heap') align = Math.max(align, 16);
      cursors[k] = Math.ceil(cursors[k] / align) * align;
      var a = cursors[k];
      cursors[k] += size;
      return hex(a);
    }
    function row(name) {
      for (var i = 0; i < st.rows.length; i++) if (st.rows[i].name === name) return st.rows[i];
      return null;
    }

    steps.forEach(function (step) {
      st.err = null;
      st.perr = null;
      st.flash = [];
      st.cflash = [];

      (step.py || []).forEach(function (op) {
        var kind = op[0];
        if (kind === 'obj') {
          st.objs.push({ id: op[1], type: op[2], val: op[3], refs: 0, addr: hex(0x2000 + objCount++ * 0x20) });
        } else if (kind === 'bind') {
          var t = st.names.filter(function (n) {
            return n.name === op[1];
          })[0];
          if (t) t.to = op[2];
          else st.names.push({ name: op[1], to: op[2], addr: hex(0x1000 + nameCount++ * 8) });
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
        } else if (kind === 'hold') {
          /* kept alive by something that is not a tag, such as a list element */
          st.objs.forEach(function (o) {
            if (o.id === op[1]) o.held = true;
          });
        } else if (kind === 'release') {
          st.objs.forEach(function (o) {
            if (o.id === op[1]) o.held = false;
          });
        } else if (kind === 'err') {
          st.perr = op[1];
        }
      });

      (step.c || []).forEach(function (op) {
        var kind = op[0];
        var r = op[1] && row(op[1]);
        if (kind === 'var') {
          if (r) r.val = op[3];
          else st.rows.push({ name: op[1], kind: 'var', type: op[2], val: op[3], region: op[4] || 'stack', addr: alloc(4, 4, op[4]) });
        } else if (kind === 'setv') {
          r.val = op[2];
        } else if (kind === 'arr') {
          st.rows.push({ name: op[1], kind: 'arr', type: op[2], vals: op[3].slice(), region: op[4] || 'stack', addr: alloc(op[3].length * 4, 4, op[4]) });
        } else if (kind === 'seti') {
          r.vals[op[2]] = op[3];
        } else if (kind === 'ptr') {
          /* ['ptr', name, target, region?]: makes the pointer, or points an existing one somewhere else */
          if (r) {
            r.to = op[2];
            r.freed = null;
          } else st.rows.push({ name: op[1], kind: 'ptr', type: 'int', to: op[2], region: op[3] || 'stack', addr: alloc(8, 8, op[3]) });
        } else if (kind === 'null') {
          r.to = null;
          r.freed = null;
        } else if (kind === 'drop') {
          /* free(): the block goes away, and any pointer to it keeps the old address, now dangling */
          var gone = r;
          st.rows = st.rows.filter(function (x) {
            return x.name !== op[1];
          });
          st.rows.forEach(function (x) {
            if (x.kind === 'ptr' && x.to === op[1]) {
              x.to = null;
              x.freed = gone.addr;
            }
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
        return refs[o.id] || o.held;
      });
      st.objs.forEach(function (o) {
        o.refs = refs[o.id] || 0;
      });

      snaps.push(JSON.parse(JSON.stringify(st)));
    });
    return snaps;
  }

  /* ---------- animation loop shared by every stage ---------- */

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

  /* A spring: things overshoot a little and settle, which makes a tag swinging to a new object read as physical. */
  function spring(e, key, target) {
    var vk = 'v_' + key;
    var d = target - e[key];
    if (reduce) {
      e[key] = target;
      e[vk] = 0;
      return false;
    }
    e[vk] = ((e[vk] || 0) + d * 0.14) * 0.76;
    e[key] += e[vk];
    if (Math.abs(d) < 0.15 && Math.abs(e[vk]) < 0.15) {
      e[key] = target;
      e[vk] = 0;
      return false;
    }
    return true;
  }

  function leave(e) {
    e.inner.classList.add('leave');
    setTimeout(function () {
      e.g.remove();
    }, 520);
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

  /* ---------- Python stage: tags, objects, strings ---------- */

  var P = { W: 420, H: 262, TAG_X: 10, TAG_W: 112, TAG_H: 44, OBJ_X: 236, OBJ_W: 174, OBJ_H: 62, GAP: 84, TAG_GAP: 80 };

  function PyStage(root) {
    this.root = root;
    root.setAttribute('viewBox', '0 0 ' + P.W + ' ' + P.H);
    marker(root, 'ah-py-' + stages.length, 'ah');
    this.markerId = 'ah-py-' + stages.length;
    this.la = svgEl('g', {}, root);
    this.lo = svgEl('g', {}, root);
    this.lt = svgEl('g', {}, root);
    this.lf = svgEl('g', {}, root);
    this.objs = new Map();
    this.tags = new Map();
    this.arrows = new Map();
    stages.push(this);
  }

  PyStage.prototype.reset = function () {
    this.la.textContent = '';
    this.lo.textContent = '';
    this.lt.textContent = '';
    this.lf.textContent = '';
    this.objs.clear();
    this.tags.clear();
    this.arrows.clear();
  };

  /* Cards grow by a row when a collection has more items than fit on one line. */
  function cellGrid(o) {
    var vals = o.val;
    var maxLen = 0;
    vals.forEach(function (v) {
      maxLen = Math.max(maxLen, String(v).length);
    });
    var cw = maxLen <= 2 ? 32 : maxLen <= 4 ? 46 : 70;
    var cols = Math.max(1, Math.floor((P.OBJ_W - 20) / (cw + 4)));
    return { cw: cw, cols: cols, rows: Math.max(1, Math.ceil(vals.length / cols)) };
  }

  function objH(o) {
    return Array.isArray(o.val) ? P.OBJ_H + (cellGrid(o).rows - 1) * 30 : P.OBJ_H;
  }

  var KNOWN_HD = { int: 'int', float: 'int', bool: 'int', str: 'str', list: 'list', tuple: 'tuple', dict: 'dict', set: 'set' };

  PyStage.prototype.drawObj = function (e, o) {
    var sig = JSON.stringify([o.type, o.val, o.refs]);
    if (e.sig === sig) return;
    var changed = e.sig !== null;
    e.sig = sig;
    var W = P.OBJ_W;
    var H = objH(o);
    e.h = H;
    e.body.textContent = '';
    svgEl('rect', { class: 'obj-card', width: W, height: H, rx: 12 }, e.body);
    var kind = KNOWN_HD[o.type] || 'other';
    svgEl('path', { class: 'hd hd-' + kind, d: 'M0,22 V12 Q0,0 12,0 H' + (W - 12) + ' Q' + W + ',0 ' + W + ',12 V22 Z' }, e.body);
    svgEl('text', { class: 'obj-type', x: 12, y: 16 }, e.body).textContent = o.type;
    svgEl('text', { class: 'addr addr-ink', x: 56, y: 16 }, e.body).textContent = '@ ' + o.addr;
    svgEl('text', { class: 'obj-refs', x: W - 12, y: 16, 'text-anchor': 'end' }, e.body).textContent = o.refs
      ? o.refs + (o.refs === 1 ? ' tag' : ' tags')
      : o.type === 'list' || o.type === 'dict' || o.type === 'set' ? 'being built' : 'in a list';
    if (Array.isArray(o.val)) {
      var g = cellGrid(o);
      o.val.forEach(function (v, i) {
        var x = 12 + (i % g.cols) * (g.cw + 4);
        var y = 30 + Math.floor(i / g.cols) * 30;
        var empty = v === '' || v === '·';
        svgEl('rect', { class: 'cell' + (empty ? ' cell-empty' : ''), x: x, y: y, width: g.cw, height: 26, rx: 7 }, e.body);
        var t = svgEl('text', { class: 'cell-text' + (empty ? ' cell-empty-text' : ''), x: x + g.cw / 2, y: y + 18, 'text-anchor': 'middle' }, e.body);
        t.textContent = empty ? '·' : v;
        if (String(v).length > 3) t.style.fontSize = '12px';
      });
    } else {
      var vt = svgEl('text', { class: 'obj-val', x: 12, y: 54 }, e.body);
      vt.textContent = o.val;
      if (String(o.val).length > 9) vt.style.fontSize = String(o.val).length > 14 ? '13px' : '16px';
    }
    if (changed) restart(e.body, 'bump');
  };

  PyStage.prototype.burst = function (e) {
    if (reduce) return;
    var cx = e.x + P.OBJ_W / 2;
    var cy = e.y + (e.h || P.OBJ_H) / 2;
    var lf = this.lf;
    function gone(n, ms) {
      setTimeout(function () {
        n.remove();
      }, ms);
    }
    for (var i = 0; i < 10; i++) {
      var ang = (i / 10) * Math.PI * 2;
      var dist = 46 + (i % 3) * 16;
      var c = svgEl('circle', { class: 'puff', cx: cx, cy: cy, r: 3 + (i % 3) }, lf);
      c.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      c.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      c.style.fill = i % 2 ? '#ffffff' : '#ffd23f';
      gone(c, 750);
    }
    var t = svgEl('text', { class: 'freed-text', x: cx, y: cy + 4, 'text-anchor': 'middle' }, lf);
    t.textContent = 'freed';
    gone(t, 950);
  };

  PyStage.prototype.apply = function (st) {
    var self = this;
    var liveObjs = {};
    st.objs.forEach(function (o) {
      liveObjs[o.id] = true;
    });
    this.objs.forEach(function (e, id) {
      if (!liveObjs[id]) {
        self.burst(e);
        leave(e);
        self.objs.delete(id);
      }
    });
    var yy = 8;
    st.objs.forEach(function (o, i) {
      var ty = yy;
      yy += objH(o) + (P.GAP - P.OBJ_H);
      var e = self.objs.get(o.id);
      if (!e) {
        var g = svgEl('g', { transform: 'translate(' + P.OBJ_X + ',' + ty + ')' }, self.lo);
        var inner = svgEl('g', { class: 'pop' }, g);
        var body = svgEl('g', { class: 'card-g' }, inner);
        e = { g: g, inner: inner, body: body, x: P.OBJ_X, y: ty, ty: ty, sig: null };
        self.objs.set(o.id, e);
      }
      e.ty = ty;
      self.drawObj(e, o);
      if (st.flash.indexOf(o.id) >= 0) restart(e.inner, 'flash', 950);
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
          setTimeout(function () {
            a.path.remove();
          }, 520);
          self.arrows.delete(name);
        }
      }
    });
    st.names.forEach(function (n, i) {
      var ty = 12 + i * P.TAG_GAP;
      var e = self.tags.get(n.name);
      if (!e) {
        var g = svgEl('g', { transform: 'translate(' + P.TAG_X + ',' + ty + ')' }, self.lt);
        var inner = svgEl('g', { class: 'pop-tag' }, g);
        var w = P.TAG_W;
        var hh = P.TAG_H;
        var body = svgEl('g', { class: 'tag-g' }, inner);
        svgEl(
          'path',
          {
            class: 'tag-shape',
            d: 'M8,0 H' + (w - 16) + ' L' + w + ',' + hh / 2 + ' L' + (w - 16) + ',' + hh + ' H8 Q0,' + hh + ' 0,' + (hh - 8) + ' V8 Q0,0 8,0 Z',
          },
          body
        );
        svgEl('circle', { class: 'tag-hole', cx: w - 14, cy: hh / 2, r: 3.4 }, body);
        svgEl('text', { class: 'tag-text', x: 14, y: 20 }, body).textContent = n.name;
        svgEl('text', { class: 'tag-addr', x: 14, y: 36 }, body).textContent = '@ ' + n.addr;
        e = { g: g, inner: inner, x: P.TAG_X, y: ty, ty: ty };
        self.tags.set(n.name, e);
      }
      e.ty = ty;

      var target = self.objs.get(n.to);
      var a = self.arrows.get(n.name);
      if (!a) {
        var path = svgEl('path', { class: 'arrow', 'marker-end': 'url(#' + self.markerId + ')' }, self.la);
        a = { path: path, to: n.to, ex: P.TAG_X + P.TAG_W - 14, ey: ty + P.TAG_H / 2, tx: 0, ty: 0 };
        self.arrows.set(n.name, a);
      } else if (a.to !== n.to) {
        a.to = n.to;
        restart(e.inner, 'wiggle', 700);
      }
      a.tx = P.OBJ_X - 5;
      a.ty = target.ty + (target.h || P.OBJ_H) / 2;
    });
    this.root.setAttribute('viewBox', '0 0 ' + P.W + ' ' + Math.max(P.H, yy, 12 + st.names.length * P.TAG_GAP));
    this.step();
    kick();
  };

  PyStage.prototype.step = function () {
    var moving = false;
    var self = this;
    function slide(e) {
      if (spring(e, 'y', e.ty)) moving = true;
      e.g.setAttribute('transform', 'translate(' + e.x + ',' + e.y + ')');
    }
    this.objs.forEach(slide);
    this.tags.forEach(slide);
    this.arrows.forEach(function (a, name) {
      var tag = self.tags.get(name);
      if (!tag) return;
      var sx = P.TAG_X + P.TAG_W - 14;
      var sy = tag.y + P.TAG_H / 2;
      if (spring(a, 'ex', a.tx)) moving = true;
      if (spring(a, 'ey', a.ty)) moving = true;
      var bend = Math.max(40, (a.ex - sx) * 0.55);
      a.path.setAttribute('d', 'M' + sx + ' ' + sy + ' C' + (sx + bend) + ' ' + sy + ' ' + (a.ex - bend) + ' ' + a.ey + ' ' + a.ex + ' ' + a.ey);
    });
    return moving;
  };

  /* ---------- C stage: crates in a strip of memory ---------- */

  var C = { W: 420, H: 262, X: 10, GAP: 84, BOX_H: 40, CELL: 50 };

  function CStage(root) {
    this.root = root;
    root.setAttribute('viewBox', '0 0 ' + C.W + ' ' + C.H);
    this.markerId = 'ah-c-' + stages.length;
    marker(root, this.markerId, 'ah-c');
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

  /* A crate is drawn as its bytes: an int is 4 thin slots, a pointer is 8. */
  function crate(parent, x, w, slots, cls) {
    svgEl('rect', { class: 'c-box ' + (cls || ''), x: x, y: 20, width: w, height: C.BOX_H, rx: 9 }, parent);
    for (var i = 1; i < slots; i++) {
      var lx = x + (w * i) / slots;
      svgEl('line', { class: 'c-div', x1: lx, x2: lx, y1: 26, y2: 54 }, parent);
    }
  }

  CStage.prototype.drawRow = function (e, r, all) {
    var target =
      r.kind === 'ptr'
        ? all.filter(function (x) {
            return x.name === r.to;
          })[0]
        : null;
    var sig = JSON.stringify([r.kind, r.val, r.vals, target && target.addr, r.region, r.freed, r.to]);
    if (e.sig === sig) return;
    var changed = e.sig !== null;
    e.sig = sig;
    e.body.textContent = '';

    var label = r.type + ' ' + (r.kind === 'ptr' ? '*' : '') + r.name + (r.kind === 'arr' ? '[' + r.vals.length + ']' : '');
    svgEl('text', { class: 'c-label', x: 0, y: 12 }, e.body).textContent = label;

    var width;
    if (r.kind === 'arr') {
      r.vals.forEach(function (v, i) {
        var x = i * C.CELL;
        crate(e.body, x, C.CELL - 4, 4);
        svgEl('text', { class: 'c-text', x: x + (C.CELL - 4) / 2, y: 46, 'text-anchor': 'middle' }, e.body).textContent = v;
        svgEl('text', { class: 'addr', x: x + (C.CELL - 4) / 2, y: 76, 'text-anchor': 'middle' }, e.body).textContent =
          '0x' + (parseInt(r.addr, 16) + i * 4).toString(16);
      });
      width = r.vals.length * C.CELL;
    } else if (r.kind === 'ptr') {
      crate(e.body, 0, 150, 8, 'c-box-ptr');
      svgEl('text', { class: 'c-text' + (r.freed ? ' c-bad' : ''), x: 75, y: 46, 'text-anchor': 'middle' }, e.body).textContent = target
        ? target.addr
        : r.freed || 'NULL';
      if (r.freed) svgEl('text', { class: 'c-region r-bad', x: 150, y: 12, 'text-anchor': 'end' }, e.body).textContent = 'dangling';
      svgEl('text', { class: 'addr', x: 0, y: 76 }, e.body).textContent = '@ ' + r.addr;
      width = 150;
    } else {
      crate(e.body, 0, 118, 4);
      svgEl('text', { class: 'c-text', x: 59, y: 46, 'text-anchor': 'middle' }, e.body).textContent = r.val;
      svgEl('text', { class: 'addr', x: 0, y: 76 }, e.body).textContent = '@ ' + r.addr;
      width = 118;
    }
    if (r.region && r.region !== 'stack') {
      svgEl('text', { class: 'c-region r-' + r.region, x: width, y: 12, 'text-anchor': 'end' }, e.body).textContent = r.region;
    }
    e.width = width;
    if (changed) restart(e.body, 'bump');
  };

  CStage.prototype.apply = function (st) {
    var self = this;
    this.root.setAttribute('viewBox', '0 0 ' + C.W + ' ' + Math.max(C.H, 16 + st.rows.length * C.GAP));
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
        var body = svgEl('g', { class: 'crate-g' }, inner);
        e = { g: g, inner: inner, body: body, x: C.X, y: ty, ty: ty, sig: null, width: 0, kind: r.kind, to: r.to };
        self.rows.set(r.name, e);
      }
      e.ty = ty;
      e.kind = r.kind;
      e.to = r.to;
      self.drawRow(e, r, st.rows);
      if (st.cflash.indexOf(r.name) >= 0) restart(e.inner, 'flash-c', 950);
      if (r.kind === 'ptr' && !self.arrows.has(r.name)) {
        self.arrows.set(r.name, svgEl('path', { class: 'c-arrow draw', 'marker-end': 'url(#' + self.markerId + ')' }, self.la));
      }
    });
    this.step();
    kick();
  };

  CStage.prototype.step = function () {
    var moving = false;
    var self = this;
    this.rows.forEach(function (e) {
      if (spring(e, 'y', e.ty)) moving = true;
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

  /* ---------- home page hero: a tiny looping demo ---------- */

  function hero(svgRoot, codeList, lines, steps) {
    var stage = new PyStage(svgRoot);
    var snaps = buildSnapshots(steps);
    codeList.textContent = '';
    lines.forEach(function (line, i) {
      codeList.appendChild(h('li', { html: '<span class="no">' + (i + 1) + '</span><span>' + highlight(line) + '</span>' }));
    });
    var i = 0;
    function show() {
      stage.apply(snaps[i]);
      [].forEach.call(codeList.children, function (li, n) {
        li.classList.toggle('on', n === steps[i].pl);
      });
    }
    if (reduce) {
      i = snaps.length - 1;
      return show();
    }
    function next() {
      if (i >= snaps.length) {
        i = 0;
        stage.reset();
      }
      show();
      var last = i === snaps.length - 1;
      i++;
      setTimeout(next, last ? 2800 : 1700);
    }
    next();
  }

  /* ---------- lesson page ---------- */

    /* Interview depth: assets/depth/<lesson>.js sets window.DEPTH. Text may use `backticks` for code.
     { thesis, why:[[head,text]], edges:[[case,text]], cost:[[op,cost,note]], internals:[[head,text]],
       qa:[{lvl:'mid'|'senior'|'staff', q, a, follow:[[q,a]]}] } */
  function rich(t) {
    return esc(t).replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function renderDepth(D) {
    if (!D) return;
    var host = document.getElementById('depth');
    if (!host) {
      host = document.createElement('section');
      host.id = 'depth';
      var anchor = document.getElementById('outline');
      anchor.parentNode.insertBefore(host, anchor);
    }
    host.className = 'depth';
    host.setAttribute('aria-labelledby', 'depth-h');
    host.appendChild(h('div', { class: 'depth-head' }, [
      h('p', { class: 'eyebrow', text: 'Interview depth' }),
      h('h2', { id: 'depth-h', text: 'Know it well enough to defend it' }),
      h('p', { class: 'depth-thesis', html: rich(D.thesis) }),
    ]));

    function block(title, kids) {
      var b = h('section', { class: 'depth-block' }, [h('h3', { text: title })]);
      kids.forEach(function (k) { b.appendChild(k); });
      host.appendChild(b);
    }
    function rows(list, cols) {
      var tbl = h('table', { class: 'depth-table' });
      var tbody = h('tbody');
      list.forEach(function (r) {
        var tr = h('tr');
        r.forEach(function (c, i) {
          tr.appendChild(h(i === 0 ? 'th' : 'td', { html: rich(c), class: cols && cols[i] ? cols[i] : '' }));
        });
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      return h('div', { class: 'table-wrap' }, [tbl]);
    }

    if (D.why && D.why.length) {
      block('How to reason about it', D.why.map(function (w) {
        return h('div', { class: 'why' }, [h('h4', { text: w[0] }), h('p', { html: rich(w[1]) })]);
      }));
    }
    if (D.edges && D.edges.length) {
      block('Edge cases to name out loud', [rows(D.edges)]);
    }
    if (D.cost && D.cost.length) {
      var kids = [h('div', { class: 'table-wrap' }, [(function () {
        var tbl = h('table', { class: 'depth-table cost' });
        var tbody = h('tbody');
        D.cost.forEach(function (r) {
          tbody.appendChild(h('tr', {}, [
            h('th', { html: '<code>' + esc(r[0]) + '</code>' }),
            h('td', { class: 'big-o', text: r[1] }),
            h('td', { html: rich(r[2] || '') }),
          ]));
        });
        tbl.appendChild(tbody);
        return tbl;
      })()])];
      block('Complexity', kids);
    }
    if (D.internals && D.internals.length) {
      block('What is underneath', D.internals.map(function (w) {
        return h('div', { class: 'why' }, [h('h4', { text: w[0] }), h('p', { html: rich(w[1]) })]);
      }));
    }
    if (D.qa && D.qa.length) {
      var LV = { mid: 'Mid', senior: 'Senior', staff: 'Staff' };
      block('Questions an interviewer asks', [h('p', { class: 'depth-note', text: 'Answer out loud first, then open the answer. Each follow-up is the kind of push a real interviewer makes.' })].concat(D.qa.map(function (x) {
        var det = h('details', { class: 'qa' });
        det.appendChild(h('summary', {}, [h('span', { class: 'lvl lvl-' + (x.lvl || 'mid'), text: LV[x.lvl || 'mid'] }), h('span', { class: 'qa-q', html: rich(x.q) })]));
        det.appendChild(h('div', { class: 'qa-a', html: rich(x.a) }));
        (x.follow || []).forEach(function (f) {
          var d2 = h('details', { class: 'qa follow' });
          d2.appendChild(h('summary', {}, [h('span', { class: 'lvl lvl-follow', text: 'Follow-up' }), h('span', { class: 'qa-q', html: rich(f[0]) })]));
          d2.appendChild(h('div', { class: 'qa-a', html: rich(f[1]) }));
          det.appendChild(d2);
        });
        return det;
      })));
    }
  }

  /* ---------- structure stage: nodes, arrows and named pointers (linked lists, trees, heaps) ----------
     Ops (all in step.ds):
       ['node', id, label, x, y, shape]   shape: 'node' (value | next), 'dnode' (prev | value | next), 'cell', 'circle'
       ['mv', id, x, y]  ['lab', id, label]  ['rm', id]  ['note', id, text]
       ['edge', from, to, kind]           kind: next (default), prev, l, r, child. One edge per (from, kind).
       ['unedge', from, kind]
       ['ptr', name, id|null, dir]        dir: up (default) or down. null shows a name = none chip in the dock.
       ['unptr', name]
       ['tag', id, cls...] ['untag', id, cls...]   persistent classes: done, dim, hot, cur
       ['hot', ids...]                    flashes for this step only
     Coordinates are in a 1000-wide viewBox. */
  var DS_W = 1000;
  var SHAPES = { node: [100, 44], dnode: [136, 44], cell: [64, 44], circle: [44, 44] };

  function buildDsSnapshots(steps) {
    var nodes = [];
    var edges = [];
    var ptrs = [];
    var count = 0;
    var out = [];
    function find(id) {
      return nodes.filter(function (n) { return n.id === id; })[0];
    }
    steps.forEach(function (step) {
      var hot = [];
      (step.ds || []).forEach(function (op) {
        var k = op[0];
        if (k === 'node') {
          var shape = op[5] || 'node';
          nodes.push({ id: op[1], label: op[2], x: op[3], y: op[4], shape: shape, cls: [], note: '', addr: '0x' + (0x5000 + count++ * 0x20).toString(16) });
        } else if (k === 'mv') {
          var n = find(op[1]);
          if (n) { n.x = op[2]; n.y = op[3]; }
        } else if (k === 'lab') {
          var m = find(op[1]);
          if (m) m.label = op[2];
        } else if (k === 'note') {
          var q = find(op[1]);
          if (q) q.note = op[2];
        } else if (k === 'rm') {
          nodes = nodes.filter(function (x) { return x.id !== op[1]; });
          edges = edges.filter(function (e) { return e.from !== op[1] && e.to !== op[1]; });
          ptrs.forEach(function (p) { if (p.to === op[1]) p.to = null; });
        } else if (k === 'edge') {
          var kind = op[3] || 'next';
          edges = edges.filter(function (e) { return !(e.from === op[1] && e.kind === kind); });
          edges.push({ from: op[1], to: op[2], kind: kind });
        } else if (k === 'unedge') {
          var kd = op[2] || 'next';
          edges = edges.filter(function (e) { return !(e.from === op[1] && e.kind === kd); });
        } else if (k === 'ptr') {
          var p = ptrs.filter(function (x) { return x.name === op[1]; })[0];
          if (p) { p.to = op[2]; if (op[3]) p.dir = op[3]; }
          else ptrs.push({ name: op[1], to: op[2], dir: op[3] || 'up' });
        } else if (k === 'unptr') {
          ptrs = ptrs.filter(function (x) { return x.name !== op[1]; });
        } else if (k === 'tag') {
          var t = find(op[1]);
          if (t) op.slice(2).forEach(function (c) { if (t.cls.indexOf(c) < 0) t.cls.push(c); });
        } else if (k === 'untag') {
          var u = find(op[1]);
          if (u) u.cls = u.cls.filter(function (c) { return op.slice(2).indexOf(c) < 0; });
        } else if (k === 'hot') {
          hot = op.slice(1);
        }
      });
      out.push({
        nodes: nodes.map(function (x) { return { id: x.id, label: x.label, x: x.x, y: x.y, shape: x.shape, cls: x.cls.slice(), note: x.note, addr: x.addr }; }),
        edges: edges.map(function (e) { return { from: e.from, to: e.to, kind: e.kind }; }),
        ptrs: ptrs.map(function (x) { return { name: x.name, to: x.to, dir: x.dir }; }),
        hot: hot,
        height: step.h,
      });
    });
    return out;
  }

  function DsStage(svg) {
    this.svg = svg;
    this.reset();
  }

  DsStage.prototype.reset = function () {
    this.svg.textContent = '';
    this.layers = {
      edges: svgEl('g', { class: 'ds-edges' }, this.svg),
      nodes: svgEl('g', { class: 'ds-nodes' }, this.svg),
      ptrs: svgEl('g', { class: 'ds-ptrs' }, this.svg),
    };
    this.defs = svgEl('defs', {}, this.svg);
    var mk = svgEl('marker', { id: 'ds-arrow', viewBox: '0 0 10 10', refX: '8', refY: '5', markerUnits: 'userSpaceOnUse', markerWidth: '13', markerHeight: '13', orient: 'auto-start-reverse' }, this.defs);
    svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ds-head' }, mk);
    this.nodeEls = {};
    this.edgeEls = {};
    this.ptrEls = {};
    this.last = null;
  };

  function dsSize(n) {
    return SHAPES[n.shape] || SHAPES.node;
  }

  /* where an edge leaves one node and arrives at another */
  function dsPath(a, b, kind) {
    var sa = dsSize(a);
    var sb = dsSize(b);
    var x1, y1, x2, y2;
    if (a.shape === 'circle' || a.shape === 'cell') {
      /* trees and arrays: centre to centre, trimmed to the border */
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ra = a.shape === 'circle' ? 22 : 0;
      var rb = b.shape === 'circle' ? 24 : 0;
      x1 = a.x + (dx / len) * ra;
      y1 = a.y + (dy / len) * ra;
      x2 = b.x - (dx / len) * rb;
      y2 = b.y - (dy / len) * rb;
      return 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
    }
    if (a.shape === 'dnode') {
      if (kind === 'prev') {
        x1 = a.x - sa[0] / 2 + 17; y1 = a.y + 11;
        x2 = b.x + sb[0] / 2; y2 = b.y + 11;
        return 'M' + x1 + ',' + y1 + ' L' + (x2 + 3) + ',' + y2;
      }
      x1 = a.x + sa[0] / 2 - 17; y1 = a.y - 11;
      x2 = b.x - sb[0] / 2; y2 = b.y - 11;
      return 'M' + x1 + ',' + y1 + ' L' + (x2 - 3) + ',' + y2;
    }
    /* singly linked node: leaves from the next cell */
    x1 = a.x + 30;
    y1 = a.y;
    if (Math.abs(b.y - a.y) < 8 && b.x > a.x) {
      x2 = b.x - sb[0] / 2 - 3;
      return 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + b.y;
    }
    if (Math.abs(b.y - a.y) < 8) {
      /* pointing backwards along the row: loop underneath */
      var ya = a.y + sa[1] / 2;
      var yb = b.y + sb[1] / 2 + 3;
      return 'M' + x1 + ',' + ya + ' C' + x1 + ',' + (ya + 52) + ' ' + b.x + ',' + (yb + 52) + ' ' + b.x + ',' + yb;
    }
    if (b.y > a.y) {
      var yt = b.y - sb[1] / 2 - 3;
      return 'M' + x1 + ',' + (a.y + sa[1] / 2) + ' C' + x1 + ',' + (a.y + 60) + ' ' + b.x + ',' + (yt - 40) + ' ' + b.x + ',' + yt;
    }
    var yb2 = b.y + sb[1] / 2 + 3;
    return 'M' + x1 + ',' + (a.y - sa[1] / 2) + ' C' + x1 + ',' + (a.y - 60) + ' ' + b.x + ',' + (yb2 + 40) + ' ' + b.x + ',' + yb2;
  }

  function dsNodeBody(g, n) {
    var sz = dsSize(n);
    var w = sz[0];
    var hgt = sz[1];
    g.textContent = '';
    if (n.shape === 'circle') {
      svgEl('circle', { class: 'ds-body', r: 22 }, g);
      svgEl('text', { class: 'ds-val', 'text-anchor': 'middle', y: 6 }, g).textContent = n.label;
    } else if (n.shape === 'cell') {
      svgEl('rect', { class: 'ds-body', x: -w / 2, y: -hgt / 2, width: w, height: hgt, rx: 8 }, g);
      svgEl('text', { class: 'ds-val', 'text-anchor': 'middle', y: 6 }, g).textContent = n.label;
    } else if (n.shape === 'dnode') {
      svgEl('rect', { class: 'ds-body', x: -w / 2, y: -hgt / 2, width: w, height: hgt, rx: 8 }, g);
      svgEl('line', { class: 'ds-div', x1: -w / 2 + 34, x2: -w / 2 + 34, y1: -hgt / 2, y2: hgt / 2 }, g);
      svgEl('line', { class: 'ds-div', x1: w / 2 - 34, x2: w / 2 - 34, y1: -hgt / 2, y2: hgt / 2 }, g);
      svgEl('text', { class: 'ds-val', 'text-anchor': 'middle', y: 6 }, g).textContent = n.label;
    } else {
      svgEl('rect', { class: 'ds-body', x: -w / 2, y: -hgt / 2, width: w, height: hgt, rx: 8 }, g);
      svgEl('line', { class: 'ds-div', x1: 10, x2: 10, y1: -hgt / 2, y2: hgt / 2 }, g);
      svgEl('text', { class: 'ds-val', 'text-anchor': 'middle', x: -20, y: 6 }, g).textContent = n.label;
    }
    if (n.note) svgEl('text', { class: 'ds-note', 'text-anchor': 'middle', y: hgt / 2 + (n.shape === 'node' || n.shape === 'dnode' ? 34 : 20) }, g).textContent = n.note;
    if (n.shape === 'node' || n.shape === 'dnode') svgEl('text', { class: 'ds-addr', x: -w / 2, y: hgt / 2 + 16 }, g).textContent = n.addr;
  }

  DsStage.prototype.apply = function (st) {
    var self = this;
    var nodeById = {};
    st.nodes.forEach(function (n) { nodeById[n.id] = n; });
    var maxY = 0;
    st.nodes.forEach(function (n) { maxY = Math.max(maxY, n.y + 70); });
    var H = st.height || Math.max(220, maxY + 60);
    this.svg.setAttribute('viewBox', '0 0 ' + DS_W + ' ' + H);

    /* nodes */
    var seen = {};
    st.nodes.forEach(function (n) {
      seen[n.id] = true;
      var e = self.nodeEls[n.id];
      var sig = n.label + '|' + n.note + '|' + n.shape;
      if (!e) {
        var g = svgEl('g', { class: 'ds-node' }, self.layers.nodes);
        var inner = svgEl('g', { class: 'ds-pop' }, g);
        e = self.nodeEls[n.id] = { g: g, inner: inner, sig: null };
        g.style.transform = 'translate(' + n.x + 'px,' + n.y + 'px)';
      }
      if (e.sig !== sig) {
        dsNodeBody(e.inner, n);
        e.sig = sig;
        if (e.sigSeen) restart(e.inner, 'ds-bump', 500);
        e.sigSeen = true;
      }
      e.g.style.transform = 'translate(' + n.x + 'px,' + n.y + 'px)';
      ['done', 'dim', 'hot', 'cur', 'mark', 'bad'].forEach(function (c) {
        e.g.classList.toggle('ds-' + c, n.cls.indexOf(c) >= 0);
      });
      if (st.hot.indexOf(n.id) >= 0) restart(e.inner, 'ds-flash', 900);
    });
    Object.keys(this.nodeEls).forEach(function (id) {
      if (!seen[id]) {
        var e = self.nodeEls[id];
        e.inner.classList.add('ds-leave');
        (function (g) { setTimeout(function () { g.remove(); }, 520); })(e.g);
        delete self.nodeEls[id];
      }
    });

    /* edges */
    var eseen = {};
    st.edges.forEach(function (ed) {
      var a = nodeById[ed.from];
      var b = nodeById[ed.to];
      if (!a || !b) return;
      var key = ed.from + '>' + ed.kind;
      eseen[key] = true;
      var d = dsPath(a, b, ed.kind);
      var e = self.edgeEls[key];
      var cls = 'ds-edge ds-k-' + ed.kind;
      if (!e) {
        var p = svgEl('path', { class: cls + ' ds-draw', 'marker-end': 'url(#ds-arrow)' }, self.layers.edges);
        e = self.edgeEls[key] = { p: p, to: ed.to };
        p.setAttribute('d', d);
      } else if (e.to !== ed.to) {
        e.to = ed.to;
        restart(e.p, 'ds-draw', 700);
      }
      e.p.setAttribute('d', d);
      e.p.style.d = "path('" + d + "')";
    });
    Object.keys(this.edgeEls).forEach(function (key) {
      if (!eseen[key]) {
        self.edgeEls[key].p.remove();
        delete self.edgeEls[key];
      }
    });

    /* pointers: stack up to three chips above or below the node they target */
    var slots = {};
    var dock = 0;
    var pseen = {};
    st.ptrs.forEach(function (p) {
      pseen[p.name] = true;
      var e = self.ptrEls[p.name];
      if (!e) {
        var g = svgEl('g', { class: 'ds-ptr' }, self.layers.ptrs);
        e = self.ptrEls[p.name] = { g: g, built: false };
      }
      var tx, ty, nullish = false;
      var n = p.to ? nodeById[p.to] : null;
      if (n) {
        var sz = dsSize(n);
        var key = p.to + p.dir;
        var k = slots[key] || 0;
        slots[key] = k + 1;
        tx = n.x + (p.dir === 'down' ? 0 : 0);
        var off = sz[1] / 2 + 38 + k * 30;
        ty = p.dir === 'down' ? n.y + off + 14 : n.y - off - 4;
      } else {
        nullish = true;
        tx = 70 + dock * 126;
        ty = 22;
        dock++;
      }
      var sig = p.name + '|' + nullish;
      if (e.sig !== sig) {
        e.g.textContent = '';
        var w = Math.max(54, p.name.length * 11 + 22);
        svgEl('rect', { class: 'ds-chip', x: -w / 2, y: -14, width: w, height: 28, rx: 14 }, e.g);
        svgEl('text', { class: 'ds-chip-t', 'text-anchor': 'middle', y: 5 }, e.g).textContent = nullish ? p.name + ' = none' : p.name;
        if (nullish) {
          e.g.firstChild.setAttribute('width', w + 52);
          e.g.firstChild.setAttribute('x', -(w + 52) / 2);
        }
        e.arrow = svgEl('path', { class: 'ds-ptr-arrow', 'marker-end': 'url(#ds-arrow)' }, e.g);
        e.sig = sig;
      }
      e.g.classList.toggle('ds-null', nullish);
      e.g.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      if (n) {
        e.arrow.setAttribute('d', p.dir === 'down' ? 'M0,-14 L0,-' + (ty - n.y - dsSize(n)[1] / 2 - 4 + 14) : 'M0,14 L0,' + (n.y - dsSize(n)[1] / 2 - ty - 4));
        e.arrow.style.display = '';
      } else {
        e.arrow.style.display = 'none';
      }
    });
    Object.keys(this.ptrEls).forEach(function (name) {
      if (!pseen[name]) {
        self.ptrEls[name].g.remove();
        delete self.ptrEls[name];
      }
    });
  };

  DsStage.prototype.step = function () {
    return false;
  };

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
    document.title = L.title + ' | DSA Visualizer';
    if (L.builtinsTitle) $('api-h').textContent = L.builtinsTitle;
    $('lede').textContent = L.lede;

    var DS = L.mode === 'ds';
    function panel(lang, name, sub) {
      var code = h('ol', { class: 'code', 'aria-label': name + ' code' });
      var svg = svgEl('svg', { class: 'stage show-addr', role: 'img', 'aria-label': name + ' memory' });
      var cap = h('p', { class: 'caption', 'aria-live': 'polite' });
      var el = h('article', { class: 'panel', 'data-lang': lang }, [
        h('header', {}, [h('h2', { text: name }), h('p', { text: sub })]),
        code,
        svg,
        cap,
      ]);
      if (DS && lang !== 'ds') svg.remove();
      return { el: el, code: code, svg: svg, cap: cap };
    }
    var pp = panel('py', 'Python', DS ? 'Objects that hold references to other objects' : 'A name is a tag that points at an object');
    var cp = panel('c', 'C', DS ? 'Structs on the heap, linked by pointers' : 'A name is a box that holds a value');
    $('panels').appendChild(pp.el);
    $('panels').appendChild(cp.el);
    var py, cs, dsg;
    if (DS) {
      var dsSvg = svgEl('svg', { class: 'ds-stage show-addr', role: 'img', 'aria-label': 'Data structure diagram' });
      var dsPanel = h('article', { class: 'panel ds-panel', 'data-lang': 'ds' }, [
        h('header', {}, [h('h2', { text: 'Structure' }), h('p', { text: 'The same picture for both languages' })]),
        dsSvg,
      ]);
      $('panels').appendChild(dsPanel);
      dsg = new DsStage(dsSvg);
    } else {
      py = new PyStage(pp.svg);
      cs = new CStage(cp.svg);
    }

    /* dock controls */
    var bReset = h('button', { class: 'btn ghost', type: 'button', text: 'Reset', onclick: function () { stop(); go(0); } });
    var bBack = h('button', { class: 'btn', type: 'button', text: 'Back', onclick: function () { stop(); go(idx - 1); } });
    var bStep = h('button', { class: 'btn primary', type: 'button', text: 'Step', onclick: function () { stop(); go(idx + 1); } });
    var bPlay = h('button', { class: 'btn', type: 'button', text: 'Play', onclick: toggle });
    var dots = h('div', { class: 'dots', role: 'group', 'aria-label': 'Steps' });
    var count = h('span', { class: 'count' });
    $('controls').appendChild(h('div', { class: 'btns' }, [bReset, bBack, bStep, bPlay]));
    $('controls').appendChild(dots);
    $('controls').appendChild(count);

    /* options above the screens */
    var addr = h('input', { type: 'checkbox', id: 'addr', checked: 'checked' });
    var speedSel = h('select', { id: 'speed', 'aria-label': 'Play speed' }, [
      h('option', { value: '2400', text: 'Slow' }),
      h('option', { value: '1500', text: 'Normal' }),
      h('option', { value: '800', text: 'Fast' }),
    ]);
    speedSel.value = '1500';
    $('opts').appendChild(h('label', { for: 'addr' }, [addr, document.createTextNode('Show addresses')]));
    $('opts').appendChild(h('label', { for: 'speed' }, [document.createTextNode('Speed'), speedSel]));
    addr.addEventListener('change', function () {
      if (DS) dsSvg.classList.toggle('show-addr', addr.checked);
      else {
        pp.svg.classList.toggle('show-addr', addr.checked);
        cp.svg.classList.toggle('show-addr', addr.checked);
      }
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
      if (DS) dsg.apply(s);
      else {
        py.apply(s);
        cs.apply(s);
      }

      [].forEach.call(pp.code.children, function (li, n) {
        li.classList.toggle('on', n === step.pl);
      });
      [].forEach.call(cp.code.children, function (li, n) {
        li.classList.toggle('on', n === step.cl);
      });
      pp.cap.textContent = '';
      if (s.perr) pp.cap.appendChild(h('span', { class: 'err', text: s.perr }));
      pp.cap.appendChild(document.createTextNode(step.say));
      cp.cap.textContent = '';
      if (s.err) cp.cap.appendChild(h('span', { class: 'err', text: s.err }));
      cp.cap.appendChild(document.createTextNode(step.csay));
      if (!reduce) {
        restart(pp.cap, 'swap', 500);
        restart(cp.cap, 'swap', 500);
      }

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

    var tabs = $('scenes');
    scenes.forEach(function (sc) {
      tabs.appendChild(
        h('button', { class: 'scene-tab', type: 'button', role: 'tab', id: 'tab-' + sc.id, text: sc.title, onclick: function () { location.hash = sc.id; } })
      );
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
      var sc =
        scenes.filter(function (s) {
          return s.id === id;
        })[0] || scenes[0];
      stop();
      cur = sc;
      [].forEach.call(tabs.children, function (t, n) {
        t.setAttribute('aria-selected', scenes[n] === sc ? 'true' : 'false');
      });
      $('blurb').textContent = sc.blurb;
      $('trap-text').textContent = sc.trap;
      renderCode(pp.code, sc.pyCode);
      renderCode(cp.code, sc.cCode);
      snaps = DS ? buildDsSnapshots(sc.steps) : buildSnapshots(sc.steps);
      if (DS) dsg.reset();
      else {
        py.reset();
        cs.reset();
      }
      dots.textContent = '';
      sc.steps.forEach(function (_, n) {
        dots.appendChild(
          h('button', { class: 'dot', type: 'button', 'aria-label': n === 0 ? 'Start' : 'Go to step ' + n, onclick: function () { stop(); go(n); } })
        );
      });
      renderPredict(sc);
      go(0);
    }

    renderDepth(window.DEPTH);

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
      if (e.key === 'ArrowRight') {
        stop();
        go(idx + 1);
      } else if (e.key === 'ArrowLeft') {
        stop();
        go(idx - 1);
      }
    });

    select(location.hash.slice(1));
    window.__dsav = {
      go: go,
      snaps: function () {
        return snaps;
      },
      index: function () {
        return idx;
      },
    };
  }

  window.DSAV = { mount: mount, hero: hero, buildSnapshots: buildSnapshots, buildDsSnapshots: buildDsSnapshots };
})();
