import betweenBg from '../assets/the-between-bg.png'
import { CREDITS } from '../data/loreContent'
import { playClick } from '../utils/audio'
import './CreditsScreen.css'

export default function CreditsScreen({ onBack }) {
  return (
    <div className="credits-screen">
      <div className="credits-bg" style={{ backgroundImage: `url(${betweenBg})` }} />
      <div className="credits-overlay" />

      <div className="credits-content">
        <p className="credits-eyebrow">The Between</p>
        <h2 className="credits-title">Credits</h2>

        <div className="credits-divider">
          <div className="cr-dash" />
          <div className="cr-gem" />
          <div className="cr-dash" />
        </div>

        <div className="credits-list">
          <div className="credits-entry">
            <p className="credits-label">{CREDITS.creator.label}</p>
            <p className="credits-text">{CREDITS.creator.text}</p>
          </div>

          <div className="credits-entry">
            <p className="credits-label">{CREDITS.art.label}</p>
            <p className="credits-text">{CREDITS.art.text}</p>
          </div>

          <div className="credits-entry">
            <p className="credits-label">{CREDITS.music.label}</p>
            <p className="credits-text">{CREDITS.music.text}</p>
            <a href={CREDITS.music.link} target="_blank" rel="noopener noreferrer" className="credits-link">
              {CREDITS.music.link}
            </a>
          </div>
        </div>

        <button className="credits-back-btn" onClick={() => { playClick(); onBack() }}>
          ← Back to Menu
        </button>
      </div>
    </div>
  )
}