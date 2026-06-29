import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import kaenVsRemnantM from '../assets/KaenVsRemnant-M.png'
import kaenVsRemnantF from '../assets/KaenVsRemnant-F.png'
import sableVsRemnantM from '../assets/SableVsRemnant-M.png'
import sableVsRemnantF from '../assets/SableVsRemnant-F.png'
import kaenVictory from '../assets/kaen-victory.png'
import sableVictory from '../assets/sable-victory.png'
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

// ─── ENEMY INTENT POOLS ───────────────────────────────────────
const REMNANT_INTENTS = [
  { type: 'attack', label: 'Reach',  line: "It reaches for you with what's left of its hands.", dmg: 22, posture: 25 },
  { type: 'attack', label: 'Wail',   line: "It opens its mouth and the sound takes something from you.", dmg: 15, drainStamina: 1, posture: 20 },
  { type: 'attack', label: 'Clutch', line: "It seizes you, dragging you toward the dark.", dmg: 18, posture: 30 },
  { type: 'guard',  label: 'Fold',   line: "It folds inward, bracing against what comes.", dmg: 0, posture: 0 },
]

// ─── KAEN'S MOVE POOL (8 cards, draw 4) ──────────────────────
// Tank / endure / posture-break / attrition
const KAEN_MOVES = [
  {
    name: 'Greatsword Strike',
    cost: 3, dmg: 20, posture: 12,
    desc: '20 dmg · posture +12',
  },
  {
    name: 'Shield Bash',
    cost: 2, dmg: 8, posture: 18,
    desc: '8 dmg · posture +18',
  },
  {
    name: 'Endure',
    cost: 1, dmg: 0, posture: 0,
    desc: 'Block incoming · steady posture −30',
    special: 'endure',
  },
  {
    name: 'Ruin Strike',
    cost: 4, dmg: 16, posture: 8,
    desc: 'More dmg at low HP',
    special: 'ruin',
  },
  {
    name: 'Cleave',
    cost: 3, dmg: 14, posture: 10,
    desc: '14 dmg · cuts through guard',
    special: 'cleave',
  },
  {
    name: 'Rally',
    cost: 2, dmg: 0, posture: 0,
    desc: 'Plant and breathe · posture −40',
    special: 'rally',
  },
  {
    name: 'Advance',
    cost: 1, dmg: 6, posture: 8,
    desc: '6 dmg · posture +8 · ST-efficient',
  },
  {
    name: 'Shatter',
    cost: 5, dmg: 10, posture: 35,
    desc: '10 dmg · posture +35 · break focused',
  },
]

// ─── SABLE'S MOVE POOL (8 cards, draw 4) ─────────────────────
// Evade / burst / exploit — glass cannon (65 HP)
const SABLE_MOVES = [
  {
    name: 'Shadow Strike',
    cost: 2, dmg: 18, posture: 6,
    desc: '18 dmg · fast and cheap',
  },
  {
    name: 'Vanish',
    cost: 1, dmg: 0, posture: 0,
    desc: 'Sidestep — nullifies incoming hit',
    special: 'vanish',
  },
  {
    name: 'Exploit',
    cost: 3, dmg: 28, posture: 0,
    desc: '28 dmg · only when enemy staggered',
    special: 'exploit',
  },
  {
    name: 'Bleed Edge',
    cost: 2, dmg: 10, posture: 14,
    desc: '10 dmg · posture +14 · sets up stagger',
  },
  {
    name: 'Feint',
    cost: 1, dmg: 4, posture: 0,
    desc: '4 dmg · own posture −20 · repositions',
    special: 'feint',
  },
  {
    name: 'Twin Fangs',
    cost: 4, dmg: 0, posture: 8,
    desc: '2 × 12 dmg hits · each stagger-checks',
    special: 'twin',
  },
  {
    name: 'Ghost Step',
    cost: 2, dmg: 0, posture: 0,
    desc: 'No dmg · own posture −15',
    special: 'ghost',
  },
  {
    name: 'Rupture',
    cost: 3, dmg: 14, posture: 20,
    desc: '14 dmg · posture +20 · commits to break',
  },
]

// ─── DRAW HAND UTILITY ────────────────────────────────────────
function drawCards(pool) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 4)
}

