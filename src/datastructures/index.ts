export interface DataStructureMeta {
  id: string
  name: string
  definition: string
  summary: string
}

export const dataStructures: DataStructureMeta[] = [
  {
    id: 'array',
    name: 'Array',
    definition: 'A contiguous block of memory storing elements of the same type, accessible in O(1) by index.',
    summary: 'Strengths: fast random access, good cache locality. Weaknesses: costly insertions/deletions in the middle (O(n)). Common ops: read/write by index O(1); search O(n) unless sorted (then binary search O(log n)).',
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    definition: 'A sequence of nodes where each node holds data and a pointer to the next node.',
    summary: 'Strengths: O(1) insertion/deletion at head or when node reference is known; flexible growth. Weaknesses: O(n) access by index, poor cache locality. Variants include singly, doubly, and circular lists.',
  },
  {
    id: 'stack',
    name: 'Stack',
    definition: 'A LIFO (Last-In-First-Out) abstract data type supporting push and pop at the top.',
    summary: 'Core ops: push/pop/top are O(1). Used for function call stacks, backtracking, and parsing. Typically implemented with an array or linked list.',
  },
  {
    id: 'queue',
    name: 'Queue',
    definition: 'A FIFO (First-In-First-Out) abstract data type supporting enqueue at the back and dequeue from the front.',
    summary: 'Core ops: enqueue/dequeue/peek are O(1). Used in BFS, scheduling, and buffering. Variants: circular queues, double-ended queues (deques).',
  },
  {
    id: 'bst',
    name: 'Binary Search Tree',
    definition: 'A binary tree where every node’s left subtree contains keys less than the node, and the right subtree contains keys greater than the node.',
    summary: 'Typical ops (search/insert/delete) are O(h), where h is height. Balanced trees have h ≈ O(log n); skewed trees degrade to O(n).',
  },
  {
    id: 'heap',
    name: 'Binary Heap',
    definition: 'A complete binary tree that satisfies the heap property: in a max-heap, every node is ≥ its children (min-heap: ≤).',
    summary: 'Insert and extract (top) are O(log n). Heaps are great for priority queues and Dijkstra’s frontier. Implemented as arrays with parent/child indices.',
  },
  {
    id: 'hash-table',
    name: 'Hash Table',
    definition: 'Maps keys to buckets using a hash function; collisions are resolved by chaining or open addressing.',
    summary: 'Average-case O(1) insert/lookup/delete with a good hash and load factor control. Worst-case O(n).',
  },
  {
    id: 'graph',
    name: 'Graph',
    definition: 'A set of vertices connected by edges (directed or undirected).',
    summary: 'Graphs model relationships. Core ops include adding nodes/edges and traversals (BFS/DFS). BFS explores in layers; DFS goes deep first.',
  },
]

export const dataStructuresById = Object.fromEntries(dataStructures.map(d => [d.id, d])) as Record<string, DataStructureMeta>
