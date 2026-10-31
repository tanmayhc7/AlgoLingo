/* Lesson data: getting reliable structured output from a model (structure mode, Flow helper). */
(function () {
  var parse = Flow.steps([
    { pl: 0, cl: 0, say: 'Your code needs a ticket category and priority, not a paragraph. Ask the model for JSON in a stated shape and parse it. Models usually comply, but not always, so every reply goes through the same checks.', csay: 'char *reply = ask(model, prompt);', add: [['la', 'step', 0, 0], ['a', 'ask', 1, 0], ['b', 'extract', 2, 0], ['c', 'parse', 3, 0], ['d', 'validate', 4, 0], ['e', 'use', 5, 0]], tag: [['la', 'dim']] },
    { pl: 1, cl: 1, say: 'The reply is text. Sometimes it is clean JSON; sometimes it is wrapped in a markdown fence or preceded by "Here is the JSON:". Never assume the format.', csay: 'reply = "```json {...} ```";', tag: [['a', 'done']], ptr: [['at', 'a', 'down']] },
    { pl: 2, cl: 2, say: 'Extract: strip the code fence and whitespace, or take the text from the first { to the last }. Do this in one small function you can test.', csay: 'char *j = between_braces(reply);', tag: [['b', 'done']], ptr: [['at', 'b', 'down']] },
    { pl: 3, cl: 3, say: 'json.loads raises JSONDecodeError if the text is not valid JSON (truncated reply, trailing comment). That is an expected failure, not a crash.', csay: 'cJSON *o = cJSON_Parse(j);', tag: [['c', 'done']], ptr: [['at', 'c', 'down']] },
    { pl: 4, cl: 4, say: 'Valid JSON can still be wrong: a missing key, "priority": "urgent" when only low, medium, high exist. Check the shape and the allowed values.', csay: 'if (!valid(o)) goto retry;', tag: [['d', 'done']], ptr: [['at', 'd', 'down']] },
    { pl: 5, cl: 5, say: 'Only after validation does the rest of the program touch the data. The model\'s output is untrusted input, exactly like a form submitted by a stranger.', csay: 'use(o);', tag: [['e', 'done']], ptr: [['at', 'e', 'down']] },
  ]);
  var retry = Flow.steps([
    { pl: 0, cl: 0, say: 'When parsing or validation fails you can ask again. The useful trick: send the model its own bad answer and the exact error, so the second try is guided instead of a repeat.', csay: 'for (int i = 0; i < 3; i++) {', add: [['la', 'try', 0, 0], ['lb', 'result', 0, 1], ['a', '1', 1, 0], ['b', '2', 2, 0], ['c', '3', 3, 0]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 3, cl: 1, say: 'Try 1: the reply fails to parse (the output was cut off). Record the error text.', csay: 'o = parse(reply); if (!o) err = "invalid JSON";', add: [['x1', 'bad', 1, 1]], tag: [['a', 'bad'], ['x1', 'bad']], ptr: [['now', 'a', 'up']] },
    { pl: 6, cl: 2, say: 'Append two messages: the model\'s own reply, then "That was not valid JSON: <error>. Reply with only the JSON." Lower the temperature for retries.', csay: 'add_message("assistant", reply); add_message("user", err);', tag: [['b', 'cur']], ptr: [['now', 'b', 'up']] },
    { pl: 3, cl: 1, say: 'Try 2 parses, but validation fails: priority "urgent" is not allowed. A new error message goes back.', csay: 'if (!valid(o)) err = "priority must be low, medium or high";', add: [['x2', 'bad', 2, 1]], tag: [['b', 'bad'], ['x2', 'bad'], ['c', 'cur']], ptr: [['now', 'c', 'up']] },
    { pl: 5, cl: 4, say: 'Try 3 returns a valid object. Return it. Three tries is a typical cap.', csay: 'return o;', add: [['x3', 'ok', 3, 1]], tag: [['c', 'done'], ['x3', 'done']] },
    { pl: 8, cl: 6, say: 'If the cap is reached, raise an error the caller can handle (queue for a person, use a default). Count retries in your logs: a high rate means the prompt or the schema needs work. Many providers also offer a structured-output or JSON mode, which reduces but does not remove the need for validation.', csay: 'return NULL;  /* give up */', unptr: ['now'] },
  ], { y0: 80 });
  window.LESSON = {
    id: 'structured-output', mode: 'ds',
    title: 'Structured output: parse, validate, retry',
    lede: 'Programs need data, not prose, so you ask the model for JSON in a stated shape. Even then the reply may be fenced in markdown, truncated or have an invalid value, so treat it as untrusted input: extract the JSON, parse it, validate every field, and on failure retry with the error message appended so the model can fix its own mistake. Cap the number of tries and decide what happens when they run out. This loop is the difference between a demo and an integration that survives real traffic.',
    scenes: [
      { id: 'parse', title: 'Extract, parse, validate', blurb: 'Four small checks stand between the model\'s text and your program.', trap: 'json.loads on the raw reply: it fails on fenced or chatty output. Also trusting valid JSON: wrong keys or values still pass json.loads. Validate against the schema (see the validation lesson).',
        pyCode: ['import json, re', 'def extract(reply):', '    m = re.search(r"\\{.*\\}", reply, re.S)', '    return m.group(0) if m else reply', 'def parse_reply(reply):', '    data = json.loads(extract(reply))', '    ok, errs = validate(data)', '    if not ok:', '        raise ValueError("; ".join(errs))', '    return data'],
        cCode: ['char *j = between_braces(reply);', 'cJSON *o = cJSON_Parse(j);', 'if (!o) return ERR_JSON;', 'if (!valid(o)) return ERR_SCHEMA;', 'return OK;'],
        predict: { q: 'A reply is valid JSON but "priority" is "urgent", which is not allowed. What catches it?', options: ['json.loads', 'Your validation step', 'Nothing, it is fine'], answer: 1, why: 'json.loads checks syntax only; values must be checked by your own rules or a schema library.' }, steps: parse },
      { id: 'retry', title: 'Retry with the error', blurb: 'Show the model its own bad answer and what was wrong, within a small try limit.', trap: 'Retrying with the same prompt (same failure), retrying without a limit, and not logging retry rates. Include the specific error, and fall back to a safe default or human review when the cap is reached.',
        pyCode: ['def ask_structured(ask, prompt, tries=3):', '    messages = [{"role": "user", "content": prompt}]', '    for _ in range(tries):', '        reply = ask(messages)', '        try:', '            return parse_reply(reply)', '        except (ValueError, json.JSONDecodeError) as e:', '            messages.append({"role": "assistant", "content": reply})', '            messages.append({"role": "user", "content": f"Invalid: {e}. Reply with only the JSON."})', '    raise RuntimeError("no valid reply")'],
        cCode: ['for (int i = 0; i < 3; i++) {', '    o = parse(ask(messages));', '    if (o) break;', '    add_message("assistant", reply);', '    add_message("user", err);', '}', 'return o;  /* NULL if all tries failed */'],
        predict: { q: 'Why include the error message in the retry prompt?', options: ['It is polite', 'It tells the model what to fix, so the retry is guided', 'The API requires it'], answer: 1, why: 'A repeat of the same prompt tends to give the same failure; the error gives it something to correct.' }, steps: retry },
    ],
    builtins: [
      ['json.loads', 'Syntax only; raises JSONDecodeError.'],
      ['re.search(r"\\{.*\\}", s, re.S)', 'First { to last }: a quick extractor for wrapped JSON.'],
      ['str.removeprefix / strip("`")', 'Peel markdown fences.'],
      ['provider JSON / schema mode', 'Constrains output to a schema; still validate.'],
      ['pydantic.BaseModel.model_validate_json', 'Parse and validate in one call with clear errors.'],
      ['temperature=0', 'Reduces variation for extraction tasks.'],
    ],
  };
})();
