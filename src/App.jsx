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
const HUES = [210, 262, 330, 150, 30, 190]

function Logo({ small, mark }) {
  return (
    <div className={`logo ${small ? 'small' : ''}`}>
      <span className="app-icon">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 5.5l9 5.2v10.6L16 26.5l-9-5.2V10.7z" />
          <circle cx="16" cy="16" r="3.2" fill="currentColor" stroke="none" />
        </svg>
      </span>
      {!mark && <span className="wordmark">BasCart<b>-A</b></span>}
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
      <form key={shake} className={`panel login-card ${shake ? 'denied' : ''}`} onSubmit={submit}>
        <div className="login-head">
          <Logo mark />
          <h1>BasCart-A</h1>
          <p>Grocery management. Sign in to continue.</p>
        </div>
        <Field label="Employee">
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {db.employees.filter((e) => e.status === 'Active').map((e) => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
          </select>
        </Field>
        <Field label="PIN">
          <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} placeholder="4 digits" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); sfx.tick() }} required />
        </Field>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Btn variant="green" type="submit">Sign in</Btn>
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

const HOVER = '.btn, .slot, .prod, .chip, .seg button, .dock a, .dock button'

/** Global pointer effects: soft cursor highlight on glass, and sounds. */
function usePointerFx() {
  useEffect(() => {
    let lastHover = 0
    const onClick = (e) => {
      if (e.target.closest('.slot, .dock a')) sfx.nav()
      else if (e.target.closest('.btn, .chip, .seg button, .quick-cash button, .icon-btn, .x, .cart-fab')) sfx.click()
    }
    const onMove = (e) => {
      const glass = e.target.closest('.panel')
      if (glass) {
        const r = glass.getBoundingClientRect()
        glass.style.setProperty('--mx', `${e.clientX - r.left}px`)
        glass.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
    }
    const onOver = (e) => {
      if (e.pointerType !== 'mouse') return
      const t = e.target.closest(HOVER)
      if (!t || t.contains(e.relatedTarget) || t.disabled) return
      const now = performance.now()
      if (now - lastHover > 80) { lastHover = now; sfx.hover() }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
    }
  }, [])
}

function Welcome({ name }) {
  return (
    <div className="welcome" aria-hidden="true">
      <div className="welcome-card">
        <span className="welcome-check"><Icon name="check" size={30} /></span>
        <small>Welcome back</small>
        <b>{name}</b>
      </div>
    </div>
  )
}

function Gate() {
  const { user } = useStore()
  const [welcome, setWelcome] = useState(null)
  const timer = useRef(0)
  usePointerFx()
  const enter = (name) => {
    setWelcome(name)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setWelcome(null), 1500)
  }
  return (
    <>
      <Backdrop />
      {user ? <Shell /> : <Login onEnter={enter} />}
      {welcome && <Welcome name={welcome} />}
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
