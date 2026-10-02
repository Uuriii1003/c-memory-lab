'use strict';

/* ---------- Helpers ---------- */
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pad = (n) => String(n).padStart(2, '0');
const T = (s) => `<span class="syntax-type">${s}</span>`;
const N = (s) => `<span class="syntax-number">${s}</span>`;
const O = (s) => `<span class="syntax-operator">${s}</span>`;
const K = (s) => `<span class="syntax-keyword">${s}</span>`;
const F = (s) => `<span class="syntax-function">${s}</span>`;
/** A memory cell: name, C type, displayed value, illustrative address, plus flags. */
const cell = (name, type, value, addr, extra = {}) => ({ name, type, value, addr, ...extra });
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Lessons ----------
 * Each step shows memory AFTER the highlighted line runs.
 * Cell flags: old (previous value → shows a change), fresh (just created),
 * pointsTo (name of the cell this pointer targets), garbage (indeterminate), dead (lifetime ended).
 * Non-cell items: { frame, note, popped } group header, { placeholder } hint.
 */
const lessons = [
  {
    id: 'pointers', name: 'Pointers', icon: '↗',
    description: 'Addresses, indirection, and the power of a pointer.',
    file: 'pointer_basics.c',
    title: 'Pointers, made visible.',
    subtitle: 'A pointer holds an address. Let’s see what that actually means.',
    code: [
      `${T('int')} x = ${N('10')};`,
      `${T('int')} ${O('*')}p = ${O('&amp;')}x;`,
      `${O('*')}p = ${N('20')};`,
    ],
    steps: [
      { line: 0, tag: 'INITIALIZE', title: 'Give a value a home.',
        description: 'Declare an integer named x and initialize it to 10. The variable occupies a location in memory; in this simulation, its address is 0x1000.',
        message: 'x now holds the value 10.',
        memory: [cell('x', 'int', '10', '0x1000', { fresh: true }), { placeholder: 'A pointer will appear in the next step.' }] },
      { line: 1, tag: 'POINT', title: 'Store the address, not the value.',
        description: 'Declare p as a pointer to an integer. The & operator gets the address of x, so p stores 0x1000. The pointer has its own memory location, separate from x.',
        message: 'p → x: the address stored in p is the address of x.',
        memory: [cell('x', 'int', '10', '0x1000'), cell('p', 'int *', '0x1000', '0x1008', { pointsTo: 'x', fresh: true })] },
      { line: 2, tag: 'DEREFERENCE', title: 'Follow the pointer. Change the value.',
        description: 'The * operator dereferences p: it follows the stored address to x. Assigning 20 through *p changes x to 20. The address stored in p stays the same.',
        message: '*p = 20 writes to x. The pointer still points to 0x1000.',
        memory: [cell('x', 'int', '20', '0x1000', { old: '10' }), cell('p', 'int *', '0x1000', '0x1008', { pointsTo: 'x' })] },
    ],
    addressNote: 'Illustrative addresses only. Actual memory addresses vary by system and runtime.',
    notes: [
      { symbol: '&amp;', title: 'The address-of operator', html: '<code>&amp;x</code> asks, “Where does x live?” It gives you the address of the variable, not its value.' },
      { symbol: '*', title: 'The dereference operator', html: '<code>*p</code> asks, “What lives at this address?” Read or change the value that p points to. In a declaration like <code>int *p</code>, the star declares a pointer instead.' },
    ],
    why: 'Operating systems use pointers to work with memory, pass data to system calls, and manage data structures. Understanding where a pointer leads is also the first step to recognizing invalid memory access, dangling pointers, and memory corruption.',
    quiz: {
      question: 'After *p = 20 runs, what value is stored in p itself?',
      options: ['0x1000', '20', '10', '0x1008'], answer: 0,
      explain: 'p still holds the address of x. Writing through *p changed x, not p. 0x1008 is where p lives, not what it holds.',
    },
  },
  {
    id: 'arrays', name: 'Arrays', icon: '▥',
    description: 'Contiguous memory. One element at a time.',
    file: 'array_walk.c',
    title: 'Arrays, side by side.',
    subtitle: 'An array is a row of same-sized slots. Pointer math moves one slot at a time.',
    code: [
      `${T('int')} a[${N('3')}] = {${N('10')}, ${N('20')}, ${N('30')}};`,
      `${T('int')} ${O('*')}q = a;`,
      `${O('*')}(q + ${N('1')}) = ${N('25')};`,
      `q${O('++')};`,
      `q[${N('1')}] = ${N('35')};`,
    ],
    steps: [
      { line: 0, tag: 'DECLARE', title: 'Three ints, back to back.',
        description: 'The array a holds three ints in one contiguous block. With a 4-byte int, the elements start at 0x2000, 0x2004, and 0x2008. There are no gaps between them.',
        message: 'a[0], a[1], a[2] sit next to each other in memory.',
        memory: [{ frame: 'int a[3]', note: '3 × 4 bytes, contiguous' }, cell('a[0]', 'int', '10', '0x2000', { fresh: true }), cell('a[1]', 'int', '20', '0x2004', { fresh: true }), cell('a[2]', 'int', '30', '0x2008', { fresh: true }), { placeholder: 'A pointer into the array will appear next.' }] },
      { line: 1, tag: 'DECAY', title: 'The array name becomes an address.',
        description: 'In most expressions, the name a converts to a pointer to its first element. So q = a stores 0x2000, the address of a[0]. No elements are copied.',
        message: 'q → a[0]. Same as writing q = &a[0].',
        memory: [{ frame: 'int a[3]', note: '3 × 4 bytes, contiguous' }, cell('a[0]', 'int', '10', '0x2000'), cell('a[1]', 'int', '20', '0x2004'), cell('a[2]', 'int', '30', '0x2008'), cell('q', 'int *', '0x2000', '0x2010', { pointsTo: 'a[0]', fresh: true })] },
      { line: 2, tag: 'OFFSET', title: 'q + 1 moves one element, not one byte.',
        description: 'Pointer arithmetic is scaled by the size of the pointed-to type. q + 1 is 0x2000 + 1 × 4 = 0x2004, the address of a[1]. Dereferencing it writes 25 there. q itself does not move.',
        message: '*(q + 1) = 25 writes to a[1]. q still holds 0x2000.',
        memory: [{ frame: 'int a[3]', note: '3 × 4 bytes, contiguous' }, cell('a[0]', 'int', '10', '0x2000'), cell('a[1]', 'int', '25', '0x2004', { old: '20' }), cell('a[2]', 'int', '30', '0x2008'), cell('q', 'int *', '0x2000', '0x2010', { pointsTo: 'a[0]' })] },
      { line: 3, tag: 'ADVANCE', title: 'Now the pointer itself moves.',
        description: 'q++ changes the value stored in q: 0x2000 becomes 0x2004. q now points at a[1]. The array is untouched.',
        message: 'q → a[1]. Incrementing a pointer steps to the next element.',
        memory: [{ frame: 'int a[3]', note: '3 × 4 bytes, contiguous' }, cell('a[0]', 'int', '10', '0x2000'), cell('a[1]', 'int', '25', '0x2004'), cell('a[2]', 'int', '30', '0x2008'), cell('q', 'int *', '0x2004', '0x2010', { pointsTo: 'a[1]', old: '0x2000' })] },
      { line: 4, tag: 'INDEX', title: 'Indexing is relative to the pointer.',
        description: 'q[1] means *(q + 1). Since q now holds 0x2004, q + 1 is 0x2008, which is a[2]. The same expression from step 3 reaches a different element because q moved.',
        message: 'q[1] = 35 writes to a[2], not a[1].',
        memory: [{ frame: 'int a[3]', note: '3 × 4 bytes, contiguous' }, cell('a[0]', 'int', '10', '0x2000'), cell('a[1]', 'int', '25', '0x2004'), cell('a[2]', 'int', '35', '0x2008', { old: '30' }), cell('q', 'int *', '0x2004', '0x2010', { pointsTo: 'a[1]' })] },
    ],
    addressNote: 'Illustrative addresses, assuming a 4-byte int. The 4-byte spacing between elements is the point: array elements are contiguous.',
    notes: [
      { symbol: '[]', title: 'Indexing is pointer math', html: '<code>q[i]</code> is defined as <code>*(q + i)</code>. That is why indexing works the same on arrays and on pointers into arrays.' },
      { symbol: '+', title: 'Arithmetic scales by type', html: '<code>q + 1</code> advances by <code>sizeof(*q)</code> bytes. For an <code>int *</code>, that is one whole int, usually 4 bytes.' },
    ],
    why: 'C does not check array bounds. a[3] compiles without complaint and touches whatever sits just past the array. That one fact is the root of buffer overflows, among the most exploited bug classes in systems software.',
    quiz: {
      question: 'After all five lines run, what does the array hold?',
      options: ['{10, 25, 35}', '{10, 35, 30}', '{10, 25, 30}', '{25, 35, 30}'], answer: 0,
      explain: '*(q + 1) wrote 25 to a[1] while q pointed at a[0]. After q++, q[1] reached a[2] and wrote 35.',
    },
  },
  {
    id: 'stack-frames', name: 'Stack Frames', icon: '▱',
    description: 'Follow function calls beneath the surface.',
    file: 'call_stack.c',
    title: 'Stack frames, pushed and popped.',
    subtitle: 'Every call gets its own frame. When the function returns, the frame is gone.',
    code: [
      `${T('int')} ${F('square')}(${T('int')} n) {`,
      `    ${T('int')} r = n ${O('*')} n;`,
      `    ${K('return')} r;`,
      `}`,
      `${T('int')} ${F('main')}(${T('void')}) {`,
      `    ${T('int')} a = ${N('4')};`,
      `    ${T('int')} b = ${F('square')}(a);`,
      `    ${K('return')} ${N('0')};`,
      `}`,
    ],
    steps: [
      { line: 5, tag: 'LOCALS', title: 'main gets a frame for its locals.',
        description: 'main’s frame holds both of its local variables. a is initialized to 4. b already exists but has not been assigned, so its value is indeterminate: leftover bytes, not zero.',
        message: 'b exists, but reading it now would be a bug.',
        memory: [{ frame: 'main()', note: 'frame 0' }, cell('a', 'int', '4', '0x7ffc', { fresh: true }), cell('b', 'int', '??', '0x7ff8', { garbage: true }), { placeholder: 'Calling a function will push a new frame below.' }] },
      { line: 6, tag: 'CALL', title: 'Calling pushes a new frame.',
        description: 'Calling square(a) pushes a frame below main’s, toward lower addresses. The argument is copied: n gets its own 4, separate from a. The return address records where main should resume.',
        message: 'n is a copy. Changing n would not change a.',
        memory: [{ frame: 'main()', note: 'frame 0' }, cell('a', 'int', '4', '0x7ffc'), cell('b', 'int', '??', '0x7ff8', { garbage: true }), { frame: 'square()', note: 'frame 1 · stack grows ↓' }, cell('ret addr', 'code *', 'main, line 7', '0x7ff0', { fresh: true }), cell('n', 'int', '4', '0x7fec', { fresh: true }), cell('r', 'int', '??', '0x7fe8', { garbage: true })] },
      { line: 1, tag: 'COMPUTE', title: 'Work happens in the callee’s frame.',
        description: 'square computes n * n and stores 16 in its own local r. main’s variables are untouched; square cannot see them by name.',
        message: 'r = 16, inside square’s frame.',
        memory: [{ frame: 'main()', note: 'frame 0' }, cell('a', 'int', '4', '0x7ffc'), cell('b', 'int', '??', '0x7ff8', { garbage: true }), { frame: 'square()', note: 'frame 1 · stack grows ↓' }, cell('ret addr', 'code *', 'main, line 7', '0x7ff0'), cell('n', 'int', '4', '0x7fec'), cell('r', 'int', '16', '0x7fe8', { old: '??' })] },
      { line: 2, tag: 'RETURN', title: 'Return pops the frame.',
        description: 'The value 16 is handed back to the caller, and execution jumps to the saved return address. square’s frame is released. Its bytes are not erased; they are simply no longer valid and will be reused by the next call.',
        message: 'square’s frame is gone. Any pointer into it would now dangle.',
        memory: [{ frame: 'main()', note: 'frame 0' }, cell('a', 'int', '4', '0x7ffc'), cell('b', 'int', '??', '0x7ff8', { garbage: true }), { frame: 'square()', note: 'popped', popped: true }, cell('ret addr', 'code *', 'main, line 7', '0x7ff0', { dead: true }), cell('n', 'int', '4', '0x7fec', { dead: true }), cell('r', 'int', '16', '0x7fe8', { dead: true })] },
      { line: 6, tag: 'ASSIGN', title: 'The result lands in the caller.',
        description: 'Back in main, the returned value is stored in b. The old square frame is still shown faded: stale bytes below the top of the stack that nothing should read.',
        message: 'b = 16. Only main’s frame is live.',
        memory: [{ frame: 'main()', note: 'frame 0' }, cell('a', 'int', '4', '0x7ffc'), cell('b', 'int', '16', '0x7ff8', { old: '??' }), { frame: 'square()', note: 'popped', popped: true }, cell('ret addr', 'code *', 'main, line 7', '0x7ff0', { dead: true }), cell('n', 'int', '4', '0x7fec', { dead: true }), cell('r', 'int', '16', '0x7fe8', { dead: true })] },
    ],
    addressNote: 'Simplified model. Real compilers may keep arguments and locals in registers, add padding, or reorder variables. On common platforms the stack grows toward lower addresses.',
    notes: [
      { symbol: '↓', title: 'Push on call, pop on return', html: 'Each call reserves a frame for its locals and bookkeeping. Returning releases it. Frames nest, so the most recent call always finishes first.' },
      { symbol: '=', title: 'Arguments are copies', html: 'C passes by value. <code>n</code> starts as a copy of <code>a</code>. To let a function change the caller’s variable, pass its address: <code>&amp;a</code>.' },
    ],
    why: 'The return address lives on the stack right next to local variables. Overflowing a local buffer can overwrite it and redirect execution: the classic stack-smashing attack. Stack canaries, non-executable stacks, and ASLR all exist to defend this spot.',
    quiz: {
      question: 'Why is it a bug for square to return &r?',
      options: ['r’s frame is popped on return, so the address dangles', 'r is too small to have an address', 'The & operator cannot be used on local variables', 'It returns the value 16 instead of an address'], answer: 0,
      explain: 'The pointer would still hold 0x7fe8, but that memory belongs to no one after the return. The next call can overwrite it at any time.',
    },
  },
];

