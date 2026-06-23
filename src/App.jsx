import { useState } from 'react'
import TitleScreen from './screens/TitleScreen'
import CharSelectScreen from './screens/CharSelectScreen'
import MapScreen from './screens/MapScreen'
import './index.css'

function App() {
  const [screen, setScreen] = useState('title')
  const [selectedChar, setSelectedChar] = useState(null)
  const [completedNodes, setCompletedNodes] = useState([])
  const [currentNode, setCurrentNode] = useState(null)

  const handleEnterCombat = (node) => {
    setCurrentNode(node)
    setScreen('combat') // placeholder for now
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
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c8a030',
          fontFamily: 'Cinzel, serif',
          fontSize: '1.2rem',
          letterSpacing: '0.2em',
          background: '#06080f',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>COMBAT SCREEN — Coming Soon</div>
          <div style={{ fontSize: '0.8rem', color: '#5a4020' }}>
            Entering: {currentNode?.label}
          </div>
          <button
            onClick={() => setScreen('map')}
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: '#c8a030',
              border: '1px solid #3a2a10',
              borderRadius: '6px',
              padding: '10px 24px',
              background: 'transparent',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Return to Map
          </button>
        </div>
      )}
    </div>
  )
}

export default App