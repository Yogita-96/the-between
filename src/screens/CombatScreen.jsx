import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import kaenVsRemnantM from '../assets/KaenVsRemnant-M.png'
import kaenVsRemnantF from '../assets/KaenVsRemnant-F.png'
import sableVsRemnantM from '../assets/SableVsRemnant-M.png'
import sableVsRemnantF from '../assets/SableVsRemnant-F.png'
import kaenVsUnfinished from '../assets/KaenVsUnfinished.png'
import sableVsUnfinished from '../assets/SableVsUnfinished.png'
import kaenVsCartographerA from '../assets/KaenVsCartographer-A.png'
import kaenVsCartographerB from '../assets/KaenVsCartographer-B.png'
import sableVsCartographerA from '../assets/SableVsCartographer-A.png'
import sableVsCartographerB from '../assets/SableVsCartographer-B.png'
import kaenVictory from '../assets/kaen-victory.png'
import sableVictory from '../assets/sable-victory.png'
import remnantM from '../assets/remnant-m.png'
import remnantF from '../assets/remnant-f.png'
import theUnfinished from '../assets/the-unfinished.png'
import theCartographer from '../assets/the-cartographer.png'
import SettingsModal from '../components/SettingsModal'
import CombatTutorial from './CombatTutorial'
import { playHitTaken } from '../utils/audio'
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

// ─── SKIP TURN LINES ────────────────────────────────────────
// One line per character. Fires only when hand is fully unplayable.
const SKIP_LINES = {
  kaen:  'Kaen stays his hand. The moment is not his.',
  sable: "Sable's step is off. She lets it go.",
}

// ─── ENEMY INTENT POOLS ───────────────────────────────────────
const REMNANT_INTENTS = [
  { type: 'attack', label: 'Reach',  line: "It reaches for you with what's left of its hands.", dmg: 22, posture: 25 },
  { type: 'attack', label: 'Wail',   line: "It opens its mouth and the sound takes something from you.", dmg: 15, drainStamina: 1, posture: 20 },
  { type: 'attack', label: 'Clutch', line: "It seizes you, dragging you toward the dark.", dmg: 18, posture: 30 },
  { type: 'guard',  label: 'Fold',   line: "It folds inward, bracing against what comes.", dmg: 0, posture: 0 },
]

// The Unfinished — elite, hits harder, more unpredictable, two guard states
const UNFINISHED_INTENTS = [
  { type: 'attack', label: 'Collapse',   line: "It throws its weight forward, stone grinding stone.", dmg: 28, posture: 30 },
  { type: 'attack', label: 'Reach',      line: "The arm extends too far. Wrong geometry. It reaches anyway.", dmg: 20, posture: 20 },
  { type: 'attack', label: 'Eye Flash',  line: "The amber eye pulses. The light takes something from your posture.", dmg: 12, posture: 40 },
  { type: 'attack', label: 'Grind',      line: "It grinds forward, slow and deliberate, impossible to stop.", dmg: 24, posture: 25 },
  { type: 'guard',  label: 'Solidify',   line: "The stone compresses. It is becoming harder to hurt.", dmg: 0, posture: 0 },
  { type: 'guard',  label: 'Reassemble', line: "Pieces of it drift back into place. It is not done yet.", dmg: 0, healSelf: 8, posture: 0 },
]

// The Cartographer — final boss, precise, calculated, punishes patterns
// hidden: true = intent box shows cryptic message instead of real label/dmg
const CARTOGRAPHER_INTENTS = [
  { type: 'attack', label: 'Redraw',      line: "It rewrites the ground beneath you. The floor becomes something else.", dmg: 25, posture: 20 },
  { type: 'attack', label: 'Mark',        line: "A gold line traces your silhouette. Something has been decided about you.", dmg: 18, posture: 35 },
  { type: 'attack', label: 'Pull',        line: "The orb contracts. The space between you collapses.", dmg: 30, posture: 25, hidden: true },
  { type: 'attack', label: 'Geometry',    line: "It draws something in the air. The shape lands on you like a verdict.", dmg: 22, posture: 30, hidden: true },
  { type: 'attack', label: 'Final Entry', line: "It adds you to the map. You feel it happen.", dmg: 35, posture: 20, hidden: true },
  { type: 'guard',  label: 'Survey',      line: "It studies you. Calm. Patient. Already knowing.", dmg: 0, posture: 0 },
  { type: 'guard',  label: 'Reroute',     line: "The ground reshuffles. It has already seen this outcome.", dmg: 0, posture: 0 },
]

