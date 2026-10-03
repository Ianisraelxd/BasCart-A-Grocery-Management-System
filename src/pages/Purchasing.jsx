import { useState } from 'react'
import { fmtDate, peso, useStore } from '../store'
import { Btn, Field, Modal, PageHead, Panel, Status, Table, report, useToast } from '../ui'
import LineItems from './LineItems'

export default function Purchasing() {
  const { db, act } = useStore()
  const toast = useToast()
  const [draft, setDraft] = useState(null)
  const [view, setView] = useState(null)
  const supplier = (id) => db.suppliers.find((s) => s.id === id)?.name ?? id
  const product = (id) => db.products.find((p) => p.id === id)
  const lowItems = () => db.products
    .filter((p) => p.status === 'Active' && p.stock <= p.reorder)
    .map((p) => ({ productId: p.id, qty: Math.max(1, p.reorder * 2 - p.stock), cost: p.cost }))

  const status = (po, s, msg) => report(toast, act.setPOStatus(po.id, s), msg)
  const create = () => {
    if (report(toast, act.createPO(draft), 'Purchase order created.')) setDraft(null)
  }

  return (
    <>
      <PageHead title="Purchasing" sub="Review stock → create PO → send to supplier → receive → record purchase.">
        <Btn variant="green" onClick={() => setDraft({ supplierId: db.suppliers[0]?.id, items: lowItems() })}>+ New purchase order</Btn>
      </PageHead>
      <Panel>
        <Table
          empty="No purchase orders yet. Start one from the low-stock list."
          cols={[
            { label: 'PO', key: 'id' }, { label: 'Supplier', render: (p) => supplier(p.supplierId) },
            { label: 'Created', render: (p) => fmtDate(p.createdAt) },
            { label: 'Items', num: true, render: (p) => p.items.length },
            { label: 'Total', num: true, render: (p) => peso(p.total) },
            { label: 'Status', render: (p) => <Status value={p.status} /> },
            {
              label: '',
              render: (p) => (
                <div className="row-actions">
                  <Btn onClick={() => setView(p)}>View</Btn>
                  {p.status === 'Draft' && <Btn onClick={() => status(p, 'Sent', 'Sent to supplier.')}>Send</Btn>}
                  {p.status === 'Sent' && <Btn variant="green" onClick={() => status(p, 'Received', 'Received. Stock and finance updated.')}>Receive</Btn>}
                  {(p.status === 'Draft' || p.status === 'Sent') && <Btn variant="red" onClick={() => status(p, 'Cancelled', 'Order cancelled.')}>Cancel</Btn>}
                </div>
              ),
            },
          ]}
          rows={db.purchaseOrders}
        />
      </Panel>

      {draft && (
        <Modal title="New purchase order" onClose={() => setDraft(null)} wide>
          <Field label="Supplier">
            <select value={draft.supplierId} onChange={(e) => setDraft({ ...draft, supplierId: e.target.value })}>
              {db.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <p className="hint">Pre-filled with items at or below their reorder level. Edit as needed.</p>
          <LineItems mode="po" products={db.products} items={draft.items} onChange={(items) => setDraft({ ...draft, items })} />
          <div className="row-actions"><Btn variant="green" onClick={create}>Save as draft</Btn><Btn onClick={() => setDraft(null)}>Cancel</Btn></div>
        </Modal>
      )}
      {view && (
        <Modal title={`${view.id} · ${supplier(view.supplierId)}`} onClose={() => setView(null)}>
          <Table
            cols={[
              { label: 'Product', render: (i) => product(i.productId)?.name }, { label: 'Qty', num: true, key: 'qty' },
              { label: 'Unit cost', num: true, render: (i) => peso(i.cost) }, { label: 'Line total', num: true, render: (i) => peso(i.qty * i.cost) },
            ]}
            rows={view.items.map((i, n) => ({ ...i, id: n }))}
          />
          <p>Total <b>{peso(view.total)}</b> · by {view.createdBy}{view.receivedAt && ` · received ${fmtDate(view.receivedAt)}`}</p>
        </Modal>
      )}
    </>
  )
}
