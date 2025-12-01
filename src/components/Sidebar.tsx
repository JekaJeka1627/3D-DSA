import React from 'react'
import { algorithms, algorithmsById } from '@/algorithms'
import { dataStructures, dataStructuresById } from '@/datastructures'

export type SidebarTab = 'Data Structures' | 'Algorithms' | 'Comparisons'

interface Props {
  tab: SidebarTab
  setTab: (t: SidebarTab) => void
  selectedAlgoId: string
  onSelectAlgo: (id: string) => void
  selectedDSId: string
  onSelectDS: (id: string) => void
}

export default function Sidebar({ tab, setTab, selectedAlgoId, onSelectAlgo, selectedDSId, onSelectDS }: Props) {
  return (
    <aside className="sidebar">
      <div className="section">
        <div className="heading">Explore</div>
        <div className="tabs">
          {(['Data Structures', 'Algorithms', 'Comparisons'] as const).map(t => (
            <button key={t} className={"tab" + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {tab === 'Data Structures' && (
          <>
            <ul>
              {dataStructures.map(ds => (
                <li key={ds.id}>
                  <button
                    className={"tab" + (selectedDSId === ds.id ? ' active' : '')}
                    onClick={() => onSelectDS(ds.id)}
                  >{ds.name}</button>
                </li>
              ))}
            </ul>
            <div className="section">
              <div className="heading">About</div>
              <div className="legend" style={{ color: 'var(--text)' }}>
                <strong>{dataStructuresById[selectedDSId].name}.</strong> {dataStructuresById[selectedDSId].definition}
                <div style={{ marginTop: 6 }}>{dataStructuresById[selectedDSId].summary}</div>
              </div>
            </div>
          </>
        )}
        {tab === 'Algorithms' && (
          <>
            <ul>
              {algorithms.map(a => (
                <li key={a.meta.id}>
                  <button
                    className={"tab" + (selectedAlgoId === a.meta.id ? ' active' : '')}
                    onClick={() => onSelectAlgo(a.meta.id)}
                  >{a.meta.name}</button>
                </li>
              ))}
            </ul>
            <div className="section">
              <div className="heading">About</div>
              <div className="legend" style={{ color: 'var(--text)' }}>
                <strong>{algorithmsById[selectedAlgoId].meta.name}.</strong> {algorithmsById[selectedAlgoId].meta.definition}
                <div style={{ marginTop: 6 }}>{algorithmsById[selectedAlgoId].meta.summary}</div>
              </div>
            </div>
          </>
        )}
        {tab === 'Comparisons' && (
          <div style={{ opacity: 0.7 }}>Select multiple algorithms to compare (coming soon).</div>
        )}
      </div>
    </aside>
  )
}
