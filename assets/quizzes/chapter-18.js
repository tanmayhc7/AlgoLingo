/* Chapter 18 quiz: Iterators, generators and decorators. */
window.QUIZ = {
  chapter: 18,
  title: 'Iterators, generators and decorators',
  lede: 'Lazy iteration, yield, wrapping functions, and dataclasses.',
  questions: [
    {
      type: 'mcq',
      q: '<code>g = (x for x in range(3))</code>, then <code>list(g)</code> twice. What does the second call return?',
      options: ['[0, 1, 2] again', '[]: the generator is exhausted', 'An error'],
      answer: 1,
      why: 'Generators are single use. After the first pass they have nothing left.',
    },
    {
      type: 'mcq',
      q: 'A function contains <code>yield</code>. What happens when you call it?',
      options: ['The body runs up to the first yield', 'A generator object is returned and no body code has run yet', 'All values are computed and returned as a list'],
      answer: 1,
      why: 'Calling it just creates the generator. The body starts at the first next().',
    },
    {
      type: 'mcq',
      q: 'What does <code>@timed</code> above <code>def f</code> mean?',
      options: ['f = timed(f), run once when f is defined', 'f = timed, run on every call', 'timed(f) runs each time f is called, without changing f'],
      answer: 0,
      why: 'Decoration is a rebinding of the name at definition time; the wrapper it returns then runs on each call.',
    },
    {
      type: 'complete',
      q: 'Fill in the blanks so <code>evens(n)</code> lazily yields the even numbers below <code>n</code>.',
      starter: 'def evens(n):\n    i = 0\n    while i < n:\n        ___ i\n        i += ___\n',
      tests: [
        { expr: 'list(evens(7))', want: '[0, 2, 4, 6]' },
        { expr: 'list(evens(0))', want: '[]' },
        { expr: 'next(evens(5))', want: '0' },
      ],
      hint: 'yield hands out a value; step by two to skip odd numbers.',
      solution: 'def evens(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 2\n',
      why: 'yield pauses the function and returns i; the next call continues after it with i increased by 2.',
    },
    {
      type: 'write',
      q: 'Write a decorator <code>counted</code> so the decorated function has a <code>calls</code> attribute that counts how many times it was called, and still returns its normal result.',
      starter: 'def counted(fn):\n    # your code\n',
      tests: [
        { expr: '(lambda f: (f(2), f(3), f.calls))(counted(lambda x: x * 10))', want: '(20, 30, 2)' },
        { expr: 'counted(lambda: 5).calls', want: '0' },
        { expr: '(lambda f: (f(1, 2), f.calls))(counted(lambda a, b: a + b))', want: '(3, 1)' },
      ],
      hint: 'Define wrapper(*args, **kwargs), increment wrapper.calls, call fn, and set wrapper.calls = 0 before returning wrapper.',
      solution: 'def counted(fn):\n    def wrapper(*args, **kwargs):\n        wrapper.calls += 1\n        return fn(*args, **kwargs)\n    wrapper.calls = 0\n    return wrapper\n',
      why: 'Functions are objects, so the wrapper can carry its own attribute that records calls.',
    },
    {
      type: 'debug',
      q: '<code>take(gen, k)</code> should return the first k values of any iterator as a list, but it loops forever on an infinite generator. Fix it.',
      starter: 'def take(gen, k):\n    return list(gen)[:k]\n',
      tests: [
        { expr: 'take(iter(range(10)), 3)', want: '[0, 1, 2]' },
        { expr: 'take((i for i in __import__("itertools").count()), 4)', want: '[0, 1, 2, 3]' },
        { expr: 'take(iter([1, 2]), 5)', want: '[1, 2]' },
      ],
      hint: 'list(gen) tries to consume everything. Stop pulling values after k of them, for example with itertools.islice.',
      solution: 'from itertools import islice\n\ndef take(gen, k):\n    return list(islice(gen, k))\n',
      why: 'islice pulls only k items lazily, so it terminates on infinite iterators and uses O(k) memory.',
    },
  ],
};
