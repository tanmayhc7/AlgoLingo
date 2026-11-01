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

## Status
Source of the problem list: T's checklist "100 Must-Do DSA Questions" (13 patterns). The visualizer follows that list; a problem is built only when T's folder (`~/Desktop/leetcode/<NNNN-slug>/`) has its solution.

Built (7): 1 Two Sum, 217 Contains Duplicate, 242 Valid Anagram, 49 Group Anagrams, 125 Valid Palindrome, 20 Valid Parentheses, 2 Add Two Numbers.
Waiting on T: 347 Top K Frequent Elements (T's solution is not complete yet: no write-up or C, only a first sort-by-count version). Not on the checklist, so skipped: 9 Palindrome Number, 565 Array Nesting.
Where the folder had no C or no explained.md (Valid Parentheses C, Group Anagrams C and write-up), the C code and write-up were written to match T's Python.

## How to add a problem
1. Add `{ id: 'lc-<slug>', slug, num, list, title, diff, pattern }` to `PROBLEMS` in `assets/leetcode.js` (`list` = number on the checklist).
2. Write `assets/problems/<slug>.js` (sets `window.LESSON` with `mode: 'ds'` and `Flow.steps`, and `window.PROBLEM` with statement, examples, constraints and write-up) and `<slug>-depth.js` (`window.DEPTH`).
3. Copy an existing `leetcode/problems/<slug>.html`, change the title, the script names and the "Learn the pattern first" link.
4. Scenes: brute force or baseline, the insight, the trap. Keep stage centres within y of about 180 (the control dock covers the lower part); use `ptr` direction `down` only, and leave a row free under any pointer chip (`dy: 68`).
5. Test the page at 1280 and 390 wide, then open a PR.
