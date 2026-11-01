/* Interview depth: LeetCode 20, Valid Parentheses. */
window.DEPTH = {
  thesis: 'Valid Parentheses is the textbook stack problem: matching nested structure where the latest opener closes first. Interviewers look for the three failure modes (closer on an empty stack, mismatched type, leftover openers) and for the small optimisations that show you understand the invariant.',
  why: [
    ['Nesting is LIFO', 'In a correctly nested string the innermost open bracket closes first. A stack stores exactly the open brackets, innermost on top.'],
    ['Why counters are not enough', 'Counting each bracket type accepts "([)]". The stack keeps the order, which is the entire constraint.'],
    ['Pushing the closer', 'Storing the expected closer turns the check into stack.pop() == ch with no mapping on the closer side.']
  ],
  edges: [
    ['Closer on empty stack', '")" must return False before any pop; popping an empty list raises IndexError in Python and underflows in C.'],
    ['Leftover openers', '"((" has no mismatch, only an unfinished stack: return top == 0, not True.'],
    ['Odd length', 'Always False; cheap early exit.'],
    ['Wrong type', '"(]": the pop gives ) and the character is ].'],
    ['Other characters', 'The problem only has brackets. In real code decide whether other characters are ignored or invalid.']
  ],
  cost: [
    ['stack', 'O(n) time, O(n) space', 'Each character pushed or popped once.'],
    ['replace "()" repeatedly', 'O(n^2) time', 'Works but slow: each pass scans the string.'],
    ['counter per type', 'O(n) time, O(1) space, wrong', 'Fails on "([)]".']
  ],
  internals: [
    ['Python list as a stack', 'append and pop at the end are O(1) amortised; popping from the front would be O(n), so keep the top at the end.'],
    ['C stack', 'A char array of size n with an integer top is enough because the stack can never exceed the string length.']
  ],
  qa: [
    {
      lvl: 'mid', q: 'Check that the brackets in a string are balanced and correctly nested.',
      a: 'Use a stack. Push each opener (or its closer). For a closer, return False if the stack is empty or the popped value does not match. At the end return whether the stack is empty. O(n) time, O(n) space.',
      follow: [['Why not just count?', '"([)]" has equal counts and is invalid; only the stack captures order.'], ['What are the optimisations?', 'Reject odd lengths, push the expected closer, and prune when the stack is longer than the remaining input.']]
    },
    {
      lvl: 'senior', q: 'Return the length of the longest valid parentheses substring.',
      a: 'Keep a stack of indexes with a sentinel -1 at the bottom. On "(" push its index; on ")" pop, and if the stack is empty push the current index as the new sentinel, else the length is i - stack[-1]. O(n) time.',
      follow: [['Can it be O(1) space?', 'Yes: two left-to-right and right-to-left passes with open and close counters.']]
    },
    {
      lvl: 'senior', q: 'The input is a 100 GB stream. What can you do?',
      a: 'The stack depth equals the current nesting depth, not the length, so memory is proportional to the deepest nesting. For one bracket type you only need a counter. For several types the stack is required, and you can spill the bottom of it to disk if depth is huge.',
      follow: []
    }
  ]
};
