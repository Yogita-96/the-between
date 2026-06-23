import { useState } from 'react'
import kaenImg from '../assets/kaen.png'
import sableImg from '../assets/sable.png'
import './CharSelectScreen.css'

const CHARACTERS = [
  {
    id: 'kaen',
    name: 'Kaen',
    title: 'The Armoured',
    role: 'Heavy Combatant',
    lore: 'He has been here longer than memory. He does not know why. He knows only that he is still standing.',
    image: kaenImg,
    stats: { hp: 100, stamina: 5, agility: 2 },
    moves: [
      { name: 'Greatsword Strike', desc: '20 dmg, posture +15', cost: '3 ST' },
      { name: 'Shield Bash', desc: '8 dmg, posture +25', cost: '2 ST' },
      { name: 'Endure', desc: 'Absorb next hit, counter bonus', cost: '1 ST' },
      { name: 'Ruin Strike', desc: 'More dmg at low HP', cost: '4 ST' },
    ],
  },
  {
    id: 'sable',
    name: 'Sable',
    title: 'The Unseen',
    role: 'Precision Assassin',
    lore: 'She speaks rarely. When she does, it sounds like she is reading from something written a long time ago.',
    image: sableImg,
    stats: { hp: 65, stamina: 5, agility: 5 },
    moves: [
      { name: 'Twin Strike', desc: '2×8 dmg, posture +8', cost: '2 ST' },
      { name: 'Crossbow', desc: '20 dmg, ignores guard', cost: '2 ST' },
      { name: 'Shadow Step', desc: 'Reposition, next ×2 dmg', cost: '1 ST' },
      { name: 'Throat Strike', desc: '25 dmg, hides Intent', cost: '3 ST' },
    ],
  },
]

function StatBar({ value, max, color }) {
  const pct = (value / max) * 100
  return (
    <div className="stat-track">
      <div
        className="stat-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export default function CharSelectScreen({ onSelect }) {
  const [selected, setSelected] = useState(null)
  const [hovering, setHovering] = useState(null)

  const active = hovering || selected

  return (
    <div className="charselect">
      <div className="charselect-bg" />
      <div className="charselect-overlay" />

      <div className="charselect-content">
        <p className="charselect-eyebrow">The Between</p>
        <h2 className="charselect-title">Choose Your Path</h2>
        <div className="charselect-divider">
          <div className="cs-dash" />
          <div className="cs-gem" />
          <div className="cs-dash" />
        </div>

        <div className="charselect-grid">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className={`char-card ${selected?.id === char.id ? 'selected' : ''}`}
              onMouseEnter={() => setHovering(char)}
              onMouseLeave={() => setHovering(null)}
              onClick={() => setSelected(char)}
            >
              <div className="char-portrait-wrap">
                <img
                  src={char.image}
                  alt={char.name}
                  className="char-portrait-img"
                />
                <div className="char-portrait-fade" />
              </div>

              <div className="char-info">
                <div className="char-header">
                  <div>
                    <h3 className="char-name">{char.name}</h3>
                    <p className="char-title">{char.title} · {char.role}</p>
                  </div>
                  {selected?.id === char.id && (
                    <div className="char-selected-badge">Selected</div>
                  )}
                </div>

                <p className="char-lore">{char.lore}</p>

                <div className="char-stats">
                  <div className="char-stat-row">
                    <span className="char-stat-label">HP</span>
                    <StatBar value={char.stats.hp} max={100} color="linear-gradient(to right, #8a6010, #c8a030)" />
                    <span className="char-stat-val">{char.stats.hp}</span>
                  </div>
                  <div className="char-stat-row">
                    <span className="char-stat-label">Stamina</span>
                    <StatBar value={char.stats.stamina} max={5} color="linear-gradient(to right, #2a6010, #5aaa30)" />
                    <span className="char-stat-val">{char.stats.stamina}/5</span>
                  </div>
                  <div className="char-stat-row">
                    <span className="char-stat-label">Agility</span>
                    <StatBar value={char.stats.agility} max={5} color="linear-gradient(to right, #602080, #a040c0)" />
                    <span className="char-stat-val">{char.stats.agility}/5</span>
                  </div>
                </div>

                <div className="char-moves">
                  {char.moves.map((move) => (
                    <div key={move.name} className="char-move">
                      <span className="char-move-name">{move.name}</span>
                      <span className="char-move-desc">{move.desc} · {move.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className={`charselect-btn ${selected ? 'ready' : 'disabled'}`}
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
        >
          {selected ? `Enter as ${selected.name}` : 'Select a character'}
        </button>
      </div>
    </div>
  )
}