const upcoming = [
  { name: 'Heap', icon: '◇', description: 'Allocate, use, and release dynamic memory.' },
  { name: 'Strings & Buffers', icon: '“', description: 'Characters, boundaries, and the null terminator.' },
  { name: 'Memory Bugs', icon: '⌁', description: 'Find out what happens when memory goes wrong.' },
];
const modules = [...lessons.map((l) => ({ ...l, available: true })), ...upcoming.map((m) => ({ ...m, available: false }))];

/* ---------- Elements ---------- */
const $ = (id) => document.getElementById(id);
const labEl = $('lab');
const nextButton = $('next-button');
const backButton = $('back-button');
const quizEl = $('quiz');
let lesson = lessons[0];
let currentStep = 0;

/* ---------- Rendering ---------- */
function renderNav() {
  $('module-nav').innerHTML = modules.map((m) => {
    const inner = `<span class="nav-icon" aria-hidden="true">${esc(m.icon)}</span>${esc(m.name)}`;
    if (!m.available) return `<div class="nav-module unavailable">${inner}<span class="nav-soon">SOON</span></div>`;
    const selected = m.id === lesson.id;
    return `<a class="nav-module${selected ? ' selected' : ''}" href="#${m.id}"${selected ? ' aria-current="true"' : ''}>${inner}<span class="nav-arrow" aria-hidden="true">↗</span></a>`;
  }).join('');

  $('module-grid').innerHTML = modules.map((m, index) => {
    const isOpen = m.available && m.id === lesson.id;
    const status = m.available
      ? `<span class="available-label"><span class="status-dot"></span> ${isOpen ? 'Open below' : 'Ready to explore'}</span><span class="module-arrow" aria-hidden="true">↗</span>`
      : '<span>Coming later</span><span class="coming-icon" aria-hidden="true">◷</span>';
    const content = `<div class="module-top"><span class="module-icon" aria-hidden="true">${esc(m.icon)}</span><span class="module-index">${pad(index + 1)}</span></div><h3>${esc(m.name)}</h3><p>${esc(m.description)}</p><div class="module-bottom">${status}</div>`;
    return m.available
      ? `<a class="module-card available${isOpen ? ' is-open' : ''}" href="#${m.id}"${isOpen ? ' aria-current="true"' : ''}>${content}</a>`
      : `<article class="module-card upcoming">${content}</article>`;
  }).join('');

  $('module-count').textContent = modules.length;
  $('available-count').textContent = `${pad(lessons.length)} / ${pad(modules.length)} modules available`;
}

