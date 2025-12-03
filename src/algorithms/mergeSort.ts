import { AlgorithmDef, AlgorithmMetadata, RunConfig, RunResult, TraceStep } from '@/types/metrics'
import {generateArray} from '@/algorithms/common'

export const MergeSortMeta: AlgorithmMetadata = {
  id: 'merge',
  name: 'Merge Sort',
  class: 'Sorting',
  best: 'O(n log n)',
  average: 'O(n log n)',
  worst: 'O(n log n)',
  definition: 'Merge Sort is a divide-and-conquer algorithm that splits the array, recursively sorts each half, and merges the sorted halves.',
  summary: 'Stable with guaranteed O(n log n) time. Requires extra space for merging, but offers predictable performance regardless of input order.'
}

export function runMergeSort(cfg: RunConfig): RunResult {
  const arr = generateArray(cfg.n, cfg.input)
  const a = arr.slice()
  const aux = a.slice()
  const trace: TraceStep[] = [{ type: 'set', array: a.slice() }]
  let steps = 0, comparisons = 0, swaps = 0

  function merge(lo: number, mid: number, hi: number) {
    for (let k = lo; k <= hi; k++) aux[k] = a[k]
    let i = lo, j = mid + 1
    for (let k = lo; k <= hi; k++) {
      if (i > mid) { a[k] = aux[j++]; steps++; trace.push({ type: 'set', i: k, array: a.slice() }) }
      else if (j > hi) { a[k] = aux[i++]; steps++; trace.push({ type: 'set', i: k, array: a.slice() }) }
      else {
        comparisons++; steps++
        trace.push({ type: 'compare', i, j, array: a.slice() })
        if (aux[j] < aux[i]) { a[k] = aux[j++]; steps++; trace.push({ type: 'set', i: k, array: a.slice() }) }
        else { a[k] = aux[i++]; steps++; trace.push({ type: 'set', i: k, array: a.slice() }) }
      }
    }
  }

  function sort(lo: number, hi: number) {
    if (hi <= lo) return
    const mid = Math.floor(lo + (hi - lo) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  sort(0, a.length - 1)
  const memoryBytes = a.length * 8 + aux.length * 8 + 64
  return { metrics: { steps, comparisons, swaps, memoryBytes }, trace }
}

export const MergeSort: AlgorithmDef = { meta: MergeSortMeta, run: runMergeSort }
