import { AlgorithmDef, AlgorithmMetadata, RunConfig, RunResult, TraceStep } from '@/types/metrics'
import {generateArray} from '@/algorithms/common'

export const LinearSearchMeta: AlgorithmMetadata = {
  id: 'linear-search',
  name: 'Linear Search',
  class: 'Searching',
  best: 'O(1)',
  average: 'O(n)',
  worst: 'O(n)',
  definition: 'Scan each element until the target is found or the end is reached.',
  summary: 'Works on any list. Simple but slow on large inputs compared to binary search on sorted arrays.',
}

export function runLinearSearch(cfg: RunConfig): RunResult {
  const arr = generateArray(cfg.n, cfg.input)
  const target = arr[Math.floor(Math.random() * arr.length)]
  const trace: TraceStep[] = [{ type: 'set', array: arr.slice() }]
  let steps = 0, comparisons = 0, swaps = 0
  for (let i = 0; i < arr.length; i++) {
    comparisons++; steps++
    trace.push({ type: 'compare', i, j: -1, array: arr.slice() })
    if (arr[i] === target) break
  }
  const memoryBytes = arr.length * 8 + 64
  return { metrics: { steps, comparisons, swaps, memoryBytes }, trace }
}

export const LinearSearch: AlgorithmDef = { meta: LinearSearchMeta, run: runLinearSearch }

