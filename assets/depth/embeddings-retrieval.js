/* Interview depth: embeddings-retrieval. */
window.DEPTH = {
  "thesis": "An embedding maps text to a vector so similar meanings are near each other; cosine similarity ranks passages by closeness. Retrieval-augmented generation chunks and embeds documents once, then per question embeds the query, retrieves the top k chunks, builds a prompt with them and answers, returning sources. Quality depends on chunking, retrieval and the prompt, each tested separately.",
  "why": [
    [
      "Customer knowledge",
      "Models do not know a customer's documents; RAG supplies them."
    ],
    [
      "Grounded answers",
      "Sources let a person verify."
    ],
    [
      "Cheaper than retraining",
      "Update the index, not the model."
    ],
    [
      "Everyday applied-AI pattern",
      "Support bots, search and document Q&A."
    ]
  ],
  "edges": [
    [
      "Different models",
      "Vectors from different embedding models are not comparable."
    ],
    [
      "Zero vectors",
      "Guard the division in cosine similarity."
    ],
    [
      "Chunking choices",
      "Too big dilutes, too small loses context; overlap helps."
    ],
    [
      "Access control",
      "Filter by customer or permission before ranking, or data leaks across tenants."
    ],
    [
      "Stale index",
      "Re-embed changed documents."
    ],
    [
      "Not found",
      "Tell the model to say \"not in the documents\" instead of guessing."
    ]
  ],
  "cost": [
    [
      "Brute-force search",
      "O(N x d) per query for N vectors of dimension d."
    ],
    [
      "Index (ANN)",
      "Sub-linear query, approximate results, extra memory and build time."
    ],
    [
      "Embedding calls",
      "Paid per token; embed once, cache."
    ],
    [
      "Prompt size",
      "Top k chunks add input tokens to every question."
    ]
  ],
  "internals": [
    [
      "Cosine",
      "dot(a, b) / (|a| |b|); with normalised vectors it equals the dot product."
    ],
    [
      "Top k",
      "Partial sort or heap, not a full sort."
    ],
    [
      "Vector stores",
      "FAISS, pgvector and managed services implement approximate search."
    ],
    [
      "Hybrid search",
      "Combine keyword (BM25) and vector scores for better recall."
    ]
  ],
  "qa": [
    {
      "lvl": "junior",
      "q": "What is cosine similarity?",
      "a": "The cosine of the angle between two vectors: dot product over the product of lengths. 1 means same direction, 0 unrelated.",
      "follow": []
    },
    {
      "lvl": "mid",
      "q": "Explain a RAG pipeline.",
      "a": "Offline: chunk documents, embed, store vectors with text and source. Online: embed the question, retrieve top k, put them in the prompt with instructions, generate, return sources.",
      "follow": [
        [
          "The answer is wrong. Where do you look?",
          "Retrieval first (was the right chunk in the top k?), then the prompt and the model. Measure retrieval recall separately."
        ]
      ]
    },
    {
      "lvl": "mid",
      "q": "How do you choose chunk size?",
      "a": "Start with a few hundred tokens with a small overlap, split on structure, and tune with an evaluation set of real questions.",
      "follow": []
    },
    {
      "lvl": "senior",
      "q": "Millions of documents and many customers. Design?",
      "a": "Per-tenant filtering or separate indexes, an approximate nearest-neighbour index, metadata filters, incremental re-embedding, caching, hybrid search, reranking, and monitoring of retrieval quality.",
      "follow": []
    }
  ]
};
