import { useState } from 'react'
import { fmtDate, peso, useStore } from '../store'
import { Badge, Btn, Modal, PageHead, Panel, Table } from '../ui'

export default function Sales() {
  const { db } = useStore()
  const [channel, setChannel] = useState('All')
  const [view, setView] = useState(null)
  const cust = (id) => db.customers.find((c) => c.id === id)?.name ?? '—'
  const rows = db.sales.filter((s) => channel === 'All' || s.channel === channel)
  return (
    <>
      <PageHead title="Sales" sub="Every store and online sale with its items, payment, and cashier." />
      <Panel>
        <div className="toolbar">
          <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Channel">{['All', 'Store', 'Online'].map((c) => <option key={c}>{c}</option>)}</select>
          <span className="hint">{rows.length} transactions · {peso(rows.reduce((s, x) => s + x.total, 0))}</span>
        </div>
        <Table
          empty="No sales yet."
          cols={[
            { label: 'Receipt', key: 'id' }, { label: 'When', render: (s) => fmtDate(s.at) },
            { label: 'Channel', render: (s) => <Badge kind={s.channel === 'Store' ? 'blue' : 'purple'}>{s.channel}</Badge> },
            { label: 'Customer', render: (s) => cust(s.customerId) }, { label: 'Cashier', key: 'cashier' }, { label: 'Payment', key: 'method' },
            { label: 'Total', num: true, render: (s) => peso(s.total) },
            { label: '', render: (s) => <Btn onClick={() => setView(s)}>View</Btn> },
          ]}
          rows={rows}
        />
      </Panel>
      {view && (
        <Modal title={view.id} onClose={() => setView(null)}>
          <Table
            cols={[
              { label: 'Item', key: 'name' }, { label: 'Qty', num: true, key: 'qty' },
              { label: 'Price', num: true, render: (l) => peso(l.price) }, { label: 'Total', num: true, render: (l) => peso(l.qty * l.price) },
            ]}
            rows={view.lines.map((l) => ({ ...l, id: l.productId }))}
          />
          <p>Total <b>{peso(view.total)}</b> · {view.method} · {fmtDate(view.at)}</p>
        </Modal>
      )}
    </>
  )
}
