/* LeetCode 49: Group Anagrams. Python is T's solution (sorted word as dict key); the C version and the write-up were added to match (T's folder has no explained.md or C yet). */
(function () {
  var O = { x0: 80, dx: 95, y0: 40, dy: 45 };
  var PY = ['class Solution:', '    def groupAnagrams(self, strs):', '        groups = {}', '        for w in strs:', '            key = "".join(sorted(w))', '            if key not in groups:', '                groups[key] = []', '            groups[key].append(w)', '        return list(groups.values())'];
  var C = [
    'typedef struct { char key[101]; int idx; } Item;     /* key = the word\'s letters, sorted */',
    'static int by_letter(const void *a, const void *b) { return *(const char*)a - *(const char*)b; }',
    'static int by_key(const void *a, const void *b) { return strcmp(((const Item*)a)->key, ((const Item*)b)->key); }',
    '',
    'void groupAnagrams(char** strs, int n) {      /* prints one group per line */',
    '    Item *items = malloc(n * sizeof(Item));',
    '    for (int i = 0; i < n; i++) {',
    '        strcpy(items[i].key, strs[i]);',
    '        qsort(items[i].key, strlen(items[i].key), 1, by_letter);   /* sort the letters */',
    '        items[i].idx = i;',
    '    }',
    '    qsort(items, n, sizeof(Item), by_key);      /* equal keys become neighbours */',
    '    for (int i = 0; i < n; i++) {',
    '        if (i == 0 || strcmp(items[i].key, items[i - 1].key) != 0) printf("\\n");',
    '        printf("%s ", strs[items[i].idx]);',
    '    }',
    '    free(items);',
    '}'
  ];
  var words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
  var keys = ['aet', 'aet', 'ant', 'aet', 'ant', 'abt'];
  var grp = { aet: 0, ant: 1, abt: 2 }, count = { aet: 0, ant: 0, abt: 0 };
  var g1 = [{ pl: 2, cl: 5, say: 'strs = [eat, tea, tan, ate, nat, bat]. Two words are anagrams exactly when their letters sorted are the same, so the sorted word is the dict key.', csay: 'Item *items = malloc(n * sizeof(Item));', add: [['w', '·', 0, 0], ['k', '·', 1, 0]] }];
  words.forEach(function (w, i) {
    var k = keys[i], g = grp[k], isNew = count[k] === 0, col = count[k] + 1;
    var f = { pl: isNew ? 6 : 7, cl: 8, say: '"' + w + '" sorted is "' + k + '". ' + (isNew ? 'No group for "' + k + '" yet, so start one and add the word.' : 'The "' + k + '" group exists, so append the word.'), csay: 'qsort(items[i].key, ...);', lab: [['w', w], ['k', k]], add: [['m' + i, w, col, g + 1]] };
    if (isNew) f.add.unshift(['g' + g, k, 0, g + 1]);
    f.tag = [['m' + i, 'cur']];
    if (i) f.untag = [['m' + (i - 1), 'cur']];
    count[k]++;
    g1.push(f);
  });
  g1.push({ pl: 8, cl: 12, say: 'Return list(groups.values()): [eat, tea, ate], [tan, nat], [bat]. One sort per word makes it O(n * k log k) for n words of length k, plus O(n * k) memory for the keys.', csay: 'for (...) print by key', tag: [['g0', 'done'], ['g1', 'done'], ['g2', 'done']], untag: [['m5', 'cur']] });

  var g2 = [
    { pl: 4, cl: 8, say: 'Why the sorted word and not something cheaper? Try "aab" and "abb". They are not anagrams: one has two a\'s, the other two b\'s.', csay: '', add: [['x', 'aab', 0, 0], ['y', 'abb', 1, 0], ['kx', '·', 3, 0], ['ky', '·', 4, 0]] },
    { pl: 4, cl: 8, say: 'Sorted: "aab" and "abb". Different keys, so different groups. Correct.', csay: '', lab: [['kx', 'aab'], ['ky', 'abb']], tag: [['kx', 'done'], ['ky', 'done']] },
    { pl: 4, cl: 8, say: 'If the key were the set of letters, both words become {a, b}: the same key, so they would be wrongly grouped. A key must keep the counts. A sorted word keeps them; a tuple of 26 letter counts does too and avoids the sort (O(n * k)).', csay: '', lab: [['kx', '{ab}'], ['ky', '{ab}']], tag: [['kx', 'bad'], ['ky', 'bad']] }
  ];

  window.LESSON = {
    id: 'lc-group-anagrams', mode: 'ds',
    title: 'Group Anagrams',
    lede: 'Put words that are anagrams of each other into the same list. Give every word a canonical key that is identical for all of its anagrams, then use a dict from key to list. This is Valid Anagram scaled up from a pair to a whole collection.',
    scenes: [
      {
        id: 'group', title: 'Sorted word as the key', blurb: 'Sort the letters of each word. Anagrams produce the same string, which makes a perfect dict key.',
        trap: 'The key must be hashable: use the sorted string (or a tuple of counts), never a list. A list as a dict key raises TypeError: unhashable type.',
        pyCode: PY, cCode: C,
        predict: { q: 'Which key does "bat" get, and does it join an existing group?', options: ['"abt", and it starts a new group', '"aet", and it joins the first group', '"bat", and it starts a new group'], answer: 0, why: 'Sorted letters of "bat" are "abt". No earlier word has that key, so it starts its own group.' },
        steps: Flow.steps(g1, O)
      },
      {
        id: 'key', title: 'What makes a good key', blurb: 'The key has to throw away order but keep counts.',
        trap: 'A set of letters throws away the counts, so "aab" and "abb" collide. A sorted string or a count tuple keeps them.',
        pyCode: PY, cCode: C,
        predict: { q: 'Would key = frozenset(word) group "aab" and "abb" correctly?', options: ['Yes, they use the same letters', 'No, it merges words with different letter counts'], answer: 1, why: 'Both give {a, b}. Anagrams need equal counts, which a set discards.' },
        steps: Flow.steps(g2, O)
      }
    ],
    builtins: [
      ['sorted(w)', 'Returns a list of the characters in order.'],
      ['"".join(sorted(w))', 'Turns the sorted characters back into a string key.'],
      ['groups.setdefault(key, []).append(w)', 'Create the list on first use; the code above does the same with an explicit if.'],
      ['collections.defaultdict(list)', 'A dict that creates an empty list for a missing key.'],
      ['groups.values()', 'A view of the lists; wrap it in list() to return a list of lists.']
    ]
  };

  window.PROBLEM = {
    slug: 'group-anagrams', url: 'https://leetcode.com/problems/group-anagrams',
    statement: ['Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.'],
    examples: [['strs = ["eat","tea","tan","ate","nat","bat"]', '[["bat"],["nat","tan"],["ate","eat","tea"]]'], ['strs = [""]', '[[""]]'], ['strs = ["a"]', '[["a"]]']],
    constraints: ['`1 <= strs.length <= 10^4`', '`0 <= strs[i].length <= 100`', '`strs[i]` consists of lowercase English letters.'],
    writeup: [
      { h: 'Key insight', p: ['Two words are anagrams exactly when their letters, sorted, are the same string. So the sorted word is a canonical form: every anagram of "eat" maps to "aet". Use it as a dict key and append each original word to the list for its key.'] },
      { h: 'How it works', ul: ['`groups = {}` maps sorted key to the list of words with that key.', 'For each word, `key = "".join(sorted(w))`.', 'If the key is new, create its list. Then append the word.', '`list(groups.values())` is the answer; groups come out in first-seen order.'] },
      { h: 'Complexity', p: ['With n words of length at most k: time O(n * k log k), because each word is sorted; space O(n * k) for the keys and the lists.'] },
      { h: 'Faster key for lowercase words', p: ['Instead of sorting, build a tuple of 26 letter counts as the key: `tuple(counts)`. That is O(k) per word, so the total is O(n * k) time. The tuple is hashable, a list would not be.'] },
      { h: 'C version', p: ['C has no dict. The C code pairs each word with its sorted key, sorts the pairs by key with `qsort`, and groups consecutive equal keys. It is O(n * k log k + n log n * k) and needs no hash table.'] },
      { h: 'Edge cases', ul: ['The empty string "" has key "" and forms its own group.', 'A word with no anagram forms a group of one.', 'Duplicate words stay in the same group; nothing is deduplicated.'] },
      { h: 'Common pitfalls', ul: ['A list as a dict key (TypeError: unhashable).', 'A set of letters as the key: it loses the counts.', 'Returning `groups` instead of `list(groups.values())`.'] }
    ]
  };
})();
