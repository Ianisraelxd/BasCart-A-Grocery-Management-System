import { useMemo, useState } from 'react'
import { fmtDate, peso, useStore } from '../store'
import { sfx } from '../sfx'
import { Btn, Burst, Field, Modal, PageHead, Panel, catIcon, report, useToast } from '../ui'

export default function Pos() {
  const { db, act } = useStore()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [method, setMethod] = useState('Cash')
  const [tendered, setTendered] = useState('')
  const [ref, setRef] = useState('')
  const [customerId, setCustomerId] = useState('CUS-1')
  const [receipt, setReceipt] = useState(null)

  const active = db.products.filter((p) => p.status === 'Active')
  const cats = ['All', ...new Set(active.map((p) => p.category))]
  const shown = active.filter((p) => (cat === 'All' || p.category === cat) && `${p.name} ${p.code}`.toLowerCase().includes(q.toLowerCase()))
  const lines = useMemo(() => Object.entries(cart).map(([id, qty]) => ({ p: db.products.find((x) => x.id === id), qty })), [cart, db.products])
  const total = lines.reduce((s, l) => s + l.qty * l.p.price, 0)
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const change = method === 'Cash' ? Number(tendered || 0) - total : 0

  const setQty = (p, qty) => {
    if (qty > p.stock) return toast(`Only ${p.stock} ${p.name} in stock.`, 'err')
    setCart((c) => {
      const n = { ...c }
      if (qty <= 0) delete n[p.id]
      else n[p.id] = qty
      return n
    })
  }

  const checkout = () => {
    const res = act.checkout({ items: lines.map((l) => ({ productId: l.p.id, qty: l.qty })), method, ref, tendered: Number(tendered), customerId })
    if (res.ok) {
      sfx.coin()
      setReceipt(res.data)
      setCart({}); setTendered(''); setRef(''); setCartOpen(false)
    } else report(toast, res)
  }

  return (
    <>
      <PageHead title="Point of Sale" sub="Tap products to add them, take payment, and stock updates automatically." />
      <div className="pos">
        <Panel>
          <div className="toolbar">
            <input placeholder="Search name or code…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
          </div>
          <div className="chips" role="tablist" aria-label="Category">
            {cats.map((c) => (
              <button type="button" key={c} role="tab" aria-selected={c === cat} className={`chip ${c === cat ? 'on' : ''}`} onClick={() => setCat(c)}>
                {c !== 'All' && <span aria-hidden="true">{catIcon(c)}</span>} {c}
              </button>
            ))}
          </div>
          <div className="prod-grid">
            {shown.map((p) => {
              const inCart = cart[p.id] || 0
              return (
                <button type="button" key={p.id} className={`prod ${inCart ? 'picked' : ''}`} disabled={p.stock === 0} onClick={() => setQty(p, inCart + 1)}>
                  <span className={`slot-icon ${p.stock === 0 ? 'out' : p.stock <= p.reorder ? 'low' : ''}`} aria-hidden="true">
                    {catIcon(p.category)}
                    <em>{p.stock === 0 ? '0' : p.stock}</em>
                  </span>
                  <b>{p.name}</b>
                  <span className="price">{peso(p.price)}</span>
                  {inCart > 0 && <span className="in-cart" key={inCart}>×{inCart}</span>}
                </button>
              )
            })}
            {shown.length === 0 && <p className="empty">No matching products.</p>}
          </div>
        </Panel>

        {cartOpen && <div className="backdrop sheet-back" onClick={() => setCartOpen(false)} />}
        <Panel title="Cart" className={`cart ${cartOpen ? 'open' : ''}`}>
          <button type="button" className="sheet-handle" onClick={() => setCartOpen(false)} aria-label="Close cart"><i /></button>
          {lines.length === 0 && <p className="empty">Cart is empty. Tap a product to add it.</p>}
          {lines.map(({ p, qty }) => (
            <div key={p.id} className="cart-line">
              <div><b>{p.name}</b><small>{peso(p.price)} each</small></div>
              <div className="qty">
                <button type="button" onClick={() => setQty(p, qty - 1)} aria-label={`Remove one ${p.name}`}>−</button>
                <span key={qty} className="pop">{qty}</span>
                <button type="button" onClick={() => setQty(p, qty + 1)} aria-label={`Add one ${p.name}`}>+</button>
              </div>
              <strong>{peso(qty * p.price)}</strong>
            </div>
          ))}
          <div className="total"><span>TOTAL</span><strong key={total} className="pop">{peso(total)}</strong></div>
          <div className="form-grid">
            <Field label="Customer" wide>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>{db.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </Field>
            <Field label="Payment method" wide>
              <div className="seg" role="radiogroup" aria-label="Payment method">
                {['Cash', 'GCash', 'Card'].map((m) => (
                  <button type="button" key={m} role="radio" aria-checked={m === method} className={m === method ? 'on' : ''} onClick={() => setMethod(m)}>{m}</button>
                ))}
              </div>
            </Field>
            {method === 'Cash'
              ? (
                <Field label="Cash tendered" wide>
                  <input type="number" inputMode="decimal" min="0" value={tendered} onChange={(e) => setTendered(e.target.value)} />
                  <div className="quick-cash">
                    {[total, 100, 500, 1000].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v) => (
                      <button type="button" key={v} onClick={() => setTendered(String(v))}>{v === total ? 'Exact' : `₱${v}`}</button>
                    ))}
                  </div>
                </Field>
              )
              : <Field label={`${method} reference no.`} wide><input value={ref} onChange={(e) => setRef(e.target.value)} /></Field>}
          </div>
          {method === 'Cash' && tendered !== '' && <p className="change">Change: <b className={change >= 0 ? 'gain' : 'loss'}>{change >= 0 ? peso(change) : 'insufficient'}</b></p>}
          <div className="row-actions">
            <Btn variant="green" disabled={!lines.length} onClick={checkout}>Complete sale</Btn>
            <Btn disabled={!lines.length} onClick={() => setCart({})}>Clear</Btn>
          </div>
        </Panel>
      </div>

      {count > 0 && !cartOpen && (
        <button type="button" className="cart-fab" onClick={() => setCartOpen(true)}>
          <span>🛒 {count} item{count > 1 ? 's' : ''}</span><b>{peso(total)}</b>
        </button>
      )}

      {receipt && (
        <Modal title="Sale complete!" onClose={() => setReceipt(null)}>
          <Burst key={receipt.id} />
          <div className="receipt">
            <p className="center"><b>BASCART-A GROCERY STORE</b><br />{receipt.id} · {fmtDate(receipt.at)}<br />Cashier: {receipt.cashier}</p>
            <hr />
            {receipt.lines.map((l) => <div key={l.productId} className="rline"><span>{l.qty} × {l.name}</span><span>{peso(l.qty * l.price)}</span></div>)}
            <hr />
            <div className="rline big"><span>TOTAL</span><span>{peso(receipt.total)}</span></div>
            <div className="rline"><span>{receipt.method}{receipt.method !== 'Cash' && ` (${receipt.ref})`}</span><span>{peso(receipt.tendered)}</span></div>
            {receipt.method === 'Cash' && <div className="rline"><span>Change</span><span>{peso(receipt.change)}</span></div>}
            <p className="center">Thank you for shopping!</p>
          </div>
          <div className="row-actions"><Btn variant="green" onClick={() => setReceipt(null)}>Next customer</Btn><Btn onClick={() => window.print()}>Print</Btn></div>
        </Modal>
      )}
    </>
  )
}
