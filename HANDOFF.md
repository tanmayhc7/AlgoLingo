# Algolingo: handoff

Where the project stands, so any session can continue it. Last updated 2026-10-30 (Phases 1 to 5 built).

## What it is
An interactive static site that teaches Python, then DSA, to a C programmer. Each lesson runs the same program in Python and C side by side, one step at a time, with memory pictures (dummy addresses), a caption per step, a predict-then-check question and a table of built-ins. Each chapter ends with a quiz (multiple choice, write, complete, debug).

## Where things live
- GitHub: https://github.com/tanmayhc7/AlgoLingo (branch main). Live site: https://tanmayhc7.github.io/AlgoLingo/ once GitHub Pages is switched on (Settings, Pages, main, root).
- Cloud working copy: `/home/claude/dsa-visualizer` in the Claude session; push to origin from there.
- Mac folder: `~/Desktop/dsa-visualizer` (older; `git pull` from GitHub to refresh).
- The phone-only hosted copy is out of date and no longer maintained. Use the GitHub Pages link.
- Figma file "DSA Visualizer": Home and Lesson frames. The lesson v2 is still to do after the Starter plan call limit resets.

## Built so far (Phases 1 to 5)
Summary: 26 chapters, 65 lessons, 26 quizzes. Phase 1 chapters 1-7 (22 lessons), Phase 2 chapters 8-11, Phase 3 chapters 12-15, Phase 4 chapters 16-18, Phase 5 chapters 19-21, Phase 6 chapters 22-26. Details of Phase 1 follow; later phases are described in the sections below.

### Phase 1
22 lessons in 7 chapters: 1 Getting started (compiled vs interpreted, running Python, variables), 2 Basic types (numbers, strings), 3 Control flow (conditions, loops, errors), 4 Functions and shorthands (functions, shorthands, comprehensions), 5 Memory and arrays (array memory, lists, tuples), 6 Hashing (hashing, dicts, sets), 7 Toolbox (sorting helpers, collections, choosing a container, patterns, survival kit). Seven chapter quizzes, 5 to 7 questions each.
Interview depth: every lesson has `assets/depth/<id>.js` (`window.DEPTH` = thesis, why[], edges[], cost[], internals[], qa[] with lvl mid/senior/staff and follow-ups) loaded by a script tag before engine.js and rendered by `renderDepth` before the outline. Use the same schema for all new lessons.
Regression run on 2026-10-30: all 73 scenes step forward cleanly at desktop and phone width with no console errors and no horizontal overflow; all quizzes pass with their reference solutions.

## How it is built
- Plain HTML, CSS, JS. No build step. Open `index.html`.
- `assets/chapters.js`: course outline. Add `href` to a lesson and `quiz` to a chapter when the page exists.
- `assets/engine.js`: step engine. Lesson data ops are documented at the top of `assets/lessons/variables.js`. Python ops: obj, bind, unbind, set, flash, hold, release, err. C ops: var, setv, arr, seti, ptr, null, drop, err, flash, with regions stack, static, heap. Python cards grow by row and the picture height fits the content. Types with their own header colors: int, str, list, tuple, dict, set; others use a neutral one.
- `assets/quiz.js`: quiz engine. Code questions run real Python through Pyodide (loaded from jsDelivr when first needed) against tests in `assets/quizzes/chapter-N.js`. A step limit stops endless loops.
- To add a lesson: copy `lessons/loops.html` and a lesson data file, change the ids, add `href` in `chapters.js`.

## Next steps
1. Phases 1 to 5 are DONE. Candidate Phase 6 topics (not built): heap sort, counting/radix sort, quickselect, backtracking (permutations, N-Queens, needs a board stage), intervals, prefix sums, bit manipulation, string algorithms (KMP, rolling hash), greedy.
2. Figma pass on the lesson screen, then port the result (blocked earlier by the Figma plan call limit).
3. User is reviewing content at home; expect feedback on wording and visuals.
4. GitHub Pages is live and deploys from main.