// Cartographer PHASE 2 — below 50% HP. Every intent hidden. Harder hits.
const CARTOGRAPHER_PHASE2_INTENTS = [
  { type: 'attack', label: 'Erase',        line: "A section of the world simply stops being there.", dmg: 32, posture: 30, hidden: true },
  { type: 'attack', label: 'Redraw All',   line: "Everything shifts at once. You were standing somewhere else a moment ago.", dmg: 28, posture: 35, hidden: true },
  { type: 'attack', label: 'Closing Line', line: "The final line of the map draws itself toward you.", dmg: 38, posture: 25, hidden: true },
  { type: 'attack', label: 'Compress',     line: "The space you occupy gets smaller. The Between agrees with it.", dmg: 25, posture: 45, hidden: true },
  { type: 'guard',  label: 'Complete',     line: "It holds the finished map close. Nothing you do is unexpected now.", dmg: 0, posture: 0, hidden: true },
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
  const poolRef = useRef(MOVES_POOL)
  useEffect(() => {
    poolRef.current = MOVES_POOL
  }, [MOVES_POOL])

  const charName    = isKaen ? 'Kaen' : 'Sable'
  const defeatTitle = isKaen ? 'Kaen Falls' : 'Sable Falls'
  const victoryArt  = isKaen ? kaenVictory : sableVictory

  // ─── ENEMY TYPE BRANCH ─────────────────────────────────────
  const nodeType = node?.type ?? 'remnant' // 'remnant' | 'elite' | 'boss'

  // Enemy stats per type
  const ENEMY_CONFIG = {
    remnant:     { hp: 80,  maxPosture: 100, name: 'The Remnant',      postureCap: 100 },
    elite:       { hp: 120, maxPosture: 100, name: 'The Unfinished',   postureCap: 100 },
    boss:        { hp: 160, maxPosture: 100, name: 'The Cartographer', postureCap: 100 },
  }
  const enemyConfig = ENEMY_CONFIG[nodeType] ?? ENEMY_CONFIG.remnant

  // Intent pool per type
  const INTENT_POOL = {
    remnant: REMNANT_INTENTS,
    elite:   UNFINISHED_INTENTS,
    boss:    CARTOGRAPHER_INTENTS,
  }
  const intentPool = INTENT_POOL[nodeType] ?? REMNANT_INTENTS

  // Expose (Sable) — temporarily lowers enemy posture threshold for N turns
  const [exposeTurns, setExposeTurns] = useState(0)

  // Boss-tier enemies resist stagger — higher posture threshold.
  // Expose (Sable) temporarily cracks this by 40 while active.
  const baseThreshold = nodeType === 'remnant' ? 100 : 150
  const enemyPostureThreshold = exposeTurns > 0 ? Math.max(60, baseThreshold - 40) : baseThreshold

  // Single variant roll — shared by combat background AND defeat art so the
  // remnant you fight is the remnant shown when you fall (never mismatched)
  const [remnantVariant] = useState(() => (Math.random() < 0.5 ? 'M' : 'F'))

  // Combat background — stable per mount (new key = new attempt = new roll)
  const [combatBg] = useState(() => {
    if (nodeType === 'elite') {
      return isKaen ? kaenVsUnfinished : sableVsUnfinished
    }
    if (nodeType === 'boss') {
      const bgs = isKaen
        ? [kaenVsCartographerA, kaenVsCartographerB]
        : [sableVsCartographerA, sableVsCartographerB]
      return bgs[Math.floor(Math.random() * bgs.length)]
    }
    if (isKaen) return remnantVariant === 'M' ? kaenVsRemnantM : kaenVsRemnantF
    return remnantVariant === 'M' ? sableVsRemnantM : sableVsRemnantF
  })

  // Defeat art — enemy-specific portrait. Remnant matches the current
  // fight's variant (the one still standing when you fall)
  const defeatArt = nodeType === 'elite'
    ? theUnfinished
    : nodeType === 'boss'
      ? theCartographer
      : (remnantVariant === 'M' ? remnantM : remnantF)

  // Victory text per enemy type
  const victoryTitle = useMemo(() => {
    if (nodeType === 'elite') return isKaen ? 'The Stone Breaks' : 'It Never Finishes'
    if (nodeType === 'boss')  return isKaen ? 'The Map Ends Here' : 'The Last Line Undrawn'
    return isKaen ? 'The Remnant Fades' : 'It Loses You in the Dark'
  }, [nodeType, isKaen])

  const victoryLore = useMemo(() => {
    if (nodeType === 'elite') return isKaen
      ? 'The stone collapses into the water. The eye goes dark. It was almost something.'
      : 'It reaches the end of what it could become and stops. You were already somewhere else.'
    if (nodeType === 'boss') return isKaen
      ? 'The map dissolves. The gold lines fade from its skin. The Between has no record of this.'
      : 'The orb goes cold. The cartographer looks at you once, without surprise, and is gone.'
    return isKaen
      ? 'It dissolves into the water without a sound. Something here is quieter now.'
      : 'You were never where it reached. The Remnant grasps at nothing and comes apart.'
  }, [nodeType, isKaen])

  // ─── PLAYER STATE ──────────────────────────────────────────
  const [playerHP,      setPlayerHP]      = useState(character?.stats?.hp || (isKaen ? 100 : 65))
  const [playerMaxHP]                     = useState(
    character?.stats?.maxHP || character?.stats?.hp || (isKaen ? 100 : 65)
  )
  const [playerST,      setPlayerST]      = useState(5)
  const [playerPosture, setPlayerPosture] = useState(0)
  const [playerStaggered, setPlayerStaggered] = useState(false)
  // Ghost Step chain — next damaging card costs 1 less ST
  const [nextAttackDiscount, setNextAttackDiscount] = useState(false)
  // Single source of truth for what a card actually costs right now, including
  // the Ghost Step discount. Every place that checks affordability MUST use
  // this — resolution, the soft-lock check, and the button-disable state — so
  // they can never disagree (that drift was the soft-lock bug).
  const effectiveCostOf = (move) => {
    const isDamagingCard = move.dmg > 0
    return (nextAttackDiscount && isDamagingCard)
      ? Math.max(0, move.cost - 1)
      : move.cost
  }
  // Floating damage/heal numbers on screen
  const [floatingNumbers, setFloatingNumbers] = useState([])
  const [enemyWindingUp, setEnemyWindingUp] = useState(false)
  const [playerHpFlash, setPlayerHpFlash] = useState(false)
  const [enemyHpFlash, setEnemyHpFlash] = useState(false)
  const [lastIntent, setLastIntent] = useState(null)

  // ── STAMINA ECONOMY ──
  // Stamina regenerates partially each turn (not a full reset), so spending
  // on expensive cards or redraws carries a real recovery cost. This forces
  // sequencing decisions — you can't chain big cards every turn.
  const ST_MAX   = 5
  const ST_REGEN = 3
  const [showFleeConfirm, setShowFleeConfirm] = useState(false)
  const [showSettings,    setShowSettings]    = useState(false)
  const [showPostureIntro, setShowPostureIntro] = useState(false)
  // Combat tutorial: auto-opens once on the player's first-ever fight
  // (gated by localStorage), and is reopenable any time via the ? button.
  const [showTutorial, setShowTutorial] = useState(
    () => !localStorage.getItem('seenCombatTutorial')
  )
  const closeTutorial = () => {
    localStorage.setItem('seenCombatTutorial', 'true')
    setShowTutorial(false)
  }
  const openTutorial = () => setShowTutorial(true)

  // ─── ENEMY STATE ───────────────────────────────────────────
  const [enemyHP,        setEnemyHP]        = useState(enemyConfig.hp)
  const [enemyMaxHP]                        = useState(enemyConfig.hp)
  const [enemyPosture,   setEnemyPosture]   = useState(0)
  const [enemyStaggered, setEnemyStaggered] = useState(false)

  // ─── CARD DRAW STATE ───────────────────────────────────────
  const [hand,         setHand]         = useState(() => drawCards(MOVES_POOL))
  const [shufflesUsed, setShufflesUsed] = useState(0)
  const [lockedPopup,  setLockedPopup]  = useState(null)
  // Tracks the last drawn hand by name for exclusion on next draw
  const lastHandRef = useRef([])

  // ─── COMBAT STATE ──────────────────────────────────────────
  const [intent,          setIntent]          = useState(() => intentPool[0])
  const [phase,           setPhase]           = useState('player')
  const [enduring,        setEnduring]        = useState(false)
  const [evading,         setEvading]         = useState(false)
  const [deathMarkStacks, setDeathMarkStacks] = useState(0) // each stack = +12 dmg on next attack, all consumed at once
  const [tookHitLastTurn, setTookHitLastTurn] = useState(false)
  const [hemorrhageBleed, setHemorrhageBleed] = useState(false)
  const [backstepping,    setBackstepping]    = useState(false) // Sable: −8 dmg from next hit
  const [log,       setLog]       = useState([`${charName} enters the Between.`])
  const [defeatLine] = useState(() => {
    const lines = DEFEAT_LINES[nodeType] ?? DEFEAT_LINES.remnant
    return lines[Math.floor(Math.random() * lines.length)]
  })

  const addLog = useCallback((msg) => {
    setLog(prev => [msg, ...prev].slice(0, 4))
  }, [])

  // Push a floating number that fades out over 1.5s
  const spawnFloatingNumber = (value, target, kind) => {
    const id = ++floatingIdRef.current
    setFloatingNumbers(prev => [...prev, { id, value, target, kind }])
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(n => n.id !== id))
    }, 1500)
  }

  // Draws a fresh hand excluding lastHandRef, updates both state and ref atomically
  const drawFresh = useCallback(() => {
    const exclude = lastHandRef.current
    let newHand = drawCards(poolRef.current, exclude)

    // ── SABLE STAGGER-WINDOW GUARANTEE ──
    // When the enemy is close to staggering (posture > 65% of threshold),
    // ensure Sable's hand contains at least one posture-building card so
    // the window is always reachable — never a dead hand at the key moment.
    // Not spammable: only kicks in when a stagger is genuinely close.
    if (!isKaenRef.current) {
      const threshold = postureThresholdRef.current
      const nearStagger = enemyPostureRef.current > threshold * 0.65
      const hasPostureCard = newHand.some(c => c.posture >= 14)
      if (nearStagger && !hasPostureCard) {
        const postureCard = poolRef.current.find(
          c => c.posture >= 14 && !exclude.includes(c.name)
        )
        if (postureCard) {
          // Swap the lowest-value card for a posture card
          newHand = [postureCard, ...newHand.slice(1)]
        }
      }
    }

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

  // Ref so rollIntent always sees current intent pool without re-creating the callback
  const intentPoolRef = useRef(intentPool)

  // One-time announcement flags for boss phase transitions
  const bossPhase2 = useRef(false)              // Cartographer: map closes at 50%
  const postureResistAnnounced = useRef(false)  // Unfinished: stone compresses at 50%

  // Guards the enemy-turn effect against re-entry (deps change mid-processing)
  const enemyTurnProcessing = useRef(false)

 // Refs for the stagger-window draw guarantee (read inside drawFresh callback)
  const nextTurnStaminaPenaltyRef = useRef(0)
  const isKaenRef = useRef(isKaen)
  const enemyPostureRef = useRef(0)
  const postureThresholdRef = useRef(enemyPostureThreshold)

  // Counter for unique floating-number IDs (avoids Math.random impurity warning)
  const floatingIdRef = useRef(0)

  // Keep stagger-window refs current for the drawFresh callback
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    isKaenRef.current = isKaen
    enemyPostureRef.current = enemyPosture
    postureThresholdRef.current = enemyPostureThreshold
  }, [isKaen, enemyPosture, enemyPostureThreshold])
  /* eslint-enable react-hooks/immutability */

  // Roll a new enemy intent for the upcoming turn
  const rollIntent = useCallback(() => {
    const pool = intentPoolRef.current
    setIntent(pool[Math.floor(Math.random() * pool.length)])
  }, [])

