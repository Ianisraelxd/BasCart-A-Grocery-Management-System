import { useEffect, useRef, useState } from 'react'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Fixed aurora + drifting particle network behind the whole app. */
export function Backdrop() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const still = reduceMotion()
    const mouse = { x: -999, y: -999 }
    let w = 0
    let h = 0
    let raf = 0
    let pts = []

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      cv.width = w * dpr
      cv.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(70, (w * h) / 17000))
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6, c: Math.random() < 0.2 ? '255,43,214' : '0,229,255',
      }))
    }

    const frame = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        if (!still) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < 14000) {
            const f = (1 - d2 / 14000) * 0.9
            p.x += (dx / Math.sqrt(d2 + 1)) * f
            p.y += (dy / Math.sqrt(d2 + 1)) * f
          }
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, 6.283)
        ctx.fillStyle = `rgba(${p.c},.85)`
        ctx.shadowColor = `rgba(${p.c},1)`
        ctx.shadowBlur = 8
        ctx.fill()
      }
      ctx.shadowBlur = 0
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i]
          const b = pts[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 130) {
            ctx.strokeStyle = `rgba(0,229,255,${(1 - d / 130) * 0.22})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      if (!still) raf = requestAnimationFrame(frame)
    }

    const move = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
    size()
    frame()
    window.addEventListener('resize', size)
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <div className="bg" aria-hidden="true">
      <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" />
      <div className="gridfloor" />
      <canvas ref={ref} />
      <div className="vignette" />
    </div>
  )
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\[]{}#%&'

/** Text that decodes from random glyphs into its final letters. */
export function Scramble({ text }) {
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (reduceMotion()) return undefined
    let f = 0
    const total = 20
    const id = setInterval(() => {
      f++
      const done = (f / total) * text.length
      setOut(text.split('').map((ch, i) => (ch === ' ' || i < done ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''))
      if (f >= total) { clearInterval(id); setOut(text) }
    }, 30)
    return () => clearInterval(id)
  }, [text])
  return <span aria-label={text}>{out}</span>
}

export function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="clock" aria-label="Current time">
      <span className="live-dot" />
      <b>{now.toLocaleTimeString('en-GB')}</b>
      <small>{now.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</small>
    </div>
  )
}

/** Circular progress gauge that fills in when it mounts. */
export function Gauge({ value, label, sub }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true))
    return () => cancelAnimationFrame(id)
  }, [])
  const C = 2 * Math.PI * 54
  const pct = Math.max(0, Math.min(1, value))
  return (
    <div className="gauge">
      <svg viewBox="0 0 140 140" role="img" aria-label={`${label}: ${Math.round(pct * 100)}%`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00e5ff" /><stop offset="1" stopColor="#ff2bd6" />
          </linearGradient>
        </defs>
        <circle className="g-track" cx="70" cy="70" r="54" />
        <circle className="g-ticks" cx="70" cy="70" r="64" />
        <circle className="g-fill" cx="70" cy="70" r="54" stroke="url(#gaugeGrad)" strokeDasharray={C} strokeDashoffset={on ? C * (1 - pct) : C} transform="rotate(-90 70 70)" />
      </svg>
      <div className="g-center"><strong>{Math.round(pct * 100)}%</strong><small>{label}</small></div>
      {sub && <p className="g-sub">{sub}</p>}
    </div>
  )
}

/** Self-drawing area chart. */
export function Spark({ data, labels }) {
  const W = 320
  const H = 110
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - 14 - (v / max) * (H - 34)])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${W} ${H} L0 ${H} Z`
  return (
    <div className="spark">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Sales for the last 7 days">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00e5ff" stopOpacity=".45" /><stop offset="1" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="s-area" d={area} fill="url(#sparkFill)" />
        <path className="s-line" d={line} pathLength="1" />
        {pts.map(([x, y], i) => <circle key={i} className="s-dot" cx={x} cy={y} r="3.5" style={{ animationDelay: `${0.6 + i * 0.08}s` }} />)}
      </svg>
      <div className="s-labels">{labels.map((l) => <span key={l}>{l}</span>)}</div>
    </div>
  )
}
