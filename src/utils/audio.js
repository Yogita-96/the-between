// ─────────────────────────────────────────────────────────────
// audio.js — shared sound effect helpers
// ─────────────────────────────────────────────────────────────
import clickSfx from '../assets/audio/click-basic.wav'
import { loadSettings, vibrate } from './settings'

export function playClick() {
  const settings = loadSettings()
  vibrate(12)
  if (settings.sfxVolume <= 0) return
  const sfx = new Audio(clickSfx)
  sfx.volume = settings.sfxVolume
  sfx.play().catch(() => {})
}