/* Interview depth: Inheritance and method resolution. */
window.DEPTH = {
  thesis:
    'Inheritance gives a subclass the parent\'s methods and lets it override them. Python resolves a name by walking the MRO, a linear order of classes computed with the C3 algorithm. Interviews test three things: that you can predict which method runs, that you use super() properly (especially in __init__), and that you know when inheritance is the wrong tool.',
  why: [
    ['Polymorphism through a common interface', 'Code written against the base type works with every subclass: a list of Shape objects, each with its own area().'],
    ['Reuse without copy and paste', 'Shared behaviour lives once in the parent; subclasses specialise it.'],
    ['Frameworks rely on it', 'Django views, unittest.TestCase, exception hierarchies: you subclass and override hooks.'],
    ['It exposes whether you understand dispatch', 'Predicting method resolution in a diamond is a classic way to test that.'],
  ],
  edges: [
    ['Forgetting super().__init__', 'The parent initialiser never runs, so inherited methods see missing attributes.'],
    ['Calling the parent directly in a diamond', 'A.__init__(self) from both B and C runs A twice. With super() and consistent signatures each class runs once.'],
    ['Fragile base class', 'Changing a parent can break subclasses that depended on its internal behaviour. Prefer small, stable base interfaces.'],
    ['Liskov substitution', 'A subclass must be usable wherever the parent is. Square(Rectangle) with independent width and height setters violates this.'],
    ['Inconsistent MRO', 'class X(A, B) and class Y(B, A) combined in a third class raises a TypeError because no consistent order exists.'],
  ],
  cost: [
    ['method lookup', 'Walks the MRO, but results are cached per class (type attribute cache), so repeated calls are effectively O(1).'],
    ['depth of hierarchy', 'Cost is in readability and coupling more than in time.'],
    ['C vtable dispatch', 'One extra pointer load per call; no search at run time.'],
  ],
  internals: [
    ['C3 linearisation', 'Merge the MROs of the parents and the list of parents, always taking the first head that does not appear in the tail of another list. Guarantees children before parents and preserves the order of the base list.'],
    ['super() is not "the parent"', 'It means "the next class after this one in the MRO of the instance\'s type". In a diamond it may be a sibling.'],
    ['Abstract base classes', 'abc.ABC with @abstractmethod prevents instantiation until all abstract methods are overridden.'],
    ['Vtables in C', 'A struct of function pointers per type; each object stores a pointer to its type\'s table. Overriding means putting a different function in the slot. C++ virtual functions compile to the same thing.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What does super() do and why would you call super().__init__(...)?',
      a: 'super() returns a proxy that continues the attribute search at the next class after the current one in the instance\'s MRO. Calling super().__init__ makes sure the parent class initialises its part of the object. Omitting it leaves the parent attributes unset.',
      follow: [
        ['Is super() always the direct parent?', 'No. With multiple inheritance it is the next class in the MRO, which can be a sibling.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Given `class A: def f(self): return "A"`, `class B(A): pass`, `class C(A): def f(self): return "C"`, `class D(B, C): pass`, what does `D().f()` return?',
      a: '"C". The MRO is D, B, C, A. B has no f, C defines it, and C comes before A.',
      follow: [
        ['How would you check the order?', 'Print D.__mro__ or D.mro().'],
      ],
    },
    {
      lvl: 'senior',
      q: 'When should you prefer composition over inheritance?',
      a: 'When the relationship is "has a" rather than "is a", when you want to change behaviour at run time, when the subclass would inherit methods that do not make sense for it (Stack from list), or when hierarchies would multiply (Car x Engine x Transmission combinations). Inheritance fits real specialisation with the Liskov property and stable base classes; composition keeps coupling low and is easier to test with fakes.',
      follow: [
        ['Give an example where inheritance is right.', 'Exception hierarchies, abstract interfaces with several implementations, and framework hooks where the base class is designed for subclassing.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Implement polymorphic dispatch in C without a language that supports it.',
      a: 'Define a vtable struct of function pointers for the operations (area, draw). Each concrete type has a static table instance filled with its implementations. Every object begins with a pointer to its type\'s table, so a pointer to the concrete struct can be cast to the base struct. Calling shape->vt->area(shape) dispatches at run time. Overrides are different entries; inherited behaviour is the same function pointer reused.',
      follow: [
        ['What are the pitfalls?', 'Casting errors, no type safety, manual construction, and the need to keep the base struct as the first member so the cast is valid.'],
      ],
    },
  ],
};
