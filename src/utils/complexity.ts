import { ComplexityClass } from '@/types/metrics'

function log2(n: number) { return Math.log(n) / Math.log(2) }

export function estimateSteps(n: number, cls: ComplexityClass): number {
  const k = 10 // base scale constant to get visible sizes
  switch (cls) {
    case 'O(1)': return k
    case 'O(log n)': return Math.max(1, Math.round(k * log2(Math.max(2, n))))
    case 'O(n)': return k * n
    case 'O(n log n)': return Math.round(k * n * log2(Math.max(2, n)))
    case 'O(n^2)': return k * n * n
    case 'O(2^n)': return Math.min(20000, Math.round(k * Math.pow(2, Math.min(16, n))))
    default: return k * n
  }
}

export function stepsToColor(steps: number): string {
  return steps < 1000 ? '#6bff95' : steps < 5000 ? '#ffd166' : '#ff6b6b'
}
