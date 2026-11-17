# Progress file: `algolingo_progress.json`

AlgoLingo saves progress in the browser. This file is the same progress as plain JSON, so it can live in the repo, be read and edited by a person or an LLM, and be moved between devices.

## How it moves

- **Browser to file:** open `progress.html`, press **Download**, save the result as `algolingo_progress.json` at the top of the repo.
- **File to browser:** every page fetches `algolingo_progress.json` from the site and adds anything marked `"done": true`. It reloads once per tab session if something new was added.
- **Import by hand:** `progress.html` also imports a file from disk. *Merge* only adds. *Replace* makes the device match the file exactly (use it to un-tick things).
- **Rule:** a file on the site can only add progress. It never removes any, so a stale copy cannot wipe what you did.

## Format (version 1)

```json
{
  "app": "AlgoLingo",
  "version": 1,
  "updated": "2026-11-17",
  "lessons":  { "variables": { "chapter": 1, "title": "Variables and names", "done": true, "date": "2026-11-12" } },
  "quizzes":  { "1": { "title": "Getting started", "done": true, "correct": 5, "total": 6, "date": "2026-11-12" } },
  "problems": { "lc-two-sum": { "number": 1, "title": "Two Sum", "difficulty": "Easy", "pattern": "arrays-hashing", "done": true, "date": "2026-11-14" } },
  "notes":    { "1": "my own notes for chapter 1" },
  "log":      [ { "date": "2026-11-17", "note": "Finished heaps, started graphs" } ]
}
```

- `lessons` is keyed by lesson id (the file name in `lessons/`). `quizzes` is keyed by chapter number. `problems` is keyed by LeetCode id (`lc-<slug>`).
- To mark something finished, set `"done": true` and add `"date"` (`YYYY-MM-DD`). Do not rename keys or ids.
- A chapter counts as finished on the site when its quiz is done, so marking a quiz done also ticks every lesson in that chapter.
- `correct` and `total` on a quiz are optional. If both are given, the quiz page shows that score.
- `title`, `chapter`, `number`, `difficulty` and `pattern` are there so a person or LLM can match entries to a checklist. The site ignores them.
- `notes` and `log` are free text. `log` is for the day-to-day: the site keeps it but does not show it yet.

## For an LLM

1. Read `algolingo_progress.json` and the checklist you are working from.
2. For each item that is finished, find the entry by id or title and set `"done": true` and `"date"`.
3. Leave everything else exactly as it is. Add a line to `log` if useful, and set `updated` to today.
4. Commit the file. The site picks it up on the next load.

## Regenerating the list

After adding lessons or LeetCode problems, run `python3 scripts/make-progress.py`. It rebuilds the lists from `assets/chapters.js` and `assets/leetcode.js` and keeps every existing `done`, `date`, score, note and log entry.
