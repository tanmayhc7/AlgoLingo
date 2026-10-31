/* Chapter 37 quiz: Classic patterns. */
window.QUIZ = {
  "chapter": 37,
  "title": "Classic patterns",
  "lede": "LIS, monotonic deque, Dutch flag, Boyer-Moore, bitmask DP and Huffman.",
  "questions": [
    {
      "type": "mcq",
      "q": "In the O(n log n) LIS algorithm, what does <code>tails[k]</code> store?",
      "options": [
        "The k-th element of the answer",
        "The smallest possible last value of an increasing subsequence of length k + 1",
        "The number of subsequences of length k"
      ],
      "answer": 1,
      "why": "Keeping the smallest tail leaves the most room to extend, and tails stays sorted so binary search works."
    },
    {
      "type": "mcq",
      "q": "Boyer-Moore returns a candidate for [1, 2, 3]. Is there a majority element?",
      "options": [
        "Yes, the candidate",
        "No: the second pass must verify it",
        "Yes, the first element"
      ],
      "answer": 1,
      "why": "The first pass always returns a candidate; only the verification pass shows if it appears more than n/2 times."
    },
    {
      "type": "mcq",
      "q": "About how large can n be for bitmask DP over subsets?",
      "options": [
        "Up to about 20 to 25",
        "Up to about 1000",
        "Up to about 10 million"
      ],
      "answer": 0,
      "why": "There are 2^n masks, so memory and time explode beyond roughly 25 items."
    },
    {
      "type": "write",
      "q": "Write <code>lis(a)</code>: the length of the longest strictly increasing subsequence, in O(n log n) using <code>bisect_left</code>.",
      "starter": "from bisect import bisect_left\n\ndef lis(a):\n    # your code\n",
      "tests": [
        {
          "expr": "lis([10, 9, 2, 5, 3, 7, 101, 18])",
          "want": "4"
        },
        {
          "expr": "lis([])",
          "want": "0"
        },
        {
          "expr": "lis([7, 7, 7])",
          "want": "1"
        },
        {
          "expr": "lis([1, 2, 3])",
          "want": "3"
        },
        {
          "expr": "lis([5, 4, 3])",
          "want": "1"
        }
      ],
      "hint": "tails list: bisect_left to find the slot; append if at the end, else replace.",
      "solution": "from bisect import bisect_left\n\ndef lis(a):\n    tails = []\n    for x in a:\n        i = bisect_left(tails, x)\n        if i == len(tails):\n            tails.append(x)\n        else:\n            tails[i] = x\n    return len(tails)\n",
      "why": "bisect_left makes equal values replace each other, which keeps the subsequence strictly increasing."
    },
    {
      "type": "write",
      "q": "Write <code>window_max(a, k)</code>: the maximum of every window of size <code>k</code>, in O(n) with a deque of indexes.",
      "starter": "from collections import deque\n\ndef window_max(a, k):\n    # your code\n",
      "tests": [
        {
          "expr": "window_max([1, 3, -1, -3, 5, 3, 6, 7], 3)",
          "want": "[3, 3, 5, 5, 6, 7]"
        },
        {
          "expr": "window_max([1], 1)",
          "want": "[1]"
        },
        {
          "expr": "window_max([4, 2], 2)",
          "want": "[4]"
        },
        {
          "expr": "window_max([9, 8, 7], 1)",
          "want": "[9, 8, 7]"
        }
      ],
      "hint": "Pop smaller values from the back, push the index, pop the front when it leaves the window.",
      "solution": "from collections import deque\n\ndef window_max(a, k):\n    dq, out = deque(), []\n    for i, x in enumerate(a):\n        while dq and a[dq[-1]] <= x:\n            dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k:\n            dq.popleft()\n        if i >= k - 1:\n            out.append(a[dq[0]])\n    return out\n",
      "why": "Each index is pushed and popped at most once, so the total work is O(n)."
    },
    {
      "type": "write",
      "q": "Write <code>sort_colors(a)</code> for a list of 0s, 1s and 2s using the Dutch flag method (one pass, three pointers). Sort in place and return the list.",
      "starter": "def sort_colors(a):\n    # your code\n",
      "tests": [
        {
          "expr": "sort_colors([2, 0, 2, 1, 1, 0])",
          "want": "[0, 0, 1, 1, 2, 2]"
        },
        {
          "expr": "sort_colors([])",
          "want": "[]"
        },
        {
          "expr": "sort_colors([1])",
          "want": "[1]"
        },
        {
          "expr": "sort_colors([2, 2, 0])",
          "want": "[0, 2, 2]"
        },
        {
          "expr": "sort_colors([1, 0, 2, 1, 0, 2])",
          "want": "[0, 0, 1, 1, 2, 2]"
        }
      ],
      "hint": "lo, mid, hi pointers; do not advance mid after swapping with hi.",
      "solution": "def sort_colors(a):\n    lo, mid, hi = 0, 0, len(a) - 1\n    while mid <= hi:\n        if a[mid] == 0:\n            a[lo], a[mid] = a[mid], a[lo]\n            lo += 1\n            mid += 1\n        elif a[mid] == 1:\n            mid += 1\n        else:\n            a[mid], a[hi] = a[hi], a[mid]\n            hi -= 1\n    return a\n",
      "why": "One pass and O(1) space: everything before lo is 0, everything after hi is 2."
    },
    {
      "type": "debug",
      "q": "<code>majority(a)</code> should return the element appearing more than n/2 times, or <code>None</code>. It returns the voting candidate without checking it. Fix it.",
      "starter": "def majority(a):\n    cand, count = None, 0\n    for x in a:\n        if count == 0:\n            cand = x\n        count += 1 if x == cand else -1\n    return cand\n",
      "tests": [
        {
          "expr": "majority([2, 2, 1, 1, 1, 2, 2])",
          "want": "2"
        },
        {
          "expr": "majority([1, 2, 3])",
          "want": "None"
        },
        {
          "expr": "majority([])",
          "want": "None"
        },
        {
          "expr": "majority([1, 1, 2, 2])",
          "want": "None"
        }
      ],
      "hint": "Count the candidate in a second pass.",
      "solution": "def majority(a):\n    cand, count = None, 0\n    for x in a:\n        if count == 0:\n            cand = x\n        count += 1 if x == cand else -1\n    return cand if cand is not None and a.count(cand) > len(a) // 2 else None\n",
      "why": "The first pass finds the only possible candidate; the second pass proves it is a majority."
    },
    {
      "type": "complete",
      "q": "Fill in the blank so each step removes the lightest node from the heap. The function returns the total weight of all merges (the encoded size in bits).",
      "starter": "import heapq\n\ndef huffman_cost(freqs):\n    h = list(freqs)\n    heapq.heapify(h)\n    total = 0\n    while len(h) > 1:\n        a = heapq.___(h)\n        b = heapq.heappop(h)\n        total += a + b\n        heapq.heappush(h, a + b)\n    return total\n",
      "tests": [
        {
          "expr": "huffman_cost([5, 2, 1, 1])",
          "want": "15"
        },
        {
          "expr": "huffman_cost([1])",
          "want": "0"
        },
        {
          "expr": "huffman_cost([3, 3])",
          "want": "6"
        },
        {
          "expr": "huffman_cost([1, 1, 2])",
          "want": "6"
        }
      ],
      "hint": "heapq function that returns the smallest item.",
      "solution": "import heapq\n\ndef huffman_cost(freqs):\n    h = list(freqs)\n    heapq.heapify(h)\n    total = 0\n    while len(h) > 1:\n        a = heapq.heappop(h)\n        b = heapq.heappop(h)\n        total += a + b\n        heapq.heappush(h, a + b)\n    return total\n",
      "why": "Always merging the two lightest nodes is the greedy rule that gives an optimal prefix code."
    },
    {
      "type": "write",
      "q": "Write <code>tsp(d)</code>: the length of the shortest tour that starts at city 0, visits every city once and returns, using bitmask DP (<code>d</code> is a square distance matrix).",
      "starter": "def tsp(d):\n    # your code\n",
      "tests": [
        {
          "expr": "tsp([[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]])",
          "want": "80"
        },
        {
          "expr": "tsp([[0, 5], [5, 0]])",
          "want": "10"
        },
        {
          "expr": "tsp([[0, 1, 2], [1, 0, 4], [2, 4, 0]])",
          "want": "7"
        }
      ],
      "hint": "dp[mask][i]; start with dp[1][0] = 0; extend to unvisited j; finish by adding d[i][0].",
      "solution": "def tsp(d):\n    n = len(d)\n    INF = float(\"inf\")\n    dp = [[INF] * n for _ in range(1 << n)]\n    dp[1][0] = 0\n    for mask in range(1 << n):\n        for i in range(n):\n            if dp[mask][i] == INF:\n                continue\n            for j in range(n):\n                if mask >> j & 1:\n                    continue\n                nm = mask | 1 << j\n                dp[nm][j] = min(dp[nm][j], dp[mask][i] + d[i][j])\n    full = (1 << n) - 1\n    return min(dp[full][i] + d[i][0] for i in range(n))\n",
      "why": "Remembering the best cost per (visited set, last city) replaces n! orderings with 2^n * n states."
    }
  ]
};
