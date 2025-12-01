import { AlgorithmDef } from '@/types/metrics'
import { BubbleSort } from './bubbleSort'
import { InsertionSort } from './insertionSort'
import { QuickSort } from './quickSort'
import { MergeSort } from './mergeSort'

export const algorithms: AlgorithmDef[] = [
  BubbleSort,
  InsertionSort,
  MergeSort,
  QuickSort,
]

export const algorithmsById = Object.fromEntries(algorithms.map(a => [a.meta.id, a])) as Record<string, AlgorithmDef>