function renderLessonShell() {
  const index = lessons.indexOf(lesson);
  document.title = `C Memory Lab — ${lesson.name}`;
  $('crumb').textContent = lesson.name;
  $('lab-icon').textContent = lesson.icon;
  $('lab-module').textContent = `MODULE ${pad(index + 1)}`;
  $('lab-title').textContent = lesson.title;
  $('lab-subtitle').textContent = lesson.subtitle;
  $('lab-number').textContent = pad(index + 1);
  $('lab-file').textContent = lesson.file;
  $('code-count').textContent = `${lesson.code.length} lines · ${lesson.steps.length} steps`;
  $('code-block').innerHTML = lesson.code.map((html, i) =>
    `<div class="code-line"><span class="line-number">${i + 1}</span><code>${html}</code><span class="line-indicator" aria-hidden="true">←</span></div>`).join('');
  $('address-note').textContent = lesson.addressNote;
  $('step-dots').innerHTML = lesson.steps.map(() => '<span></span>').join('');
  $('notes').innerHTML = lesson.notes.map((n) =>
    `<article class="operator-card"><span class="operator" aria-hidden="true">${n.symbol}</span><div><h3>${esc(n.title)}</h3><p>${n.html}</p></div></article>`).join('');
  $('why-text').textContent = lesson.why;
  renderQuiz();
}

