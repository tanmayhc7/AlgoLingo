/* Lesson data: Inheritance and method resolution (structure mode). */
(function () {
  function box(id, x, y, title, fields) {
    var ops = [['node', id, title, x, y, 'cell'], ['tag', id, 'mark']];
    (fields || []).forEach(function (f, k) { ops.push(['node', id + 'f' + k, f, x, y + 48 * (k + 1), 'cell']); });
    return ops;
  }
  var base = box('A', 120, 60, 'Animal', ['eat', 'speak']).concat([['note', 'A', 'base class']]);
  var sub = box('G', 360, 60, 'Dog', ['speak', 'fetch']).concat([['note', 'G', 'subclass'], ['edge', 'G', 'A', 'e1']]);
  var lk = [
    { pl: 3, cl: 3, h: 440, say: 'Dog(Animal) makes Dog a subclass. It starts with everything Animal has (eat, speak) and may add new methods (fetch) or override old ones (speak). The arrow means "look here next".', csay: 'C has no inheritance: you embed the base part first and keep a table of function pointers.', ds: base.concat(sub) },
    { pl: 6, cl: 6, h: 440, say: 'd = Dog() creates an object whose class link points to Dog. Its own attributes (like a name) live on the object.', csay: 'Dog d = { &dog_vt };', ds: box('D', 640, 60, 'd', ['name=Rex']).concat([['edge', 'D', 'G', 'e1']]) },
    { pl: 7, cl: 7, h: 440, say: 'd.speak(): look in d, then in Dog. Dog defines speak, so the search stops there and returns "woof". The Animal version is overridden (hidden), not deleted.', csay: 'The table entry points at dog_speak.', ds: [['tag', 'D', 'dim'], ['tag', 'Df0', 'dim'], ['tag', 'Gf0', 'done'], ['hot', 'Gf0']] },
    { pl: 8, cl: 8, h: 440, say: 'd.eat(): not on d, not on Dog, so follow the base-class arrow to Animal and find eat there. The inherited method receives d as self, even though the code lives in Animal.', csay: 'Same function, called with a Dog pointer as its first argument.', ds: [['untag', 'Gf0', 'done'], ['tag', 'G', 'dim'], ['tag', 'Gf0', 'dim'], ['tag', 'Gf1', 'dim'], ['etag', 'G', 'e1', 'on'], ['tag', 'Af0', 'done'], ['hot', 'Af0']] },
    { pl: 4, cl: 4, h: 440, say: 'Inside Dog.speak, super().speak() starts the search one step above Dog and finds Animal.speak. Use it to extend an inherited behaviour instead of copying it.', csay: 'Call the base function explicitly: animal_speak(&d).', ds: [['untag', 'Af0', 'done'], ['untag', 'G', 'dim'], ['untag', 'Gf0', 'dim'], ['untag', 'Gf1', 'dim'], ['untag', 'D', 'dim'], ['untag', 'Df0', 'dim'], ['tag', 'Af1', 'done'], ['hot', 'Af1']] },
  ];
  /* MRO diamond */
  var dia = [['node', 'A', 'A', 500, 40, 'cell'], ['node', 'B', 'B', 300, 120, 'cell'], ['node', 'C', 'C', 700, 120, 'cell'], ['node', 'D', 'D', 500, 200, 'cell'], ['note', 'A', 'hello'], ['note', 'C', 'hello'], ['edge', 'D', 'B', 'e1'], ['edge', 'D', 'C', 'e2'], ['edge', 'B', 'A', 'e1'], ['edge', 'C', 'A', 'e1']];
  var mro = [
    { pl: 5, cl: 5, h: 440, say: 'Multiple inheritance: D inherits from B and C, which both inherit from A. A and C define hello; B does not. Which hello does D().hello() run?', csay: 'C has no multiple inheritance; you decide by hand which table entry D uses.', ds: dia },
    { pl: 6, cl: 6, h: 440, say: 'Python linearises the classes into the MRO (method resolution order): D, B, C, A, object. The rule: a class comes before its parents, and parents keep the order you listed them.', csay: 'You write the lookup order yourself.', ds: [['tag', 'D', 'cur'], ['note', 'D', '1st']] },
    { pl: 6, cl: 6, h: 440, say: 'Search D: no hello. Next in the MRO is B (not A): B has no hello either.', csay: 'Not in D or B.', ds: [['tag', 'D', 'dim'], ['tag', 'B', 'cur'], ['note', 'B', '2nd']] },
    { pl: 6, cl: 6, h: 440, say: 'Next is C, which defines hello. The search stops: the answer is "C". A depth-first search (D, B, A) would have found A.hello first; the MRO deliberately visits C before A.', csay: 'Table entry for hello is c_hello.', ds: [['tag', 'B', 'dim'], ['tag', 'C', 'done'], ['note', 'C', 'found'], ['etag', 'D', 'e2', 'on']] },
    { pl: 6, cl: 6, h: 440, say: 'A is never reached. If every class calls super().hello(), the chain is D, B, C, A, each exactly once. That is why cooperative code uses super() everywhere instead of naming a parent directly.', csay: 'Without super(), A could run twice or not at all.', ds: [['tag', 'A', 'mark'], ['hot', 'A']] },
  ];
  window.LESSON = {
    id: 'inheritance',
    mode: 'ds',
    title: 'Inheritance and method resolution',
    lede:
      'A subclass starts with its parent\'s methods and may add or override them. Attribute lookup walks a chain: the object, then its class, then the parents in a fixed order called the MRO. In C the same effect is built by hand: embed the base struct first so a pointer to the derived type is also a valid base pointer, and keep a table of function pointers (a vtable) that a derived type fills with its own overrides.',
    scenes: [
      { id: 'lookup', title: 'Subclasses and overriding', blurb: 'Lookup climbs the chain: object, class, parent. The first match wins.', trap: 'Overriding __init__ and forgetting super().__init__(...): the parent never sets up its attributes, so later methods fail with AttributeError. Also: an override hides the parent method, it does not replace it; call super() when you need both.', pyCode: ['class Animal:', '    def eat(self): return "nom"', '    def speak(self): return "..."', 'class Dog(Animal):', '    def speak(self): return "woof"', '    def fetch(self): return "ball"', 'd = Dog()', 'd.speak()   # woof (found on Dog)', 'd.eat()     # nom (found on Animal)'], cCode: ['typedef struct { const char *(*speak)(void *); } AnimalVT;', 'const char *animal_eat(void *s) { return "nom"; }', 'const char *animal_speak(void *s) { return "..."; }', 'typedef struct { AnimalVT *vt; } Dog;   /* base part first */', 'const char *dog_speak(void *s) { return "woof"; }', 'AnimalVT dog_vt = { dog_speak };   /* override */', 'Dog d = { &dog_vt };', 'd.vt->speak(&d);   /* "woof" */', 'animal_eat(&d);    /* inherited */'], predict: { q: 'Dog overrides <code>speak</code> but not <code>eat</code>. Where does <code>d.eat()</code> run its code?', options: ['In Dog, which copied it', 'In Animal, found by following the base-class link', 'It raises AttributeError'], answer: 1, why: 'Dog has no eat, so the search continues to Animal. Nothing was copied; there is one eat, shared.' }, steps: lk },
      { id: 'mro', title: 'The diamond and the MRO', blurb: 'With several parents, Python uses a linear order (C3) that keeps children before parents.', trap: 'Calling a parent explicitly (A.__init__(self)) in a diamond: A can run twice. Use super() consistently so each class in the MRO runs once, and print Class.__mro__ when behaviour surprises you.', pyCode: ['class A:', '    def hello(self): return "A"', 'class B(A): pass', 'class C(A):', '    def hello(self): return "C"', 'class D(B, C): pass', 'D().hello()   # "C";  D.__mro__ = D, B, C, A, object'], cCode: ['/* C: model each type as a table of function pointers */', 'const char *a_hello(void) { return "A"; }', 'VTable B_vt = { .hello = a_hello };   /* inherited entry */', 'const char *c_hello(void) { return "C"; }', 'VTable C_vt = { .hello = c_hello };   /* overridden */', 'VTable D_vt = C_vt;   /* you pick which parent wins */', 'D_vt.hello();   /* "C" */'], predict: { q: 'With <code>class D(B, C)</code>, B has no <code>hello</code>, A and C do. What does <code>D().hello()</code> return?', options: ['"A", found by going up through B first', '"C", because the MRO is D, B, C, A', 'A TypeError for ambiguity'], answer: 1, why: 'C3 linearisation puts C before A, since C is a subclass of A. The first class in the MRO that defines the name wins.' }, steps: mro },
    ],
    builtins: [
      ['super()', 'Proxy that continues the lookup after the current class in the MRO.'],
      ['Class.__mro__ / Class.mro()', 'The method resolution order as a tuple of classes.'],
      ['isinstance(x, C), issubclass(S, C)', 'Type tests that respect inheritance.'],
      ['abc.ABC, @abstractmethod', 'Abstract base classes: cannot instantiate until abstract methods are overridden.'],
      ['Class.__bases__, __subclasses__()', 'Direct parents and known direct children.'],
      ['object', 'Root of every class; supplies default __eq__, __hash__, __repr__.'],
    ],
  };
})();
