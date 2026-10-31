/* Chapter 17 quiz: Inheritance and composition. */
window.QUIZ = {
  chapter: 17,
  title: 'Inheritance and composition',
  lede: 'Method resolution, super(), and choosing between is-a and has-a.',
  questions: [
    {
      type: 'mcq',
      q: 'A subclass defines <code>speak</code>; the parent also defines <code>speak</code>. For an instance of the subclass, which runs?',
      options: ['The parent version, always', 'The subclass version: the search finds it first', 'Both, one after the other'],
      answer: 1,
      why: 'Lookup climbs object, class, parent. The first match wins. The parent version runs only if the override calls super().',
    },
    {
      type: 'mcq',
      q: '<code>class D(B, C)</code> where B and C both inherit from A. In what order does Python search for a name?',
      options: ['D, B, A, C', 'D, B, C, A', 'D, A, B, C'],
      answer: 1,
      why: 'C3 puts children before parents and keeps the listed order of bases: D, B, C, A, object.',
    },
    {
      type: 'mcq',
      q: 'Which design is better modelled with composition?',
      options: ['A Parser that can read from a file, a string or a socket', 'A Cat that is an Animal', 'An IOError that is an Exception'],
      answer: 0,
      why: 'The parser has a source it reads from, and the source can vary. Cat and IOError are real is-a specialisations.',
    },
    {
      type: 'complete',
      q: 'Fill in the blanks so <code>Dog().speak()</code> returns <code>"Rex says woof"</code> by extending the parent.',
      starter: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return self.name + " says"\n\nclass Dog(Animal):\n    def __init__(self):\n        ___.__init__("Rex")\n    def speak(self):\n        return ___.speak() + " woof"\n',
      tests: [
        { expr: 'Dog().speak()', want: "'Rex says woof'" },
        { expr: 'Dog().name', want: "'Rex'" },
        { expr: 'isinstance(Dog(), Animal)', want: 'True' },
      ],
      hint: 'super() gives access to the next class in the MRO, for both __init__ and speak.',
      solution: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return self.name + " says"\n\nclass Dog(Animal):\n    def __init__(self):\n        super().__init__("Rex")\n    def speak(self):\n        return super().speak() + " woof"\n',
      why: 'super() delegates to the parent, so the parent sets name and the child extends the parent\'s result.',
    },
    {
      type: 'write',
      q: 'Write a <code>Stack</code> class by <b>composition</b> (hold a list). Provide <code>push(x)</code>, <code>pop()</code>, and <code>__len__</code>. The stack must not expose list methods like <code>insert</code>.',
      starter: 'class Stack:\n    # your code\n',
      tests: [
        { expr: '(lambda s: (s.push(1), s.push(2), s.pop(), len(s))[2:])(Stack())', want: '(2, 1)' },
        { expr: 'hasattr(Stack(), "insert")', want: 'False' },
        { expr: 'len(Stack())', want: '0' },
      ],
      hint: 'Create self._items = [] in __init__ and forward push and pop to append and pop.',
      solution: 'class Stack:\n    def __init__(self):\n        self._items = []\n    def push(self, x):\n        self._items.append(x)\n    def pop(self):\n        return self._items.pop()\n    def __len__(self):\n        return len(self._items)\n',
      why: 'The stack has a list but only exposes the operations that preserve stack behaviour.',
    },
    {
      type: 'debug',
      q: '<code>Square(5).area()</code> should return 25 but raises an AttributeError. Fix it.',
      starter: 'class Rect:\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nclass Square(Rect):\n    def __init__(self, side):\n        self.side = side\n',
      tests: [
        { expr: 'Square(5).area()', want: '25' },
        { expr: 'Square(3).side', want: '3' },
        { expr: 'Square(2).w', want: '2' },
      ],
      hint: 'The parent initialiser never ran, so w and h do not exist. Call it through super().',
      solution: 'class Rect:\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nclass Square(Rect):\n    def __init__(self, side):\n        super().__init__(side, side)\n        self.side = side\n',
      why: 'Overriding __init__ skips the parent\'s unless you call it. super().__init__ sets up the inherited attributes.',
    },
  ],
};
