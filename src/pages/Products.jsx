import { useState } from 'react'
import { peso, useStore } from '../store'
import { Btn, Field, Modal, PageHead, Panel, Status, Table, report, useToast } from '../ui'

const blank = { code: '', name: '', category: '', unit: 'pc', cost: '', price: '', stock: 0, reorder: 10, status: 'Active' }

export default function Products() {
  const { db, act } = useStore()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null)
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value })
  const rows = db.products.filter((p) => `${p.name} ${p.code} ${p.category}`.toLowerCase().includes(q.toLowerCase()))

  const save = (e) => {
    e.preventDefault()
    if (report(toast, act.saveProduct(edit), edit.id ? 'Product updated.' : 'Product created.')) setEdit(null)
  }

  return (
    <>
      <PageHead title="Products" sub="Master data for everything BasCart-A sells. Products are deactivated, never deleted, to keep records traceable.">
        <Btn variant="green" onClick={() => setEdit({ ...blank })}>+ New product</Btn>
      </PageHead>
      <Panel>
        <div className="toolbar"><input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" /></div>
        <Table
          cols={[
            { label: 'Code', key: 'code' }, { label: 'Name', key: 'name' }, { label: 'Category', key: 'category' }, { label: 'Unit', key: 'unit' },
            { label: 'Cost', num: true, render: (p) => peso(p.cost) }, { label: 'Price', num: true, render: (p) => peso(p.price) },
            { label: 'Stock', num: true, key: 'stock' }, { label: 'Status', render: (p) => <Status value={p.status} /> },
            { label: '', render: (p) => <Btn onClick={() => setEdit({ ...p })}>Edit</Btn> },
          ]}
          rows={rows}
        />
      </Panel>
      {edit && (
        <Modal title={edit.id ? `Edit ${edit.code}` : 'New product'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="form-grid">
            <Field label="Product code"><input value={edit.code} onChange={set('code')} required /></Field>
            <Field label="Name"><input value={edit.name} onChange={set('name')} required /></Field>
            <Field label="Category"><input value={edit.category} onChange={set('category')} list="cats" /></Field>
            <datalist id="cats">{[...new Set(db.products.map((p) => p.category))].map((c) => <option key={c} value={c} />)}</datalist>
            <Field label="Unit"><input value={edit.unit} onChange={set('unit')} /></Field>
            <Field label="Unit cost (₱)"><input type="number" step="0.01" min="0" value={edit.cost} onChange={set('cost')} required /></Field>
            <Field label="Selling price (₱)"><input type="number" step="0.01" min="0.01" value={edit.price} onChange={set('price')} required /></Field>
            {!edit.id && <Field label="Opening stock"><input type="number" min="0" value={edit.stock} onChange={set('stock')} /></Field>}
            <Field label="Reorder level"><input type="number" min="0" value={edit.reorder} onChange={set('reorder')} required /></Field>
            <Field label="Status"><select value={edit.status} onChange={set('status')}><option>Active</option><option>Inactive</option></select></Field>
            <div className="row-actions wide"><Btn variant="green" type="submit">Save</Btn><Btn onClick={() => setEdit(null)}>Cancel</Btn></div>
          </form>
        </Modal>
      )}
    </>
  )
}
