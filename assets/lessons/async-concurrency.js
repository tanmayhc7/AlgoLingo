/* Lesson data: asyncio, gather and limiting concurrency (structure mode, Flow helper). */
(function () {
  var gather = Flow.steps([
    { pl: 0, cl: 0, say: 'Four API calls, each waiting about 1 second for the network. Run one after another they take about 4 seconds, although the program does almost nothing while it waits.', csay: 'for (int i = 0; i < 4; i++) call(i);', add: [['la', 'serial', 0, 0], ['lb', 'gather', 0, 1], ['lc', 'time', 0, 2], ['s1', 'A', 1, 0], ['s2', 'B', 2, 0], ['s3', 'C', 3, 0], ['s4', 'D', 4, 0]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 2, cl: 1, say: 'Serial: A finishes, then B, then C, then D. Each column is one second.', csay: 'total = 4 s', tag: [['s1', 'done'], ['s2', 'done'], ['s3', 'done'], ['s4', 'done']], add: [['tt', '4 s', 5, 0]], hot: ['tt'] },
    { pl: 3, cl: 2, say: 'asyncio.gather starts all four at once. While one is waiting for its reply, the event loop switches to another. All four overlap in the same second.', csay: '/* C: epoll loop or one thread per call */', add: [['g', 'ABCD', 1, 1], ['tg', '1 s', 5, 1]], tag: [['g', 'cur'], ['tg', 'done']] },
    { pl: 4, cl: 3, say: 'The result list comes back in the same order you passed the tasks in, so results[0] belongs to A even if D finished first.', csay: 'results[i] = reply of call i', add: [['r', 'in order', 1, 2]], tag: [['r', 'done']] },
    { pl: 5, cl: 4, say: 'This helps only for waiting work (network, disk). For heavy computation asyncio does not make it faster, because all tasks still share one thread. That needs processes.', csay: '/* CPU bound: use threads or processes */', hot: ['g'] },
  ]);
  var sem = Flow.steps([
    { pl: 0, cl: 0, say: 'Six calls, but the API allows only 2 at a time before it answers 429. A semaphore with 2 permits lets at most two tasks run; the rest wait for a permit.', csay: 'sem_t sem; sem_init(&sem, 0, 2);', add: [['la', 'slot 1', 0, 0], ['lb', 'slot 2', 0, 1], ['lc', 'round', 0, 2], ['q1', '1', 1, 2], ['q2', '2', 2, 2], ['q3', '3', 3, 2]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 2, cl: 2, say: 'Round 1: tasks T1 and T2 take the two permits and start.', csay: 'sem_wait(&sem);', add: [['a1', 'T1', 1, 0], ['b1', 'T2', 1, 1]], tag: [['a1', 'cur'], ['b1', 'cur'], ['q1', 'cur']] },
    { pl: 3, cl: 3, say: 'T3 to T6 are suspended at "async with sem". Waiting costs almost nothing, because a suspended task does not use a thread.', csay: '/* T3..T6 blocked in sem_wait */', hot: ['a1', 'b1'] },
    { pl: 4, cl: 4, say: 'Round 2: when T1 and T2 finish they release their permits, so T3 and T4 start.', csay: 'sem_post(&sem);', add: [['a2', 'T3', 2, 0], ['b2', 'T4', 2, 1]], tag: [['a1', 'done'], ['b1', 'done'], ['a2', 'cur'], ['b2', 'cur'], ['q2', 'cur']] },
    { pl: 4, cl: 4, say: 'Round 3: T5 and T6 run. Never more than 2 in flight, so the rate limit is respected.', csay: 'sem_post(&sem);', add: [['a3', 'T5', 3, 0], ['b3', 'T6', 3, 1]], tag: [['a2', 'done'], ['b2', 'done'], ['a3', 'cur'], ['b3', 'cur'], ['q3', 'cur']] },
    { pl: 6, cl: 5, say: 'Total: 3 rounds instead of 6 serial calls, and no 429. The semaphore is the dial between speed and politeness; set it from the provider\'s documented limit.', csay: 'return;', tag: [['a3', 'done'], ['b3', 'done']] },
  ]);
  window.LESSON = {
    id: 'async-concurrency', mode: 'ds',
    title: 'asyncio: many calls at once',
    lede: 'Calling a model or an API is mostly waiting. asyncio lets one thread start many such calls and switch between them while they wait: async def defines a coroutine, await pauses it until a result arrives, and asyncio.gather runs several together. A semaphore caps how many run at the same time so you stay under a rate limit. It speeds up waiting work, not computation. In C you would build the same thing with an epoll loop or a thread pool.',
    scenes: [
      { id: 'gather', title: 'gather: overlap the waiting', blurb: 'Start all calls, let the loop switch while each waits, collect results in order.', trap: 'Calling a blocking function (requests.get, time.sleep) inside async code: it freezes the whole loop. Use an async client (httpx.AsyncClient) and asyncio.sleep. Also forgetting await returns a coroutine object instead of the result.',
        pyCode: ['import asyncio', 'async def main():', '    calls = [fetch(i) for i in range(4)]', '    results = await asyncio.gather(*calls)', '    return results', 'asyncio.run(main())'],
        cCode: ['/* wait for four sockets with one thread */', 'epoll_wait(ep, events, 4, -1);', 'for (int i = 0; i < n; i++) handle(events[i]);', '/* or a thread per call, joined at the end */', 'for (int i = 0; i < 4; i++) pthread_join(t[i], NULL);'],
        predict: { q: 'Four independent API calls each wait 1 second. About how long does asyncio.gather take for all four?', options: ['4 seconds', 'About 1 second', '0 seconds'], answer: 1, why: 'The waits overlap, so total time is about the longest single call.' }, steps: gather },
      { id: 'sem', title: 'A semaphore limits concurrency', blurb: 'At most N tasks hold a permit; the others wait without using a thread.', trap: 'Launching thousands of tasks with no limit and getting 429 errors or running out of sockets. Create the semaphore inside the running loop, and release it with async with so an exception still frees the permit.',
        pyCode: ['sem = asyncio.Semaphore(2)', 'async def limited(i):', '    async with sem:', '        return await fetch(i)', 'async def main():', '    return await asyncio.gather(*[limited(i) for i in range(6)])'],
        cCode: ['sem_init(&sem, 0, 2);', 'void *worker(void *arg) {', '    sem_wait(&sem);', '    call(arg);', '    sem_post(&sem);', '    return NULL;', '}'],
        predict: { q: 'Six tasks share a semaphore of 2. What is the most that ever run at once?', options: ['6', '2', '3'], answer: 1, why: 'Only two permits exist, so a third task has to wait until one is released.' }, steps: sem },
    ],
    builtins: [
      ['async def / await', 'Define a coroutine and pause it until a result is ready.'],
      ['asyncio.run(main())', 'Start the event loop once, at the top level.'],
      ['asyncio.gather(*coros)', 'Run together; results come back in order. return_exceptions=True keeps one failure from cancelling the rest.'],
      ['asyncio.Semaphore(n)', 'Limit how many tasks run a section at once.'],
      ['asyncio.wait_for(coro, t)', 'Add a timeout to any awaitable.'],
      ['asyncio.sleep', 'Non-blocking sleep (time.sleep blocks everything).'],
    ],
  };
})();
