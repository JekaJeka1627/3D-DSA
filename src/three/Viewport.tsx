import React, { useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, Html, MeshDistortMaterial, Text } from '@react-three/drei'
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
              <Html center position={[0, -0.625, 0]} style={{ pointerEvents: 'none' }}>
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
  resetViewNonce?: number
}

export default function Viewport({ run, stepIndex, algoId, n, tab, dsId, dsAction, onDSStep, dsMetrics, resetViewNonce }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const array = run?.trace[stepIndex]?.array ?? (run ? run.trace[run.trace.length - 1]?.array : []) ?? []
  const active: [number, number] | null = run && run.trace[stepIndex]?.type !== 'set'
    ? [run.trace[stepIndex]?.i ?? -1, run.trace[stepIndex]?.j ?? -1]
    : null
  const stepType = run?.trace[stepIndex]?.type
  const small = new Set(["O(1)", "O(log n)", "O(n)"]);
  const big=new Set(["O(n^2)"]);
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
          </>
        )}
        {algoId && n && tab !== 'Data Structures' ? (
          (() => {
            const width = 0.6
            const span = array.length * width
            const baseX = span / 2 + 6.5
            return (
              <group position={[baseX, 0, 0]}>
            {(() => {
              const meta = algorithmsById[algoId].meta
              const bestSteps = estimateSteps(n, meta.best)
              const avgSteps = estimateSteps(n, meta.average)
              const worstSteps = estimateSteps(n, meta.worst)
              const liveSteps = run?.metrics.steps ?? 0
              const liveMem = run?.metrics.memoryBytes ?? 0
              const liveH = Math.min(liveSteps / 50, 8) + 0.2
              const liveR = 0.5 + Math.min(liveMem / 5000, 0.8)
              const items = [
                { key: 'live', label: 'Live', steps: liveSteps, cls: '—', x: -3.0, r: liveR, h: liveH, live: true },
                { key: 'best', label: 'Best', steps: bestSteps, cls: meta.best, x: 0.0 },
                { key: 'avg', label: 'Avg', steps: avgSteps, cls: meta.average, x: 2.0+(big.has(meta.average)?1:(small.has(meta.average)?-0.5:0))},
                { key: 'worst', label: 'Worst', steps: worstSteps, cls: meta.worst, x: 4.0+(big.has(meta.average)?1:(small.has(meta.average)?-0.5:0))+(big.has(meta.worst)?1:(small.has(meta.average)?-0.5:0))},
              ] as const
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
                    <Html
                      position={[0, -0.85, 0]}  // tweak this to move it farther/closer
                      center
                      style={{
                        color: 'white',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                      }}
                    >
                      {it.label}<br/>
                      {it.cls}
                    </Html>
                    {hovered === it.key && (
                      <Html center position={[0, -0, 0]} style={{ pointerEvents: 'none' }}>
                        <div className="tooltip tooltip-lg tooltip-below">
                          <div className="tooltip-title">{it.label} Case</div>
                          <div>Complexity: {it.cls}</div>
                          <div>Steps: {it.steps}</div>
                          <div>Visual: height ∝ steps; color = efficiency; texture = {idx === 0 ? 'smooth' : idx === 1 ? 'medium bumps' : 'spiky'}</div>
                        </div>
                      </Html>
                    )}
                  </group>
                )
              })
            })()}
              </group>
            )
          })()
        ) : null}
        <ResettableOrbit resetKey={resetViewNonce} />
      </Canvas>
    </div>
  )
}

function ResettableOrbit({ resetKey }: { resetKey?: number }) {
  const controls = React.useRef<any>(null)
  const { camera } = useThree()
  React.useEffect(() => {
    if (!resetKey) return
    if (controls.current) {
      controls.current.reset()
    }
    camera.position.set(0, 6, 12)
    camera.lookAt(0, 0, 0)
  }, [resetKey])
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} />
}

