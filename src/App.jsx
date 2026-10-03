import { useEffect, useState } from 'react'
import './App.css'
import { MODULES, StoreProvider, canAccess, useStore } from './store'
import { Btn, Field, ToastProvider } from './ui'
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
const HAIR = ['#3b2a1a', '#1b1b1b', '#5a3a1a', '#6b3b12', '#2a1a0a', '#8a5a2b']

export function Head({ seed = 0, size = 40 }) {
  return <span className="head" style={{ '--hair': HAIR[seed % HAIR.length], width: size, height: size }} aria-hidden="true" />
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
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

function Login() {
  const { db, login } = useStore()
  const [id, setId] = useState(db.employees.find((e) => e.status === 'Active')?.id ?? '')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const res = login(id, pin)
    if (res.ok) sfx.levelUp()
    else { setError(res.error); setPin(''); sfx.err() }
  }
  return (
    <div className="login">
      <div className="sun" aria-hidden="true" />
      <div className="cloud c1" aria-hidden="true" /><div className="cloud c2" aria-hidden="true" /><div className="cloud c3" aria-hidden="true" />
      <div className="drops" aria-hidden="true"><span>🍎</span><span>🥛</span><span>🍞</span><span>🧀</span></div>
      <form className="panel login-card" onSubmit={submit}>
        <h1 className="logo">BasCart<span>-A</span></h1>
        <p className="center tagline">Grocery Management System</p>
        <Field label="Who's playing?">
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {db.employees.filter((e) => e.status === 'Active').map((e) => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
          </select>
        </Field>
        <Field label="4-digit PIN">
          <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} required />
        </Field>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Btn variant="green" type="submit">Enter store</Btn>
        <p className="hint center">Demo data: every seeded account uses PIN 1234.</p>
      </form>
      <div className="ground" aria-hidden="true" />
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
  const hotbar = allowed.slice(0, 4)
  const seed = db.employees.findIndex((e) => e.id === user.id)

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo small">BasCart<span>-A</span></span>
        <SoundBtn />
      </header>

      {menu && <div className="backdrop" onClick={() => setMenu(false)} />}
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <div className="logo small side-logo">BasCart<span>-A</span></div>
        <nav aria-label="Main">
          {allowed.map((m) => (
            <a key={m.id} href={`#${m.id}`} className={`slot ${m.id === current ? 'active' : ''}`}><span aria-hidden="true">{m.icon}</span> {m.label}</a>
          ))}
        </nav>
        <div className="who">
          <div className="who-row"><Head seed={seed} /><div><b>{user.name}</b><small>{user.role}</small></div></div>
          <div className="row-actions"><Btn onClick={logout}>Sign out</Btn><SoundBtn /></div>
        </div>
      </aside>

      <main className="main">
        <Page key={current} />
      </main>

      <nav className="hotbar" aria-label="Quick navigation">
        {hotbar.map((m) => (
          <a key={m.id} href={`#${m.id}`} className={m.id === current ? 'active' : ''}><span aria-hidden="true">{m.icon}</span><small>{SHORT[m.id] || m.label}</small></a>
        ))}
        <button type="button" className={menu ? 'active' : ''} onClick={() => { sfx.nav(); setMenu(!menu) }} aria-expanded={menu}><span aria-hidden="true">☰</span><small>More</small></button>
      </nav>
    </div>
  )
}

function Gate() {
  const { user } = useStore()
  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest('.slot, .hotbar a')) sfx.nav()
      else if (e.target.closest('.mc-btn, .prod, .qty button, .x, .icon-btn, .cart-fab')) sfx.click()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return user ? <Shell /> : <Login />
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
