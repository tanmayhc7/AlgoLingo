/* Lesson data: tests and fakes for model calls (structure mode, Flow helper). */
(function () {
  var aaa = Flow.steps([
    { pl: 0, cl: 0, say: 'A test has three parts: arrange the inputs, act by calling the code, assert the result. A failing assert is a bug report that runs by itself.', csay: 'int rc = priority_of("urgent!!");', add: [['la', 'test', 0, 0], ['a', 'arrange', 1, 0], ['b', 'act', 2, 0], ['c', 'assert', 3, 0]], tag: [['la', 'dim']] },
    { pl: 1, cl: 1, say: 'Arrange: pick an input. A good test picks the awkward ones, not just the happy path: empty, huge, wrong type, boundary values.', csay: 'const char *in = "URGENT!!";', tag: [['a', 'done']], ptr: [['at', 'a', 'down']] },
    { pl: 2, cl: 2, say: 'Act: call the function once and keep the result.', csay: 'int rc = priority_of(in);', tag: [['b', 'done']], ptr: [['at', 'b', 'down']] },
    { pl: 3, cl: 3, say: 'Assert: compare with the expected value. pytest shows both values if they differ. Run all tests with the pytest command; any file named test_*.py is picked up.', csay: 'assert(rc == 3);', tag: [['c', 'done']], ptr: [['at', 'c', 'down']] },
    { pl: 4, cl: 4, say: 'Keep tests small and independent, one behaviour each, and fast enough to run on every change.', csay: 'return 0;', unptr: ['at'] },
  ]);
  var fake = Flow.steps([
    { pl: 0, cl: 0, say: 'Your code calls a model over the network. In a test that is slow, costs money, and returns different text each time. Replace the model with a fake that returns a fixed reply.', csay: 'int summarise(model_fn m, const char *text);', add: [['la', 'real', 0, 0], ['lb', 'test', 0, 1], ['r1', 'code', 1, 0], ['r2', 'net', 2, 0], ['r3', 'model', 3, 0], ['t1', 'code', 1, 1], ['t2', 'fake', 2, 1]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 1, cl: 1, say: 'In production the code calls the real client: code, then the network, then the model. Unpredictable and slow.', csay: 'model_fn m = real_model;', tag: [['r1', 'done'], ['r2', 'cur'], ['r3', 'cur']] },
    { pl: 2, cl: 2, say: 'Make the model a parameter instead of a global. summarise(text, ask) takes any function that maps a prompt to a reply. This is dependency injection: pass in what the code needs.', csay: 'summarise(text, fake_model);', tag: [['t1', 'done']], hot: ['t1'] },
    { pl: 4, cl: 3, say: 'The test passes a fake that returns "OK: 3 items" no matter the prompt. No network, no cost, same answer every time.', csay: 'const char *fake_model(const char *p) { return "OK: 3 items"; }', tag: [['t2', 'done']] },
    { pl: 5, cl: 4, say: 'Now assert on your code\'s behaviour: it parsed the reply, handled a malformed one, retried on an error. The fake can also record the prompt it received so you can assert what was sent.', csay: 'assert(strcmp(result, "3") == 0);', hot: ['t1', 't2'] },
    { pl: 6, cl: 5, say: 'unittest.mock.patch can replace a function in place when you cannot change the signature, but passing the dependency in is simpler and clearer. Keep a few slow end-to-end checks against the real model separately from the unit tests.', csay: 'return 0;' },
  ]);
  window.LESSON = {
    id: 'testing-mocks', mode: 'ds',
    title: 'Tests and fakes for model calls',
    lede: 'Tests turn "it seems to work" into a repeatable check. pytest finds functions named test_*, and a plain assert is enough. Code that calls a language model or a web service is hard to test directly because it is slow, costs money and gives different output each time; the fix is to pass the model in as a parameter and give the test a fake that returns a fixed reply. In C you would do the same with a function pointer. Tests are also how you change a customer integration safely.',
    scenes: [
      { id: 'aaa', title: 'Arrange, act, assert', blurb: 'One behaviour per test: set up an input, call once, compare.', trap: 'Tests that depend on each other or on the real clock, network or random numbers; and testing only the happy path. Also a test that can never fail (an assert on a value you just set) proves nothing.',
        pyCode: ['def priority_of(text):', '    return 3 if "urgent" in text.lower() else 1', 'def test_urgent_is_high():', '    result = priority_of("URGENT!!")', '    assert result == 3'],
        cCode: ['int priority_of(const char *t);', 'const char *in = "URGENT!!";', 'int rc = priority_of(in);', 'assert(rc == 3);', 'return 0;'],
        predict: { q: 'Which name makes pytest run a function automatically?', options: ['check_urgent', 'test_urgent', 'run_urgent'], answer: 1, why: 'pytest collects files named test_*.py and functions named test_*.' }, steps: aaa },
      { id: 'fake', title: 'Replace the model with a fake', blurb: 'Pass the model call in as a parameter so a test can supply a fixed reply.', trap: 'Patching deep inside a library so the test passes while the code is wrong, and mocking so much that the test only checks the mock. Fake the boundary (the model call), keep your own logic real.',
        pyCode: ['def summarise(text, ask):', '    reply = ask("Summarise: " + text)', '    return reply.removeprefix("OK: ")', 'def test_summarise():', '    fake = lambda prompt: "OK: 3 items"', '    assert summarise("...", fake) == "3 items"', '# production: summarise(text, real_client)'],
        cCode: ['typedef const char *(*model_fn)(const char *prompt);', 'const char *summarise(const char *t, model_fn ask);', 'summarise(text, real_model);', 'const char *fake_model(const char *p) { return "OK: 3 items"; }', 'assert(strcmp(summarise(text, fake_model), "3 items") == 0);'],
        predict: { q: 'Why pass the model call into the function instead of calling a global client?', options: ['It makes the code shorter', 'A test can substitute a fast fake with a fixed reply', 'Python requires it'], answer: 1, why: 'Injecting the dependency lets you test your logic without the network or randomness.' }, steps: fake },
    ],
    builtins: [
      ['assert x == y', 'pytest rewrites asserts to show both sides on failure.'],
      ['pytest.raises(Err)', 'Assert that code raises an exception.'],
      ['pytest.mark.parametrize', 'Run one test over many inputs.'],
      ['unittest.mock.Mock / patch', 'Replace objects or functions temporarily.'],
      ['pytest fixtures (@pytest.fixture)', 'Shared setup such as a temporary directory or a fake client.'],
      ['tmp_path', 'pytest fixture giving a fresh temporary directory per test.'],
    ],
  };
})();
