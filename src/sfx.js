// Soft UI sounds (WebAudio): gentle sine tones with a light echo. No audio files.
const KEY = 'bascart-a-muted'
let ctx = null
let master = null
let wetBus = null
let muted = false
try { muted = localStorage.getItem(KEY) === '1' } catch { /* storage unavailable */ }

function audio() {
  if (muted) return null
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      master = ctx.createGain()
      master.gain.value = 0.85
      master.connect(ctx.destination)
      // light echo: delay -> lowpass -> feedback, mixed into master
      const delay = ctx.createDelay()
      delay.delayTime.value = 0.14
      const feedback = ctx.createGain()
      feedback.gain.value = 0.28
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 2200
      wetBus = ctx.createGain()
      wetBus.connect(delay)
      delay.connect(lp)
      lp.connect(feedback)
      feedback.connect(delay)
      lp.connect(master)
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq, dur, { vol = 0.04, delay = 0, to = null, wet = 0 } = {}) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain)
  gain.connect(master)
  if (wet) {
    const send = c.createGain()
    send.gain.value = wet
    gain.connect(send)
    send.connect(wetBus)
  }
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sfx = {
  hover: () => tone(1500, 0.03, { vol: 0.005 }),
  tick: () => tone(1250, 0.03, { vol: 0.018 }),
  click: () => {
    tone(880, 0.06, { vol: 0.045, to: 620 })
    tone(1760, 0.04, { vol: 0.012 })
  },
  nav: () => {
    tone(660, 0.12, { vol: 0.035, wet: 0.2 })
    tone(880, 0.16, { vol: 0.03, delay: 0.05, wet: 0.25 })
  },
  open: () => tone(520, 0.14, { vol: 0.03, to: 720, wet: 0.2 }),
  close: () => tone(720, 0.14, { vol: 0.028, to: 480 }),
  add: (n = 1) => tone(520 + Math.min(n, 12) * 45, 0.13, { vol: 0.045, wet: 0.2 }),
  remove: () => tone(480, 0.11, { vol: 0.035, to: 340 }),
  ok: () => [659, 830, 988].forEach((f, i) => tone(f, 0.38, { vol: 0.035, delay: i * 0.08, wet: 0.4 })),
  err: () => {
    tone(330, 0.16, { vol: 0.04, to: 262 })
    tone(262, 0.22, { vol: 0.04, delay: 0.13, to: 196 })
  },
  coin: () => {
    tone(1319, 0.7, { vol: 0.04, wet: 0.5 })
    tone(1760, 0.8, { vol: 0.03, delay: 0.09, wet: 0.55 })
    tone(2637, 0.6, { vol: 0.014, delay: 0.18, wet: 0.5 })
  },
  boot: () => [392, 494, 587, 784].forEach((f, i) => tone(f, 0.9, { vol: 0.032, delay: i * 0.09, wet: 0.5 })),
  logout: () => [784, 587, 440].forEach((f, i) => tone(f, 0.5, { vol: 0.03, delay: i * 0.09, wet: 0.35 })),
}

export const isMuted = () => muted
export function setMuted(v) {
  muted = v
  try { localStorage.setItem(KEY, v ? '1' : '0') } catch { /* storage unavailable */ }
}
