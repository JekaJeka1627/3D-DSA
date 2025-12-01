import React, { useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Html, MeshDistortMaterial } from '@react-three/drei'
import { RunResult } from '@/types/metrics'
import type { DSAction, DSMetrics } from '@/types/ds'
import { algorithmsById } from '@/algorithms'
import { estimateSteps, stepsToColor } from '@/utils/complexity'

function Bars({ array, active, stepType, onHover, hoveredIndex }: { array: number[]; active?: [number, number] | null; stepType?: 'compare' | 'swap' | 'set' | undefined; onHover: (i: number | null) => void; hoveredIndex: number | null }) {
  const max = useMemo(() => Math.max(1, ...array), [array])
  const width = 0.6
  return (
    <group position={[-(array.length * width) / 2, 0, 0]}>
      {array.map((v, i) => {
        const h = (v / max) * 5 + 0.1
        const isActive = active && (i === active[0] || i === active[1])
        const color = isActive ? '#8aa8ff' : '#6cf9e6'
        return (
          <mesh
            key={i}
            position={[i * width, h / 2, 0]}
            onPointerOver={(e) => { e.stopPropagation(); onHover(i) }}
            onPointerOut={(e) => { e.stopPropagation(); onHover(null) }}
          >
            <boxGeometry args={[0.5, h, 0.5]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.4} />
            {hoveredIndex === i && (
              <Html center style={{ pointerEvents: 'none' }}>
                <div className="tooltip tooltip-lg tooltip-below">
                  <div className="tooltip-title">Array Element</div>
                  <div><strong>Index:</strong> {i}</div>
                  <div><strong>Value:</strong> {v}</div>
                  {isActive && stepType && (
                    <div><strong>State:</strong> {stepType === 'compare' ? 'Comparing' : stepType === 'swap' ? 'Swapped' : 'Set'}</div>
                  )}
                </div>
              </Html>
            )}
          </mesh>
        )
      })}
    </group>
  )
}

function stepsToHeight(steps: number) {
  const normalized = Math.sqrt(Math.max(steps, 0)) * 0.45
  return 0.2 + Math.min(normalized, 12)
}

function PerformanceGlyphs({ steps, memory }: { steps: number; memory: number }) {
  // Map steps -> height, memory -> radius
  const height = stepsToHeight(steps)
  const radius = Math.min(memory / 800, 1.2) + 0.2
  const color = steps < 1000 ? '#6bff95' : steps < 5000 ? '#ffd166' : '#ff6b6b'
  const [hover, setHover] = useState(false)
  return (
    <group position={[6, 0, 0]} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <mesh position={[0, height / 2, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[radius, radius, height, 24]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.5} />
      </mesh>
      {hover && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div className="tooltip tooltip-lg tooltip-below">
            <div className="tooltip-title">Live Run Metrics</div>
            <div>Operations: {steps}</div>
            <div>Memory (approx): {memory} B</div>
            <div>Visual: height ∝ steps; radius ∝ memory</div>
          </div>
        </Html>
      )}
    </group>
  )
}

// static group (no rotation) for performance glyphs

interface Props {
  run: RunResult | null
  stepIndex: number
  algoId?: string
  n?: number
  tab?: 'Data Structures' | 'Algorithms' | 'Comparisons'
  dsId?: string
  dsAction?: { action: DSAction; nonce: number }
  onDSStep?: (tag?: string) => void
  dsMetrics?: DSMetrics
}

