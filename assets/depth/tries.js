/* Interview depth: Tries. */
window.DEPTH = {
  thesis:
    'A trie turns a set of strings into a tree indexed by characters, so every operation costs O(L) in the length of the key and nothing depends on how many keys are stored. That is its strength: prefix queries are as cheap as exact lookups. Its weakness is memory, because each node pays for a child table. Choosing how to represent children (array, dict, compressed edges) is the real design decision.',
  why: [
    ['Prefix queries are first-class', 'A hash set answers "is this word present" but not "which words start with this". A trie answers both by walking the prefix, then enumerating the subtree.'],
    ['Cost depends on key length, not on key count', 'Hash lookups hash the whole key (O(L)) and can collide; sorted-array search is O(L log n) in string compares. A trie is O(L) with no hashing and no collisions.'],
    ['Shared prefixes are stored once', 'Thousands of words beginning "inter" use a single path for it. For natural-language dictionaries and URLs this saves memory against storing every string.'],
    ['Lexicographic order for free', 'A depth-first walk visiting children in key order yields the words sorted.'],
  ],
  edges: [
    ['Word versus prefix', 'Keep an end flag (or a count). Without it, "car" cannot be told apart from the prefix of "cart".'],
    ['Empty string', 'Inserting "" marks the root as a word end. Decide whether that is allowed.'],
    ['Alphabet', 'An array of 26 children assumes lowercase letters. Unicode, mixed case or digits need a dict or a larger table.'],
    ['Deletion', 'Unmark the end flag, then prune nodes that have no children and are not word ends, walking back up. Forgetting to prune leaks memory; pruning too eagerly deletes another word.'],
    ['Memory blow-up', 'A node with a 26-pointer array is 208 bytes on a 64-bit machine. A million sparse nodes cost 200 MB.'],
  ],
  cost: [
    ['insert / search / starts_with', 'O(L).'],
    ['space', 'O(total characters) in the worst case, times the child-table size. Shared prefixes reduce it.'],
    ['list all words with a prefix', 'O(L + size of the subtree).'],
    ['array children', 'O(1) per step, 26 pointers per node.'],
    ['dict children', 'O(1) average per step, memory proportional to the actual children.'],
  ],
  internals: [
    ['Child table choices', 'Array indexed by character: fastest, wasteful when sparse. Dict (Python) or hash map: flexible, ~100+ bytes of overhead even for a small dict. Sorted array of (char, child): compact and binary-searchable. Linked list of siblings: smallest, slowest.'],
    ['Compressed (radix) tries', 'Merge chains of single-child nodes into one edge labelled with a string, so the number of nodes is at most twice the number of words. Used in routing tables (longest-prefix match), Patricia trees and some databases.'],
    ['Ternary search trees', 'Each node has three links (less, equal, greater). They give most of the trie\'s speed with the memory of a BST, a good fit when the alphabet is large.'],
    ['Tries versus hash sets in practice', 'For exact membership of a modest set, a hash set is smaller and faster thanks to cache behaviour. Tries win when you need prefixes, ordering or longest-prefix match.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Implement insert, search and startsWith for a trie. What are the complexities?',
      a: 'Each node has a dict `children` and a boolean `end`. Insert walks the characters, creating missing children with `setdefault`, and sets `end` on the last node. Search walks the characters, returning False on a missing child, and returns `node.end` at the end. startsWith is the same walk but returns True once the path exists. All three are O(L) time for a word of length L, independent of the number of stored words. Space is O(total characters inserted) in the worst case.',
      follow: [
        ['Why do you need the end flag?', 'Because a path existing means only that some stored word starts with it. The flag says a word terminates exactly there.'],
        ['What happens on search of an empty string?', 'The loop does nothing and it returns `root.end`, which is False unless "" was inserted.'],
      ],
    },
    {
      lvl: 'mid',
      q: 'When would you pick a trie over a hash set?',
      a: 'When the questions are about prefixes: autocomplete, "is any word in the dictionary a prefix of this string", longest-prefix match, or sorted enumeration. For pure exact-match membership a hash set is usually smaller and faster. A trie also avoids hashing long keys and its worst case is deterministic O(L), without collisions.',
      follow: [],
    },
    {
      lvl: 'senior',
      q: 'Design autocomplete returning the top 5 completions for a prefix.',
      a: 'Build a trie of the queries, with a count at each word end. For a prefix, walk to its node, then find the five best completions in the subtree. Naive DFS of the subtree can be huge for short prefixes. To make lookups O(L), precompute at every node the top 5 completions (store a small list, updated on insert). That trades memory and slower inserts for constant-time queries. In a real system, I would shard by prefix, rebuild periodically from logs instead of updating live, and cache hot prefixes. Ranking would blend frequency with recency and personalisation.',
      follow: [
        ['How do you update top-5 lists on insert?', 'Walk the path; at each node, update the count of the word in the node\'s small list or insert it if it beats the fifth. Cost O(L x 5).'],
        ['What about typos?', 'Use edit-distance search over the trie (prune branches whose row of the DP exceeds the budget), or a BK-tree, or a separate fuzzy index.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Word Search II: find all dictionary words in a grid. Why is a trie better than searching each word?',
      a: 'Searching for each of W words costs O(W x cells x 4^L). Instead build a trie of the dictionary and run one DFS from each cell, walking the trie in step with the grid path. If the current letter has no child in the trie, prune immediately, which kills most branches. When the path reaches a word end, record it. Mark visited cells during the path and restore on return. Remove found words (or prune empty leaves) so the search shrinks. All words are searched together, sharing prefixes.',
      follow: [
        ['Why prune the trie as you go?', 'After a word is found, its leaf can be deleted. When nothing is left under a branch, further DFS into that area is wasted effort.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'You have 500 million URLs to store and query by prefix. What data structure and why?',
      a: 'A naive trie with per-node dicts would use far too much memory, since pointer overhead dominates. Options: a compressed radix tree (fewer nodes), a succinct trie (LOUDS) with bit-vectors and rank/select for a few bits per node, or a sorted, front-coded list of strings with a sparse index, which uses little memory and gives O(log n) lookups plus sequential scan for the prefix. For on-disk data, an LSM tree or B-tree with a prefix-compressed key layout fits better, since disk reads dominate. I would pick based on read/write ratio, whether updates are online, and how much memory is available; a sorted, front-coded, immutable segment merged periodically is often the pragmatic answer.',
      follow: [
        ['What is front coding?', 'Store each string as the length of its common prefix with the previous string plus the remaining suffix. Sorted strings share long prefixes, so this compresses well and still supports binary search over periodic full-key checkpoints.'],
      ],
    },
  ],
};
