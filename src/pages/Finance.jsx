import { useState } from 'react'
import { fmtDate, peso, useStore } from '../store'
import { PageHead, Panel, Status, Table, Tabs } from '../ui'

export default function Finance() {
  const { db } = useStore()
  const [tab, setTab] = useState('Ledger')
  const revenue = db.finance.filter((f) => f.type === 'Revenue').reduce((s, f) => s + f.amount, 0)
  const expense = db.finance.filter((f) => f.type === 'Expense').reduce((s, f) => s + f.amount, 0)
  const pending = db.payments.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0)
  const kpis = [['Revenue', peso(revenue), '#5dac38'], ['Expenses', peso(expense), '#d32f2f'], ['Net', peso(revenue - expense), '#4be3d6'], ['Pending payments', peso(pending), '#fcdb05']]
  return (
    <>
      <PageHead title="Finance" sub="Revenue and expense records created automatically by sales and received purchases." />
      <div className="kpis">
        {kpis.map(([l, v, c]) => <div key={l} className="kpi panel" style={{ '--c': c }}><span>{l}</span><strong>{v}</strong></div>)}
      </div>
      <Tabs tabs={['Ledger', 'Payments']} value={tab} onChange={setTab} />
      <Panel>
        {tab === 'Ledger' ? (
          <Table
            empty="No financial records yet."
            cols={[
              { label: 'When', render: (f) => fmtDate(f.at) }, { label: 'Type', render: (f) => <Status value={f.type} /> },
              { label: 'Description', key: 'desc' }, { label: 'Ref', key: 'ref' }, { label: 'Amount', num: true, render: (f) => peso(f.amount) },
            ]}
            rows={db.finance}
          />
        ) : (
          <Table
            empty="No payments yet."
            cols={[
              { label: 'Payment', key: 'id' }, { label: 'When', render: (p) => fmtDate(p.at) }, { label: 'Method', key: 'method' },
              { label: 'Reference', key: 'ref' }, { label: 'Amount', num: true, render: (p) => peso(p.amount) }, { label: 'Status', render: (p) => <Status value={p.status} /> },
            ]}
            rows={db.payments}
          />
        )}
      </Panel>
    </>
  )
}