export default function Viewport({ run, stepIndex, algoId, n, tab, dsId, dsAction, onDSStep, dsMetrics }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const array = run?.trace[stepIndex]?.array ?? (run ? run.trace[run.trace.length - 1]?.array : []) ?? []
  const active: [number, number] | null = run && run.trace[stepIndex]?.type !== 'set'
    ? [run.trace[stepIndex]?.i ?? -1, run.trace[stepIndex]?.j ?? -1]
    : null
  const stepType = run?.trace[stepIndex]?.type

  return (
    <div className="viewport">
      <Canvas camera={{ position: [0, 6, 12], fov: 50 }}>
        <color attach="background" args={[0x050509]} />
        <hemisphereLight args={[0xffffff, 0x223344, 0.6]} />
        <directionalLight position={[3, 5, 3]} intensity={1} />
        <Grid position={[0, 0, 0]} infiniteGrid cellSize={0.6} sectionColor={0x1a1a2b as unknown as number} />
        {tab === 'Data Structures' && dsId ? (
          <>
            <DataStructureScene id={dsId} action={dsAction} onDSStep={onDSStep} />
            <DSPerformanceGlyph metrics={dsMetrics} />
          </>
        ) : (
          <>
            <Bars array={array} active={active} stepType={stepType} onHover={setHoveredBar} hoveredIndex={hoveredBar} />
            <PerformanceGlyphs steps={run?.metrics.steps ?? 0} memory={run?.metrics.memoryBytes ?? 0} />
          </>
        )}
        {algoId && n && tab !== 'Data Structures' ? (
          <group position={[10, 0, 0]}>
            {(() => {
              const meta = algorithmsById[algoId].meta
              const bestSteps = estimateSteps(n, meta.best)
              const avgSteps = estimateSteps(n, meta.average)
              const worstSteps = estimateSteps(n, meta.worst)
              const items = [
                { key: 'best', label: 'Best', steps: bestSteps, cls: meta.best, x: -2.2 },
                { key: 'avg', label: 'Avg', steps: avgSteps, cls: meta.average, x: 0 },
                { key: 'worst', label: 'Worst', steps: worstSteps, cls: meta.worst, x: 2.2 },
              ]
              return items.map((it, idx) => {
                const h = stepsToHeight(it.steps)
                const r = 0.5 + Math.min(it.steps / 5000, 0.8)
                const color = stepsToColor(it.steps)
                const rough = idx === 0 ? 0.25 : idx === 1 ? 0.45 : 0.2
                const metal = idx === 0 ? 0.2 : idx === 1 ? 0.35 : 0.6
                const distort = idx === 0 ? 0.02 : idx === 1 ? 0.16 : 0.38
                const speed = idx === 0 ? 0.10 : idx === 1 ? 0.18 : 0.25
                return (
                  <group
                    key={it.key}
                    position={[it.x, 0, 0]}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(it.key) }}
                    onPointerOut={(e) => { e.stopPropagation(); setHovered((h) => (h === it.key ? null : h)) }}
                  >
                    <mesh position={[0, h / 2, 0]} rotation={[0, 0.4, 0]}>
                      <cylinderGeometry args={[r, r, h, 96, 24]} />
                      <MeshDistortMaterial color={color} roughness={rough} metalness={metal} distort={distort} speed={speed} flatShading={idx === 2} />
                    </mesh>
                    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                      <circleGeometry args={[r * 0.9, 24]} />
                      <meshBasicMaterial color={'#1a1a2b'} />
                    </mesh>
                    {hovered === it.key && (
                      <Html center style={{ pointerEvents: 'none' }}>
                        <div className="tooltip tooltip-lg tooltip-below">
                          <div className="tooltip-title">{it.label} Case</div>
                          <div>Complexity: {it.cls}</div>
                          <div>Est. steps: {it.steps}</div>
                          <div>Visual: height ∝ steps; color = efficiency; texture = {idx === 0 ? 'smooth' : idx === 1 ? 'medium bumps' : 'spiky'}</div>
                        </div>
                      </Html>
                    )}
                  </group>
                )
              })
            })()}
          </group>
        ) : null}
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  )
}

