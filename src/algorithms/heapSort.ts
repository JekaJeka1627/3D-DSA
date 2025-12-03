import { AlgorithmDef, AlgorithmMetadata, RunConfig, RunResult, TraceStep } from '@/types/metrics'
import {generateArray} from '@/algorithms/common'

export const HeapSortMeta: AlgorithmMetadata = {
  id: 'heap-sort',
  name: 'Heap Sort',
  class: 'Sorting',
  best: 'O(n log n)',
  average: 'O(n log n)',
  worst: 'O(n log n)',
  definition: 'Heap Sort builds a heap and repeatedly extracts the max (or min), placing it at the end.',
  summary: 'Guaranteed O(n log n) with no extra memory beyond the array. Often slower than quicksort in practice due to cache behavior.',
}

export function runHeapSort(cfg: RunConfig): RunResult {
  const a = generateArray(cfg.n, cfg.input)
  const arr = a.slice()
  const trace: TraceStep[] = [{ type: 'set', array: arr.slice() }]
  let steps = 0, comparisons = 0, swaps = 0

  const n = arr.length
  function swap(i: number, j: number) {
    ;[arr[i], arr[j]] = [arr[j], arr[i]]; swaps++; steps++
    trace.push({ type: 'swap', i, j, array: arr.slice() })
  }
  function heapify(nh: number, i: number) {
    let largest = i
    while (true) {
      const l = 2 * i + 1
      const r = 2 * i + 2
      if (l < nh) { comparisons++; steps++; trace.push({ type: 'compare', i: l, j: largest, array: arr.slice() }); if (arr[l] > arr[largest]) largest = l }
      if (r < nh) { comparisons++; steps++; trace.push({ type: 'compare', i: r, j: largest, array: arr.slice() }); if (arr[r] > arr[largest]) largest = r }
      if (largest !== i) { swap(i, largest); i = largest } else break
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i)
  for (let i = n - 1; i > 0; i--) { swap(0, i); heapify(i, 0) }

  const memoryBytes = arr.length * 8 + 64
  return { metrics: { steps, comparisons, swaps, memoryBytes }, trace }
}

export const HeapSort: AlgorithmDef = { meta: HeapSortMeta, run: runHeapSort }

