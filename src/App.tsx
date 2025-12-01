import React, { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar, { SidebarTab } from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import MetricsPanel from '@/components/MetricsPanel'
import Viewport from '@/three/Viewport'
import { algorithms, algorithmsById } from '@/algorithms'
import { RunConfig, RunResult } from '@/types/metrics'
import type { DSAction } from '@/types/ds'
import type { DSMetrics } from '@/types/ds'

export default function App() {
  const [config, setConfig] = useState<RunConfig>({ n: 25, input: 'Random' })
  const [tab, setTab] = useState<SidebarTab>('Algorithms')
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(algorithms[0].meta.id)
  const [selectedDSId, setSelectedDSId] = useState<string>('array')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const rafRef = useRef<number | null>(null)
  const [dsAction, setDSAction] = useState<{ action: DSAction; nonce: number } | null>(null)
  const [dsCounts, setDsCounts] = useState<Record<string, number>>({ 'array': 10, 'linked-list': 6, 'stack': 3, 'queue': 4 })
  const [dsMetrics, setDsMetrics] = useState<Record<string, DSMetrics>>({
    'array': { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, memoryBytes: 10 * 64 },
    'linked-list': { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, memoryBytes: 6 * 64 },
    'stack': { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, memoryBytes: 3 * 64 },
    'queue': { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, memoryBytes: 4 * 64 },
    'bst': { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, bstInsert: 0, memoryBytes: 6 * 64 },
    'heap': { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, heapInsert: 0, heapExtract: 0, memoryBytes: 6 * 64 },
    'hash-table': { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, hashPut: 0, hashGet: 0, memoryBytes: 8 * 64 },
    'graph': { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, graphAddNode: 0, graphAddEdge: 0, graphBfsStep: 0, memoryBytes: 5 * 64 },
  })

  const baseline = useMemo(() => {
    const algo = algorithmsById[selectedAlgoId]
    return algo.run(config)
  }, [config, selectedAlgoId])

  useEffect(() => {
    setResult(baseline)
    setStepIndex(0)
  }, [baseline])

  useEffect(() => {
    if (!running || !result) return
    const tick = () => {
      setStepIndex((i) => {
        const next = i + 1
        if (next >= result.trace.length) {
          setRunning(false)
          return i
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [running, result])

  const onRun = () => setRunning(true)
  const onPause = () => setRunning(false)
  const onReset = () => { setRunning(false); setStepIndex(0) }

  const handleDSAction = (action: DSAction) => {
    // Update metrics and counts for selected DS
    const id = selectedDSId
    const counts = { ...dsCounts }
    const metrics = { ...dsMetrics }
    const m = { ...(metrics[id] ?? { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, memoryBytes: 0 }) }
    switch (action) {
      case 'stack:push':
        counts['stack'] = (counts['stack'] ?? 0) + 1
        m.push++; m.operations++; break
      case 'stack:pop':
        counts['stack'] = Math.max(0, (counts['stack'] ?? 0) - 1)
        m.pop++; m.operations++; break
      case 'queue:enqueue':
        counts['queue'] = (counts['queue'] ?? 0) + 1
        m.enqueue++; m.operations++; break
      case 'queue:dequeue':
        counts['queue'] = Math.max(0, (counts['queue'] ?? 0) - 1)
        m.dequeue++; m.operations++; break
      case 'list:insertHead':
        counts['linked-list'] = (counts['linked-list'] ?? 0) + 1
        m.insertHead++; m.operations++; break
      case 'list:deleteHead':
        counts['linked-list'] = Math.max(0, (counts['linked-list'] ?? 0) - 1)
        m.deleteHead++; m.operations++; break
      case 'bst:insert':
        counts['bst'] = (counts['bst'] ?? 0) + 1
        m.bstInsert = (m.bstInsert ?? 0) + 1; m.operations++; break
      case 'heap:insert':
        counts['heap'] = (counts['heap'] ?? 0) + 1
        m.heapInsert = (m.heapInsert ?? 0) + 1; m.operations++; break
      case 'heap:extract':
        counts['heap'] = Math.max(0, (counts['heap'] ?? 0) - 1)
        m.heapExtract = (m.heapExtract ?? 0) + 1; m.operations++; break
      case 'hash:put':
        counts['hash-table'] = (counts['hash-table'] ?? 0) + 1
        m.hashPut = (m.hashPut ?? 0) + 1; m.operations++; break
      case 'hash:get':
        m.hashGet = (m.hashGet ?? 0) + 1; m.operations++; break
      case 'graph:addNode':
        counts['graph'] = (counts['graph'] ?? 0) + 1
        m.graphAddNode = (m.graphAddNode ?? 0) + 1; m.operations++; break
      case 'graph:addEdge':
        m.graphAddEdge = (m.graphAddEdge ?? 0) + 1; m.operations++; break
      case 'graph:bfsStep':
        m.graphBfsStep = (m.graphBfsStep ?? 0) + 1; m.operations++; break
      default:
        break
    }
    // approximate memory usage
    const size = (id === 'array') ? (counts['array'] ?? 0)
      : (id === 'linked-list') ? (counts['linked-list'] ?? 0)
      : (id === 'stack') ? (counts['stack'] ?? 0)
      : (id === 'queue') ? (counts['queue'] ?? 0)
      : (id === 'bst') ? (counts['bst'] ?? 0)
      : (id === 'heap') ? (counts['heap'] ?? 0)
      : (id === 'hash-table') ? (counts['hash-table'] ?? 0)
      : (id === 'graph') ? (counts['graph'] ?? 0) : 0
    m.memoryBytes = size * 64
    m.lastAction = action
    metrics[id] = m
    setDsCounts(counts)
    setDsMetrics(metrics)
    setDSAction({ action, nonce: Date.now() })
  }

  return (
    <div className="app">
      <Sidebar
        tab={tab}
        setTab={setTab}
        selectedAlgoId={selectedAlgoId}
        onSelectAlgo={(id) => { setSelectedAlgoId(id); setConfig({ ...config }) }}
        selectedDSId={selectedDSId}
        onSelectDS={(id) => setSelectedDSId(id)}
      />
      <TopBar
        config={config}
        setConfig={(c) => { setRunning(false); setConfig(c) }}
        running={running}
        onRun={onRun}
        onPause={onPause}
        onReset={onReset}
      />
      <Viewport
        run={result}
        stepIndex={stepIndex}
        algoId={selectedAlgoId}
        n={config.n}
        tab={tab}
        dsId={selectedDSId}
        dsAction={dsAction ?? undefined}
        onDSStep={(tag?: string) => {
          const id = selectedDSId
          setDsMetrics((prev) => {
            const curr = prev[id] ?? { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, memoryBytes: 0 }
            return { ...prev, [id]: { ...curr, operations: curr.operations + 1, lastAction: tag ?? curr.lastAction } }
          })
        }}
        dsMetrics={dsMetrics[selectedDSId]}
      />
      <MetricsPanel
        metrics={result?.metrics ?? null}
        meta={algorithmsById[selectedAlgoId].meta}
        tab={tab}
        dsId={selectedDSId}
        dsMetrics={dsMetrics[selectedDSId] ?? { operations: 0, push: 0, pop: 0, enqueue: 0, dequeue: 0, insertHead: 0, deleteHead: 0, memoryBytes: 0 }}
        onDSAction={(action) => handleDSAction(action as DSAction)}
      />
    </div>
  )
}