function DSPerformanceGlyph({ metrics }: { metrics?: DSMetrics }) {
  const steps = metrics?.operations ?? 0
  const mem = metrics?.memoryBytes ?? 0
  const height = Math.min(steps / 20, 8) + 0.2
  const radius = Math.min(mem / 512, 1.4) + 0.25
  const color = mem < 1024 ? '#6bff95' : mem < 8192 ? '#ffd166' : '#ff6b6b'
  const [hover, setHover] = React.useState(false)
  return (
    <group position={[10, 0, 0]} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <mesh position={[0, height / 2, 0]} rotation={[0, 0.35, 0]}>
        <cylinderGeometry args={[radius, radius, height, 48, 12]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.2} />
      </mesh>
      {hover && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div className="tooltip tooltip-lg tooltip-below">
            <div className="tooltip-title">Structure Metrics</div>
            <div>Operations: {steps}</div>
            <div>Memory (approx): {mem} B</div>
            <div>Visual: height ∝ operations; radius ∝ memory</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function DataStructureScene({ id, action, onDSStep }: { id: string; action?: { action: DSAction; nonce: number }; onDSStep?: (tag?: string) => void }) {
  switch (id) {
    case 'array':
      return <ArrayDS />
    case 'linked-list':
      return <LinkedListDS action={action} />
    case 'stack':
      return <StackDS action={action} />
    case 'queue':
      return <QueueDS action={action} />
    case 'bst':
      return <BSTDS action={action} />
    case 'heap':
      return <HeapDS action={action} onDSStep={onDSStep} />
    case 'hash-table':
      return <HashTableDS action={action} onDSStep={onDSStep} />
    case 'graph':
      return <GraphDS action={action} />
    default:
      return null
  }
}

function ArrayDS() {
  const count = 10
  const width = 0.7
  return (
    <group position={[-(count * width) / 2, 0, 0]}>
      {Array.from({ length: count }, (_, i) => {
        const h = 1.2
        return (
          <mesh key={i} position={[i * width, h / 2, 0]}>
            <boxGeometry args={[0.6, h, 0.6]} />
            <meshStandardMaterial color={'#6cf9e6'} metalness={0.15} roughness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

function LinkedListDS({ action }: { action?: { action: DSAction; nonce: number } }) {
  // minimal head insert/delete highlight animation
  const nodes = 6
  const radius = 0.3
  const spacing = 1.2
  const [count, setCount] = React.useState(nodes)
  React.useEffect(() => {
    if (!action) return
    if (action.action === 'list:insertHead') setCount((c) => Math.min(c + 1, 10))
    if (action.action === 'list:deleteHead') setCount((c) => Math.max(c - 1, 0))
  }, [action])
  return (
    <group position={[-((count - 1) * spacing) / 2, 0.3, 0]}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[i * spacing, 0, 0]}>
          <sphereGeometry args={[radius, 32, 16]} />
          <meshStandardMaterial color={i === 0 ? '#ffd166' : '#8aa8ff'} metalness={0.2} roughness={0.35} />
        </mesh>
      ))}
      {Array.from({ length: Math.max(0, count - 1) }, (_, i) => (
        <mesh key={'c' + i} position={[i * spacing + spacing / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, spacing - radius * 1.2, 16]} />
          <meshStandardMaterial color={'#3a9ad9'} metalness={0.1} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function StackDS({ action }: { action?: { action: DSAction; nonce: number } }) {
  const [items, setItems] = React.useState<number[]>([0, 1, 2])
  const [anim, setAnim] = React.useState<Record<number, { y: number; targetY: number; removing?: boolean }>>({
    0: { y: 0.35, targetY: 0.35 },
    1: { y: 1.05, targetY: 1.05 },
    2: { y: 1.75, targetY: 1.75 },
  })
  const speed = 4
  useFrame((_, dt) => {
    setAnim((prev) => {
      const next: typeof prev = { ...prev }
      let changed = false
      for (const idStr of Object.keys(prev)) {
        const id = Number(idStr)
        const a = prev[id]
        if (!a) continue
        const dy = a.targetY - a.y
        if (Math.abs(dy) > 0.01) {
          a.y += Math.sign(dy) * Math.min(Math.abs(dy), speed * dt)
          changed = true
        } else if (a.removing) {
          delete next[id]
          changed = true
        }
      }
      return changed ? { ...next } : prev
    })
  })

  React.useEffect(() => {
    if (!action) return
    if (action.action === 'stack:push') {
      setItems((arr) => {
        const last = arr.length ? arr[arr.length - 1] : -1
        const id = last + 1
        const newY = arr.length * 0.7 + 0.35
        setAnim((m) => ({ ...m, [id]: { y: newY + 1.2, targetY: newY } }))
        return [...arr, id]
      })
    }
    if (action.action === 'stack:pop') {
      setItems((arr) => {
        if (arr.length === 0) return arr
        const id = arr[arr.length - 1]
        setAnim((m) => ({ ...m, [id]: { ...(m[id] ?? { y: (arr.length - 1) * 0.7 + 0.35, targetY: (arr.length - 1) * 0.7 + 0.35 }), targetY: (arr.length - 1) * 0.7 + 1.8, removing: true } }))
        return arr.slice(0, -1)
      })
    }
  }, [action])

  return (
    <group position={[0, 0, 0]}>
      {items.map((id, i) => {
        const a = anim[id]
        const color = i === items.length - 1 ? '#ffd166' : '#6cf9e6'
        return (
          <mesh key={id} position={[0, a?.y ?? i * 0.7 + 0.35, 0]}>
            <boxGeometry args={[1, 0.7, 1]} />
            <meshStandardMaterial color={color} metalness={0.15} roughness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

function QueueDS({ action }: { action?: { action: DSAction; nonce: number } }) {
  const width = 0.8
  const [items, setItems] = React.useState<number[]>([0, 1, 2, 3])
  const [pos, setPos] = React.useState<Record<number, { x: number; targetX: number; removing?: boolean }>>({
    0: { x: 0 * width, targetX: 0 * width },
    1: { x: 1 * width, targetX: 1 * width },
    2: { x: 2 * width, targetX: 2 * width },
    3: { x: 3 * width, targetX: 3 * width },
  })
  const speed = 3
  useFrame((_, dt) => {
    setPos((prev) => {
      const next: typeof prev = { ...prev }
      let changed = false
      for (const k of Object.keys(prev)) {
        const id = Number(k)
        const a = prev[id]
        if (!a) continue
        const dx = a.targetX - a.x
        if (Math.abs(dx) > 0.01) {
          a.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt)
          changed = true
        } else if (a.removing) {
          delete next[id]
          changed = true
        }
      }
      return changed ? { ...next } : prev
    })
  })

  React.useEffect(() => {
    if (!action) return
    if (action.action === 'queue:enqueue') {
      setItems((arr) => {
        const last = arr.length ? arr[arr.length - 1] : -1
        const id = last + 1
        const endIndex = arr.length
        const endX = endIndex * width
        setPos((m) => ({ ...m, [id]: { x: endX + 1.2, targetX: endX } }))
        return [...arr, id]
      })
    }
    if (action.action === 'queue:dequeue') {
      setItems((arr) => {
        if (arr.length === 0) return arr
        const first = arr[0]
        setPos((m) => ({ ...m, [first]: { ...(m[first] ?? { x: 0, targetX: 0 }), targetX: -1.2, removing: true } }))
        // shift others left
        const rest = arr.slice(1)
        rest.forEach((id, i) => {
          setPos((m) => ({ ...m, [id]: { ...(m[id] ?? { x: (i + 1) * width, targetX: (i + 1) * width }), targetX: i * width } }))
        })
        return rest
      })
    }
  }, [action])

  const centerOffset = -((items.length - 1) * width) / 2 + 0.4
  return (
    <group position={[centerOffset, 0, 0]}>
      {items.map((id, idx) => {
        const a = pos[id]
        const color = idx === 0 ? '#6bff95' : idx === items.length - 1 ? '#ffd166' : '#6cf9e6'
        return (
          <mesh key={id} position={[a?.x ?? idx * width, 0.35, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color={color} metalness={0.15} roughness={0.45} />
          </mesh>
        )
      })}
      {/* Front arrow */}
      <mesh position={[-width * 1.4, 0.35, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color={'#6bff95'} />
      </mesh>
      {/* Back arrow */}
      <mesh position={[width * (items.length + 0.4), 0.35, 0]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color={'#ffd166'} />
      </mesh>
    </group>
  )
}

function BSTDS({ action }: { action?: { action: DSAction; nonce: number } }) {
  type Node = { idx: number; value: number; x: number; y: number; targetY: number }
  const [nodes, setNodes] = React.useState<Record<number, Node>>({})
  const [values, setValues] = React.useState<Record<number, number>>({})
  const spacingX = 1.4
  const baseY = 0.35
  function idxToPos(idx: number) {
    const depth = Math.floor(Math.log2(idx))
    const first = 1 << depth
    const pos = idx - first
    const x = (pos - ((first >> 1) - 0.5)) * spacingX
    return { x }
  }
  function insertValue(v: number) {
    let idx = 1
    while (values[idx] !== undefined) {
      idx = v < values[idx] ? idx * 2 : idx * 2 + 1
      if (idx > 1024) break
    }
    const { x } = idxToPos(idx)
    setValues((m) => ({ ...m, [idx]: v }))
    setNodes((m) => ({ ...m, [idx]: { idx, value: v, x, y: baseY + 2, targetY: baseY } }))
  }
  useFrame((_, dt) => {
    setNodes((prev) => {
      let changed = false
      const next: typeof prev = { ...prev }
      for (const k of Object.keys(prev)) {
        const id = Number(k)
        const n = prev[id]
        const dy = n.targetY - n.y
        if (Math.abs(dy) > 0.01) {
          n.y += Math.sign(dy) * Math.min(Math.abs(dy), 2.5 * dt)
          changed = true
        }
      }
      return changed ? { ...next } : prev
    })
  })
  React.useEffect(() => {
    if (!action) return
    if (action.action === 'bst:insert') {
      const v = Math.floor(Math.random() * 99) + 1
      insertValue(v)
    }
  }, [action])
  const entries = Object.values(nodes)
  return (
    <group>
      {entries.map((n) => (
        <mesh key={n.idx} position={[n.x, n.y, 0]}>
          <sphereGeometry args={[0.3, 32, 16]} />
          <meshStandardMaterial color={'#b388eb'} metalness={0.2} roughness={0.35} />
        </mesh>
      ))}
      {entries.map((n) => {
        const parent = Math.floor(n.idx / 2)
        if (!parent || !nodes[parent]) return null
        const px = nodes[parent].x
        const py = nodes[parent].y
        const dx = n.x - px
        const dy = n.y - py
        const len = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)
        return (
          <mesh key={'e' + n.idx} position={[px + dx / 2, py + dy / 2, 0]} rotation={[0, 0, angle]}>
            <cylinderGeometry args={[0.04, 0.04, len, 8]} />
            <meshStandardMaterial color={'#666a'} />
          </mesh>
        )
      })}
    </group>
  )
}

function HeapDS({ action, onDSStep }: { action?: { action: DSAction; nonce: number }, onDSStep?: (tag?: string) => void }) {
  const [arr, setArr] = React.useState<number[]>([5, 3, 4])
  const [pos, setPos] = React.useState<Record<number, { y: number; targetY: number }>>({
    0: { y: 0.35, targetY: 0.35 },
    1: { y: 0.35, targetY: 0.35 },
    2: { y: 0.35, targetY: 0.35 },
  })
  const spacingX = 1.2
  function idxToXY(i: number) {
    const idx = i + 1
    const depth = Math.floor(Math.log2(idx))
    const first = 1 << depth
    const posInRow = idx - first
    const x = (posInRow - ((first >> 1) - 0.5)) * spacingX
    return { x, y: 0.35 }
  }
  useFrame((_, dt) => {
    setPos((prev) => {
      let changed = false
      const next = { ...prev }
      Object.keys(prev).forEach((k) => {
        const a = prev[Number(k)]
        const dy = a.targetY - a.y
        if (Math.abs(dy) > 0.01) {
          a.y += Math.sign(dy) * Math.min(Math.abs(dy), 2.0 * dt)
          changed = true
        }
      })
      return changed ? { ...next } : prev
    })
  })
  React.useEffect(() => {
    if (!action) return
    if (action.action === 'heap:insert') {
      setArr((a) => {
        const v = Math.floor(Math.random() * 99) + 1
        const i = a.length
        setPos((m) => ({ ...m, [i]: { y: 2.0, targetY: 0.35 } }))
        const next = [...a, v]
        // sift-up logic
        let idx = i
        while (idx > 0) {
          const p = Math.floor((idx - 1) / 2)
          onDSStep?.('heap:compare')
          if (next[idx] > next[p]) {
            ;[next[idx], next[p]] = [next[p], next[idx]]
            onDSStep?.('heap:swap')
            setPos((m) => ({ ...m, [idx]: { ...(m[idx] ?? { y: 0.35, targetY: 0.35 }), y: (m[idx]?.y ?? 0.35) + 0.6 }, [p]: { ...(m[p] ?? { y: 0.35, targetY: 0.35 }), y: (m[p]?.y ?? 0.35) + 0.6 } }))
            idx = p
          } else break
        }
        return next
      })
    }
    if (action.action === 'heap:extract') {
      setArr((a) => {
        if (a.length === 0) return a
        const next = [...a]
        next[0] = next[next.length - 1]
        next.pop()
        // sift-down
        let idx = 0
        while (true) {
          const l = idx * 2 + 1
          const r = idx * 2 + 2
          if (l >= next.length) break
          let child = l
          if (r < next.length && next[r] > next[l]) child = r
          onDSStep?.('heap:compare')
          if (next[child] > next[idx]) {
            ;[next[child], next[idx]] = [next[idx], next[child]]
            onDSStep?.('heap:swap')
            setPos((m) => ({ ...m, [idx]: { ...(m[idx] ?? { y: 0.35, targetY: 0.35 }), y: (m[idx]?.y ?? 0.35) + 0.6 }, [child]: { ...(m[child] ?? { y: 0.35, targetY: 0.35 }), y: (m[child]?.y ?? 0.35) + 0.6 } }))
            idx = child
          } else break
        }
        return next
      })
    }
  }, [action])
  return (
    <group>
      {arr.map((v, i) => {
        const { x } = idxToXY(i)
        const y = pos[i]?.y ?? 0.35
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.28, 32, 16]} />
            <meshStandardMaterial color={'#6cf9e6'} metalness={0.2} roughness={0.35} />
          </mesh>
        )
      })}
      {arr.map((_, i) => {
        if (i === 0) return null
        const parent = Math.floor((i - 1) / 2)
        const { x: x1, y: y1 } = idxToXY(i)
        const { x: x0, y: y0 } = idxToXY(parent)
        const dx = x1 - x0, dy = y1 - y0
        const len = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)
        return (
          <mesh key={'e' + i} position={[x0 + dx / 2, y0 + dy / 2, 0]} rotation={[0, 0, angle]}>
            <cylinderGeometry args={[0.04, 0.04, len, 8]} />
            <meshStandardMaterial color={'#666a'} />
          </mesh>
        )
      })}
    </group>
  )
}

function HashTableDS({ action, onDSStep }: { action?: { action: DSAction; nonce: number }, onDSStep?: (tag?: string) => void }) {
  const buckets = 6
  const [items, setItems] = React.useState<Record<number, number[]>>({})
  const [probe, setProbe] = React.useState<{ b: number; i: number; active: boolean } | null>(null)
  React.useEffect(() => {
    if (!action) return
    if (action.action === 'hash:put') {
      const v = Math.floor(Math.random() * 99) + 1
      const b = v % buckets
      setItems((m) => ({ ...m, [b]: [...(m[b] ?? []), v] }))
    }
    if (action.action === 'hash:get') {
      // start a probe down a random bucket
      const nonEmpty = Object.keys(items).map(Number).filter((b) => (items[b] ?? []).length > 0)
      const b = nonEmpty.length ? nonEmpty[Math.floor(Math.random() * nonEmpty.length)] : Math.floor(Math.random() * buckets)
      setProbe({ b, i: 0, active: true })
    }
  }, [action])
  React.useEffect(() => {
    if (!probe || !probe.active) return
    const handle = setInterval(() => {
      onDSStep?.('hash:probe')
      setProbe((p) => {
        if (!p) return p
        const len = (items[p.b] ?? []).length
        if (p.i + 1 >= len) return { ...p, i: p.i, active: false }
        return { ...p, i: p.i + 1, active: true }
      })
    }, 450)
    return () => clearInterval(handle)
  }, [probe, items])
  return (
    <group position={[-3, 0, 0]}>
      {/* grid buckets */}
      {Array.from({ length: buckets }, (_, i) => (
        <mesh key={'bucket' + i} position={[i * 1.2, 0.05, 0]}>
          <boxGeometry args={[1.0, 0.1, 1.0]} />
          <meshStandardMaterial color={'#1d1d30'} />
        </mesh>
      ))}
      {/* chains */}
      {Array.from({ length: buckets }, (_, i) => (
        <group key={'chain' + i} position={[i * 1.2, 0.15, 0]}>
          {(items[i] ?? []).map((v, j) => (
            <mesh key={j} position={[0, j * 0.45 + 0.3, 0]}>
              <sphereGeometry args={[0.18, 24, 12]} />
              <meshStandardMaterial color={probe && probe.b === i && probe.i === j && probe.active ? '#ffd166' : '#8aa8ff'} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function GraphDS({ action }: { action?: { action: DSAction; nonce: number } }) {
  type GNode = { id: number; x: number; y: number; color: string }
  const [nodes, setNodes] = React.useState<GNode[]>([
    { id: 0, x: -2, y: 0.4, color: '#6cf9e6' },
    { id: 1, x: 0, y: 1.2, color: '#6cf9e6' },
    { id: 2, x: 2, y: 0.4, color: '#6cf9e6' },
  ])
  const [edges, setEdges] = React.useState<Array<[number, number]>>([[0, 1], [1, 2]])
  const [cursor, setCursor] = React.useState(0)
  React.useEffect(() => {
    if (!action) return
    if (action.action === 'graph:addNode') {
      setNodes((ns) => {
        const id = ns.length ? ns[ns.length - 1].id + 1 : 0
        const angle = (id / 8) * Math.PI * 2
        const r = 2.4
        return [...ns, { id, x: Math.cos(angle) * r, y: Math.sin(angle) * 0.8 + 0.6, color: '#6cf9e6' }]
      })
    }
    if (action.action === 'graph:addEdge') {
      setEdges((es) => {
        if (nodes.length < 2) return es
        const a = Math.floor(Math.random() * nodes.length)
        let b = Math.floor(Math.random() * nodes.length)
        if (a === b) b = (b + 1) % nodes.length
        return [...es, [a, b]]
      })
    }
    if (action.action === 'graph:bfsStep') {
      setCursor((c) => (c + 1) % Math.max(1, nodes.length))
    }
  }, [action])
  return (
    <group>
      {edges.map(([a, b], i) => {
        const na = nodes[a], nb = nodes[b]
        if (!na || !nb) return null
        const dx = nb.x - na.x, dy = nb.y - na.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)
        return (
          <mesh key={'ge' + i} position={[na.x + dx / 2, na.y + dy / 2, 0]} rotation={[0, 0, angle]}>
            <cylinderGeometry args={[0.03, 0.03, len, 8]} />
            <meshStandardMaterial color={'#666a'} />
          </mesh>
        )
      })}
      {nodes.map((n, i) => (
        <mesh key={n.id} position={[n.x, n.y, 0]}>
          <sphereGeometry args={[0.22, 24, 12]} />
          <meshStandardMaterial color={i === cursor ? '#ffd166' : n.color} />
        </mesh>
      ))}
    </group>
  )
}
