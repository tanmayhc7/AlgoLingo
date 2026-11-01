# AlgoLingo design principles and working rules

Read this first when continuing the project. It records the decisions made so far so they do not have to be restated. For project status and file map see HANDOFF.md (kept locally and in the Claude Project, not in the repo); for the topic plan see CURRICULUM.md.

## 1. Product

- **What it is:** a static site that teaches Python and data structures and algorithms to someone who already thinks in C (T, about 6 years as an SDE). Name: **AlgoLingo** (capital L). Repo https://github.com/tanmayhc7/AlgoLingo, live at https://tanmayhc7.github.io/AlgoLingo/. Licence AGPL-3.0.
- **Core idea:** the same program runs in Python and in C side by side, with a picture that steps through it. Python is a tag pointing at an object; C is a box holding a value. Each lesson shows where the two differ.
- **Audience tone:** peer to a working engineer. No hand-holding, no hype, no emoji. Explain the trap, then the idiom.
- **Scope rules:** no build step (plain HTML, CSS, JS), no backend, progress lives in localStorage only. Quizzes run Python in the browser with Pyodide.
- **Home page:** phases as cards; a phase opens to its chapters. The LeetCode Visualizer card appears only on the home page, never inside a phase view.

## 2. Visual principles

- Keep the existing look: indigo (Python) and teal (C) panels, yellow accent, light and dark themes both designed, not inverted. Do not redesign the background or layout unless asked; the logo was redesigned on request only.
- Every colour comes from a token in assets/style.css. Check dark mode for any new component (the Q&A cards once rendered white-on-white in dark mode).
- Status colours: yellow = in progress, green = done, red = bad or error. Yellow chapter badge `n / total` turns green when the chapter quiz is fully answered.
- Pictures use the shared stage: cells are 64x44, the stage is 1000 wide, and content centres must stay at or above y of about 176 because the control dock covers the lower part. Check every new scene in a screenshot at the shipped size.
- Motion is purposeful (steps, tags, pointer chips). Respect reduced motion. The algorithm player offers 0.25x, 0.5x, 1x, 2x and 4x.
- Copy: short sentences, concrete numbers, say what changes at each step and why. No marketing words.

## 3. Lesson structure (every lesson)

1. **Lede:** what it is, why it matters, how it relates to C.
2. **Scenes:** each has a title, blurb, a **trap** note (the mistake C programmers make), Python code, C code, a **predict** question (3 options, one correct, with a `why`), and the stepped picture.
3. **Built-ins table** (`builtins`): the Python names and idioms used, one line each.
4. **Interview depth** (`assets/depth/<id>.js`): thesis, why it matters, edge cases, cost, internals, and a Q&A at junior, mid and senior level with follow-ups.
5. **Chapter quiz** covering all lessons in the chapter.

Two lesson modes:
- **ds mode** (`mode: 'ds'`, structure pictures): scene has `steps[]`, each `{pl, cl, say, csay, h, ds:[ops]}`. Ops: node, mv, lab, rm, note, edge, unedge, etag, euntag, ptr, unptr, tag, untag, hot. Forgetting `mode: 'ds'` renders an empty stage.
- **algo mode** (`mode: 'algo'`, bars that move, assets/algo.js): scene gives `input`, `keys`, `run(T)` using `T.frame`, `T.swap`, `T.v`, `T.range`. Use for sorting and array sweeps.

## 4. Content conventions

- Chapters live in `assets/chapters.js`. Quiz files and progress keys (`dsav-quiz-N`, `dsav-qdone-N`) are keyed by chapter number, so **never insert a chapter mid-list**; add new lessons to the right existing chapter or append a new chapter at the end. Phases are index ranges (`PHASES`), so a new chapter at the end must also extend the last phase.
- A lesson counts as completed when every question of its chapter quiz has been answered. Changing a quiz's question set resets that chapter's completion; say so when it happens.
- Quiz question types: `mcq`, `complete` (fill the `___` blanks), `write`, `debug`. Tests are `{expr, want}` where `want` is evaluated as a Python expression (so avoid `inf`). Rules: debug starters must FAIL the tests; complete and write starters must not pass; the model solution must score full marks.
- Phase 1 holds Python foundations (including bit manipulation in chapter 2), Phase 2 core data structures, Phase 3 graphs, DP and analysis, Phase 4 object-oriented design, Phase 5 algorithms in motion (chapters 19 to 21, incl. prefix sums, Kadane, greedy intervals), Phase 6 advanced algorithms (22 to 27, incl. Fenwick and segment trees), Phase 7 Python for applied AI (28 to 31) Phase 8 Building with models (32 to 34) Phase 9 Advanced concepts (35 to 37) and Phase 10 Number theory (38). Phases 7 and 8 lessons are flow diagrams built with `assets/flow.js` (load it before the lesson script) and show a C analogue.
- Known gaps still to add: number theory (sieve, gcd, modular exponentiation), graph extras (bipartite, cycle detection, SCC, bridges), grid flood-fill, randomised algorithms.
- LeetCode Visualizer lives in this repo under `leetcode/` (one repo, one deploy, shared `assets/`); never split it into its own repo. Placeholder card and page wait for T's documentation; plan in LEETCODE_PLAN.md. Explanation docs for LeetCode problems are named `<problem_name>_explained.md`.

## 5. Per-lesson workflow

1. Write `assets/lessons/<id>.js`.
2. Add `{ id, title }` to the chapter in `assets/chapters.js`.
3. Generate the page (copy of lessons/loops.html, pointing at the new id; algo pages also load algo.js).
4. Write `assets/depth/<id>.js` and hook it into the page.
5. Extend or create the chapter quiz and its html.
6. Test: lesson scenes load with no errors, quiz solutions score full marks and starters fail, then screenshot the riskiest steps (stage, light and dark).
7. Update README, CURRICULUM and HANDOFF counts; re-save HANDOFF to the Project.
8. Commit and push.

## 6. Git and delivery rules

- Branch `main`; push triggers GitHub Pages. Origin is `https://github.com/tanmayhc7/AlgoLingo.git`.
- Every commit ends with:
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01WDxfrSuPgUGbz6hnBqGR9m` (use the current session's link).
- Docs that must stay in sync: README.md (counts, phase list), CURRICULUM.md, HANDOFF.md. Save HANDOFF.md and this file to the Project when they change.

## 7. How T likes to work

- Give the change, not a lecture. One-line summary, then what to check.
- Do exactly the scoped change: when told "only the logo" or "only on the home page", touch nothing else.
- When something is missing from a topic list, add it to the earliest sensible phase rather than only reporting it, and list the remaining gaps.
- Ask only when the choice cannot be reversed or a wrong guess is expensive.

## Chapter key takeaways and notes
- `assets/notes.js` holds `window.CHAPTER_NOTES[chapter]` (4 or 5 short points). Quiz pages load it before `quiz.js` and have a `<div id="chapter-notes">` after the questions.
- The "Key takeaways" panel stays locked until every quiz question has been attempted (same rule as `dsav-qdone-N`). Then it shows the points and a personal notes textarea (limit `NOTE_MAX` = 1000 characters in quiz.js), saved in localStorage as `dsav-notes-N`.
- New chapter checklist: add its entry to `assets/notes.js`.
