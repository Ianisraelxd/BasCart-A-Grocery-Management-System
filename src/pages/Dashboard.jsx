import { dayKey, fmtDate, peso, useStore } from '../store'
import { Count, Panel, PageHead, Table, Status } from '../ui'

export const stockState = (p) => (p.stock === 0 ? 'Out' : p.stock <= p.reorder ? 'Low' : 'OK')

const GOAL = 5000 // daily sales goal shown as an XP bar

export default function Dashboard() {
  const { db, user } = useStore()
  const today = dayKey(new Date().toISOString())
  const todays = db.sales.filter((s) => dayKey(s.at) === today)
  const todayTotal = todays.reduce((s, x) => s + x.total, 0)
  const low = db.products.filter((p) => p.status === 'Active' && p.stock <= p.reorder)
  const openPOs = db.purchaseOrders.filter((p) => p.status === 'Draft' || p.status === 'Sent').length
  const openOrders = db.orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length
  const stockValue = db.products.reduce((s, p) => s + p.stock * p.cost, 0)
  const level = Math.floor(todayTotal / 500)
  const pct = Math.min(100, (todayTotal / GOAL) * 100)

  const kpis = [
    ['💎', 'Sales today', todayTotal, peso, '#5dac38'],
    ['🧾', 'Transactions today', todays.length, undefined, '#6f7fd1'],
    ['⚠️', 'Low / out of stock', low.length, undefined, low.length ? '#d32f2f' : '#5dac38'],
    ['📜', 'Open purchase orders', openPOs, undefined, '#fcdb05'],
    ['📦', 'Open online orders', openOrders, undefined, '#e07ad0'],
    ['🧱', 'Inventory value (cost)', stockValue, peso, '#4be3d6'],
  ]
  const flow = [
    ['Suppliers', db.suppliers.length], ['Inventory', db.products.reduce((s, p) => s + p.stock, 0) + ' units'],
    ['Sales', db.sales.length], ['Finance', db.finance.length + ' records'], ['Reports', 'live'],
  ]

  return (
    <>
      <PageHead title="Dashboard" sub={`Welcome back, ${user.name} (${user.role})`} />

      <Panel className="xp-panel">
        <div className="xp-head"><span>Daily sales goal</span><b>{peso(todayTotal)} / {peso(GOAL)}</b></div>
        <div className="xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(pct)}>
          <div className="xp-fill" style={{ width: `${pct}%` }} />
          <span className="xp-level">{level}</span>
        </div>
      </Panel>

      <div className="kpis">
        {kpis.map(([icon, label, value, fmt, color]) => (
          <div key={label} className="kpi panel" style={{ '--c': color }}>
            <span className="kpi-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
            <strong><Count value={value} format={fmt} /></strong>
          </div>
        ))}
      </div>

      <Panel title="Integrated data flow">
        <div className="chain">
          {flow.map(([name, count], i) => (
            <span key={name} style={{ display: 'contents' }}>
              <span className="step">{name}<small>{count}</small></span>
              {i < flow.length - 1 && <span className="arrow">▶</span>}
            </span>
          ))}
        </div>
      </Panel>

      <div className="two-col">
        <Panel title="Reorder alerts">
          <Table
            empty="All stock levels are healthy."
            cols={[
              { label: 'Product', render: (p) => p.name },
              { label: 'Stock', num: true, render: (p) => p.stock },
              { label: 'Reorder at', num: true, render: (p) => p.reorder },
              { label: 'Status', render: (p) => <Status value={stockState(p)} /> },
            ]}
            rows={low}
          />
        </Panel>
        <Panel title="Recent sales">
          <Table
            empty="No sales yet. Open the Point of Sale to make one."
            cols={[
              { label: 'Receipt', key: 'id' },
              { label: 'When', render: (s) => fmtDate(s.at) },
              { label: 'Channel', key: 'channel' },
              { label: 'Total', num: true, render: (s) => peso(s.total) },
            ]}
            rows={db.sales.slice(0, 6)}
          />
        </Panel>
      </div>
    </>
  )
}
