/* Interview depth: enums. */
window.DEPTH = {
  thesis: 'An Enum is a closed set of named constants. It replaces magic strings and bare numbers with names that are spelled once, checked by Python (a typo raises at once) and understood by tools. Members are unique singleton objects with a name and a value, so they compare safely with is and are hashable dict keys. A plain Enum is not equal to its value; IntEnum is, which is useful for numbers that matter but weakens the protection.',
  why: [
    ['Typos become errors', '"faild" is a valid string; Status.FAILD raises AttributeError the moment it runs.'],
    ['One place for the valid choices', 'The enum lists every legal value, so validation, menus and error messages can read from it.'],
    ['Safer than integers', 'A plain Enum will not compare equal to 1, so a status cannot be mixed up with a count.'],
    ['Better code completion and checking', 'Editors and type checkers know the members, and can warn when a case is not handled.'],
  ],
  edges: [
    ['Duplicate values', 'Two names with the same value make the second an alias of the first: Color.CRIMSON is Color.RED. Use @unique to forbid it.'],
    ['Lookup failure', 'Color(3) raises ValueError and Color["PINK"] raises KeyError; catch these when parsing user input.'],
    ['JSON and databases', 'A member is not JSON serialisable. Store .value (or .name) and rebuild with Color(value).'],
    ['IntEnum surprises', 'IntEnum members equal ints and each other across enums if the values match, which can hide mistakes.'],
    ['Comparison', 'Compare members with is or ==. Ordering (<) is not defined for plain Enum.'],
    ['Adding members later', 'Enums cannot be extended after creation, and a subclass of an enum with members is not allowed.'],
  ],
  cost: [
    ['Member access', 'A class attribute lookup: effectively constant.'],
    ['Lookup by value', 'A dictionary lookup inside the enum class: constant time.'],
    ['Iteration', 'Linear in the number of members.'],
  ],
  internals: [
    ['A class with a metaclass', 'Enum classes are built by EnumMeta (EnumType), which turns each class attribute into a member object and builds the name and value lookup tables.'],
    ['Singletons', 'Each member is created once, so is comparison is reliable.'],
    ['auto()', 'A placeholder replaced with the next value when the class is created; by default 1, 2, 3.'],
    ['In C', 'An enum is a set of named integer constants. The compiler does not stop you passing 7 where a Status is expected.'],
  ],
  qa: [
    { lvl: 'junior', q: 'Why use an Enum instead of strings?', a: 'A string typo is a silent bug; an enum member has one spelled name and a misspelling raises AttributeError. It also lists all valid choices in one place.', follow: [] },
    { lvl: 'mid', q: 'How do you convert between an enum member and a string or number?', a: 'member.name and member.value go one way; Color["RED"] and Color(1) go back and raise if the input is not valid.', follow: [['How do you put an enum in JSON?', 'Write member.value (or .name) and rebuild with Color(value) on the way in. Handling the exception turns bad input into a clean error.']] },
    { lvl: 'mid', q: 'What is the difference between Enum and IntEnum?', a: 'IntEnum members are also ints, so they compare equal to numbers and can be sorted. A plain Enum member never equals its value. Prefer Enum unless the numeric value is part of the meaning, such as exit codes.', follow: [] },
    { lvl: 'senior', q: 'What happens if two members have the same value?', a: 'The second becomes an alias for the first, not a separate member. Iteration skips aliases. Decorate with @enum.unique to make duplicates an error.', follow: [] },
  ],
};

/* design-why */
window.DEPTH.design = [
 [
  "Why enums exist",
  "Strings like `\"pending\"` and `\"Pending\"` look alike and a typo passes silently. An enum defines the valid choices in one place, so a wrong name raises an error immediately."
 ],
 [
  "Why enums beat integer constants",
  "`status == 2` says nothing, and `2` is a valid int even when no status has that number. `Status.SHIPPED` names the meaning, prints clearly and cannot be confused with an unrelated number."
 ],
 [
  "Why members are singletons",
  "Each member is one object, so comparing with `is` or `==` is safe and fast. It is also why you can use members as dict keys."
 ],
 [
  "Why `Enum` is not an int by default",
  "Mixing a status with arithmetic is nearly always a bug, so plain `Enum` refuses it. `IntEnum` exists when you need the number behaviour, for example to match a C library."
 ]
];
