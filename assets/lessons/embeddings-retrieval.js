/* Lesson data: embeddings, similarity and retrieval-augmented answers (structure mode, Flow helper). */
(function () {
  var sim = Flow.steps([
    { pl: 0, cl: 0, say: 'An embedding turns text into a list of numbers (a vector) so that texts with similar meaning get similar vectors. To keep the picture small, each vector here has two numbers. Query: "reset password". Three stored passages.', csay: 'float q[2] = {0.9, 0.1};', add: [['la', 'text', 0, 0], ['lb', 'vector', 0, 1], ['lc', 'cosine', 0, 2], ['a', 'query', 1, 0], ['b', 'doc A', 2, 0], ['c', 'doc B', 3, 0], ['d', 'doc C', 4, 0], ['q', '.9 .1', 1, 1], ['va', '.8 .2', 2, 1], ['vb', '.1 .9', 3, 1], ['vc', '.7 .3', 4, 1]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 1, cl: 1, say: 'Cosine similarity measures the angle between two vectors, ignoring their length: dot(a, b) divided by (length of a times length of b). It is 1 for the same direction, 0 for unrelated, -1 for opposite.', csay: 'dot += q[i] * d[i]; nq += q[i] * q[i]; nd += d[i] * d[i];', hot: ['q'] },
    { pl: 2, cl: 2, say: 'query vs doc A: 0.9 x 0.8 + 0.1 x 0.2 = 0.74, and the lengths are about 0.906 and 0.825, so cosine is about 0.99. Very close.', csay: 'score[0] = dot / sqrt(nq * nd);', add: [['sa', '.99', 2, 2]], tag: [['b', 'done'], ['sa', 'done']] },
    { pl: 2, cl: 2, say: 'query vs doc B: 0.9 x 0.1 + 0.1 x 0.9 = 0.18, giving about 0.22. Different topic.', csay: 'score[1] = dot / sqrt(nq * nd);', add: [['sb', '.22', 3, 2]], tag: [['c', 'bad'], ['sb', 'bad']] },
    { pl: 2, cl: 2, say: 'query vs doc C: about 0.96. Close, but A is slightly better.', csay: 'score[2] = dot / sqrt(nq * nd);', add: [['sc', '.96', 4, 2]], tag: [['d', 'cur'], ['sc', 'cur']] },
    { pl: 4, cl: 4, say: 'Sort by score and keep the top k. A is first, then C. This is semantic search: it finds the right passage even when the words differ ("forgot my login" matches "reset password").', csay: 'top_k(scores, 2);', hot: ['sa', 'sc'] },
  ]);
  var rag = Flow.steps([
    { pl: 0, cl: 0, say: 'A model only knows what it was trained on and what is in the prompt. Retrieval-augmented generation (RAG) fetches the relevant passages from your own documents and puts them in the prompt, so the answer is grounded in the customer\'s data.', csay: 'char *answer = rag(question);', add: [['la', 'step', 0, 0], ['a', 'chunk', 1, 0], ['b', 'embed', 2, 0], ['c', 'search', 3, 0], ['d', 'prompt', 4, 0], ['e', 'answer', 5, 0]], tag: [['la', 'dim']] },
    { pl: 1, cl: 1, say: 'Offline, once: split documents into chunks (previous lessons) and embed each chunk. Store the vectors with the chunk text and its source.', csay: 'for each chunk: store(embed(chunk), chunk);', tag: [['a', 'done'], ['b', 'done']], ptr: [['at', 'b', 'down']] },
    { pl: 3, cl: 3, say: 'At question time: embed the question and compare it with every stored vector (or use a vector index to avoid scanning all of them). Keep the top k chunks, say 3.', csay: 'top = top_k(cosine(embed(q), vectors), 3);', tag: [['c', 'done']], ptr: [['at', 'c', 'down']] },
    { pl: 4, cl: 4, say: 'Build the prompt: instructions ("answer only from the context, say so if it is missing"), the retrieved chunks with their sources, then the question.', csay: 'prompt = build(rules, top, q);', tag: [['d', 'done']], ptr: [['at', 'd', 'down']] },
    { pl: 5, cl: 5, say: 'The model answers from the context and you return the answer with its sources so a person can check it. Retrieval quality limits answer quality: if the right chunk was not found, the model cannot use it.', csay: 'return ask(model, prompt);', tag: [['e', 'done']], ptr: [['at', 'e', 'down']] },
    { pl: 6, cl: 6, say: 'Common failures: chunks too big or too small, no overlap, stale index, missing metadata filters (the wrong customer\'s data!), and the model ignoring the context. Measure these with the evaluation lesson.', csay: '/* test retrieval separately */', unptr: ['at'] },
  ]);
  window.LESSON = {
    id: 'embeddings-retrieval', mode: 'ds',
    title: 'Embeddings, similarity and retrieval',
    lede: 'An embedding model turns text into a vector so that similar meanings land close together; cosine similarity measures how close. Searching by vector finds passages by meaning rather than exact words. Retrieval-augmented generation (RAG) uses this to put the relevant pieces of a customer\'s documents into the prompt before the model answers. It is a short pipeline: chunk, embed, search, build the prompt, answer, with sources. In C the similarity is a dot-product loop; in Python it is a few lines.',
    scenes: [
      { id: 'sim', title: 'Cosine similarity', blurb: 'Compare the angle between vectors; rank passages and keep the top k.', trap: 'Comparing raw dot products when vectors have different lengths, dividing by zero for an all-zero vector, and mixing embeddings from different models (their spaces are not comparable). Also scanning every vector does not scale: use an index for millions.',
        pyCode: ['import math', 'def cosine(a, b):', '    dot = sum(x * y for x, y in zip(a, b))', '    na = math.sqrt(sum(x * x for x in a))', '    nb = math.sqrt(sum(y * y for y in b))', '    return dot / (na * nb) if na and nb else 0.0', 'scores = sorted(((cosine(q, v), i) for i, v in enumerate(vecs)), reverse=True)[:k]'],
        cCode: ['float cosine(const float *a, const float *b, int n) {', '    float dot = 0, na = 0, nb = 0;', '    for (int i = 0; i < n; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }', '    return (na && nb) ? dot / sqrtf(na * nb) : 0;', '}', '/* then partial-sort the scores for the top k */'],
        predict: { q: 'Two vectors point in exactly the same direction. What is their cosine similarity?', options: ['0', '1', '-1'], answer: 1, why: 'Same direction means an angle of zero, and cosine of zero is 1; length does not matter.' }, steps: sim },
      { id: 'rag', title: 'The RAG pipeline', blurb: 'Chunk and embed once; per question, search, build the prompt, answer with sources.', trap: 'Treating RAG as one step. Retrieval and generation fail separately, so test each. Also guard access: filter by customer or permission before search, or one customer\'s text can leak into another\'s prompt.',
        pyCode: ['index = [(embed(c.text), c) for c in chunks]', 'def answer(question, k=3):', '    qv = embed(question)', '    top = sorted(index, key=lambda e: -cosine(qv, e[0]))[:k]', '    context = "\\n\\n".join(c.text for _, c in top)', '    prompt = RULES + "\\nContext:\\n" + context + "\\nQuestion: " + question', '    return ask(prompt), [c.source for _, c in top]'],
        cCode: ['for each chunk: store(embed(chunk), chunk);', 'qv = embed(question);', 'top = top_k(cosine(qv, vectors), 3);', 'prompt = build(rules, top, question);', 'return ask(model, prompt);', '/* return sources too */'],
        predict: { q: 'The right passage exists but was not among the top k. What happens to the answer?', options: ['The model finds it anyway', 'The model cannot use it, so the answer is likely wrong or vague', 'The retrieval step retries'], answer: 1, why: 'The model sees only what is in the prompt. Retrieval recall caps answer quality.' }, steps: rag },
    ],
    builtins: [
      ['embed(text)', 'Provider call that returns a vector (often 256 to 3,072 numbers).'],
      ['math.sqrt, zip, sum', 'All you need for cosine similarity.'],
      ['heapq.nlargest(k, ...)', 'Top k without sorting everything.'],
      ['numpy dot / linalg.norm', 'Fast version for many vectors.'],
      ['vector index (FAISS, pgvector, ...)', 'Approximate nearest-neighbour search for large collections.'],
      ['metadata filters', 'Restrict search by customer, date or permission before ranking.'],
    ],
  };
})();
