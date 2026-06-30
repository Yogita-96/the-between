import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import kaenVsRemnantM from '../assets/KaenVsRemnant-M.png'
import kaenVsRemnantF from '../assets/KaenVsRemnant-F.png'
import sableVsRemnantM from '../assets/SableVsRemnant-M.png'
import sableVsRemnantF from '../assets/SableVsRemnant-F.png'
import kaenVictory from '../assets/kaen-victory.png'
import sableVictory from '../assets/sable-victory.png'
import remnantM from '../assets/remnant-m.png'
import remnantF from '../assets/remnant-f.png'
import SettingsModal from '../components/SettingsModal'
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

import { KAEN_BASE_POOL, SABLE_BASE_POOL } from '../data/cards'

// ─── DRAW HAND UTILITY ────────────────────────────────────────
// Uses Fisher-Yates shuffle for unbiased randomness.
// exclude: card names from previous hand — held back for 1 draw cycle.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function drawCards(pool, exclude = []) {
  const preferred = pool.filter(c => !exclude.includes(c.name))
  // Need at least 4 non-excluded cards — otherwise draw from full pool
  const source = preferred.length >= 4 ? preferred : pool
  return shuffle(source).slice(0, 4)
}

export default function CombatScreen({
  character, node, isDualSecond = false, runDeck,
  onWin, onLose, onCombatEndPhaseChange, onMusicVolumeChange,
}) {

  // ─── CHARACTER BRANCH ──────────────────────────────────────
  const isKaen     = character?.id === 'kaen' || character?.name?.toLowerCase() === 'kaen'
  const BASE_POOL  = isKaen ? KAEN_BASE_POOL : SABLE_BASE_POOL
  const MOVES_POOL = useMemo(
    () => runDeck?.length > 0 ? runDeck : BASE_POOL,
    [runDeck, BASE_POOL]
  )
  // Ref so effect closures always see current pool without re-triggering the effect.
  // Updated in an effect (not during render) per React's rules-of-hooks.
  const poolRef = useRef(MOVES_POOL)
  useEffect(() => {
    poolRef.current = MOVES_POOL
  }, [MOVES_POOL])

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
  const [showFleeConfirm, setShowFleeConfirm] = useState(false)
  const [showSettings,    setShowSettings]    = useState(false)

  // ─── ENEMY STATE ───────────────────────────────────────────
  const [enemyHP,       setEnemyHP]       = useState(80)
  const [enemyMaxHP]                      = useState(80)
  const [enemyPosture,  setEnemyPosture]  = useState(0)
  const [enemyStaggered, setEnemyStaggered] = useState(false)

  // ─── CARD DRAW STATE ───────────────────────────────────────
  const [hand,         setHand]         = useState(() => drawCards(MOVES_POOL))
  const [shufflesUsed, setShufflesUsed] = useState(0)
  const [lockedPopup,  setLockedPopup]  = useState(null)
  // Tracks the last drawn hand by name for exclusion on next draw
  const lastHandRef = useRef([])

  // ─── COMBAT STATE ──────────────────────────────────────────
  const [intent,          setIntent]          = useState(REMNANT_INTENTS[0])
  const [phase,           setPhase]           = useState('player')
  const [enduring,        setEnduring]        = useState(false)   // Kaen: Endure active
  const [evading,         setEvading]         = useState(false)   // Sable: Vanish/healevade active
  const [deathMarked,     setDeathMarked]     = useState(false)   // Sable: Death Mark active
  const [tookHitLastTurn, setTookHitLastTurn] = useState(false)   // Kaen: Retaliate trigger
  const [hemorrhageBleed, setHemorrhageBleed] = useState(false)   // Sable: Hemorrhage bleed active
  const [log,       setLog]       = useState([`${charName} enters the Between.`])
  const [defeatLine] = useState(
    () => DEFEAT_LINES.remnant[Math.floor(Math.random() * DEFEAT_LINES.remnant.length)]
  )

  const addLog = useCallback((msg) => {
    setLog(prev => [msg, ...prev].slice(0, 4))
  }, [])

  // Draws a fresh hand excluding lastHandRef, updates both state and ref atomically
  const drawFresh = useCallback(() => {
    const exclude = lastHandRef.current
    const newHand = drawCards(poolRef.current, exclude)
    lastHandRef.current = newHand.map(c => c.name)
    setHand(newHand)
  }, [])

  // ─── SHUFFLE HAND ──────────────────────────────────────────
  const shuffleHand = () => {
    if (shufflesUsed > 0) return
    if (playerST < 2)     return
    setPlayerST(st => st - 2)
    setShufflesUsed(n => n + 1)
    drawFresh()
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

    // Gate: Jugular only works when enemy is staggered
    if (move.special === 'jugular' && !enemyStaggered) {
      addLog('No opening — the enemy must be staggered.')
      return
    }

    // Gate: Slit Throat only works while evading
    if (move.special === 'slitthroat' && !evading) {
      addLog('Must be evading — use Vanish first.')
      return
    }

    let dmg = move.dmg

    // Ruin Strike — scales with missing HP (Kaen)
    if (move.special === 'ruin') {
      const missing = 1 - playerHP / playerMaxHP
      dmg = Math.round(move.dmg * (1 + missing))
    }

    // Twin Fangs — two hits of 12 each (Sable)
    if (move.special === 'twin') {
      dmg = 12 + 12
    }

    // Retaliate (Kaen) — bonus dmg if hit last turn
    if (move.special === 'retaliate' && tookHitLastTurn) {
      dmg += 8
      addLog('Retaliate — hit back harder!')
    }

    // Death Mark (Sable) — consumed on next damaging move
    if (deathMarked && dmg > 0 && move.special !== 'deathmark') {
      dmg += 10
      setDeathMarked(false)
      addLog('Death Mark — target struck!')
    }

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

    // Iron Will (Kaen) — hold ground, posture relief
    if (move.special === 'ironwill') {
      setPlayerPosture(p => Math.max(0, p - 25))
      addLog('Kaen holds his ground.')
    }

    // Retaliate (Kaen) — bonus dmg if hit last turn (tookHitLastTurn state)
    // Base dmg already applied above; bonus handled via tookHitLastTurn flag

    // Feint (Sable) — small hit + own posture relief
    if (move.special === 'feint') {
      setPlayerPosture(p => Math.max(0, p - 20))
    }

    // Ghost Step (Sable) — no damage, posture relief
    if (move.special === 'ghost') {
      setPlayerPosture(p => Math.max(0, p - 15))
      addLog('Sable ghosts through the shadow.')
    }

    // Shadowmeld (Sable) — go still, posture relief
    if (move.special === 'shadowmeld') {
      setPlayerPosture(p => Math.max(0, p - 20))
      addLog('Sable goes completely still.')
    }

    // Backstep (Sable) — cheap reposition, posture relief
    if (move.special === 'backstep') {
      setPlayerPosture(p => Math.max(0, p - 10))
      addLog('Sable steps back.')
    }

    // Death Mark (Sable) — next attack deals +10 dmg
    if (move.special === 'deathmark') {
      setDeathMarked(true)
      addLog('Sable marks her target.')
    }

    // Slit Throat (Sable) — high dmg while evading, consumes evade
    if (move.special === 'slitthroat') {
      setEvading(false) // consumes the evade
      addLog('Sable strikes from the shadow — throat cut.')
    }

    // Jugular (Sable) — massive dmg while enemy staggered
    if (move.special === 'jugular') {
      addLog('Sable finds the opening — jugular struck.')
    }

    // Hemorrhage (Sable) — applies bleed for next turn
    if (move.special === 'hemorrhage') {
      setHemorrhageBleed(true)
      addLog('Sable opens a wound — it will bleed.')
    }

    // Heal cards (Second Wind, Dig In, Fortify, Fade, Still) — restore HP
    if (move.special === 'heal' || move.special === 'healevade') {
      const amt = move.healAmt || 0
      setPlayerHP(hp => Math.min(playerMaxHP, hp + amt))
      if (move.postureRelief) {
        setPlayerPosture(p => Math.max(0, p - move.postureRelief))
      }
      if (move.special === 'healevade') {
        setEvading(true) // Slip Away also evades next hit
      }
      addLog(`${charName} recovers — +${amt} HP.`)
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

      // Hemorrhage bleed — apply 8 dmg to enemy at start of their turn
      if (hemorrhageBleed) {
        setEnemyHP(hp => Math.max(0, hp - 8))
        setHemorrhageBleed(false)
        addLog('The wound bleeds — 8 dmg.')
      }

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
        drawFresh()
        rollIntent()
        setPhase('player')
        return
      }

      // Enemy was staggered — recovers
      if (enemyStaggered) {
        setEnemyStaggered(false)
        setTookHitLastTurn(false)
      } else if (playerStaggered) {
        // Player staggered last turn — enemy lands free heavy hit
        setPlayerStaggered(false)
        setPlayerHP(hp => Math.max(0, hp - 25))
        setTookHitLastTurn(true)
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
            setTookHitLastTurn(false)
          } else {
            // Hit lands
            let incoming = intent.dmg
            setPlayerHP(hp => Math.max(0, hp - incoming))
            setTookHitLastTurn(true)

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
      // Check HP directly to avoid nesting drawFresh inside setPlayerHP updater
      if (playerHP <= 0) {
        setPhase('lost')
      } else {
        setPlayerST(5)
        setShufflesUsed(0)
        setTookHitLastTurn(false)
        drawFresh()
        rollIntent()
        setPhase('player')
      }
    }, 900)

    return () => clearTimeout(t)
  }, [
    phase, enemyHP, enemyPosture, enemyStaggered,
    playerHP, playerStaggered, intent, enduring, evading,
    deathMarked, tookHitLastTurn, hemorrhageBleed,
    rollIntent, addLog, drawFresh,
  ])

  // ─── AUTO-TRIGGER onWin FOR DUAL-REMNANT FIRST PHASE ─────────
  // Can't call onWin during render — use effect instead
  const isDualFirst = node?.floor === 2 && node?.type === 'remnant' && !isDualSecond
  useEffect(() => {
    if (phase === 'won' && isDualFirst) {
      setTimeout(() => onWin?.(node, playerHP), 0)
    }
  }, [phase, isDualFirst]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── NOTIFY PARENT: entering Victory/Defeat screen ───────────
  // Music resumes on these screens, stays silent during active fighting
  useEffect(() => {
    const showingEndScreen = (phase === 'won' && !isDualFirst) || phase === 'lost'
    onCombatEndPhaseChange?.(showingEndScreen)
  }, [phase, isDualFirst]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── VICTORY SCREEN ────────────────────────────────────────
  if (phase === 'won') {
    // Dual-remnant first phase — no victory screen, transition handled by effect above
    if (isDualFirst) return null

    const endTitle = isDualSecond ? (isKaen ? 'The Path Clears' : 'The Dark Yields') : victoryTitle
    const endLore  = isDualSecond
      ? 'Both have faded. Floor Two lies open before you.'
      : victoryLore

    return (
      <div className="combat-end">
        <img src={victoryArt} alt="Victory" className="combat-end-art" />
        <div className="combat-end-overlay" />
        <div className="combat-end-content">
          <p className="combat-end-eyebrow">Victory</p>
          <h2 className="combat-end-title">{endTitle}</h2>
          <p className="combat-end-lore">{endLore}</p>
          <button className="combat-end-btn" onClick={() => onWin?.(node, playerHP)}>
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
      <button className="combat-side-btn combat-flee-corner" onClick={() => setShowFleeConfirm(true)}>
        ⚔ Flee
      </button>
      <button
        className="settings-icon-circular"
        onClick={() => setShowSettings(true)}
        aria-label="Settings"
      >
        ⚙
      </button>

      {/* Flee confirmation */}
      {showFleeConfirm && (
        <div className="combat-confirm-backdrop" onClick={() => setShowFleeConfirm(false)}>
          <div className="combat-confirm-box" onClick={e => e.stopPropagation()}>
            <p className="combat-confirm-text">
              Fleeing counts as a loss. No reward will be given.
            </p>
            <div className="combat-confirm-btns">
              <button className="combat-confirm-cancel" onClick={() => setShowFleeConfirm(false)}>
                Stay and Fight
              </button>
              <button
                className="combat-confirm-flee"
                onClick={() => {
                  setShowFleeConfirm(false)
                  onLose?.(node)
                }}
              >
                Flee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} onMusicVolumeChange={onMusicVolumeChange} />
      )}

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
              const locked =
                (move.special === 'exploit'    && !enemyStaggered) ||
                (move.special === 'jugular'    && !enemyStaggered) ||
                (move.special === 'slitthroat' && !evading)
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
              {lockedPopup === 'Slit Throat'
                ? <>Use <strong>Vanish</strong> first to unlock <strong>Slit Throat</strong></>
                : <>Break the enemy's posture to unlock <strong>{lockedPopup}</strong></>
              }
            </span>
          </div>
        </>,
        document.body
      )}

    </div>
  )
}