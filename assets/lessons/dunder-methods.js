/* Lesson data: Special (dunder) methods (structure mode). */
(function () {
  function box(id, x, y, title, fields) {
    var ops = [['node', id, title, x, y, 'cell'], ['tag', id, 'mark']];
    (fields || []).forEach(function (f, k) { ops.push(['node', id + 'f' + k, f, x, y + 48 * (k + 1), 'cell']); });
    return ops;
  }
  /* equality and hashing */
  var B = [['node', 'b0', 'b0', 200, 60, 'cell'], ['node', 'b1', 'b1', 380, 60, 'cell'], ['node', 'b2', 'b2', 560, 60, 'cell'], ['node', 'b3', 'b3', 740, 60, 'cell']];
  var eqh = [
    { pl: -1, cl: -1, h: 440, say: 'A set or dict is an array of buckets. To store or find an object it calls hash(obj) to choose a bucket, then compares candidates in that bucket with ==. Your class controls both through __hash__ and __eq__.', csay: 'A hash table takes two function pointers: a hash and an equality test.', ds: B },
    { pl: 5, cl: 5, h: 440, say: 's = {P(1, 2)}: Python calls __hash__, which hashes the tuple (1, 2), picks bucket b1, and stores the object there.', csay: 'set_add computes p_hash(&a) and stores a in its bucket.', ds: [['node', 'A', 'P(1,2)', 380, 170, 'cell'], ['edge', 'b1', 'A', 'next'], ['hot', 'b1', 'A']] },
    { pl: 6, cl: 6, h: 440, say: 'P(1, 2) in s builds a second, different object with the same field values. Its __hash__ gives the same number, so the lookup lands in the same bucket b1.', csay: 'p_hash(&b) is the same value, so the same bucket.', ds: [['node', 'X', 'P(1,2)', 600, 220, 'cell'], ['tag', 'X', 'cur'], ['edge', 'X', 'b1', 'e1'], ['tag', 'b1', 'cur']] },
    { pl: 6, cl: 6, h: 440, say: 'Inside the bucket Python compares the candidate with __eq__. The two objects are different (is is False) but equal by your definition, so the answer is True. Same hash is necessary, equal is what decides.', csay: 'p_eq(&a, &b) returns 1: found.', ds: [['untag', 'b1', 'cur'], ['tag', 'A', 'done'], ['tag', 'X', 'done'], ['hot', 'A', 'X']] },
  ];
  /* operators and repr */
  var ops = [
    { pl: 5, cl: 5, h: 440, say: 'Two Vec objects. Operators such as + are not built in to your class: Python translates them into method calls on special names with double underscores (dunder methods).', csay: 'C has no operator overloading: you call a named function.', ds: box('V1', 120, 60, 'v1', ['x=1', 'y=2']).concat(box('V2', 340, 60, 'v2', ['x=3', 'y=4'])) },
    { pl: 6, cl: 6, h: 440, say: 'v1 + v2 becomes v1.__add__(v2). The call frame has self (v1) and o (v2), exactly like an ordinary method call.', csay: 'vec_add(v1, v2);', ds: [['node', 'Fs', 'self', 120, 250, 'cell'], ['node', 'Fo', 'o', 340, 250, 'cell'], ['edge', 'Fs', 'V1f1', 'e1'], ['edge', 'Fo', 'V2f1', 'e1'], ['tag', 'Fs', 'cur']] },
    { pl: 2, cl: 2, h: 440, say: '__add__ returns a new Vec(4, 6). It does not modify v1 or v2; arithmetic operators conventionally return new objects.', csay: 'A new allocation holds the sum.', ds: box('R', 700, 60, 'result', ['x=4', 'y=6']).concat([['tag', 'R', 'done']]) },
    { pl: 6, cl: 6, h: 440, say: 'The frame is gone and v3 refers to the new object. v1 and v2 are unchanged.', csay: 'Vec *v3 = result;', ds: [['rm', 'Fs'], ['rm', 'Fo'], ['ptr', 'v3', 'R', 'up']] },
    { pl: 7, cl: 7, h: 440, say: 'print(v3) asks for str(v3). With no __str__ it falls back to __repr__, which you wrote to return "Vec(4, 6)". Without either, you would see an address like <Vec object at 0x7f...>.', csay: 'vec_print(v3);', ds: [['note', 'R', 'repr: Vec(4, 6)'], ['hot', 'R']] },
  ];
  window.LESSON = {
    id: 'dunder-methods',
    mode: 'ds',
    title: 'Special (dunder) methods',
    lede:
      'Methods named like __eq__, __hash__, __add__ and __repr__ are hooks. Python does not call them by name in your code; the language calls them when you use ==, a set, +, print or len. They let your own classes behave like built-in types. In C the same ideas exist as function pointers you hand to a library (hash and compare for a hash table, qsort comparator) and as explicitly named functions in place of operators.',
    scenes: [
      { id: 'eq-hash', title: 'Equality and hashing', blurb: 'Sets and dicts hash first, then compare with ==. Equal objects must have equal hashes.', trap: 'Defining __eq__ without __hash__: Python then sets __hash__ to None and your objects become unhashable (TypeError in sets and as dict keys). And never hash on fields you later mutate: the object sits in the wrong bucket and cannot be found.', pyCode: ['class P:', '    def __init__(self, x, y): self.x, self.y = x, y', '    def __eq__(self, o): return (self.x, self.y) == (o.x, o.y)', '    def __hash__(self): return hash((self.x, self.y))', '', 's = {P(1, 2)}', 'P(1, 2) in s   # True'], cCode: ['typedef struct { int x, y; } P;', 'int p_eq(const P *a, const P *b) { return a->x == b->x && a->y == b->y; }', 'size_t p_hash(const P *p) { return p->x * 31 + p->y; }', '', 'P a = {1, 2}, b = {1, 2};', 'set_add(s, &a, p_hash, p_eq);', 'set_has(s, &b, p_hash, p_eq);   /* 1 */'], predict: { q: 'Two objects are <code>==</code> by your <code>__eq__</code>. What must be true of their hashes?', options: ['Nothing, hashes are independent', 'They must be equal', 'They must be different'], answer: 1, why: 'Lookups go to the bucket chosen by the hash. If equal objects hashed differently, the search would look in the wrong bucket and miss.' }, steps: eqh },
      { id: 'operators', title: 'Operators and repr', blurb: 'a + b means a.__add__(b). print uses __str__, falling back to __repr__.', trap: 'Returning NotImplemented versus raising: when __add__ gets a type it does not understand, return NotImplemented so Python can try the other operand. Also: __repr__ should help a developer (ideally look like the constructor call); __str__ is for end users.', pyCode: ['class Vec:', '    def __init__(self, x, y): self.x, self.y = x, y', '    def __add__(self, o): return Vec(self.x + o.x, self.y + o.y)', '    def __repr__(self): return f"Vec({self.x}, {self.y})"', '', 'v1, v2 = Vec(1, 2), Vec(3, 4)', 'v3 = v1 + v2', 'print(v3)   # Vec(4, 6)'], cCode: ['typedef struct { int x, y; } Vec;', 'Vec *vec_new(int x, int y);', 'Vec *vec_add(Vec *a, Vec *b) { return vec_new(a->x + b->x, a->y + b->y); }', 'void vec_print(Vec *v) { printf("Vec(%d, %d)\\n", v->x, v->y); }', '', 'Vec *v1 = vec_new(1, 2), *v2 = vec_new(3, 4);', 'Vec *v3 = vec_add(v1, v2);', 'vec_print(v3);'], predict: { q: 'What does <code>v1 + v2</code> do to <code>v1</code> when <code>__add__</code> returns a new <code>Vec</code>?', options: ['Changes v1 to the sum', 'Leaves v1 unchanged', 'Deletes v1'], answer: 1, why: 'The method builds and returns a new object. v1 and v2 are only read.' }, steps: ops },
    ],
    builtins: [
      ['__eq__, __lt__, ...', 'Comparison operators; functools.total_ordering fills in the rest from __eq__ and one ordering.'],
      ['__hash__', 'Hash for sets and dict keys. Set to None automatically when you define __eq__ alone.'],
      ['__repr__ / __str__', 'Developer text / user text. repr is the fallback for str.'],
      ['__len__, __getitem__, __contains__', 'Make len(x), x[i], and "in" work on your class.'],
      ['__iter__, __next__', 'The iteration protocol (next lesson).'],
      ['__add__, __radd__, __iadd__', 'a + b, reflected b + a, and in-place a += b.'],
      ['__bool__, __call__, __enter__/__exit__', 'Truthiness, calling an object like a function, with-statement support.'],
    ],
  };
})();
