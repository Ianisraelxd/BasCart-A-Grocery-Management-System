import { dayKey, fmtDate, peso, useStore } from '../store'
import { Clock, Gauge, Spark } from '../fx'
import { Icon } from '../icons'
import { Count, Panel, PageHead, Table, Status } from '../ui'

export const stockState = (p) => (p.stock === 0 ? 'Out' : p.stock <= p.reorder ? 'Low' : 'OK')

const GOAL = 5000 // daily sales goal shown on the gauge

export default function Dashboard() {
  const { db, user } = useStore()
  const now = Date.now()
  const today = dayKey(new Date(now).toISOString())
  const todays = db.sales.filter((s) => dayKey(s.at) === today)
  const todayTotal = todays.reduce((s, x) => s + x.total, 0)
  const low = db.products.filter((p) => p.status === 'Active' && p.stock <= p.reorder)
  const openPOs = db.purchaseOrders.filter((p) => p.status === 'Draft' || p.status === 'Sent').length
  const openOrders = db.orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length
  const stockValue = db.products.reduce((s, p) => s + p.stock * p.cost, 0)

  const days = Array.from({ length: 7 }, (_, i) => new Date(now - (6 - i) * 864e5))
  const series = days.map((d) => db.sales.filter((s) => dayKey(s.at) === dayKey(d.toISOString())).reduce((t, s) => t + s.total, 0))
  const labels = days.map((d) => d.toLocaleDateString('en-PH', { weekday: 'short' }))

  const kpis = [
    ['sales', 'Sales today', todayTotal, peso, '#007aff'],
    ['receipt', 'Transactions today', todays.length, undefined, '#5856d6'],
    ['alert', 'Low / out of stock', low.length, undefined, low.length ? '#ff3b30' : '#34c759'],
    ['purchasing', 'Open purchase orders', openPOs, undefined, '#ff9500'],
    ['online', 'Open online orders', openOrders, undefined, '#ff2d55'],
    ['inventory', 'Inventory value (cost)', stockValue, peso, '#30b0c7'],
  ]
  const flow = [
    ['Suppliers', db.suppliers.length], ['Inventory', db.products.reduce((s, p) => s + p.stock, 0) + ' units'],
    ['Sales', db.sales.length], ['Finance', db.finance.length + ' records'], ['Reports', 'live'],
  ]

  return (
    <>
      <PageHead title="Dashboard" sub={`Welcome back, ${user.name} · ${user.role}`}>
        <Clock />
      </PageHead>

      <div className="two-col hero-row">
        <Panel title="Daily sales goal">
          <Gauge value={todayTotal / GOAL} label="of goal" sub={`${peso(todayTotal)} of ${peso(GOAL)}`} />
        </Panel>
        <Panel title="Sales, last 7 days">
          <Spark data={series} labels={labels} />
        </Panel>
      </div>

      <div className="kpis">
        {kpis.map(([icon, label, value, fmt, color]) => (
          <div key={label} className="kpi panel" style={{ '--c': color }}>
            <span className="kpi-icon"><Icon name={icon} size={22} /></span>
            <span className="kpi-label">{label}</span>
            <strong><Count value={value} format={fmt} /></strong>
          </div>
        ))}
      </div>

      <Panel title="Integrated data flow">
        <div className="chain">
          {flow.map(([name, count], i) => (
            <span key={name} style={{ display: 'contents' }}>
              <span className="step">{name}<small>{count}</small></span>
              {i < flow.length - 1 && <span className="link" aria-hidden="true"><i /></span>}
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
