// Synthesized UI sounds (WebAudio): no audio files. Tones, filtered-noise sweeps, and a soft echo bus.
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
      master.gain.value = 0.9
      master.connect(ctx.destination)
      // echo bus: delay -> lowpass -> feedback, mixed into master
      const delay = ctx.createDelay()
      delay.delayTime.value = 0.17
      const feedback = ctx.createGain()
      feedback.gain.value = 0.32
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 2600
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

function tone(freq, dur, { type = 'sine', vol = 0.05, delay = 0, to = null, wet = 0 } = {}) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.006)
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

function sweep(dur, from, to, { vol = 0.04, delay = 0, q = 4 } = {}) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + delay
  const len = Math.max(1, Math.floor(c.sampleRate * dur))
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = q
  filter.frequency.setValueAtTime(from, t)
  filter.frequency.exponentialRampToValueAtTime(to, t + dur)
  const gain = c.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(master)
  src.start(t)
  src.stop(t + dur)
}

export const sfx = {
  hover: () => tone(2200, 0.03, { vol: 0.011 }),
  tick: () => tone(1400, 0.025, { vol: 0.02 }),
  click: () => {
    tone(1100, 0.07, { type: 'triangle', vol: 0.05, to: 1700 })
    tone(200, 0.05, { vol: 0.04, to: 90 })
  },
  nav: () => {
    sweep(0.22, 400, 2400, { vol: 0.05 })
    tone(520, 0.14, { vol: 0.04, to: 780, wet: 0.3 })
  },
  open: () => sweep(0.25, 300, 3200, { vol: 0.045 }),
  close: () => sweep(0.2, 3200, 300, { vol: 0.04 }),
  add: (n = 1) => tone(600 + Math.min(n, 12) * 70, 0.1, { type: 'triangle', vol: 0.06, wet: 0.2 }),
  remove: () => tone(520, 0.1, { vol: 0.05, to: 260 }),
  ok: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, { type: 'triangle', vol: 0.045, delay: i * 0.07, wet: 0.35 })),
  err: () => {
    tone(180, 0.28, { type: 'sawtooth', vol: 0.05, to: 70 })
    tone(95, 0.3, { type: 'square', vol: 0.03, delay: 0.04 })
  },
  coin: () => {
    tone(1568, 0.1, { type: 'square', vol: 0.035, wet: 0.3 })
    tone(2093, 0.45, { type: 'square', vol: 0.035, delay: 0.09, wet: 0.5 })
    sweep(0.4, 2000, 8000, { vol: 0.025, delay: 0.1 })
  },
  boot: () => {
    sweep(0.9, 120, 5000, { vol: 0.07, q: 2 })
    tone(110, 0.9, { type: 'sawtooth', vol: 0.04, to: 440 })
    ;[659, 880, 1319].forEach((f, i) => tone(f, 0.5, { vol: 0.05, delay: 0.55 + i * 0.1, wet: 0.5 }))
  },
  logout: () => {
    sweep(0.5, 4000, 150, { vol: 0.05 })
    tone(660, 0.4, { vol: 0.04, to: 165 })
  },
}

export const isMuted = () => muted
export function setMuted(v) {
  muted = v
  try { localStorage.setItem(KEY, v ? '1' : '0') } catch { /* storage unavailable */ }
}
