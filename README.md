# 3D-DSA

## Presentation Slides: 
## Slideshow version 2: 3D-DSA: Visualizing Data Structures & Algorithms https://docs.google.com/presentation/d/1xFwwt4iSb4ZBJQCOJlbj7alQ8WKW__NhpKZxgKO_0Sc/edit?usp=sharing

demo: https://0xhqli.github.io/3D-DSA/

A dark-themed, React + Three.js playground for visualizing classic data structures and algorithms (DSA) as immersive 3D scenes. The experience highlights performance characteristics (time, space, complexity class) through animated glyphs so learners can *see* how algorithms behave.

## Features

### Algorithms & Data Structures

**8 Sorting & Searching Algorithms:**
- Bubble Sort, Selection Sort, Insertion Sort
- Merge Sort, Heap Sort, Quick Sort
- Linear Search, Binary Search
- Each with live instrumentation tracking steps, comparisons, swaps, and memory usage

**7 Interactive Data Structures:**
- Array - Static grid visualization
- Linked List - Sphere chain with insert/delete operations
- Stack - Vertical stack with push/pop animations
- Queue - Horizontal queue with enqueue/dequeue
- Binary Search Tree - Hierarchical node structure with insert operations
- Binary Heap - Complete binary tree with sift-up/sift-down animations
- Hash Table - Grid of buckets with collision chain visualization

### Data Persistence & Management

**Save & Load Presets:**
- Save algorithm configurations with custom names
- Load saved presets instantly
- Persistent storage across browser sessions

**Run History:**
- Automatic tracking of last 10 algorithm runs
- Detailed metrics for each run (steps, comparisons, swaps, memory)
- Load previous runs to compare performance

**User Settings:**
- Save default animation speed preferences (Slow/Normal/Fast)
- Save default input size preferences
- All settings persist using browser localStorage

### Export & Import

**Export Capabilities:**
- **CSV Export**: Run history data for analysis in Excel or data tools
  - Includes timestamp, algorithm name, input size, metrics
  - One-click download with timestamped filename
- **JSON Export**: Complete backup of presets and history
  - Formatted JSON for easy sharing and backup
  - Preserves all configuration details

**Import Capabilities:**
- **JSON Import**: Restore presets and history from backup files
  - Merge imported presets with existing ones
  - Seamless configuration sharing between sessions

### 3D Visualization Features

**Performance Glyph Encoding:**
- **Height** = Operation count / time complexity
- **Radius** = Memory usage / space complexity
- **Color** = Efficiency level:
  - Green (#6bff95) - Efficient: O(log n), O(n)
  - Yellow (#ffd166) - Moderate: O(n log n)
  - Red (#ff6b6b) - Expensive: O(n²), O(2^n)
- **Texture/Material** = Case type (best/average/worst)

**Interactive Controls:**
- OrbitControls for camera (orbit, pan, zoom)
- Reset View button to restore camera position
- Hover tooltips showing detailed metrics
- Real-time animation playback with speed controls

### Real-time Metrics

**Algorithm Metrics:**
- Steps (total operations executed)
- Comparisons (comparison operations)
- Swaps (swap operations)
- Memory usage (bytes, formatted)
- Big-O complexity notation (best/average/worst cases)

**Data Structure Metrics:**
- Operations counter
- Activity rate (operations per second)
- Size estimation with memory model
- Last action tracking

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
## Current Status

**Completed:**
- 8 algorithms with full instrumentation and playback
- 7 interactive data structures with animated operations
- Data persistence (presets, history, settings)
- Export/Import functionality (CSV, JSON)
- Real-time metrics tracking and visualization
- 3D performance glyph encoding
- Dark-themed responsive UI

**In Progress / Future Enhancements:**
- Comparisons view with synchronized `n` sweeps and multiple glyphs
- Additional sorting algorithms (Radix Sort, Counting Sort, Shell Sort)
- Graph data structures (directed/undirected graphs with BFS/DFS)
- Advanced tree structures (AVL Tree, Red-Black Tree, Trie)
- Performance profiling charts and analytics dashboard


