/* Interview depth: Composition and delegation. */
window.DEPTH = {
  thesis:
    'Composition builds behaviour by holding other objects and forwarding to them. "Favour composition over inheritance" is the standard advice because it keeps coupling low and allows swapping parts at run time. Interviewers use it to see if you can model a domain (parking lot, logger, payment processing) with small cooperating classes rather than a tall hierarchy.',
  why: [
    ['Looser coupling', 'The outer class depends only on the part\'s interface (the methods it calls), not on its internals or its ancestors.'],
    ['Run-time flexibility', 'Swap a part by assigning a different object: new sink, new pricing rule, new storage backend.'],
    ['Easier testing', 'Inject a fake part to test the outer object in isolation.'],
    ['Avoids class explosions', 'Three engines and three bodies give nine subclasses with inheritance but six small classes with composition.'],
  ],
  edges: [
    ['Boilerplate forwarding', 'Many one-line delegating methods are tedious; __getattr__ can forward but hides the interface and breaks tooling.'],
    ['Ownership and lifetime', 'Who creates and who destroys the part? In C, whoever allocates must free; in Python, shared references keep parts alive.'],
    ['Leaking the part', 'Returning the internal list lets callers mutate your state. Return copies or read-only views.'],
    ['Circular references', 'Parent holds child and child holds parent: fine for the garbage collector, but be careful in C and with __del__.'],
    ['Over-engineering', 'Not every class needs a swappable collaborator. Add the seam when a second implementation or a test needs it.'],
  ],
  cost: [
    ['delegation call', 'One extra attribute lookup and call per forwarded method.'],
    ['memory', 'Each part is a separate object with its own header; many tiny parts add overhead.'],
    ['readability', 'Behaviour is spread across classes; good names and small interfaces keep it readable.'],
  ],
  internals: [
    ['Dependency injection', 'Pass the part to the constructor instead of creating it inside. The constructor argument is the seam for tests and alternative implementations.'],
    ['Duck typing and Protocols', 'Python does not need a shared base class: anything with write(msg) works. typing.Protocol documents this and lets a type checker verify it.'],
    ['Strategy and function parameters', 'In Python a part is often just a function: sorted(key=...), callbacks, partial. In C it is a function pointer, exactly like qsort\'s comparator.'],
    ['Mixins', 'Small classes that add one capability through inheritance (a controlled middle road). Use sparingly and keep them stateless.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Why is `class Stack(list)` a questionable design?',
      a: 'It exposes every list method (insert, sort, index assignment), so callers can break the stack discipline, and your class is tied to list\'s API forever. Better to hold a list in a private attribute and provide push, pop, peek and __len__. That is composition: the Stack has a list.',
      follow: [
        ['When is subclassing a built-in fine?', 'When your class really is a specialised version and you want all its methods, for example a dict subclass with a default or an Exception subclass.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'How would you design a Logger that can write to the console, a file or a network?',
      a: 'Logger holds a sink object and calls sink.write(message). Console, File and Network sinks each implement write. The sink is passed to the constructor, so it can be replaced or faked in tests. No subclass of Logger is needed.',
      follow: [
        ['How would you send to several destinations?', 'Hold a list of sinks and loop, or create a CompositeSink that holds sinks and forwards to each.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Explain dependency injection and how it improves testability.',
      a: 'The object receives its collaborators from outside (constructor, setter or parameter) instead of building them. In production you pass real parts; in tests you pass fakes that record calls or return canned data. This removes hidden globals, makes dependencies visible in the signature, and lets you test failure paths (a sink that raises) without real infrastructure.',
      follow: [
        ['Do you need a framework for it?', 'No. Passing arguments is dependency injection. Frameworks only help wire large graphs of objects.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Translate the strategy pattern into C and explain the trade-off against a switch statement.',
      a: 'A struct holds a function pointer (or a pointer to a table of them) chosen at run time, as qsort takes a comparator. Callers invoke through the pointer. Compared with a switch on an enum, adding a strategy requires no change to existing code (open for extension), and strategies can be defined in separate modules. The costs are an indirect call, no exhaustiveness checking by the compiler, and the need to pass context through a void pointer.',
      follow: [],
    },
  ],
};
