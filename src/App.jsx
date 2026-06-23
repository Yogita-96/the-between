import { useState } from 'react'
import TitleScreen from './screens/TitleScreen'
import CharSelectScreen from './screens/CharSelectScreen'
import './index.css'

function App() {
  const [screen, setScreen] = useState('title')
  const [selectedChar, setSelectedChar] = useState(null)

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
    </div>
  )
}

export default App