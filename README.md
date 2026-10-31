# AlgoLingo

**Live site: https://tanmayhc7.github.io/AlgoLingo/**

Open it in any browser, phone included. Code questions in the chapter quizzes run real Python in the browser.

An interactive way to learn Python and data structures and algorithms, built for someone coming from C. Each lesson pairs the code with a step-by-step visual, a one-line explanation per step, and a look at what happens in memory underneath.

## Status

Nine phases are built: 37 chapters, 99 lessons, each with Python and C side by side, an **Interview depth** section (edge cases, complexity, internals, mid/senior/staff Q&A with follow-ups) and a chapter quiz (multiple choice, write, complete and debug). The plan is in [CURRICULUM.md](CURRICULUM.md), and [DESIGN.md](DESIGN.md) holds the design principles and working rules, and [HANDOFF.md](HANDOFF.md) says where the project stands.

1. **Python foundations** (chapters 1 to 7): names, types, control flow, functions, memory and arrays, hashing, the toolbox.
2. **Core data structures** (8 to 11): linked lists, stacks and queues, trees, heaps and tries, drawn as nodes and pointers (structure mode).
3. **Graphs, DP and analysis** (12 to 15): BFS and DFS, topological sort, Dijkstra, union-find, dynamic programming, complexity analysis.
4. **Object-oriented design** (16 to 18): classes, dunder methods, inheritance and the MRO, composition, iterators, generators, decorators, dataclasses.
5. **Algorithms in motion** (19 to 21): sorting, binary search, two pointers, sliding window, prefix sums, Kadane and greedy intervals (chapter 21 "Array techniques"), as step-through animations with a scrubber.
6. **Advanced algorithms** (22 to 27): Kruskal and Prim, Bellman-Ford, Floyd-Warshall, A*, heap sort and quickselect, counting and radix sort, KMP and Rabin-Karp, backtracking (subsets, N-Queens), Fenwick and segment trees.
7. **Python for applied AI** (28 to 31): JSON and JSONL, text cleaning and chunking, HTTP retries and pagination, asyncio, type hints and validation, context managers, config and logging, tests with fakes. Each lesson shows a C analogue (cJSON, libcurl, epoll, function pointers).
8. **Building with models** (32 to 34): LLM API basics and cost, structured output, tool calling, the agent loop, embeddings and retrieval, evals.
9. **Advanced concepts** (35 to 37): AVL trees, skip lists, Bloom filters, k-D trees; threads and the GIL, floats, Unicode and byte order, modules and command-line scripts; classic patterns (longest increasing subsequence, monotonic deque, Dutch flag, Boyer-Moore, bitmask DP, Huffman coding).

## Run it

No build step. Open `index.html` in a browser (double-click it, or run `open index.html` on a Mac). Fonts load from Google Fonts and fall back to system fonts when offline.

Controls: Step, Back, Play and Reset, or the left and right arrow keys. Dummy memory addresses are shown for names, objects and variables. Untick "Show addresses" to hide them.

## Layout

```
index.html               module map
lessons/*.html           one page per lesson
assets/chapters.js       the course outline: chapters and lessons, read by the home page and lesson nav
assets/engine.js         step engine: snapshots, Python and C stages, structure (ds) mode, animation, controls
assets/algo.js           Phase 5 player: tracer, bars that slide, scrubber, code beside the animation
assets/style.css         tokens, light and dark themes, layout
assets/lessons/*.js      lesson data: the code and what changes in memory at each step
CURRICULUM.md            what each lesson covers and the open decisions
```

## Adding a lesson

Copy `lessons/variables.html` and `assets/lessons/variables.js`. A lesson is plain data: for each scene, the Python and C code and a list of steps. Each step names the highlighted lines, one sentence of narration per language, and the memory changes (the op list is documented at the top of the data file). The engine handles stepping back, freeing unreferenced objects and the animation.

## Algorithm animations (Phase 5)

A lesson with `mode: 'algo'` uses `assets/algo.js` (page mounts with `DSAV.mountAlgo`). Each scene supplies `input` (numbers), `pyCode`/`cCode`, and `run(T)`, which executes the algorithm in JavaScript and records frames: `T.frame(pl, cl, say, opts)` with `opts` = `cmp`, `swp`, `sorted`, `pivot`, `found`, `dim`, `min`, `mark` (position lists), `ptr` ({name: position}), `band` ([lo, hi]) and `vars`. `T.swap(i, j)` reorders; `T.cmps` and `T.swaps` are the counters. An optional `keys` object renames the legend labels. Make a new page by copying an existing algo lesson page.

## Chapter quizzes

Each quiz is a page in `quizzes/` with its questions in `assets/quizzes/chapter-N.js`. Question types: `mcq`, `write`, `complete` (with `___` blanks) and `debug` (buggy starter code). Code answers are run in the browser with Pyodide (loaded from a CDN the first time you press Check) against the test list in the data file, so a syntax error shows up as the real Python error, and a loop that never ends is stopped. Progress is remembered on the device. Needs an internet connection for the code questions. Add a quiz by copying `quizzes/chapter-1.html` and its data file, then set `quiz:` on the chapter in `assets/chapters.js`.

## License

GNU Affero General Public License v3.0 (AGPL-3.0). See [LICENSE](LICENSE). If you run a modified version of this site for others over a network, you must offer them the modified source.
