import { useState } from 'react'
import betweenBg from '../assets/the-between-bg.png'
import SettingsModal from '../components/SettingsModal'
import { playClick } from '../utils/audio'
import './MapScreen.css'

// ─── MAP STRUCTURE ────────────────────────────────────────────
// Floor 1: 2 Remnants (sequential)
// Floor 2: 1 Dual-Remnant node + 1 Unfinished (elite)
// Floor 3: 1 Cartographer (boss)
const MAP_NODES = [
  { id: 1, floor: 1, type: 'remnant',  label: 'The Remnant',      sublabel: 'Standard Encounter', icon: '✦' },
  { id: 2, floor: 1, type: 'remnant',  label: 'The Remnant',      sublabel: 'Standard Encounter', icon: '✦' },
  { id: 3, floor: 2, type: 'remnant',  label: 'Two Remnants',     sublabel: 'Dual Encounter',     icon: '✦' },
  { id: 4, floor: 2, type: 'elite',    label: 'The Unfinished',   sublabel: 'Elite Encounter',    icon: '⚿' },
  { id: 5, floor: 3, type: 'boss',     label: 'The Cartographer', sublabel: 'Final Boss',         icon: '☽' },
]

const FLOOR_LABELS = ['Floor I', 'Floor II', 'Floor III']

export default function MapScreen({ character, onEnterCombat, completedNodes = [], onQuitToTitle, onMusicVolumeChange }) {
  const [hoveredNode, setHoveredNode] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  const getNodeState = (node) => {
    // Already cleared
    if (completedNodes.includes(node.id)) return 'done'

    const nodesOnFloor    = MAP_NODES.filter(n => n.floor === node.floor)
    const prevFloorNodes  = MAP_NODES.filter(n => n.floor === node.floor - 1)
    const prevFloorCleared = prevFloorNodes.every(n => completedNodes.includes(n.id))

    // Floor 1 — both nodes always available from the start
    if (node.floor === 1) return 'available'

    // All other floors — previous floor must be fully cleared first
    if (!prevFloorCleared) return 'locked'

    // Within the floor — nodes unlock sequentially
    const nodeIndex = nodesOnFloor.indexOf(node)
    if (nodeIndex === 0) return 'available'

    // Next node unlocks only after the previous one on this floor is cleared
    const prevNode = nodesOnFloor[nodeIndex - 1]
    return completedNodes.includes(prevNode.id) ? 'available' : 'locked'
  }

  const nodesByFloor = FLOOR_LABELS.map((_, i) =>
    MAP_NODES.filter(n => n.floor === i + 1)
  )

  return (
    <div className="map-screen">
      <div className="map-bg" style={{ backgroundImage: `url(${betweenBg})` }} />
      <div className="map-overlay" />

      <button
        className="settings-icon-circular"
        onClick={() => { playClick(); setShowSettings(true) }}
        aria-label="Settings"
      >
        ⚙
      </button>

      <button
        className="map-quit-btn"
        onClick={() => { playClick(); setShowQuitConfirm(true) }}
      >
        ✕ Quit Run
      </button>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onMusicVolumeChange={onMusicVolumeChange}
        />
      )}

      {showQuitConfirm && (
        <div className="map-confirm-backdrop" onClick={() => setShowQuitConfirm(false)}>
          <div className="map-confirm-box" onClick={e => e.stopPropagation()}>
            <p className="map-confirm-text">
              Leaving now abandons this run. Your progress will be lost.
            </p>
            <div className="map-confirm-btns">
              <button className="map-confirm-cancel" onClick={() => setShowQuitConfirm(false)}>
                Stay
              </button>
              <button
                className="map-confirm-quit"
                onClick={() => {
                  setShowQuitConfirm(false)
                  onQuitToTitle?.()
                }}
              >
                Quit to Title
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="map-content">
        <div className="map-header">
          <p className="map-eyebrow">The Between</p>
          <h2 className="map-title">Choose Your Path</h2>
          <div className="map-divider">
            <div className="map-dash" />
            <div className="map-gem" />
            <div className="map-dash" />
          </div>
        </div>

        <div className="map-player-info">
          <div className="map-player-badge">
            <span className="map-player-name">{character.name}</span>
            <span className="map-player-role">{character.role}</span>
          </div>
          <div className="map-player-badge">
            <span className="map-player-role" style={{ fontStyle: 'italic' }}>
              {completedNodes.length === 0
                ? 'Your journey begins'
                : `${completedNodes.length} of 5 encounters cleared`}
            </span>
          </div>
        </div>

        <div className="map-grid">
          {nodesByFloor.map((floorNodes, floorIndex) => (
            <div key={floorIndex} className="map-floor-col">
              <div className="map-floor-label">{FLOOR_LABELS[floorIndex]}</div>
              <div className="map-floor-nodes">
                {floorNodes.map((node) => {
                  const state     = getNodeState(node)
                  const isHovered = hoveredNode?.id === node.id

                  return (
                    <div key={node.id} className="map-node-wrap">
                      <button
                        className={`map-node map-node--${state} map-node--${node.type}`}
                        onClick={() => state === 'available' && onEnterCombat(node)}
                        onMouseEnter={() => state !== 'locked' && setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        disabled={state !== 'available'}
                      >
                        <span style={{
                          color:    node.type === 'boss'  ? '#c03030' :
                                    node.type === 'elite' ? '#c87830' : '#c8a030',
                          fontSize: node.type === 'boss'  ? '1.8rem'  :
                                    node.type === 'elite' ? '1.4rem'  : '1.2rem',
                          opacity:  state === 'locked' ? 0.3 : 0.9,
                        }}>
                          {node.icon}
                        </span>
                        {state === 'done' && (
                          <span className="map-node-checkmark">✓</span>
                        )}
                      </button>

                      {isHovered && (
                        <div className="map-node-tooltip">
                          <p className="tooltip-name">{node.label}</p>
                          <p className="tooltip-sub">{node.sublabel}</p>
                          {state === 'available' && (
                            <p className="tooltip-action">Click to enter</p>
                          )}
                        </div>
                      )}

                      {floorNodes.indexOf(node) < floorNodes.length - 1 && (
                        <div className={`map-connector ${
                          completedNodes.includes(node.id) ? 'map-connector--done' : ''
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="map-legend">
          <div className="map-legend-item">
            <div className="map-legend-dot map-legend-dot--done" />
            <span>Cleared</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot map-legend-dot--available" />
            <span>Available</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot map-legend-dot--locked" />
            <span>Locked</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot map-legend-dot--boss" />
            <span>Boss</span>
          </div>
        </div>
      </div>
    </div>
  )
}