## Phase 2 additions
- New `mode: 'ds'` lessons draw a shared Structure panel. Step ops live in `step.ds`: node (shapes node/dnode/cell/circle), mv, lab, rm, note, edge/unedge (next/prev/l/r/child), ptr/unptr, tag/untag (done dim hot cur mark bad), hot. The viewBox is 1000 wide; `step.h` sets the height. Engine code: `buildDsSnapshots`, `DsStage`, `dsPath` in assets/engine.js; test hook `window.__dsav`.
- Motion layer on the home page (assets/site.js, style.css): headline split, reveals, progress strip, visited ticks; all off under prefers-reduced-motion.
- Chapters 8 Linked lists, 9 Stacks and queues, 10 Trees, 11 Heaps and tries, each with depth files and a quiz. GitHub Pages deploys from .github/workflows/pages.yml (working).
- After newpage.py, remove any duplicate `href` it adds in chapters.js and the stray loops depth script tag in the new HTML.

## Phases 3 to 5 additions
- Home page: `PHASES` in assets/chapters.js (n, title, blurb, from, to as inclusive 0-based chapter indexes). Home shows phase cards; hash `#phase-N` shows that phase's chapters. Lesson breadcrumb links back to the phase.
- Chapters 12 Graphs, 13 Shortest paths and connectivity, 14 Dynamic programming, 15 Complexity analysis (Phase 3). Chapters 16 Classes and objects, 17 Inheritance and composition, 18 Iterators, generators and decorators (Phase 4). Chapters 19 Sorting, 20 Binary search, 21 Two pointers and sliding window (Phase 5). Phase 6: 22 Spanning trees and negative edges (mst, bellman-ford), 23 All pairs and guided search (floyd-warshall, a-star), 24 Heaps, selection and counting (heap-select, counting-radix; algo mode), 25 String matching (kmp, rabin-karp), 26 Backtracking (subsets-backtracking, n-queens). Many Phase 6 ds lessons generate their steps by simulating the algorithm in the lesson file.
- Structure mode ('ds') extras: `etag`/`euntag` [from, kind, cls...] add edge classes (on, dim, tree); edge kinds starting with `u` are undirected (no arrowhead); edge lines are trimmed to the node border for circles and cells. Object diagrams in chapters 16-18 use a helper `box(id, x, y, title, fields)` that draws a header cell plus one cell per field. Keep content above y = 260 (the dock covers the lower part of the 440-high stage).
- Phase 5 uses `mode: 'algo'` with assets/algo.js (video-style player). A scene gives `input`, `pyCode`, `cCode`, `predict`, `trap`, optional `keys` (legend labels) and `run(T)`, which runs the algorithm in JavaScript and records frames with `T.frame(pl, cl, say, opts)` (opts: cmp, swp, sorted, pivot, found, dim, min, mark, ptr, band, vars). Bars are DOM elements moved with transform, so swaps slide; the scrubber seeks to any frame. Make a page with newalgo.py (copy of loops.html with DSAV.mountAlgo and algo.js). Tests: load page, step through all frames (`window.__dsav.go(i)`), check the final order and no console errors.
- Engine exposes `DSAV.util` (h, esc, highlight, renderDepth, restart) for algo.js.
- Test scripts live in the Claude session scratchpad only (t_all.py, t_quiz.py, t_algo.py, ds_shot.py, newpage.py, newalgo.py, newquiz.py, hookdepth.py); recreate them if the session is gone: they use Playwright against a local `python3 -m http.server` serving the repo, and Pyodide for quizzes.
- Quiz rule: debug starters must FAIL their tests, complete/write starters must not pass; each quiz is run with reference solutions (6 of 6).

## Later additions
- Licence: AGPL-3.0 (LICENSE at the repo root).
- Home page progress counts a lesson as completed only when every question of its chapter quiz has been attempted (quiz.js sets `dsav-qdone-<n>` in localStorage).
- Algo player speeds: 0.25x, 0.5x, 1x, 2x, 4x.
- A "LeetCode Visualizer" card sits at the bottom of the home page only (hidden inside phase views). `leetcode/index.html` is an empty placeholder; the plan is in LEETCODE_PLAN.md.
- Ideas for more advanced chapters: greedy and intervals, prefix sums and bit tricks, tries for strings (Aho-Corasick), segment trees and Fenwick trees, topological DP.
- Renamed from "DSA Visualizer" to "Algolingo"; the GitHub repo is now `AlgoLingo` (live site https://tanmayhc7.github.io/AlgoLingo/). The local folder is still /home/claude/dsa-visualizer.
