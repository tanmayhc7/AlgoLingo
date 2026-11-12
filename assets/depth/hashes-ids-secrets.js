/* Interview depth: hashes, ids and secrets. */
window.DEPTH = {
  thesis: 'Each tool answers a different question and must not be swapped for another. hashlib gives a stable fingerprint of data (checksums, cache keys, integrity). hash() is only for in-memory dict and set lookups and changes between runs. uuid gives identifiers that do not clash. base64 is a reversible encoding for carrying bytes as text, not a form of secrecy. secrets gives unpredictable values for security, which random does not.',
  why: [
    ['Right tool for the question', '"Is this the same data?" is a hash. "Give me a unique id" is a uuid. "Give me something an attacker cannot guess" is secrets. "Send these bytes in JSON" is base64.'],
    ['Stability', 'A cache key or checksum that is saved must be reproducible tomorrow, so it cannot come from hash(), which is randomised per run.'],
    ['Security failures are quiet', 'A predictable token works perfectly until someone guesses it, so the mistake survives testing.'],
    ['Passwords are different again', 'They need a slow, salted hash so that guessing is expensive; a fast digest is the wrong tool.'],
  ],
  edges: [
    ['hash() randomisation', 'Strings and bytes hash differently each run (controlled by PYTHONHASHSEED). Never save or compare hash() values across processes.'],
    ['md5 and sha1', 'Collisions can be produced on purpose, so they are not safe for security; fine only for non-adversarial checksums. Use sha256 or better.'],
    ['Passwords', 'Use hashlib.scrypt or pbkdf2_hmac, or the bcrypt or argon2 libraries, with a per-user salt. A plain sha256 can be brute-forced quickly.'],
    ['Comparing secrets', 'Use hmac.compare_digest to compare tokens or digests, so timing does not leak how many characters matched.'],
    ['uuid1 and uuid4', 'uuid1 includes the machine address and time, so it leaks information; uuid4 is random. Neither is a secret token on its own; use secrets for that.'],
    ['base64 padding', 'Output ends with = padding; the URL-safe variant uses - and _ in place of + and /.'],
  ],
  cost: [
    ['sha256', 'Linear in data size, very fast (hundreds of MB per second).'],
    ['Password hashes', 'Deliberately slow and memory hungry; that is the point.'],
    ['uuid4 and token_urlsafe', 'One system call for random bytes: cheap, but do not call in a tight loop for no reason.'],
  ],
  internals: [
    ['Cryptographic hash', 'A one-way function: easy to compute, infeasible to reverse or to find two inputs with the same digest. A tiny change flips about half the output bits.'],
    ['Random sources', 'random uses a deterministic generator (Mersenne Twister) that can be seeded. secrets uses the operating system\'s source (os.urandom, getrandom).'],
    ['uuid4 layout', '122 random bits plus 6 fixed version and variant bits.'],
    ['In C', 'OpenSSL or libsodium for hashing, libuuid for ids, getrandom for secure bytes, and rand() is predictable.'],
  ],
  qa: [
    { lvl: 'junior', q: 'What is the difference between hash() and hashlib?', a: 'hash() is for dict and set lookups inside one running program and is randomised per run for strings. hashlib produces stable cryptographic digests you can save and compare anywhere.', follow: [] },
    { lvl: 'mid', q: 'How would you make a cache key for an LLM response?', a: 'Serialise the model name, parameters and prompt in a stable form (for example JSON with sorted keys), hash it with sha256 and use the hex digest, or a prefix of it, as the key. Same request, same key, on every run.', follow: [['What if the prompt changes by one space?', 'The digest changes completely, so it is a cache miss. Normalise the input first if you want near-identical prompts to share an entry.']] },
    { lvl: 'mid', q: 'Is base64 a way to protect a secret?', a: 'No. It is a reversible encoding for carrying bytes as text. Anyone can decode it. Protect secrets by not storing them in code and by using real encryption or a secrets manager.', follow: [] },
    { lvl: 'senior', q: 'How should passwords be stored?', a: 'Never in plain text and never with a plain fast digest. Use a slow, salted password hash such as scrypt, bcrypt or argon2, store the salt and parameters with the hash, and compare with a constant-time function.', follow: [['Why does the hash have to be slow?', 'If the database leaks, an attacker tries guesses offline. A slow function makes each guess expensive, so billions of guesses take far too long.']] },
  ],
};

/* design-why */
window.DEPTH.design = [
 [
  "Why a hash function is one-way",
  "A cryptographic hash maps any input to a fixed-size digest, and it is built so you cannot recover the input from the digest or find two inputs with the same one. That makes it a fingerprint, good for checking that data has not changed, and not a way to hide data that you must read back."
 ],
 [
  "Why a checksum is not security",
  "A plain checksum (CRC, or a bare SHA-256 of a message) only detects accidents, since anyone can recompute it after changing the data. Protection against tampering needs a secret key (an HMAC) or a signature."
 ],
 [
  "Why passwords use slow, salted hashes",
  "A fast hash lets an attacker try billions of guesses per second, and the same password gives the same hash, so one precomputed table breaks many accounts. Slow functions (bcrypt, scrypt, Argon2) make each guess expensive, and a random salt makes every hash different."
 ],
 [
  "Why random ids use `uuid4` and secrets use `secrets`",
  "`random` is predictable if you know its state and is fine for simulations. Tokens and keys must come from the operating system's secure random source, which `secrets` and `uuid4` use. Compare secrets with `hmac.compare_digest` so timing does not leak how many characters matched."
 ]
];
