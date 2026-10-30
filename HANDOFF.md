# DSA Visualizer: handoff

Where the project stands, so any session can continue it. Last updated 2026-10-30.

## What it is
An interactive static site that teaches Python, then DSA, to a C programmer. Each lesson runs the same program in Python and C side by side, one step at a time, with memory pictures (dummy addresses), a caption per step, a predict-then-check question and a table of built-ins. Each chapter ends with a quiz (multiple choice, write, complete, debug).

## Where things live
- GitHub: https://github.com/tanmayhc7/dsa-visualizer (branch main). Live site: https://tanmayhc7.github.io/dsa-visualizer/ once GitHub Pages is switched on (Settings, Pages, main, root).
- Cloud working copy: `/home/claude/dsa-visualizer` in the Claude session; push to origin from there.
- Mac folder: `~/Desktop/dsa-visualizer` (older; `git pull` from GitHub to refresh).
- The phone-only hosted copy is out of date and no longer maintained. Use the GitHub Pages link.
- Figma file "DSA Visualizer": Home and Lesson frames. The lesson v2 is still to do after the Starter plan call limit resets.

## Built so far (Phase 1 complete)
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
1. Phase 2: linked lists, stacks, queues, trees, heaps, tries. Phase 3: graphs, dynamic programming, complexity analysis. Phase 4: OOP. Same Python-and-C format, each lesson with a depth file.
2. Figma pass on the lesson screen, then port the result.
3. Turn on GitHub Pages if not done yet (Settings, Pages, main, / root).
