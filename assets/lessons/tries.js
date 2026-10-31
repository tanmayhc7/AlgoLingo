/* Lesson data: Tries (structure mode). */
(function () {
  var P = { r: [500, 60], c: [300, 150], d: [700, 150], a: [300, 240], o: [700, 240], rr: [200, 330], t: [400, 330] };
  function nd(id, label, key) { return ['node', id, label, P[key][0], P[key][1], 'circle']; }
  var ROOT = nd('root', '*', 'r');

  var insert = [
    { pl: -1, cl: -1, say: 'A trie stores words letter by letter. The root is empty; each edge is a letter; a green node marks "a word ends here". Insert car, cat and do.', csay: 'Each node holds a table of children and an end flag.', ds: [ROOT, ['tag', 'root', 'mark'], ['ptr', 'cur', 'root', 'up']] },
    { pl: 3, cl: 3, say: 'Insert "car". There is no c child of the root, so create one and move to it. Then create a, then r.', csay: 'Create missing nodes as you walk.', ds: [nd('c', 'c', 'c'), ['edge', 'root', 'c', 'l'], nd('a', 'a', 'a'), ['edge', 'c', 'a', 'l'], nd('r', 'r', 'rr'), ['edge', 'a', 'r', 'l'], ['ptr', 'cur', 'r', 'up']] },
    { pl: 4, cl: 4, say: 'Mark the last node as the end of a word. Without that flag, the trie could not tell a stored word from a prefix of one.', csay: 'cur->end = 1;', ds: [['tag', 'r', 'done'], ['hot', 'r']] },
    { pl: 3, cl: 3, say: 'Insert "cat". Follow c and a: both already exist, so nothing is created. Only the final t is new. Words that share a prefix share nodes.', csay: 'c and a exist; add t.', ds: [['ptr', 'cur', 'a', 'up'], nd('t', 't', 't'), ['edge', 'a', 't', 'r'], ['tag', 't', 'done'], ['hot', 'c', 'a']] },
    { pl: 3, cl: 3, say: 'Insert "do". It shares nothing with car or cat, so d and o are both new, and o is marked as a word end. Eight letters were inserted but only 6 nodes exist besides the root.', csay: 'New branch d - o.', ds: [['unptr', 'cur'], nd('d', 'd', 'd'), ['edge', 'root', 'd', 'r'], nd('o', 'o', 'o'), ['edge', 'd', 'o', 'l'], ['tag', 'o', 'done'], ['hot', 'd', 'o']] },
  ];

  var searchOps = [
    { pl: -1, cl: -1, say: 'The trie now holds car, cat and do. Lookup follows one edge per letter, so the cost depends on the length of the word, not on how many words are stored.', csay: 'Same trie.', ds: [ROOT, ['tag', 'root', 'mark'], nd('c', 'c', 'c'), nd('d', 'd', 'd'), nd('a', 'a', 'a'), nd('o', 'o', 'o'), nd('r', 'r', 'rr'), nd('t', 't', 't'), ['edge', 'root', 'c', 'l'], ['edge', 'root', 'd', 'r'], ['edge', 'c', 'a', 'l'], ['edge', 'd', 'o', 'l'], ['edge', 'a', 'r', 'l'], ['edge', 'a', 't', 'r'], ['tag', 'r', 'done'], ['tag', 't', 'done'], ['tag', 'o', 'done']] },
    { pl: 1, cl: 1, say: 'search("ca"): follow c, then a. Both exist, so the path is there.', csay: 'Walk c, a.', ds: [['ptr', 'cur', 'a', 'up'], ['tag', 'c', 'cur'], ['tag', 'a', 'cur']] },
    { pl: 2, cl: 2, say: 'But a is not marked as a word end, so "ca" is not a stored word: search returns False. starts_with("ca") returns True, because the path exists. That one flag is the difference.', csay: 'No end flag: not a word, but a valid prefix.', ds: [['tag', 'a', 'bad'], ['hot', 'a']] },
    { pl: 1, cl: 1, say: 'search("cat"): follow c, a, t, and t is marked as a word end. True.', csay: 'Path exists and end flag set.', ds: [['untag', 'a', 'bad'], ['untag', 'a', 'cur'], ['untag', 'c', 'cur'], ['ptr', 'cur', 't', 'up'], ['hot', 'c', 'a', 't']] },
    { pl: 1, cl: 1, say: 'search("cow"): follow c, then look for o under c. There is no such edge, so stop immediately and return False. A miss ends at the first missing letter.', csay: 'No child "o": return false.', ds: [['ptr', 'cur', 'c', 'up'], ['tag', 'c', 'bad'], ['hot', 'c']] },
  ];

  window.LESSON = {
    id: 'tries',
    mode: 'ds',
    title: 'Tries',
    lede:
      'A trie (prefix tree) stores strings one character per edge, so words with a common prefix share nodes. Insert, search and prefix queries each cost O(L), where L is the length of the word, regardless of how many words are stored. That makes it the natural structure for autocomplete, spell checking and prefix matching. The price is memory: one table of children per node.',
    scenes: [
      { id: 'insert', title: 'Insert', blurb: 'Walk the letters, creating missing nodes. Mark the last node as a word end.', trap: 'Forgetting the end flag. Without it you cannot distinguish "car" the word from "car" the prefix of "cart".', pyCode: ['node = root', 'for ch in word:', '    node = node.children.setdefault(ch, Node())', '    # create the child if missing', 'node.end = True'], cCode: ['Node *n = root;', 'for (; *s; s++) {', '    int i = *s - \'a\';', '    if (!n->next[i]) n->next[i] = new_node();   n = n->next[i];', '} n->end = 1;'], predict: { q: 'You insert "car" then "cat". How many nodes (excluding the root) exist afterwards?', options: ['6', '4', '3'], answer: 1, why: 'c and a are shared. The nodes are c, a, r and t: 4 in total.' }, steps: insert },
      { id: 'search', title: 'Search and prefix', blurb: 'Follow the same path. search also checks the end flag; starts_with does not.', trap: 'search("ca") and starts_with("ca") answer differently on the same path. The end flag is what separates them.', pyCode: ['node = root', 'for ch in word:', '    if ch not in node.children: return False', '    node = node.children[ch]', 'return node.end   # starts_with: return True'], cCode: ['Node *n = root;', 'for (; *s; s++) {', '    n = n->next[*s - \'a\']; if (!n) return 0;', '}', 'return n->end;   /* starts_with: return 1 */'], predict: { q: 'The trie holds car, cat and do. What does <code>starts_with("ca")</code> return?', options: ['True, because the path c-a exists', 'False, because "ca" is not a word', 'An error'], answer: 0, why: 'A prefix query only needs the path to exist. The end flag matters only for exact-word search.' }, steps: searchOps },
    ],
    builtins: [
      ['dict', 'Python tries use a dict of children per node: sparse and flexible.'],
      ['dict.setdefault(k, Node())', 'Get the child, creating it if missing, in one call.'],
      ['[None] * 26', 'Array of children for lowercase letters: faster but 26 slots per node even if mostly empty.'],
      ['str.startswith(p)', 'For a few words, a linear scan with startswith is simpler than a trie.'],
      ['"#" key or .end flag', 'Two ways to mark a word end; a flag is clearer.'],
    ],
  };
})();
