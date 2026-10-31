/* Lesson data: the agent loop and its guardrails (structure mode, Flow helper). */
(function () {
  var loop = Flow.steps([
    { pl: 0, cl: 0, say: 'An agent is a loop: ask the model; if it requests a tool, run it and feed back the result; repeat until the model gives a final answer. It looks clever, but the control flow is a while loop you wrote.', csay: 'while (steps < MAX) {', add: [['la', 'step', 0, 0], ['lb', 'did', 0, 1], ['s1', '1', 1, 0], ['s2', '2', 2, 0], ['s3', '3', 3, 0], ['s4', '4', 4, 0]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 3, cl: 1, say: 'Step 1: the model asks for search_tickets("refund"). Run it and add the result to the messages.', csay: 'resp = ask(messages);  /* tool call */', add: [['d1', 'search', 1, 1]], tag: [['s1', 'done'], ['d1', 'done']], ptr: [['now', 's1', 'up']] },
    { pl: 3, cl: 1, say: 'Step 2: it asks for get_order(42), using what it learned in step 1. Each step can depend on earlier results; that is why a loop is needed.', csay: 'resp = ask(messages);  /* tool call */', add: [['d2', 'order', 2, 1]], tag: [['s2', 'done'], ['d2', 'done']], ptr: [['now', 's2', 'up']] },
    { pl: 3, cl: 1, say: 'Step 3: it asks for check_policy(42).', csay: 'resp = ask(messages);  /* tool call */', add: [['d3', 'policy', 3, 1]], tag: [['s3', 'done'], ['d3', 'done']], ptr: [['now', 's3', 'up']] },
    { pl: 5, cl: 3, say: 'Step 4: no tool call, just text. That is the final answer, so the loop ends and returns it.', csay: 'return resp.text;', add: [['d4', 'answer', 4, 1]], tag: [['s4', 'done'], ['d4', 'hot']], ptr: [['now', 's4', 'up']] },
  ], { y0: 80 });
  var guard = Flow.steps([
    { pl: 0, cl: 0, say: 'What stops a loop that never ends? A model can ask for the same tool forever, or alternate between two. Every agent needs limits you enforce in code, not in the prompt.', csay: 'int steps = 0, tokens = 0;', add: [['la', 'guard', 0, 0], ['lb', 'state', 0, 1], ['a', 'steps', 1, 0], ['b', 'budget', 2, 0], ['c', 'repeat', 3, 0], ['d', 'time', 4, 0]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 1, cl: 1, say: 'A maximum number of steps (say 8). Reaching it stops the run and returns a clear failure, not a hang.', csay: 'if (++steps > 8) return ERR_STEPS;', add: [['x1', '8 max', 1, 1]], tag: [['a', 'done'], ['x1', 'done']] },
    { pl: 2, cl: 2, say: 'A token or cost budget for the whole run. Each loop adds the whole message list again, so cost grows faster than the step count.', csay: 'if (tokens > BUDGET) return ERR_BUDGET;', add: [['x2', '$0.50', 2, 1]], tag: [['b', 'done'], ['x2', 'done']] },
    { pl: 3, cl: 3, say: 'Detect repeats: if the model requests the same tool with the same arguments twice, it is stuck. Stop, or tell it to try something different.', csay: 'if (seen(call)) return ERR_LOOP;', add: [['x3', 'seen', 3, 1]], tag: [['c', 'bad'], ['x3', 'bad']] },
    { pl: 4, cl: 4, say: 'A wall-clock timeout so one slow tool cannot hold the run forever.', csay: 'if (now() > deadline) return ERR_TIME;', add: [['x4', '60 s', 4, 1]], tag: [['d', 'done'], ['x4', 'done']] },
    { pl: 6, cl: 5, say: 'On every exit, log the steps, tools used, tokens and reason for stopping. When an agent misbehaves for a customer, that log is how you find out why. Fall back to a person or a safe default instead of guessing.', csay: 'log_run(steps, tokens, reason);' },
  ]);
  window.LESSON = {
    id: 'agent-loop', mode: 'ds',
    title: 'The agent loop and its guardrails',
    lede: 'An agent is a program that repeatedly asks a model what to do next, runs the tool it requests, and feeds the result back until the model answers. The loop is ordinary code, so its safety is ordinary engineering: a step limit, a token or cost budget, detection of repeated calls, a timeout, and logging on every exit. Without these a confused model can loop forever and spend real money. Decide up front what happens on failure: retry, ask a person, or return a safe default.',
    scenes: [
      { id: 'loop', title: 'Ask, act, repeat', blurb: 'Call the model; if it asks for a tool run it and loop; otherwise return the text.', trap: 'Trusting the model to stop on its own. Also appending tool results in the wrong role, which confuses the next call, and letting the message list grow without bound (trim or summarise).',
        pyCode: ['def run_agent(messages, tools, max_steps=8):', '    for step in range(max_steps):', '        resp = ask(messages)', '        if not resp.tool_call:', '            return resp.text', '        result = dispatch(resp.tool_call, tools)', '        messages.append(resp.message)', '        messages.append({"role": "tool", "content": result})', '    raise RuntimeError("step limit reached")'],
        cCode: ['for (int steps = 0; steps < MAX; steps++) {', '    resp = ask(messages);', '    if (!resp.tool_call) return resp.text;', '    result = dispatch(resp.tool_call);', '    add_message("tool", result);', '}', 'return NULL;  /* limit hit */'],
        predict: { q: 'How does the agent loop know it is finished?', options: ['After a fixed time', 'The model replies with text and no tool call', 'When the messages list is empty'], answer: 1, why: 'A reply without a tool request is the final answer; your step limit is the backstop.' }, steps: loop },
      { id: 'guard', title: 'Limits that keep it safe', blurb: 'Steps, budget, repeats and time: enforced in code, logged on exit.', trap: 'Putting limits only in the prompt ("do not loop"): the model can ignore it. Enforce limits in the loop, and make the failure visible to the caller instead of returning a partial answer as if complete.',
        pyCode: ['seen = set()', 'deadline = time.monotonic() + 60', 'for step in range(8):', '    if time.monotonic() > deadline: raise TimeoutError', '    if tokens_used > BUDGET: raise RuntimeError("budget")', '    key = (call.name, json.dumps(call.args, sort_keys=True))', '    if key in seen: raise RuntimeError("repeated call")', '    seen.add(key)', 'log.info("agent steps=%d tokens=%d reason=%s", step, tokens_used, reason)'],
        cCode: ['if (++steps > 8) return ERR_STEPS;', 'if (tokens > BUDGET) return ERR_BUDGET;', 'if (seen(call)) return ERR_LOOP;', 'if (now() > deadline) return ERR_TIME;', 'log_run(steps, tokens, reason);'],
        predict: { q: 'The same tool call with identical arguments appears twice in a row. What does that suggest?', options: ['The tool is fast', 'The agent is probably stuck in a loop', 'Nothing'], answer: 1, why: 'Identical repeated calls rarely give new information; stop or change strategy.' }, steps: guard },
    ],
    builtins: [
      ['for step in range(max_steps)', 'A bounded loop; the else clause or a raise handles the limit.'],
      ['time.monotonic()', 'A clock for deadlines that does not jump.'],
      ['set of (name, args)', 'Detect repeated calls; sort keys when hashing arguments.'],
      ['log.info("... %s", x)', 'Record steps, tokens and the stop reason.'],
      ['human-in-the-loop', 'Pause for approval before irreversible actions.'],
      ['message trimming', 'Keep recent messages and a summary of older ones to stay inside the context window.'],
    ],
  };
})();
