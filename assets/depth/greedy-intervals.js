/* Interview depth: greedy choices and intervals. */
window.DEPTH = {
  thesis:
    'A greedy algorithm commits to the locally best choice at every step and never revisits it. It is correct only when you can argue the local choice is safe, usually by an exchange argument: any optimal solution can be rewritten to include your choice without getting worse. Interval problems are the standard setting. The pattern is: sort by the right key (start to merge, end to select), then sweep once. The cost is dominated by the sort, O(n log n).',
  why: [
    ['Common interview family', 'Merge intervals, insert interval, non-overlapping intervals, meeting rooms, minimum arrows, task scheduling, jump game, gas station.'],
    ['Simple code, subtle proof', 'Greedy solutions are short; the skill is justifying them and knowing when they fail.'],
    ['Contrast with DP', 'When a greedy choice is not provably safe (coin change with arbitrary coins) you need DP or search.'],
    ['Real scheduling', 'Calendars, interval trees, merge of time ranges and resource allocation all use the same sweep.'],
  ],
  edges: [
    ['Sort key matters', 'Merge needs sort by start. Maximising the number of non-overlapping intervals needs sort by END. Sorting by length or start fails.'],
    ['Touching intervals', 'Decide whether [1,3] and [3,5] overlap. Merge treats them as overlapping (<=); selection usually allows them (>=). Read the statement.'],
    ['Nested intervals', '[1,10] then [2,3]: the merged end must be max(old end, new end), not the new end.'],
    ['Empty input', 'Return an empty list before indexing intervals[0].'],
    ['Mutating the input', 'Copy the intervals you append (intervals[0][:]) or you will modify the caller\'s lists while merging.'],
    ['Comparator overflow in C', 'Do not return a - b in a qsort comparator for large ints; compare with < and >.'],
  ],
  cost: [
    ['Sort', 'O(n log n).'],
    ['Sweep', 'O(n) time, O(1) extra space besides the output.'],
    ['Meeting rooms II', 'O(n log n) with a min-heap of end times, or sort starts and ends separately and sweep.'],
    ['Interval tree queries', 'O(log n + k) to list the k overlaps of one interval.'],
  ],
  internals: [
    ['Exchange argument', 'Take any optimal answer. Replace its first interval with the earliest-ending one; it ends no later, so everything that fit before still fits. Repeat for the rest.'],
    ['Why sort by start for merge', 'After sorting, an interval can only overlap the last merged group, so one comparison per interval suffices.'],
    ['Sweep line view', 'Treat each start as +1 and each end as -1 and sort the events; the running total is the number of overlapping intervals.'],
    ['Greedy versus DP', 'Greedy is a DP where the best choice is known without exploring alternatives.'],
  ],
  qa: [
    { lvl: 'junior', q: 'Merge overlapping intervals.', a: 'Sort by start, keep an output list, and for each interval either extend the last output interval (start <= last end, end = max) or append a new one. O(n log n).', follow: [['What if the input is already sorted?', 'Skip the sort: O(n).']] },
    { lvl: 'mid', q: 'What is the maximum number of non-overlapping intervals you can keep?', a: 'Sort by end time and take each interval whose start is at or after the last chosen end. Earliest end leaves the most room; the answer to "minimum removals" is n minus this count.', follow: [['Why not sort by start?', 'A single long interval that starts first can block many short ones: [0,100] then ten small intervals inside it.']] },
    { lvl: 'mid', q: 'Minimum number of meeting rooms.', a: 'Sort meetings by start and keep a min-heap of end times. For each meeting, free a room if the earliest end is <= this start (pop), then push this end. The heap size at the end is the answer. O(n log n).', follow: [] },
    { lvl: 'senior', q: 'Prove or refute: sort by duration and take the shortest compatible interval each time.', a: 'False. Counterexample: [1,4], [3,6], [5,8]... or more clearly a short interval in the middle of two longer ones that overlaps both: taking it blocks two intervals that could both be chosen. The correct key is end time.', follow: [] },
    { lvl: 'senior', q: 'Jump game: can you reach the last index given maximum jump lengths?', a: 'Greedy: keep the furthest reachable index. For each i, if i is beyond it, return False; otherwise reach = max(reach, i + a[i]). O(n) time, O(1) space; no DP table needed.', follow: [] },
  ],
};
