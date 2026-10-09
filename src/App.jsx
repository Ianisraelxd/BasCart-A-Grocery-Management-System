import { useEffect, useRef, useState } from 'react'
import './App.css'
import { MODULES, StoreProvider, canAccess, useStore } from './store'
import { Btn, Field, ToastProvider } from './ui'
import { Backdrop } from './fx'
import { Icon } from './icons'
import { isMuted, setMuted, sfx } from './sfx'
import Dashboard from './pages/Dashboard'
import Pos from './pages/Pos'
import Online from './pages/Online'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Suppliers from './pages/Suppliers'
import Purchasing from './pages/Purchasing'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import Finance from './pages/Finance'
import Reports from './pages/Reports'
import Employees from './pages/Employees'
import Audit from './pages/Audit'
import Backup from './pages/Backup'

const PAGES = { dashboard: Dashboard, pos: Pos, online: Online, products: Products, inventory: Inventory, suppliers: Suppliers, purchasing: Purchasing, customers: Customers, sales: Sales, finance: Finance, reports: Reports, employees: Employees, audit: Audit, backup: Backup }
const SHORT = { pos: 'POS', online: 'Orders', audit: 'Audit', dashboard: 'Home', purchasing: 'Buying', customers: 'Clients', employees: 'Staff' }
const HUES = [190, 280, 320, 150, 40, 230]

function Logo({ small }) {
  return (
    <div className={`logo ${small ? 'small' : ''}`}>
      <svg className="logo-mark" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M16 3.5l10.8 6.25v12.5L16 28.5 5.2 22.25V9.75z" />
        <circle cx="16" cy="16" r="4" className="core" />
      </svg>
      <span>BasCart<b>-A</b></span>
    </div>
  )
}

function Orb({ name, seed = 0 }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  return <span className="orb" style={{ '--h': HUES[seed % HUES.length] }} aria-hidden="true">{initials}</span>
}

function SoundBtn() {
  const [muted, setM] = useState(isMuted)
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={!muted}
      onClick={() => { const v = !muted; setMuted(v); setM(v); if (!v) sfx.ok() }}
    >
      <Icon name={muted ? 'mute' : 'volume'} size={20} />
    </button>
  )
}

function Login({ onEnter }) {
  const { db, login } = useStore()
  const [id, setId] = useState(db.employees.find((e) => e.status === 'Active')?.id ?? '')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(0)
  const submit = (e) => {
    e.preventDefault()
    const res = login(id, pin)
    if (res.ok) {
      sfx.boot()
      onEnter(db.employees.find((x) => x.id === id)?.name ?? '')
    } else {
      setError(res.error)
      setPin('')
      setShake((n) => n + 1)
      sfx.err()
    }
  }
  return (
    <div className="login">
      <form key={shake} className={`panel live login-card ${shake ? 'denied' : ''}`} onSubmit={submit}>
        <Logo />
        <p className="status-line"><span className="live-dot" /> System online · secure terminal</p>
        <Field label="Operator">
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {db.employees.filter((e) => e.status === 'Active').map((e) => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
          </select>
        </Field>
        <Field label="Access PIN">
          <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} placeholder="••••" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); sfx.tick() }} required />
        </Field>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Btn variant="green" type="submit">Authenticate</Btn>
        <p className="hint center">Demo data: every seeded account uses PIN 1234.</p>
      </form>
    </div>
  )
}

