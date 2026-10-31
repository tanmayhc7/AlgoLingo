/* Interview depth: text-cleaning. */
window.DEPTH = {
  "thesis": "Text arrives messy and long. A few small, named steps (collapse whitespace, strip, normalise case) clean it, regular expressions find patterns such as ids, emails and dates, and chunking splits long documents into overlapping pieces that fit a prompt or a search index. Keeping each step small makes it testable.",
  "why": [
    [
      "Every language-model pipeline starts here",
      "Cleaning and chunking sit before embedding, search and prompting."
    ],
    [
      "Token limits",
      "Models read a limited window, so long documents must be split sensibly."
    ],
    [
      "Search quality",
      "Chunk size and overlap change what retrieval can find."
    ],
    [
      "Customer data is messy",
      "Emails, PDFs and exports carry odd whitespace, encodings and boilerplate."
    ]
  ],
  "edges": [
    [
      "Overlap >= size",
      "Step becomes zero or negative: an infinite loop. Validate arguments."
    ],
    [
      "Last chunk is short",
      "Decide whether to keep, merge or drop it."
    ],
    [
      "Characters are not tokens",
      "Limits are in tokens; count with the model's tokenizer."
    ],
    [
      "Greedy regex",
      ".* matches too much; prefer .*? or a specific class, and re.S when text spans lines."
    ],
    [
      "Unicode",
      "Normalise (NFC) and watch non-breaking spaces and smart quotes."
    ],
    [
      "Cutting mid-sentence",
      "Prefer paragraph or sentence boundaries, then fall back to size."
    ]
  ],
  "cost": [
    [
      "re.sub / findall",
      "Linear in the text for simple patterns; nested quantifiers can blow up (catastrophic backtracking)."
    ],
    [
      "Chunking",
      "O(n) time; memory grows with overlap (n x size / step copies)."
    ],
    [
      "Compile once",
      "re.compile avoids re-parsing the pattern in a loop."
    ],
    [
      "split()",
      "O(n) and allocates a list."
    ]
  ],
  "internals": [
    [
      "Raw strings",
      "r\"\\s+\" keeps the backslash for the regex engine."
    ],
    [
      "\\s",
      "Matches space, tab, newline, carriage return and other whitespace."
    ],
    [
      "Slicing",
      "items[i:i+size] copies; it is safe if i+size passes the end."
    ],
    [
      "In C",
      "Manual loops and strtok; you manage buffers and terminators yourself."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "Collapse repeated spaces in a string.",
      "a": "re.sub(r\"\\s+\", \" \", s).strip(), or \" \".join(s.split()).",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "How would you chunk a long document for retrieval?",
      "a": "Split by structure first (headings, paragraphs), then pack pieces into chunks of a token budget with a small overlap so boundary sentences survive. Keep the source and position as metadata.",
      "follow": [
        [
          "What if overlap equals size?",
          "The window never advances; require overlap < size."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "What is catastrophic backtracking?",
      "a": "A regex with nested or ambiguous quantifiers such as (a+)+ can take exponential time on a near-match. Simplify the pattern, use atomic or possessive forms where available, or avoid regex.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Customer PDFs extract with broken line wraps and repeated headers. Plan?",
      "a": "Normalise whitespace, de-hyphenate line ends, remove repeated headers and footers by frequency, chunk by detected sections, keep page numbers as metadata, and spot-check samples with the customer.",
      "follow": []
    }
  ]
};
