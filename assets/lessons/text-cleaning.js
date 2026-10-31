/* Lesson data: regex, cleaning and chunking text (structure mode, Flow helper). Underscore stands for a space. */
(function () {
  var clean = Flow.steps([
    { pl: 0, cl: 0, say: 'Text from documents, emails and web pages is messy. Underscores here stand for spaces. The raw string is "_Hi__Yo_": a leading space, two spaces between words and a trailing one.', csay: 'char s[] = " Hi  Yo ";', add: [['la', 'raw', 0, 0], ['r0', '_', 1, 0], ['r1', 'H', 2, 0], ['r2', 'i', 3, 0], ['r3', '_', 4, 0], ['r4', '_', 5, 0], ['r5', 'Y', 6, 0], ['r6', 'o', 7, 0]], tag: [['la', 'dim'], ['r0', 'bad'], ['r3', 'bad'], ['r4', 'bad']] },
    { pl: 1, cl: 1, say: 're.sub(r"\\s+", " ", s) replaces every run of whitespace (spaces, tabs, newlines) with one space. The double space collapses to a single one.', csay: 'collapse_spaces(s);  /* your own loop */', add: [['lb', 'sub', 0, 1], ['b0', '_', 1, 1], ['b1', 'H', 2, 1], ['b2', 'i', 3, 1], ['b3', '_', 4, 1], ['b4', 'Y', 5, 1], ['b5', 'o', 6, 1]], tag: [['lb', 'dim'], ['b3', 'done']], hot: ['r3', 'r4', 'b3'] },
    { pl: 2, cl: 2, say: '.strip() removes the leading and trailing space. Order matters: collapse first or strip first both work here, but strip last is a safe habit.', csay: 'trim(s);', add: [['lc', 'strip', 0, 2], ['c0', 'H', 1, 2], ['c1', 'i', 2, 2], ['c2', '_', 3, 2], ['c3', 'Y', 4, 2], ['c4', 'o', 5, 2]], tag: [['lc', 'dim'], ['b0', 'bad'], ['c2', 'done']] },
    { pl: 3, cl: 3, say: '.lower() or .casefold() makes comparisons case-insensitive. Result: "hi yo". Four small steps, each doing one thing, are easier to test than one clever regex.', csay: 'for (char *p = s; *p; p++) *p = tolower(*p);', add: [['ld', 'lower', 0, 3], ['d0', 'h', 1, 3], ['d1', 'i', 2, 3], ['d2', '_', 3, 3], ['d3', 'y', 4, 3], ['d4', 'o', 5, 3]], tag: [['ld', 'dim'], ['d0', 'done'], ['d1', 'done'], ['d2', 'done'], ['d3', 'done'], ['d4', 'done']] },
  ]);
  var words = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'];
  var chunk = Flow.steps([
    { pl: 0, cl: 0, say: 'A model can only read a limited amount of text, and retrieval works better on focused passages, so long documents are cut into chunks. Eight words here; chunk size 4 with an overlap of 1 word.', csay: 'int size = 4, overlap = 1, step = size - overlap;', add: [['lw', 'words', 0, 0]].concat(words.map(function (w, i) { return ['w' + i, w, i + 1, 0]; })), tag: [['lw', 'dim']] },
    { pl: 1, cl: 1, say: 'The window moves forward by step = size - overlap = 3 words, so neighbouring chunks share one word and a sentence cut at a boundary still appears whole in one of them.', csay: 'for (int i = 0; i < n; i += step) {', add: [['lc', 'chunks', 0, 1]], tag: [['lc', 'dim']] },
    { pl: 2, cl: 2, say: 'Chunk 1 is words 1 to 4.', csay: 'copy(words + 0, 4);', add: [['c0', 'c1', 1, 1]], tag: [['w0', 'done'], ['w1', 'done'], ['w2', 'done'], ['w3', 'done'], ['c0', 'done']] },
    { pl: 2, cl: 2, say: 'Chunk 2 starts at index 3, so w4 appears in both chunks (the overlap) and then w5, w6 and w7 are new.', csay: 'copy(words + 3, 4);', add: [['c1', 'c2', 4, 1]], tag: [['w3', 'cur'], ['w4', 'cur'], ['w5', 'cur'], ['w6', 'cur'], ['c1', 'cur']] },
    { pl: 2, cl: 2, say: 'Chunk 3 starts at index 6 and is short, only w7 and w8. The last chunk is often shorter; decide whether to keep it.', csay: 'copy(words + 6, 2);', add: [['c2', 'c3', 7, 1]], tag: [['w6', 'hot'], ['w7', 'hot'], ['c2', 'hot']] },
    { pl: 4, cl: 5, say: 'Real systems chunk by tokens or by paragraphs and sentences instead of words, but the loop is the same: slice, advance by size minus overlap, stop when the end is reached.', csay: 'return count;' },
  ], { x0: 80, dx: 104 });
  window.LESSON = {
    id: 'text-cleaning', mode: 'ds',
    title: 'Regex, cleaning and chunking text',
    lede: 'Real text is dirty and long. Regular expressions find and replace patterns, a handful of string methods normalise whitespace and case, and chunking cuts a long document into overlapping pieces that fit in a model prompt or a search index. These are small functions, and they sit in front of almost every language-model pipeline. C gives you strtok and manual loops; Python gives you re and slicing.',
    scenes: [
      { id: 'clean', title: 'Cleaning whitespace and case', blurb: 'Collapse runs of whitespace, strip the ends, lowercase. One small step at a time.', trap: 'Using one giant regex for everything. Small named steps are easier to read and test. Also compile patterns you reuse in a loop (re.compile), and use raw strings (r"...") so backslashes reach the regex engine.',
        pyCode: ['import re', 's = re.sub(r"\\s+", " ", s)', 's = s.strip()', 's = s.lower()'],
        cCode: ['char s[] = " Hi  Yo ";', 'collapse_spaces(s);', 'trim(s);', 'for (char *p = s; *p; p++) *p = tolower((unsigned char)*p);'],
        predict: { q: 'What does re.sub(r"\\s+", " ", "a \\t\\n b") return?', options: ['"a b"', '"a  b"', '"a \\t\\n b"'], answer: 0, why: 'The whole run of space, tab and newline is one whitespace match and becomes one space.' }, steps: clean },
      { id: 'chunk', title: 'Chunking with overlap', blurb: 'Slice a long sequence into windows of a fixed size that share a few items.', trap: 'An infinite loop when overlap >= size (step becomes 0 or negative). Validate it. Also the final chunk is often short, and character counts are not token counts: a model limit is in tokens.',
        pyCode: ['def chunk(items, size, overlap):', '    step = size - overlap', '    out = []', '    for i in range(0, len(items), step):', '        out.append(items[i:i + size])', '    return out'],
        cCode: ['int size = 4, overlap = 1, step = size - overlap;', 'for (int i = 0; i < n; i += step) {', '    copy(words + i, min(size, n - i));', '    count++;', '}', 'return count;'],
        predict: { q: 'With size 4 and overlap 1, at which indexes do the chunks start (8 items)?', options: ['0, 4', '0, 3, 6', '0, 1, 2, 3, 4'], answer: 1, why: 'The window advances by size - overlap = 3 each time.' }, steps: chunk },
    ],
    builtins: [
      ['re.sub(pattern, repl, s)', 'Replace every match. Use raw strings for patterns.'],
      ['re.findall / re.search / re.fullmatch', 'All matches, first match, or must match the whole string.'],
      ['re.compile(p)', 'Build the pattern once if used many times.'],
      ['str.strip / lower / casefold / split', 'The small methods that do most of the cleaning.'],
      ['s.split()', 'With no argument splits on any run of whitespace and drops empty strings.'],
      ['textwrap, unicodedata.normalize', 'Standard-library helpers for wrapping and normalising Unicode text.'],
    ],
  };
})();
