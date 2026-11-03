/* Interview depth: running commands with subprocess. */
window.DEPTH = {
  thesis: 'subprocess.run starts a child program and returns its exit code and output. Pass the command as a list so no shell is involved, always set a timeout, and use check=True so a non-zero exit raises an exception. shell=True with any untrusted text is a command-injection hole, because the shell parses the string and runs whatever it contains.',
  why: [
    ['A list is data, a string is code', 'In a list every item is one argument, passed as-is. A string given to a shell is parsed, so special characters become commands.'],
    ['Failure should be loud', 'Without check=True a failed command looks like success and the program carries on with bad data.'],
    ['Children can hang', 'A timeout is the only protection against a child that never exits.'],
    ['Same hazard in every language', 'C\'s system() and Python\'s shell=True both hand a string to /bin/sh.'],
  ],
  edges: [
    ['Shell features', 'Pipes, globs (*.txt), ~ and environment expansion happen in the shell. Without shell=True you do these in Python (glob, pathlib, os.path.expanduser).'],
    ['Large output', 'capture_output holds all output in memory; for big output read it as a stream with Popen.'],
    ['Deadlocks', 'With Popen, reading stdout and stderr one after the other can block when a pipe fills up; run() or communicate() handle this for you.'],
    ['Timeouts and grandchildren', 'timeout kills the child, but processes it started may keep running.'],
    ['Encoding', 'Without text=True you get bytes. Pass encoding if the output is not in the default encoding.'],
    ['Environment', 'The child inherits your environment; pass env={...} to control it, and never put secrets on the command line, where other users can see them.'],
  ],
  cost: [
    ['Starting a process', 'Milliseconds, far slower than a function call; avoid it in tight loops.'],
    ['Waiting', 'Your program is blocked until the child exits, unless you use Popen or asyncio.'],
    ['Capturing output', 'Memory proportional to the output size.'],
  ],
  internals: [
    ['fork and exec', 'On Unix the child is created by fork and replaced by the new program with exec; Python uses a lower-level equivalent (posix_spawn or fork_exec).'],
    ['Exit status', 'A process returns a small integer; 0 is success. Death by a signal appears as a negative returncode in Python.'],
    ['Pipes', 'capture_output creates pipes connected to the child\'s stdout and stderr, which Python reads until they close.'],
    ['In C', 'fork, execvp, pipe, waitpid and WEXITSTATUS; system() runs a string through /bin/sh.'],
  ],
  qa: [
    { lvl: 'junior', q: 'How do you run a command and get its output in Python?', a: 'subprocess.run(["cmd", "arg"], capture_output=True, text=True, check=True, timeout=10), then read r.stdout. Pass the command as a list.', follow: [] },
    { lvl: 'mid', q: 'Why is shell=True dangerous?', a: 'The string is parsed by a shell, so characters such as ; | & and $( ) in untrusted input can run extra commands (command injection). A list with no shell passes each item as one argument.', follow: [['When is shell=True acceptable?', 'For a fixed string you wrote yourself that needs shell features such as pipes. If a value must go into a shell string, quote it with shlex.quote.']] },
    { lvl: 'mid', q: 'What does check=True do?', a: 'It raises CalledProcessError when the exit code is not zero, with the code and the captured output attached, so failures cannot be ignored by accident.', follow: [] },
    { lvl: 'senior', q: 'A subprocess call sometimes hangs the whole service. What do you do?', a: 'Set a timeout so it raises TimeoutExpired, kill and clean up, log the command and partial output, and retry or fail the request. If the output is large, stream it rather than capture it, and make sure stdout and stderr are both read to avoid a full pipe blocking the child.', follow: [] },
  ],
};
