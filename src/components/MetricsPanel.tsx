import { AlgorithmMetadata, RunMetrics } from '@/types/metrics'
import type { DSMetrics } from '@/types/ds'
import React from 'react'

interface AlgoProps {
  metrics: RunMetrics | null
  meta: AlgorithmMetadata
}

interface DSProps {
  tab: 'Data Structures' | 'Algorithms' | 'Comparisons'
  dsId: string
  onDSAction: (action: string) => void
  dsMetrics: DSMetrics
}

export default function MetricsPanel(props: AlgoProps & Partial<DSProps>) {
  if (props.tab === 'Data Structures' && props.dsId && props.onDSAction) {
    return (
      <aside className="right">
        <div className="heading">Operations</div>
        <div className="section" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {props.dsId === 'stack' && (
            <>
              <button className="primary" onClick={() => props.onDSAction!('stack:push')}>Push</button>
              <button onClick={() => props.onDSAction!('stack:pop')}>Pop</button>
            </>
          )}
          {props.dsId === 'queue' && (
            <>
              <button className="primary" onClick={() => props.onDSAction!('queue:enqueue')}>Enqueue</button>
              <button onClick={() => props.onDSAction!('queue:dequeue')}>Dequeue</button>
            </>
          )}
          {props.dsId === 'linked-list' && (
            <>
              <button className="primary" onClick={() => props.onDSAction!('list:insertHead')}>Insert Head</button>
              <button onClick={() => props.onDSAction!('list:deleteHead')}>Delete Head</button>
            </>
          )}
          {props.dsId === 'bst' && (
            <>
              <button className="primary" onClick={() => props.onDSAction!('bst:insert')}>Insert</button>
            </>
          )}
          {props.dsId === 'heap' && (
            <>
              <button className="primary" onClick={() => props.onDSAction!('heap:insert')}>Insert</button>
              <button onClick={() => props.onDSAction!('heap:extract')}>Extract Top</button>
            </>
          )}
          {props.dsId === 'hash-table' && (
            <>
              <button className="primary" onClick={() => props.onDSAction!('hash:put')}>Put</button>
              <button onClick={() => props.onDSAction!('hash:get')}>Get</button>
            </>
          )}
          {props.dsId === 'graph' && (
            <>
              <button className="primary" onClick={() => props.onDSAction!('graph:addNode')}>Add Node</button>
              <button onClick={() => props.onDSAction!('graph:addEdge')}>Add Edge</button>
              <button onClick={() => props.onDSAction!('graph:bfsStep')}>BFS Step</button>
            </>
          )}
          {props.dsId === 'array' && (
            <div className="legend">Array operations coming soon (insert/delete/resize).</div>
          )}
        </div>
        <div className="heading">Status</div>
        <div className="section">
          <div className="metric"><span>Total Ops</span><span>{props.dsMetrics?.operations ?? 0}</span></div>
          <div className="metric"><span>Memory (approx)</span><span>{props.dsMetrics ? `${props.dsMetrics.memoryBytes} B` : '—'}</span></div>
          <div className="metric"><span>Last Action</span><span>{props.dsMetrics?.lastAction ?? '—'}</span></div>
        </div>
        <div className="heading">Legend</div>
        <div className="legend">
          <div className="legend-row">
            <span className="legend-pill green">Interact</span>
            <span className="legend-text">Trigger pushes, pops, inserts, etc. with the controls above.</span>
          </div>
          <div className="legend-row">
            <span className="legend-pill yellow">Highlights</span>
            <span className="legend-text">Animated blocks + glow call attention to the element being touched.</span>
          </div>
          <div className="legend-row">
            <span className="legend-pill red">Metrics</span>
            <span className="legend-text">Right column updates operations + memory usage in real time.</span>
          </div>
        </div>
      </aside>
    )
  }

  const { metrics, meta } = props as AlgoProps
  return (
    <aside className="right">
      <div className="heading">Metrics</div>
      <div className="section">
        <div className="metric"><span>Algorithm</span><span>{meta.name}</span></div>
        <div className="metric"><span>Class</span><span>{meta.class}</span></div>
        <div className="metric"><span>Best</span><span>{meta.best}</span></div>
        <div className="metric"><span>Average</span><span>{meta.average}</span></div>
        <div className="metric"><span>Worst</span><span>{meta.worst}</span></div>
      </div>
      <div className="heading">Live Run</div>
      <div className="section">
        <div className="metric"><span>Steps</span><span>{metrics?.steps ?? 0}</span></div>
        <div className="metric"><span>Comparisons</span><span>{metrics?.comparisons ?? 0}</span></div>
        <div className="metric"><span>Swaps</span><span>{metrics?.swaps ?? 0}</span></div>
        <div className="metric"><span>Memory (approx)</span><span>{metrics ? `${metrics.memoryBytes} B` : '—'}</span></div>
      </div>
      <div className="heading">Legend</div>
      <div className="legend">
        <div className="legend-row">
          <span className="legend-pill green">Height</span>
          <span className="legend-text">Represents time / step count for the current run + reference glyphs.</span>
        </div>
        <div className="legend-row">
          <span className="legend-pill yellow">Radius</span>
          <span className="legend-text">Encodes approximate memory usage (wider = more memory).</span>
        </div>
        <div className="legend-row" style={{ flexWrap: 'wrap' }}>
          <span className="legend-pill green">Efficient</span>
          <span className="legend-pill yellow">Balanced</span>
          <span className="legend-pill red">Expensive</span>
          <span className="legend-text">Color scale maps complexity classes.</span>
        </div>
        <div className="legend-row">
          <span className="legend-pill red">Texture</span>
          <span className="legend-text">Smooth (best), medium (avg), spiky (worst) surfaces.</span>
        </div>
      </div>
    </aside>
  )
}
