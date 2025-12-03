import { RunConfig } from '@/types/metrics'
import React from 'react'

interface Props {
  config: RunConfig
  setConfig: (cfg: RunConfig) => void
  running: boolean
  onRun: () => void
  onPause: () => void
  onReset: () => void
  speed: 'Slow' | 'Normal' | 'Fast'
  onSpeed: (s: 'Slow' | 'Normal' | 'Fast') => void
  onResetView: () => void
  onOpenSettings: () => void
}

export default function TopBar({ config, setConfig, running, onRun, onPause, onReset, speed, onSpeed, onResetView, onOpenSettings }: Props) {
  return (
    <div className="topbar">
      <span className="heading">Controls</span>
      <div className="row">
        <label>Items</label>
        <input
          type="range"
          min={5}
          max={100}
          value={config.n}
          onChange={(e) => setConfig({ ...config, n: Number(e.target.value) })}
        />
        <span>{config.n}</span>
      </div>
      <div className="row">
        <label>Input</label>
        <select
          value={config.input}
          onChange={(e) => setConfig({ ...config, input: e.target.value as RunConfig['input'] })}
        >
          <option>Random</option>
          <option>Sorted</option>
          <option>Reverse</option>
        </select>
      </div>
      <div className="row">
        <label>Speed</label>
        <select value={speed} onChange={(e) => onSpeed(e.target.value as Props['speed'])}>
          <option>Slow</option>
          <option>Normal</option>
          <option>Fast</option>
        </select>
      </div>
      <button onClick={onResetView}>Reset View</button>
      <button onClick={onOpenSettings} title="Settings">⚙️</button>
      <div className="spacer" />
      {!running ? (
        <button className="primary" onClick={onRun}>Run</button>
      ) : (
        <button onClick={onPause}>Pause</button>
      )}
      <button className="danger" onClick={onReset}>Reset</button>
    </div>
  )
}
