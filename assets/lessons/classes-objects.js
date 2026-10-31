/* Lesson data: Classes and objects (structure mode). Objects are drawn as a header cell plus one cell per field. */
(function () {
  function box(id, x, y, title, fields) {
    var ops = [['node', id, title, x, y, 'cell'], ['tag', id, 'mark']];
    (fields || []).forEach(function (f, k) { ops.push(['node', id + 'f' + k, f, x, y + 48 * (k + 1), 'cell']); });
    return ops;
  }
  var CLS = box('K', 120, 60, 'Point', ['__init__', 'move']).concat([['note', 'K', 'class']]);

  var inst = [{ pl: -1, cl: -1, h: 440, say: 'A class is a blueprint: it holds the methods shared by every object of that kind. Calling the class creates an object, an independent bundle of named fields (its attributes).', csay: 'A struct type plus functions that take a pointer to it.', ds: CLS },
    { pl: 4, cl: 4, h: 440, say: 'p = Point(1, 2): Python allocates a new object, links it to its class, and runs __init__, which sets self.x and self.y on that object. The variable p holds a reference to it.', csay: 'Point *p = malloc(sizeof *p); init(p, 1, 2);', ds: box('P', 480, 60, 'Point', ['x=1', 'y=2']).concat([['edge', 'P', 'K', 'e1'], ['ptr', 'p', 'P', 'up']]) },
    { pl: 5, cl: 5, h: 440, say: 'q = Point(3, 4) makes a second object. It has its own x and y, but shares the class (and its methods) with p. Two objects, two sets of fields, one set of code.', csay: 'A second allocation.', ds: box('Q', 700, 60, 'Point', ['x=3', 'y=4']).concat([['edge', 'Q', 'K', 'e1'], ['ptr', 'q', 'Q', 'up']]) },
    { pl: 6, cl: 6, h: 440, say: 'r = p copies the reference, not the object. Now p and r are two names for the same object, exactly like two pointers to one struct in C.', csay: 'Point *r = p;  /* same address */', ds: [['ptr', 'r', 'P', 'up']] },
    { pl: 7, cl: 7, h: 440, say: 'r.x = 9 changes the object that r refers to. Because p refers to the same object, p.x is now 9 as well. To get an independent copy you would create a new object (copy.copy, or call the class again).', csay: 'r->x = 9;  /* p->x is 9 too */', ds: [['lab', 'Pf0', 'x=9'], ['hot', 'Pf0', 'P']] },
  ];

  /* attributes: instance versus class */
  var CLS2 = box('K', 120, 60, 'Dog', ['species', '__init__']).concat([['note', 'K', 'class'], ['lab', 'Kf0', 'canine']]);
  var attr = [{ pl: -1, cl: -1, h: 440, say: 'Attributes can live in two places: on the object (set through self) or on the class (shared by all objects). Here species is a class attribute and name is an instance attribute.', csay: 'Shared data in a static; per-object data in the struct.', ds: CLS2.concat(box('D1', 480, 60, 'd1', ['name=Rex']), box('D2', 700, 60, 'd2', ['name=Ann']), [['edge', 'D1', 'K', 'e1'], ['edge', 'D2', 'K', 'e1']]) },
    { pl: 6, cl: 6, h: 440, say: 'd1.name: Python looks in the object first. It finds name there. Done.', csay: 'Found in the struct.', ds: [['tag', 'D1f0', 'done'], ['hot', 'D1f0']] },
    { pl: 7, cl: 7, h: 440, say: 'd1.species: the object has no such attribute, so Python follows the link to the class and looks there. It finds "canine". Lookup order is object first, then class (then parent classes).', csay: 'Not in the struct: read the shared value.', ds: [['untag', 'D1f0', 'done'], ['tag', 'D1', 'dim'], ['tag', 'D1f0', 'dim'], ['etag', 'D1', 'e1', 'on'], ['tag', 'Kf0', 'done'], ['hot', 'Kf0']] },
    { pl: 8, cl: 8, h: 440, say: 'd1.species = "wolf": assignment never writes to the class through an object. It creates a new instance attribute on d1 that shadows the class one. d2.species still reads "canine" from the class.', csay: 'Only d1 gets its own field.', ds: [['untag', 'D1', 'dim'], ['untag', 'D1f0', 'dim'], ['etag', 'D1', 'e1', 'dim'], ['untag', 'Kf0', 'done'], ['node', 'D1f1', 'species=wolf', 480, 156, 'cell'], ['hot', 'D1f1']] },
  ];

  /* methods and self */
  var meth = [{ pl: -1, cl: -1, h: 440, say: 'A method is a function defined in the class whose first parameter, conventionally self, receives the object. This is how one piece of code operates on many different objects.', csay: 'A function whose first parameter is the struct pointer.', ds: CLS.concat(box('P', 480, 60, 'p', ['x=1', 'y=2']), [['edge', 'P', 'K', 'e1']]) },
    { pl: 4, cl: 4, h: 440, say: 'p.move(5, 1) is exactly Point.move(p, 5, 1): Python looks up move on the class and passes the object as the first argument. The call frame holds self (a reference to p) and the two arguments.', csay: 'move(&p, 5, 1);', ds: [['node', 'Fs', 'self', 480, 250, 'cell'], ['node', 'Fa', 'dx=5', 580, 250, 'cell'], ['node', 'Fb', 'dy=1', 680, 250, 'cell'], ['edge', 'Fs', 'Pf1', 'e1'], ['tag', 'Fs', 'cur']] },
    { pl: 2, cl: 2, h: 440, say: 'self.x += dx updates the field of the object that self points to, which is p. The method has no copy of p; it works on the real thing.', csay: 'self->x += dx;', ds: [['lab', 'Pf0', 'x=6'], ['hot', 'Pf0']] },
    { pl: 3, cl: 3, h: 440, say: 'self.y += dy likewise. When the call returns, the frame disappears and p keeps its new state. Calling q.move(...) would run the same code with a different self.', csay: 'self->y += dy;', ds: [['lab', 'Pf1', 'y=3'], ['hot', 'Pf1']] },
    { pl: 4, cl: 4, h: 440, say: 'Frame gone, object changed: p is now (6, 3). Forgetting self in the parameter list is the classic error: Python still passes the object, so the call fails with "takes 2 positional arguments but 3 were given".', csay: 'Frame popped.', ds: [['rm', 'Fs'], ['rm', 'Fa'], ['rm', 'Fb']] },
  ];

  window.LESSON = {
    id: 'classes-objects',
    mode: 'ds',
    title: 'Classes and objects',
    lede:
      'A class bundles data and the functions that work on it. An object is one instance: its own set of attributes plus a link to the class that supplies the methods. For someone who thinks in C, an object is a heap-allocated struct, a method is a function that takes a pointer to that struct as its first argument (self), and a variable holding an object is a pointer. Seeing it that way removes most of the mystery, including why assignment aliases instead of copying.',
    scenes: [
      { id: 'instances', title: 'Classes make objects', blurb: 'Each object has its own fields; the class holds the shared code. Variables are references.', trap: 'Assuming b = a copies the object. It copies the reference: both names now see every change. Use copy.copy or construct a new object when you need an independent one.', pyCode: ['class Point:', '    def __init__(self, x, y):', '        self.x = x; self.y = y', '', 'p = Point(1, 2)', 'q = Point(3, 4)', 'r = p', 'r.x = 9   # p.x is 9 too'], cCode: ['typedef struct { int x, y; } Point;', 'void init(Point *self, int x, int y)', '    { self->x = x; self->y = y; }', '', 'Point *p = new_point(1, 2);', 'Point *q = new_point(3, 4);', 'Point *r = p;', 'r->x = 9;   /* p->x is 9 too */'], predict: { q: 'After <code>r = p</code> and <code>r.x = 9</code>, what is <code>p.x</code>?', options: ['1, because p is a separate copy', '9, because p and r refer to the same object', 'It raises an error'], answer: 1, why: 'Assignment copies the reference. Both names point to the single object, so a change through one is visible through the other.' }, steps: inst },
      { id: 'attributes', title: 'Instance and class attributes', blurb: 'Lookup goes object first, then class. Assignment through an object creates an instance attribute.', trap: 'Mutable class attributes. A list defined on the class is shared by every instance, so appending through one object changes all of them. Create mutable state inside __init__.', pyCode: ['class Dog:', '    species = "canine"        # class attribute', '    def __init__(self, name):', '        self.name = name       # instance attribute', '', 'd1, d2 = Dog("Rex"), Dog("Ann")', 'd1.name        # found on the object', 'd1.species     # not on the object: found on the class', 'd1.species = "wolf"   # shadows, does not change the class'], cCode: ['static const char *species = "canine";   /* shared */', 'typedef struct { const char *name; const char *species_override; } Dog;', '/* per-object field: name */', '', 'Dog d1 = {"Rex", NULL}, d2 = {"Ann", NULL};', 'd1.name;', 'd1.species_override ? d1.species_override : species;', '/* read: object first, then shared value */', 'd1.species_override = "wolf";'], predict: { q: 'After <code>d1.species = "wolf"</code>, what does <code>d2.species</code> return?', options: ['"wolf"', '"canine"', 'An AttributeError'], answer: 1, why: 'The assignment created an attribute on d1 only. The class attribute is unchanged, so d2 still reads "canine".' }, steps: attr },
      { id: 'methods', title: 'Methods and self', blurb: 'obj.method(args) is Class.method(obj, args): the object is passed in as self.', trap: 'Leaving self out of the method definition, or forgetting that assigning to a plain name inside a method makes a local variable, not an attribute. Use self.name to change the object.', pyCode: ['class Point:', '    def move(self, dx, dy):', '        self.x += dx', '        self.y += dy', 'p.move(5, 1)   # same as Point.move(p, 5, 1)'], cCode: ['void move(Point *self, int dx, int dy) {', '    self->x += dx;', '    self->y += dy;', '}', 'move(p, 5, 1);'], predict: { q: 'Which call is equivalent to <code>p.move(5, 1)</code>?', options: ['Point.move(5, 1)', 'Point.move(p, 5, 1)', 'p.Point.move(5, 1)'], answer: 1, why: 'Python looks up move on the class and passes the object as the first argument, self.' }, steps: meth },
    ],
    builtins: [
      ['type(x), isinstance(x, C)', 'The class of an object; test whether x is an instance of C (or a subclass).'],
      ['vars(x) / x.__dict__', 'The dict of an object\'s own attributes.'],
      ['getattr, setattr, hasattr', 'Attribute access by name (strings).'],
      ['id(x), x is y', 'Identity: same object or not. == compares values.'],
      ['copy.copy / copy.deepcopy', 'Shallow and deep copies of an object.'],
      ['__slots__', 'Fixed set of attributes: no per-object dict, less memory.'],
    ],
  };
})();
