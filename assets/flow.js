/* Tiny helper for lessons whose pictures are rows of labelled cells. Frames are compact objects; Flow.steps turns them into ds steps.
   frame: {pl, cl, say, csay, add:[[id,label,col,row,shape?]], lab:[[id,text]], tag:[[id,cls]], untag:[[id,cls]], hot:[ids], ptr:[[name,id,dir]], unptr:[names], note:[[id,text]], rm:[ids]}
   col and row are grid positions; labels should be 7 characters or fewer. */
(function () {
  var G = { x0: 110, dx: 110, y0: 34, dy: 45 };
  window.Flow = {
    steps: function (frames, o) {
      o = Object.assign({}, G, o || {});
      return frames.map(function (f) {
        var ds = [];
        (f.ops || []).forEach(function (op) { ds.push(op); });
        (f.add || []).forEach(function (a) { ds.push(['node', a[0], a[1], o.x0 + a[2] * o.dx, o.y0 + a[3] * o.dy, a[4] || 'cell']); });
        (f.lab || []).forEach(function (a) { ds.push(['lab', a[0], a[1]]); });
        (f.untag || []).forEach(function (a) { ds.push(['untag', a[0], a[1]]); });
        (f.tag || []).forEach(function (a) { ds.push(['tag', a[0], a[1]]); });
        (f.unptr || []).forEach(function (n) { ds.push(['unptr', n]); });
        (f.ptr || []).forEach(function (a) { ds.push(['ptr', a[0], a[1], a[2] || 'down']); });
        (f.note || []).forEach(function (a) { ds.push(['note', a[0], a[1]]); });
        if (f.hot && f.hot.length) ds.push(['hot'].concat(f.hot));
        (f.rm || []).forEach(function (id) { ds.push(['rm', id]); });
        return { pl: f.pl || 0, cl: f.cl || 0, h: 380, say: f.say, csay: f.csay || '', ds: ds };
      });
    },
    /* a dim row label placed in column 0 */
    label: function (id, text, row) { return [id, text, 0, row]; }
  };
})();
