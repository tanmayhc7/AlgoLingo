/* Interview depth: Stacks. */
window.DEPTH = {
  thesis:
    'A stack restricts you to one end, and that restriction is the feature: whatever was added last is whatever you must deal with first, which is exactly how nested structure, undo, and "remember where I was" work. Interview questions disguise this as brackets, expression evaluation, nearest greater element, DFS without recursion, and simplifying paths. The skill is spotting when the answer to an item depends on the most recent unresolved item.',
  why: [
    ['Nesting means a stack', 'Brackets, HTML tags, function calls and parenthesised expressions all close in the reverse of the order they opened. The call stack your program runs on is the same idea, which is why deep recursion overflows.'],
    ['A stack holds unfinished work', 'DFS pushes neighbours to visit later; an expression evaluator pushes operands until the operator arrives; a parser pushes the state it must return to. If you find yourself writing "come back to this after", you want a stack.'],
    ['The monotonic stack finds nearest bigger or smaller items in O(n)', 'Keep the stack sorted. A new element pops everything it dominates, and each pop is an answer. Every index is pushed and popped once, so the nested loop is O(n) overall.'],
    ['Recursion is an implicit stack', 'Any recursive algorithm can be written with an explicit stack. Doing so avoids recursion limits and gives control over order, at the cost of managing state by hand.'],
  ],
  edges: [
    ['Pop or peek on empty', 'Python raises `IndexError`. In C it underflows the index and reads garbage. Guard with `if stack`.'],
    ['Overflow in C', 'A fixed array overflows silently when `top` passes the end. Check `top < N - 1` before pushing, or grow with `realloc`.'],
    ['Leftover items at the end', 'Balanced-bracket checks must also verify the stack is empty. `"(("` never fails during the scan but is not balanced.'],
    ['Closer before any opener', '`")"` pops from an empty stack. Check emptiness before comparing.'],
    ['Mixed bracket types', 'Counting each type separately accepts `([)]`. Only a stack enforces order.'],
    ['Monotonic stack ties', 'Pop on `<` or `<=` depends on whether equal values count as "bigger". Decide from the problem, then test duplicates.'],
    ['Storing indexes versus values', 'Store indexes when you need distances or positions; you can always read the value through the index. Storing values alone loses where they were.'],
    ['Using a list as a stack in Python', '`append`/`pop` at the end are O(1). `insert(0, x)` and `pop(0)` are O(n). Keep the top at the end.'],
    ['Evaluating expressions', 'Convert infix to postfix with the shunting-yard algorithm using an operator stack, or evaluate directly with two stacks (values and operators). Watch unary minus, associativity, and integer division rounding toward zero.'],
    ['Min stack', 'To get the minimum in O(1), push `(value, min_so_far)` pairs, or keep a second stack of minima. A single variable fails after pops.'],
    ['Recursion limit', 'Python\'s default depth is about 1000. A DFS on a long chain needs an explicit stack.'],
    ['Thread safety', 'A list is not a synchronised stack. Use `queue.LifoQueue` for producer and consumer threads.'],
  ],
  cost: [
    ['push (append)', 'O(1) amortised', 'Occasional resize.'],
    ['pop', 'O(1)', ''],
    ['peek', 'O(1)', ''],
    ['search', 'O(n)', 'Not what stacks are for.'],
    ['balanced brackets', 'O(n) time, O(n) space', 'Worst case "((((...".'],
    ['monotonic stack pass', 'O(n)', 'Each index pushed and popped once.'],
    ['min stack operations', 'O(1)', 'Extra O(n) space.'],
    ['memory (Python list)', '8 bytes per slot + objects', 'Growth over-allocates about 12.5 percent.'],
    ['memory (C array)', 'sizeof(T) * capacity', 'Fixed; resize by copying.'],
  ],
  internals: [
    ['The call stack', 'Each function call pushes a frame holding arguments, return address and locals; return pops it. This is why recursion depth is limited by stack size (about 8 MB per thread on Linux by default), and why a stack buffer overflow can overwrite a return address.'],
    ['CPython frames', 'Python frames live on the heap, but each Python-to-Python call in older versions also consumed C stack, which is why the recursion limit exists. Since 3.11 pure-Python calls do not grow the C stack, but the limit still applies for safety.'],
    ['Stacks in compilers and VMs', 'CPython bytecode is stack-based: `a + b` becomes LOAD a, LOAD b, BINARY_ADD, operating on a value stack. JVM bytecode is the same. Register machines trade simpler code size for fewer instructions.'],
    ['Undo and backtracking', 'An undo history is a stack of reversible operations. Backtracking search is a stack of choices. Both pop to return to a previous state.'],
  ],
  qa: [
    {
      lvl: 'mid',
      q: 'Check whether a string of brackets is balanced.',
      a: 'Scan once with a stack. Push openers. On a closer, fail if the stack is empty or the popped opener does not match; otherwise continue. At the end, succeed only if the stack is empty. O(n) time, O(n) space. Edge cases: empty string (balanced), only closers, only openers, interleaved types like `([)]`, and characters that are not brackets.',
      follow: [
        ['How would you do it with O(1) space if there is only one bracket type?', 'Keep an integer counter: increment on open, decrement on close, fail if it goes negative, require zero at the end.'],
        ['What if you also want the longest valid substring?', 'Keep a stack of indexes starting with a base of -1. On a closer pop; if the stack becomes empty push the current index as the new base, else the length is `i - stack[-1]`. O(n).'],
      ],
    },
    {
      lvl: 'mid',
      q: 'Implement a min stack with O(1) push, pop, top and get_min.',
      a: 'Store pairs `(value, current_min)` on one stack, where `current_min = min(value, previous_min)`. `get_min` reads the top pair\'s min. Alternatively keep a second stack of minima and push to it when the new value is less than or equal to the current min, popping in step. A single `min` variable fails because after popping the minimum you cannot recover the previous one. Extra space is O(n).',
      follow: [
        ['Can you use O(1) extra space?', 'There is a trick that stores `2 * value - min` for new minima to encode the previous min in the stack itself. It works with care, but it is fragile with overflow and unusual to write in an interview; mention it, and say you would use the pair version.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Given daily temperatures, for each day return how many days you wait for a warmer one. Explain the complexity.',
      a: 'Monotonic stack of indexes with decreasing temperatures. For each day `i`, while the stack is non-empty and today is warmer than the temperature at the top index `j`, pop `j` and set `answer[j] = i - j`. Then push `i`. Indexes left over get 0. The nested loop looks quadratic, but every index is pushed once and popped at most once, so total work is O(n) time with O(n) space. Brute force is O(n^2).',
      follow: [
        ['What changes for next smaller element?', 'Flip the comparison so the stack stays increasing. Same code shape.'],
        ['Largest rectangle in a histogram?', 'Use an increasing stack of indexes. When a bar is shorter than the top, pop the top and compute the width as the distance between the new top and the current index; the popped bar\'s height is the limiting height. Add a sentinel bar of height 0 at the end to flush the stack. O(n).'],
        ['Circular array?', 'Iterate `2n` indexes using `i % n`, pushing only on the first pass.'],
      ],
    },
    {
      lvl: 'senior',
      q: 'Convert a recursive DFS to an iterative one, and explain what you gain and lose.',
      a: 'Push the start node. Loop: pop a node, if unvisited mark it and push its neighbours. The visit order matches recursive DFS only if you push neighbours in reverse order or mark visited when popped consistently. Gains: no recursion limit, no stack overflow on deep graphs, control over memory. Loses: post-order logic needs extra state (push `(node, state)` or push the node twice, once to expand and once to finish), and the code is longer. For cycle detection with colours or for post-order, I would push a marker when entering and handle it when popped.',
      follow: [
        ['How do you get post-order iteratively?', 'Push `(node, False)`. On pop, if the flag is False push `(node, True)` and then each unvisited neighbour with False; if True, process the node. The second visit happens after all children finished.'],
      ],
    },
    {
      lvl: 'staff',
      q: 'Evaluate an arithmetic expression string with `+ - * /` and parentheses.',
      a: 'Two-stack approach or recursive descent. With stacks: scan tokens; push numbers on the value stack; for an operator, while the top operator has higher or equal precedence (for left-associative operators) pop it and apply to the top two values, then push the new operator; `(` pushes a marker; `)` applies operators until the marker. At the end apply the rest. Handle multi-digit numbers, whitespace, unary minus (treat as `0 - x` or track "previous token was an operator"), and integer division semantics (Python `//` floors, C truncates toward zero, so use `int(a / b)` or check signs). Complexity O(n). Recursive descent (one function per precedence level) is easier to extend with functions and exponents, and the call stack plays the role of the operator stack.',
      follow: [
        ['How would you test it?', 'Property-test against Python\'s `eval` on random valid expressions for the operators it shares, and add targeted cases: nested parentheses, unary minus at the start and after `(`, division of negatives, very long chains for recursion depth.'],
        ['What if the expression is huge?', 'Prefer the iterative two-stack form, since recursive descent depth grows with nesting, not length, but pathological nesting can still overflow.'],
      ],
    },
  ],
};
