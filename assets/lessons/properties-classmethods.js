/* Lesson data: properties, class methods and static methods (structure mode, Flow helper). */
(function () {
  var prop = Flow.steps([
    { pl: 8, cl: 6, say: 'Account(50) stores 50 in an ordinary attribute named _bal. The leading underscore is a convention that means "internal: go through the property instead".', csay: 'Account a = {50};', add: [['la', 'object', 0, 0], ['a', '_bal', 1, 0], ['b', '50', 2, 0]], tag: [['la', 'dim']] },
    { pl: 9, cl: 7, say: 'acct.balance looks like a plain field read. Python finds a property called balance on the class and calls the getter function instead.', csay: 'account_balance(&a);', add: [['lb', 'read', 0, 1], ['g', 'getter', 1, 1], ['r', '50', 2, 1]], tag: [['lb', 'dim'], ['g', 'cur']] },
    { pl: 3, cl: 1, say: 'The getter runs return self._bal, so the caller gets 50. The caller wrote no parentheses, yet a function ran.', csay: 'return a->bal;', tag: [['r', 'done'], ['b', 'done']] },
    { pl: 10, cl: 8, say: 'acct.balance = -5 looks like an assignment. Python sees the setter and calls it with v = -5.', csay: 'account_set_balance(&a, -5);', lab: [['lb', 'write'], ['g', 'setter'], ['r', '-5']], untag: [['r', 'done'], ['g', 'cur']], tag: [['g', 'cur'], ['r', 'cur']] },
    { pl: 6, cl: 3, say: 'The setter checks v < 0 and raises ValueError, so the assignment stops and _bal stays 50. A property adds validation without changing how callers write code.', csay: 'if (v < 0) return -1;', tag: [['r', 'bad'], ['b', 'done']] },
    { pl: 2, cl: 0, say: 'Define only the getter and the property is read-only: acct.balance = 1 raises AttributeError. Nothing stops code from touching acct._bal directly, because Python relies on convention, not access control.', csay: '/* C hides fields only through opaque types */', hot: ['a'] },
  ], { y0: 60, dy: 80 });
  var kinds = Flow.steps([
    { pl: 0, cl: 0, say: 'A class can hold three kinds of function. They differ in what Python passes as the first argument.', csay: 'typedef struct { int y, m, d; } Date;', add: [['la', 'kind', 0, 0], ['a', 'method', 1, 0], ['b', 'classm', 2, 0], ['c', 'static', 3, 0], ['lb', 'gets', 0, 1], ['a2', 'self', 1, 1], ['b2', 'cls', 2, 1], ['c2', 'nothing', 3, 1]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 9, cl: 1, say: 'An ordinary method gets the object as self, so it works on one particular date. d.next_year() passes d automatically.', csay: 'Date date_next_year(Date x);', tag: [['a', 'cur'], ['a2', 'cur']] },
    { pl: 10, cl: 6, say: 'Date.from_string("2026-11-03") is called on the class, not on an object. Python passes the class itself as cls. The method parses the text and returns cls(y, m, d): a second way to build a Date, called an alternate constructor.', csay: 'Date d = date_from_string("2026-11-03");', untag: [['a', 'cur'], ['a2', 'cur']], tag: [['b', 'cur'], ['b2', 'cur']] },
    { pl: 5, cl: 3, say: 'It calls cls(...), not Date(...). A subclass inherits the method and gets its own type back: Holiday.from_string(...) returns a Holiday. That is the point of cls.', csay: '/* C has no subclass: one constructor per type */', hot: ['b2'] },
    { pl: 11, cl: 7, say: 'Date.is_leap(2028) receives neither self nor cls. It is a plain function that lives inside the class only because it belongs with dates. It cannot read or change any Date.', csay: 'date_is_leap(2028);', untag: [['b', 'cur'], ['b2', 'cur']], tag: [['c', 'cur'], ['c2', 'cur']] },
    { pl: 8, cl: 5, say: 'Rule of thumb. Needs the object: method. Needs the class, usually to construct: classmethod. Needs neither: a plain module-level function, or a staticmethod if you want it grouped with the class.', csay: 'int date_is_leap(int y) { ... }', untag: [['c', 'cur'], ['c2', 'cur']], hot: ['a', 'b', 'c'] },
  ], { y0: 60, dy: 80 });
  window.LESSON = {
    id: 'properties-classmethods', mode: 'ds',
    title: 'Properties, class methods and static methods',
    lede: 'Three decorators change what a function inside a class receives and how callers use it. @property makes a method look like an attribute, so you can add checks later without changing callers. @classmethod receives the class, which makes it the natural home for alternate constructors. @staticmethod receives nothing and is just a function that lives in the class. In C the closest things are accessor functions, named constructors such as date_from_string, and ordinary helper functions.',
    scenes: [
      { id: 'property', title: 'Properties', blurb: 'acct.balance reads like a field but calls a getter. Assigning to it can call a setter that validates.', trap: 'Writing get_balance() and set_balance() methods "to be safe". In Python start with a plain attribute; if you later need a check, turn it into a property and no caller changes. Also, a property that does slow work (a network call) surprises readers who expect attribute access to be cheap.',
        pyCode: ['class Account:', '    def __init__(self, bal): self._bal = bal', '    @property', '    def balance(self): return self._bal', '    @balance.setter', '    def balance(self, v):', '        if v < 0: raise ValueError("negative")', '        self._bal = v', 'acct = Account(50)', 'print(acct.balance)', 'acct.balance = -5'],
        cCode: ['typedef struct { int bal; } Account;', 'int account_balance(const Account *a) { return a->bal; }', 'int account_set_balance(Account *a, int v) {', '    if (v < 0) return -1;', '    a->bal = v; return 0;', '}', 'Account a = {50};', 'printf("%d", account_balance(&a));', 'account_set_balance(&a, -5);'],
        predict: { q: 'With the setter above, what does acct.balance = -5 do?', options: ['Sets the balance to -5', 'Raises ValueError and leaves the balance at 50', 'Is silently ignored'], answer: 1, why: 'The assignment calls the setter, which raises before _bal is changed.' }, steps: prop },
      { id: 'kinds', title: 'Method, classmethod, staticmethod', blurb: 'What each kind receives as its first argument decides what it can do.', trap: 'Using @staticmethod for something that builds an instance by writing Date(...) inside it: subclasses then get the wrong type. Use @classmethod and return cls(...). Also, calling an instance method on the class, Date.next_year(), fails because there is no self to pass.',
        pyCode: ['class Date:', '    def __init__(self, y, m, d): self.y, self.m, self.d = y, m, d', '    @classmethod', '    def from_string(cls, s):', '        y, m, d = map(int, s.split("-"))', '        return cls(y, m, d)', '    @staticmethod', '    def is_leap(y):', '        return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)', '    def next_year(self): return Date(self.y + 1, self.m, self.d)', 'd = Date.from_string("2026-11-03")', 'Date.is_leap(2028)'],
        cCode: ['typedef struct { int y, m, d; } Date;', 'Date date_next_year(Date x) { x.y++; return x; }', 'Date date_from_string(const char *s) {', '    Date d; sscanf(s, "%d-%d-%d", &d.y, &d.m, &d.d);', '    return d;', '}', 'int date_is_leap(int y) { /* no Date needed */ }', 'Date d = date_from_string("2026-11-03");', 'date_is_leap(2028);'],
        predict: { q: 'class Holiday(Date): pass. What is type(Holiday.from_string("2026-12-25")).__name__?', options: ['Date', 'Holiday', 'It raises TypeError'], answer: 1, why: 'The classmethod receives the class it was called on as cls, and returns cls(...), so the result is a Holiday.' }, steps: kinds },
    ],
    builtins: [
      ['@property', 'Turn a method into a read-only attribute: obj.name calls the function.'],
      ['@name.setter', 'Add a setter to a property so obj.name = value runs validation.'],
      ['@classmethod', 'First argument is the class (cls); use for alternate constructors.'],
      ['@staticmethod', 'No automatic first argument; a plain function grouped with the class.'],
      ['_name', 'Convention for "internal". Python does not enforce it.'],
      ['__name', 'Name mangling inside a class (becomes _Class__name); used to avoid clashes in subclasses, not for privacy.'],
    ],
  };
})();
