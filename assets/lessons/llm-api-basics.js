/* Lesson data: calling a language model API (structure mode, Flow helper). */
(function () {
  var msgs = Flow.steps([
    { pl: 0, cl: 0, say: 'A chat-style model API takes a list of messages, each with a role and some text, and returns the next message. The model keeps no memory between calls: whatever it should know must be in this list every time.', csay: 'struct msg messages[8]; int n = 0;', add: [['la', 'role', 0, 0], ['lb', 'text', 0, 1], ['m0', 'system', 1, 0], ['m1', 'user', 2, 0], ['m2', 'assist', 3, 0], ['m3', 'user', 4, 0]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 1, cl: 1, say: 'The system message sets the behaviour and rules ("You are a support assistant. Reply in JSON."). It is the first message and applies to the whole conversation.', csay: 'messages[n++] = (struct msg){"system", rules};', add: [['x0', 'rules', 1, 1]], tag: [['m0', 'done'], ['x0', 'done']] },
    { pl: 2, cl: 2, say: 'The user message is the question or task: here a customer ticket.', csay: 'messages[n++] = (struct msg){"user", ticket};', add: [['x1', 'ticket', 2, 1]], tag: [['m1', 'done'], ['x1', 'done']] },
    { pl: 3, cl: 3, say: 'client.chat(model=..., messages=messages) sends the list and returns the assistant message. The reply and token counts come back in the response object.', csay: 'post_json(url, messages, &resp);', add: [['x2', 'reply', 3, 1]], tag: [['m2', 'cur'], ['x2', 'cur']] },
    { pl: 4, cl: 4, say: 'For a follow-up you append the reply and the new question, then send everything again. Cost and latency grow with the length of this list.', csay: 'messages[n++] = reply; messages[n++] = next;', add: [['x3', 'follow', 4, 1]], tag: [['m3', 'done'], ['x3', 'done']] },
  ]);
  var cost = Flow.steps([
    { pl: 0, cl: 0, say: 'Models read and write tokens (pieces of words, about 4 characters of English on average), not characters. You pay per token, the context window caps input plus output, and long prompts add latency.', csay: 'int in_tokens = count(prompt);', add: [['la', 'tokens', 0, 0], ['lb', 'price', 0, 1], ['lc', 'limit', 0, 2], ['t1', 'input', 1, 0], ['t2', 'output', 2, 0], ['t3', 'total', 3, 0]], tag: [['la', 'dim'], ['lb', 'dim'], ['lc', 'dim']] },
    { pl: 1, cl: 1, say: 'Input is 1200 tokens (rules, ticket, retrieved text). Input and output are priced separately and output usually costs more per token.', csay: 'in_tokens = 1200;', add: [['n1', '1200', 1, 0]], tag: [['t1', 'done'], ['n1', 'done']] },
    { pl: 2, cl: 2, say: 'Output is capped with max_tokens. Here the reply used 300 tokens. A cap stops a rambling answer from running up the bill, but cuts the text off mid-sentence if too low (finish reason "length").', csay: 'out_tokens = 300;', add: [['n2', '300', 2, 0]], tag: [['t2', 'done'], ['n2', 'done']] },
    { pl: 3, cl: 3, say: 'Cost = input tokens x input rate + output tokens x output rate. With example rates of $3 and $15 per million: 1200 x 3 + 300 x 15 = 8,100 millionths, about $0.0081 per call.', csay: 'cost = in * r_in + out * r_out;', add: [['p', '$0.008', 1, 1]], tag: [['p', 'cur']] },
    { pl: 3, cl: 3, say: 'Multiply by volume before you promise anything: 100,000 tickets a day at $0.008 is $800 a day. Shortening the prompt, caching the shared prefix and using a smaller model for easy cases are the usual levers.', csay: 'total = cost * calls;', add: [['p2', '$800/d', 2, 1]], tag: [['p2', 'hot']] },
    { pl: 4, cl: 4, say: 'Check the limit before sending: input + max_tokens must fit in the context window (say 8,000). If not, trim old messages or summarise them. Errors to expect: 429 rate limit, 5xx overload, timeouts.', csay: 'if (in + max_out > LIMIT) trim();', add: [['lim', '8000', 3, 2]], tag: [['lim', 'cur'], ['t3', 'cur']] },
  ]);
  window.LESSON = {
    id: 'llm-api-basics', mode: 'ds',
    title: 'Calling a model: messages, tokens and cost',
    lede: 'A language-model API is an HTTP call with a list of role-tagged messages that returns the next message plus token counts. The model has no memory, so every call carries the whole conversation. You are billed and limited in tokens, and the reply can be cut off, refused or fail, so a production call needs a timeout, retries, a token budget and logging of cost and latency. This lesson is the plain mechanics; the next ones turn replies into structured data and tool calls.',
    scenes: [
      { id: 'messages', title: 'Messages and roles', blurb: 'system sets the rules, user asks, assistant answers; the whole list is sent every time.', trap: 'Assuming the model remembers earlier calls (it does not), and putting secrets or untrusted text into the system message. Text from customers or documents is data, not instructions: keep it in user content and expect prompt injection.',
        pyCode: ['messages = [', '    {"role": "system", "content": "You triage tickets. Reply in JSON."},', '    {"role": "user", "content": ticket},', ']', 'reply = client.chat(model=MODEL, messages=messages, max_tokens=300)', 'messages.append({"role": "assistant", "content": reply.text})', 'messages.append({"role": "user", "content": follow_up})'],
        cCode: ['messages[n++] = (struct msg){"system", rules};', 'messages[n++] = (struct msg){"user", ticket};', 'post_json(url, messages, &resp);', 'messages[n++] = (struct msg){"assistant", resp.text};', 'messages[n++] = (struct msg){"user", follow_up};'],
        predict: { q: 'For a follow-up question, what must you send to the model?', options: ['Only the new question', 'The earlier messages plus the new question', 'Nothing, the model remembers'], answer: 1, why: 'The API is stateless. Conversation memory is whatever you put in the messages list.' }, steps: msgs },
      { id: 'cost', title: 'Tokens, cost and limits', blurb: 'Count tokens, price input and output separately, and stay inside the context window.', trap: 'Estimating cost from characters, forgetting that output tokens cost more, and ignoring volume. Also max_tokens too low silently truncates JSON so it no longer parses.',
        pyCode: ['def cost(in_tok, out_tok, rate_in, rate_out):', '    return (in_tok * rate_in + out_tok * rate_out) / 1_000_000', 'c = cost(1200, 300, 3.0, 15.0)', 'daily = c * 100_000', 'if in_tok + max_tokens > LIMIT:', '    messages = trim(messages)'],
        cCode: ['double cost = (in * r_in + out * r_out) / 1e6;', 'double daily = cost * calls;', 'if (in + max_out > LIMIT) trim(messages);'],
        predict: { q: 'The reply stops mid-sentence and the finish reason says "length". What happened?', options: ['The model refused', 'It hit max_tokens or the context limit', 'The network dropped'], answer: 1, why: 'Length means the token cap was reached; raise it or shorten the prompt.' }, steps: cost },
    ],
    builtins: [
      ['client.chat / messages.create', 'The SDK call (name varies by provider): model, messages, max_tokens, temperature.'],
      ['response.usage', 'Input and output token counts: log them on every call.'],
      ['temperature', 'Lower is more deterministic (extraction), higher more varied (brainstorming).'],
      ['stream=True', 'Receive tokens as they are produced, for responsive interfaces.'],
      ['timeout, retries', 'Apply the HTTP lesson: backoff on 429 and 5xx.'],
      ['tiktoken-style tokenizers', 'Count tokens before sending; each model family has its own tokenizer.'],
    ],
  };
})();