function renderMemory(items) {
  const targets = {};
  items.forEach((item) => { if (item.pointsTo && !item.dead) (targets[item.pointsTo] ||= []).push(item.name); });
  return items.map((item) => {
    if (item.placeholder) return `<div class="memory-placeholder"><span aria-hidden="true">+</span> ${esc(item.placeholder)}</div>`;
    if (item.frame) return `<div class="frame-header${item.popped ? ' popped' : ''}"><span class="frame-name">${esc(item.frame)}</span><span>${esc(item.note || '')}</span></div>`;
    const classes = ['memory-row'];
    if (item.pointsTo) classes.push('pointer-row');
    if (item.old !== undefined || item.fresh) classes.push('changed');
    if (targets[item.name]) classes.push('pointed');
    if (item.dead) classes.push('dead');
    const oldPart = item.old !== undefined
      ? `<span class="old-value">${esc(item.old)}</span><span class="value-arrow" aria-hidden="true">→</span><span class="sr-only">changed to</span>` : '';
    const valuePart = `<span class="${item.garbage ? 'garbage' : ''}">${esc(item.value)}</span>${item.garbage ? '<span class="sr-only">(indeterminate)</span>' : ''}`;
    const pointerPart = item.pointsTo ? ` <span class="pointer-target">→ ${esc(item.pointsTo)}</span>` : '';
    const badge = targets[item.name] ? `<span class="target-badge">← ${esc(targets[item.name].join(', '))} points here</span>` : '';
    const deadNote = item.dead ? '<span class="sr-only">(no longer valid)</span>' : '';
    return `<div class="${classes.join(' ')}"><div class="var-cell"><strong>${esc(item.name)}</strong><span class="type-label">${esc(item.type)}</span>${badge}${deadNote}</div><div class="memory-value">${oldPart}${valuePart}${pointerPart}</div><code>${esc(item.addr)}</code></div>`;
  }).join('');
}

