import { useState, useEffect } from 'react'
import betweenBg from '../assets/the-between-bg.png'
import kaenImg from '../assets/kaen.png'
import sableImg from '../assets/sable.png'
import {
  WORLD_LORE, CHARACTER_LORE, BESTIARY, HOW_TO_PLAY, SYNERGIES,
} from '../data/loreContent'
import {
  KAEN_BASE_POOL, SABLE_BASE_POOL, KAEN_HP_CARDS, SABLE_HP_CARDS, SABLE_REWARD_CARDS,
} from '../data/cards'
import { playClick } from '../utils/audio'
import SettingsModal from '../components/SettingsModal'
import './CompendiumScreen.css'

const TABS = [
  { id: 'howto',      label: 'How to Play' },
  { id: 'world',       label: 'World' },
  { id: 'characters',  label: 'Characters' },
  { id: 'bestiary',    label: 'Bestiary' },
  { id: 'cards',       label: 'Cards' },
  { id: 'synergies',   label: 'Synergies' },
]

export default function CompendiumScreen({ unlockedCards = [], onBack, onMusicVolumeChange }) {
  const [activeTab, setActiveTab] = useState('howto')
  const [showSettings, setShowSettings] = useState(false)

  const currentIndex = TABS.findIndex(t => t.id === activeTab)
  const nextTab = TABS[(currentIndex + 1) % TABS.length]

  // Scroll to top whenever the tab changes — covers Next button,
  // top tab clicks, so mobile users always land at the start of new content
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  const goNext = () => {
    playClick()
    setActiveTab(nextTab.id)
  }

  return (
    <div className="compendium">
      <div className="compendium-bg" style={{ backgroundImage: `url(${betweenBg})` }} />
      <div className="compendium-overlay" />

      <button
        className="settings-icon-circular"
        onClick={() => { playClick(); setShowSettings(true) }}
        aria-label="Settings"
      >
        ⚙
      </button>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onMusicVolumeChange={onMusicVolumeChange}
        />
      )}

      <div className="compendium-content">
        <div className="compendium-header">
          <p className="compendium-eyebrow">The Between</p>
          <h2 className="compendium-title">Compendium</h2>
        </div>

        <div className="compendium-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`compendium-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { playClick(); setActiveTab(tab.id) }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="compendium-body">
          {activeTab === 'howto'      && <HowToPlayTab />}
          {activeTab === 'world'      && <WorldTab />}
          {activeTab === 'characters' && <CharactersTab />}
          {activeTab === 'bestiary'   && <BestiaryTab />}
          {activeTab === 'cards'      && <CardsTab unlockedCards={unlockedCards} />}
          {activeTab === 'synergies'  && <SynergiesTab />}
        </div>

        <div className="compendium-nav-row">
          <button className="compendium-back-btn" onClick={() => { playClick(); onBack() }}>
            ← Back to Menu
          </button>
          <button className="compendium-next-btn" onClick={goNext}>
            Next: {nextTab.label} →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── HOW TO PLAY ────────────────────────────────────────────
function HowToPlayTab() {
  return (
    <div className="comp-section">
      {HOW_TO_PLAY.map((item, i) => (
        <div key={i} className="comp-entry">
          <h3 className="comp-entry-heading">{item.heading}</h3>
          <p className="comp-entry-text">{item.text}</p>
        </div>
      ))}
    </div>
  )
}

// ─── WORLD ──────────────────────────────────────────────────
function WorldTab() {
  return (
    <div className="comp-world-narrative">
      {WORLD_LORE.paragraphs.map((text, i) => (
        <p key={i} className="comp-entry-text comp-entry-text--lore comp-world-para">
          {text}
        </p>
      ))}
    </div>
  )
}

