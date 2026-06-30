import { useState, useEffect, useRef } from 'react'
import kaenImg from '../assets/kaen.png'
import kaenProfile1 from '../assets/kaen-sideprofile.png'
import kaenAction from '../assets/kaen-action.png'
import sableImg from '../assets/sable.png'
import sableProfile from '../assets/sable-sideprofile.png'
import sableAction from '../assets/sable-action.png'
import betweenBg from '../assets/the-between-bg.png'
import bgMusic from '../assets/audio/the-between-music.mp3'
import clickSfx from '../assets/audio/click-basic.wav'
import './CharSelectScreen.css'

const CHARACTERS = [
  {
    id: 'kaen',
    name: 'Kaen',
    title: 'The Armoured',
    role: 'Heavy Combatant',
    lore: 'He has been here longer than memory. He does not know why. He knows only that he is still standing.',
    image: kaenImg,
    images: [kaenImg, kaenProfile1, kaenAction],
    stats: { hp: 100, stamina: 5, agility: 2 },
    moves: [
      { name: 'Greatsword Strike', desc: '20 dmg · posture +12', cost: '3 ST' },
      { name: 'Shield Bash',       desc: '8 dmg · posture +18',  cost: '2 ST' },
      { name: 'Endure',            desc: 'Block incoming · posture −30', cost: '1 ST' },
      { name: 'Ruin Strike',       desc: 'Scales with missing HP', cost: '4 ST' },
    ],
  },
  {
    id: 'sable',
    name: 'Sable',
    title: 'The Unseen',
    role: 'Precision Assassin',
    lore: 'She speaks rarely. When she does, it sounds like she is reading from something written a long time ago.',
    image: sableImg,
    images: [sableImg, sableProfile, sableAction],
    stats: { hp: 65, stamina: 5, agility: 5 },
    moves: [
      { name: 'Shadow Strike', desc: '18 dmg · fast and cheap',        cost: '2 ST' },
      { name: 'Vanish',        desc: 'Sidestep — nullifies incoming hit', cost: '1 ST' },
      { name: 'Exploit',       desc: '28 dmg · only when enemy staggered', cost: '3 ST' },
      { name: 'Bleed Edge',    desc: '10 dmg · posture +14 · sets up stagger', cost: '2 ST' },
    ],
  },
]

// ─── AUDIO HELPERS ────────────────────────────────────────────
function useAmbientMusic(src) {
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio

    // Fade in over 2s
    audio.play().catch(() => {}) // browsers may block autoplay — silently ignore
    let vol = 0
    const fade = setInterval(() => {
      vol = Math.min(vol + 0.02, 0.45)
      audio.volume = vol
      if (vol >= 0.45) clearInterval(fade)
    }, 80)

    return () => {
      clearInterval(fade)
      // Fade out on unmount
      let v = audio.volume
      const fadeOut = setInterval(() => {
        v = Math.max(v - 0.03, 0)
        audio.volume = v
        if (v <= 0) {
          clearInterval(fadeOut)
          audio.pause()
          audio.src = ''
        }
      }, 60)
    }
  }, [src])

  return audioRef
}

function playClick() {
  const sfx = new Audio(clickSfx)
  sfx.volume = 0.35
  sfx.play().catch(() => {})
}

// ─── STAT BAR ─────────────────────────────────────────────────
function StatBar({ value, max, color }) {
  const pct = (value / max) * 100
  return (
    <div className="stat-track">
      <div className="stat-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ─── CHARACTER PORTRAIT ───────────────────────────────────────
function CharPortrait({ char, isActive, onDotClick }) {
  const [imgIndex, setImgIndex] = useState(0)
  const prevActiveRef = useRef(isActive)

  useEffect(() => {
    if (!isActive && prevActiveRef.current) setImgIndex(0)
    prevActiveRef.current = isActive
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => {
      setImgIndex(i => (i + 1) % char.images.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [isActive, char.images.length])

  return (
    <div className="char-portrait-wrap">
      <img
        key={`${char.id}-${imgIndex}`}
        src={char.images[imgIndex]}
        alt={char.name}
        className="char-portrait-img"
      />
      <div className="char-portrait-fade" />
      {isActive && (
        <div className="char-img-dots">
          {char.images.map((_, i) => (
            <div
              key={i}
              className={`char-img-dot ${i === imgIndex ? 'active' : ''}`}
              onClick={e => {
                e.stopPropagation()
                playClick()
                setImgIndex(i)
                onDotClick?.()
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MAIN SCREEN ──────────────────────────────────────────────
export default function CharSelectScreen({ onSelect }) {
  const [selected, setSelected] = useState(null)
  const [hovering, setHovering] = useState(null)

  useAmbientMusic(bgMusic)

  return (
    <div className="charselect">
      <div className="charselect-bg" style={{ backgroundImage: `url(${betweenBg})` }} />
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
          {CHARACTERS.map((char) => {
            const isActive = hovering?.id === char.id || selected?.id === char.id
            return (
              <div
                key={char.id}
                className={`char-card ${selected?.id === char.id ? 'selected' : ''}`}
                onMouseEnter={() => setHovering(char)}
                onMouseLeave={() => setHovering(null)}
                onClick={() => {
                  playClick()
                  setSelected(char)
                }}
              >
                <CharPortrait char={char} isActive={isActive} />

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
                    <p className="char-moves-label">Signature Moves</p>
                    {char.moves.map((move) => (
                      <div key={move.name} className="char-move">
                        <span className="char-move-name">{move.name}</span>
                        <span className="char-move-desc">{move.desc} · {move.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          className={`charselect-btn ${selected ? 'ready' : 'disabled'}`}
          onClick={() => {
            if (selected) {
              playClick()
              onSelect(selected)
            }
          }}
          disabled={!selected}
        >
          {selected ? `Enter as ${selected.name}` : 'Select a character'}
        </button>
      </div>
    </div>
  )
}