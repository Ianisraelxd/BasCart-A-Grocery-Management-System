import { useState } from 'react'
import { fmtDate, useStore } from '../store'
import { PageHead, Panel, Table } from '../ui'

export default function Audit() {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const rows = db.audit.filter((a) => `${a.user} ${a.action} ${a.entity} ${a.detail}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHead title="Audit Log" sub="Important changes are traced to the user who made them." />
      <Panel>
        <div className="toolbar"><input placeholder="Filter by user, action, entity…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter audit log" /></div>
        <Table
          cols={[
            { label: 'When', render: (a) => fmtDate(a.at) }, { label: 'User', key: 'user' }, { label: 'Action', key: 'action' },
            { label: 'Entity', key: 'entity' }, { label: 'Detail', key: 'detail' },
          ]}
          rows={rows.slice(0, 300)}
        />
      </Panel>
    </>
  )
}
