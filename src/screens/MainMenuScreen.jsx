import { useState } from 'react'
import betweenBg from '../assets/the-between-bg.png'
import { playClick } from '../utils/audio'
import SettingsModal from '../components/SettingsModal'
import './MainMenuScreen.css'

export default function MainMenuScreen({ onBegin, onCompendium, onCredits, onMusicVolumeChange }) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="mainmenu">
      <div className="mainmenu-bg" style={{ backgroundImage: `url(${betweenBg})` }} />
      <div className="mainmenu-overlay" />

      <button
        className="settings-icon-circular"
        onClick={() => { playClick(); setShowSettings(true) }}
        aria-label="Settings"
      >
        ⚙
      </button>

      <div className="mainmenu-content">
        <p className="mainmenu-eyebrow">✦ The Between ✦</p>

        <div className="mainmenu-buttons">
          <button className="mainmenu-btn mainmenu-btn--primary" onClick={() => { playClick(); onBegin() }}>
            Begin Your Path
          </button>
          <button className="mainmenu-btn" onClick={() => { playClick(); onCompendium() }}>
            Compendium
          </button>
          <button className="mainmenu-btn" onClick={() => { playClick(); onCredits() }}>
            Credits
          </button>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onMusicVolumeChange={onMusicVolumeChange}
        />
      )}
    </div>
  )
}