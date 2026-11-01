/* LeetCode 2: Add Two Numbers. Python (dummy head) and C (reuses the input nodes) are T's solutions; write-up condensed from explained.md. */
(function () {
  var O = { x0: 80, dx: 95, y0: 40, dy: 45 };
  function digits(prefix, vals, row) { return vals.map(function (v, i) { return [prefix + i, String(v), i + 1, row]; }); }
  var PY = ['class Solution(object):', '    def addTwoNumbers(self, l1, l2):', '        dummy = ListNode()', '        current = dummy', '        carry = 0', '', '        while l1 or l2 or carry:', '            total = carry', '            if l1:', '                total += l1.val', '                l1 = l1.next', '            if l2:', '                total += l2.val', '                l2 = l2.next', '', '            carry = total // 10', '            total = total % 10', '            current.next = ListNode(total)', '            current = current.next', '', '        return dummy.next'];
  var C = [
    'ListNode* addTwoNumbers(ListNode* l1, ListNode* l2){',
    '    ListNode *temp1=l1;',
    '    bool flag=0;',
    '    ListNode *temp2=l2;',
    '    int value=0;',
    '    while(temp1!=NULL && temp2!=NULL)',
    '    {',
    '        value=(temp1->val)+(temp2->val);',
    '        if(flag == 1){',
    '            value = value + 1;',
    '        }',
    '        if (value>=10)',
    '            flag = 1;',
    '        else',
    '            flag = 0;',
    '        temp2->val = value % 10;',
    '        temp1->val = value % 10;',
    '        if(flag == 1 && temp1->next == NULL)',
    '        {',
    '            temp1->next = (ListNode*)calloc(1,sizeof(ListNode));',
    '        }',
    '        if(flag == 1 && temp2->next == NULL)',
    '        {',
    '            temp2->next = (ListNode*)calloc(1,sizeof(ListNode));',
    '        }',
    '        temp1=temp1->next;',
    '        temp2=temp2->next;',
    '    }',
    '    if(flag){',
    '        if(temp1) temp1->val=1;',
    '        if(temp2) temp2->val=1;',
    '    }',
    '    if(temp1 != NULL)',
    '        return l1;',
    '    else',
    '        return l2;',
    '}'
  ];
  var CL_STORE = C.indexOf('        temp2->val = value % 10;'), CL_GROW = C.indexOf('        if(flag == 1 && temp1->next == NULL)'), CL_RET = C.indexOf('        return l1;'), CL_INIT = C.indexOf('    ListNode *temp1=l1;');
  function step(i, a, b, cin, last) {
    var total = a + b + cin;
    return { pl: 15, cl: CL_STORE,
      say: 'Digit ' + (i + 1) + ': ' + (a !== null ? a : '0') + ' + ' + (b !== null ? b : '0') + ' + carry ' + cin + ' = ' + total + '. Store ' + (total % 10) + ', carry ' + Math.floor(total / 10) + '.',
      csay: 'value = temp1->val + temp2->val (+1 if flag); store value % 10',
      lab: [['cy', 'carry ' + Math.floor(total / 10)], ['tt', 'sum ' + total]],
      add: [['r' + i, String(total % 10), i + 1, 2]], tag: [['r' + i, 'cur']].concat(a !== null ? [['p' + i, 'cur']] : [], b !== null ? [['q' + i, 'cur']] : []),
      untag: i ? [['r' + (i - 1), 'cur'], ['p' + (i - 1), 'cur'], ['q' + (i - 1), 'cur']] : [] };
  }
  /* 342 + 465 = 807 stored in reverse: [2,4,3] + [5,6,4] -> [7,0,8] */
  var s1 = [
    { pl: 2, cl: CL_INIT, say: 'l1 = 2 > 4 > 3 stands for 342, l2 = 5 > 6 > 4 for 465. The head is the ones digit, which is the order you add by hand. A dummy head (Python) means the first result node needs no special case.', csay: 'ListNode *temp1 = l1, *temp2 = l2;', add: digits('p', [2, 4, 3], 0).concat(digits('q', [5, 6, 4], 1), [['l1', 'l1', 0, 0], ['l2', 'l2', 0, 1], ['rs', 'sum', 0, 2], ['cy', 'carry 0', 5, 0], ['tt', 'sum ·', 5, 1]]) },
    step(0, 2, 5, 0), step(1, 4, 6, 0), step(2, 3, 4, 0),
    { pl: 20, cl: CL_RET, say: 'Both lists are used up and the carry is 0, so the loop ends. The result 7 > 0 > 8 is 807, which is 342 + 465. Each input node is visited once: O(max(m, n)) time.', csay: 'return l1 or l2', tag: [['r0', 'done'], ['r1', 'done'], ['r2', 'done']], untag: [['r2', 'cur'], ['p2', 'cur'], ['q2', 'cur']] }
  ];
  /* 99 + 1 = 100: [9,9] + [1] -> [0,0,1] */
  var s2 = [
    { pl: 4, cl: CL_INIT, say: 'l1 = 9 > 9 stands for 99 and l2 = 1 for 1. The sum, 100, has one more digit than either input, so the loop must not stop when the lists end.', csay: '', add: digits('p', [9, 9], 0).concat(digits('q', [1], 1), [['l1', 'l1', 0, 0], ['l2', 'l2', 0, 1], ['rs', 'sum', 0, 2], ['cy', 'carry 0', 5, 0], ['tt', 'sum ·', 5, 1]]) },
    step(0, 9, 1, 0),
    step(1, 9, null, 1),
    { pl: 6, cl: CL_GROW, say: 'Both lists are exhausted but carry is 1. The loop condition l1 or l2 or carry is still true, so it runs once more.', csay: 'if (flag == 1 && temp1->next == NULL) calloc a new node', untag: [['r1', 'cur'], ['p1', 'cur']] },
    { pl: 15, cl: CL_STORE, say: 'Digit 3: 0 + 0 + carry 1 = 1. Store 1, carry 0. The result is 0 > 0 > 1, which is 100.', csay: '', lab: [['cy', 'carry 0'], ['tt', 'sum 1']], add: [['r2', '1', 3, 2]], tag: [['r2', 'mark']] },
    { pl: 20, cl: CL_RET, say: 'carry is 0 and both lists are empty: done. Without "or carry" in the condition, the final 1 would be lost and the answer would read 00.', csay: 'return l1 or l2', tag: [['r0', 'done'], ['r1', 'done'], ['r2', 'done']] }
  ];

  window.LESSON = {
    id: 'lc-add-two-numbers', mode: 'ds',
    title: 'Add Two Numbers',
    lede: 'Two linked lists hold the digits of two numbers in reverse order, least significant first. Add them the way you do on paper: digit by digit from the ones place, carrying as you go. The reverse order means the head is already the place to start.',
    scenes: [
      {
        id: 'add', title: 'Digit by digit with carry', blurb: 'At each position add the two digits and the incoming carry. Keep total % 10 and pass total // 10 on.',
        trap: 'carry must be assigned on every iteration (carry = total // 10). Setting it only inside "if total >= 10" leaves a stale 1 that is never cleared, and the loop never ends.',
        pyCode: PY, cCode: C,
        predict: { q: 'Adding 2 > 4 > 3 and 5 > 6 > 4, what is the carry after the second digit?', options: ['0', '1'], answer: 1, why: 'The second digits give 4 + 6 = 10: store 0, carry 1. That carry goes into the third digit: 3 + 4 + 1 = 8.' },
        steps: Flow.steps(s1, O)
      },
      {
        id: 'final-carry', title: 'The final carry: 99 + 1', blurb: 'The sum can be longer than both inputs. The leftover carry needs one more node.',
        trap: 'If the loop only tests l1 or l2, the last carry is dropped: 99 + 1 would give 00 instead of 100.',
        pyCode: PY, cCode: C,
        predict: { q: 'How many nodes does the answer for [9,9] + [1] have?', options: ['2', '3'], answer: 1, why: '99 + 1 = 100, which is three digits: 0 > 0 > 1. The extra node comes from the final carry.' },
        steps: Flow.steps(s2, O)
      }
    ],
    builtins: [
      ['total // 10', 'Floor division gives the carry as an int. Plain / returns a float in Python 3.'],
      ['total % 10', 'The digit to store.'],
      ['ListNode(val)', 'Allocate a node; LeetCode defines the class for you.'],
      ['dummy.next', 'The real head, after the placeholder node.'],
      ['while l1 or l2 or carry', 'Run until both lists and the carry are used up.']
    ]
  };

  window.PROBLEM = {
    slug: 'add-two-numbers', url: 'https://leetcode.com/problems/add-two-numbers',
    statement: ['You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit. Add the two numbers and return the sum as a linked list.', 'You may assume the two numbers do not contain any leading zero, except the number 0 itself.'],
    examples: [['l1 = [2,4,3], l2 = [5,6,4]', '[7,0,8]    (342 + 465 = 807)'], ['l1 = [0], l2 = [0]', '[0]'], ['l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]', '[8,9,9,9,0,0,0,1]']],
    constraints: ['The number of nodes in each list is in the range `[1, 100]`.', '`0 <= Node.val <= 9`', 'The list represents a number without leading zeros.'],
    writeup: [
      { h: 'Key insight', p: ['Digits are stored in reverse order, so the head is the ones digit. That is the order you add by hand (right to left), so walk both lists from the head and add digit by digit, carrying as you go.'] },
      { h: 'Approach: digit-by-digit addition with carry (Python)', ul: ['`dummy` is a throwaway node, so appending to `current.next` works the same for the first node as for every other. Return `dummy.next` at the end.', 'Loop while `l1 or l2 or carry`: lists with digits left, or a leftover carry. The `carry` term handles `99 + 1 = 100`.', '`total` starts from the incoming carry. Add each list\'s digit if that list still has nodes: a list that has run out contributes 0, which handles different lengths.', '`total % 10` is the digit to store and `total // 10` is the carry. The maximum total is 9 + 9 + 1 = 19, so the carry is 0 or 1.'] },
      { h: 'The C solution reuses the input nodes', p: ['Instead of building a new list, the C version adds into the first list\'s nodes in place and allocates a fresh node only when a carry has nowhere to go (`calloc`). It writes the digit into both lists, then returns whichever list has nodes left. It uses O(1) extra memory beyond the few new nodes, but it destroys the input lists. That is fine on LeetCode and worth mentioning as a trade-off in an interview.'] },
      { h: 'Why carry must be assigned every iteration', p: ['`carry` lives outside the loop, so it only changes when something assigns to it. If you write `if total >= 10: carry = total // 10; total = total % 10`, then when `total < 10` the branch is skipped and `carry` keeps its old value. A carry of 1 that was already consumed never clears, and the loop never terminates. `carry = total // 10` resets it to 0 automatically. Rule of thumb: a variable carrying state between iterations must be assigned on every path through the loop body.'] },
      { h: 'Worked example: 99 + 1', table: [['Step', 'carry in', 'l1', 'l2', 'total', 'digit', 'carry out'], ['1', '0', '9', '1', '10', '0', '1'], ['2', '1', '9', '-', '10', '0', '1'], ['3', '1', '-', '-', '1', '1', '0']], p: ['After step 3 both lists are exhausted and the carry is 0, so the loop ends. The result is 0 > 0 > 1.'] },
      { h: 'Complexity', p: ['With m and n the list lengths: time O(max(m, n)), one iteration per digit position plus at most one for a final carry. Space O(max(m, n)) for the output list, which is required, so auxiliary space is O(1).'] },
      { h: 'Edge cases', ul: ['Different lengths: `[1,2,3] + [4]`; the exhausted list contributes 0.', 'Final carry: `[9,9] + [1]`.', 'Zero: `[0] + [0]` gives `[0]`.'] },
      { h: 'Common pitfalls', ul: ['Updating `carry` only inside `if total >= 10`.', 'Using `/` instead of `//` (a float in Python 3).', 'Naming a variable `sum`, which shadows the built-in.', 'Returning `dummy` instead of `dummy.next`.'] }
    ]
  };
})();
