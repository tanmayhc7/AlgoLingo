/* Chapter 16 quiz: Classes and objects. */
window.QUIZ = {
  chapter: 16,
  title: 'Classes and objects',
  lede: 'Objects, attributes, methods, and the special methods behind sets and operators.',
  questions: [
    {
      type: 'mcq',
      q: 'After <code>a = Box(); b = a; b.size = 5</code>, what is <code>a.size</code>?',
      options: ['Unchanged, b is a copy', '5, because a and b are the same object', 'An AttributeError'],
      answer: 1,
      why: 'Assignment copies the reference. Both names point at one object.',
    },
    {
      type: 'mcq',
      q: '<code>class A: items = []</code> then <code>x, y = A(), A(); x.items.append(1)</code>. What is <code>y.items</code>?',
      options: ['[]', '[1]', 'An error'],
      answer: 1,
      why: 'items is a class attribute, so both instances read the same list and append mutates it.',
    },
    {
      type: 'mcq',
      q: 'You define <code>__eq__</code> in a class and nothing else about hashing. What happens when you put an instance in a set?',
      options: ['It works, using identity for the hash', 'TypeError: unhashable type', 'It works, using __eq__ for the hash'],
      answer: 1,
      why: 'Defining __eq__ without __hash__ sets __hash__ to None. Define both, hashing the same immutable fields.',
    },
    {
      type: 'complete',
      q: 'Fill in the blanks so equal points are the same set member.',
      starter: 'class P:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __eq__(self, o):\n        return isinstance(o, P) and (self.x, self.y) == (o.x, ___)\n    def __hash__(self):\n        return hash((self.x, ___))\n',
      tests: [
        { expr: 'len({P(1, 2), P(1, 2), P(2, 1)})', want: '2' },
        { expr: 'P(3, 4) in {P(3, 4)}', want: 'True' },
        { expr: 'P(1, 2) == P(1, 3)', want: 'False' },
      ],
      hint: 'Compare and hash the same pair of fields: x and y of each object.',
      solution: 'class P:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __eq__(self, o):\n        return isinstance(o, P) and (self.x, self.y) == (o.x, o.y)\n    def __hash__(self):\n        return hash((self.x, self.y))\n',
      why: 'Equal objects must have equal hashes, so both methods use the same fields.',
    },
    {
      type: 'write',
      q: 'Write a class <code>Counter2</code> with <code>__init__</code> (count starts at 0), <code>inc()</code> that adds 1, and <code>__repr__</code> returning <code>Counter2(n)</code> where n is the count.',
      starter: 'class Counter2:\n    # your code\n',
      tests: [
        { expr: 'repr(Counter2())', want: "'Counter2(0)'" },
        { expr: '(lambda c: (c.inc(), c.inc(), repr(c))[2])(Counter2())', want: "'Counter2(2)'" },
        { expr: 'Counter2().inc()', want: 'None' },
      ],
      hint: 'Store the count on self in __init__; inc mutates self and returns nothing.',
      solution: 'class Counter2:\n    def __init__(self):\n        self.n = 0\n    def inc(self):\n        self.n += 1\n    def __repr__(self):\n        return f"Counter2({self.n})"\n',
      why: 'State lives on the instance, methods mutate it through self, and __repr__ formats it.',
    },
    {
      type: 'debug',
      q: 'Each new <code>Bag</code> should start empty, but items leak between bags. Fix it.',
      starter: 'class Bag:\n    def __init__(self, items=[]):\n        self.items = items\n    def add(self, x):\n        self.items.append(x)\n        return self\n',
      tests: [
        { expr: '(lambda a, b: (a.add(1), b.items)[1])(Bag(), Bag())', want: '[]' },
        { expr: 'Bag().add(2).items', want: '[2]' },
        { expr: 'Bag([5]).add(6).items', want: '[5, 6]' },
      ],
      hint: 'A default list is created once when the function is defined. Use None as the default.',
      solution: 'class Bag:\n    def __init__(self, items=None):\n        self.items = items if items is not None else []\n    def add(self, x):\n        self.items.append(x)\n        return self\n',
      why: 'Default values are evaluated once at definition time, so a mutable default is shared by every call.',
    },
  ],
};
