/* Interview depth: bitwise operators and masks. */
window.DEPTH = {
  thesis:
    'Bitwise operators act on the individual bits of an integer. With a mask (1 << k) you can test, set, clear or toggle one bit using &, |, & ~ and ^. This is the basis of flags, permission sets, bitsets, hardware registers and compact state in dynamic programming. The operators are the same in C and Python, but C integers have a fixed width and signedness while Python ints are unbounded, so overflow, sign and ~ behave differently.',
  why: [
    ['Embedded and systems work', 'Hardware registers, protocol headers, flags and packed structs are all bit fields.'],
    ['Compact state', 'A set of up to 64 items fits in one integer; bitmask DP and visited sets use this.'],
    ['Interview staple', 'Single number, count bits, power of two, swap without a temp, reverse bits, missing number.'],
    ['Speed and memory', 'Bit operations are single instructions and a bitset is 8x smaller than a bool array.'],
  ],
  edges: [
    ['Operator precedence', 'x & 4 == 0 parses as x & (4 == 0). Always parenthesise: (x & 4) == 0.'],
    ['Signed shifts in C', 'Left-shifting a 1 into the sign bit of a signed int is undefined behaviour. Right shift of a negative is implementation-defined. Use unsigned types for bit work.'],
    ['Shift count', 'Shifting by a count >= the width is undefined in C. In Python, 1 << -1 raises ValueError.'],
    ['Python ~ and negatives', '~x == -x - 1 and negatives behave as infinite two\'s complement. Mask with & 0xFFFFFFFF to emulate 32 bits.'],
    ['Integer promotion', 'In C, uint8_t operands are promoted to int before ~ or <<: ~(uint8_t)0x0F is 0xFFFFFFF0 as an int, not 0xF0. Cast back or mask.'],
    ['Logical versus bitwise', '&& and || (and, or) short-circuit and give a truth value; & and | evaluate both sides and combine bits.'],
  ],
  cost: [
    ['Single operation', 'O(1), one machine instruction for fixed-width ints.'],
    ['Python big ints', 'O(n) in the number of machine words for very large ints.'],
    ['Bitset of n items', 'n / 8 bytes; set operations (union, intersection) cost n / 64 word operations.'],
    ['Looping over bits', 'O(width), or O(number of set bits) with x &= x - 1.'],
  ],
  internals: [
    ['Two\'s complement', 'A negative number is stored as its complement plus one, so -x == ~x + 1 and subtraction reuses the adder.'],
    ['Shifts are multiplication', 'x << k is x * 2^k and x >> k is floor division by 2^k (for non-negative x).'],
    ['Masks', 'mask = (1 << k) - 1 gives the low k bits; x & mask keeps them; x >> k & 1 reads bit k.'],
    ['Hex and binary', 'One hex digit is four bits, so 0xCA = 1100 1010. Hex is how people read bit patterns.'],
  ],
  qa: [
    { lvl: 'junior', q: 'How do you check whether bit k of x is set?', a: '(x >> k) & 1 gives 0 or 1, or (x & (1 << k)) != 0. Parenthesise because == binds tighter than &.', follow: [] },
    { lvl: 'mid', q: 'Set, clear and toggle a bit.', a: 'Set: x | (1 << k). Clear: x & ~(1 << k). Toggle: x ^ (1 << k). OR forces 1, AND with a zero forces 0, XOR with 1 flips.', follow: [['What goes wrong in C for k = 31?', '1 << 31 on a signed int overflows into the sign bit (undefined). Use 1u << 31 or an unsigned 64-bit type.']] },
    { lvl: 'mid', q: 'Why does Python give ~5 == -6?', a: 'Python ints act like infinitely wide two\'s complement, so flipping every bit of 5 gives -5 - 1. In C the same bit pattern would be a large unsigned number or a negative signed one depending on the type.', follow: [] },
    { lvl: 'senior', q: 'Swap two integers without a temporary. Is it a good idea?', a: 'a ^= b; b ^= a; a ^= b works, because x ^ y ^ y == x. It is a party trick: it breaks if both names alias the same variable (the value becomes 0), it is not faster on modern compilers, and it hurts readability.', follow: [] },
    { lvl: 'senior', q: 'Design a permissions system using bits.', a: 'Give each permission one bit (READ = 1, WRITE = 2, EXEC = 4) in an unsigned integer. Combine with |, check with (p & WRITE) == WRITE, revoke with & ~WRITE. It is compact and fast but limited by word width and hard to extend and debug; for many flags use a bitset, or a set of enum values if clarity matters more than size.', follow: [] },
  ],
};
