import { useState } from 'react'
import { buildRewardOptions } from '../data/cards'
import './RewardScreen.css'

export default function RewardScreen({ character, floor, isElite, currentDeck, onChoose }) {
  const isKaen = character?.id === 'kaen' || character?.name?.toLowerCase() === 'kaen'

  const [options] = useState(() => buildRewardOptions({
    floor,
    isKaen,
    currentDeck,
  }))

  const [chosen, setChosen] = useState(null)

  const handleChoose = (option) => {
    setChosen(option)
    setTimeout(() => onChoose(option), 600)
  }

  const handleSkip = () => {
    setTimeout(() => onChoose(null), 300)
  }

  const eyebrow = isElite
    ? 'Elite Cleared'
    : floor === 2
    ? 'Floor II'
    : 'Floor I'

  const title = isElite
    ? 'The Unfinished Falls'
    : 'The Between Yields Something'

  const lore = isElite
    ? 'It almost became. You made sure it didn\'t.'
    : 'A moment of stillness. Take what you can carry.'

  return (
    <div className="reward-screen">
      <div className="reward-overlay" />

      <div className="reward-content">
        <p className="reward-eyebrow">{eyebrow}</p>
        <h2 className="reward-title">{title}</h2>
        <p className="reward-lore">{lore}</p>

        <div className="reward-divider">
          <div className="reward-dash" />
          <div className="reward-gem">✦</div>
          <div className="reward-dash" />
        </div>

        <p className="reward-instruction">Choose one — or pass.</p>

        <div className="reward-options">
          {options.map((option, i) => (
            <button
              key={i}
              className={`reward-option reward-option--${option.type} ${chosen === option ? 'chosen' : ''}`}
              onClick={() => handleChoose(option)}
              disabled={chosen !== null}
            >
              <span className="reward-option-tag">
                {option.type === 'card'    && '+ New Card'}
                {option.type === 'upgrade' && '↑ Upgrade'}
                {option.type === 'boost'   && '◈ Stat Boost'}
              </span>
              <span className="reward-option-name">{option.label}</span>
              <span className="reward-option-desc">{option.desc}</span>
            </button>
          ))}
        </div>

        <button
          className="reward-skip-btn"
          onClick={handleSkip}
          disabled={chosen !== null}
        >
          Pass — take nothing
        </button>
      </div>
    </div>
  )
}