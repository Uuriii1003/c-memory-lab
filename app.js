const modules = [
  { name: 'Pointers', icon: '↗', description: 'Addresses, indirection, and the power of a pointer.', available: true },
  { name: 'Arrays', icon: '▥', description: 'Contiguous memory. One element at a time.' },
  { name: 'Stack Frames', icon: '▱', description: 'Follow function calls beneath the surface.' },
  { name: 'Heap', icon: '◇', description: 'Allocate, use, and release dynamic memory.' },
  { name: 'Strings & Buffers', icon: '“', description: 'Characters, boundaries, and the null terminator.' },
  { name: 'Memory Bugs', icon: '⌁', description: 'Find out what happens when memory goes wrong.' },
];

document.getElementById('module-nav').innerHTML = modules.map((module, index) => module.available
  ? `<a class="nav-module selected" href="#pointers-lab" aria-current="page"><span class="nav-icon" aria-hidden="true">${module.icon}</span>${module.name}<span class="nav-arrow" aria-hidden="true">↗</span></a>`
  : `<div class="nav-module unavailable"><span class="nav-icon" aria-hidden="true">${module.icon}</span>${module.name}<span class="nav-soon">SOON</span></div>`).join('');

document.getElementById('module-grid').innerHTML = modules.map((module, index) => {
  const content = `<div class="module-top"><span class="module-icon" aria-hidden="true">${module.icon}</span><span class="module-index">0${index + 1}</span></div><h3>${module.name}</h3><p>${module.description}</p><div class="module-bottom">${module.available ? '<span class="available-label"><span class="status-dot"></span> Ready to explore</span><span class="module-arrow" aria-hidden="true">↗</span>' : '<span>Coming later</span><span class="coming-icon" aria-hidden="true">◷</span>'}</div>`;
  return module.available ? `<a class="module-card available" href="#pointers-lab">${content}</a>` : `<article class="module-card upcoming">${content}</article>`;
}).join('');

const steps = [
  { title: 'Give a value a home.', description: 'Declare an integer named x and initialize it to 10. The variable occupies a location in memory; in this simulation, its address is 0x1000.', message: 'x now holds the value 10.', value: 10 },
  { title: 'Store the address, not the value.', description: 'Declare p as a pointer to an integer. The & operator gets the address of x, so p stores 0x1000. The pointer has its own memory location, separate from x.', message: 'p → x: the address stored in p is the address of x.', value: 10 },
  { title: 'Follow the pointer. Change the value.', description: 'The * operator dereferences p: it follows the stored address to x. Assigning 20 through *p changes x to 20. The address stored in p stays the same.', message: '*p = 20 writes to x. The pointer still points to 0x1000.', value: 20 },
];
let currentStep = 0;
const nextButton = document.getElementById('next-button');
const backButton = document.getElementById('back-button');

function renderStep() {
  const step = steps[currentStep];
  document.querySelectorAll('.code-line').forEach((line, index) => {
    line.classList.toggle('current', index === currentStep);
    line.classList.toggle('executed', index < currentStep);
    if (index === currentStep) line.setAttribute('aria-current', 'step');
    else line.removeAttribute('aria-current');
  });
  document.getElementById('step-label').textContent = `STEP 0${currentStep + 1} / ${['INITIALIZE', 'POINT', 'DEREFERENCE'][currentStep]}`;
  document.getElementById('step-title').textContent = step.title;
  document.getElementById('step-description').textContent = step.description;
  document.getElementById('memory-view').innerHTML = `<div class="memory-row ${currentStep === 2 ? 'changed' : ''}"><div><strong>x</strong><span class="type-label">int</span></div><div class="memory-value">${currentStep === 2 ? '<span class="old-value">10</span><span class="value-arrow">→</span>' : ''}${step.value}</div><code>0x1000</code></div>${currentStep > 0 ? '<div class="pointer-connection"><span class="connection-line"></span><span>points to x</span><span class="connection-arrow">↑</span></div><div class="memory-row pointer-row"><div><strong>p</strong><span class="type-label">int *</span></div><div class="memory-value pointer-value">0x1000 <span aria-hidden="true">↗</span></div><code>0x1008</code></div>' : '<div class="memory-placeholder"><span aria-hidden="true">+</span> A pointer will appear in the next step.</div>'}`;
  document.getElementById('memory-message').textContent = step.message;
  document.getElementById('step-counter').textContent = `Step ${currentStep + 1} of 3`;
  document.querySelectorAll('.step-dots span').forEach((dot, index) => dot.classList.toggle('filled', index <= currentStep));
  backButton.disabled = currentStep === 0;
  nextButton.innerHTML = currentStep === 2 ? 'Replay lab <span aria-hidden="true">↺</span>' : 'Next statement <span aria-hidden="true">→</span>';
}
nextButton.addEventListener('click', () => { currentStep = (currentStep + 1) % steps.length; renderStep(); });
backButton.addEventListener('click', () => { if (currentStep > 0) currentStep--; renderStep(); });
document.getElementById('reset-button').addEventListener('click', () => { currentStep = 0; renderStep(); });
renderStep();