function DSPerformanceGlyph({ metrics, x = 10 }: { metrics?: DSMetrics; x?: number }) {
  const steps = metrics?.operations ?? 0
  const mem = metrics?.memoryBytes ?? 0
  const count = Math.max(0, Math.round(mem / 64))
  const height = 0.2 + Math.min(Math.sqrt(steps) * 0.6, 10)
  const radius = 0.3 + Math.min(count / 10, 1.5)
  // Ops/sec meter using a 2s sliding window + EMA smoothing
  const tsRef = React.useRef<number[]>([])
  const prevOpsRef = React.useRef<number>(steps)
  const [opsPerSec, setOpsPerSec] = useState(0)
  React.useEffect(() => {
    const now = performance.now()
    const prev = prevOpsRef.current
    if (steps > prev) {
      const diff = steps - prev
      for (let i = 0; i < diff; i++) tsRef.current.push(now)
      prevOpsRef.current = steps
      const windowMs = 2000
      const cutoff = now - windowMs
      tsRef.current = tsRef.current.filter((t) => t >= cutoff)
      const rate = (tsRef.current.length / windowMs) * 1000
      setOpsPerSec((r) => r * 0.7 + rate * 0.3)
    }
  }, [steps])
  const color = opsPerSec < 1 ? '#6bff95' : opsPerSec < 3 ? '#ffd166' : '#ff6b6b'
  const grp = React.useRef<any>(null)
  const t = React.useRef(0)
  useFrame((_, dt) => {
    t.current += dt
    const amp = Math.min(0.12, opsPerSec / 8)
    const s = 1 + Math.sin(t.current * 4) * amp
    if (grp.current) grp.current.scale.set(1, s, 1)
  })
  const [hover, setHover] = React.useState(false)
  return (
    <group ref={grp} position={[x, 0, 0]} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <mesh position={[0, height / 2, 0]} rotation={[0, 0.35, 0]}>
        <cylinderGeometry args={[radius, radius, height, 56, 16]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.2} emissive={color} emissiveIntensity={Math.min(0.6, opsPerSec / 5)} />
      </mesh>
      {hover && (
        <Html center position={[0, -0.75, 0]} style={{ pointerEvents: 'none' }}>
          <div className="tooltip tooltip-lg tooltip-below">
            <div className="tooltip-title">Structure Metrics</div>
            <div>Operations (total): {steps}</div>
            <div>Activity: {opsPerSec.toFixed(2)} ops/sec</div>
            <div>Size: ~{count} elements</div>
            <div>Visual: height ∝ total ops; radius ∝ size; color/pulse ∝ activity</div>
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

// TreeTraversalScene removed per request

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
  let gap=0.85
  let base=0.35
  type AnimRow = { 
    y: number
    targetY: number
    removing?: boolean
  }
  const [items, setItems] = React.useState<number[]>([0, 1, 2])
  const [anim, setAnim] = React.useState<Record<number, AnimRow>>(() =>
    Object.fromEntries(
      [0, 1, 2].map(i => {
        const y = base + i * gap
        return [i, { y, targetY: y }]
      })
    ) as Record<number, AnimRow>   // <-- Cast required
  )
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
        const newY = arr.length * gap + base
        setAnim((m) => ({ ...m, [id]: { y: newY + 1.2, targetY: newY } }))
        return [...arr, id]
      })
    }
    if (action.action === 'stack:pop') {
      setItems((arr) => {
        if (arr.length === 0) return arr
        const id = arr[arr.length - 1]
        setAnim((m) => ({ ...m, [id]: { ...(m[id] ?? { y: (arr.length - 1) * gap + base, targetY: (arr.length - 1) * gap + base }), targetY: (arr.length - 1) * gap + 1.8, removing: true } }))
        return arr.slice(0, -1)
      })
    }
  }, [action])

  return (
    <group position={[0, -2.0, 0]}>
      {items.map((id, i) => {
        const a = anim[id]
        const color = i === items.length - 1 ? '#ffd166' : '#6cf9e6'
        return (
          <mesh key={id} position={[0, a?.y ?? i * gap + base, 0]}>
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
  type Node = { 
    idx: number
    value: number
    x: number
    y: number
    targetY: number
  }

  const [nodes, setNodes] = React.useState<Record<number, Node>>({})
  const [values, setValues] = React.useState<Record<number, number>>({})

  const baseY = 2.0          // root height
  const levelGap = 0.8       // vertical distance between levels

  const baseWidth = 2.0      // width at depth 0
  const growth   = 1.3       // > 1 → width grows with depth
  const maxWidth = 10.0      // hard cap so it doesn’t get crazy

  function idxToPos(idx: number) {
    const depth = Math.floor(Math.log2(idx))
    const first = 1 << depth
    const pos = idx - first
    const count = 1 << depth

    // t in [-1, 1] across the level
    const t = count === 1 ? 0 : (pos / (count - 1)) * 2 - 1

    // width increases with depth but is clamped
    const width = Math.min(maxWidth, baseWidth * Math.pow(growth, depth))
    const x = t * (width / 2)
    const y = baseY - depth * levelGap

    return { x, y }
  }

  function insertValue(v: number) {
    let idx = 1
    while (values[idx] !== undefined) {
      idx = v < values[idx] ? idx * 2 : idx * 2 + 1
      if (idx > 1024) break
    }

    const { x, y } = idxToPos(idx)

    setValues((m) => ({ ...m, [idx]: v }))
    setNodes((m) => ({
      ...m,
      [idx]: { idx, value: v, x, y: y + 2, targetY: y }, // drop down
    }))
  }

  useFrame((_, dt) => {
    setNodes((prev) => {
      let changed = false
      const next = { ...prev }

      for (const k of Object.keys(next)) {
        const id = Number(k)
        const n = next[id]
        const dy = n.targetY - n.y
        if (Math.abs(dy) > 0.01) {
          n.y += Math.sign(dy) * Math.min(Math.abs(dy), 2.5 * dt)
          changed = true
        }
      }

      return changed ? next : prev
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
    {/* nodes */}
    {entries.map((n) => (
      <group key={n.idx} position={[n.x, n.y, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 32, 16]} />
          <meshStandardMaterial color="#b388eb" metalness={0.2} roughness={0.35} />
        </mesh>

        {/* value label */}
        <Text
          position={[0, 0, 0.4]}   // a bit in front of the sphere
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000"
        >
          {n.value}
        </Text>
      </group>
    ))}

    {/* edges */}
    {entries.map((n) => {
      const parentIdx = Math.floor(n.idx / 2)
      const parent = nodes[parentIdx]
      if (!parent) return null

      const px = parent.x
      const py = parent.y
      const dx = n.x - px
      const dy = n.y - py
      const len = Math.sqrt(dx * dx + dy * dy)

      const r = 0.3
      const visLen = Math.max(0.001, len - 2 * r)

      const angle = Math.atan2(-dx, dy) // fixed orientation

      return (
        <mesh
          key={'edge' + n.idx}
          position={[px + dx / 2, py + dy / 2, 0]}
          rotation={[0, 0, angle]}
        >
          <cylinderGeometry args={[0.04, 0.04, visLen, 8]} />
          <meshStandardMaterial color="#666a" />
        </mesh>
      )
    })}
  </group>
)

}

function HeapDS({
  action,
  onDSStep,
}: {
  action?: { action: DSAction; nonce: number }
  onDSStep?: (tag?: string) => void
}) {
  const spacingX = 1.2

  // layout helper: position nodes by tree level
  function idxToXY(i: number) {
    const idx = i + 1
    const depth = Math.floor(Math.log2(idx))
    const first = 1 << depth
    const posInRow = idx - first
    const x = (posInRow - ((first >> 1) - 0.5)) * spacingX
    const baseY = 1.5 - depth * 0.7 // root high, children lower
    return { x, y: baseY }
  }

  function defaultPosFor(i: number) {
    const { y } = idxToXY(i)
    return { y, targetY: y }
  }

  const [arr, setArr] = React.useState<number[]>([5, 3, 4])
  const [pos, setPos] = React.useState<
    Record<number, { y: number; targetY: number }>
  >({
    0: defaultPosFor(0),
    1: defaultPosFor(1),
    2: defaultPosFor(2),
  })

  useFrame((_, dt) => {
    setPos((prev) => {
      let changed = false
      const next: typeof prev = {}

      Object.keys(prev).forEach((k) => {
        const idx = Number(k)
        const a = prev[idx]
        const dy = a.targetY - a.y
        let ny = a.y
        if (Math.abs(dy) > 0.01) {
          ny += Math.sign(dy) * Math.min(Math.abs(dy), 2.0 * dt)
          changed = true
        }
        next[idx] = { ...a, y: ny }
      })

      return changed ? next : prev
    })
  })

  React.useEffect(() => {
    if (!action) return

    if (action.action === 'heap:insert') {
      setArr((a) => {
        const v = Math.floor(Math.random() * 99) + 1
        const i = a.length
        const base = defaultPosFor(i)

        // new node falls into its row
        setPos((m) => ({
          ...m,
          [i]: { y: base.y + 2.0, targetY: base.y },
        }))

        const next = [...a, v]

        // sift-up
        let idx = i
        while (idx > 0) {
          const p = Math.floor((idx - 1) / 2)
          onDSStep?.('heap:compare')
          if (next[idx] > next[p]) {
            ;[next[idx], next[p]] = [next[p], next[idx]]
            onDSStep?.('heap:swap')

            const baseIdx = defaultPosFor(idx).y
            const baseP = defaultPosFor(p).y

            setPos((m) => ({
              ...m,
              [idx]: {
                ...(m[idx] ?? { y: baseIdx, targetY: baseIdx }),
                y: (m[idx]?.y ?? baseIdx) + 0.6,
                targetY: baseIdx,
              },
              [p]: {
                ...(m[p] ?? { y: baseP, targetY: baseP }),
                y: (m[p]?.y ?? baseP) + 0.6,
                targetY: baseP,
              },
            }))

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

            const baseIdx = defaultPosFor(idx).y
            const baseChild = defaultPosFor(child).y

            setPos((m) => ({
              ...m,
              [idx]: {
                ...(m[idx] ?? { y: baseIdx, targetY: baseIdx }),
                y: (m[idx]?.y ?? baseIdx) + 0.6,
                targetY: baseIdx,
              },
              [child]: {
                ...(m[child] ?? { y: baseChild, targetY: baseChild }),
                y: (m[child]?.y ?? baseChild) + 0.6,
                targetY: baseChild,
              },
            }))

            idx = child
          } else break
        }
        return next
      })
    }
  }, [action])

  return (
    <group>
      {/* nodes + labels */}
      {arr.map((v, i) => {
        const { x, y: baseY } = idxToXY(i)
        const animatedY = pos[i]?.y ?? baseY
        return (
          <group key={i} position={[x, animatedY, 0]}>
            <mesh>
              <sphereGeometry args={[0.28, 32, 16]} />
              <meshStandardMaterial
                color={'#6cf9e6'}
                metalness={0.2}
                roughness={0.35}
              />
            </mesh>
            {/* value label slightly in front of the sphere */}
            <Text
              position={[0, 0, 0.31]}
              fontSize={0.22}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {String(v)}
            </Text>
          </group>
        )
      })}

      {/* edges – recomputed from animated positions so they don't flip */}
      {arr.map((_, i) => {
        if (i === 0) return null
        const parent = Math.floor((i - 1) / 2)

        const childBase = idxToXY(i)
        const parentBase = idxToXY(parent)

        const x1 = childBase.x
        const y1 = pos[i]?.y ?? childBase.y

        const x0 = parentBase.x
        const y0 = pos[parent]?.y ?? parentBase.y

        const dx = x1 - x0
        const dy = y1 - y0
        const len = Math.sqrt(dx * dx + dy * dy)
        const r = 0.28
        const visLen = Math.max(0.001, len - 2 * r)

        // cylinder is aligned with +Y, rotate around Z to point along (dx, dy)
        const angle = Math.atan2(dx, -dy)

        return (
          <mesh
            key={'e' + i}
            position={[(x0 + x1) / 2, (y0 + y1) / 2, 0]}
            rotation={[0, 0, angle]}
          >
            <cylinderGeometry args={[0.04, 0.04, visLen, 8]} />
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

// GraphDS removed per request

