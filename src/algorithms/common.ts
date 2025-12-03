import {RunConfig} from '@/types/metrics'
export function generateArray(n: number, mode: RunConfig['input']): number[] {
  const arr = Array.from({ length: n }, (_, i) => i + 1)
  return mode === 'Random'?fisherYatesShuffle(arr):mode === 'Reverse'?arr.reverse():arr;
}
export function fisherYatesShuffle(arr: number[]):number[]{
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr;
}