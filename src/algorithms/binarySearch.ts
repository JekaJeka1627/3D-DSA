import { AlgorithmDef, AlgorithmMetadata, RunConfig, RunResult, TraceStep } from '@/types/metrics'
import {generateArray} from '@/algorithms/common'

export const BinarySearchMeta: AlgorithmMetadata = {
  id: 'binary-search',
  name: 'Binary Search',
  class: 'Searching',
  best: 'O(1)',
  average: 'O(log n)',
  worst: 'O(log n)',
  definition: 'Repeatedly halve a sorted array to locate the target.',
  summary: 'Very fast on sorted arrays with O(log n) comparisons. Requires sorted input.',
}

export function runBinarySearch(cfg: RunConfig): RunResult {
  const arr = generateArray(cfg.n, "Sorted" )
  const target = arr[Math.floor(Math.random() * arr.length)]
  const trace: TraceStep[] = [{ type: 'set', array: arr.slice() }]
  let steps = 0, comparisons = 0, swaps = 0
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    comparisons++; steps++
    trace.push({ type: 'compare', i: mid, j: -1, array: arr.slice() })
    if (arr[mid] === target) break
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  const memoryBytes = arr.length * 8 + 64
  return { metrics: { steps, comparisons, swaps, memoryBytes }, trace }
}

export const BinarySearch: AlgorithmDef = { meta: BinarySearchMeta, run: runBinarySearch }

