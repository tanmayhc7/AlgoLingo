/* Lesson data: configuration, secrets and logging (structure mode, Flow helper). */
(function () {
  var env = Flow.steps([
    { pl: 0, cl: 0, say: 'The same program runs on your laptop, in a test and on a customer\'s machine. Settings such as the API key, the model name and a timeout must come from outside the code. Precedence, strongest first: command-line flag, environment variable, config file, built-in default.', csay: 'const char *key = getenv("API_KEY");', add: [['la', 'source', 0, 0], ['a', 'flag', 1, 0], ['b', 'env', 2, 0], ['c', 'file', 3, 0], ['d', 'default', 4, 0], ['lb', 'value', 0, 1]], tag: [['la', 'dim'], ['lb', 'dim']] },
    { pl: 1, cl: 1, say: 'Ask for MODEL. No flag was given, so the flag source has nothing to say.', csay: 'if (flag) use(flag);', tag: [['a', 'dim']], ptr: [['look', 'a', 'up']] },
    { pl: 2, cl: 2, say: 'os.environ.get("MODEL") finds "fast-1" in the environment. A higher source wins, so the file and the default are never read.', csay: 'const char *m = getenv("MODEL");', add: [['v1', 'fast-1', 2, 1]], tag: [['b', 'done'], ['v1', 'done'], ['c', 'dim'], ['d', 'dim']], ptr: [['look', 'b', 'up']] },
    { pl: 3, cl: 3, say: 'Numbers arrive as strings, so convert: int(os.environ.get("TIMEOUT", "30")). A default keeps the program working when the variable is missing.', csay: 'int t = atoi(getenv("TIMEOUT") ?: "30");', add: [['v2', '30', 4, 1]], tag: [['v2', 'cur'], ['d', 'cur']], ptr: [['look', 'd', 'up']] },
    { pl: 4, cl: 4, say: 'Secrets (API keys) go in environment variables or a secrets manager, never in source code, never in the repository, and never in logs. A key committed once must be treated as leaked and rotated.', csay: '/* never hard-code keys */', tag: [['b', 'hot']], unptr: ['look'] },
  ], { y0: 80 });
  var log = Flow.steps([
    { pl: 0, cl: 0, say: 'print is for output; logging is for a record of what happened. Each message has a level. The logger shows messages at or above its threshold. Threshold here: INFO.', csay: 'int level = LOG_INFO;', add: [['la', 'level', 0, 0], ['a', 'DEBUG', 1, 0], ['b', 'INFO', 2, 0], ['c', 'WARN', 3, 0], ['d', 'ERROR', 4, 0], ['lb', 'shown', 0, 1]], tag: [['la', 'dim'], ['lb', 'dim']], ptr: [['min', 'b', 'up']] },
    { pl: 3, cl: 1, say: 'log.debug("payload=%s", p) is below INFO, so it is dropped. DEBUG is for detail you want only while investigating.', csay: 'LOG(DEBUG, ...)  /* suppressed */', add: [['s1', 'no', 1, 1]], tag: [['a', 'dim'], ['s1', 'bad']] },
    { pl: 4, cl: 2, say: 'log.info("fetched %d tickets", n) is at the threshold and is shown. Use INFO for normal milestones.', csay: 'LOG(INFO, ...)', add: [['s2', 'yes', 2, 1]], tag: [['b', 'done'], ['s2', 'done']] },
    { pl: 5, cl: 3, say: 'log.warning("retry %d", i) is shown: something odd happened but the program continues.', csay: 'LOG(WARN, ...)', add: [['s3', 'yes', 3, 1]], tag: [['c', 'cur'], ['s3', 'done']] },
    { pl: 6, cl: 4, say: 'log.exception("call failed") inside an except block logs at ERROR and includes the traceback. This is what you want in a pipeline: the full story, without crashing.', csay: 'LOG(ERROR, ...)', add: [['s4', 'yes', 4, 1]], tag: [['d', 'bad'], ['s4', 'done']] },
    { pl: 7, cl: 5, say: 'Log identifiers (request id, ticket id, model name, latency, token counts), not secrets or full customer text. Lazy "%s" arguments avoid formatting messages that will be dropped.', csay: '/* redact before logging */', unptr: ['min'] },
  ], { y0: 80 });
  window.LESSON = {
    id: 'config-logging', mode: 'ds',
    title: 'Configuration, secrets and logging',
    lede: 'Code that leaves your laptop needs settings that change without editing source: model name, timeouts, endpoints and API keys. Read them from command-line flags, environment variables or a config file, with sensible defaults, and keep secrets out of code and logs. The logging module records what happened with levels (DEBUG, INFO, WARNING, ERROR) so you can find a failure on a customer\'s machine afterwards. In C this is getenv, getopt and syslog.',
    scenes: [
      { id: 'env', title: 'Settings and secrets', blurb: 'Flag, environment, file, default: the first one set wins. Convert strings to the right type.', trap: 'Hard-coding a key "just for now" and committing it. Also environment variables are always strings: "0" and "false" are both truthy, so parse booleans explicitly, and convert numbers with a default.',
        pyCode: ['import os', 'model = os.environ.get("MODEL", "default-1")', 'timeout = int(os.environ.get("TIMEOUT", "30"))', 'key = os.environ["API_KEY"]  # required: fail early', '# never print or log key'],
        cCode: ['const char *m = getenv("MODEL"); if (!m) m = "default-1";', 'const char *t = getenv("TIMEOUT");', 'int timeout = t ? atoi(t) : 30;', 'const char *key = getenv("API_KEY");', 'if (!key) { fprintf(stderr, "API_KEY missing\\n"); exit(1); }'],
        predict: { q: 'What does bool(os.environ.get("DEBUG")) give when DEBUG is set to "false"?', options: ['False', 'True, because any non-empty string is truthy', 'It raises ValueError'], answer: 1, why: 'Parse booleans yourself, for example value.lower() in ("1", "true", "yes").' }, steps: env },
      { id: 'log', title: 'Logging levels', blurb: 'The threshold decides what is kept: debug and info for detail, warning and error for trouble.', trap: 'Using print in library code (cannot be filtered or redirected), logging secrets or whole customer documents, and formatting messages eagerly with f-strings in hot paths. Use log.info("x=%s", x).',
        pyCode: ['import logging', 'logging.basicConfig(level=logging.INFO)', 'log = logging.getLogger(__name__)', 'log.debug("payload=%s", p)', 'log.info("fetched %d tickets", n)', 'log.warning("retry %d", i)', 'try: call()', 'except Exception: log.exception("call failed")'],
        cCode: ['openlog("app", LOG_PID, LOG_USER);', 'syslog(LOG_DEBUG, "payload");  /* filtered by setlogmask */', 'syslog(LOG_INFO, "fetched %d tickets", n);', 'syslog(LOG_WARNING, "retry %d", i);', 'syslog(LOG_ERR, "call failed: %s", strerror(errno));'],
        predict: { q: 'The level is INFO. Which of these messages are shown: debug, info, warning, error?', options: ['Only info', 'info, warning and error', 'All four'], answer: 1, why: 'Messages at or above the threshold are kept; debug is below INFO.' }, steps: log },
    ],
    builtins: [
      ['os.environ.get(k, default)', 'Read a variable with a fallback; os.environ[k] raises KeyError if missing.'],
      ['argparse.ArgumentParser', 'Command-line flags with help text and types.'],
      ['logging.getLogger(__name__)', 'One logger per module; configure once at startup.'],
      ['log.exception(msg)', 'Logs at ERROR with the traceback; use inside except.'],
      ['dotenv (python-dotenv)', 'Third-party: load a local .env file into the environment. Keep .env out of git.'],
      ['pathlib.Path.home() / ".config"', 'Where per-user config files usually live.'],
    ],
  };
})();