useEffect(() => {
    if (playerPosture > 50 && !localStorage.getItem('seenPostureIntro')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPostureIntro(true)
      localStorage.setItem('seenPostureIntro', 'true')
    }
  }, [playerPosture])

  // ─── PLAYER ACTS ───────────────────────────────────────────
  const playerMove = (move) => {
    if (phase !== 'player') return

    // Ghost Step discount handled by the shared effectiveCostOf helper
    const isDamagingCard = move.dmg > 0
    const effectiveCost = effectiveCostOf(move)

    if (playerST < effectiveCost) {
      addLog('Not enough stamina.')
      return
    }

    // Exploit is always playable now (full dmg staggered, reduced otherwise)
    // — no gate. Handled in damage calc below.

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

    // Exploit — base damage set here (BEFORE Death Mark / stagger) so those
    // bonuses stack on top instead of being overwritten. Full 28 when the
    // enemy is staggered, reduced 14 otherwise. Never a dead card, but
    // massively rewards setting up the stagger first.
    if (move.special === 'exploit') {
      dmg = enemyStaggered ? 28 : 14
      addLog(
        enemyStaggered
          ? 'Sable exploits the opening — full force.'
          : 'Sable strikes, but the guard holds.'
      )
    }

    // ── KAEN RESOLVE ──
    // Kaen's basic attacks scale with his OWN posture. The more pressure
    // he's under, the harder he hits — but high posture = one hit from
    // being staggered himself. Sekiro-style risk/reward edge-riding.
    // Applies only to Kaen's plain damage cards (not specials/heals).
    if (isKaen && dmg > 0 && !move.special) {
      const resolveBonus = Math.floor((playerPosture / 100) * 12) // up to +12 at max posture
      if (resolveBonus > 0) {
        dmg += resolveBonus
        addLog(`Resolve — Kaen strikes with the weight of pressure (+${resolveBonus}).`)
      }
    }

    // Retaliate (Kaen) — bonus dmg if hit last turn
    if (move.special === 'retaliate' && tookHitLastTurn) {
      dmg += 8
      addLog('Retaliate — hit back harder!')
    }

    // ── DEATH MARK (Sable) — stacks, consumed all at once on next attack ──
    // Each stack adds +12 dmg. Multiple casts accumulate, then the whole
    // stack is spent on the next damaging move — stacks with the stagger
    // bonus and Exploit so a marked Exploit hits like a truck.
    if (deathMarkStacks > 0 && dmg > 0 && move.special !== 'deathmark') {
      const markBonus = deathMarkStacks * 12
      dmg += markBonus
      setDeathMarkStacks(0)
      addLog(
        deathMarkStacks > 1
          ? `Death Mark ×${deathMarkStacks} — target struck for +${markBonus}!`
          : 'Death Mark — target struck!'
      )
    }

    // Stagger bonus on any damaging move
    if (enemyStaggered && dmg > 0 && move.special !== 'exploit') {
      dmg = Math.round(dmg * 1.5)
      addLog(`Staggered — ${charName} strikes deep!`)
    }

    setPlayerST(st => st - effectiveCost)

    // Consume Ghost Step discount if it applied to this card
    if (nextAttackDiscount && isDamagingCard) {
      setNextAttackDiscount(false)
      addLog('— Ghost Step chain.')
    }

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

    // Ghost Step (Sable) — posture recovery + chain enabler
    if (move.special === 'ghost') {
      setPlayerPosture(p => Math.max(0, p - 15))
      setNextAttackDiscount(true)
      addLog('Sable moves like she is already gone.')
    }

    // Shadowmeld (Sable) — go still, posture relief
    if (move.special === 'shadowmeld') {
      setPlayerPosture(p => Math.max(0, p - 20))
      addLog('Sable goes completely still.')
    }

    // Backstep (Sable) — cheap reposition, posture relief
    if (move.special === 'backstep') {
      setPlayerPosture(p => Math.max(0, p - 10))
      setBackstepping(true)
      addLog('Sable steps back, bracing for the blow.')
    }

    // Expose (Sable) — cracks enemy guard, lowers stagger threshold 2 turns
    if (move.special === 'expose') {
      setExposeTurns(2)
      addLog('Sable finds the seam in its defense — the guard cracks.')
    }

    // Death Mark (Sable) — adds a +12 stack to the next attack (stacks)
    if (move.special === 'deathmark') {
      setDeathMarkStacks(s => s + 1)
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
      spawnFloatingNumber(dmg, 'enemy', 'damage')
      setEnemyHpFlash(true)
      setTimeout(() => setEnemyHpFlash(false), 600)
      if (move.special === 'twin') {
        addLog(`Sable uses Twin Fangs — 12 + 12 dmg.`)
      } else {
        addLog(`${charName} uses ${move.name} — ${dmg} dmg.`)
      }
    }

    // ── Build enemy posture ──
    if (move.posture > 0) {
      // The Unfinished below 50% HP: stone compresses — posture damage halved
      const unfinishedResist = nodeType === 'elite' && enemyHP <= enemyMaxHP / 2
      const postureGain = unfinishedResist ? Math.floor(move.posture / 2) : move.posture
      if (unfinishedResist && !postureResistAnnounced.current) {
        addLog('The stone has compressed. Your strikes barely shake it now.')
        postureResistAnnounced.current = true
      }
      setEnemyPosture(p => Math.min(enemyPostureThreshold, p + postureGain))
    }

    setPhase('enemy')
  }

  // ─── PLAYER SKIPS TURN ─────────────────────────────────────
  // Only fires when hand is fully unplayable. Character-specific cost:
  // Kaen (tank) — bigger stagger, smaller stamina hit.
  // Sable (finesse) — smaller stagger, bigger stamina hit.
  // Enemy still executes their intent normally on their turn.
  const playerSkipTurn = () => {
    if (!canSkipTurn) return

    const posturePenalty = isKaen ? 20 : 10
    const staminaPenalty = isKaen ? 2  : 3

    addLog(SKIP_LINES[isKaen ? 'kaen' : 'sable'])

    // Player posture takes stagger damage
    setPlayerPosture(p => {
      const np = Math.min(100, p + posturePenalty)
      if (np >= 100) {
        setPlayerStaggered(true)
        addLog('Your guard shatters — you are staggered!')
        return 0
      }
      return np
    })

    // Stamina penalty applied at start of next turn (during enemy turn cleanup)
    nextTurnStaminaPenaltyRef.current = staminaPenalty

    // Hand over to enemy — they'll execute intent as normal
    setPhase('enemy')
  }

  