function renderStep(announce = true) {
  const step = lesson.steps[currentStep];
  const total = lesson.steps.length;
  const last = currentStep === total - 1;
  document.querySelectorAll('#code-block .code-line').forEach((line, index) => {
    const isCurrent = index === step.line;
    line.classList.toggle('current', isCurrent);
    if (isCurrent) line.setAttribute('aria-current', 'step');
    else line.removeAttribute('aria-current');
  });
  $('step-label').textContent = `STEP ${pad(currentStep + 1)} / ${step.tag}`;
  $('step-title').textContent = step.title;
  $('step-description').textContent = step.description;
  $('memory-view').innerHTML = renderMemory(step.memory);
  $('memory-message').textContent = step.message;
  $('step-counter').textContent = `Step ${currentStep + 1} of ${total}`;
  document.querySelectorAll('#step-dots span').forEach((dot, index) => dot.classList.toggle('filled', index <= currentStep));
  backButton.disabled = currentStep === 0;
  // A disabled button drops keyboard focus to <body>; keep the learner in the controls.
  if (backButton.disabled && document.activeElement === backButton) nextButton.focus();
  nextButton.innerHTML = last ? 'Replay lab <span aria-hidden="true">↺</span>' : 'Next statement <span aria-hidden="true">→</span>';
  if (announce) $('live-region').textContent = `Step ${currentStep + 1} of ${total}, line ${step.line + 1}. ${step.title} ${step.message}`;
}

