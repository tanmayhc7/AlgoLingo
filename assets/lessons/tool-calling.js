/* Lesson data: tool (function) calling (structure mode, Flow helper). */
(function () {
  var round = Flow.steps([
    { pl: 0, cl: 0, say: 'A model cannot look up an order or call your API by itself. With tool calling you describe functions to it, and instead of text it can reply "please call get_order with id 42". Your code runs the function and sends the result back. The model asks; your code acts.', csay: 'struct tool tools[] = {{"get_order", get_order}};', add: [['la', 'who', 0, 0], ['lb', 'what', 0, 1], ['a', 'user', 1, 0], ['b', 'model', 2, 0], ['c', 'code', 3, 0], ['d', 'model', 4, 0]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 1, cl: 1, say: 'The user asks "Where is order 42?". You send the question together with the tool descriptions: a name, a plain-language purpose and a JSON schema for the arguments.', csay: 'ask(model, messages, tools);', add: [['x1', 'where?', 1, 1]], tag: [['a', 'done'], ['x1', 'done']] },
    { pl: 2, cl: 2, say: 'The model replies with a tool call, not an answer: name "get_order", arguments {"id": 42}. It did not run anything; it only produced a request.', csay: 'call = resp.tool_call;', add: [['x2', 'call', 2, 1]], tag: [['b', 'cur'], ['x2', 'cur']] },
    { pl: 4, cl: 3, say: 'Your code looks the name up in a dictionary of allowed tools, validates the arguments, and runs it. Unknown names and bad arguments are refused, because the model\'s request is untrusted input.', csay: 'result = find(tools, call.name)(call.args);', add: [['x3', 'run', 3, 1]], tag: [['c', 'done'], ['x3', 'done']] },
    { pl: 6, cl: 4, say: 'You append the tool result as a message and call the model again. It now has the order data in its context.', csay: 'add_message("tool", result); ask(model, ...);', add: [['x4', 'result', 3, 2]], tag: [['x4', 'cur']] },
    { pl: 7, cl: 5, say: 'The model writes the final answer in plain language: "Order 42 shipped yesterday and arrives Friday." A round trip: question, tool request, tool result, answer.', csay: 'print(resp.text);', add: [['x5', 'answer', 4, 1]], tag: [['d', 'done'], ['x5', 'done']] },
  ]);
  var safe = Flow.steps([
    { pl: 0, cl: 0, say: 'The model may ask for something you did not offer or something dangerous. The dispatcher is your safety gate. Four requests arrive over time.', csay: 'int dispatch(call_t c);', add: [['la', 'request', 0, 0], ['lb', 'verdict', 0, 1], ['r1', 'get_ord', 1, 0], ['r2', 'delete', 2, 0], ['r3', 'get_ord', 3, 0], ['r4', 'get_ord', 4, 0]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 2, cl: 1, say: 'get_order with {"id": 42}: the tool is allowed and the id is an int. Run it.', csay: 'if (known(c) && valid(c)) run(c);', add: [['v1', 'run', 1, 1]], tag: [['r1', 'done'], ['v1', 'done']], ptr: [['now', 'r1', 'up']] },
    { pl: 3, cl: 2, say: 'delete_customer was never offered. Refuse it and tell the model "unknown tool". Never run a name just because the model produced it.', csay: 'else return ERR_UNKNOWN;', add: [['v2', 'refuse', 2, 1]], tag: [['r2', 'bad'], ['v2', 'bad']], ptr: [['now', 'r2', 'up']] },
    { pl: 4, cl: 3, say: 'get_order with {"id": "abc"} fails validation. Return the error text as the tool result so the model can correct its arguments, instead of crashing.', csay: 'return "id must be an int";', add: [['v3', 'error', 3, 1]], tag: [['r3', 'cur'], ['v3', 'cur']], ptr: [['now', 'r3', 'up']] },
    { pl: 5, cl: 4, say: 'A tool that raises an exception is caught too. Return a short, safe error message (no stack trace, no secrets) and log the details.', csay: 'catch -> return "tool failed";', add: [['v4', 'caught', 4, 1]], tag: [['r4', 'hot'], ['v4', 'hot']], ptr: [['now', 'r4', 'up']] },
    { pl: 6, cl: 5, say: 'Give each tool the least power it needs: read-only where possible, and confirmation by a person before anything irreversible (refunds, deletions, emails).', csay: '/* least privilege */', unptr: ['now'] },
  ], { y0: 80 });
  window.LESSON = {
    id: 'tool-calling', mode: 'ds',
    title: 'Tool calling',
    lede: 'Tool calling lets a model use your code. You describe each function with a name, a purpose and a JSON schema for its arguments; the model may reply with a request to call one; your program checks the request, runs the function and returns the result; the model then answers using it. The model never runs anything itself. The dispatcher between model and tools is where you enforce which tools exist, validate arguments, catch errors and limit power. In C this is a table of function pointers keyed by name.',
    scenes: [
      { id: 'round', title: 'One round trip', blurb: 'Question, tool request, tool result, final answer.', trap: 'Letting the model\'s request run as is. The call is untrusted input: look the name up in an allow-list, validate the arguments, and never build a shell command or SQL string from them.',
        pyCode: ['TOOLS = {"get_order": get_order}', 'resp = ask(messages, tools=TOOL_SPECS)', 'if resp.tool_call:', '    fn = TOOLS[resp.tool_call.name]', '    result = fn(**resp.tool_call.args)', '    messages.append({"role": "tool", "content": json.dumps(result)})', '    resp = ask(messages, tools=TOOL_SPECS)', 'print(resp.text)'],
        cCode: ['struct tool { const char *name; char *(*fn)(cJSON *args); };', 'ask(model, messages, tools);', 'call = resp.tool_call;', 'result = find(tools, call.name)->fn(call.args);', 'add_message("tool", result);', 'ask(model, messages, tools);'],
        predict: { q: 'Who actually runs the function when a model "calls" a tool?', options: ['The model', 'Your program', 'The API provider, always'], answer: 1, why: 'The model only produces a request. Your code decides whether and how to run it.' }, steps: round },
      { id: 'safe', title: 'A safe dispatcher', blurb: 'Allow-list the names, validate arguments, return errors as results, limit power.', trap: 'Returning raw exceptions or stack traces to the model, giving a tool broad write access, and chaining tools without limits. Keep error text short and safe, and put a person in the loop for irreversible actions.',
        pyCode: ['def dispatch(call, tools):', '    fn = tools.get(call["name"])', '    if fn is None:', '        return "error: unknown tool"', '    try:', '        return fn(**call["args"])', '    except TypeError as e:', '        return f"error: bad arguments ({e})"', '    except Exception:', '        log.exception("tool failed")', '        return "error: tool failed"'],
        cCode: ['int dispatch(call_t *c, char *out) {', '    struct tool *t = find(tools, c->name);', '    if (!t) return ERR_UNKNOWN;', '    if (!valid(t, c->args)) return ERR_ARGS;', '    return t->fn(c->args, out);', '}'],
        predict: { q: 'The model asks for a tool you never defined. What should the dispatcher do?', options: ['Try to run it anyway', 'Return an error result and do nothing else', 'Crash the program'], answer: 1, why: 'Refuse unknown names and tell the model, so it can choose a valid tool.' }, steps: safe },
    ],
    builtins: [
      ['tool schema', 'name, description and a JSON Schema for the arguments; good descriptions matter as much as code.'],
      ['dict of functions', 'The allow-list: {"get_order": get_order}.'],
      ['json.dumps(result)', 'Send results back as text.'],
      ['inspect.signature', 'Build a schema from a function, or check argument names.'],
      ['parallel tool calls', 'A reply can contain several calls; run them (asyncio) and return all results.'],
      ['tool_choice', 'Force or forbid tool use for a call.'],
    ],
  };
})();
