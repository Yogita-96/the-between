import { useState } from 'react'
import TitleScreen from './screens/TitleScreen'
import CharSelectScreen from './screens/CharSelectScreen'
import MapScreen from './screens/MapScreen'
import CombatScreen from './screens/CombatScreen'
import RewardScreen from './screens/RewardScreen'
import { KAEN_BASE_POOL, SABLE_BASE_POOL } from './data/cards'
import './index.css'

// ─── SECOND REMNANT TRANSITION LINES ─────────────────────────
const SECOND_REMNANT_LINES = [
  "The water stirs. Something else was waiting.",
  "It doesn't end here. It never does.",
  "Another steps forward. The Between has more than one memory of you.",
  "You weren't the only one watching.",
  "The first was just to see if you'd stay.",
]

// Node reference for reset filters — mirrors MAP_NODES in MapScreen
const MAP_NODES_REF = [
  { id: 1, floor: 1 }, { id: 2, floor: 1 },
  { id: 3, floor: 2 }, { id: 4, floor: 2 },
  { id: 5, floor: 3 },
]

function App() {
  const [screen,          setScreen]          = useState('title')
  const [selectedChar,    setSelectedChar]    = useState(null)
  const [completedNodes,  setCompletedNodes]  = useState([])
  const [failedNodes,     setFailedNodes]     = useState([]) // nodes lost on at least once
  const [currentNode,     setCurrentNode]     = useState(null)
  const [runDeck,         setRunDeck]         = useState([])  // grows with rewards during run
  const [runHP,           setRunHP]           = useState(null) // HP carried between dual-remnant phases
  const [runMaxHP,        setRunMaxHP]        = useState(null) // max HP boosted by stat rewards
  const [dualPhase,       setDualPhase]       = useState('first') // 'first' | 'second'
  const [transitionMsg,   setTransitionMsg]   = useState('')
  const [pendingReward,   setPendingReward]   = useState(null) // { floor, isElite } passed to RewardScreen

  // ─── RESET HELPERS ───────────────────────────────────────────

  const fullReset = () => {
    setCompletedNodes([])
    setFailedNodes([])
    setCurrentNode(null)
    setRunHP(null)
    setRunMaxHP(null)
    setRunDeck([])
    setDualPhase('first')
    setScreen('charselect')
  }

  const floor2Reset = () => {
    // Keep Floor 1 progress, wipe Floor 2
    setCompletedNodes(prev => prev.filter(id => {
      const node = MAP_NODES_REF.find(n => n.id === id)
      return node && node.floor === 1
    }))
    setFailedNodes(prev => prev.filter(id => {
      const node = MAP_NODES_REF.find(n => n.id === id)
      return node && node.floor === 1
    }))
    setCurrentNode(null)
    setRunHP(null)
    setDualPhase('first')
    setScreen('map')
  }

  // ─── ENTER COMBAT ────────────────────────────────────────────
  const handleEnterCombat = (node) => {
    setCurrentNode(node)
    setDualPhase('first')
    setScreen('combat')
  }

  // ─── WIN HANDLER ─────────────────────────────────────────────
  const handleWin = (node, survivingHP) => {
    // Floor 2 dual-remnant phase 1 → trigger second fight
    if (node.floor === 2 && node.type === 'remnant' && dualPhase === 'first') {
      setRunHP(survivingHP) // carry HP into second fight
      const line = SECOND_REMNANT_LINES[
        Math.floor(Math.random() * SECOND_REMNANT_LINES.length)
      ]
      setTransitionMsg(line)
      setDualPhase('second')
      setScreen('transition')
      setTimeout(() => setScreen('combat'), 2800)
      return
    }

    // Mark node complete
    setCompletedNodes(prev => [...prev, node.id])
    setRunHP(null)
    setDualPhase('first')

    // ── Reward gating ──
    // Floor 1: reward only if never failed this node (true first clear)
    const isFirstClear = !failedNodes.includes(node.id)

    const givesReward =
      (node.floor === 1 && isFirstClear) ||  // Floor 1 first clear only
      node.floor === 2 ||                      // Floor 2 always (including retries)
      node.floor === 3                         // Cartographer

    if (givesReward && node.floor !== 3) {
      // Show reward screen before returning to map
      setPendingReward({
        floor: node.floor,
        isElite: node.type === 'elite',
      })
      setScreen('reward')
    } else if (node.floor === 3) {
      // Run complete — could show a special screen here later
      setScreen('map')
    } else {
      setScreen('map')
    }
  }

  // ─── LOSE HANDLER ────────────────────────────────────────────
  const handleLose = (node) => {
    if (node?.type === 'boss') {
      fullReset()
      return
    }
    if (node?.type === 'elite' || (node?.floor === 2 && node?.type === 'remnant')) {
      floor2Reset()
      return
    }
    // Floor 1 loss — mark as failed, retry available, HP resets
    if (node?.id) setFailedNodes(prev => [...prev, node.id])
    setRunHP(null)
    setDualPhase('first')
    setScreen('map')
  }

  // ─── REWARD CHOSEN ───────────────────────────────────────────
  const handleRewardChosen = (reward) => {
    if (reward) {
      if (reward.type === 'card') {
        // Add new card to run deck
        setRunDeck(prev => [...prev, reward.card])
      } else if (reward.type === 'upgrade') {
        // Apply upgrade — card may be in base pool or runDeck
        // Store upgraded version in runDeck so it overrides base pool in activeDeck
        const isKaenChar = selectedChar?.id === 'kaen' || selectedChar?.name?.toLowerCase() === 'kaen'
        const currentBase = isKaenChar ? KAEN_BASE_POOL : SABLE_BASE_POOL
        const targetInBase = currentBase.find(c => c.name === reward.upgrade.targets)
        const targetInRun  = runDeck.find(c => c.name === reward.upgrade.targets)
        const target = targetInRun || targetInBase
        if (target) {
          const upgraded = {
            ...target,
            [reward.upgrade.stat]: target[reward.upgrade.stat] + reward.upgrade.by,
            desc: `${target.desc} ✦`,
          }
          if (targetInRun) {
            // Already in runDeck — update it
            setRunDeck(prev => prev.map(c => c.name === reward.upgrade.targets ? upgraded : c))
          } else {
            // In base pool — add upgraded version to runDeck
            // activeDeck spreads runDeck after basePool, so upgraded version takes precedence
            setRunDeck(prev => [...prev, upgraded])
          }
        }
      } else if (reward.type === 'boost') {
        if (reward.boost.type === 'maxHP') {
          setRunMaxHP(prev => (prev ?? (selectedChar?.stats?.hp || 100)) + reward.boost.amt)
        }
        // maxST boost — pass through runMaxST if we add that later
      }
    }
    // Skip or after applying — go to map
    setPendingReward(null)
    setScreen('map')
  }

  // ─── CHARACTER WITH PERSISTED HP + DECK ──────────────────────
  const isKaen = selectedChar?.id === 'kaen' || selectedChar?.name?.toLowerCase() === 'kaen'
  const basePool = isKaen ? KAEN_BASE_POOL : SABLE_BASE_POOL
  // activeDeck = base pool + reward cards, with runDeck cards overriding base pool duplicates
  const runDeckNames = new Set(runDeck.map(c => c.name))
  const activeDeck = [
    ...basePool.filter(c => !runDeckNames.has(c.name)), // base cards not overridden
    ...runDeck,                                           // reward cards + upgraded base cards
  ]

  const charWithHP = selectedChar ? {
    ...selectedChar,
    stats: {
      ...selectedChar.stats,
      hp: runHP ?? runMaxHP ?? selectedChar.stats?.hp,
      maxHP: runMaxHP ?? selectedChar.stats?.hp,
    }
  } : null

  return (
    <div className="app">
      {screen === 'title' && (
        <TitleScreen onBegin={() => setScreen('charselect')} />
      )}

      {screen === 'charselect' && (
        <CharSelectScreen
          onSelect={(char) => {
            setSelectedChar(char)
            setRunHP(null)
            setRunMaxHP(null)
            setRunDeck([])
            setCompletedNodes([])
            setFailedNodes([])
            setScreen('map')
          }}
        />
      )}

      {screen === 'map' && (
        <MapScreen
          character={selectedChar}
          completedNodes={completedNodes}
          onEnterCombat={handleEnterCombat}
        />
      )}

      {screen === 'transition' && (
        <div className="between-transition">
          <p className="between-transition-line">{transitionMsg}</p>
        </div>
      )}

      {screen === 'combat' && (
        <CombatScreen
          key={`${currentNode?.id}-${dualPhase}`}
          character={charWithHP}
          node={currentNode}
          isDualSecond={dualPhase === 'second'}
          runDeck={activeDeck}
          onWin={(node, survivingHP) => handleWin(node, survivingHP)}
          onLose={(node) => handleLose(node)}
          onFlee={() => setScreen('map')}
        />
      )}

      {screen === 'reward' && pendingReward && (
        <RewardScreen
          character={selectedChar}
          floor={pendingReward.floor}
          isElite={pendingReward.isElite}
          currentDeck={[...basePool.map(c => c.name), ...runDeck.map(c => c.name)]}
          onChoose={handleRewardChosen}
        />
      )}
    </div>
  )
}

export default App