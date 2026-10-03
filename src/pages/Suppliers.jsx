import { useState } from 'react'
import { useStore } from '../store'
import { Btn, Field, Modal, PageHead, Panel, Table, report, useToast } from '../ui'

const blank = { name: '', contact: '', phone: '', email: '', terms: 'Net 15', supplies: '' }

export default function Suppliers() {
  const { db, act } = useStore()
  const toast = useToast()
  const [edit, setEdit] = useState(null)
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value })
  const save = (e) => {
    e.preventDefault()
    if (report(toast, act.saveSupplier(edit), 'Supplier saved.')) setEdit(null)
  }
  return (
    <>
      <PageHead title="Suppliers" sub="Supplier profiles, contact details, terms, and products supplied.">
        <Btn variant="green" onClick={() => setEdit({ ...blank })}>+ New supplier</Btn>
      </PageHead>
      <Panel>
        <Table
          cols={[
            { label: 'Supplier', key: 'name' }, { label: 'Contact', key: 'contact' },
            { label: 'Phone / Email', render: (s) => [s.phone, s.email].filter(Boolean).join(' · ') },
            { label: 'Terms', key: 'terms' }, { label: 'Supplies', key: 'supplies' },
            { label: '', render: (s) => <Btn onClick={() => setEdit({ ...s })}>Edit</Btn> },
          ]}
          rows={db.suppliers}
        />
      </Panel>
      {edit && (
        <Modal title={edit.id ? 'Edit supplier' : 'New supplier'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="form-grid">
            <Field label="Supplier name"><input value={edit.name} onChange={set('name')} required /></Field>
            <Field label="Contact person"><input value={edit.contact} onChange={set('contact')} /></Field>
            <Field label="Phone"><input value={edit.phone} onChange={set('phone')} /></Field>
            <Field label="Email"><input type="email" value={edit.email} onChange={set('email')} /></Field>
            <Field label="Payment terms"><input value={edit.terms} onChange={set('terms')} /></Field>
            <Field label="Products supplied" wide><input value={edit.supplies} onChange={set('supplies')} /></Field>
            <div className="row-actions wide"><Btn variant="green" type="submit">Save</Btn><Btn onClick={() => setEdit(null)}>Cancel</Btn></div>
          </form>
        </Modal>
      )}
    </>
  )
}
