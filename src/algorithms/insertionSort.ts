import { AlgorithmDef, AlgorithmMetadata, RunConfig, RunResult, TraceStep } from '@/types/metrics'

export const InsertionSortMeta: AlgorithmMetadata = {
  id: 'insertion',
  name: 'Insertion Sort',
  class: 'Sorting',
  best: 'O(n)',
  average: 'O(n^2)',
  worst: 'O(n^2)',
  definition: 'Insertion Sort builds the final sorted array one item at a time by inserting each element into its correct position among the previously sorted elements.',
  summary: 'Good for small or nearly sorted arrays. It scans left from the current position and shifts larger items up until the correct spot is found. Best case O(n) (already sorted), average/worst O(n^2).'
}

export function runInsertionSort(cfg: RunConfig): RunResult {
  // Create initial array depending on input mode
  const arr = (() => {
    const base = Array.from({ length: cfg.n }, (_, i) => i + 1)
    if (cfg.input === 'Random') {
      for (let i = base.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[base[i], base[j]] = [base[j], base[i]]
      }
    } else if (cfg.input === 'Reversed') base.reverse()
    return base
  })()

  const a = arr.slice()
  const trace: TraceStep[] = [{ type: 'set', array: a.slice() }]
  let steps = 0, comparisons = 0, swaps = 0

  for (let i = 1; i < a.length; i++) {
    const key = a[i]
    let j = i - 1
    while (j >= 0) {
      comparisons++; steps++
      trace.push({ type: 'compare', i: j, j: i, array: a.slice() })
      if (a[j] > key) {
        a[j + 1] = a[j]; swaps++; steps++
        trace.push({ type: 'set', i: j + 1, array: a.slice() })
        j--
      } else break
    }
    a[j + 1] = key; steps++
    trace.push({ type: 'set', i: j + 1, array: a.slice() })
  }

  const memoryBytes = a.length * 8 + 64
  return { metrics: { steps, comparisons, swaps, memoryBytes }, trace }
}

export const InsertionSort: AlgorithmDef = { meta: InsertionSortMeta, run: runInsertionSort }
