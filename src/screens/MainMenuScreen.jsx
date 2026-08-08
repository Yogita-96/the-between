import { useState } from 'react'
import betweenBg from '../assets/the-between-bg.png'
import { playClick } from '../utils/audio'
import SettingsModal from '../components/SettingsModal'
import './MainMenuScreen.css'

export default function MainMenuScreen({
  onBegin, onContinue, hasSavedRun,
  onCompendium, onCredits, onMusicVolumeChange,
}) {
  const [showSettings,    setShowSettings]    = useState(false)
  const [showNewRunConfirm, setShowNewRunConfirm] = useState(false)

  const handleBegin = () => {
    playClick()
    if (hasSavedRun) {
      setShowNewRunConfirm(true)
    } else {
      onBegin()
    }
  }

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
          {hasSavedRun && (
            <button
              className="mainmenu-btn mainmenu-btn--primary"
              onClick={() => { playClick(); onContinue() }}
            >
              Continue
            </button>
          )}
          <button
            className={`mainmenu-btn ${!hasSavedRun ? 'mainmenu-btn--primary' : ''}`}
            onClick={handleBegin}
          >
            {hasSavedRun ? 'New Run' : 'Begin Your Path'}
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

      {showNewRunConfirm && (
        <div className="mainmenu-confirm-backdrop" onClick={() => setShowNewRunConfirm(false)}>
          <div className="mainmenu-confirm-box" onClick={e => e.stopPropagation()}>
            <p className="mainmenu-confirm-text">
              Starting a new run will abandon your current progress. Are you sure?
            </p>
            <div className="mainmenu-confirm-btns">
              <button
                className="mainmenu-confirm-cancel"
                onClick={() => { playClick(); setShowNewRunConfirm(false) }}
              >
                Keep Current Run
              </button>
              <button
                className="mainmenu-confirm-new"
                onClick={() => {
                  playClick()
                  setShowNewRunConfirm(false)
                  onBegin()
                }}
              >
                Start New Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}