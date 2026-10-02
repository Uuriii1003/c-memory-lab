# C Memory Lab

An interactive educational web application for exploring C concepts behind Operating Systems and Computer Security. Version 0.1 makes pointer operations visible, one statement at a time.

## Run locally

No package installation or build step is required. From the project directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. You can also open `index.html` directly in a modern browser. The Python command only serves static files; the application has no backend.

## Current functionality

- Responsive dark dashboard with six learning modules and clear availability labels.
- Interactive Pointers lab for `int x = 10;`, `int *p = &x;`, and `*p = 20;`.
- Current-statement highlighting, explanations, simulated variable values and addresses, and a visual pointer relationship.
- Next, Back, Reset, and Replay controls. Each step shows memory **after** its highlighted statement executes; Back reconstructs the preceding state.
- Address-of and dereference explanations, plus context for OS and security.
- Keyboard-accessible controls, visible focus indicators, a skip link, live announcements, and reduced-motion support.

Addresses are illustrative, not real runtime addresses. The spacing between addresses does not imply a portable C object size or layout. A pointer has its own address and stores the address of another object. This app does not compile or execute arbitrary C.

## Planned modules

1. **Arrays:** contiguous storage, indexing, and pointer relationships.
2. **Stack Frames:** function calls, local variables, and lifetimes.
3. **Heap:** dynamic allocation, ownership, and freeing memory.
4. **Strings & Buffers:** character arrays, null termination, and boundaries.
5. **Memory Bugs:** out-of-bounds access, dangling pointers, use-after-free, and other common errors.

These modules are labeled “Coming later” and do not yet have interactive lessons.

## Architecture

- `index.html`: semantic page structure and learning content.
- `styles.css`: responsive layout, dark theme, and component styling.
- `app.js`: module metadata and a small, deterministic three-step simulation.

Uses plain HTML, CSS, and JavaScript with no framework, runtime dependencies, backend, or build tooling. Google Fonts provides optional DM Sans and IBM Plex Mono; system sans-serif and monospace fallbacks work offline. Future lessons can follow the same explicit state-driven approach without introducing a general C interpreter.
