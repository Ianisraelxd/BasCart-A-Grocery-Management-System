import { useState } from 'react'
import { peso, useStore } from '../store'
import { Btn, Field, Modal, PageHead, Panel, Table, report, useToast } from '../ui'

const blank = { name: '', phone: '', email: '', address: '' }

export default function Customers() {
  const { db, act } = useStore()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null)
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value })
  const spent = (id) => db.sales.filter((s) => s.customerId === id).reduce((t, s) => t + s.total, 0)
  const rows = db.customers.filter((c) => `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q.toLowerCase()))
  const save = (e) => {
    e.preventDefault()
    if (report(toast, act.saveCustomer(edit), 'Customer saved.')) setEdit(null)
  }
  return (
    <>
      <PageHead title="Customers" sub="Only the details needed to serve customers are collected (data privacy rule).">
        <Btn variant="green" onClick={() => setEdit({ ...blank })}>+ New customer</Btn>
      </PageHead>
      <Panel>
        <div className="toolbar"><input placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" /></div>
        <Table
          cols={[
            { label: 'Name', key: 'name' }, { label: 'Phone', key: 'phone' }, { label: 'Email', key: 'email' }, { label: 'Address', key: 'address' },
            { label: 'Total purchases', num: true, render: (c) => peso(spent(c.id)) },
            { label: '', render: (c) => c.id !== 'CUS-1' && <Btn onClick={() => setEdit({ ...c })}>Edit</Btn> },
          ]}
          rows={rows}
        />
      </Panel>
      {edit && (
        <Modal title={edit.id ? 'Edit customer' : 'New customer'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="form-grid">
            <Field label="Name"><input value={edit.name} onChange={set('name')} required /></Field>
            <Field label="Phone"><input value={edit.phone} onChange={set('phone')} /></Field>
            <Field label="Email"><input type="email" value={edit.email} onChange={set('email')} /></Field>
            <Field label="Address" wide><input value={edit.address} onChange={set('address')} /></Field>
            <div className="row-actions wide"><Btn variant="green" type="submit">Save</Btn><Btn onClick={() => setEdit(null)}>Cancel</Btn></div>
          </form>
        </Modal>
      )}
    </>
  )
}
