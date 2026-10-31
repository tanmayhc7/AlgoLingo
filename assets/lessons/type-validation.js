/* Lesson data: type hints and validating untrusted data (structure mode, Flow helper). */
(function () {
  var hints = Flow.steps([
    { pl: 0, cl: 0, say: 'Type hints say what a function expects and returns. Python ignores them at run time; they are for readers, editors and checkers like mypy. In C the compiler enforces types; in Python the hint is only a promise.', csay: 'int add(int a, int b);', add: [['la', 'def', 0, 0], ['f', 'add', 1, 0], ['la1', 'a', 2, 0], ['lb1', 'b', 3, 0], ['lr', '->', 4, 0]], tag: [['la', 'dim']] },
    { pl: 0, cl: 0, say: 'def add(a: int, b: int) -> int: each parameter has a type after a colon and the return type follows the arrow.', csay: 'int add(int a, int b)', add: [['ta', 'int', 2, 1], ['tb', 'int', 3, 1], ['tr', 'int', 4, 1]], tag: [['ta', 'done'], ['tb', 'done'], ['tr', 'done']] },
    { pl: 3, cl: 2, say: 'Calling add("x", 2) runs anyway: Python does not check. A checker would flag it before you run the code, and a runtime error appears only inside the function.', csay: '/* C refuses to compile this call */', add: [['arg', '"x"', 2, 2]], tag: [['arg', 'bad']] },
    { pl: 5, cl: 3, say: 'Optional[int], or int | None, means "an int or None". It forces callers to handle the missing case, which is the source of most "NoneType has no attribute" bugs.', csay: 'int *find(...);  /* NULL when absent */', add: [['opt', 'int|None', 2, 3]], tag: [['opt', 'cur']] },
  ]);
  var val = Flow.steps([
    { pl: 0, cl: 0, say: 'Hints do not protect you from data you did not create. A ticket arrives as JSON from a customer system or a model: {"id": 7, "priority": "urgent", "title": ""}. Validate at the edge of the program, then trust the checked object inside.', csay: 'struct ticket t; if (!parse(json, &t)) return -1;', add: [['la', 'field', 0, 0], ['lb', 'value', 0, 1], ['lc', 'check', 0, 2], ['f1', 'id', 1, 0], ['f2', 'prio', 2, 0], ['f3', 'title', 3, 0], ['v1', '7', 1, 1], ['v2', 'urgent', 2, 1], ['v3', '""', 3, 1]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 2, cl: 1, say: 'id must be an int and positive. 7 passes.', csay: 'if (t.id <= 0) err = 1;', add: [['c1', 'ok', 1, 2]], tag: [['c1', 'done'], ['v1', 'done']], hot: ['v1'] },
    { pl: 3, cl: 2, say: 'priority must be one of low, medium, high. "urgent" is not in the allowed set: reject it with a clear message rather than guessing.', csay: 'if (!in_set(t.prio)) err = 2;', add: [['c2', 'bad', 2, 2]], tag: [['c2', 'bad'], ['v2', 'bad']], hot: ['v2'] },
    { pl: 4, cl: 3, say: 'title must be a non-empty string. "" fails. The function collects every error instead of stopping at the first, so the caller (or the model, on a retry) sees all of them at once.', csay: 'if (!t.title[0]) err = 4;', add: [['c3', 'bad', 3, 2]], tag: [['c3', 'bad'], ['v3', 'bad']], hot: ['v3'] },
    { pl: 6, cl: 5, say: 'Result: (False, ["priority must be low, medium or high", "title is empty"]). Libraries such as Pydantic generate this kind of check from a class with type hints; here it is written by hand so you see what they do.', csay: 'return err;  /* bitmask of problems */' },
  ]);
  window.LESSON = {
    id: 'type-validation', mode: 'ds',
    title: 'Type hints and validating data',
    lede: 'Type hints document what code expects, and tools such as mypy and your editor check them before the program runs; at run time Python ignores them. Data from outside the program (JSON from an API, text from a model, a customer file) is untrusted and must be validated at the edge: check types, ranges and allowed values, collect all the problems, and only then pass a trusted object inward. Pydantic automates this from type hints. In C the compiler checks types, but you still validate parsed input by hand.',
    scenes: [
      { id: 'hints', title: 'Type hints are promises', blurb: 'Annotate parameters and returns; a checker enforces them, Python does not.', trap: 'Believing a hint is checked at run time. def f(x: int) happily accepts a string. Also Optional means "may be None", not "argument may be omitted": omission needs a default value.',
        pyCode: ['def add(a: int, b: int) -> int:', '    return a + b', 'add("x", 2)', 'from typing import Optional', 'def find(xs: list[int], t: int) -> Optional[int]:', '    return xs.index(t) if t in xs else None'],
        cCode: ['int add(int a, int b) { return a + b; }', '/* add("x", 2);  compile error */', 'int *find(int *xs, int n, int t) {', '    /* NULL when absent */', '}'],
        predict: { q: 'At run time, what happens when you pass a str to a parameter annotated int?', options: ['TypeError immediately', 'Nothing special: Python does not check hints', 'It is converted to int'], answer: 1, why: 'Annotations are metadata. Only a type checker or a library such as Pydantic enforces them.' }, steps: hints },
      { id: 'validate', title: 'Validate untrusted input', blurb: 'Check each field, collect every error, and only then trust the object.', trap: 'Stopping at the first error (the caller fixes one problem per round trip), trusting a model\'s JSON because it "looked right", or validating deep inside the code instead of at the boundary. Never use assert for validation: it is removed under python -O.',
        pyCode: ['ALLOWED = {"low", "medium", "high"}', 'def validate(d):', '    errs = []', '    if not isinstance(d.get("id"), int) or d["id"] <= 0:', '        errs.append("id must be a positive int")', '    if d.get("priority") not in ALLOWED:', '        errs.append("priority must be low, medium or high")', '    if not str(d.get("title", "")).strip():', '        errs.append("title is empty")', '    return (not errs, errs)'],
        cCode: ['int validate(const struct ticket *t) {', '    int err = 0;', '    if (t->id <= 0) err |= 1;', '    if (!in_set(t->prio)) err |= 2;', '    if (!t->title[0]) err |= 4;', '    return err;', '}'],
        predict: { q: 'Why collect all validation errors instead of raising on the first?', options: ['It is faster', 'The caller, or a model asked to retry, can fix everything in one pass', 'Python requires it'], answer: 1, why: 'One complete error list means one retry instead of several.' }, steps: val },
    ],
    builtins: [
      ['typing: Optional, Union, Literal, TypedDict, Protocol', 'Building blocks for precise hints. Literal["low", "high"] restricts to given values.'],
      ['list[int], dict[str, float]', 'Generic hints (Python 3.9+).'],
      ['isinstance(x, int)', 'Run-time type test. Remember bool is a subclass of int.'],
      ['dataclasses.dataclass', 'A plain typed record; does not validate on its own.'],
      ['pydantic.BaseModel', 'Third-party: validates and converts data from type hints, with clear errors.'],
      ['mypy / pyright', 'Static checkers that read the hints before the program runs.'],
    ],
  };
})();
