export type ComplexityClass = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n^2)' | 'O(2^n)'

export interface AlgorithmMetadata {
  id: string
  name: string
  class: 'Sorting' | 'Searching' | 'Graph'
  best: ComplexityClass
  average: ComplexityClass
  worst: ComplexityClass
  definition: string
  summary: string
}

export interface RunConfig {
  n: number
  input: 'Random' | 'Sorted' | 'Reversed'
}

export interface TraceStep {
  type: 'compare' | 'swap' | 'set'
  i?: number
  j?: number
  array: number[]
}

export interface RunMetrics {
  steps: number
  comparisons: number
  swaps: number
  memoryBytes: number
}

export interface RunResult {
  metrics: RunMetrics
  trace: TraceStep[]
}

export type AlgorithmRunner = (cfg: RunConfig) => RunResult

export interface AlgorithmDef {
  meta: AlgorithmMetadata
  run: AlgorithmRunner
}
