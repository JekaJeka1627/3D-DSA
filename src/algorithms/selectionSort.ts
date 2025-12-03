import { AlgorithmDef, AlgorithmMetadata, RunConfig, RunResult, TraceStep } from '@/types/metrics'
import {generateArray} from '@/algorithms/common'


export const SelectionSortMeta: AlgorithmMetadata = {
  id: 'selection',
  name: 'Selection Sort',
  class: 'Sorting',
  best: 'O(n^2)',
  average: 'O(n^2)',
  worst: 'O(n^2)',
  definition: 'Selection Sort repeatedly selects the smallest remaining element and places it at the front.',
  summary: 'Simple but slow: always O(n^2) comparisons. Good for teaching but rarely used in practice.',
}

export function runSelectionSort(cfg: RunConfig): RunResult {
  const a = generateArray(cfg.n, cfg.input)
  const arr = a.slice()
  const trace: TraceStep[] = [{ type: 'set', array: arr.slice() }]
  let steps = 0, comparisons = 0, swaps = 0

  for (let i = 0; i < arr.length - 1; i++) {
    let min = i
    for (let j = i + 1; j < arr.length; j++) {
      comparisons++; steps++
      trace.push({ type: 'compare', i: min, j, array: arr.slice() })
      if (arr[j] < arr[min]) min = j
    }
    if (min !== i) {
      ;[arr[i], arr[min]] = [arr[min], arr[i]]
      swaps++; steps++
      trace.push({ type: 'swap', i, j: min, array: arr.slice() })
    }
  }
  const memoryBytes = arr.length * 8 + 64
  return { metrics: { steps, comparisons, swaps, memoryBytes }, trace }
}

export const SelectionSort: AlgorithmDef = { meta: SelectionSortMeta, run: runSelectionSort }

