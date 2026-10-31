/* Chapter 11 quiz: Heaps and tries. See assets/quiz.js for the question format. */
window.QUIZ = {
  chapter: 11,
  title: 'Heaps and tries',
  lede: 'Priority queues, top-k selection and prefix trees.',
  questions: [
    {
      type: 'mcq',
      q: 'After <code>heapq.heappush</code> several times, you read <code>h[0]</code>. What do you get, and what is true of <code>h[-1]</code>?',
      options: ['The smallest item; h[-1] is the largest', 'The smallest item; h[-1] is just the last slot and says nothing about order', 'The first item pushed'],
      answer: 1,
      why: 'Only the root is guaranteed. A heap is not sorted, so the last element is merely some leaf.',
    },
    {
      type: 'mcq',
      q: 'You want the 10 <b>largest</b> values in a stream of millions. Which heap do you keep?',
      options: ['A min-heap of size 10', 'A max-heap of size 10', 'A min-heap of all values'],
      answer: 0,
      why: 'The root of a min-heap is the smallest of the current winners, the value a newcomer must beat. Capping the size at k gives O(n log k).',
    },
    {
      type: 'mcq',
      q: 'A trie holds only the word "cart". What does <code>search("car")</code> return, and <code>starts_with("car")</code>?',
      options: ['True and True', 'False and True', 'False and False'],
      answer: 1,
      why: 'The path c-a-r exists, so the prefix query succeeds, but the r node is not marked as a word end, so exact search fails.',
    },
    {
      type: 'complete',
      q: 'Fill in the blanks so <code>k_largest(nums, k)</code> returns the k largest numbers in ascending order using a size-k heap.',
      starter: 'import heapq\n\ndef k_largest(nums, k):\n    h = []\n    for x in nums:\n        if len(h) < k:\n            heapq.___(h, x)\n        elif x > h[0]:\n            heapq.heapreplace(h, x)\n    return ___(h)\n',
      tests: [
        { expr: 'k_largest([5, 1, 8, 3, 9, 2], 3)', want: '[5, 8, 9]' },
        { expr: 'k_largest([4, 4, 1], 2)', want: '[4, 4]' },
        { expr: 'k_largest([7], 3)', want: '[7]' },
      ],
      hint: 'Push while the heap is not full. At the end, sort the heap contents.',
      solution: 'import heapq\n\ndef k_largest(nums, k):\n    h = []\n    for x in nums:\n        if len(h) < k:\n            heapq.heappush(h, x)\n        elif x > h[0]:\n            heapq.heapreplace(h, x)\n    return sorted(h)\n',
      why: 'The heap holds the winners in heap order, not sorted order, so sort at the end (k log k).',
    },
    {
      type: 'write',
      q: 'Write a <code>Trie</code> class with <code>insert(word)</code>, <code>search(word)</code> and <code>starts_with(prefix)</code>.',
      starter: 'class Trie:\n    def __init__(self):\n        pass\n\n    def insert(self, word):\n        pass\n\n    def search(self, word):\n        pass\n\n    def starts_with(self, prefix):\n        pass\n',
      tests: [
        { expr: "(lambda t: (t.insert('car'), t.insert('cat'), t.search('car'), t.search('ca'), t.starts_with('ca'), t.search('cow'))[2:])(Trie())", want: '(True, False, True, False)' },
        { expr: "(lambda t: (t.insert('do'), t.starts_with('d'), t.starts_with('x'))[1:])(Trie())", want: '(True, False)' },
      ],
      hint: 'Give each node a dict of children and an end flag. Share one walk helper that returns the final node or None.',
      solution: 'class Trie:\n    def __init__(self):\n        self.root = {}\n\n    def insert(self, word):\n        node = self.root\n        for ch in word:\n            node = node.setdefault(ch, {})\n        node["$"] = True\n\n    def _walk(self, s):\n        node = self.root\n        for ch in s:\n            if ch not in node:\n                return None\n            node = node[ch]\n        return node\n\n    def search(self, word):\n        node = self._walk(word)\n        return node is not None and "$" in node\n\n    def starts_with(self, prefix):\n        return self._walk(prefix) is not None\n',
      why: 'A single walk serves both queries; the end marker is the only difference between a word and a prefix.',
    },
    {
      type: 'debug',
      q: 'This should return the <code>k</code> <b>smallest</b> items using a max-heap, but the result is wrong. Fix it. (<code>heapq</code> is a min-heap.)',
      starter: 'import heapq\n\ndef k_smallest(nums, k):\n    h = []\n    for x in nums:\n        heapq.heappush(h, x)\n        if len(h) > k:\n            heapq.heappop(h)\n    return sorted(h)\n',
      tests: [
        { expr: 'k_smallest([5, 1, 8, 3, 9, 2], 3)', want: '[1, 2, 3]' },
        { expr: 'k_smallest([4, 4, 1], 2)', want: '[1, 4]' },
      ],
      hint: 'heappop removes the smallest, which is the one you want to keep. Store negated values so the largest becomes the root.',
      solution: 'import heapq\n\ndef k_smallest(nums, k):\n    h = []\n    for x in nums:\n        heapq.heappush(h, -x)\n        if len(h) > k:\n            heapq.heappop(h)\n    return sorted(-v for v in h)\n',
      why: 'Negating turns the min-heap into a max-heap: the root is the largest of the k candidates, which is the one to evict.',
    },
  ],
};
