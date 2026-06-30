import { useState, useEffect } from 'react'
import { loadSettings, saveSettings } from '../utils/settings'
import { playClick } from '../utils/audio'
import './SettingsModal.css'

// onMusicVolumeChange: optional callback so the caller (App) can
// live-update the currently playing ambient track's volume
export default function SettingsModal({ onClose, onMusicVolumeChange }) {
  const [settings, setSettings] = useState(() => loadSettings())

  useEffect(() => {
    saveSettings(settings)
    onMusicVolumeChange?.(settings.musicVolume)
  }, [settings])

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-box" onClick={e => e.stopPropagation()}>
        <p className="settings-eyebrow">The Between</p>
        <h2 className="settings-title">Settings</h2>

        <div className="settings-row">
          <span className="settings-label">Music Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.musicVolume}
            onChange={e => update('musicVolume', parseFloat(e.target.value))}
            className="settings-slider"
          />
        </div>

        <div className="settings-row">
          <span className="settings-label">SFX Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.sfxVolume}
            onChange={e => update('sfxVolume', parseFloat(e.target.value))}
            className="settings-slider"
          />
        </div>

        <div className="settings-row settings-row--toggle">
          <span className="settings-label">Vibration</span>
          <button
            className={`settings-toggle ${settings.vibration ? 'on' : 'off'}`}
            onClick={() => update('vibration', !settings.vibration)}
          >
            <span className="settings-toggle-knob" />
          </button>
        </div>

        <button className="settings-close-btn" onClick={() => { playClick(); onClose() }}>
          Close
        </button>
      </div>
    </div>
  )
}