import { useState } from 'react'
import betweenBg from '../assets/the-between-bg.png'
import './MapScreen.css'

// Map structure: 3 floors, 5 nodes total
// Floor 1: 2 Remnant encounters
// Floor 2: 1 Remnant + 1 Unfinished (elite)
// Floor 3: 1 Cartographer (boss)

const MAP_NODES = [
  { id: 1, floor: 1, type: 'remnant', label: 'The Remnant', sublabel: 'Standard Encounter', icon: '✦', col: 0, row: 0 },
  { id: 2, floor: 1, type: 'remnant', label: 'The Remnant', sublabel: 'Standard Encounter', icon: '✦', col: 0, row: 1 },
  { id: 3, floor: 2, type: 'remnant', label: 'The Remnant', sublabel: 'Stronger Variant', icon: '✦', col: 1, row: 0 },
  { id: 4, floor: 2, type: 'elite', label: 'The Unfinished', sublabel: 'Elite Encounter', icon: '⚿', col: 1, row: 1 },
  { id: 5, floor: 3, type: 'boss', label: 'The Cartographer', sublabel: 'Final Boss', icon: '☽', col: 2, row: 0 },
]

const FLOOR_LABELS = ['Floor I', 'Floor II', 'Floor III']

export default function MapScreen({ character, onEnterCombat, completedNodes = [] }) {
  const [hoveredNode, setHoveredNode] = useState(null)

  // Determine which node is currently available
  const getNodeState = (node) => {
    if (completedNodes.includes(node.id)) return 'done'

    // First available node after completed ones
    const floorCompleted = MAP_NODES.filter(
      (n) => n.floor === node.floor && completedNodes.includes(n.id)
    ).length
    const floorTotal = MAP_NODES.filter((n) => n.floor === node.floor).length

    // Floor 1 nodes are always available at start
    if (node.floor === 1 && completedNodes.length === 0) return 'available'

    // For floor 1 second node - available after first is done
    if (node.floor === 1 && node.id === 2 && completedNodes.includes(1)) return 'available'

    // Floor 2 available after floor 1 complete
    const floor1Done = MAP_NODES.filter(
      (n) => n.floor === 1 && completedNodes.includes(n.id)
    ).length === 2

    if (node.floor === 2 && floor1Done) return 'available'

    // Floor 3 available after floor 2 complete
    const floor2Done = MAP_NODES.filter(
      (n) => n.floor === 2 && completedNodes.includes(n.id)
    ).length === 2

    if (node.floor === 3 && floor2Done) return 'available'

    return 'locked'
  }

  const nodesByFloor = FLOOR_LABELS.map((label, i) =>
    MAP_NODES.filter((n) => n.floor === i + 1)
  )

  return (
    <div className="map-screen">
      <div
        className="map-bg"
        style={{ backgroundImage: `url(${betweenBg})` }}
      />
      <div className="map-overlay" />

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
                  const state = getNodeState(node)
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
                         color: node.type === 'boss' ? '#c03030' : 
                                node.type === 'elite' ? '#c87830' : '#c8a030',
                         fontSize: node.type === 'boss' ? '1.8rem' : 
                                   node.type === 'elite' ? '1.4rem' : '1.2rem',
                         opacity: state === 'locked' ? 0.3 : 0.9
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

                      {/* Connector line between nodes in same floor */}
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