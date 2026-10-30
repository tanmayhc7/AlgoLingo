# DSA Visualizer

**Live site: https://tanmayhc7.github.io/dsa-visualizer/**

Open it in any browser, phone included. Code questions in the chapter quizzes run real Python in the browser.

An interactive way to learn Python and data structures and algorithms, built for someone coming from C. Each lesson pairs the code with a step-by-step visual, a one-line explanation per step, and a look at what happens in memory underneath.

## Status

Phase 1 is complete: all 22 lessons across 7 chapters are built, each with Python and C side by side, and every chapter ends with a **chapter quiz** (multiple choice, write, complete and debug). The plan is in [CURRICULUM.md](CURRICULUM.md). Every lesson also has an **Interview depth** section: edge cases, complexity, internals and mid/senior/staff Q&A with follow-ups. Next up: Phase 2 (linked lists, stacks, queues, trees, heaps, tries), Phase 3 (graphs, dynamic programming, complexity analysis), Phase 4 (OOP).

## Run it

No build step. Open `index.html` in a browser (double-click it, or run `open index.html` on a Mac). Fonts load from Google Fonts and fall back to system fonts when offline.

Controls: Step, Back, Play and Reset, or the left and right arrow keys. Dummy memory addresses are shown for names, objects and variables. Untick "Show addresses" to hide them.

## Phase 1 at a glance

- **Stage 1A, language basics:** compiled versus interpreted (C versus Python), variables, numbers, strings, conditions, loops, functions, shorthands, comprehensions, errors
- **Stage 1B, collections and hashing:** how memory holds an array, lists, tuples, hashing, dicts, sets, sorting helpers, `collections`

## Layout

```
index.html               module map
lessons/*.html           one page per lesson
assets/chapters.js       the course outline: chapters and lessons, read by the home page and lesson nav
assets/engine.js         step engine: snapshots, Python and C stages, animation, controls
assets/style.css         tokens, light and dark themes, layout
assets/lessons/*.js      lesson data: the code and what changes in memory at each step
CURRICULUM.md            what each lesson covers and the open decisions
```

## Adding a lesson

Copy `lessons/variables.html` and `assets/lessons/variables.js`. A lesson is plain data: for each scene, the Python and C code and a list of steps. Each step names the highlighted lines, one sentence of narration per language, and the memory changes (the op list is documented at the top of the data file). The engine handles stepping back, freeing unreferenced objects and the animation.

## Chapter quizzes

Each quiz is a page in `quizzes/` with its questions in `assets/quizzes/chapter-N.js`. Question types: `mcq`, `write`, `complete` (with `___` blanks) and `debug` (buggy starter code). Code answers are run in the browser with Pyodide (loaded from a CDN the first time you press Check) against the test list in the data file, so a syntax error shows up as the real Python error, and a loop that never ends is stopped. Progress is remembered on the device. Needs an internet connection for the code questions. Add a quiz by copying `quizzes/chapter-1.html` and its data file, then set `quiz:` on the chapter in `assets/chapters.js`.
