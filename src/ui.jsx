import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { sfx } from './sfx'
import { Icon } from './icons'

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
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

/** One-shot celebration: a green check that springs in, a soft ring, and pastel confetti. Change `key` to fire again. */
export function Burst() {
  const [bits] = useState(() => Array.from({ length: 34 }, (_, i) => ({
    x: (Math.random() - 0.5) * 460, y: 140 + Math.random() * 260, r: (Math.random() - 0.5) * 720,
    d: Math.random() * 0.25, w: 6 + Math.random() * 6, h: 10 + Math.random() * 8,
    c: ['#ff8a80', '#ffd180', '#8de0a5', '#8ec5ff', '#d1b3ff', '#ffa6d1'][i % 6],
  })))
  const [on, setOn] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 2200)
    return () => clearTimeout(t)
  }, [])
  if (!on) return null
  return (
    <div className="burst" aria-hidden="true">
      <i className="ring" />
      <svg className="big-check" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" /><path d="M19 33l9 9 17-19" /></svg>
      {bits.map((b, i) => <span key={i} style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--r': `${b.r}deg`, width: b.w, height: b.h, animationDelay: `${b.d}s`, background: b.c }} />)}
    </div>
  )
}
