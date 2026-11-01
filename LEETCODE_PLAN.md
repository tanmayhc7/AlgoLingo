# LeetCode Visualizer: plan

Goal: for the top 75 problems (medium and hard first, easy ones only where they teach a pattern), give the same treatment as the DSA lessons: Python and C side by side, step-through visuals, a predict question, a trap note, and an interview-depth section. Problems are grouped by DSA pattern, not by difficulty.

## Inputs (waiting on the user)
- The documentation / write-ups for each problem (approach, complexity, edge cases). Each problem file becomes one lesson.
- The list of 75 problems (the NeetCode 150 / Blind 75 checklist in the project memory is the starting point).

## Where it lives
One repo only: the LeetCode Visualizer is a subfolder of AlgoLingo, served at `/AlgoLingo/leetcode/`. It shares `assets/` (style, engine, flow, quiz, logo), the theme toggle and the deploy, so there is no second repo to track. Do not create a separate repo for it.

## Structure
- `leetcode/index.html`: pattern chooser, then problem list per pattern with difficulty tags and a completed marker.
- `leetcode/problems/<slug>.html`: one page per problem, built by the existing engine (`ds` mode for pointer and tree pictures, `algo` mode for arrays).
- `assets/problems/<slug>.js`: problem data (statement summary, brute force then optimal scene, complexity, traps).
- Pattern pages reuse the DSA lessons by link ("learn the pattern first"): two pointers, sliding window, binary search, graphs, heaps, backtracking, DP, intervals.
- Progress uses the same rule as the DSA site: a problem counts as completed when its checks are answered; stored in localStorage.

## Per-problem template
1. Statement in one paragraph and an example.
2. Brute force scene with its cost.
3. Insight scene: the pattern that removes the waste.
4. Optimal solution scene, step-through, Python and C.
5. Predict question, trap note, edge cases, complexity.
6. Interview follow-ups (three levels), and a small coding quiz.

## Order of work
1. Template and one pilot problem (Two Sum or Longest Substring Without Repeating Characters) to settle the layout.
2. Arrays, hashing, two pointers, sliding window, stack, binary search.
3. Linked lists, trees, heaps, backtracking, graphs, tries.
4. 1D and 2D DP, greedy, intervals, bit tricks.
5. Hards last: median of two sorted arrays, trapping rain water, word ladder, and similar.

## Open questions
- Format of the documentation you will provide (markdown per problem?).
- Whether C solutions are needed for every problem or only for pointer-heavy ones.
