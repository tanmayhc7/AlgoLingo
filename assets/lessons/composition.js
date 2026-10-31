/* Lesson data: Composition and delegation (structure mode). */
(function () {
  function box(id, x, y, title, fields) {
    var ops = [['node', id, title, x, y, 'cell'], ['tag', id, 'mark']];
    (fields || []).forEach(function (f, k) { ops.push(['node', id + 'f' + k, f, x, y + 48 * (k + 1), 'cell']); });
    return ops;
  }
  var has = [
    { pl: 5, cl: 5, h: 440, say: 'A Car is not an Engine; it has an engine. So the Car object holds a reference to an Engine object as one of its attributes. This is composition: build bigger objects out of smaller ones.', csay: 'A struct that contains a pointer to another struct.', ds: box('C', 200, 60, 'car', ['engine', 'wheels=4']).concat(box('E', 560, 60, 'Engine', ['hp=120']), [['edge', 'Cf0', 'E', 'e1']]) },
    { pl: 6, cl: 6, h: 440, say: 'car.start() runs Car.start with self = car.', csay: 'car_start(car);', ds: [['node', 'Fs', 'self', 200, 250, 'cell'], ['edge', 'Fs', 'Cf1', 'e1'], ['tag', 'Fs', 'cur']] },
    { pl: 4, cl: 4, h: 440, say: 'Car.start does not know how to start an engine. It delegates: self.engine.start() follows the engine reference and asks that object to do the work.', csay: 'engine_start(c->engine);', ds: [['etag', 'Cf0', 'e1', 'on'], ['tag', 'Cf0', 'hot']] },
    { pl: 1, cl: 1, h: 440, say: 'Engine.start runs with self = the engine and returns "vroom". Car only forwarded the call.', csay: 'Returns "vroom".', ds: [['tag', 'E', 'done'], ['hot', 'E', 'Ef0']] },
    { pl: 6, cl: 6, h: 440, say: 'The result flows back up and the frame disappears. Because Car only relies on the engine\'s start method, any object with a start method would do.', csay: 'Frame popped.', ds: [['rm', 'Fs'], ['etag', 'Cf0', 'e1', 'dim'], ['untag', 'E', 'done']] },
  ];
  var CS = [['node', 'L', 'lg', 150, 60, 'cell'], ['tag', 'L', 'mark'], ['node', 'Lf0', 'sink', 150, 108, 'cell'], ['node', 'S1', 'Console', 500, 60, 'cell'], ['tag', 'S1', 'mark'], ['node', 'S2', 'File', 500, 200, 'cell'], ['tag', 'S2', 'mark']];
  var sw = [
    { pl: 7, cl: 6, h: 440, say: 'A Logger does not print; it hands messages to a sink object it holds. Right now the sink is a ConsoleSink. Console and File sinks both offer write(msg).', csay: 'A struct holding a pointer to a table of function pointers.', ds: CS.concat([['edge', 'Lf0', 'S1', 'e1']]) },
    { pl: 6, cl: 5, h: 440, say: 'lg.log("x") calls self.sink.write("x"). The reference points at the console sink, so the text is printed.', csay: 'l->sink->write(m) calls console_write.', ds: [['tag', 'S1', 'done'], ['etag', 'Lf0', 'e1', 'on'], ['hot', 'S1']] },
    { pl: 7, cl: 7, h: 440, say: 'lg.sink = FileSink() changes where the reference points. No class changed, no subclass was written: the Logger now behaves differently because it holds a different part.', csay: 'lg.sink = &file;', ds: [['untag', 'S1', 'done'], ['unedge', 'Lf0', 'e1'], ['edge', 'Lf0', 'S2', 'e1'], ['hot', 'Lf0']] },
    { pl: 6, cl: 5, h: 440, say: 'The same lg.log("x") now writes to the file. Swapping parts at run time is the main advantage of composition over inheritance, where behaviour is fixed when you pick the class.', csay: 'Same call, different function behind the pointer.', ds: [['tag', 'S2', 'done'], ['etag', 'Lf0', 'e1', 'on'], ['hot', 'S2']] },
  ];
  window.LESSON = {
    id: 'composition',
    mode: 'ds',
    title: 'Composition and delegation',
    lede:
      'Inheritance says "is a"; composition says "has a". Instead of extending a class, your object holds other objects and forwards work to them. This keeps classes small, lets you swap parts at run time, and avoids the tangled hierarchies that deep inheritance produces. In C this is the natural style anyway: a struct that holds pointers to other structs or to a table of function pointers.',
    scenes: [
      { id: 'has-a', title: 'Has-a and delegation', blurb: 'The outer object keeps a reference to a part and forwards calls to it.', trap: 'Inheriting just to reuse code. If a Stack subclasses list, users can call insert and sort on it and break your invariants. Hold a list inside instead and expose only push and pop.', pyCode: ['class Engine:', '    def start(self): return "vroom"', 'class Car:', '    def __init__(self, engine): self.engine = engine', '    def start(self): return self.engine.start()   # delegate', 'car = Car(Engine())', 'car.start()'], cCode: ['typedef struct { int hp; } Engine;', 'const char *engine_start(Engine *e) { return "vroom"; }', 'typedef struct { Engine *engine; int wheels; } Car;', 'Car *car_new(Engine *e);', 'const char *car_start(Car *c) { return engine_start(c->engine); }', 'Car *car = car_new(engine_new(120));', 'car_start(car);'], predict: { q: 'Which relationship is best modelled with composition?', options: ['A Dog is an Animal', 'A Car has an Engine', 'A Square is a Shape'], answer: 1, why: '"Has a" relationships are composition: the car holds an engine object and delegates engine work to it.' }, steps: has },
      { id: 'swap', title: 'Swapping behaviour at run time', blurb: 'Change what an object does by changing which part it references.', trap: 'Reaching through the part (lg.sink.f.write(...)) from outside. Callers should talk to the Logger only; the Law of Demeter says an object should talk to its direct collaborators, not to their internals.', pyCode: ['class ConsoleSink:', '    def write(self, msg): print(msg)', 'class FileSink:', '    def write(self, msg): self.f.write(msg)', 'class Logger:', '    def __init__(self, sink): self.sink = sink', '    def log(self, m): self.sink.write(m)', 'lg = Logger(ConsoleSink());  lg.sink = FileSink()'], cCode: ['typedef struct { void (*write)(const char *); } Sink;', 'void console_write(const char *m) { puts(m); }', 'void file_write(const char *m) { fputs(m, fp); }', 'Sink console = { console_write }, file = { file_write };', 'typedef struct { Sink *sink; } Logger;', 'void log_msg(Logger *l, const char *m) { l->sink->write(m); }', 'Logger lg = { &console };', 'lg.sink = &file;   /* swap at run time */'], predict: { q: 'After <code>lg.sink = FileSink()</code>, what does <code>lg.log("x")</code> do?', options: ['Still prints to the console', 'Writes to the file, with no change to Logger', 'Fails because Logger must be rewritten'], answer: 1, why: 'Logger only calls sink.write. Which write runs depends on the object the reference points at, so behaviour changes without editing the class.' }, steps: sw },
    ],
    builtins: [
      ['__getattr__', 'Called for missing attributes: a quick way to forward everything to a wrapped object.'],
      ['functools.partial, callables', 'Pass behaviour as a function instead of a whole object (strategy pattern).'],
      ['typing.Protocol', 'Describe "anything with a write method" without a shared base class (duck typing with checks).'],
      ['contextlib.contextmanager', 'Wrap setup/teardown around a part without writing a class.'],
      ['dataclasses.field', 'Declare held parts and defaults for dataclass-based composition.'],
    ],
  };
})();
