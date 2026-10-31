/* Lesson data: evaluating a model-based feature (structure mode, Flow helper). */
(function () {
  var score = Flow.steps([
    { pl: 0, cl: 0, say: 'A prompt that works on three examples proves little. An evaluation is a fixed set of test cases with known answers that you run every time you change the prompt, model or code. Six tickets with their correct category here.', csay: 'struct case cases[6];', add: [['la', 'case', 0, 0], ['lb', 'want', 0, 1], ['lc', 'got', 0, 2], ['c1', '1', 1, 0], ['c2', '2', 2, 0], ['c3', '3', 3, 0], ['c4', '4', 4, 0], ['c5', '5', 5, 0], ['c6', '6', 6, 0], ['w1', 'bill', 1, 1], ['w2', 'bug', 2, 1], ['w3', 'bill', 3, 1], ['w4', 'how', 4, 1], ['w5', 'bug', 5, 1], ['w6', 'bill', 6, 1]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 2, cl: 2, say: 'Run the feature on each case and record what it returned. Cases 1 and 2 match.', csay: 'got[i] = classify(cases[i].text);', add: [['g1', 'bill', 1, 2], ['g2', 'bug', 2, 2]], tag: [['g1', 'done'], ['g2', 'done']] },
    { pl: 3, cl: 3, say: 'Case 3 returns "how" instead of "bill": a miss. Keep every miss so you can read it; the failures are where the improvement is.', csay: 'if (strcmp(got[i], want[i])) misses[m++] = i;', add: [['g3', 'how', 3, 2]], tag: [['g3', 'bad'], ['c3', 'bad']] },
    { pl: 2, cl: 2, say: 'Cases 4, 5 and 6: how, bug and bill. All correct.', csay: 'got[i] = classify(cases[i].text);', add: [['g4', 'how', 4, 2], ['g5', 'bug', 5, 2], ['g6', 'bill', 6, 2]], tag: [['g4', 'done'], ['g5', 'done'], ['g6', 'done']] },
    { pl: 5, cl: 5, say: 'Accuracy = 5 correct out of 6 = 0.83. A single number lets you compare versions, but the list of misses tells you what to fix.', csay: 'return correct / (double)n;', hot: ['c3', 'g3'] },
    { pl: 6, cl: 6, say: 'Good eval sets include the awkward cases (empty text, other languages, very long input, near-duplicates of real customer tickets), are kept out of the prompt examples, and grow whenever production finds a new failure.', csay: '/* grow the set from real failures */' },
  ]);
  var cmp = Flow.steps([
    { pl: 0, cl: 0, say: 'You rewrite the prompt (v2) and want to know whether it is better. Run both versions on the same cases and compare case by case, not just the totals.', csay: 'for (int i = 0; i < n; i++) { a = run(v1, i); b = run(v2, i); }', add: [['la', 'v1', 0, 0], ['lb', 'v2', 0, 1], ['lc', 'change', 0, 2], ['c1', '1', 1, 0], ['c2', '2', 2, 0], ['c3', '3', 3, 0], ['c4', '4', 4, 0], ['c5', '5', 5, 0], ['c6', '6', 6, 0]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 1, cl: 1, say: 'v1 got cases 1, 2, 4, 5 and 6 right and missed 3: 5 of 6.', csay: 'score1 = 5;', add: [['a1', 'ok', 1, 0], ['a2', 'ok', 2, 0], ['a3', 'no', 3, 0], ['a4', 'ok', 4, 0], ['a5', 'ok', 5, 0], ['a6', 'ok', 6, 0]], tag: [['a1', 'done'], ['a2', 'done'], ['a3', 'bad'], ['a4', 'done'], ['a5', 'done'], ['a6', 'done']] },
    { pl: 2, cl: 2, say: 'v2 fixes case 3 but also fails case 5. Also 5 of 6! The totals are identical, yet one case improved and one regressed.', csay: 'score2 = 5;', add: [['b1', 'ok', 1, 1], ['b2', 'ok', 2, 1], ['b3', 'ok', 3, 1], ['b4', 'ok', 4, 1], ['b5', 'no', 5, 1], ['b6', 'ok', 6, 1]], tag: [['b1', 'done'], ['b2', 'done'], ['b3', 'done'], ['b4', 'done'], ['b5', 'bad'], ['b6', 'done']] },
    { pl: 3, cl: 3, say: 'The change row marks what moved: case 3 fixed (+), case 5 broken (-). A regression in a case that used to pass matters more than the net score, because customers notice what used to work.', csay: 'if (!a && b) fixed++; if (a && !b) broken++;', add: [['d3', '+', 3, 2], ['d5', '-', 5, 2]], tag: [['d3', 'done'], ['d5', 'bad']], hot: ['d3', 'd5'] },
    { pl: 5, cl: 5, say: 'Decide with evidence: read the two changed cases, then fix the prompt again or accept the trade if the fixed case matters more. Small sets are noisy, so repeat runs for non-deterministic output and grow the set before trusting a tiny difference.', csay: 'report(fixed, broken);' },
    { pl: 6, cl: 6, say: 'Beyond exact match: for free-text answers use a rubric or another model as judge, and spot-check the judge against human labels. Track latency and cost per version too, since a slightly better answer that costs five times as much may not be better.', csay: '/* score, latency, cost */' },
  ]);
  window.LESSON = {
    id: 'evals', mode: 'ds',
    title: 'Evaluating a model-based feature',
    lede: 'Model output varies, so "it looked fine" does not survive contact with real customers. An evaluation is a fixed set of cases with known good answers that you run on every change, scoring accuracy (or a rubric for free text) and listing the misses. Comparing two versions case by case shows what you fixed and what you broke. It is the same discipline as unit tests, applied to a component that is probabilistic, and it is how you can say "this change is better" with evidence instead of a feeling.',
    scenes: [
      { id: 'score', title: 'A golden set and a score', blurb: 'Run every case, compare with the expected answer, keep the misses.', trap: 'Evaluating on the same examples you put in the prompt, using too few cases, and trusting one number. Always read the failures, and keep a held-out set you do not tune on.',
        pyCode: ['def evaluate(classify, cases):', '    correct, misses = 0, []', '    for text, want in cases:', '        got = classify(text)', '        if got == want: correct += 1', '        else: misses.append((text, want, got))', '    return correct / len(cases), misses'],
        cCode: ['int correct = 0, m = 0;', 'for (int i = 0; i < n; i++) {', '    const char *got = classify(cases[i].text);', '    if (!strcmp(got, cases[i].want)) correct++;', '    else misses[m++] = i;', '}', 'return correct / (double)n;'],
        predict: { q: 'A classifier gets 5 of 6 cases right. What is its accuracy?', options: ['0.5', '0.83', '5'], answer: 1, why: '5 / 6 is about 0.83.' }, steps: score },
      { id: 'cmp', title: 'Comparing two versions', blurb: 'Same cases, two prompts: look at which cases improved and which regressed.', trap: 'Comparing totals only (equal totals can hide a fix and a regression), changing several things at once, and calling a one-case difference a win when the output is non-deterministic. Change one thing at a time and re-run.',
        pyCode: ['def compare(run_a, run_b, cases):', '    fixed, broken = [], []', '    for text, want in cases:', '        a, b = run_a(text) == want, run_b(text) == want', '        if b and not a: fixed.append(text)', '        if a and not b: broken.append(text)', '    return fixed, broken'],
        cCode: ['for (int i = 0; i < n; i++) {', '    int a = !strcmp(run(v1, i), cases[i].want);', '    int b = !strcmp(run(v2, i), cases[i].want);', '    if (!a && b) fixed++;', '    if (a && !b) broken++;', '}', 'report(fixed, broken);'],
        predict: { q: 'Two versions both score 5 of 6. Are they equally good?', options: ['Yes, the score is the same', 'Not necessarily: they may fail different cases', 'The newer one is always better'], answer: 1, why: 'Equal totals can hide one improvement and one regression; compare per case.' }, steps: cmp },
    ],
    builtins: [
      ['list of (input, expected) pairs', 'The golden set; store it in a JSONL file in the repo.'],
      ['collections.Counter', 'Count outcomes and confusion pairs (expected vs got).'],
      ['statistics.mean', 'Average a score over cases or over repeated runs.'],
      ['LLM as judge', 'Another model scores free-text answers against a rubric; check it against human labels.'],
      ['pytest.mark.parametrize', 'Turn each case into a test that can fail in CI.'],
      ['latency and cost columns', 'Record time and tokens per case next to the score.'],
    ],
  };
})();
