import type { RunConfig, RunResult } from '@/types/metrics'

// Storage keys
const STORAGE_KEYS = {
  PRESETS: '3d-dsa-presets',
  HISTORY: '3d-dsa-history',
  SETTINGS: '3d-dsa-settings',
}

// Types
export interface SavedPreset {
  id: string
  name: string
  algorithmId: string
  config: RunConfig
  timestamp: number
}

export interface HistoryEntry {
  id: string
  algorithmId: string
  algorithmName: string
  config: RunConfig
  metrics: {
    steps: number
    comparisons: number
    swaps: number
    memoryBytes: number
  }
  timestamp: number
}

export interface UserSettings {
  defaultSpeed: 'Slow' | 'Normal' | 'Fast'
  defaultInputSize: number
}

// Preset functions
export function savePreset(preset: Omit<SavedPreset, 'id' | 'timestamp'>): void {
  const presets = getPresets()
  const newPreset: SavedPreset = {
    ...preset,
    id: `preset-${Date.now()}`,
    timestamp: Date.now(),
  }
  presets.push(newPreset)
  localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets))
}

export function getPresets(): SavedPreset[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRESETS)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Failed to load presets:', e)
    return []
  }
}

export function deletePreset(id: string): void {
  const presets = getPresets().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets))
}

// History functions
export function addToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const history = getHistory()
  const newEntry: HistoryEntry = {
    ...entry,
    id: `history-${Date.now()}`,
    timestamp: Date.now(),
  }
  history.unshift(newEntry) // Add to beginning
  const trimmed = history.slice(0, 10) // Keep only last 10
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed))
}

export function getHistory(): HistoryEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Failed to load history:', e)
    return []
  }
}

export function clearHistory(): void {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]))
}

export function deleteHistoryEntry(id: string): void {
  const history = getHistory().filter(h => h.id !== id)
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
}

// Settings functions
export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

export function getSettings(): UserSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? JSON.parse(data) : {
      defaultSpeed: 'Normal',
      defaultInputSize: 25,
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
    return {
      defaultSpeed: 'Normal',
      defaultInputSize: 25,
    }
  }
}

// Export functions
export function exportToCSV(history: HistoryEntry[]): string {
  const headers = [
    'Timestamp',
    'Algorithm',
    'Input Size',
    'Input Type',
    'Steps',
    'Comparisons',
    'Swaps',
    'Memory (bytes)',
  ]

  const rows = history.map(entry => [
    new Date(entry.timestamp).toLocaleString(),
    entry.algorithmName,
    entry.config.n.toString(),
    entry.config.input,
    entry.metrics.steps.toString(),
    entry.metrics.comparisons.toString(),
    entry.metrics.swaps.toString(),
    entry.metrics.memoryBytes.toString(),
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return csv
}

export function exportToJSON(data: { presets: SavedPreset[]; history: HistoryEntry[] }): string {
  return JSON.stringify(data, null, 2)
}

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function importJSON(jsonString: string): { presets?: SavedPreset[]; history?: HistoryEntry[] } | null {
  try {
    const data = JSON.parse(jsonString)
    return data
  } catch (e) {
    console.error('Failed to parse JSON:', e)
    return null
  }
}
