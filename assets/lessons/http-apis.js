/* Lesson data: HTTP APIs, retries and pagination (structure mode, Flow helper). */
(function () {
  var retry = Flow.steps([
    { pl: 0, cl: 0, say: 'A call to a web API can fail for reasons that have nothing to do with your code: the server is overloaded, the network drops, you hit a rate limit. Retrying the right failures, with a growing wait, is what makes a pipeline reliable.', csay: 'int status = http_get(url, &resp);', add: [['la', 'try', 0, 0], ['lb', 'status', 0, 1], ['lc', 'wait', 0, 2], ['t1', '1', 1, 0], ['t2', '2', 2, 0], ['t3', '3', 3, 0], ['t4', '4', 4, 0]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 3, cl: 1, say: 'Attempt 1 gets 503 (service unavailable). That is a server-side, temporary failure, so it is safe to retry.', csay: 'if (status >= 500) retry', add: [['s1', '503', 1, 1]], tag: [['t1', 'bad'], ['s1', 'bad']], ptr: [['now', 't1', 'up']] },
    { pl: 5, cl: 2, say: 'Wait before trying again: 1 second. Doubling the wait each time (exponential backoff) gives an overloaded server room to recover instead of hammering it.', csay: 'sleep(delay);  delay *= 2;', add: [['w1', '1s', 1, 2]], tag: [['w1', 'cur']] },
    { pl: 3, cl: 1, say: 'Attempt 2 also returns 503. Wait 2 seconds this time.', csay: 'if (status >= 500) retry', add: [['s2', '503', 2, 1], ['w2', '2s', 2, 2]], tag: [['t2', 'bad'], ['s2', 'bad'], ['w2', 'cur']], ptr: [['now', 't2', 'up']] },
    { pl: 3, cl: 3, say: 'Attempt 3 returns 429 (too many requests): rate limited. Also retryable, and the Retry-After header, if present, tells you exactly how long to wait. Wait 4 seconds.', csay: 'status == 429', add: [['s3', '429', 3, 1], ['w3', '4s', 3, 2]], tag: [['t3', 'bad'], ['s3', 'bad'], ['w3', 'cur']], ptr: [['now', 't3', 'up']] },
    { pl: 7, cl: 4, say: 'Attempt 4 returns 200. Success: return the response. Total cost: 7 seconds of waiting, and the job continued instead of failing.', csay: 'return resp;', add: [['s4', '200', 4, 1]], tag: [['t4', 'done'], ['s4', 'done']], ptr: [['now', 't4', 'up']] },
    { pl: 8, cl: 5, say: 'What NOT to retry: other 4xx errors (400 bad request, 401 unauthorised, 404 not found). The request itself is wrong and will fail identically forever. Also cap the attempts and add jitter so many clients do not retry in lockstep.', csay: '/* give up on 4xx */', hot: ['s4'] },
  ], { y0: 80 });
  var page = Flow.steps([
    { pl: 0, cl: 0, say: 'APIs return big lists in pages. Each response carries the items and a cursor (or page number) for the next page. Three pages here: 50, 50 and 12 items.', csay: 'char *cursor = NULL;', add: [['la', 'page', 0, 0], ['lb', 'items', 0, 1], ['lc', 'cursor', 0, 2], ['p1', 'p1', 1, 0], ['p2', 'p2', 2, 0], ['p3', 'p3', 3, 0]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 3, cl: 2, say: 'First request has no cursor. The response has 50 items and the cursor "c2".', csay: 'fetch(cursor, &page);', add: [['n1', '50', 1, 1], ['c1', 'c2', 1, 2]], tag: [['p1', 'done'], ['n1', 'done'], ['c1', 'cur']], ptr: [['page', 'p1', 'up']] },
    { pl: 3, cl: 2, say: 'Send cursor "c2" to get the next page: 50 more items and cursor "c3". Items are appended to one list.', csay: 'fetch(cursor, &page);', add: [['n2', '50', 2, 1], ['c2', 'c3', 2, 2]], tag: [['p2', 'done'], ['n2', 'done'], ['c2', 'cur']], ptr: [['page', 'p2', 'up']] },
    { pl: 3, cl: 2, say: 'The last page has 12 items and no cursor (None). That missing cursor is the stop signal.', csay: 'cursor = page.next;  /* NULL */', add: [['n3', '12', 3, 1], ['c3', 'none', 3, 2]], tag: [['p3', 'done'], ['n3', 'done'], ['c3', 'hot']], ptr: [['page', 'p3', 'up']] },
    { pl: 6, cl: 4, say: 'Loop ends: 112 items collected. A while True loop that stops on a missing cursor is safer than computing the page count up front, because the data may change while you read it.', csay: 'return total;  /* 112 */', unptr: ['page'] },
  ]);
  window.LESSON = {
    id: 'http-apis', mode: 'ds',
    title: 'HTTP APIs: status codes, retries and pagination',
    lede: 'Integrations talk to services over HTTP. A request returns a status code that says what happened: 2xx success, 4xx your fault, 5xx their fault, 429 slow down. Reliable clients set a timeout on every call, retry only the temporary failures with exponential backoff, respect rate limits, and walk paginated results until the cursor runs out. In C this is libcurl and a hand-written loop; in Python it is the requests or httpx library plus the same logic.',
    scenes: [
      { id: 'retry', title: 'Retries with exponential backoff', blurb: 'Retry 5xx and 429 after a growing delay; fail fast on other 4xx.', trap: 'Retrying everything, including 404 or 401, which can never succeed, and retrying forever. Always cap attempts, set a timeout on each call (requests has none by default), and add random jitter. Only retry requests that are safe to repeat: GET is; a POST that charges a card needs an idempotency key.',
        pyCode: ['import time, requests', 'def get_with_retry(url, tries=4):', '    delay = 1', '    for attempt in range(tries):', '        r = requests.get(url, timeout=10)', '        if r.status_code < 500 and r.status_code != 429:', '            return r', '        time.sleep(delay)', '        delay *= 2', '    raise RuntimeError("gave up")'],
        cCode: ['int fetch(const char *url, resp_t *out) {', '    int delay = 1;', '    for (int i = 0; i < 4; i++) {', '        int status = http_get(url, out);', '        if (status < 500 && status != 429) return status;', '        sleep(delay); delay *= 2;', '    }', '    return -1;', '}'],
        predict: { q: 'A request returns 404. Should the client retry it?', options: ['Yes, with backoff', 'No, the request is wrong and will fail the same way', 'Yes, but only once'], answer: 1, why: '4xx errors (other than 429 and sometimes 408) mean the request itself is invalid; retrying wastes time.' }, steps: retry },
      { id: 'page', title: 'Walking a paginated API', blurb: 'Follow the next cursor until it is missing, collecting items as you go.', trap: 'Stopping after the first page, or assuming a fixed page count. Stop on the absence of a next cursor, and add a page limit as a guard against an API that never ends.',
        pyCode: ['def fetch_all(fetch):', '    items, cursor = [], None', '    while True:', '        page = fetch(cursor)', '        items.extend(page["items"])', '        cursor = page.get("next")', '        if cursor is None:', '            return items'],
        cCode: ['char *cursor = NULL;', 'int total = 0;', 'do {', '    fetch(cursor, &page);', '    total += page.count;', '    cursor = page.next;', '} while (cursor);'],
        predict: { q: 'What is the safest stop condition for paging through an API?', options: ['A fixed number of pages', 'The response has no next cursor', 'The first empty string'], answer: 1, why: 'The server tells you when it is done; a fixed count breaks as soon as the data grows or shrinks.' }, steps: page },
    ],
    builtins: [
      ['requests.get(url, timeout=10)', 'Always pass a timeout. r.status_code, r.json(), r.raise_for_status().'],
      ['r.raise_for_status()', 'Raises for 4xx and 5xx so errors cannot be ignored by accident.'],
      ['requests.Session()', 'Reuses connections and shared headers across calls.'],
      ['time.sleep, random.uniform', 'Backoff delay and jitter.'],
      ['httpx', 'Third-party client with the same style and async support.'],
      ['headers={"Authorization": ...}', 'Send keys in headers, never in the URL, and never log them.'],
    ],
  };
})();
