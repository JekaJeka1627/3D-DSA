You are an expert full-stack developer and UI/UX designer.

Build a dark-themed, user-friendly web app that visualizes common data structures and algorithms as 3D shapes, focusing specifically on representing algorithm performance.

Tech stack:  
\- Frontend: React \+ TypeScript  
\- 3D graphics: Three.js (or React Three Fiber if appropriate)  
\- Styling: Modern dark theme (CSS modules or Tailwind, your choice)

High-level features:  
1\. Layout  
   \- Left sidebar:  
     \- Tabs for "Data Structures", "Algorithms", and "Comparisons".  
     \- Menu of common items:  
       \- Data structures: Array, Linked List, Stack, Queue, Binary Search Tree, Heap, Hash Table, Graph.  
       \- Algorithms: Linear Search, Binary Search, Bubble Sort, Insertion Sort, Merge Sort, Quick Sort, Dijkstra’s Algorithm, BFS, DFS.  
   \- Top bar:  
     \- Controls for input size \`n\` (slider).  
     \- Input type selector (Random, Sorted, Reversed, Custom if simple).  
     \- Run/Pause/Reset simulation buttons.  
   \- Center:  
     \- 3D viewport where the user can orbit, pan, and zoom the camera.  
     \- Dark background with a subtle grid floor plane for orientation.  
   \- Right panel:  
     \- Numeric metrics for the current algorithm run:  
       \- Operations count (time proxy).  
       \- Estimated memory usage (space proxy).  
       \- Best/Average/Worst-case complexities in Big-O notation.  
     \- A legend explaining the 3D encoding.

2\. 3D performance encoding  
   \- Implement a consistent mapping from performance metrics to visual properties:  
     \- Height (Y) of a 3D shape \= operation count / time cost.  
     \- Radius or thickness of the shape \= memory/space usage.  
     \- Color \= complexity class or relative efficiency:  
       \- Green: more efficient (e.g., O(log n), O(n))  
       \- Yellow: moderate (e.g., O(n log n))  
       \- Red: expensive (e.g., O(n^2), O(2^n))  
     \- Surface/texture:  
       \- Smooth: best case.  
       \- Medium bumps/noise: average case.  
       \- Spiky/high-frequency pattern: worst case.  
   \- For each algorithm, show three shapes at once (best, average, worst), clearly labeled.  
   \- Include gentle animations (e.g., pulsing or rotating) to make the visualization feel alive but not distracting.

3\. Data structures visualization  
   \- For each data structure, show a 3D representation:  
     \- Array: row of cubes.  
     \- Linked list: chain of connected capsules or spheres.  
     \- Tree/heap: layered branching structure with nodes as spheres and edges as cylinders.  
     \- Hash table: grid of buckets; each bucket can contain a linked list or stack of small nodes.  
   \- Animate operations like insert/search/delete:  
     \- Nodes highlight and move as operations proceed.  
     \- The metrics panel updates in sync (operation count, approximate memory).  
   \- Provide simple controls to run a sequence of operations and watch the structure evolve.

4\. Algorithm visualization  
   \- For sorting algorithms:  
     \- Show bars representing array elements.  
     \- Animate swaps and comparisons.  
     \- Next to the animated array, show 3D “performance glyphs” that encode best/average/worst-case performance via height, radius, and color.  
   \- For search algorithms:  
     \- Show linear search as scanning a row of elements, and binary search as repeatedly halving a sorted array.  
   \- For graph algorithms (BFS, DFS, Dijkstra):  
     \- Render a small graph in 3D with nodes as spheres and edges as tubes.  
     \- Animate visited/frontier/unvisited states via node colors.  
     \- For Dijkstra, animate the shortest-path tree emerging over time.  
     \- Next to the graph, display a compact 3D performance glyph summarizing steps and space.

5\. Performance data  
   \- Implement a simple instrumentation layer in TypeScript for live runs on small input sizes:  
     \- Wrap algorithms so they count "steps" (comparisons, assignments, etc.).  
     \- Return an object containing:  
       \- steps  
       \- rough memory usage estimate  
       \- a trace that can be used to drive animations.  
   \- Also support loading precomputed performance data from JSON for larger sizes, so we can show performance landscapes without heavy computation.  
   \- Design the code to cleanly separate:  
     \- Algorithm implementation \+ instrumentation.  
     \- Data model for performance metrics.  
     \- 3D visualization layer that consumes these metrics and maps them to shapes.

6\. Comparisons view  
   \- Add a mode where the user can select multiple algorithms (e.g., Bubble Sort, Merge Sort, Quick Sort).  
   \- Show their performance shapes side-by-side for the same \`n\` and input type.  
   \- Allow the user to animate \`n\` changing over time and watch the shapes grow/shrink.

7\. Dark theme and UX details  
   \- Overall dark background (\#050509 or similar).  
   \- Panels and UI chrome use dark grays with subtle gradients or glassmorphism.  
   \- Accent colors for algorithms and structures should be vibrant neon tones but readable against the dark background.  
   \- Provide a clear legend and inline tooltips so a beginner can learn what each visual dimension means (height, radius, color, texture).  
   \- Ensure the 3D controls are intuitive (orbit, zoom, reset camera button).

8\. Code quality  
   \- Use TypeScript with proper types.  
   \- Organize code into clear components: Sidebar, TopBar, MetricsPanel, 3DViewport, AlgorithmRunner, etc.  
   \- Make it easy to add new algorithms or data structures by defining a common interface for:  
     \- algorithm metadata (name, class, Big-O)  
     \- instrumentation  
     \- 3D visualization configuration.

Start by scaffolding the project structure, then implement a minimal vertical slice:  
\- One data structure (Array) and one algorithm (Bubble Sort).  
\- Instrumentation for operations.  
\- A simple 3D visualization that follows the encoding rules above.  
Once the slice works, generalize it so new algorithms and structures can be plugged in via configuration.

