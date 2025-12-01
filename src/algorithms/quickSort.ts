import { AlgorithmDef, AlgorithmMetadata, RunConfig, RunResult, TraceStep } from '@/types/metrics'

export const QuickSortMeta: AlgorithmMetadata = {
  id: 'quick',
  name: 'Quick Sort',
  class: 'Sorting',
  best: 'O(n log n)',
  average: 'O(n log n)',
  worst: 'O(n^2)',
  definition: 'Quick Sort partitions the array around a pivot so that smaller elements go left and larger go right, then recursively sorts the subarrays.',
  summary: 'In-place and typically very fast due to good cache behavior. Performance depends on pivot choice. Average/best O(n log n), worst O(n^2) if partitions are unbalanced.'
}

function makeArray(n: number, mode: RunConfig['input']): number[] {
  const base = Array.from({ length: n }, (_, i) => i + 1)
  if (mode === 'Random') {
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[base[i], base[j]] = [base[j], base[i]]
    }
  } else if (mode === 'Reversed') base.reverse()
  return base
}

export function runQuickSort(cfg: RunConfig): RunResult {
  const a = makeArray(cfg.n, cfg.input)
  const arr = a.slice()
  const trace: TraceStep[] = [{ type: 'set', array: arr.slice() }]
  let steps = 0, comparisons = 0, swaps = 0

  function swap(i: number, j: number) {
    ;[arr[i], arr[j]] = [arr[j], arr[i]]; swaps++; steps++
    trace.push({ type: 'swap', i, j, array: arr.slice() })
  }

  function partition(lo: number, hi: number): number {
    const pivot = arr[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      comparisons++; steps++
      trace.push({ type: 'compare', i: j, j: hi, array: arr.slice() })
      if (arr[j] < pivot) { swap(i, j); i++ }
    }
    swap(i, hi)
    return i
  }

  function qs(lo: number, hi: number) {
    if (lo >= hi) return
    const p = partition(lo, hi)
    qs(lo, p - 1)
    qs(p + 1, hi)
  }

  qs(0, arr.length - 1)
  const memoryBytes = arr.length * 8 + 64
  return { metrics: { steps, comparisons, swaps, memoryBytes }, trace }
}

export const QuickSort: AlgorithmDef = { meta: QuickSortMeta, run: runQuickSort }
