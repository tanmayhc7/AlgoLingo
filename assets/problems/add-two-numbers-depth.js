/* Interview depth: LeetCode 2, Add Two Numbers. */
window.DEPTH = {
  thesis: 'Add Two Numbers is schoolbook addition on linked lists. The reverse digit order is a gift: the head is the ones place, so a single pass from the heads with one carry variable does the whole job. The interview signal is the loop condition, the carry rule, and the dummy-head trick that removes a special case.',
  why: [
    ['Reverse order matches addition', 'You add from the least significant digit, and the list gives you exactly that first. If the digits were stored most significant first you would need a stack or to reverse the lists.'],
    ['Carry is state across iterations', 'It must be reassigned every iteration. That is the single most common bug.'],
    ['Dummy head', 'A placeholder node before the real head lets you always write current.next = ..., so the first node is not special. Return dummy.next.']
  ],
  edges: [
    ['Different lengths', 'A finished list contributes 0; test `if l1:` before reading `.val`.'],
    ['Final carry', '[9,9] + [1] needs a third node: keep looping while carry is non-zero.'],
    ['Zeros', '[0] + [0] gives [0], not an empty list.'],
    ['Long lists', 'The values exceed any machine integer, which is why the digits are in a list. Do not convert to int and back in languages with fixed-width integers. (Python could, but the interviewer asks you not to.)'],
    ['Mutating inputs', 'The C solution overwrites the input nodes. Ask whether the inputs may be destroyed.']
  ],
  cost: [
    ['digit by digit', 'O(max(m, n)) time', 'One iteration per position, plus one for a final carry.'],
    ['output list', 'O(max(m, n)) space', 'Required output; auxiliary space is O(1).'],
    ['in-place C version', 'O(1) auxiliary space', 'At most one extra node for a final carry; destroys the inputs.']
  ],
  internals: [
    ['Why total is at most 19', 'Each digit is at most 9, so 9 + 9 + 1 carry = 19, which means the carry is always 0 or 1.'],
    ['In-place pitfalls in C', 'Returning the longer list after writing digits into both lists is only correct because carries extend the shorter list with calloc nodes. Draw it out before trusting it.']
  ],
  qa: [
    {
      lvl: 'mid', q: 'Add two numbers stored as reverse-order digit lists.',
      a: 'Walk both lists together with a carry. Each step total = carry + digits of the lists that remain; append total % 10 to the result, set carry = total // 10. Loop while either list has nodes or the carry is non-zero. Use a dummy head so the first node needs no special case. O(max(m, n)) time.',
      follow: [['Why loop on carry too?', 'So 99 + 1 produces a final 1.'], ['What if the digits are stored forwards?', 'Push each list onto a stack (or reverse it) and add from the ends; or recurse.']]
    },
    {
      lvl: 'senior', q: 'Add two numbers whose digits are stored in forward order, without reversing the lists.',
      a: 'Use two stacks for the digits, or compute the length difference, align the lists recursively, add on the way back up and handle the carry at the top. Building the result by prepending nodes keeps the order correct.',
      follow: []
    },
    {
      lvl: 'senior', q: 'Why does your C version return one of the input lists?',
      a: 'It writes the sum into the nodes of both lists and allocates extra nodes only when a carry needs one, so one list always ends up holding the full result. The cost is that the inputs are destroyed, which must be agreed with the caller.',
      follow: []
    }
  ]
};
