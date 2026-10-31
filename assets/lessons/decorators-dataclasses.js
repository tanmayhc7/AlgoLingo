/* Lesson data: Decorators and dataclasses (structure mode). */
(function () {
  function box(id, x, y, title, fields) {
    var ops = [['node', id, title, x, y, 'cell'], ['tag', id, 'mark']];
    (fields || []).forEach(function (f, k) { ops.push(['node', id + 'f' + k, f, x, y + 48 * (k + 1), 'cell']); });
    return ops;
  }
  var dec = [
    { pl: 5, cl: 4, h: 440, say: 'def square creates a function object and binds the name square to it. At this point, the decorator line above has not yet been applied.', csay: 'real = square;', ds: box('F', 200, 60, 'square', ['x * x']).concat([['ptr', 'square', 'F', 'up']]) },
    { pl: 4, cl: 4, h: 440, say: '@timed means: after the def, run square = timed(square). timed builds a new function, wrapper, which keeps a reference to the original (its closure variable fn).', csay: 'A new function that holds the original pointer.', ds: box('W', 560, 60, 'wrapper', ['fn']).concat([['edge', 'Wf0', 'F', 'e1']]) },
    { pl: 4, cl: 5, h: 440, say: 'The name square is rebound to the wrapper. The original function still exists, but only the wrapper knows about it now.', csay: 'Fn square_p = wrapper;', ds: [['ptr', 'square', 'W', 'up'], ['tag', 'F', 'dim'], ['tag', 'Ff0', 'dim']] },
    { pl: 6, cl: 6, h: 440, say: 'square(3) now calls the wrapper. This is where logging, timing, caching or permission checks can run before and after the real work.', csay: 'square_p(3) runs wrapper.', ds: [['tag', 'W', 'cur'], ['hot', 'W']] },
    { pl: 2, cl: 2, h: 440, say: 'The wrapper calls fn(3), the original function, and passes its result back. The caller sees the same behaviour plus whatever the wrapper added.', csay: 'return real(x);', ds: [['untag', 'F', 'dim'], ['untag', 'Ff0', 'dim'], ['etag', 'Wf0', 'e1', 'on'], ['tag', 'F', 'done'], ['hot', 'F']] },
  ];
  var dc = [
    { pl: 2, cl: 0, h: 440, say: 'A class that only declares its fields with annotations (x: int, y: int). By itself this would have no constructor, no readable print and no comparison.', csay: 'A bare struct: just the fields.', ds: box('K', 120, 60, 'Point', ['x: int', 'y: int']) },
    { pl: 1, cl: 1, h: 440, say: '@dataclass reads the annotations and writes the boring methods for you: __init__(self, x, y), __repr__ and __eq__. It runs once, when the class is defined.', csay: 'In C you write the constructor, the printer and the comparison by hand.', ds: box('M', 640, 60, 'methods', ['__init__', '__repr__', '__eq__']).concat([['tag', 'Mf0', 'done'], ['tag', 'Mf1', 'done'], ['tag', 'Mf2', 'done']]) },
    { pl: 5, cl: 5, h: 440, say: 'p = Point(1, 2) uses the generated __init__ to set both fields.', csay: 'Point p = point_new(1, 2);', ds: box('P', 380, 60, 'p', ['x=1', 'y=2']).concat([['edge', 'P', 'K', 'e1'], ['untag', 'Mf0', 'done'], ['untag', 'Mf1', 'done'], ['untag', 'Mf2', 'done'], ['hot', 'Mf0']]) },
    { pl: 6, cl: 6, h: 440, say: 'print(p) shows Point(x=1, y=2) from the generated __repr__, handy for debugging.', csay: 'point_print(p);', ds: [['hot', 'Mf1', 'P']] },
    { pl: 7, cl: 7, h: 440, say: 'p == Point(1, 2) uses the generated __eq__, which compares the fields as tuples. Two different objects with equal fields are equal. Add frozen=True and the class also gets a __hash__ and rejects attribute changes.', csay: 'point_eq(p, point_new(1, 2));', ds: [['hot', 'Mf2', 'Pf0', 'Pf1']] },
  ];
  window.LESSON = {
    id: 'decorators-dataclasses',
    mode: 'ds',
    title: 'Decorators and dataclasses',
    lede:
      'A decorator is a function that takes a function and returns a replacement; the @ line is shorthand for rebinding the name. Dataclasses are decorators that read a class\'s field annotations and generate the repetitive methods. Both are ordinary Python executed at definition time. In C the closest tools are wrapping a function pointer and writing the boilerplate (or macros) yourself.',
    scenes: [
      { id: 'decorator', title: 'Decorators wrap functions', blurb: '@deco above def f means f = deco(f). The name now points at the wrapper.', trap: 'Forgetting functools.wraps: the wrapper replaces the function\'s name and docstring, which breaks help(), debuggers and some frameworks. Also, a decorator runs when the function is defined, while the wrapper runs on every call.', pyCode: ['def timed(fn):', '    def wrapper(*args):', '        print("calling"); return fn(*args)', '    return wrapper', '@timed', 'def square(x): return x * x', 'square(3)   # prints "calling", returns 9'], cCode: ['typedef int (*Fn)(int);', 'static Fn real;', 'int wrapper(int x) { puts("calling"); return real(x); }', '', 'real = square;', 'Fn square_p = wrapper;   /* rebind the name */', 'square_p(3);'], predict: { q: 'What does <code>@timed</code> above <code>def square</code> do?', options: ['Runs square once right away', 'Rebinds the name: square = timed(square)', 'Copies square into timed'], answer: 1, why: 'The decorator syntax is exactly that assignment, executed right after the def statement.' }, steps: dec },
      { id: 'dataclass', title: 'Dataclasses write the boilerplate', blurb: 'Declare fields once; __init__, __repr__ and __eq__ are generated.', trap: 'Mutable defaults: a field written as tags: list = [] raises an error (use field(default_factory=list)). Also remember that a normal dataclass is mutable and therefore unhashable by default; use frozen=True if you need it as a dict key or set member.', pyCode: ['from dataclasses import dataclass', '@dataclass', 'class Point:', '    x: int', '    y: int = 0', 'p = Point(1, 2)', 'print(p)   # Point(x=1, y=2)', 'p == Point(1, 2)   # True'], cCode: ['typedef struct { int x, y; } Point;', '/* constructor, printer and comparison are all hand-written */', 'Point point_new(int x, int y) { return (Point){x, y}; }', 'void point_print(Point p) { printf("Point(x=%d, y=%d)", p.x, p.y); }', 'int point_eq(Point a, Point b) { return a.x == b.x && a.y == b.y; }', 'Point p = point_new(1, 2);', 'point_print(p);', 'point_eq(p, point_new(1, 2));   /* 1 */'], predict: { q: 'Two <code>Point(1, 2)</code> dataclass instances: is <code>a == b</code> true?', options: ['No, they are different objects', 'Yes, the generated __eq__ compares the fields', 'Only if you wrote __eq__ yourself'], answer: 1, why: '@dataclass generates __eq__ comparing the fields in order, so equal contents mean equal objects. (is would still be False.)' }, steps: dc },
    ],
    builtins: [
      ['functools.wraps', 'Copy name, docstring and attributes onto a wrapper.'],
      ['functools.lru_cache, cache', 'Memoise a pure function by decorating it.'],
      ['@property, @staticmethod, @classmethod', 'Built-in decorators for computed attributes and non-instance methods.'],
      ['@dataclass(frozen=True, order=True)', 'Immutable and sortable dataclasses; field(default_factory=list) for mutable defaults.'],
      ['dataclasses.asdict, replace', 'Convert to a dict; make a modified copy.'],
      ['typing.NamedTuple', 'Immutable, tuple-like record with named fields.'],
    ],
  };
})();