// ─── CHARACTERS ─────────────────────────────────────────────
function CharactersTab() {
  return (
    <div className="comp-char-grid">
      {Object.values(CHARACTER_LORE).map((char) => (
        <div key={char.name} className="comp-char-card">
          <img
            src={char.name === 'Kaen' ? kaenImg : sableImg}
            alt={char.name}
            className="comp-char-img"
          />
          <div className="comp-char-info">
            <h3 className="comp-char-name">{char.name}</h3>
            <p className="comp-char-title">{char.title} · {char.role}</p>
            {char.fullLore.map((para, i) => (
              <p key={i} className="comp-entry-text comp-entry-text--lore">{para}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── BESTIARY ───────────────────────────────────────────────
function BestiaryTab() {
  return (
    <div className="comp-section">
      {Object.values(BESTIARY).map((enemy) => (
        <div key={enemy.name} className="comp-entry comp-bestiary-entry">
          <div className="comp-bestiary-header">
            <h3 className="comp-entry-heading">{enemy.name}</h3>
            <span className="comp-bestiary-tier">{enemy.tier}</span>
          </div>

          <div className="comp-bestiary-fields">
            <div className="comp-bestiary-field">
              <p className="comp-bestiary-field-label">Origin</p>
              <p className="comp-entry-text comp-entry-text--lore">{enemy.origin}</p>
            </div>
            <div className="comp-bestiary-field">
              <p className="comp-bestiary-field-label">Behavior</p>
              <p className="comp-entry-text comp-entry-text--lore">{enemy.behavior}</p>
            </div>
            <div className="comp-bestiary-field">
              <p className="comp-bestiary-field-label">Why It Fights</p>
              <p className="comp-entry-text comp-entry-text--lore">{enemy.whyItFights}</p>
            </div>
            <div className="comp-bestiary-field">
              <p className="comp-bestiary-field-label">Appearance</p>
              <p className="comp-entry-text comp-entry-text--lore">{enemy.appearance}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── CARDS ──────────────────────────────────────────────────
function CardsTab({ unlockedCards }) {
  const [charFilter, setCharFilter] = useState('kaen')

  const basePool   = charFilter === 'kaen' ? KAEN_BASE_POOL : SABLE_BASE_POOL
  const hpCards    = charFilter === 'kaen' ? KAEN_HP_CARDS  : SABLE_HP_CARDS
  const rewardOnly = charFilter === 'sable' ? SABLE_REWARD_CARDS : []
  const allRewardCards = [...hpCards, ...rewardOnly]

  return (
    <div className="comp-cards-tab">
      <div className="comp-char-filter">
        <button
          className={`comp-filter-btn ${charFilter === 'kaen' ? 'active' : ''}`}
          onClick={() => { playClick(); setCharFilter('kaen') }}
        >
          Kaen
        </button>
        <button
          className={`comp-filter-btn ${charFilter === 'sable' ? 'active' : ''}`}
          onClick={() => { playClick(); setCharFilter('sable') }}
        >
          Sable
        </button>
      </div>

      <p className="comp-cards-note">
        Discovering a card here only marks it as seen — it must still be earned as a reward in each run.
      </p>

      <p className="comp-cards-group-label">Base Pool</p>
      <div className="comp-cards-grid">
        {basePool.map(card => (
          <div key={card.name} className="comp-card-tile">
            <span className="comp-card-name">{card.name}</span>
            <span className="comp-card-desc">{card.desc}</span>
            <span className="comp-card-cost">{card.cost} ST</span>
          </div>
        ))}
      </div>

      <p className="comp-cards-group-label">
        Reward Cards
        <span className="comp-cards-group-count">
          {allRewardCards.filter(c => unlockedCards.includes(c.name)).length} / {allRewardCards.length} discovered
        </span>
      </p>
      <div className="comp-cards-grid">
        {allRewardCards.map(card => {
          const isUnlocked = unlockedCards.includes(card.name)
          return (
            <div
              key={card.name}
              className={`comp-card-tile comp-card-tile--reward ${!isUnlocked ? 'comp-card-tile--locked' : ''}`}
            >
              {isUnlocked ? (
                <>
                  <span className="comp-card-name">{card.name}</span>
                  <span className="comp-card-desc">{card.desc}</span>
                  <span className="comp-card-cost">{card.cost} ST</span>
                </>
              ) : (
                <>
                  <span className="comp-card-name comp-card-name--locked">?????</span>
                  <span className="comp-card-desc comp-card-desc--locked">Undiscovered — find this in a run</span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── SYNERGIES ──────────────────────────────────────────────
function SynergiesTab() {
  return (
    <div className="comp-section">
      <h3 className="comp-entry-heading">Kaen</h3>
      {SYNERGIES.kaen.map((s, i) => (
        <div key={i} className="comp-synergy">
          <p className="comp-synergy-combo">{s.combo}</p>
          <p className="comp-synergy-why">{s.why}</p>
        </div>
      ))}

      <h3 className="comp-entry-heading" style={{ marginTop: '24px' }}>Sable</h3>
      {SYNERGIES.sable.map((s, i) => (
        <div key={i} className="comp-synergy">
          <p className="comp-synergy-combo">{s.combo}</p>
          <p className="comp-synergy-why">{s.why}</p>
        </div>
      ))}
    </div>
  )
}