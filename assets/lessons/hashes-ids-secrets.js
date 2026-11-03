/* Lesson data: hashes, ids and secrets (structure mode, Flow helper). */
(function () {
  var hl = Flow.steps([
    { pl: 2, cl: 2, say: 'hashlib.sha256 turns any bytes into a fixed-size fingerprint: 32 bytes, shown as 64 hex characters. The same input gives the same digest every time, on every machine.', csay: 'SHA256(data, 10, digest);', add: [['la', 'input', 0, 0], ['a', 'inv-42', 1, 0], ['b', 'sha256', 2, 0], ['c', '3f9a..', 3, 0]], tag: [['la', 'dim'], ['c', 'done']] },
    { pl: 3, cl: 3, say: 'Hashing the same bytes again gives the same digest, so you can check two things are identical without keeping both.', csay: 'memcmp(digest, d2, 32) == 0;', add: [['lb', 'again', 0, 1], ['a2', 'inv-42', 1, 1], ['c2', '3f9a..', 3, 1]], tag: [['lb', 'dim'], ['c2', 'done']] },
    { pl: 4, cl: 4, say: 'Change one character and the digest changes completely: it looks nothing like the first. That makes a digest a good checksum for spotting corruption or change.', csay: 'SHA256(data43, 10, d2);   /* differs */', lab: [['a2', 'inv-43'], ['c2', 'c07e..']], untag: [['c2', 'done']], tag: [['c2', 'bad']] },
    { pl: 5, cl: 5, say: 'A cache key: hash the prompt plus the model name and use the first 16 hex characters as the file name. The same request always finds the same file, and the key is a safe, short name.', csay: 'snprintf(key, 17, "%02x%02x...", digest[0], digest[1]);', hot: ['c'] },
    { pl: 6, cl: 6, say: 'The built-in hash("invoice-42") is a different tool. It feeds dict and set lookups, and for strings it is randomised for each Python run, so the number changes between runs. Never use it for checksums, cache files or anything you save.', csay: '/* your own table hash: fine in memory, not for storage */', add: [['d', 'hash()', 4, 0], ['e', 'varies', 5, 0]], tag: [['d', 'bad'], ['e', 'bad']] },
    { pl: 2, cl: 2, say: 'Not for passwords. sha256 is fast, which is the wrong property: an attacker can try billions of guesses a second. Store passwords with a slow, salted function such as hashlib.scrypt or the bcrypt or argon2 libraries.', csay: '/* use a password hash, not a plain digest */', hot: ['b'] },
  ], { y0: 60, dy: 80 });
  var ids = Flow.steps([
    { pl: 1, cl: 1, say: 'uuid.uuid4() makes a random 128-bit identifier, written as 36 characters. Two machines can create ids at the same moment without talking to each other and, in practice, never clash. Good for request ids, file names and records.', csay: 'uuid_generate(id);   /* libuuid */', add: [['la', 'uuid4', 0, 0], ['a', '9f2c..', 1, 0]], tag: [['la', 'dim'], ['a', 'done']] },
    { pl: 3, cl: 2, say: 'base64 turns bytes into plain text characters (A-Z, a-z, 0-9, + and /) so binary data can travel in JSON or an email. b64encode(b"hello") is b"aGVsbG8=".', csay: '/* base64: write the table or use a library */', add: [['lb', 'base64', 0, 1], ['e', 'hello', 1, 1], ['f', 'aGVs..', 2, 1]], tag: [['lb', 'dim'], ['f', 'cur']] },
    { pl: 4, cl: 2, say: 'b64decode turns it back exactly. Base64 is an encoding, not encryption: anyone can decode it, so a "secret" that is only base64 is not secret.', csay: '/* anyone can decode it */', tag: [['f', 'bad']] },
    { pl: 5, cl: 3, say: 'secrets.token_urlsafe(16) draws from the operating system\'s secure random source. Use it for session tokens, password-reset links and API keys: an attacker cannot predict the next one even after seeing many.', csay: 'getrandom(buf, 16, 0);', add: [['b', 'secrets', 2, 0], ['t', 'x7Qk..', 3, 0]], tag: [['t', 'done']] },
    { pl: 6, cl: 4, say: 'random.randint is for simulations and games. It uses a predictable generator (the Mersenne Twister): after enough outputs an attacker can work out the next ones. Never use it for tokens or passwords.', csay: 'rand();   /* predictable */', add: [['r', 'random', 4, 0], ['g', 'guess', 5, 0]], tag: [['r', 'bad'], ['g', 'bad']] },
    { pl: 0, cl: 0, say: 'Rules of thumb. uuid for ids. secrets for anything an attacker must not guess. random for everything else. base64 only to carry bytes as text.', csay: '/* pick the right source for each job */', hot: ['a', 'b', 't'] },
  ], { y0: 60, dy: 80 });
  window.LESSON = {
    id: 'hashes-ids-secrets', mode: 'ds',
    title: 'Hashes, ids and secrets',
    lede: 'Four small modules answer four different questions. hashlib makes a fixed-size fingerprint of data, for checksums and cache keys. uuid makes ids that never clash. base64 carries bytes as text. secrets makes values an attacker cannot guess, and random does not. Mixing them up is a classic source of security bugs: hash() is not hashlib, base64 is not encryption, and random is not secure. In C these are OpenSSL, libuuid, getrandom and your own code.',
    scenes: [
      { id: 'hashlib', title: 'hashlib: fingerprints', blurb: 'The same input always gives the same digest; a tiny change gives a completely different one.', trap: 'Using hash() for anything you save or compare between runs: string hashing is randomised per run. Also, a plain sha256 is not a password hash: use a slow salted function. And md5 and sha1 are broken for security; they are acceptable only for non-security checksums.',
        pyCode: ['import hashlib', 'data = b"invoice-42"', 'h = hashlib.sha256(data).hexdigest()', 'hashlib.sha256(b"invoice-42").hexdigest() == h', 'hashlib.sha256(b"invoice-43").hexdigest() == h', 'cache_key = h[:16]', 'hash("invoice-42")   # not hashlib'],
        cCode: ['#include <openssl/sha.h>', 'unsigned char data[] = "invoice-42";', 'SHA256(data, 10, digest);', 'SHA256(data, 10, d2); memcmp(digest, d2, 32) == 0;', 'SHA256(data43, 10, d2);   /* differs */', 'snprintf(key, 17, "%02x%02x...", digest[0], digest[1]);', '/* your own table hash: fine in memory, not for storage */'],
        predict: { q: 'Does hash("abc") return the same number in two separate runs of a Python program?', options: ['Yes, always', 'No, string hashing is randomised for each run', 'Only on the same machine'], answer: 1, why: 'Python randomises string hashes per process to defend against collision attacks. Use hashlib for anything stable.' }, steps: hl },
      { id: 'ids', title: 'uuid, base64, secrets', blurb: 'Unique ids, bytes as text, and random values that are safe for security.', trap: 'Generating tokens with random or uuid1 or a timestamp. Use secrets for anything an attacker must not guess. And treating base64 or a hash as a way to hide a secret: base64 is reversible, and a hash of a short or guessable value can be guessed by trying candidates.',
        pyCode: ['import uuid, base64, secrets, random', 'request_id = uuid.uuid4()', 'str(request_id)', 'base64.b64encode(b"hello")', 'base64.b64decode(b"aGVsbG8=")', 'token = secrets.token_urlsafe(16)', 'random.randint(0, 10**9)'],
        cCode: ['#include <uuid/uuid.h>', 'uuid_generate(id);', '/* base64: write the table or use a library */', 'getrandom(buf, 16, 0);   /* OS secure random */', 'rand();   /* predictable */'],
        predict: { q: 'Which should generate a password-reset token?', options: ['random.randint(0, 10**9)', 'secrets.token_urlsafe(16)', 'The base64 of the username'], answer: 1, why: 'secrets uses the operating system\'s secure source. random is predictable and base64 of the username is guessable.' }, steps: ids },
    ],
    builtins: [
      ['hashlib.sha256(b).hexdigest()', 'A 64-character fingerprint of the bytes; stable across runs and machines.'],
      ['hash(x)', 'Built-in used by dicts and sets. Randomised for strings per run; never persist it.'],
      ['uuid.uuid4()', 'A random 128-bit id; .hex gives it without dashes.'],
      ['base64.b64encode / b64decode', 'Bytes to text and back. Encoding, not encryption.'],
      ['secrets.token_urlsafe(n)', 'n random bytes as URL-safe text; also token_hex and token_bytes.'],
      ['random.randint / choice / shuffle', 'Fast, predictable random numbers for simulations and tests, not for security.'],
    ],
  };
})();
