/* Chapter quiz engine. A quiz is plain data (assets/quizzes/chapter-N.js, window.QUIZ).
   Question types:
     mcq      { type, q, options, answer, why }
     write    { type, q, starter, tests, hint, solution, why }   write a function from scratch
     complete { type, q, starter (with ___ blanks), tests, hint, solution, why }
     debug    { type, q, starter (buggy code), tests, hint, solution, why }
   For code questions, tests are [{ expr, want }]: the learner's code is run, expr is evaluated
   and compared with want (both Python expressions). Python runs in the browser through Pyodide,
   loaded the first time a code question is checked. A step limit stops endless loops. */
(function () {
  'use strict';

  var PY_INDEX = window.PYODIDE_INDEX || 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

  var HARNESS = String.raw`
import json, sys, traceback
FN = '<your code>'
def _tracer(limit):
    n = [0]
    def tr(frame, event, arg):
        n[0] += 1
        if n[0] > limit:
            raise TimeoutError('Your code ran for too long. Does a loop never end?')
        return tr
    return tr
def _fmt(e):
    if isinstance(e, SyntaxError):
        return 'SyntaxError: %s (line %s)' % (e.msg, e.lineno)
    line = None
    for f in traceback.extract_tb(e.__traceback__):
        if f.filename == FN:
            line = f.lineno
    s = '%s: %s' % (type(e).__name__, e)
    return s + (' (line %d)' % line if line else '')
def _check(code, tests_json):
    tests = json.loads(tests_json)
    ns = {'__name__': 'quiz'}
    out = {'error': None, 'results': []}
    sys.settrace(_tracer(300000))
    try:
        exec(compile(code, FN, 'exec'), ns)
    except BaseException as e:
        sys.settrace(None)
        out['error'] = _fmt(e)
        return json.dumps(out)
    finally:
        sys.settrace(None)
    for t in tests:
        r = {'expr': t['expr'], 'ok': False, 'got': None, 'want': t['want']}
        sys.settrace(_tracer(300000))
        try:
            got = eval(t['expr'], ns)
            want = eval(t['want'], {})
            r['got'] = repr(got)
            r['ok'] = (got == want and type(got) == type(want))
        except BaseException as e:
            r['got'] = _fmt(e)
        finally:
            sys.settrace(None)
        out['results'].append(r)
    return json.dumps(out)
`;

  var pyReady = null;
  function loadPy() {
    if (pyReady) return pyReady;
    pyReady = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = PY_INDEX + 'pyodide.js';
      s.onload = function () {
        window.loadPyodide({ indexURL: PY_INDEX }).then(function (py) {
          py.runPython(HARNESS);
          resolve(py);
        }, reject);
      };
      s.onerror = function () {
        reject(new Error('Could not load the Python runtime.'));
      };
      document.head.appendChild(s);
    });
    pyReady.catch(function () {
      pyReady = null;
    });
    return pyReady;
  }

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') e[k] = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) {
      if (c) e.appendChild(c);
    });
    return e;
  }

  var KIND = { mcq: 'Multiple choice', write: 'Write the code', complete: 'Complete the code', debug: 'Find and fix the bug' };
  var done = {};
  var total = 0;
  var storeKey = '';

  function save() {
    try {
      localStorage.setItem(storeKey, JSON.stringify(done));
    } catch (e) {}
  }

  function updateSummary() {
    var n = Object.keys(done).filter(function (k) {
      return done[k];
    }).length;
    /* the chapter counts as completed on the home page once every question has been attempted */
    var answered = Object.keys(done).filter(function (k) {
      return typeof done[k] === 'boolean' && +k < total;
    }).length;
    try {
      if (answered >= total) localStorage.setItem('dsav-qdone-' + storeKey.replace('dsav-quiz-', ''), '1');
      else localStorage.removeItem('dsav-qdone-' + storeKey.replace('dsav-quiz-', ''));
    } catch (e) {}
    document.getElementById('score').textContent = n + ' of ' + total + ' correct';
    var bar = document.getElementById('bar');
    bar.style.width = (n / total) * 100 + '%';
    var msg = document.getElementById('verdict');
    msg.textContent =
      n === total
        ? 'All done. Move on to the next lesson, or come back and retry anything you want.'
        : 'Questions you got right stay marked on this device. You can recheck any of them.';
  }

  function markDone(i, ok) {
    done[i] = ok;
    save();
    updateSummary();
  }

  function mcq(q, i, card) {
    var out = h('p', { class: 'q-out', 'aria-live': 'polite' });
    var list = h('div', { class: 'q-options' });
    q.options.forEach(function (o, n) {
      var b = h('button', { type: 'button', class: 'choice' });
      b.innerHTML = o;
      b.onclick = function () {
        [].forEach.call(list.children, function (x) {
          x.disabled = true;
        });
        var ok = n === q.answer;
        b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) list.children[q.answer].classList.add('right');
        out.className = 'q-out show ' + (ok ? 'good' : 'bad');
        out.innerHTML = '<strong>' + (ok ? 'Correct. ' : 'Not quite. ') + '</strong>' + q.why;
        markDone(i, ok);
      };
      list.appendChild(b);
    });
    card.appendChild(list);
    card.appendChild(out);
  }

  function code(q, i, card) {
    var ta = h('textarea', { class: 'editor', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Your code' });
    ta.value = q.starter;
    ta.rows = Math.max(5, q.starter.split('\n').length + 1);
    ta.onkeydown = function (ev) {
      if (ev.key === 'Tab') {
        ev.preventDefault();
        var s = ta.selectionStart;
        ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = s + 4;
      } else if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault();
        run();
      }
    };
    var out = h('div', { class: 'q-out', 'aria-live': 'polite' });
    var hintP = h('p', { class: 'q-hint', hidden: '' });
    hintP.textContent = 'Hint: ' + q.hint;
    var sol = h('div', { class: 'q-solution', hidden: '' }, [h('p', { text: 'One solution:' }), h('pre', { text: q.solution })]);
    var attempted = false;

    var bRun = h('button', { type: 'button', class: 'btn primary', text: 'Check my code' });
    var bHint = h('button', { type: 'button', class: 'btn ghost', text: 'Hint' });
    var bSol = h('button', { type: 'button', class: 'btn ghost', text: 'Show a solution', disabled: '' });
    var bReset = h('button', { type: 'button', class: 'btn ghost', text: 'Reset code' });
    bHint.onclick = function () {
      hintP.hidden = !hintP.hidden;
    };
    bSol.onclick = function () {
      sol.hidden = !sol.hidden;
    };
    bReset.onclick = function () {
      ta.value = q.starter;
    };

    function show(cls, html) {
      out.className = 'q-out show ' + cls;
      out.innerHTML = html;
    }
    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }

    function run() {
      if (q.starter.indexOf('___') !== -1 && ta.value.indexOf('___') !== -1) {
        show('bad', 'Replace the <code>___</code> with your code first.');
        return;
      }
      bRun.disabled = true;
      show('', 'Checking' + (pyReady ? '' : '. The first check loads Python, which takes a few seconds') + '...');
      loadPy().then(
        function (py) {
          var res = JSON.parse(py.globals.get('_check')(ta.value, JSON.stringify(q.tests)));
          bRun.disabled = false;
          attempted = true;
          bSol.disabled = false;
          if (res.error) {
            show('bad', '<strong>Your code did not run.</strong><pre>' + esc(res.error) + '</pre>');
            markDone(i, false);
            return;
          }
          var pass = res.results.every(function (r) {
            return r.ok;
          });
          var rows = res.results
            .map(function (r) {
              return (
                '<li class="' + (r.ok ? 'ok' : 'no') + '"><code>' + esc(r.expr) + '</code> ' +
                (r.ok ? 'gives <code>' + esc(r.got) + '</code>' : 'gave <code>' + esc(r.got) + '</code>, expected <code>' + esc(r.want) + '</code>') +
                '</li>'
              );
            })
            .join('');
          show(pass ? 'good' : 'bad', '<strong>' + (pass ? 'Correct. ' : 'Not yet. ') + '</strong>' + (pass ? q.why : 'Some checks failed.') + '<ul class="tests">' + rows + '</ul>');
          markDone(i, pass);
        },
        function () {
          bRun.disabled = false;
          bSol.disabled = false;
          show('bad', 'The Python runtime could not load. It needs an internet connection and a full browser, so checking is unavailable here. You can still read the hint and the solution.');
        }
      );
    }
    bRun.onclick = run;
    card.appendChild(ta);
    card.appendChild(h('div', { class: 'q-actions' }, [bRun, bHint, bSol, bReset]));
    card.appendChild(hintP);
    card.appendChild(out);
    card.appendChild(sol);
  }

  function render(Q) {
    var root = document.getElementById('questions');
    total = Q.questions.length;
    storeKey = 'dsav-quiz-' + Q.chapter;
    try {
      done = JSON.parse(localStorage.getItem(storeKey) || '{}') || {};
    } catch (e) {
      done = {};
    }
    document.getElementById('q-title').textContent = 'Chapter ' + Q.chapter + ' quiz: ' + Q.title;
    document.title = 'Chapter ' + Q.chapter + ' quiz | Algolingo';
    document.getElementById('q-lede').textContent = Q.lede;
    Q.questions.forEach(function (q, i) {
      var card = h('section', { class: 'card q', 'aria-labelledby': 'q' + i });
      card.appendChild(h('div', { class: 'q-head' }, [h('span', { class: 'q-num', text: String(i + 1) }), h('span', { class: 'q-kind k-' + q.type, text: KIND[q.type] })]));
      card.appendChild(h('p', { class: 'q-text', id: 'q' + i, html: q.q }));
      (q.type === 'mcq' ? mcq : code)(q, i, card);
      root.appendChild(card);
    });
    updateSummary();
  }

  window.Quiz = { render: render };
})();
