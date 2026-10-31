/* Interview depth: counting and radix sort. */
window.DEPTH = {
  thesis:
    'Counting sort and radix sort are non-comparison sorts, so the n log n lower bound does not apply. Counting sort tallies how many of each small integer key exist, converts tallies to positions with prefix sums, and places elements stably. Radix sort applies a stable sort to one digit at a time, least significant first. Both are linear when the key range or digit count is bounded.',
  why: [
    ['Beating n log n', 'The classic answer to "can you sort faster than O(n log n)?": yes, when keys are bounded integers.'],
    ['Practical data', 'Ages, scores, bytes, characters, fixed-width IDs, and pixel values.'],
    ['Stability matters', 'Radix sort is correct only because each pass is stable.'],
    ['Interview variants', 'Sort colours (Dutch flag), sort by frequency, h-index, and maximum gap use counting or bucket ideas.'],
  ],
  edges: [
    ['Large key range', 'Counting sort needs k counters. A huge range wastes memory and time; use radix or a comparison sort.'],
    ['Negative numbers', 'Offset by the minimum, or split by sign for radix.'],
    ['Stability', 'Place elements from right to left using the prefix sums. Left to right sorts but breaks stability.'],
    ['Non-integer keys', 'Strings can be radix sorted by character; floats need a bit-level trick or bucket sort.'],
    ['Number of digits', 'Passes depend on the maximum value; compute it first.'],
    ['Base choice', 'Base 256 means four passes for 32-bit integers; larger bases mean fewer passes but bigger count arrays.'],
  ],
  cost: [
    ['Counting sort', 'O(n + k) time, O(n + k) space.'],
    ['Radix sort', 'O(d (n + b)) time for d digits in base b; O(n + b) space.'],
    ['Comparison sorts', 'O(n log n) lower bound for any algorithm that only compares.'],
    ['Bucket sort', 'O(n) expected on uniformly distributed input, with a sort inside each bucket.'],
  ],
  internals: [
    ['Prefix sums', 'After tallying, count[v] becomes the number of values <= v, i.e. one past the last slot for v.'],
    ['Right-to-left placement', 'Decrement count[x] then write x there. Equal values land in the order they appeared.'],
    ['LSD versus MSD', 'LSD starts from the least significant digit and needs stability. MSD starts from the most significant digit and recurses on buckets.'],
    ['Why it beats n log n', 'It never compares two elements; it uses the key value itself as an index.'],
  ],
  qa: [
    { lvl: 'junior', q: 'Can you sort faster than O(n log n)?', a: 'Not with comparisons alone. With bounded integer keys, counting sort (O(n + k)) and radix sort (O(d n)) are linear.', follow: [] },
    { lvl: 'mid', q: 'Why does counting sort place elements from right to left?', a: 'To keep equal keys in their original order (stability). Each element takes the last free slot of its block, so the later element goes later.', follow: [['Why does that matter?', 'Radix sort relies on each digit pass being stable.']] },
    { lvl: 'mid', q: 'When would you not use counting sort?', a: 'When the key range is much larger than n, when keys are not integers, or when memory is tight. Sorting 100 values in [0, 10^9] is a poor fit.', follow: [] },
    { lvl: 'senior', q: 'Sort an array of 10^7 32-bit integers as fast as you can.', a: 'LSD radix sort in base 256: four counting passes over bytes, O(4 n) time with a 256-entry count array and an n-element buffer. It is cache-friendly and typically faster than comparison sorts at this size.', follow: [] },
    { lvl: 'senior', q: 'Find the maximum gap between consecutive values in a sorted version of the array, in O(n).', a: 'Use bucket sort with n - 1 buckets of equal width. The maximum gap is at least (max - min) / (n - 1), so it never lies inside one bucket: only compare the min of each bucket with the max of the previous non-empty bucket.', follow: [] },
  ],
};
