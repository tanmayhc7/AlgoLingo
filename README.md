# DSA Visualizer

An interactive way to learn Python and data structures and algorithms, built for someone coming from C. Each lesson pairs the code with a step-by-step visual, a one-line explanation per step, and a look at what happens in memory underneath.

## Status

The step-through engine is built, with one lesson so far: **Variables and names** (four scenes, Python and C side by side). The full Phase 1 plan is in [CURRICULUM.md](CURRICULUM.md).

## Run it

No build step. Open `index.html` in a browser (double-click it, or run `open index.html` on a Mac). Fonts load from Google Fonts and fall back to system fonts when offline.

Controls: Step, Back, Play and Reset, or the left and right arrow keys. Turn on "Show addresses" to see where each object and box lives.

## Phase 1 at a glance

- **Stage 1A, language basics:** compiled versus interpreted (C versus Python), variables, numbers, strings, conditions, loops, functions, shorthands, comprehensions, errors
- **Stage 1B, collections and hashing:** how memory holds an array, lists, tuples, hashing, dicts, sets, sorting helpers, `collections`

## Layout (planned)

```
index.html               module map
lessons/*.html           one page per lesson
assets/engine.js         step engine: snapshots, Python and C stages, animation, controls
assets/style.css         tokens, light and dark themes, layout
assets/lessons/*.js      lesson data: the code and what changes in memory at each step
CURRICULUM.md            what each lesson covers and the open decisions
```

## Adding a lesson

Copy `lessons/variables.html` and `assets/lessons/variables.js`. A lesson is plain data: for each scene, the Python and C code and a list of steps. Each step names the highlighted lines, one sentence of narration per language, and the memory changes (the op list is documented at the top of the data file). The engine handles stepping back, freeing unreferenced objects and the animation.
