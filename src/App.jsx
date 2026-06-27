import { useState } from 'react'
import TitleScreen from './screens/TitleScreen'
import CharSelectScreen from './screens/CharSelectScreen'
import MapScreen from './screens/MapScreen'
import CombatScreen from './screens/CombatScreen'
import './index.css'

function App() {
  const [screen, setScreen] = useState('title')
  const [selectedChar, setSelectedChar] = useState(null)
  const [completedNodes, setCompletedNodes] = useState([])
  const [currentNode, setCurrentNode] = useState(null)

  const handleEnterCombat = (node) => {
    setCurrentNode(node)
    setScreen('combat')
  }

  return (
    <div className="app">
      {screen === 'title' && (
        <TitleScreen onBegin={() => setScreen('charselect')} />
      )}
      {screen === 'charselect' && (
        <CharSelectScreen
          onSelect={(char) => {
            setSelectedChar(char)
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
      {screen === 'combat' && (
        <CombatScreen
          character={selectedChar}
          node={currentNode}
          onWin={(node) => {
            setCompletedNodes(prev => [...prev, node.id])
            setScreen('map')
          }}
          onLose={() => setScreen('map')}
          onFlee={() => setScreen('map')}
        />
      )}
    </div>
  )
}

export default App