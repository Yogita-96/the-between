// ─────────────────────────────────────────────────────────────
// audio.js — shared sound effect helpers
// ─────────────────────────────────────────────────────────────
import clickSfx from '../assets/audio/click-basic.wav'
import hitTakenSfx from '../assets/audio/hit-taken.mp3'
import { loadSettings, vibrate } from './settings'

export function playClick() {
  const settings = loadSettings()
  vibrate(12)
  if (settings.sfxVolume <= 0) return
  const sfx = new Audio(clickSfx)
  sfx.volume = settings.sfxVolume
  sfx.play().catch(() => {})
}

export function playHitTaken() {
  const settings = loadSettings()
  vibrate(20) // a firmer buzz — you got hit
  if (settings.sfxVolume <= 0) return
  const sfx = new Audio(hitTakenSfx)
  sfx.volume = settings.sfxVolume
  sfx.play().catch(() => {})
}