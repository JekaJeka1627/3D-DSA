# 3D-DSA

## Presentation Slides: 
## Slideshow version 2: 3D-DSA: Visualizing Data Structures & Algorithms https://docs.google.com/presentation/d/1xFwwt4iSb4ZBJQCOJlbj7alQ8WKW__NhpKZxgKO_0Sc/edit?usp=sharing
## Version 1: https://docs.google.com/presentation/d/1P0FRXt-9_MyoCqpUYlC9fZlXCyhMwkLFSTTtK_XFrWk/edit?usp=sharing

A dark-themed, React + Three.js playground for visualizing classic data structures and algorithms (DSA) as immersive 3D scenes. The experience highlights performance characteristics (time, space, complexity class) through animated glyphs so learners can *see* how algorithms behave.

## Project Goals

- Map algorithm performance to 3D attributes (height, radius, color, texture, animation).
- Provide interactive panes: sidebar selectors, control bar (input size, distribution, run/pause/reset), central 3D viewport, and metrics panel.
- Support both live instrumentation for small inputs and precomputed datasets for larger comparisons.
- Deliver a cohesive dark UI with intuitive orbit/zoom controls and clear legend/tooltips.

For a detailed design brief, see [`3D-DSA.md`](./3D-DSA.md).

## Tech Stack

- **Framework:** React 18 + TypeScript
- **3D Rendering:** React Three Fiber + Drei (powered by Three.js)
- **Build Tool:** Vite 5

## Getting Started

### Prerequisites

- Node.js 18+ (recommended) and npm 9+

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

- Default URL: <http://localhost:5173>
- Use `npm run dev -- --host 0.0.0.0 --port <port>` to expose it on your LAN or change the port.

### Build for production

```bash
npm run build
```

Outputs static assets under `dist/`.

### Preview the production build

```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

Serves the built assets locally (handy for verifying deployment settings or using a specific port).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts Vite dev server with hot module replacement. |
| `npm run build` | Type-checks with `tsc -b` and bundles via Vite. |
| `npm run preview` | Serves the production build (defaults to port 4173). |

## Project Structure

```text
├── src/
│   ├── components/          # Sidebar, top bar, metrics panel, viewport, etc.
│   ├── scenes/              # 3D scenes & helpers (React Three Fiber)
│   ├── data/                # Algorithm/data-structure metadata & instrumentation
│   └── styles.css           # Global dark-theme styles
├── public/
├── 3D-DSA.md                # Full specification/roadmap
├── vite.config.ts
└── package.json
```

## Developer Notes

- Use `# TODO:` comments to track follow-ups and `# REVIEW:` when another agent/human should double-check logic, per project conventions.
- Each new feature or bugfix should also update `plans.md`, `tasks.md`, and `log.md` accordingly.

## Next Steps

1. Expand vertical slice to include additional algorithms/data structures beyond Bubble Sort + Arrays.
2. Implement instrumentation + playback traces for algorithm animations.
3. Add comparisons view with synchronized `n` sweeps and multiple glyphs.


