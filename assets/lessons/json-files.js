/* Lesson data: JSON and files (structure mode, Flow helper). */
(function () {
  var loads = Flow.steps([
    { pl: 0, cl: 0, say: 'JSON is text. A model reply, an API response and a dataset line are all strings until you parse them. Here the text is {"id": 7, "tags": ["a", "b"], "done": null}.', csay: 'const char *text = "{\\"id\\": 7, ...}";', add: [['hd', 'dict', 0, 0], ['k1', 'id', 1, 0], ['k2', 'tags', 2, 0], ['k3', 'done', 3, 0]], tag: [['hd', 'dim']] },
    { pl: 1, cl: 1, say: 'json.loads(text) parses it into ordinary Python objects: an object becomes a dict, so the three keys sit in a dict. Keys are always strings.', csay: 'cJSON *root = cJSON_Parse(text);', add: [['v1', '7', 1, 1], ['v2', 'list', 2, 1], ['v3', 'None', 3, 1]], tag: [['v1', 'done'], ['v2', 'done'], ['v3', 'done']], hot: ['v1', 'v2', 'v3'] },
    { pl: 1, cl: 2, say: 'The array became a list and its items are strings. Mapping: object to dict, array to list, string to str, number to int or float, true and false to True and False, null to None.', csay: 'cJSON *tags = cJSON_GetObjectItem(root, "tags");', add: [['e1', 'a', 2, 2], ['e2', 'b', 3, 2]], tag: [['e1', 'done'], ['e2', 'done']], note: [['v3', 'null'], ['v2', 'array']] },
    { pl: 2, cl: 3, say: 'Reading a key that may be missing: data.get("done") gives None instead of raising KeyError. Use data["id"] only when absence should be an error.', csay: 'cJSON *d = cJSON_GetObjectItem(root, "done");  /* NULL if absent */', hot: ['v3'], ptr: [['get', 'v3', 'down']] },
    { pl: 3, cl: 4, say: 'json.dumps(data) goes back to text. Tuples become arrays, and dict keys must be strings, so a dict with int keys comes back with string keys after a round trip.', csay: 'char *out = cJSON_PrintUnformatted(root);', unptr: ['get'], tag: [['hd', 'cur']] },
  ]);
  var jsonl = Flow.steps([
    { pl: 0, cl: 0, say: 'JSONL (JSON Lines) is one JSON object per line. It is the usual dataset format: you can stream it line by line and one bad line does not ruin the file. Four lines here, one of them corrupt.', csay: 'FILE *f = fopen(path, "r");', add: [['L0', 'line1', 1, 0], ['L1', 'line2', 2, 0], ['L2', 'line3', 3, 0], ['L3', 'line4', 4, 0], ['la', 'file', 0, 0], ['lb', 'rows', 0, 1]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 3, cl: 3, say: 'Open with a context manager so the file closes even on an error, then loop over the file object: it yields one line at a time without loading everything.', csay: 'while (fgets(buf, sizeof buf, f)) {', ptr: [['line', 'L0', 'up']] },
    { pl: 5, cl: 5, say: 'json.loads(line1) works, so append the dict to rows.', csay: 'cJSON *o = cJSON_Parse(buf);', add: [['R0', 'd1', 1, 1]], tag: [['L0', 'done'], ['R0', 'done']], hot: ['R0'] },
    { pl: 5, cl: 5, say: 'Same for line2.', csay: 'cJSON *o = cJSON_Parse(buf);', add: [['R1', 'd2', 2, 1]], tag: [['L1', 'done'], ['R1', 'done']], ptr: [['line', 'L1', 'up']] },
    { pl: 6, cl: 6, say: 'line3 is truncated. json.loads raises JSONDecodeError. Catch exactly that, count it and keep going: one bad record must not stop a million-line job.', csay: 'if (!o) { bad++; continue; }', tag: [['L2', 'bad']], ptr: [['line', 'L2', 'up']], note: [['L2', 'bad']] },
    { pl: 5, cl: 5, say: 'line4 parses.', csay: 'rows[n++] = o;', add: [['R2', 'd4', 3, 1]], tag: [['L3', 'done'], ['R2', 'done']], ptr: [['line', 'L3', 'up']] },
    { pl: 8, cl: 8, say: 'Result: 3 rows and 1 bad line to report. Always log how many lines were skipped; silently dropping data is how pipelines go wrong.', csay: 'printf("%d rows, %d bad\\n", n, bad);', unptr: ['line'] },
  ], { y0: 80 });
  window.LESSON = {
    id: 'json-files', mode: 'ds',
    title: 'JSON and files',
    lede: 'Almost every AI integration moves data as JSON: API requests and responses, model output, config and datasets. json.loads and json.dumps convert between text and plain Python dicts and lists; pathlib and the with statement read and write the files that hold it; JSONL stores one record per line so large files can be streamed. In C you would reach for a library such as cJSON and manage the memory of every parsed value yourself; Python just gives you dicts.',
    scenes: [
      { id: 'loads', title: 'Parsing and writing JSON', blurb: 'json.loads turns text into dict, list, str, number, bool and None; json.dumps goes back.', trap: 'Treating parsed JSON as trusted: keys can be missing, values can be null or the wrong type. Use .get with a default, or validate (see the validation lesson). Also json.loads wants str or bytes, not a file; use json.load(f) for files.',
        pyCode: ['import json', 'data = json.loads(text)', 'done = data.get("done")', 'out = json.dumps(data, indent=2)'],
        cCode: ['/* using the cJSON library */', 'cJSON *root = cJSON_Parse(text);', 'cJSON *tags = cJSON_GetObjectItem(root, "tags");', 'cJSON *d = cJSON_GetObjectItem(root, "done");', 'char *out = cJSON_PrintUnformatted(root);'],
        predict: { q: 'What does json.loads("null") return in Python?', options: ['"null"', 'None', 'It raises an error'], answer: 1, why: 'JSON null maps to None. A bare top-level value such as null, 7 or "x" is valid JSON.' }, steps: loads },
      { id: 'jsonl', title: 'Reading a JSONL file safely', blurb: 'Stream one line at a time, catch the parse error per line, and count what you skipped.', trap: 'Wrapping the whole loop in one try/except: the first bad line then ends the job. Catch json.JSONDecodeError inside the loop, around the single line. Also skip blank lines, and open files with encoding="utf-8" explicitly.',
        pyCode: ['import json', 'rows, bad = [], 0', 'with open(path, encoding="utf-8") as f:', '    for line in f:', '        try:', '            rows.append(json.loads(line))', '        except json.JSONDecodeError:', '            bad += 1', 'print(len(rows), bad)'],
        cCode: ['FILE *f = fopen(path, "r");', 'char buf[65536]; int n = 0, bad = 0;', 'while (fgets(buf, sizeof buf, f)) {', '    cJSON *o = cJSON_Parse(buf);', '    if (!o) { bad++; continue; }', '    rows[n++] = o;', '}', 'fclose(f);', 'printf("%d rows, %d bad\\n", n, bad);'],
        predict: { q: 'Why is JSONL better than one big JSON array for a large dataset?', options: ['It compresses better', 'You can stream it line by line and a bad record only affects its own line', 'It allows comments'], answer: 1, why: 'Each line is an independent document, so you never need the whole file in memory and errors stay local.' }, steps: jsonl },
    ],
    builtins: [
      ['json.loads / json.dumps', 'Text to Python objects and back. dumps(indent=2) pretty-prints; ensure_ascii=False keeps non-ASCII text readable.'],
      ['json.load / json.dump', 'Same, but read from and write to a file object.'],
      ['pathlib.Path(p).read_text()', 'Read a whole small file; write_text writes one. Path also joins with the / operator.'],
      ['with open(p, encoding="utf-8") as f', 'Closes the file for you, even on an exception.'],
      ['dict.get(key, default)', 'Safe lookup that never raises KeyError.'],
      ['json.JSONDecodeError', 'The error for malformed JSON; subclass of ValueError.'],
    ],
  };
})();
