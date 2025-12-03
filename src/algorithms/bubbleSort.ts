import { AlgorithmDef, AlgorithmMetadata, RunConfig, RunResult, TraceStep } from '@/types/metrics'
import {generateArray} from '@/algorithms/common'

export const BubbleSortMeta: AlgorithmMetadata = {
  id: 'bubble',
  name: 'Bubble Sort',
  class: 'Sorting',
  best: 'O(n)',
  average: 'O(n^2)',
  worst: 'O(n^2)',
  definition: 'Bubble Sort repeatedly steps through the list, compares adjacent pairs and swaps them if they are in the wrong order.',
  summary: 'On each pass, the largest remaining element “bubbles up” to its final position. It is simple but inefficient on large inputs. Best case is O(n) when already sorted; average and worst are O(n^2).'
}

export function runBubbleSort(cfg: RunConfig): RunResult {
  const data = generateArray(cfg.n, cfg.input)
  const a = data.slice()
  const trace: TraceStep[] = [{ type: 'set', array: a.slice() }]
  let steps = 0
  let comparisons = 0
  let swaps = 0

  let swapped = true
  for (let pass = 0; pass < a.length - 1 && swapped; pass++) {
    swapped = false
    for (let i = 0; i < a.length - 1 - pass; i++) {
      comparisons++
      steps++
      trace.push({ type: 'compare', i, j: i + 1, array: a.slice() })
      if (a[i] > a[i + 1]) {
        ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
        swaps++
        steps++
        swapped = true
        trace.push({ type: 'swap', i, j: i + 1, array: a.slice() })
      }
    }
  }

  const memoryBytes = a.length * 8 /* numbers */ + 64 /* overhead rough */

  return {
    metrics: { steps, comparisons, swaps, memoryBytes },
    trace,
  }
}

export const BubbleSort: AlgorithmDef = {
  meta: BubbleSortMeta,
  run: runBubbleSort,
}
