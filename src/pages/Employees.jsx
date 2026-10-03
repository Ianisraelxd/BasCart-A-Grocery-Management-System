import { useState } from 'react'
import { ROLES, useStore } from '../store'
import { Btn, Field, Modal, PageHead, Panel, Status, Table, report, useToast } from '../ui'

const blank = { name: '', role: 'Cashier', status: 'Active', schedule: 'Mon–Fri 8AM–5PM', pin: '' }

export default function Employees() {
  const { db, act, user } = useStore()
  const toast = useToast()
  const [edit, setEdit] = useState(null)
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value })
  const save = (e) => {
    e.preventDefault()
    if (report(toast, act.saveEmployee(edit), 'Employee saved.')) setEdit(null)
  }
  return (
    <>
      <PageHead title="Employees" sub="Employee identity, role, schedule, and status. The role decides which modules a person can open.">
        <Btn variant="green" onClick={() => setEdit({ ...blank })}>+ New employee</Btn>
      </PageHead>
      <Panel>
        <Table
          cols={[
            { label: 'ID', key: 'id' }, { label: 'Name', render: (e) => `${e.name}${e.id === user.id ? ' (you)' : ''}` }, { label: 'Role', key: 'role' },
            { label: 'Schedule', key: 'schedule' }, { label: 'Status', render: (e) => <Status value={e.status} /> },
            { label: '', render: (e) => <Btn onClick={() => setEdit({ ...e })}>Edit</Btn> },
          ]}
          rows={db.employees}
        />
      </Panel>
      {edit && (
        <Modal title={edit.id ? 'Edit employee' : 'New employee'} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="form-grid">
            <Field label="Full name"><input value={edit.name} onChange={set('name')} required /></Field>
            <Field label="Role"><select value={edit.role} onChange={set('role')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Schedule"><input value={edit.schedule} onChange={set('schedule')} /></Field>
            <Field label="Status"><select value={edit.status} onChange={set('status')}><option>Active</option><option>Inactive</option></select></Field>
            <Field label="4-digit PIN"><input value={edit.pin} onChange={set('pin')} inputMode="numeric" maxLength={4} required /></Field>
            <div className="row-actions wide"><Btn variant="green" type="submit">Save</Btn><Btn onClick={() => setEdit(null)}>Cancel</Btn></div>
          </form>
        </Modal>
      )}
    </>
  )
}
