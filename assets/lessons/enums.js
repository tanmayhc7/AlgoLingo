/* Lesson data: enums (structure mode, Flow helper). */
(function () {
  var basics = Flow.steps([
    { pl: 1, cl: 0, say: 'An Enum is a fixed set of named constants. class Color defines exactly two members. Nobody can add a third later or create another Color.', csay: 'enum Color { RED = 1, GREEN = 2 };', add: [['la', 'Color', 0, 0], ['a', 'RED', 1, 0], ['b', 'GREEN', 2, 0], ['lb', 'value', 0, 1], ['va', '1', 1, 1], ['vb', '2', 2, 1]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 4, cl: 1, say: 'Color.RED is a member object, not the number 1. It carries two attributes: .name, which is "RED", and .value, which is 1.', csay: 'enum Color c = RED;', tag: [['a', 'cur'], ['va', 'cur']] },
    { pl: 6, cl: 3, say: 'Color(2) looks a member up by value and returns Color.GREEN. A value that is not defined, such as Color(3), raises ValueError.', csay: '/* lookup by value: switch or table */', untag: [['a', 'cur'], ['va', 'cur']], tag: [['b', 'cur'], ['vb', 'cur']] },
    { pl: 7, cl: 4, say: 'Color["RED"] looks a member up by name. Members are singletons, so Color["RED"] is Color.RED is True, and comparing with is or == is reliable and cheap.', csay: '/* lookup by name: strcmp loop */', untag: [['b', 'cur'], ['vb', 'cur']], tag: [['a', 'done'], ['va', 'done']] },
    { pl: 8, cl: 5, say: 'Looping over the class yields the members in definition order. That is handy for building menus or listing the valid choices in an error message.', csay: '/* iterate: loop over the numbers yourself */', hot: ['a', 'b'] },
  ], { y0: 60, dy: 80 });
  var magic = Flow.steps([
    { pl: 1, cl: 0, say: 'Magic strings such as "failed" are easy to mistype and nothing checks them: "faild" is a perfectly good string and a silent bug. An Enum gives each state one name, spelled once.', csay: 'enum Status { OK, FAILED };', add: [['la', 'Status', 0, 0], ['a', 'OK', 1, 0], ['b', 'FAILED', 2, 0], ['lb', 'Level', 0, 1], ['c', 'LOW', 1, 1], ['d', 'HIGH', 2, 1]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 2, cl: 0, say: 'auto() picks the values for you when you do not care what they are. Use it when the members just need to be different from each other.', csay: '/* C counts up from 0 by default */', hot: ['a', 'b'] },
    { pl: 8, cl: 3, say: 'handle(Status.FAILED) works, and Status.FAILED works as a dict key because members are unique and hashable. A typo such as Status.FAILD raises AttributeError at once, instead of taking a silent wrong branch.', csay: 'handle(FAILED);', tag: [['b', 'cur']] },
    { pl: 10, cl: 5, say: 'Status.OK == 1 is False. A plain Enum member is not equal to its value, which stops you mixing states with numbers by accident. In C an enum is just an int, so OK == 0 is true.', csay: 'if (OK == 0) ...  /* an enum is an int */', untag: [['b', 'cur']], tag: [['a', 'bad']] },
    { pl: 11, cl: 6, say: 'IntEnum members are also ints, so Level.HIGH == 2 is True and members can be compared and sorted like numbers. Use it when the numbers matter (exit codes, protocol values); otherwise prefer plain Enum.', csay: 'if (HIGH == 2) ...', untag: [['a', 'bad']], tag: [['d', 'done']] },
  ], { y0: 60, dy: 80 });
  window.LESSON = {
    id: 'enums', mode: 'ds',
    title: 'Enums',
    lede: 'An Enum is a small, fixed set of named choices, such as statuses, modes or colours. It replaces "magic strings" and bare numbers: the names are spelled once, a typo fails at once, and the members can be looked up by name or by value, compared with is, and looped over. Enum members are objects, not plain numbers, so they are not accidentally equal to ints; IntEnum is the variant that is. In C an enum is a named integer constant and nothing more.',
    scenes: [
      { id: 'basics', title: 'Members, name and value', blurb: 'Each member has a name and a value. You can look one up by either, and loop over all of them.', trap: 'Writing if c == 1 instead of if c is Color.RED, which throws away the point of the enum. Also, member values must be unique to be distinct members: two names with the same value become aliases of the first.',
        pyCode: ['from enum import Enum', 'class Color(Enum):', '    RED = 1', '    GREEN = 2', 'c = Color.RED', 'print(c.name, c.value)', 'print(Color(2))', 'print(Color["RED"] is c)', 'for m in Color: print(m)'],
        cCode: ['enum Color { RED = 1, GREEN = 2 };', 'enum Color c = RED;', 'printf("%d", c);   /* just an int */', '/* lookup by value: switch or table */', '/* lookup by name: strcmp loop */', '/* iterate: loop over the numbers yourself */'],
        predict: { q: 'What does Color(3) do when only RED = 1 and GREEN = 2 exist?', options: ['Returns None', 'Raises ValueError', 'Creates a new member'], answer: 1, why: 'Lookup by value only finds existing members; an unknown value raises ValueError.' }, steps: basics },
      { id: 'magic', title: 'Replacing magic strings', blurb: 'Enums as dict keys and function arguments, auto() for values, and IntEnum when numbers matter.', trap: 'Using IntEnum everywhere "to be safe": it lets states be compared with numbers and added together, which is exactly the mix-up a plain Enum prevents. Also, storing or sending an enum as JSON needs .value or .name, because the member itself is not JSON.',
        pyCode: ['from enum import Enum, IntEnum, auto', 'class Status(Enum):', '    OK = auto()', '    FAILED = auto()', 'class Level(IntEnum):', '    LOW = 1', '    HIGH = 2', 'def handle(s: Status): ...', 'handle(Status.FAILED)', 'counts = {Status.OK: 0, Status.FAILED: 0}', 'Status.OK == 1', 'Level.HIGH == 2'],
        cCode: ['enum Status { OK, FAILED };', 'enum Level { LOW = 1, HIGH = 2 };', 'void handle(enum Status s);', 'handle(FAILED);', 'handle(7);          /* compiles in C: no check */', 'if (OK == 0) ...    /* an enum is an int */', 'if (HIGH == 2) ...'],
        predict: { q: 'With class Status(Enum): OK = auto(), what is Status.OK == 1?', options: ['True', 'False', 'TypeError'], answer: 1, why: 'A plain Enum member is a distinct object, not equal to its value. Only IntEnum members compare equal to ints.' }, steps: magic },
    ],
    builtins: [
      ['class Color(Enum)', 'Define a fixed set of named members.'],
      ['member.name / member.value', 'The name as a string and the associated value.'],
      ['Color(value) / Color["NAME"]', 'Look up a member by value, or by name; both raise if not found.'],
      ['for m in Color', 'Iterate over the members in definition order; list(Color) gives all.'],
      ['auto()', 'Let Python choose the values (1, 2, 3, ...).'],
      ['IntEnum', 'Members are also ints and compare equal to them; use when the number matters.'],
    ],
  };
})();
