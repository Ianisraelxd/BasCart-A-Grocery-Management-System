import { useState } from 'react'
import { fmtDate, peso, useStore, canAccess } from '../store'
import { Btn, Field, Modal, PageHead, Panel, Status, Table, Tabs, report, useToast } from '../ui'
import { stockState } from './Dashboard'

export default function Inventory() {
  const { db, act, user } = useStore()
  const toast = useToast()
  const [tab, setTab] = useState('Stock levels')
  const [filter, setFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [adj, setAdj] = useState(null)
  const canAdjust = canAccess(user.role, 'products') || user.role === 'Store Manager'
  const name = (id) => db.products.find((p) => p.id === id)?.name ?? id

  const rows = db.products.filter((p) => filter === 'All' || stockState(p) === filter)

  const save = (e) => {
    e.preventDefault()
    if (report(toast, act.adjustStock(adj.id, Number(adj.delta), adj.reason), 'Stock adjusted.')) setAdj(null)
  }

  return (
    <>
      <PageHead title="Inventory" sub="Current stock, reorder monitoring, adjustments, and the full movement history." />
      <Tabs tabs={['Stock levels', 'Movement log']} value={tab} onChange={setTab} />
      {tab === 'Stock levels' ? (
        <Panel>
          <div className="toolbar">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
              {['All', 'OK', 'Low', 'Out'].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <Table
            cols={[
              { label: 'Code', key: 'code' }, { label: 'Product', key: 'name' },
              { label: 'On hand', num: true, render: (p) => `${p.stock} ${p.unit}` },
              { label: 'Reorder at', num: true, key: 'reorder' },
              { label: 'Value (cost)', num: true, render: (p) => peso(p.stock * p.cost) },
              { label: 'Status', render: (p) => <Status value={stockState(p)} /> },
              ...(canAdjust ? [{ label: '', render: (p) => <Btn onClick={() => setAdj({ id: p.id, name: p.name, delta: '', reason: '' })}>Adjust</Btn> }] : []),
            ]}
            rows={rows}
          />
        </Panel>
      ) : (
        <Panel>
          <div className="toolbar">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by movement type">
              {['All', 'Adjustment', 'Sale', 'Purchase Received', 'Online Reserve', 'Order Cancelled', 'Opening Stock'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <span className="hint">Choose "Adjustment" to review the reasons for manual stock changes.</span>
          </div>
          <Table
            empty="No movements match this filter."
            cols={[
              { label: 'When', render: (m) => fmtDate(m.at) }, { label: 'Product', render: (m) => name(m.productId) },
              { label: 'Type', key: 'type' }, { label: 'Change', num: true, render: (m) => <b className={m.qty > 0 ? 'gain' : 'loss'}>{m.qty > 0 ? '+' : ''}{m.qty}</b> },
              { label: 'Balance', num: true, key: 'balance' }, { label: 'Reason', render: (m) => m.reason || (m.type === 'Adjustment' ? m.ref : '—') },
              { label: 'Ref', key: 'ref' }, { label: 'By', key: 'by' },
            ]}
            rows={db.movements.filter((m) => typeFilter === 'All' || m.type === typeFilter).slice(0, 200)}
          />
        </Panel>
      )}
      {adj && (
        <Modal title={`Adjust stock: ${adj.name}`} onClose={() => setAdj(null)}>
          <form onSubmit={save} className="form-grid">
            <Field label="Change (+ add / − remove)"><input type="number" step="1" value={adj.delta} onChange={(e) => setAdj({ ...adj, delta: e.target.value })} required autoFocus /></Field>
            <Field label="Reason (damaged, expired, recount…)" wide><input value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} required /></Field>
            <div className="row-actions wide"><Btn variant="green" type="submit">Apply</Btn><Btn onClick={() => setAdj(null)}>Cancel</Btn></div>
          </form>
        </Modal>
      )}
    </>
  )
}
