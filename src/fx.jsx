import { useEffect, useState } from 'react'

/** Soft pastel wallpaper: slow drifting color blobs behind the glass. */
export function Backdrop() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="blob b4" />
    </div>
  )
}

export function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="clock" aria-label="Current time">
      <b>{now.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}</b>
      <small>{now.toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' })}</small>
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
            <stop offset="0" stopColor="#5ac8fa" /><stop offset="1" stopColor="#007aff" />
          </linearGradient>
        </defs>
        <circle className="g-track" cx="70" cy="70" r="54" />
        <circle className="g-fill" cx="70" cy="70" r="54" stroke="url(#gaugeGrad)" strokeDasharray={C} strokeDashoffset={on ? C * (1 - pct) : C} transform="rotate(-90 70 70)" />
      </svg>
      <div className="g-center"><strong>{Math.round(pct * 100)}%</strong><small>{label}</small></div>
      {sub && <p className="g-sub">{sub}</p>}
    </div>
  )
}

function smoothPath(p) {
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)},${c2[0].toFixed(1)} ${c2[1].toFixed(1)},${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

/** Smooth self-drawing area chart. */
export function Spark({ data, labels }) {
  const W = 320
  const H = 110
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - 12 - (v / max) * (H - 32)])
  const line = smoothPath(pts)
  const area = `${line} L${W} ${H} L0 ${H} Z`
  return (
    <div className="spark">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Sales for the last 7 days">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#007aff" stopOpacity=".28" /><stop offset="1" stopColor="#007aff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="s-area" d={area} fill="url(#sparkFill)" />
        <path className="s-line" d={line} pathLength="1" />
        {pts.map(([x, y], i) => <circle key={i} className="s-dot" cx={x} cy={y} r="4" style={{ animationDelay: `${0.7 + i * 0.07}s` }} />)}
      </svg>
      <div className="s-labels">{labels.map((l) => <span key={l}>{l}</span>)}</div>
    </div>
  )
}
