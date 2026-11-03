/* Lesson data: running commands with subprocess (structure mode, Flow helper). */
(function () {
  var run = Flow.steps([
    { pl: 2, cl: 2, say: 'Pass the command as a list: the program first, then each argument as its own item. Python starts the program directly and hands over exactly these items. No shell reads them.', csay: 'execvp("ls", (char *[]){"ls", "-l", "/tmp", NULL});', add: [['la', 'argv', 0, 0], ['a', 'ls', 1, 0], ['b', '-l', 2, 0], ['c', '/tmp', 3, 0]], tag: [['la', 'dim']] },
    { pl: 1, cl: 1, say: 'subprocess.run starts a child process and waits for it to finish. Your program is paused meanwhile.', csay: 'pid_t pid = fork();', add: [['lb', 'child', 0, 1], ['p', 'runs', 1, 1]], tag: [['lb', 'dim'], ['p', 'cur']] },
    { pl: 3, cl: 3, say: 'capture_output=True collects what the child prints into r.stdout and r.stderr, and text=True decodes the bytes to str. timeout=10 kills the child and raises TimeoutExpired if it takes longer. Without a timeout, a hung child hangs your program forever.', csay: '/* parent: read the pipe for stdout; alarm() for a timeout */', add: [['o', 'stdout', 2, 1], ['t', '10 s', 3, 1]], tag: [['o', 'done'], ['t', 'hot'], ['p', 'done']] },
    { pl: 4, cl: 4, say: 'r.returncode is the exit code. By convention 0 means success and anything else means failure. check=True turns a non-zero code into an exception, so a failure cannot be ignored by accident.', csay: 'int st; waitpid(pid, &st, 0);', add: [['rc', 'code 0', 4, 1]], tag: [['rc', 'done']] },
    { pl: 6, cl: 6, say: 'ls /missing exits with code 2. Because check=True, run raises CalledProcessError, with the code and stderr attached. Without check=True the program would carry on with a failed result and no warning.', csay: '/* non-zero status: you must check it yourself */', lab: [['rc', 'code 2']], untag: [['rc', 'done']], tag: [['rc', 'bad']] },
  ], { y0: 60, dy: 80 });
  var sh = Flow.steps([
    { pl: 0, cl: 0, say: 'Imagine name came from a user: a web form, a file, a model\'s output. Here it is "a.txt; rm -rf ~". Treat any such value as untrusted.', csay: 'const char *name = "a.txt; rm -rf ~";   /* untrusted */', add: [['la', 'name', 0, 0], ['a', 'a.txt;', 1, 0]], tag: [['la', 'dim'], ['a', 'cur']] },
    { pl: 1, cl: 1, say: 'With shell=True Python hands the whole string to a shell (/bin/sh). The shell splits it: it runs cat a.txt, then the semicolon ends that command and a second command runs. The user has made your program run their command. This is shell injection.', csay: 'snprintf(cmd, n, "cat %s", name); system(cmd);   /* shell */', add: [['lb', 'shell', 0, 1], ['b', 'cat', 1, 1], ['c', 'a.txt', 2, 1], ['d', ';', 3, 1], ['e', 'rm -rf', 4, 1]], untag: [['a', 'cur']], tag: [['lb', 'dim'], ['e', 'bad'], ['d', 'bad']], hot: ['e'] },
    { pl: 3, cl: 3, say: 'The shell is what parses the string, treating ; & | $( ) and quotes as commands, not as text. system() in C is the same: it hands a string to /bin/sh.', csay: '/* system() hands the string to /bin/sh */', hot: ['d'] },
    { pl: 2, cl: 2, say: 'With a list there is no shell. Python starts cat and passes the whole string as one single argument. cat looks for a file with that odd name, finds none and fails harmlessly.', csay: 'execlp("cat", "cat", name, (char *)NULL);   /* no shell */', add: [['lc', 'list', 0, 0], ['f', 'cat', 1, 0], ['g', '1 arg', 2, 0]], rm: ['la', 'a', 'lb', 'b', 'c', 'd', 'e'], tag: [['lc', 'dim'], ['g', 'done']] },
    { pl: 4, cl: 4, say: 'Use shell=True only for a fixed string you wrote yourself, when you really need shell features such as pipes. For anything user-controlled, pass a list. If a shell is unavoidable, quote each piece with shlex.quote.', csay: '/* exec* passes argv as-is */', hot: ['f', 'g'] },
  ], { y0: 60, dy: 80 });
  window.LESSON = {
    id: 'subprocess-basics', mode: 'ds',
    title: 'Running commands: subprocess',
    lede: 'subprocess.run starts another program, waits for it and gives you its exit code and output. Pass the command as a list, capture the output, set a timeout, and use check=True so failures raise instead of being ignored. The big hazard is shell=True with text you do not control: the shell parses the string, so a value like "a.txt; rm -rf ~" runs a second command. In C this is fork and execvp, waitpid for the status, and system(), which has the same shell hazard.',
    scenes: [
      { id: 'run', title: 'subprocess.run', blurb: 'A list command, captured output, a timeout, and a check on the exit code.', trap: 'Forgetting timeout, so one hung child freezes the whole program, and forgetting check=True, so a failed command is treated as success. Also, capture_output reads everything into memory; for very large output stream it instead.',
        pyCode: ['import subprocess', 'r = subprocess.run(', '    ["ls", "-l", "/tmp"],', '    capture_output=True, text=True, check=True, timeout=10)', 'print(r.returncode)', 'print(r.stdout)', 'subprocess.run(["ls", "/missing"], check=True)'],
        cCode: ['#include <unistd.h>', 'pid_t pid = fork();', 'if (pid == 0) execvp("ls", (char *[]){"ls", "-l", "/tmp", NULL});', '/* parent: read the pipe for stdout; alarm() for a timeout */', 'int st; waitpid(pid, &st, 0);', 'printf("%d", WEXITSTATUS(st));', '/* non-zero status: you must check it yourself */'],
        predict: { q: 'run(["ls", "/missing"], check=True) and ls exits with code 2. What happens?', options: ['run returns normally with returncode 2', 'run raises CalledProcessError', 'run returns None'], answer: 1, why: 'check=True converts a non-zero exit code into a CalledProcessError, with the code and stderr attached.' }, steps: run },
      { id: 'shell', title: 'shell=True and injection', blurb: 'A list goes straight to the program; a string with shell=True goes through a shell that can run extra commands.', trap: 'Building a command with an f-string and shell=True because it is shorter. Anything that reaches that string, including a model\'s output or a filename, can add commands. Use a list. Also a list passed with shell=True only runs the first item as the command.',
        pyCode: ['name = "a.txt; rm -rf ~"   # imagine this came from a user', 'subprocess.run(f"cat {name}", shell=True)', 'subprocess.run(["cat", name])', '# a shell parses the string: ; starts a second command', '# a list is passed as-is: one program, one argument'],
        cCode: ['const char *name = "a.txt; rm -rf ~";   /* untrusted */', 'snprintf(cmd, n, "cat %s", name); system(cmd);   /* shell */', 'execlp("cat", "cat", name, (char *)NULL);   /* no shell */', '/* system() hands the string to /bin/sh */', '/* exec* passes argv as-is */'],
        predict: { q: 'Which is safe for a filename typed by a user?', options: ['subprocess.run(f"cat {name}", shell=True)', 'subprocess.run(["cat", name])', 'os.system("cat " + name)'], answer: 1, why: 'A list is passed to the program as arguments with no shell parsing. The other two give a shell the whole string.' }, steps: sh },
    ],
    builtins: [
      ['subprocess.run([...], ...)', 'Start a program, wait, and return a CompletedProcess.'],
      ['capture_output=True, text=True', 'Collect stdout and stderr, decoded to str.'],
      ['check=True', 'Raise CalledProcessError on a non-zero exit code.'],
      ['timeout=seconds', 'Kill the child and raise TimeoutExpired if it runs too long.'],
      ['r.returncode / r.stdout / r.stderr', 'Exit code and captured output of the finished command.'],
      ['shlex.quote(s) / shlex.split(s)', 'Quote one value for a shell, or split a command string into a list.'],
    ],
  };
})();
