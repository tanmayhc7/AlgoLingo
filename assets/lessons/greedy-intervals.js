/* Lesson data: greedy choices and intervals (structure mode). Intervals are cells labelled [start,end]. */
(function () {
  var DX = 118, BX = 100, TY = 70, RY = 150;
  function lab(iv) { return '[' + iv[0] + ',' + iv[1] + ']'; }
  function merge() {
    var raw = [[8, 10], [1, 3], [2, 6], [15, 18], [17, 20]], steps = [], ops = [], i;
    var sorted = raw.slice().sort(function (a, b) { return a[0] - b[0]; });
    for (i = 0; i < raw.length; i++) ops.push(['node', 'v' + i, lab(raw[i]), BX + i * DX, TY, 'cell']);
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Merge overlapping intervals. Unsorted, every interval may overlap any other (O(n^2)). The greedy trick: sort by start. Then an interval can only overlap the LAST merged one.', csay: 'int iv[5][2] = {{8,10},{1,3},{2,6},{15,18},{17,20}};', ds: ops });
    var s = [];
    for (i = 0; i < sorted.length; i++) s.push(['lab', 'v' + i, lab(sorted[i])]);
    steps.push({ pl: 1, cl: 1, h: 380, say: 'Sort by start: ' + sorted.map(lab).join(' ') + '. Costs O(n log n), and the sweep after it is O(n).', csay: 'qsort(iv, 5, sizeof iv[0], cmp_start);', ds: s });
    var out = [], oi = 0;
    function put(iv, k) { return ['node', 'm' + k, lab(iv), BX + k * DX, RY, 'cell']; }
    out.push(sorted[0].slice());
    steps.push({ pl: 2, cl: 2, h: 380, say: 'Put the first interval ' + lab(sorted[0]) + ' into the output.', csay: 'out[0] = iv[0];', ds: [put(out[0], 0), ['tag', 'v0', 'done'], ['ptr', 'last', 'm0', 'down']] });
    for (i = 1; i < sorted.length; i++) {
      var last = out[out.length - 1], cur = sorted[i], k = out.length - 1;
      if (cur[0] <= last[1]) {
        var newEnd = Math.max(last[1], cur[1]);
        steps.push({ pl: 4, cl: 4, h: 380, say: lab(cur) + ' starts at ' + cur[0] + ', which is <= the last end ' + last[1] + ': they overlap. Merge by extending the end to max(' + last[1] + ', ' + cur[1] + ') = ' + newEnd + '.', csay: 'out[k][1] = max(out[k][1], iv[i][1]);', ds: [['tag', 'v' + i, 'cur'], ['hot', 'v' + i, 'm' + k], ['lab', 'm' + k, '[' + last[0] + ',' + newEnd + ']']] });
        last[1] = newEnd;
        steps.push({ pl: 4, cl: 4, h: 380, say: 'Merged result so far: ' + out.map(lab).join(' ') + '.', csay: '', ds: [['untag', 'v' + i, 'cur'], ['tag', 'v' + i, 'dim']] });
      } else {
        out.push(cur.slice());
        steps.push({ pl: 6, cl: 6, h: 380, say: lab(cur) + ' starts at ' + cur[0] + ' after the last end ' + last[1] + ': a gap, so it begins a new group.', csay: 'out[++k] = iv[i];', ds: [put(cur, out.length - 1), ['tag', 'v' + i, 'done'], ['ptr', 'last', 'm' + (out.length - 1), 'down']] });
      }
    }
    steps.push({ pl: 7, cl: 8, h: 380, say: 'Result: ' + out.map(lab).join(' ') + '. Sorting dominates: O(n log n) time. Touching intervals like [1,3] and [3,5] merge because the test uses <=; use < if touching should stay separate.', csay: 'return out;', ds: [] });
    return steps;
  }
  function select() {
    var raw = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11]], steps = [], ops = [], i;
    var iv = raw.slice().sort(function (a, b) { return a[1] - b[1]; });
    for (i = 0; i < iv.length; i++) ops.push(['node', 'v' + i, lab(iv[i]), 70 + i * 108, TY + (i % 2) * 0, 'cell']);
    steps.push({ pl: 0, cl: 0, h: 380, say: 'Activity selection: pick as many non-overlapping intervals as possible. Greedy rule: always take the interval that ENDS earliest, because it leaves the most room. The intervals here are already sorted by end time: ' + iv.map(lab).join(' ') + '.', csay: '/* sorted by end */', ds: ops });
    var lastEnd = -1, taken = 0;
    for (i = 0; i < iv.length; i++) {
      if (iv[i][0] >= lastEnd) {
        lastEnd = iv[i][1]; taken++;
        steps.push({ pl: 3, cl: 3, h: 380, say: lab(iv[i]) + ' starts at ' + iv[i][0] + ', which is >= the last chosen end, so it fits. Take it; the last end becomes ' + lastEnd + '.', csay: 'taken++; last_end = ' + lastEnd + ';', ds: [['tag', 'v' + i, 'done'], ['ptr', 'end', 'v' + i, 'down']] });
      } else {
        steps.push({ pl: 2, cl: 2, h: 380, say: lab(iv[i]) + ' starts at ' + iv[i][0] + ' before the last end ' + lastEnd + ': it overlaps, so skip it.', csay: 'skip', ds: [['tag', 'v' + i, 'bad']] });
      }
    }
    steps.push({ pl: 5, cl: 7, h: 380, say: 'Chosen ' + taken + ' intervals. Sorting by end is the whole argument: any other optimal answer can swap its first interval for the earliest-ending one without losing anything. Sorting by start or by length is wrong.', csay: 'return taken;', ds: [] });
    return steps;
  }
  window.LESSON = {
    id: 'greedy-intervals',
    mode: 'ds',
    title: 'Greedy choices and intervals',
    lede:
      'A greedy algorithm makes the locally best choice at each step and never reconsiders. It only works when a local choice is provably safe, which is usually shown with an exchange argument: any optimal answer can be changed to use your choice without getting worse. Interval problems are the classic home of greedy. Sort first (by start to merge, by end to select), then sweep once, so the cost is the sort: O(n log n). Merge intervals, insert interval, meeting rooms, non-overlapping intervals and activity selection are all variations.',
    scenes: [
      { id: 'merge', title: 'Merge intervals', blurb: 'Sort by start, then each interval either extends the last merged one or begins a new one.', trap: 'Forgetting to sort, comparing against the wrong interval (always the LAST merged one, not the previous input), and using the new interval\'s end instead of max(last end, new end): [1,10] followed by [2,3] must stay [1,10].',
        pyCode: ['def merge(intervals):', '    intervals.sort(key=lambda iv: iv[0])', '    out = [intervals[0][:]]', '    for s, e in intervals[1:]:', '        if s <= out[-1][1]:', '            out[-1][1] = max(out[-1][1], e)', '        else:', '            out.append([s, e])', '    return out'],
        cCode: ['int merge(int iv[][2], int n, int out[][2]) {', '    qsort(iv, n, sizeof iv[0], cmp_start);', '    int k = 0;', '    out[0][0] = iv[0][0]; out[0][1] = iv[0][1];', '    for (int i = 1; i < n; i++) {', '        if (iv[i][0] <= out[k][1]) {', '            if (iv[i][1] > out[k][1]) out[k][1] = iv[i][1];', '        } else {', '            k++; out[k][0] = iv[i][0]; out[k][1] = iv[i][1];', '        }', '    }', '    return k + 1;', '}'],
        predict: { q: 'What does merging [1,10] and [2,3] give?', options: ['[1,3]', '[1,10]', '[2,10]'], answer: 1, why: 'The new end is max(10, 3) = 10. Taking only the new end would shrink the interval.' },
        steps: merge() },
      { id: 'select', title: 'Activity selection', blurb: 'Sort by end time and take every interval that starts at or after the last chosen end.', trap: 'Sorting by start time or by duration looks natural but fails (one long early interval can block many short ones). Also decide whether touching intervals ([1,3] and [3,5]) conflict; here they do not.',
        pyCode: ['def max_non_overlapping(iv):', '    iv.sort(key=lambda x: x[1])', '    last_end, taken = float("-inf"), 0', '    for s, e in iv:', '        if s >= last_end:', '            taken += 1', '            last_end = e', '    return taken'],
        cCode: ['int max_non_overlapping(int iv[][2], int n) {', '    qsort(iv, n, sizeof iv[0], cmp_end);', '    int last_end = INT_MIN, taken = 0;', '    for (int i = 0; i < n; i++) {', '        if (iv[i][0] >= last_end) {', '            taken++;', '            last_end = iv[i][1];', '        }', '    }', '    return taken;', '}'],
        predict: { q: 'Which sort order makes the take-the-next-compatible greedy correct for maximising the number of intervals?', options: ['By start time', 'By end time', 'By length'], answer: 1, why: 'The earliest-ending interval leaves the most room for the rest; the other two orders have simple counterexamples.' },
        steps: select() },
    ],
    builtins: [
      ['list.sort(key=lambda iv: iv[0])', 'Sort intervals by start (or [1] for end). Stable and O(n log n).'],
      ['sorted(iv, key=...)', 'Same, returning a new list.'],
      ['max(a, b)', 'Extend the merged end.'],
      ['heapq', 'Meeting rooms II: a min-heap of end times counts concurrent meetings.'],
      ['qsort + comparator (C)', 'Write cmp_start / cmp_end; avoid subtracting ints in the comparator (overflow).'],
    ],
  };
})();