// ─── ENEMY ACTS (multi-phase for readability) ───────────────
  // Phase timing:
  //   0ms:      Turn label switches to "Enemy Turn", cards fade
  //   500ms:    Intent box pulses (enemy is winding up)
  //   1400ms:   Attack lands — damage applies, floater spawns, HP bar shakes
  //   2400ms:   Cleanup, new hand, back to player turn
  useEffect(() => {
    if (phase !== 'enemy') return
    if (enemyTurnProcessing.current) return
    enemyTurnProcessing.current = true

    // Beat 1 — brief pause so player registers the phase change
    const t1 = setTimeout(() => {
      setEnemyWindingUp(true)
    }, 700)

    // Beat 2 — the attack lands
    const t2 = setTimeout(() => {
      setEnemyWindingUp(false)

      // Hemorrhage bleed
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

      // Cartographer phase 2
      if (nodeType === 'boss' && enemyHP <= enemyMaxHP / 2 && !bossPhase2.current) {
        bossPhase2.current = true
        intentPoolRef.current = CARTOGRAPHER_PHASE2_INTENTS
        addLog('The Cartographer closes the map. It no longer needs to watch you.')
      }

      // Enemy posture break → stagger
      if (enemyPosture >= enemyPostureThreshold && !enemyStaggered) {
        setEnemyStaggered(true)
        setEnemyPosture(0)
        addLog(`${enemyConfig.name} breaks — staggered!`)
        setPlayerST(ST_MAX)
        setShufflesUsed(0)
        drawFresh()
        rollIntent()
        enemyTurnProcessing.current = false
        setPhase('player')
        return
      }

      let damageThisTurn = 0

      if (enemyStaggered) {
        setEnemyStaggered(false)
        setTookHitLastTurn(false)
      } else if (playerStaggered) {
        setPlayerStaggered(false)
        damageThisTurn = 25
        setTookHitLastTurn(true)
        addLog(`Staggered! ${enemyConfig.name} strikes you unguarded — 25 dmg.`)
      } else {
          // Save the intent that's about to execute so we can display it after
        setLastIntent(intent)

        if (intent.type === 'attack') {
          if (enduring || evading) {
            if (enduring) addLog('Kaen absorbs the blow — no damage taken.')
            if (evading)  addLog('Sable was never there — the blow finds air.')
            setEnduring(false)
            setEvading(false)
            setBackstepping(false)
            setTookHitLastTurn(false)
          } else {
            let incoming = intent.dmg
            if (backstepping) {
              incoming = Math.max(0, incoming - 8)
              setBackstepping(false)
              addLog(`Sable's reposition absorbs part of the blow (−8).`)
            }
            damageThisTurn = incoming
            setTookHitLastTurn(true)

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
          if (intent.healSelf) {
            setEnemyHP(hp => Math.min(enemyMaxHP, hp + intent.healSelf))
            addLog(`${intent.line} (${intent.healSelf} HP restored)`)
          } else {
            addLog(`${intent.line}`)
          }
          setPlayerPosture(p => Math.max(0, p - 10))
        }
      }

      // Apply damage and spawn floater
      const resultingHP = Math.max(0, playerHP - damageThisTurn)
      setPlayerHP(resultingHP)
      if (damageThisTurn > 0) {
        playHitTaken()
        spawnFloatingNumber(damageThisTurn, 'player', 'damage')
        setPlayerHpFlash(true)
        setTimeout(() => setPlayerHpFlash(false), 600)
      }

      // Beat 3 — cleanup after the hit lands
      setTimeout(() => {
        enemyTurnProcessing.current = false

        if (resultingHP <= 0) {
          setPhase('lost')
        } else {
          const penalty = nextTurnStaminaPenaltyRef.current
          setPlayerST(st => {
            const regenerated = Math.min(ST_MAX, st + ST_REGEN)
            return Math.max(0, regenerated - penalty)
          })
          if (penalty > 0) {
            addLog(`${charName} moves stiffly — stamina falters (−${penalty} ST).`)
            nextTurnStaminaPenaltyRef.current = 0
          }
          setShufflesUsed(0)
          setTookHitLastTurn(false)
          if (exposeTurns > 0) {
            setExposeTurns(t => {
              const next = t - 1
              if (next === 0) addLog('The guard reforms. The opening is gone.')
              return next
            })
          }
          drawFresh()
          rollIntent()
          setPhase('player')
        }
      }, 1400)
    }, 1800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [
    phase, enemyHP, enemyPosture, enemyStaggered,
    playerHP, playerStaggered, intent, enduring, evading,
    tookHitLastTurn, hemorrhageBleed, backstepping,
    rollIntent, addLog, drawFresh,
    enemyConfig.name, enemyMaxHP, nodeType, enemyPostureThreshold, exposeTurns, charName,
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
        <img
          src={nodeType === 'remnant' ? victoryArt : combatBg}
          alt="Victory"
          className="combat-end-art"
        />
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
        <img
          src={defeatArt}
          alt="Defeat"
          className="combat-end-art combat-end-art--defeat"
        />
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

  // ─── SKIP TURN STATE ───────────────────────────────────────
  // Only available when no card in hand is playable (unaffordable AND ungated).
  // Escape hatch for soft-lock — costs posture + stamina, still eats intent.
  const canPlayAnyCard = phase === 'player' && hand.some(move => {
    if (playerST < effectiveCostOf(move)) return false
    if (move.special === 'jugular'    && !enemyStaggered) return false
    if (move.special === 'slitthroat' && !evading)        return false
    return true
  })
  const canSkipTurn = phase === 'player' && !canPlayAnyCard

  // ─── MAIN COMBAT UI ────────────────────────────────────────
  return (
    <div className="combat" style={{ backgroundImage: `url(${combatBg})` }}>
      <div className="combat-overlay" />

      {/* Fixed screen-edge controls */}
      {/* Fixed screen-edge controls */}
      {/* Screen-edge controls — Flee/Skip switch to center when soft-locked */}
      {canSkipTurn ? (
        <>
          <button
            className="combat-side-btn--centered combat-flee--centered"
            onClick={() => setShowFleeConfirm(true)}
            title="Abandon this run entirely. No reward."
          >
            ⚔ Flee
          </button>
          <button
            className="combat-side-btn--centered combat-skip--centered"
            onClick={playerSkipTurn}
            title={`Skip turn — you'll take the enemy's hit, ${isKaen ? 'lose 20 posture, and start next turn with 2 less stamina.' : 'lose 10 posture, and start next turn with 3 less stamina.'}`}
          >
            ⏭ Skip Turn
          </button>
        </>
      ) : (
        <button className="combat-side-btn combat-flee-corner" onClick={() => setShowFleeConfirm(true)}>
          ⚔ Flee
        </button>
      )}
      <button
        className="combat-help-icon-circular"
        onClick={openTutorial}
        aria-label="How to play"
      >
        ?
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

      {/* Posture Pressure tutorial — one-time contextual hint */}
      {showPostureIntro && (
        <div className="combat-confirm-backdrop" onClick={() => setShowPostureIntro(false)}>
          <div className="combat-confirm-box combat-posture-intro" onClick={e => e.stopPropagation()}>
            <div className="combat-posture-intro-title">Posture Pressure</div>
            <p className="combat-posture-intro-text">
              Your posture builds as the enemy pressures you. At <strong>100</strong>, your guard shatters — the next hit lands unguarded for <strong>25 dmg</strong>.
            </p>
            <p className="combat-posture-intro-text">
              Cards like {isKaen ? <><em>Rally</em>, <em>Endure</em>, and <em>Iron Will</em></> : <><em>Shadowmeld</em>, <em>Backstep</em>, and <em>Ghost Step</em></>} recover posture. Watch your bar.
            </p>
          <button className="combat-confirm-cancel" onClick={() => setShowPostureIntro(false)}>
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Combat tutorial — spotlight walkthrough, auto once + ? to replay */}
      {showTutorial && <CombatTutorial onClose={closeTutorial} />}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} onMusicVolumeChange={onMusicVolumeChange} />
      )}

      <div className="combat-content">

        {/* Floating damage/heal numbers */}
        <div className="combat-floaters">
          {floatingNumbers.map(fn => (
            <div
              key={fn.id}
              className={`combat-floater combat-floater--${fn.target} combat-floater--${fn.kind}`}
            >
              −{fn.value}
            </div>
          ))}
        </div>

        {/* ── Stat bars ── */}
        <div className="combat-stats">

          {/* Player */}
          <div className="combat-stat-block combat-stat-block--player">
            <div className="combat-char-name">{charName}</div>
            <div className="combat-bar-row">
              <span className="combat-bar-label">HP</span>
              <span className="combat-bar-val">{playerHP} / {playerMaxHP}</span>
            </div>
            <div className={`combat-bar ${playerHpFlash ? 'combat-bar--flash' : ''}`}>
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
              {enemyConfig.name} {enemyStaggered && <span className="combat-stagger-tag">STAGGERED</span>}
            </div>
            <div className="combat-bar-row">
              <span className="combat-bar-label">HP</span>
              <span className="combat-bar-val">{enemyHP} / {enemyMaxHP}</span>
            </div>
            <div className={`combat-bar ${enemyHpFlash ? 'combat-bar--flash' : ''}`}>
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
                  style={{ width: `${(enemyPosture / enemyPostureThreshold) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Enemy intent / last action ── */}
        {!enemyStaggered && (
          playerStaggered && phase === 'player' ? (
            <div className="combat-intent combat-intent--danger">
              <div className="combat-intent-label">⚠ You Are Staggered</div>
              <div className="combat-intent-line combat-intent-line--danger">
                "Open. Undefended. The next blow lands unguarded — 25 dmg."
              </div>
            </div>
          ) : phase === 'player' ? (
            // Player turn — show upcoming intent
            <div className={`combat-intent ${intent.hidden ? 'combat-intent--hidden' : ''}`}>
              {intent.hidden ? (
                <>
                  <div className="combat-intent-label">✦ Intent — Unknown</div>
                  <div className="combat-intent-line combat-intent-line--hidden">
                    "It has already decided."
                  </div>
                </>
              ) : (
                <>
                  <div className="combat-intent-label">
                    {intent.type === 'attack' ? '⚔' : '🛡'} Intent — {intent.label}
                  </div>
                  <div className="combat-intent-line">
                    "{intent.line}"{intent.dmg > 0 && ` — ${intent.dmg} dmg`}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Enemy turn — show winding intent, then last action
            <div className={`combat-intent ${enemyWindingUp ? 'combat-intent--winding' : 'combat-intent--past'}`}>
              {enemyWindingUp ? (
                intent.hidden ? (
                  <>
                    <div className="combat-intent-label">✦ Intent — Unknown</div>
                    <div className="combat-intent-line combat-intent-line--hidden">
                      "It has already decided."
                    </div>
                  </>
                ) : (
                  <>
                    <div className="combat-intent-label">
                      {intent.type === 'attack' ? '⚔' : '🛡'} Intent — {intent.label}
                    </div>
                    <div className="combat-intent-line">
                      "{intent.line}"{intent.dmg > 0 && ` — ${intent.dmg} dmg`}
                    </div>
                  </>
                )
              ) : lastIntent ? (
                <>
                  <div className="combat-intent-label">
                    {lastIntent.type === 'attack' ? '⚔' : '🛡'} Attacked — {lastIntent.label}
                  </div>
                  <div className="combat-intent-line">
                    "{lastIntent.line}"{lastIntent.dmg > 0 && ` — ${lastIntent.dmg} dmg`}
                  </div>
                </>
              ) : null}
            </div>
          )
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
          <div className={`combat-turn-label ${phase === 'enemy' ? 'combat-turn-label--enemy' : ''}`}>
            {phase === 'player' ? 'Your Turn' : 'Enemy Turn'}
          </div>

          {/* Hand — 4 drawn cards */}
          <div className="combat-moves" onClick={() => setLockedPopup(null)}>
            {hand.map((move) => {
              const notAffordable = playerST < effectiveCostOf(move) || phase !== 'player'
              const locked =
                (move.special === 'jugular'    && !enemyStaggered) ||
                (move.special === 'slitthroat' && !evading)
              const disabled = notAffordable || locked
              const showPopup = lockedPopup === move.name
              return (
                <button
                  key={move.name}
                  className={`combat-move ${disabled ? 'disabled' : ''} ${locked ? 'locked' : ''} ${phase === 'enemy' ? 'combat-move--enemy-turn' : ''}`}
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
              className={`combat-shuffle-btn ${!canShuffle ? 'disabled' : ''} ${phase === 'enemy' ? 'combat-shuffle-btn--enemy-turn' : ''}`}
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