function Shell() {
  const { db, user, logout } = useStore()
  const read = () => location.hash.slice(1) || 'dashboard'
  const [page, setPage] = useState(read)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const onHash = () => { setPage(read()); setMenu(false); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const allowed = MODULES.filter((m) => canAccess(user.role, m.id))
  const current = allowed.find((m) => m.id === page) ? page : 'dashboard'
  const Page = PAGES[current]
  const dock = allowed.slice(0, 4)
  const seed = db.employees.findIndex((e) => e.id === user.id)

  return (
    <div className="app">
      <header className="topbar">
        <Logo small />
        <SoundBtn />
      </header>

      {menu && <div className="backdrop" onClick={() => setMenu(false)} />}
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <div className="side-logo"><Logo /></div>
        <nav aria-label="Main">
          {allowed.map((m, i) => (
            <a key={m.id} href={`#${m.id}`} style={{ '--i': i }} className={`slot ${m.id === current ? 'active' : ''}`}><Icon name={m.id} /> <span>{m.label}</span></a>
          ))}
        </nav>
        <div className="who">
          <div className="who-row"><Orb name={user.name} seed={seed} /><div><b>{user.name}</b><small>{user.role}</small></div></div>
          <div className="row-actions"><Btn onClick={() => { sfx.logout(); logout() }}><Icon name="power" size={16} /> Sign out</Btn><SoundBtn /></div>
        </div>
      </aside>

      <main className="main">
        <Page key={current} />
      </main>

      <nav className="dock" aria-label="Quick navigation">
        {dock.map((m) => (
          <a key={m.id} href={`#${m.id}`} className={m.id === current ? 'active' : ''}><Icon name={m.id} size={22} /><small>{SHORT[m.id] || m.label}</small></a>
        ))}
        <button type="button" className={menu ? 'active' : ''} onClick={() => { sfx.nav(); setMenu(!menu) }} aria-expanded={menu}><Icon name="menu" size={22} /><small>More</small></button>
      </nav>
    </div>
  )
}

const RIPPLE = '.btn, .chip, .seg button, .quick-cash button, .cart-fab, .prod, .icon-btn, .dock a, .dock button'
const HOVER = '.btn, .slot, .prod, .chip, .seg button, .dock a, .dock button'

/** Global pointer effects: click ripples, cursor spotlight, 3D tilt, and sounds. */
function usePointerFx() {
  useEffect(() => {
    let lastHover = 0
    const onClick = (e) => {
      const t = e.target.closest(RIPPLE)
      if (t) {
        const r = t.getBoundingClientRect()
        const dot = document.createElement('span')
        dot.className = 'ripple'
        dot.style.left = `${e.clientX - r.left}px`
        dot.style.top = `${e.clientY - r.top}px`
        t.appendChild(dot)
        setTimeout(() => dot.remove(), 700)
      }
      if (e.target.closest('.slot, .dock a')) sfx.nav()
      else if (e.target.closest('.btn, .chip, .seg button, .quick-cash button, .icon-btn, .x, .cart-fab')) sfx.click()
    }
    const onMove = (e) => {
      const glow = e.target.closest('.panel')
      if (glow) {
        const r = glow.getBoundingClientRect()
        glow.style.setProperty('--mx', `${e.clientX - r.left}px`)
        glow.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
      const tilt = e.target.closest('.tilt')
      if (tilt) {
        const r = tilt.getBoundingClientRect()
        tilt.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`)
        tilt.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`)
      }
    }
    const onLeave = (e) => {
      const tilt = e.target.closest?.('.tilt')
      if (tilt && !tilt.contains(e.relatedTarget)) {
        tilt.style.setProperty('--rx', '0deg')
        tilt.style.setProperty('--ry', '0deg')
      }
    }
    const onOver = (e) => {
      if (e.pointerType !== 'mouse') return
      const t = e.target.closest(HOVER)
      if (!t || t.contains(e.relatedTarget) || t.disabled) return
      const now = performance.now()
      if (now - lastHover > 70) { lastHover = now; sfx.hover() }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onLeave)
    document.addEventListener('pointerover', onOver)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onLeave)
      document.removeEventListener('pointerover', onOver)
    }
  }, [])
}

function Warp({ name }) {
  return (
    <div className="warp" aria-hidden="true">
      <i className="wr w1" /><i className="wr w2" /><i className="wr w3" />
      <div className="warp-text"><small>Access granted</small><b>{name}</b></div>
    </div>
  )
}

function Gate() {
  const { user } = useStore()
  const [warp, setWarp] = useState(null)
  const timer = useRef(0)
  usePointerFx()
  const enter = (name) => {
    setWarp(name)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setWarp(null), 1700)
  }
  return (
    <>
      <Backdrop />
      {user ? <Shell /> : <Login onEnter={enter} />}
      {warp && <Warp name={warp} />}
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </StoreProvider>
  )
}
