import { useState } from 'react'
import { fmtDate, peso, useStore } from '../store'
import { Btn, Field, Modal, PageHead, Panel, Status, Table, report, useToast } from '../ui'
import LineItems from './LineItems'

const NEXT = { Pending: 'Preparing', Preparing: 'Out for Delivery', 'Out for Delivery': 'Delivered' }
const NEW = '__new__'

export default function Online() {
  const { db, act } = useStore()
  const toast = useToast()
  const [draft, setDraft] = useState(null)
  const [fresh, setFresh] = useState({ name: '', phone: '', email: '', address: '' })
  const [view, setView] = useState(null)
  const cust = (id) => db.customers.find((c) => c.id === id)
  const sellable = db.products.filter((p) => p.status === 'Active' && p.stock > 0)
  const customers = db.customers.filter((c) => c.id !== 'CUS-1')

  const open = () => {
    setDraft({ customerId: customers[0]?.id ?? NEW, address: customers[0]?.address ?? '', method: 'Cash on Delivery', items: [] })
    setFresh({ name: '', phone: '', email: '', address: '' })
  }
  const pickCustomer = (id) => setDraft({ ...draft, customerId: id, address: cust(id)?.address ?? '' })

  const place = () => {
    let customerId = draft.customerId
    if (customerId === NEW) {
      const c = act.saveCustomer(fresh)
      if (!report(toast, c)) return
      customerId = c.data
    }
    const res = act.placeOrder({ ...draft, customerId, address: draft.customerId === NEW ? fresh.address : draft.address })
    if (report(toast, res, 'Order placed. Stock reserved.')) setDraft(null)
  }
  const advance = (o, s) => report(toast, act.setOrderStatus(o.id, s), `Order ${s.toLowerCase()}.`)

  return (
    <>
      <PageHead title="Online Orders" sub="Validate → reserve stock → prepare & dispatch → update status. Delivery records the sale and payment.">
        <Btn variant="green" onClick={open}>+ New online order</Btn>
      </PageHead>
      <Panel>
        <Table
          empty="No online orders yet."
          cols={[
            { label: 'Order', key: 'id' }, { label: 'Customer', render: (o) => cust(o.customerId)?.name },
            { label: 'Placed', render: (o) => fmtDate(o.createdAt) }, { label: 'Total', num: true, render: (o) => peso(o.total) },
            { label: 'Payment', key: 'method' }, { label: 'Status', render: (o) => <Status value={o.status} /> },
            {
              label: '',
              render: (o) => (
                <div className="row-actions">
                  <Btn onClick={() => setView(o)}>View</Btn>
                  {NEXT[o.status] && <Btn variant="green" onClick={() => advance(o, NEXT[o.status])}>→ {NEXT[o.status]}</Btn>}
                  {NEXT[o.status] && <Btn variant="red" onClick={() => advance(o, 'Cancelled')}>Cancel</Btn>}
                </div>
              ),
            },
          ]}
          rows={db.orders}
        />
      </Panel>

      {draft && (
        <Modal title="New online order" onClose={() => setDraft(null)} wide>
          <div className="form-grid">
            <Field label="Customer">
              <select value={draft.customerId} onChange={(e) => pickCustomer(e.target.value)}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value={NEW}>+ New customer…</option>
              </select>
            </Field>
            <Field label="Payment">
              <select value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value })}>
                {['Cash on Delivery', 'GCash', 'Card'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            {draft.customerId === NEW ? (
              <>
                <Field label="Customer name"><input value={fresh.name} onChange={(e) => setFresh({ ...fresh, name: e.target.value })} /></Field>
                <Field label="Phone"><input value={fresh.phone} onChange={(e) => setFresh({ ...fresh, phone: e.target.value })} /></Field>
                <Field label="Delivery address" wide><input value={fresh.address} onChange={(e) => setFresh({ ...fresh, address: e.target.value })} /></Field>
              </>
            ) : (
              <Field label="Delivery address" wide><input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></Field>
            )}
          </div>
          <LineItems mode="order" products={sellable} items={draft.items} onChange={(items) => setDraft({ ...draft, items })} />
          <div className="row-actions"><Btn variant="green" onClick={place}>Place order</Btn><Btn onClick={() => setDraft(null)}>Cancel</Btn></div>
        </Modal>
      )}
      {view && (
        <Modal title={`${view.id} · ${cust(view.customerId)?.name}`} onClose={() => setView(null)}>
          <p>Deliver to: <b>{view.address}</b></p>
          <Table
            cols={[
              { label: 'Product', render: (i) => db.products.find((p) => p.id === i.productId)?.name }, { label: 'Qty', num: true, key: 'qty' },
            ]}
            rows={view.items.map((i, n) => ({ ...i, id: n }))}
          />
          <h3 className="panel-title" style={{ marginTop: 16 }}>Status history</h3>
          <ul className="history">{view.history.map((h, i) => <li key={i}><Status value={h.status} /> {fmtDate(h.at)} · {h.by}</li>)}</ul>
          <p>Total <b>{peso(view.total)}</b>{view.saleId && ` · recorded as ${view.saleId}`}</p>
        </Modal>
      )}
    </>
  )
}
