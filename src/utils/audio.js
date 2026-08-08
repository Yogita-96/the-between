// ─────────────────────────────────────────────────────────────
// audio.js — shared sound effect helpers
// ─────────────────────────────────────────────────────────────
import clickSfx from '../assets/audio/click-basic.wav'
import hitTakenSfx from '../assets/audio/hit-taken.mp3'
import hitKaenSfx from '../assets/audio/hit-kaen.mp3'
import kaenGreatswordSfx from '../assets/audio/kaen-greatsword.mp3'
import hitSableSfx from '../assets/audio/hit-sable.mp3'
import dodgeKaenSfx from '../assets/audio/dodge-kaen.mp3'
import dodgeSableSfx from '../assets/audio/dodge-sable.mp3'
import staggerBreakSfx from '../assets/audio/stagger-break.mp3'
import playerEnterSfx from '../assets/audio/player-enter.mp3'
import { loadSettings, vibrate } from './settings'

// Shared one-shot player. Reads the current SFX volume, respects mute,
// and swallows the mobile autoplay rejection like the rest of the helpers.
function playSfx(src, volScale = 1) {
  const settings = loadSettings()
  if (settings.sfxVolume <= 0) return
  const sfx = new Audio(src)
  sfx.volume = Math.min(1, settings.sfxVolume * volScale)
  sfx.play().catch(() => {})
}

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
// ── Combat attack sounds (you landing hits) ──

export function playHitKaen() {
  vibrate(15)
  playSfx(hitKaenSfx)
}

export function playKaenGreatsword() {
  vibrate(18) // heavier swing, firmer buzz
  playSfx(kaenGreatswordSfx)
}

// Sable's strike plays twice in quick succession — the double-dagger feel
// that matches her paired-blade identity (and Twin Fangs' two hits).
export function playHitSable() {
  vibrate(12)
  playSfx(hitSableSfx)
  setTimeout(() => vibrate(12), 150) // second strike's buzz
  setTimeout(() => playSfx(hitSableSfx), 150)
}

// ── Defend / dodge sounds (character-specific) ──

export function playDodgeKaen() {
  vibrate(15) // armor takes the blow
  playSfx(dodgeKaenSfx)
}

export function playDodgeSable() {
  vibrate(8) // a lighter evade — cloth, not steel
  playSfx(dodgeSableSfx)
}

// ── The payoff: enemy guard breaks ──

export function playStaggerBreak() {
  vibrate(30) // the biggest buzz — this is the moment
  playSfx(staggerBreakSfx)
}

// ── Combat entry ──

export function playPlayerEnter() {
  playSfx(playerEnterSfx)
}