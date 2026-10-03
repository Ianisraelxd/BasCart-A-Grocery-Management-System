// Tiny WebAudio blips so clicks and results feel like blocks. No audio files needed.
const KEY = 'bascart-a-muted'
let ctx = null
let muted = false
try { muted = localStorage.getItem(KEY) === '1' } catch { /* storage unavailable */ }

function tone(freq, dur, type = 'square', vol = 0.04, delay = 0) {
  if (muted) return
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur)
  } catch { /* audio blocked */ }
}

export const sfx = {
  click: () => tone(520, 0.05, 'square', 0.03),
  nav: () => tone(390, 0.06, 'triangle', 0.05),
  ok: () => [523, 659, 784].forEach((f, i) => tone(f, 0.1, 'square', 0.035, i * 0.07)),
  err: () => { tone(140, 0.18, 'sawtooth', 0.05); tone(110, 0.2, 'sawtooth', 0.05, 0.12) },
  coin: () => { tone(988, 0.07, 'square', 0.04); tone(1319, 0.28, 'square', 0.04, 0.07) },
  levelUp: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.04, i * 0.09)),
}

export const isMuted = () => muted
export function setMuted(v) {
  muted = v
  try { localStorage.setItem(KEY, v ? '1' : '0') } catch { /* storage unavailable */ }
}
