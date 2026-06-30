// ─────────────────────────────────────────────────────────────
// settings.js — persistent game settings (music, sfx, vibration)
// Stored in localStorage, read/written from anywhere in the app
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'between-settings'

const DEFAULTS = {
  musicVolume: 0.45,   // 0–1
  sfxVolume: 0.35,     // 0–1
  vibration: true,
}

export function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable (private browsing, quota) — fail silently
  }
}

// Triggers a short haptic buzz on supported devices (mobile), respects setting
export function vibrate(pattern = 15) {
  const settings = loadSettings()
  if (!settings.vibration) return
  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Vibration API blocked or unsupported — fail silently
    }
  }
}