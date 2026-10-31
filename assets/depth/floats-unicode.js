/* Interview depth: floats-unicode. */
window.DEPTH = {
  "thesis": "Floats are binary approximations (compare with a tolerance and use Decimal for money), text is Unicode code points that must be encoded to bytes (use UTF-8 explicitly), and multi-byte integers have a byte order (little-endian on most CPUs, big-endian on the network).",
  "why": [
    [
      "Correct maths",
      "Avoid money and equality bugs."
    ],
    [
      "Correct text",
      "Avoid mojibake and broken byte offsets."
    ],
    [
      "C interop",
      "struct, ctypes and sockets need byte order."
    ],
    [
      "Interview topic",
      "0.1 + 0.2 and endianness are common questions."
    ]
  ],
  "edges": [
    [
      "NaN",
      "nan != nan; check with math.isnan."
    ],
    [
      "Overflow in C",
      "Python ints are unbounded, C ints are not."
    ],
    [
      "Surrogates and normalisation",
      "The same visible text can be different code points (NFC versus NFD)."
    ],
    [
      "Reading binary files",
      "Open with \"rb\"; do not decode."
    ]
  ],
  "cost": [
    [
      "Float precision",
      "53 bits of mantissa, about 15 to 17 decimal digits."
    ],
    [
      "UTF-8 size",
      "1 byte for ASCII, up to 4 bytes per code point."
    ],
    [
      "Conversion",
      "encode and decode are O(n)."
    ]
  ],
  "internals": [
    [
      "IEEE 754",
      "sign, exponent and mantissa; special values inf and nan."
    ],
    [
      "UTF-8",
      "A variable-width encoding that is backward compatible with ASCII."
    ],
    [
      "Endianness",
      "Only the byte order of multi-byte values differs, not the bits within a byte."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Why is 0.1 + 0.2 != 0.3?",
      "a": "Neither 0.1 nor 0.2 is exactly representable in binary, so the sum is a close but different double.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Difference between a str and bytes?",
      "a": "str is a sequence of Unicode code points; bytes is raw data. encode() and decode() convert between them with an encoding.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Where does endianness matter?",
      "a": "Binary file formats, network protocols, memory dumps and C interop; always specify the byte order explicitly.",
      "follow": []
    }
  ]
};
