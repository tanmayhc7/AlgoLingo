/* Lesson data: standard-library toolkit, files and time (structure mode, Flow helper). */
(function () {
  var files = Flow.steps([
    { pl: 2, cl: 2, say: 'tempfile.TemporaryDirectory() makes a fresh folder with a unique name and hands you its path. Tests and scratch work should write here, never in the project folder.', csay: 'char dir[] = "/tmp/xyzXXXXXX"; mkdtemp(dir);', add: [['la', 'tmp/', 0, 0]], tag: [['la', 'cur']] },
    { pl: 3, cl: 3, say: 'write_text creates a.txt inside it.', csay: 'FILE *f = fopen("a.txt", "w"); fputs("hello", f);', add: [['a', 'a.txt', 1, 0]], tag: [['a', 'done']] },
    { pl: 4, cl: 4, say: 'shutil.copy makes a second file, b.txt, with the same contents. a.txt stays where it is.', csay: '/* copy: open both, loop fread and fwrite */', add: [['b', 'b.txt', 2, 0]], tag: [['b', 'cur']] },
    { pl: 5, cl: 5, say: 'shutil.move renames b.txt to c.txt. Beyond single files, shutil.copytree copies a whole folder and shutil.rmtree deletes one permanently, with no recycle bin.', csay: 'rename("b.txt", "c.txt");', lab: [['b', 'c.txt']] },
    { pl: 6, cl: 6, say: 'Leaving the with block deletes tmp and everything inside it, even if an exception was raised. In C you must delete the files and the folder yourself, on every exit path.', csay: '/* unlink each file, then rmdir(dir) */', tag: [['la', 'bad'], ['a', 'bad'], ['b', 'bad']], lab: [['la', 'gone']] },
    { pl: 7, cl: 7, say: 'io.StringIO wraps text held in memory so it behaves like an open file. It is handy in tests, and for passing a function that expects a file something that never touches the disk. BytesIO is the same for bytes.', csay: 'FILE *m = fmemopen(buf, len, "r");', add: [['lb', 'memory', 0, 1], ['s1', 'line1', 1, 1], ['s2', 'line2', 2, 1]], tag: [['lb', 'dim']], rm: ['la', 'a', 'b'] },
    { pl: 8, cl: 8, say: 'readline() returns "line1\\n" and moves the read position on, exactly like a real file.', csay: 'fgets(line, sizeof line, m);', tag: [['s1', 'done'], ['s2', 'cur']] },
  ], { y0: 60, dy: 80 });
  var time = Flow.steps([
    { pl: 2, cl: 2, say: 'datetime.now(timezone.utc) gives an aware datetime: it carries its time zone, here UTC. Store and compare times in UTC; convert to local time only for display.', csay: 'time_t now = time(NULL);   /* seconds since 1970, UTC */', add: [['la', 'aware', 0, 0], ['a', 'now', 1, 0], ['b', 'UTC', 2, 0]], tag: [['la', 'dim'], ['b', 'done']] },
    { pl: 3, cl: 3, say: '+ timedelta(hours=2) moves the time forward and handles day, month and year rollover for you.', csay: 'time_t later = now + 2 * 3600;', add: [['c', '+2h', 3, 0]], tag: [['c', 'cur']] },
    { pl: 4, cl: 4, say: '.isoformat() gives text like 2026-11-03T16:00:00+00:00. It is unambiguous, sorts correctly as text, and is the standard form for logs and JSON.', csay: 'strftime(buf, n, "%Y-%m-%dT%H:%M:%SZ", gmtime(&later));', add: [['d', 'iso', 4, 0]], untag: [['c', 'cur']], tag: [['d', 'done']] },
    { pl: 5, cl: 5, say: 'datetime.now() with no argument gives a naive datetime: it has no time zone, so nobody can tell which "16:00" it means.', csay: 'struct tm *t = localtime(&now);   /* depends on TZ */', add: [['lb', 'naive', 0, 1], ['n', 'now', 1, 1]], tag: [['lb', 'dim'], ['n', 'hot']] },
    { pl: 6, cl: 6, say: 'naive - now raises TypeError: Python refuses to subtract a naive time from an aware one, instead of guessing. Make both aware, and convert for display with .astimezone(ZoneInfo("America/Los_Angeles")).', csay: '/* mixing local and UTC fields is your problem */', add: [['x', 'error', 2, 1]], tag: [['x', 'bad'], ['n', 'bad']] },
    { pl: 7, cl: 7, say: 'statistics.mean([2, 4, 9]) is 5. The module also has median, mode and stdev, which is enough for small data without installing NumPy.', csay: '/* mean: loop and divide */', add: [['m', 'mean', 3, 1], ['v', '5', 4, 1]], tag: [['v', 'done']] },
    { pl: 8, cl: 8, say: 'platform.system() returns "Linux", "Darwin" (macOS) or "Windows"; platform.python_version() gives the Python version. Use them in bug reports and for the rare OS-specific branch.', csay: 'uname(&u);   /* u.sysname */', hot: ['m', 'v'] },
  ], { y0: 60, dy: 80 });
  window.LESSON = {
    id: 'stdlib-files-time', mode: 'ds',
    title: 'Standard-library toolkit: files and time',
    lede: 'Python ships with a large standard library, and a handful of its modules cover most day-to-day scripting without installing anything. tempfile and shutil handle scratch folders and copying or moving files, io.StringIO and BytesIO make in-memory text and bytes behave like files, datetime and zoneinfo handle dates and time zones, statistics does small calculations, and platform reports the operating system. In C each of these is a loop of system calls or a library you write yourself.',
    scenes: [
      { id: 'files', title: 'Temporary files and copying', blurb: 'Make a scratch folder that cleans itself up, copy and move files, and treat text in memory like a file.', trap: 'Building a temp path by hand (/tmp/work) so two runs collide, or forgetting that shutil.rmtree is permanent. Use TemporaryDirectory so the folder is unique and always removed. Also StringIO is text and BytesIO is bytes; mixing them raises TypeError.',
        pyCode: ['import io, shutil, tempfile', 'from pathlib import Path', 'with tempfile.TemporaryDirectory() as tmp:', '    a = Path(tmp) / "a.txt"; a.write_text("hello")', '    shutil.copy(a, Path(tmp) / "b.txt")', '    shutil.move(Path(tmp) / "b.txt", Path(tmp) / "c.txt")', '# leaving the with block deletes tmp and its files', 'buf = io.StringIO("line1\\nline2")', 'print(buf.readline())'],
        cCode: ['#include <stdio.h>', '#include <stdlib.h>', 'char dir[] = "/tmp/xyzXXXXXX"; mkdtemp(dir);', 'FILE *f = fopen("a.txt", "w"); fputs("hello", f); fclose(f);', '/* copy: open both files, loop fread and fwrite */', 'rename("b.txt", "c.txt");', '/* you delete the files and the folder yourself */', 'FILE *m = fmemopen(buf, len, "r");', 'fgets(line, sizeof line, m);'],
        predict: { q: 'An exception is raised inside the with tempfile.TemporaryDirectory() block. What happens to the folder?', options: ['It is left behind for debugging', 'It is still deleted when the block is left', 'It is moved to the trash'], answer: 1, why: 'A context manager runs its cleanup on every way out of the block, including exceptions.' }, steps: files },
      { id: 'time', title: 'Dates, time zones and small helpers', blurb: 'Aware datetimes in UTC, timedelta arithmetic, and the small statistics and platform helpers.', trap: 'Using datetime.now() or utcnow(), which give naive datetimes and mix badly with aware ones. Use datetime.now(timezone.utc), store UTC, and convert at the edges. Also do not do date arithmetic by adding 86400 seconds: days can be 23 or 25 hours long across a daylight saving change; use timedelta on aware values.',
        pyCode: ['from datetime import datetime, timezone, timedelta', 'import statistics, platform', 'now = datetime.now(timezone.utc)', 'later = now + timedelta(hours=2)', 'print(later.isoformat())', 'naive = datetime.now()', 'naive - now', 'statistics.mean([2, 4, 9])', 'platform.system()'],
        cCode: ['#include <time.h>', '#include <sys/utsname.h>', 'time_t now = time(NULL);          /* seconds since 1970, UTC */', 'time_t later = now + 2 * 3600;', 'strftime(buf, n, "%Y-%m-%dT%H:%M:%SZ", gmtime(&later));', 'struct tm *t = localtime(&now);   /* depends on TZ */', '/* mixing local and UTC fields is your problem */', '/* mean: loop and divide */', 'uname(&u);   /* u.sysname */'],
        predict: { q: 'now is aware (UTC) and naive = datetime.now(). What does naive - now do?', options: ['Returns a timedelta of zero', 'Raises TypeError', 'Silently treats naive as UTC'], answer: 1, why: 'Python will not guess a time zone: subtracting naive and aware datetimes raises TypeError.' }, steps: time },
    ],
    builtins: [
      ['tempfile.TemporaryDirectory()', 'A unique scratch folder, deleted when the with block ends. NamedTemporaryFile is the one-file version.'],
      ['shutil.copy / move / copytree / rmtree', 'Copy or move a file, copy a whole folder, delete a folder permanently.'],
      ['io.StringIO / io.BytesIO', 'In-memory text or bytes that behave like an open file.'],
      ['datetime.now(timezone.utc)', 'The current time as an aware UTC datetime; add timedelta to move it.'],
      ['zoneinfo.ZoneInfo("Area/City")', 'Real time zones with daylight saving; use .astimezone(...) to convert.'],
      ['statistics.mean / median / stdev', 'Small calculations with no extra install. platform.system() names the operating system.'],
    ],
  };
})();
