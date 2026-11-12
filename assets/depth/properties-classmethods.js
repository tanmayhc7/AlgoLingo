/* Interview depth: properties, class methods and static methods. */
window.DEPTH = {
  thesis: 'Python starts with plain attributes and lets you add behaviour later. @property turns a method into attribute-style access, so validation or computation can be added without breaking callers. @classmethod receives the class and is the idiomatic alternate constructor, and it respects subclasses. @staticmethod receives nothing: it is a function that is grouped with a class for organisation only.',
  why: [
    ['No getters and setters up front', 'Java and C++ habits wrap every field in get/set methods in case a check is needed later. In Python a property can be introduced afterwards with the same syntax, so start with a plain attribute.'],
    ['Alternate constructors', 'Python allows one __init__. Other ways to build an object (from a string, a file, a dict) are classmethods such as from_string, named so the call site reads clearly.'],
    ['cls instead of the class name', 'Returning cls(...) means a subclass gets its own type back; hard-coding Date(...) quietly returns the parent type.'],
    ['Staticmethod is mostly organisation', 'It does not change behaviour. Many Python programmers use a module-level function instead and keep @staticmethod for helpers that clearly belong to one class.'],
  ],
  edges: [
    ['Read-only property', 'A property with no setter raises AttributeError on assignment. That is a clean way to expose a derived or fixed value.'],
    ['Slow work in a property', 'Callers assume attribute access is cheap. A network call or large computation inside a property is a surprise; use a method, or cache the result.'],
    ['Setter validation and __init__', 'Assign through self.balance in __init__ (not self._bal) so the setter validates the first value as well.'],
    ['Calling on the instance', 'obj.from_string(...) works but passes the class, not the object. Call classmethods on the class for clarity.'],
    ['Properties and inheritance', 'A subclass that overrides a property must redefine it as a property; replacing it with a plain method breaks attribute access.'],
    ['Privacy', 'A leading underscore is a hint. Name mangling (__x) avoids clashes in subclasses but does not stop access.'],
  ],
  cost: [
    ['Plain attribute read', 'Fastest: one dictionary lookup on the instance.'],
    ['Property read', 'A function call per access: slower than an attribute, cheap enough for normal code.'],
    ['Class method call', 'Same as a normal method call plus binding the class.'],
  ],
  internals: [
    ['Descriptors', 'property is a descriptor: an object on the class with __get__ and __set__. Attribute lookup finds it on the type and calls it. Methods, classmethod and staticmethod use the same mechanism.'],
    ['Binding', 'A function stored on a class becomes a bound method when looked up on an instance, with the instance filled in as self. classmethod binds the class; staticmethod binds nothing.'],
    ['In C', 'Accessor functions (account_balance), named constructors (date_from_string) and plain helper functions. Opaque struct types hide fields, but there is no subclassing, so no equivalent of cls.'],
  ],
  qa: [
    { lvl: 'junior', q: 'What does @property do?', a: 'It lets a method be used like an attribute: obj.balance calls the getter. With a setter, obj.balance = x calls it too, so you can validate.', follow: [['Why not write get_balance() and set_balance()?', 'In Python you can start with a plain attribute and add a property later without changing callers, so up-front getters and setters only add noise.']] },
    { lvl: 'mid', q: 'When do you use @classmethod instead of @staticmethod?', a: 'When the function needs the class: most often to construct an instance. Return cls(...) so subclasses get their own type. Use a staticmethod, or a plain function, when it needs neither the object nor the class.', follow: [['Give an example of an alternate constructor.', 'Date.from_string("2026-11-03") parses text and returns cls(y, m, d); datetime.fromtimestamp and dict.fromkeys are standard-library examples.']] },
    { lvl: 'mid', q: 'How do you make an attribute read-only?', a: 'Expose it as a property with no setter. Assigning raises AttributeError. It is a signal to callers, not security: code can still reach the underlying attribute.', follow: [] },
    { lvl: 'senior', q: 'How does a property work under the hood?', a: 'property is a descriptor, an object on the class with __get__ and __set__. When you read obj.x, Python finds x on the type, sees it defines __get__, and calls it with the instance. Functions, classmethod and staticmethod use the same descriptor mechanism to decide what gets passed as the first argument.', follow: [['Why assign through self.balance in __init__?', 'It runs the setter, so the first value is validated by the same rule as later assignments. Assigning to self._bal directly skips the check.']] },
  ],
};

/* design-why */
window.DEPTH.design = [
 [
  "Why Python skips getters and setters at first",
  "Start with a plain attribute. If you later need a check or a computed value, turn it into a `@property` with the same name and callers do not change. Java-style `getX()` is needed there because adding one later would break every caller."
 ],
 [
  "Why `@property` exists",
  "It lets code use attribute syntax while running a method, so you can validate on assignment, compute a value on demand or make something read-only without changing the public interface."
 ],
 [
  "Why `@classmethod` exists",
  "Some constructors need to build an instance from different input (`from_json`, `from_string`). A class method receives the class as `cls`, so it works for subclasses too, which a hard-coded class name would not."
 ],
 [
  "Why `@staticmethod` is mostly organisation",
  "It gets neither the instance nor the class, so it is just a function that lives in the class's namespace because it belongs with it. If nothing ties it to the class, a module-level function is usually simpler."
 ]
];
