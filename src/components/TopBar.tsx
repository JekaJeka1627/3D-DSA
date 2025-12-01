import { RunConfig } from '@/types/metrics'
import React from 'react'

interface Props {
  config: RunConfig
  setConfig: (cfg: RunConfig) => void
  running: boolean
  onRun: () => void
  onPause: () => void
  onReset: () => void
}

export default function TopBar({ config, setConfig, running, onRun, onPause, onReset }: Props) {
  return (
    <div className="topbar">
      <span className="heading">Controls</span>
      <div className="row">
        <label>n</label>
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
          <option>Reversed</option>
        </select>
      </div>
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

