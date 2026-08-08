import { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { COMBAT_TUTORIAL } from '../data/loreContent'
import { playClick } from '../utils/audio'
import './CombatTutorial.css'

/* Spotlight walkthrough over the real combat UI.
   For each step it finds the target element by CSS selector, measures its
   on-screen position, draws a bright ring around it (which dims the rest of
   the screen), and places an explanatory box near it. Fully self-contained —
   it renders nothing but its own overlay and touches no other component. */

const PADDING = 8 // breathing room around the highlighted element, in px

export default function CombatTutorial({ onClose }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)

  const total = COMBAT_TUTORIAL.length
  const current = COMBAT_TUTORIAL[step]
  const isLast = step === total - 1

  // Measure the current step's target element. useLayoutEffect so the
  // spotlight is positioned before paint (no flicker on step change).
  const measure = useCallback(() => {
    const el = document.querySelector(current.selector)
    if (!el) {
      // Target not found (layout differs) — skip gracefully to a centered box.
      setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    setRect({
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    })
  }, [current.selector])

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    measure()
  }, [measure])

  // Re-measure on resize/scroll so the spotlight stays glued to its target.
  useEffect(() => {
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  const next = useCallback(() => {
    if (isLast) onClose()
    else setStep(s => Math.min(s + 1, total - 1))
  }, [isLast, onClose, total])
  const back = useCallback(() => {
    setStep(s => Math.max(s - 1, 0))
  }, [])

  // Keyboard: Esc skips, arrows navigate.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, back, onClose])

  // Position the text box: below the target if there's room, else above,
  // else centered. Falls back to centered when the target wasn't found.
  const boxStyle = (() => {
    if (!rect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
    const GAP = 24 // clearance between the spotlight and the text box
    const spaceBelow = window.innerHeight - (rect.top + rect.height)
    const BOX_EST = 240 // rough box height for placement decisions
    if (spaceBelow > BOX_EST + GAP) {
      return { top: rect.top + rect.height + GAP, left: clampLeft(rect.left) }
    }
    return { top: Math.max(GAP, rect.top - BOX_EST - GAP), left: clampLeft(rect.left) }
  })()

  return (
    <div className="tut-overlay" role="dialog" aria-modal="true">
      <div className="tut-dim" />
      {rect && (
        <div
          className="tut-spotlight"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}
      <div className="tut-box" style={boxStyle}>
        <span className="tut-step-count">Step {step + 1} of {total}</span>
        <span className="tut-title">{current.title}</span>
        <span className="tut-text">{current.text}</span>
        <div className="tut-controls">
          <button className="tut-skip" onClick={() => { playClick(); onClose() }}>Skip</button>
          <div className="tut-nav">
            {step > 0 && (
              <button className="tut-btn tut-btn--back" onClick={() => { playClick(); back() }}>Back</button>
            )}
            <button className="tut-btn tut-btn--next" onClick={() => { playClick(); next() }}>
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Keep the text box from spilling off the right edge on narrow screens.
function clampLeft(left) {
  const BOX_WIDTH = 340
  const max = window.innerWidth - BOX_WIDTH - 16
  return Math.max(16, Math.min(left, max))
}