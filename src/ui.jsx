import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { sfx } from './sfx'
import { Scramble } from './fx'
import { Icon } from './icons'

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1><Scramble text={title} /></h1>
        {sub && <p>{sub}</p>}
      </div>
      <div className="head-actions">{children}</div>
    </div>
  )
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {title && <h2 className="panel-title">{title}</h2>}
      {children}
    </section>
  )
}

export function Btn({ variant = '', children, ...props }) {
  return <button type="button" className={`btn ${variant}`} {...props}>{children}</button>
}

export function Field({ label, children, wide }) {
  return (
    <label className={`field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Badge({ kind = 'gray', children }) {
  return <span className={`badge ${kind}`}>{children}</span>
}

const STATUS_KIND = {
  Active: 'green', Inactive: 'gray', Draft: 'gray', Sent: 'blue', Received: 'green', Cancelled: 'red',
  Pending: 'gold', Preparing: 'blue', 'Out for Delivery': 'purple', Delivered: 'green', Paid: 'green',
  OK: 'green', Low: 'gold', Out: 'red', Revenue: 'green', Expense: 'red',
}
export const Status = ({ value }) => <Badge kind={STATUS_KIND[value] || 'gray'}>{value}</Badge>

export function Table({ cols, rows, empty = 'Nothing here yet.' }) {
  return (
    <div className="table-scroll">
      <table className="data">
        <thead>
          <tr>{cols.map((c) => <th key={c.label} className={c.num ? 'num' : ''}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length} className="empty">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={r.id ?? i} style={{ '--i': Math.min(i, 14) }}>
              {cols.map((c) => <td key={c.label} data-label={c.label} className={`${c.num ? 'num' : ''} ${c.label ? '' : 'actions'}`}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    sfx.open()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); sfx.close() }
  }, [onClose])
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal panel live ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2 className="panel-title">{title}</h2>
          <button type="button" className="x" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button type="button" key={t} className={`btn ${t === value ? 'green' : ''}`} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  )
}

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, kind = 'ok') => {
    const id = Math.random()
    if (kind === 'err') sfx.err()
    else sfx.ok()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            <Icon name={t.kind === 'err' ? 'alert' : 'check'} size={20} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/** Runs an action result through a toast; returns true when it succeeded. */
export function report(toast, res, okMsg) {
  if (res.ok) { if (okMsg) toast(okMsg); return true }
  toast(res.error, 'err')
  return false
}

export function downloadFile(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

const CAT_ICONS = {
  'Grains & Pantry': '🌾', 'Dairy & Eggs': '🥚', Beverages: '🥤', Snacks: '🍿',
  'Frozen Goods': '🧊', Household: '🧽', 'Personal Care': '🧼',
}
export const catIcon = (c) => CAT_ICONS[c] || '📦'

/** Animates a number up to its value, like a counter ticking in. */
export function Count({ value, format = (n) => Math.round(n) }) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 900)
      const v = a + (value - a) * (1 - Math.pow(1 - p, 4))
      from.current = v
      setShown(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{format(shown)}</>
}

/** One-shot celebration: shockwave rings, a drawn check mark, and radial particles. Change `key` to fire again. */
export function Burst() {
  const [bits] = useState(() => Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2 + Math.random() * 0.3
    const d = 110 + Math.random() * 190
    return {
      x: Math.cos(a) * d, y: Math.sin(a) * d, s: 0.5 + Math.random() * 1.1, delay: Math.random() * 0.12,
      c: ['#00e5ff', '#ff2bd6', '#b6ff3c', '#ffffff', '#7c4dff'][i % 5],
    }
  }))
  const [on, setOn] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 1800)
    return () => clearTimeout(t)
  }, [])
  if (!on) return null
  return (
    <div className="burst" aria-hidden="true">
      <i className="ring r1" /><i className="ring r2" /><i className="ring r3" />
      <svg className="big-check" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" /><path d="M18 33l9 9 19-20" /></svg>
      {bits.map((b, i) => <span key={i} style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--s': b.s, animationDelay: `${b.delay}s`, background: b.c, color: b.c }} />)}
    </div>
  )
}
