/* Interview depth: standard-library toolkit, files and time. */
window.DEPTH = {
  thesis: 'Most scripting needs are already in the standard library, and knowing the right module saves a dependency and a class of bugs. Use tempfile for scratch space that cleans itself up, shutil for copying and moving, io.StringIO and BytesIO to treat memory as a file, and timezone-aware datetimes in UTC for any time that is stored or compared. A naive datetime has no time zone, so it is ambiguous, and Python refuses to mix it with an aware one.',
  why: [
    ['Cleanup you cannot forget', 'TemporaryDirectory uses a context manager, so the folder is removed even when an exception interrupts the code.'],
    ['Tests without the disk', 'StringIO and BytesIO let you pass "a file" to a function in a test with no files to create or clean up.'],
    ['Time bugs are expensive', 'Naive local times, daylight saving changes and servers in different zones produce wrong data that looks plausible. UTC plus aware datetimes removes the ambiguity.'],
    ['Fewer dependencies', 'These modules ship with Python, are stable and are available in locked-down customer environments.'],
  ],
  edges: [
    ['Daylight saving', 'A day can be 23 or 25 hours long. Add timedelta to aware times, and do not add 86400 seconds by hand.'],
    ['utcnow() is naive', 'datetime.utcnow() returns a naive value that looks like UTC and is easy to misuse; prefer datetime.now(timezone.utc).'],
    ['rmtree is permanent', 'shutil.rmtree removes a tree with no recycle bin. Double-check the path, and never build it from unchecked input.'],
    ['Copy versus move across disks', 'shutil.move falls back to copy then delete when the target is on another file system, so it is not atomic there.'],
    ['Text versus bytes', 'StringIO holds text, BytesIO holds bytes. Writing the wrong kind raises TypeError.'],
    ['Metadata', 'shutil.copy copies contents and permissions; copy2 also keeps timestamps.'],
  ],
  cost: [
    ['copy / move on one disk', 'Move is a rename (constant time); copy is linear in file size.'],
    ['copytree / rmtree', 'Linear in the number of files and total size.'],
    ['StringIO', 'Memory only: fast, but the whole content lives in RAM.'],
  ],
  internals: [
    ['Context managers', 'TemporaryDirectory implements __enter__ and __exit__; __exit__ deletes the folder on every exit path.'],
    ['Aware versus naive', 'A datetime has an optional tzinfo. With tzinfo it is aware and can be compared to other aware values; without it, it is naive.'],
    ['zoneinfo', 'Reads the operating system\'s time-zone database (or the tzdata package) and handles daylight saving rules.'],
    ['In C', 'time(NULL) gives UTC seconds; gmtime and localtime convert to fields; mkdtemp, rename, fopen and unlink do the file work.'],
  ],
  qa: [
    { lvl: 'junior', q: 'How do you create a scratch folder that is always cleaned up?', a: 'with tempfile.TemporaryDirectory() as tmp: ... The folder has a unique name and is deleted when the block exits, even after an exception.', follow: [] },
    { lvl: 'mid', q: 'What is the difference between a naive and an aware datetime?', a: 'An aware datetime carries a time zone, so it identifies one moment. A naive one does not, so the same value can mean different moments. Subtracting or comparing a naive with an aware value raises TypeError.', follow: [['What do you store in a database?', 'UTC, as an aware datetime or an ISO 8601 string, and convert to the user\'s time zone only when displaying.']] },
    { lvl: 'mid', q: 'How would you test a function that reads from a file without creating one?', a: 'Make it accept a file-like object and pass io.StringIO("...") in the test. For binary data use io.BytesIO.', follow: [] },
    { lvl: 'senior', q: 'Why is adding 86400 seconds not the same as adding one day?', a: 'Across a daylight saving change a local day is 23 or 25 hours. timedelta(days=1) added to an aware datetime in a real time zone keeps the wall-clock time; add seconds only when you mean elapsed time.', follow: [] },
  ],
};
