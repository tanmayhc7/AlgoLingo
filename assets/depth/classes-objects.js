/* Interview depth: Classes and objects. */
window.DEPTH = {
  thesis:
    'In Python an object is a dictionary of attributes plus a pointer to its class, and a method call is a function call with the object passed as the first argument. Interviewers use this to probe whether you understand references, attribute lookup order, and the difference between class-level and instance-level state. The usual bugs (shared mutable defaults, aliasing, forgetting self) all follow from the model.',
  why: [
    ['Aliasing explains many bugs', 'Variables hold references. Passing an object to a function or assigning it to another name never copies it, so mutation is visible everywhere.'],
    ['Class state versus instance state', 'Knowing where an attribute lives tells you who sees a change: one object, or all of them.'],
    ['Design questions start here', 'LRU cache, parking lot and similar object-design questions are all about choosing what state each class owns and which methods mutate it.'],
    ['It maps cleanly to C', 'Struct plus functions taking a pointer. Interviewers for systems roles like hearing that mapping stated explicitly.'],
  ],
  edges: [
    ['Mutable default arguments', '`def f(x, items=[])` creates the list once, at definition time, and shares it across calls. Use `None` and create the list inside.'],
    ['Mutable class attributes', 'A list on the class is shared by all instances. Put per-object containers in __init__.'],
    ['Shadowing on assignment', '`obj.attr = v` creates an instance attribute even if a class attribute of that name exists; `obj.attr += 1` reads the class value then writes an instance one.'],
    ['Shallow copy', 'copy.copy copies the object but not the objects it refers to. Nested containers are still shared; use deepcopy when needed.'],
    ['Forgetting self', 'A method defined without self fails at call time with a confusing argument-count error.'],
  ],
  cost: [
    ['attribute lookup', 'O(1) average: dict lookup on the instance, then the class (and parents). Slower than a local variable.'],
    ['object memory', 'A normal instance carries a dict; __slots__ removes it and can halve memory for many small objects.'],
    ['method call', 'A bound method object is created on each lookup; the call itself costs a Python function call.'],
  ],
  internals: [
    ['__dict__', 'Each instance has a dict mapping attribute names to values; vars(obj) returns it. Classes have one too, holding methods and class attributes.'],
    ['Bound methods', '`obj.f` returns a bound method object that remembers obj; calling it passes obj as self. `Class.f(obj)` is the same call without the wrapper.'],
    ['__slots__', 'Declares a fixed attribute set stored in the object itself instead of a dict. You lose dynamic attributes but gain memory and a little speed.'],
    ['Identity versus equality', '`is` compares identity (same object); `==` calls __eq__, which by default is identity unless you override it.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'What does the following print, and why? `class A: items = []` then `a, b = A(), A(); a.items.append(1); print(b.items)`',
      a: 'It prints [1]. `items` lives on the class, so a.items and b.items both resolve to the same list. append mutates that shared list. The fix is `self.items = []` in __init__ so each object gets its own list.',
      follow: [
        ['What if the code were `a.items = a.items + [1]`?', 'That builds a new list and assigns it as an instance attribute on a, shadowing the class one. b still sees the empty class list.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Explain what happens when you call `obj.method(1, 2)`.',
      a: 'Python looks up `method` on obj: first in obj.__dict__, then on the class and its parents. A function found on the class becomes a bound method with obj attached, and the call runs it with obj as the first argument, so it is equivalent to `Class.method(obj, 1, 2)`.',
      follow: [
        ['How is this different in C?', 'C has no lookup: you call a specific function and pass the struct pointer yourself. Function pointers in the struct (a vtable) give you dynamic dispatch.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Why can `a = b` be a source of bugs, and how do you get an independent copy of a nested structure?',
      a: 'Assignment copies the reference, so mutations through either name affect the one object. copy.copy gives a shallow copy: a new outer object whose attributes still refer to the same inner objects. copy.deepcopy recursively copies the inner objects and handles cycles with a memo dict. The cheaper alternative is to design with immutable values (tuples, frozen dataclasses) so sharing is harmless.',
      follow: [
        ['What does deepcopy cost?', 'Time and memory proportional to the size of the object graph, and it can invoke __deepcopy__ hooks. Avoid it on hot paths.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'When would you use __slots__, and what are the trade-offs?',
      a: 'When you create millions of small instances and the per-object dict is the dominant memory cost. __slots__ stores attributes in fixed slots, saving memory and speeding attribute access slightly. The costs: no arbitrary new attributes, no weak references unless you list __weakref__, subtle interactions with multiple inheritance, and pickling needs care.',
      follow: [],
    },
  ],
};
