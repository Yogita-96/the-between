import { useState, useEffect, useCallback } from 'react'
import kaenVsRemnantM from '../assets/KaenVsRemnant-M.png'
import kaenVsRemnantF from '../assets/KaenVsRemnant-F.png'
import kaenVictory from '../assets/kaen-victory.png'
import remnantM from '../assets/remnant-m.png'
import remnantF from '../assets/remnant-f.png'
import './CombatScreen.css'

// ─── DEFEAT LINES BY ENEMY TIER ──────────────────────────────
const DEFEAT_LINES = {
  remnant: [
    "You'll stay now. Like the rest of us.",
    "It's quieter here. You'll see.",
    "No one finishes. Not even you.",
    "Rest. You were never going to leave.",
    "We were like you once. Still walking.",
    "The Between keeps what it catches.",
  ],
  unfinished: [
    "I was almost something. So were you.",
    "You can't finish what I couldn't.",
    "We're the same now. Incomplete.",
    "Stay. Help me become.",
  ],
  cartographer: [
    "I marked your path the moment you arrived.",
    "Another road, ending where they all end. Here.",
    "I have a place for you on the map already.",
    "You walked exactly as I drew it.",
  ],
}

// ─── ENEMY INTENT POOLS (atmospheric + functional) ───────────
const REMNANT_INTENTS = [
  { type: 'attack', label: 'Reach', line: "It reaches for you with what's left of its hands.", dmg: 22, posture: 25 },
  { type: 'attack', label: 'Wail', line: "It opens its mouth and the sound takes something from you.", dmg: 15, drainStamina: 1, posture: 20 },
  { type: 'attack', label: 'Clutch', line: "It seizes you, dragging you toward the dark.", dmg: 18, posture: 30 },
  { type: 'guard', label: 'Fold', line: "It folds inward, bracing against what comes.", dmg: 0, posture: 0 },
]

// ─── PLAYER MOVES (Kaen) ─────────────────────────────────────
const KAEN_MOVES = [
  { name: 'Greatsword Strike', cost: 3, dmg: 20, posture: 12, desc: '20 dmg · posture +12' },
  { name: 'Shield Bash', cost: 2, dmg: 8, posture: 18, desc: '8 dmg · posture +18' },
  { name: 'Endure', cost: 1, dmg: 0, posture: 0, desc: 'Brace — block & steady posture', special: 'endure' },
  { name: 'Ruin Strike', cost: 4, dmg: 16, posture: 8, desc: 'More dmg at low HP', special: 'ruin' },
]