function renderQuiz() {
  const q = lesson.quiz;
  quizEl.innerHTML = `<div class="eyebrow">QUICK CHECK</div><h3 id="quiz-question">${esc(q.question)}</h3>`
    + `<div class="quiz-options" role="group" aria-labelledby="quiz-question">${q.options.map((o, i) => `<button class="quiz-option" type="button" data-index="${i}">${esc(o)}</button>`).join('')}</div>`
    + '<p class="quiz-feedback" id="quiz-feedback" aria-live="polite"></p>';
}

/* ---------- Navigation ---------- */
function selectLesson(id, scroll) {
  lesson = lessons.find((l) => l.id === id) || lessons[0];
  currentStep = 0;
  renderNav();
  renderLessonShell();
  renderStep(false);
  if (scroll) {
    labEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    $('lab-title').focus({ preventScroll: true });
  }
}
const isLesson = (id) => lessons.some((l) => l.id === id);

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  if (!isLesson(id)) return;
  event.preventDefault();
  if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  selectLesson(id, true);
});
window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (isLesson(id)) selectLesson(id, true);
});

/* ---------- Controls ---------- */
nextButton.addEventListener('click', () => { currentStep = (currentStep + 1) % lesson.steps.length; renderStep(); });
backButton.addEventListener('click', () => { if (currentStep > 0) currentStep--; renderStep(); });
$('reset-button').addEventListener('click', () => { currentStep = 0; renderStep(); });
labEl.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key === 'ArrowRight' && currentStep < lesson.steps.length - 1) { event.preventDefault(); currentStep++; renderStep(); }
  else if (event.key === 'ArrowLeft' && currentStep > 0) { event.preventDefault(); currentStep--; renderStep(); }
});
quizEl.addEventListener('click', (event) => {
  const button = event.target.closest('.quiz-option');
  if (!button) return;
  const chosen = Number(button.dataset.index);
  const { answer, explain } = lesson.quiz;
  quizEl.querySelectorAll('.quiz-option').forEach((b, i) => {
    b.classList.toggle('right', i === answer);
    b.classList.toggle('wrong', i === chosen && chosen !== answer);
    b.setAttribute('aria-pressed', String(i === chosen));
  });
  $('quiz-feedback').textContent = `${chosen === answer ? 'Correct.' : 'Not quite.'} ${explain}`;
});

/* ---------- Start ---------- */
const initial = location.hash.slice(1);
selectLesson(isLesson(initial) ? initial : 'pointers', isLesson(initial));