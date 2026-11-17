#!/usr/bin/env python3
"""Regenerate algolingo_progress.json from the course outline (assets/chapters.js) and the
LeetCode problem list (assets/leetcode.js). Existing "done", "date", "correct", "total", notes and
log entries in the file are kept, so it is safe to run after adding lessons or problems.

    python3 scripts/make-progress.py
"""
import json, os, re, datetime

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(root, 'algolingo_progress.json')
old = {}
if os.path.exists(path):
    old = json.load(open(path, encoding='utf8'))

ch = open(os.path.join(root, 'assets/chapters.js'), encoding='utf8').read()
lc = open(os.path.join(root, 'assets/leetcode.js'), encoding='utf8').read()

out = {
    'app': 'AlgoLingo',
    'version': 1,
    'updated': datetime.date.today().isoformat(),
    'instructions': 'To mark something done, set its "done" to true and add "date" (YYYY-MM-DD). Keep the ids and keys as they are. Add free notes to "log". Full format: PROGRESS.md.',
    'lessons': {}, 'quizzes': {}, 'problems': {}, 'notes': old.get('notes', {}), 'log': old.get('log', []),
}

blocks = re.split(r"\n    \{\n      title:", ch)[1:]
for i, b in enumerate(blocks, 1):
    title = re.match(r"\s*'((?:[^'\\]|\\.)*)'", b).group(1).replace("\\'", "'")
    q = old.get('quizzes', {}).get(str(i), {})
    entry = {'title': title, 'done': bool(q.get('done', False))}
    for k in ('correct', 'total', 'date'):
        if k in q:
            entry[k] = q[k]
    out['quizzes'][str(i)] = entry
    for m in re.finditer(r"\{ id: '([^']+)', title: '((?:[^'\\]|\\.)*)'(?:, href: '[^']+')?", b):
        if 'href:' not in m.group(0):
            continue
        lid = m.group(1)
        o = old.get('lessons', {}).get(lid, {})
        e = {'chapter': i, 'title': m.group(2).replace("\\'", "'"), 'done': bool(o.get('done', False))}
        if 'date' in o:
            e['date'] = o['date']
        out['lessons'][lid] = e

for m in re.finditer(r"\{ id: '(lc-[^']+)', slug: '[^']+', num: (\d+), list: \d+, title: '((?:[^'\\]|\\.)*)', diff: '(\w+)', pattern: '([^']+)'", lc):
    pid = m.group(1)
    o = old.get('problems', {}).get(pid, {})
    e = {'number': int(m.group(2)), 'title': m.group(3).replace("\\'", "'"), 'difficulty': m.group(4), 'pattern': m.group(5), 'done': bool(o.get('done', False))}
    if 'date' in o:
        e['date'] = o['date']
    out['problems'][pid] = e

json.dump(out, open(path, 'w', encoding='utf8'), indent=2, ensure_ascii=False)
open(path, 'a').write('\n')
print(len(out['lessons']), 'lessons,', len(out['quizzes']), 'quizzes,', len(out['problems']), 'problems ->', path)