export default function CombatScreen({ character, node, onWin, onLose, onFlee }) {
  // Randomly pick which Remnant variant we're fighting
  const [remnantVariant] = useState(() => (Math.random() < 0.5 ? 'M' : 'F'))
  const combatBg = remnantVariant === 'M' ? kaenVsRemnantM : kaenVsRemnantF
  const defeatArt = remnantVariant === 'M' ? remnantM : remnantF

  // Combat state
  const [playerHP, setPlayerHP] = useState(character?.stats?.hp || 100)
  const [playerMaxHP] = useState(character?.stats?.hp || 100)
  const [playerST, setPlayerST] = useState(5)
  const [playerPosture, setPlayerPosture] = useState(0)
  const [playerStaggered, setPlayerStaggered] = useState(false)

  const [enemyHP, setEnemyHP] = useState(80)
  const [enemyMaxHP] = useState(80)
  const [enemyPosture, setEnemyPosture] = useState(0)
  const [enemyStaggered, setEnemyStaggered] = useState(false)

  const [intent, setIntent] = useState(REMNANT_INTENTS[0])
  const [phase, setPhase] = useState('player') // 'player' | 'enemy' | 'won' | 'lost'
  const [enduring, setEnduring] = useState(false)
  const [log, setLog] = useState(['The Remnant forms before you.'])
  const [defeatLine] = useState(
    () => DEFEAT_LINES.remnant[Math.floor(Math.random() * DEFEAT_LINES.remnant.length)]
  )

  const addLog = useCallback((msg) => {
    setLog(prev => [msg, ...prev].slice(0, 4))
  }, [])

  // Pick a new enemy intent for the upcoming turn
  const rollIntent = useCallback(() => {
    const next = REMNANT_INTENTS[Math.floor(Math.random() * REMNANT_INTENTS.length)]
    setIntent(next)
  }, [])

  // ─── PLAYER ACTS ───────────────────────────────────────────
  const playerMove = (move) => {
    if (phase !== 'player') return
    if (playerST < move.cost) {
      addLog('Not enough stamina.')
      return
    }

    let dmg = move.dmg
    // Ruin Strike scales with missing HP
    if (move.special === 'ruin') {
      const missing = 1 - playerHP / playerMaxHP
      dmg = Math.round(move.dmg * (1 + missing))
    }
    // Bonus damage if enemy staggered
    if (enemyStaggered && dmg > 0) {
      dmg = Math.round(dmg * 1.5)
      addLog('Staggered — Kaen strikes deep!')
    }

    setPlayerST(st => st - move.cost)

    // Endure — brace and steady posture
    if (move.special === 'endure') {
      setEnduring(true)
      setPlayerPosture(p => Math.max(0, p - 30))
      addLog('Kaen braces — posture steadied.')
    }

    // Apply damage to enemy
    if (dmg > 0) {
      setEnemyHP(hp => Math.max(0, hp - dmg))
      addLog(`Kaen uses ${move.name} — ${dmg} dmg.`)
    }

    // Build enemy posture
    if (move.posture > 0) {
      setEnemyPosture(p => Math.min(100, p + move.posture))
    }

    // Move to enemy phase
    setPhase('enemy')
  }

  // ─── ENEMY ACTS (after a short beat) ───────────────────────
  useEffect(() => {
    if (phase !== 'enemy') return

    const t = setTimeout(() => {
      // Check enemy death first
      if (enemyHP <= 0) {
        setPhase('won')
        return
      }

      // Check enemy stagger from posture
      if (enemyPosture >= 100 && !enemyStaggered) {
        setEnemyStaggered(true)
        setEnemyPosture(0)
        addLog('The Remnant breaks — staggered!')
        setPlayerST(5)
        rollIntent()
        setPhase('player')
        return
      }

      // Enemy was staggered last turn — recovers, skips attack
      if (enemyStaggered) {
        setEnemyStaggered(false)
      } else if (playerStaggered) {
        // Player was staggered — enemy lands a free heavy hit
        setPlayerStaggered(false)
        setPlayerHP(hp => Math.max(0, hp - 25))
        addLog('Staggered! The Remnant strikes you unguarded — 25 dmg.')
      } else {
        // Enemy executes its telegraphed intent
        if (intent.type === 'attack') {
          if (enduring) {
            addLog('Kaen absorbs the blow — no damage taken.')
            setEnduring(false)
          } else {
            let incoming = intent.dmg
            setPlayerHP(hp => Math.max(0, hp - incoming))
            // Build player posture
            if (intent.posture > 0) {
              setPlayerPosture(p => {
                const np = Math.min(100, p + intent.posture)
                if (np >= 100) {
                  setPlayerStaggered(true)
                  addLog('Your guard shatters — you are staggered!')
                  return 0
                }
                return np
              })
            }
            if (intent.drainStamina) {
              addLog(`${intent.line} (-${intent.drainStamina} ST next turn)`)
            } else {
              addLog(`${intent.line} — ${incoming} dmg.`)
            }
          }
        } else {
          addLog('The Remnant folds inward, guarding.')
          setPlayerPosture(p => Math.max(0, p - 10))
        }
      }

      // Check player death
      setPlayerHP(curHP => {
        if (curHP <= 0) {
          setPhase('lost')
          return 0
        }
        setPlayerST(5)
        rollIntent()
        setPhase('player')
        return curHP
      })
    }, 900)

    return () => clearTimeout(t)
  }, [phase, enemyHP, enemyPosture, enemyStaggered, playerStaggered, intent, enduring, rollIntent, addLog])

  // ─── VICTORY SCREEN ────────────────────────────────────────
  if (phase === 'won') {
    return (
      <div className="combat-end">
        <img src={kaenVictory} alt="Victory" className="combat-end-art" />
        <div className="combat-end-overlay" />
        <div className="combat-end-content">
          <p className="combat-end-eyebrow">Victory</p>
          <h2 className="combat-end-title">The Remnant Fades</h2>
          <p className="combat-end-lore">
            It dissolves into the water without a sound. Something here is quieter now.
          </p>
          <button className="combat-end-btn" onClick={() => onWin?.(node)}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ─── DEFEAT SCREEN ─────────────────────────────────────────
  if (phase === 'lost') {
    return (
      <div className="combat-end">
        <img src={defeatArt} alt="Defeat" className="combat-end-art combat-end-art--defeat" />
        <div className="combat-end-overlay" />
        <div className="combat-end-content">
          <p className="combat-end-eyebrow combat-end-eyebrow--defeat">Defeated</p>
          <h2 className="combat-end-title">Kaen Falls</h2>
          <p className="combat-end-lore combat-end-lore--defeat">"{defeatLine}"</p>
          <button className="combat-end-btn" onClick={() => onLose?.(node)}>
            Return
          </button>
        </div>
      </div>
    )
  }

  // ─── MAIN COMBAT UI ────────────────────────────────────────
  return (
    <div className="combat" style={{ backgroundImage: `url(${combatBg})` }}>
      <div className="combat-overlay" />

      {/* Side controls — fixed to screen margins */}
      <button className="combat-side-btn combat-flee-corner" onClick={() => onFlee?.()}>
        ⚔ Flee
      </button>

      <div className="combat-side-controls">
        <button className="combat-side-btn" onClick={() => onFlee?.()}>⚙ Settings</button>
        <button className="combat-side-btn" onClick={() => onFlee?.()}>✦ Map</button>
      </div>

      <div className="combat-content">
        {/* Top stat bars */}
        <div className="combat-stats">
          {/* Kaen */}
          <div className="combat-stat-block combat-stat-block--player">
            <div className="combat-char-name">Kaen</div>
            <div className="combat-bar-row">
              <span className="combat-bar-label">HP</span>
              <span className="combat-bar-val">{playerHP} / {playerMaxHP}</span>
            </div>
            <div className="combat-bar"><div className="combat-bar-fill combat-bar-fill--hp" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }} /></div>
            <div className="combat-substat-row">
              <div className="combat-substat">
                <span className="combat-substat-label">Stamina</span>
                <div className="combat-bar combat-bar--seg">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`combat-seg ${i <= playerST ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>
              <div className="combat-substat">
                <span className="combat-substat-label">Posture</span>
                <div className="combat-bar"><div className="combat-bar-fill combat-bar-fill--posture" style={{ width: `${playerPosture}%` }} /></div>
              </div>
            </div>
          </div>

          {/* Remnant */}
          <div className="combat-stat-block combat-stat-block--enemy">
            <div className="combat-char-name combat-char-name--enemy">The Remnant {enemyStaggered && <span className="combat-stagger-tag">STAGGERED</span>}</div>
            <div className="combat-bar-row">
              <span className="combat-bar-label">HP</span>
              <span className="combat-bar-val">{enemyHP} / {enemyMaxHP}</span>
            </div>
            <div className="combat-bar"><div className="combat-bar-fill combat-bar-fill--hp" style={{ width: `${(enemyHP / enemyMaxHP) * 100}%` }} /></div>
            <div className="combat-substat">
              <span className="combat-substat-label">Posture</span>
              <div className="combat-bar"><div className="combat-bar-fill combat-bar-fill--posture" style={{ width: `${enemyPosture}%` }} /></div>
            </div>
          </div>
        </div>

        {/* Enemy intent */}
        {phase === 'player' && !enemyStaggered && (
          <div className="combat-intent">
            <div className="combat-intent-label">
              {intent.type === 'attack' ? '⚔' : '🛡'} Intent — {intent.label}
            </div>
            <div className="combat-intent-line">
              "{intent.line}"{intent.dmg > 0 && ` — ${intent.dmg} dmg`}
            </div>
          </div>
        )}

        {/* Combat log — far left margin */}
        <div className="combat-log">
          {[...log].reverse().map((entry, i, arr) => {
            const fromBottom = arr.length - 1 - i
            return (
              <div key={i} className="combat-log-entry" style={{ opacity: 1 - fromBottom * 0.28 }}>
                {entry}
              </div>
            )
          })}
        </div>

        {/* Moves */}
        <div className="combat-moves-wrap">
          <div className="combat-turn-label">{phase === 'player' ? 'Your Turn' : '...'}</div>
          <div className="combat-moves">
            {KAEN_MOVES.map(move => {
              const affordable = playerST >= move.cost && phase === 'player'
              return (
                <button
                  key={move.name}
                  className={`combat-move ${!affordable ? 'disabled' : ''}`}
                  onClick={() => playerMove(move)}
                  disabled={!affordable}
                >
                  <span className="combat-move-name">{move.name}</span>
                  <span className="combat-move-desc">{move.desc}</span>
                  <span className="combat-move-cost">{move.cost} ST</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}