export default function CombatScreen({ character, node, onWin, onLose, onFlee }) {

  // ─── CHARACTER BRANCH ──────────────────────────────────────
  const isKaen = character?.id === 'kaen' || character?.name?.toLowerCase() === 'kaen'
  const MOVES_POOL   = isKaen ? KAEN_MOVES : SABLE_MOVES
  const charName     = isKaen ? 'Kaen' : 'Sable'
  const defeatTitle  = isKaen ? 'Kaen Falls' : 'Sable Falls'
  const victoryArt   = isKaen ? kaenVictory : sableVictory
  const victoryTitle = isKaen
    ? 'The Remnant Fades'
    : 'It Loses You in the Dark'
  const victoryLore  = isKaen
    ? 'It dissolves into the water without a sound. Something here is quieter now.'
    : 'You were never where it reached. The Remnant grasps at nothing and comes apart.'

  // ─── REMNANT VARIANT ───────────────────────────────────────
  const [remnantVariant] = useState(() => (Math.random() < 0.5 ? 'M' : 'F'))
  const combatBg  = isKaen
    ? (remnantVariant === 'M' ? kaenVsRemnantM : kaenVsRemnantF)
    : (remnantVariant === 'M' ? sableVsRemnantM : sableVsRemnantF)
  const defeatArt = remnantVariant === 'M' ? remnantM : remnantF

  // ─── PLAYER STATE ──────────────────────────────────────────
  const [playerHP,      setPlayerHP]      = useState(character?.stats?.hp || (isKaen ? 100 : 65))
  const [playerMaxHP]                     = useState(character?.stats?.hp || (isKaen ? 100 : 65))
  const [playerST,      setPlayerST]      = useState(5)
  const [playerPosture, setPlayerPosture] = useState(0)
  const [playerStaggered, setPlayerStaggered] = useState(false)

  // ─── ENEMY STATE ───────────────────────────────────────────
  const [enemyHP,       setEnemyHP]       = useState(80)
  const [enemyMaxHP]                      = useState(80)
  const [enemyPosture,  setEnemyPosture]  = useState(0)
  const [enemyStaggered, setEnemyStaggered] = useState(false)

  // ─── CARD DRAW STATE ───────────────────────────────────────
  // Lazy initializer draws first hand without needing an effect
  const [hand,         setHand]         = useState(() => drawCards(MOVES_POOL))
  const [shufflesUsed, setShufflesUsed] = useState(0)
  const [lockedPopup,  setLockedPopup]  = useState(null) // move name showing popup

  // ─── COMBAT STATE ──────────────────────────────────────────
  const [intent,    setIntent]    = useState(REMNANT_INTENTS[0])
  const [phase,     setPhase]     = useState('player')   // 'player' | 'enemy' | 'won' | 'lost'
  const [enduring,  setEnduring]  = useState(false)      // Kaen: Endure active
  const [evading,   setEvading]   = useState(false)      // Sable: Vanish active
  const [log,       setLog]       = useState([`${charName} enters the Between.`])
  const [defeatLine] = useState(
    () => DEFEAT_LINES.remnant[Math.floor(Math.random() * DEFEAT_LINES.remnant.length)]
  )

  const addLog = useCallback((msg) => {
    setLog(prev => [msg, ...prev].slice(0, 4))
  }, [])

  // ─── DRAW A FRESH HAND ─────────────────────────────────────
  const drawHand = useCallback(() => {
    setHand(drawCards(MOVES_POOL))
  }, [MOVES_POOL])

  // ─── SHUFFLE HAND ──────────────────────────────────────────
  const shuffleHand = () => {
    if (shufflesUsed > 0) return
    if (playerST < 2)     return
    setPlayerST(st => st - 2)
    setShufflesUsed(n => n + 1)
    setHand(drawCards(MOVES_POOL))
    addLog(`${charName} resets — hand redrawn.`)
  }

  // Roll a new enemy intent for the upcoming turn
  const rollIntent = useCallback(() => {
    setIntent(REMNANT_INTENTS[Math.floor(Math.random() * REMNANT_INTENTS.length)])
  }, [])

  // ─── PLAYER ACTS ───────────────────────────────────────────
  const playerMove = (move) => {
    if (phase !== 'player') return
    if (playerST < move.cost) {
      addLog('Not enough stamina.')
      return
    }

    // Gate: Exploit only works when enemy is staggered
    if (move.special === 'exploit' && !enemyStaggered) {
      addLog('No opening — the enemy must be staggered.')
      return
    }

    let dmg = move.dmg

    // Ruin Strike — scales with missing HP (Kaen)
    if (move.special === 'ruin') {
      const missing = 1 - playerHP / playerMaxHP
      dmg = Math.round(move.dmg * (1 + missing))
    }

    // Twin Fangs — two hits of 12 each (Sable)
    // dmg is set to 0 in pool; we compute it here so it shows in log
    if (move.special === 'twin') {
      dmg = 12 + 12
    }

    // Cleave — full dmg even through enemy guard (handled by ignoring guard flag)
    // No special calc needed; guard only reduces posture build-up for now

    // Stagger bonus on any damaging move
    if (enemyStaggered && dmg > 0) {
      dmg = Math.round(dmg * 1.5)
      addLog(`Staggered — ${charName} strikes deep!`)
    }

    setPlayerST(st => st - move.cost)

    // ── Specials that affect player state ──

    // Endure (Kaen) — block + steady posture
    if (move.special === 'endure') {
      setEnduring(true)
      setPlayerPosture(p => Math.max(0, p - 30))
      addLog('Kaen braces — posture steadied.')
    }

    // Vanish (Sable) — sidestep, no posture cost
    if (move.special === 'vanish') {
      setEvading(true)
      addLog('Sable steps sideways — gone.')
    }

    // Rally (Kaen) — posture reset, no damage
    if (move.special === 'rally') {
      setPlayerPosture(p => Math.max(0, p - 40))
      addLog('Kaen plants — posture reset.')
    }

    // Feint (Sable) — small hit + own posture relief
    if (move.special === 'feint') {
      setPlayerPosture(p => Math.max(0, p - 20))
    }

    // Ghost Step (Sable) — no damage, posture relief only
    if (move.special === 'ghost') {
      setPlayerPosture(p => Math.max(0, p - 15))
      addLog('Sable ghosts through the shadow.')
    }

    // ── Apply damage to enemy ──
    if (dmg > 0) {
      setEnemyHP(hp => Math.max(0, hp - dmg))
      if (move.special === 'twin') {
        addLog(`Sable uses Twin Fangs — 12 + 12 dmg.`)
      } else {
        addLog(`${charName} uses ${move.name} — ${dmg} dmg.`)
      }
    }

    // ── Build enemy posture ──
    if (move.posture > 0) {
      setEnemyPosture(p => Math.min(100, p + move.posture))
    }

    setPhase('enemy')
  }

  // ─── ENEMY ACTS (after a short beat) ───────────────────────
  useEffect(() => {
    if (phase !== 'enemy') return

    const t = setTimeout(() => {

      // Victory check
      if (enemyHP <= 0) {
        setPhase('won')
        return
      }

      // Enemy posture break → stagger
      if (enemyPosture >= 100 && !enemyStaggered) {
        setEnemyStaggered(true)
        setEnemyPosture(0)
        addLog('The Remnant breaks — staggered!')
        setPlayerST(5)
        setShufflesUsed(0)
        drawHand()
        rollIntent()
        setPhase('player')
        return
      }

      // Enemy was staggered — recovers, skips attack this turn
      if (enemyStaggered) {
        setEnemyStaggered(false)
      } else if (playerStaggered) {
        // Player staggered last turn — enemy lands free heavy hit
        setPlayerStaggered(false)
        setPlayerHP(hp => Math.max(0, hp - 25))
        addLog('Staggered! The Remnant strikes you unguarded — 25 dmg.')
      } else {
        // Enemy executes telegraphed intent
        if (intent.type === 'attack') {
          // Endure (Kaen) or Vanish (Sable) — block/evade the hit
          if (enduring || evading) {
            if (enduring) addLog('Kaen absorbs the blow — no damage taken.')
            if (evading)  addLog('Sable was never there — the blow finds air.')
            setEnduring(false)
            setEvading(false)
          } else {
            // Hit lands
            let incoming = intent.dmg
            setPlayerHP(hp => Math.max(0, hp - incoming))

            // Build player posture (Sable is more fragile — she must evade)
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
              addLog(`${intent.line} (−${intent.drainStamina} ST next turn)`)
            } else {
              addLog(`${intent.line} — ${incoming} dmg.`)
            }
          }
        } else {
          // Enemy guarded — minor player posture relief
          addLog('The Remnant folds inward, guarding.')
          setPlayerPosture(p => Math.max(0, p - 10))
        }
      }

      // Defeat check + new turn setup
      setPlayerHP(curHP => {
        if (curHP <= 0) {
          setPhase('lost')
          return 0
        }
        setPlayerST(5)
        setShufflesUsed(0)
        drawHand()
        rollIntent()
        setPhase('player')
        return curHP
      })
    }, 900)

    return () => clearTimeout(t)
  }, [
    phase, enemyHP, enemyPosture, enemyStaggered,
    playerStaggered, intent, enduring, evading,
    rollIntent, addLog, drawHand,
  ])

  // ─── VICTORY SCREEN ────────────────────────────────────────
  if (phase === 'won') {
    return (
      <div className="combat-end">
        <img src={victoryArt} alt="Victory" className="combat-end-art" />
        <div className="combat-end-overlay" />
        <div className="combat-end-content">
          <p className="combat-end-eyebrow">Victory</p>
          <h2 className="combat-end-title">{victoryTitle}</h2>
          <p className="combat-end-lore">{victoryLore}</p>
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
          <h2 className="combat-end-title">{defeatTitle}</h2>
          <p className="combat-end-lore combat-end-lore--defeat">"{defeatLine}"</p>
          <button className="combat-end-btn" onClick={() => onLose?.(node)}>
            Return
          </button>
        </div>
      </div>
    )
  }

  // ─── SHUFFLE BUTTON STATE ──────────────────────────────────
  const canShuffle = phase === 'player' && shufflesUsed === 0 && playerST >= 2

  // ─── MAIN COMBAT UI ────────────────────────────────────────
  return (
    <div className="combat" style={{ backgroundImage: `url(${combatBg})` }}>
      <div className="combat-overlay" />

      {/* Fixed screen-edge controls */}
      <button className="combat-side-btn combat-flee-corner" onClick={() => onFlee?.()}>
        ⚔ Flee
      </button>
      <div className="combat-side-controls">
        <button className="combat-side-btn" onClick={() => onFlee?.()}>⚙ Settings</button>
        <button className="combat-side-btn" onClick={() => onFlee?.()}>✦ Map</button>
      </div>

      <div className="combat-content">

        {/* ── Stat bars ── */}
        <div className="combat-stats">

          {/* Player */}
          <div className="combat-stat-block combat-stat-block--player">
            <div className="combat-char-name">{charName}</div>
            <div className="combat-bar-row">
              <span className="combat-bar-label">HP</span>
              <span className="combat-bar-val">{playerHP} / {playerMaxHP}</span>
            </div>
            <div className="combat-bar">
              <div
                className="combat-bar-fill combat-bar-fill--hp"
                style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}
              />
            </div>
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
                <div className="combat-bar">
                  <div
                    className="combat-bar-fill combat-bar-fill--posture"
                    style={{ width: `${playerPosture}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enemy */}
          <div className="combat-stat-block combat-stat-block--enemy">
            <div className="combat-char-name combat-char-name--enemy">
              The Remnant {enemyStaggered && <span className="combat-stagger-tag">STAGGERED</span>}
            </div>
            <div className="combat-bar-row">
              <span className="combat-bar-label">HP</span>
              <span className="combat-bar-val">{enemyHP} / {enemyMaxHP}</span>
            </div>
            <div className="combat-bar">
              <div
                className="combat-bar-fill combat-bar-fill--hp"
                style={{ width: `${(enemyHP / enemyMaxHP) * 100}%` }}
              />
            </div>
            <div className="combat-substat">
              <span className="combat-substat-label">Posture</span>
              <div className="combat-bar">
                <div
                  className="combat-bar-fill combat-bar-fill--posture"
                  style={{ width: `${enemyPosture}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Enemy intent ── */}
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

        {/* ── Combat log ── */}
        <div className="combat-log">
          {[...log].reverse().map((entry, i, arr) => {
            const fromBottom = arr.length - 1 - i
            return (
              <div
                key={i}
                className="combat-log-entry"
                style={{ opacity: 1 - fromBottom * 0.28 }}
              >
                {entry}
              </div>
            )
          })}
        </div>

        {/* ── Moves + Shuffle ── */}
        <div className="combat-moves-wrap">
          <div className="combat-turn-label">
            {phase === 'player' ? 'Your Turn' : '...'}
          </div>

          {/* Hand — 4 drawn cards */}
          <div className="combat-moves" onClick={() => setLockedPopup(null)}>
            {hand.map((move) => {
              const notAffordable = playerST < move.cost || phase !== 'player'
              const locked = move.special === 'exploit' && !enemyStaggered
              const disabled = notAffordable || locked
              const showPopup = lockedPopup === move.name
              return (
                <button
                  key={move.name}
                  className={`combat-move ${disabled ? 'disabled' : ''} ${locked ? 'locked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (locked) {
                      setLockedPopup(showPopup ? null : move.name)
                      return
                    }
                    playerMove(move)
                  }}
                  disabled={!locked && disabled}
                >
                  <span className="combat-move-name">{move.name}</span>
                  <span className="combat-move-desc">{move.desc}</span>
                  <span className="combat-move-cost">{move.cost} ST</span>                </button>
              )
            })}
          </div>

          {/* Shuffle button */}
          <div className="combat-shuffle-wrap">
            <button
              className={`combat-shuffle-btn ${!canShuffle ? 'disabled' : ''}`}
              onClick={shuffleHand}
              disabled={!canShuffle}
            >
              ↻ Redraw Hand
              <span className="combat-shuffle-cost">2 ST · once per turn</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── Locked card toast — portaled to body, truly center screen ── */}
      {lockedPopup && createPortal(
        <>
          <div className="combat-toast-backdrop" onClick={() => setLockedPopup(null)} />
          <div className="combat-toast" onClick={() => setLockedPopup(null)}>
            <span className="combat-toast-icon">⚑</span>
            <span className="combat-toast-msg">
              Break the enemy's posture to unlock <strong>{lockedPopup}</strong>
            </span>
          </div>
        </>,
        document.body
      )}

    </div>
  )
}