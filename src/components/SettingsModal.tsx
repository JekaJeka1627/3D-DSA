import React, { useState, useRef } from 'react'
import type { RunConfig } from '@/types/metrics'
import {
  SavedPreset,
  HistoryEntry,
  savePreset,
  getPresets,
  deletePreset,
  getHistory,
  clearHistory,
  deleteHistoryEntry,
  exportToCSV,
  exportToJSON,
  downloadFile,
  importJSON,
} from '@/utils/storage'

type SettingsTab = 'Presets' | 'History' | 'Export'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentAlgorithmId: string
  currentAlgorithmName: string
  currentConfig: RunConfig
  onLoadPreset: (algorithmId: string, config: RunConfig) => void
  onLoadHistory: (algorithmId: string, config: RunConfig) => void
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentAlgorithmId,
  currentAlgorithmName,
  currentConfig,
  onLoadPreset,
  onLoadHistory,
}: Props) {
  const [tab, setTab] = useState<SettingsTab>('Presets')
  const [presets, setPresets] = useState<SavedPreset[]>(getPresets())
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory())
  const [presetName, setPresetName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  // Refresh data when modal opens
  const refreshData = () => {
    setPresets(getPresets())
    setHistory(getHistory())
  }

  // Preset handlers
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name')
      return
    }
    savePreset({
      name: presetName,
      algorithmId: currentAlgorithmId,
      config: currentConfig,
    })
    setPresetName('')
    refreshData()
  }

  const handleLoadPreset = (preset: SavedPreset) => {
    onLoadPreset(preset.algorithmId, preset.config)
    onClose()
  }

  const handleDeletePreset = (id: string) => {
    if (confirm('Delete this preset?')) {
      deletePreset(id)
      refreshData()
    }
  }

  // History handlers
  const handleLoadHistory = (entry: HistoryEntry) => {
    onLoadHistory(entry.algorithmId, entry.config)
    onClose()
  }

  const handleDeleteHistory = (id: string) => {
    deleteHistoryEntry(id)
    refreshData()
  }

  const handleClearHistory = () => {
    if (confirm('Clear all history?')) {
      clearHistory()
      refreshData()
    }
  }

  // Export handlers
  const handleExportCSV = () => {
    const csv = exportToCSV(history)
    downloadFile(csv, `3d-dsa-history-${Date.now()}.csv`, 'text/csv')
  }

  const handleExportJSON = () => {
    const json = exportToJSON({ presets, history })
    downloadFile(json, `3d-dsa-export-${Date.now()}.json`, 'application/json')
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const data = importJSON(content)
      if (!data) {
        alert('Invalid JSON file')
        return
      }

      if (data.presets) {
        data.presets.forEach(preset => savePreset(preset))
      }
      if (data.history) {
        // Note: This will replace history, not merge
        localStorage.setItem('3d-dsa-history', JSON.stringify(data.history.slice(0, 10)))
      }

      refreshData()
      alert('Import successful!')
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          {(['Presets', 'History', 'Export'] as const).map(t => (
            <button
              key={t}
              className={`modal-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === 'Presets' && (
            <div className="modal-section">
              <h3>Save Current Configuration</h3>
              <div className="preset-save">
                <input
                  type="text"
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                />
                <button className="primary" onClick={handleSavePreset}>Save</button>
              </div>
              <div className="current-config">
                <strong>{currentAlgorithmName}</strong> | n={currentConfig.n} | {currentConfig.input}
              </div>

              <h3 style={{ marginTop: 24 }}>Saved Presets ({presets.length})</h3>
              {presets.length === 0 ? (
                <p className="empty-state">No saved presets yet</p>
              ) : (
                <div className="preset-list">
                  {presets.map(preset => (
                    <div key={preset.id} className="preset-item">
                      <div className="preset-info">
                        <strong>{preset.name}</strong>
                        <div className="preset-details">
                          {preset.algorithmId} | n={preset.config.n} | {preset.config.input}
                        </div>
                        <div className="preset-timestamp">
                          {new Date(preset.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="preset-actions">
                        <button className="primary" onClick={() => handleLoadPreset(preset)}>Load</button>
                        <button className="danger" onClick={() => handleDeletePreset(preset.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'History' && (
            <div className="modal-section">
              <div className="history-header">
                <h3>Run History (Last 10)</h3>
                {history.length > 0 && (
                  <button className="danger" onClick={handleClearHistory}>Clear All</button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="empty-state">No run history yet. Run an algorithm to see it here!</p>
              ) : (
                <div className="history-list">
                  {history.map(entry => (
                    <div key={entry.id} className="history-item">
                      <div className="history-info">
                        <div className="history-time">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                        <strong>{entry.algorithmName}</strong>
                        <div className="history-config">
                          n={entry.config.n} | {entry.config.input}
                        </div>
                        <div className="history-metrics">
                          Steps: {entry.metrics.steps.toLocaleString()} |
                          Compares: {entry.metrics.comparisons.toLocaleString()} |
                          Swaps: {entry.metrics.swaps.toLocaleString()}
                        </div>
                      </div>
                      <div className="history-actions">
                        <button className="primary" onClick={() => handleLoadHistory(entry)}>Load</button>
                        <button className="danger" onClick={() => handleDeleteHistory(entry.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Export' && (
            <div className="modal-section">
              <h3>Export Data</h3>

              <div className="export-option">
                <div className="export-info">
                  <strong>Export to CSV</strong>
                  <p>Download run history as a CSV file for analysis in Excel or other tools.</p>
                </div>
                <button
                  className="primary"
                  onClick={handleExportCSV}
                  disabled={history.length === 0}
                >
                  Download CSV
                </button>
              </div>

              <div className="export-option">
                <div className="export-info">
                  <strong>Export to JSON</strong>
                  <p>Download all presets and history as JSON for backup or sharing.</p>
                </div>
                <button
                  className="primary"
                  onClick={handleExportJSON}
                  disabled={presets.length === 0 && history.length === 0}
                >
                  Download JSON
                </button>
              </div>

              <h3 style={{ marginTop: 24 }}>Import Data</h3>

              <div className="export-option">
                <div className="export-info">
                  <strong>Import from JSON</strong>
                  <p>Load presets and history from a previously exported JSON file.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  style={{ display: 'none' }}
                />
                <button
                  className="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
