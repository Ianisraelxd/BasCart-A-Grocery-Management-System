import { peso } from '../store'
import { Btn } from '../ui'

/** Editable list of {productId, qty, cost?} rows used by purchase orders and online orders. */
export default function LineItems({ products, items, onChange, mode }) {
  const upd = (i, patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)))
  const addRow = () => {
    const p = products[0]
    if (p) onChange([...items, { productId: p.id, qty: 1, cost: p.cost }])
  }
  const total = items.reduce((s, it) => {
    const p = products.find((x) => x.id === it.productId)
    return s + Number(it.qty || 0) * (mode === 'po' ? Number(it.cost || 0) : p?.price || 0)
  }, 0)

  return (
    <div className="lines">
      {items.map((it, i) => (
        <div className="line-row" key={i}>
          <select
            value={it.productId}
            aria-label="Product"
            onChange={(e) => upd(i, { productId: e.target.value, cost: products.find((p) => p.id === e.target.value)?.cost })}
          >
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}{mode === 'order' ? ` (${p.stock} in stock)` : ''}</option>)}
          </select>
          <input type="number" min="1" step="1" value={it.qty} aria-label="Quantity" onChange={(e) => upd(i, { qty: Number(e.target.value) })} />
          {mode === 'po' && <input type="number" min="0" step="0.01" value={it.cost} aria-label="Unit cost" onChange={(e) => upd(i, { cost: Number(e.target.value) })} />}
          <button type="button" className="x" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove line">✕</button>
        </div>
      ))}
      <div className="row-actions">
        <Btn onClick={addRow}>+ Add item</Btn>
        <strong className="line-total">Total: {peso(total)}</strong>
      </div>
    </div>
  )
}
