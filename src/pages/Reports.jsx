import { useMemo, useState } from 'react'
import { dayKey, fmtDate, peso, useStore } from '../store'
import { Btn, Field, PageHead, Panel, Table, downloadFile } from '../ui'

const REPORTS = ['Sales by day', 'Top products', 'Sales by payment method', 'Inventory valuation', 'Low stock', 'Purchasing summary']
const iso = (d) => d.toLocaleDateString('en-CA')

export default function Reports() {
  const { db } = useStore()
  const [type, setType] = useState(REPORTS[0])
  const [from, setFrom] = useState(iso(new Date(Date.now() - 29 * 864e5)))
  const [to, setTo] = useState(iso(new Date()))

  const { cols, rows } = useMemo(() => {
    const sales = db.sales.filter((s) => dayKey(s.at) >= from && dayKey(s.at) <= to)
    const group = (keyFn) => {
      const m = {}
      sales.forEach((s) => { (m[keyFn(s)] ||= []).push(s) })
      return Object.entries(m)
    }
    switch (type) {
      case 'Sales by day':
        return {
          cols: ['Date', 'Transactions', 'Items sold', 'Revenue'],
          rows: group((s) => dayKey(s.at)).sort().map(([k, l]) => [k, l.length, l.reduce((a, s) => a + s.lines.reduce((b, x) => b + x.qty, 0), 0), peso(l.reduce((a, s) => a + s.total, 0))]),
        }
      case 'Top products': {
        const m = {}
        sales.forEach((s) => s.lines.forEach((l) => { const r = (m[l.name] ||= { qty: 0, rev: 0 }); r.qty += l.qty; r.rev += l.qty * l.price }))
        return { cols: ['Product', 'Units sold', 'Revenue'], rows: Object.entries(m).sort((a, b) => b[1].rev - a[1].rev).map(([n, r]) => [n, r.qty, peso(r.rev)]) }
      }
      case 'Sales by payment method':
        return { cols: ['Method', 'Transactions', 'Revenue'], rows: group((s) => s.method).map(([k, l]) => [k, l.length, peso(l.reduce((a, s) => a + s.total, 0))]) }
      case 'Inventory valuation':
        return { cols: ['Code', 'Product', 'On hand', 'Unit cost', 'Value'], rows: db.products.map((p) => [p.code, p.name, p.stock, peso(p.cost), peso(p.stock * p.cost)]) }
      case 'Low stock':
        return { cols: ['Code', 'Product', 'On hand', 'Reorder at', 'Suggested order'], rows: db.products.filter((p) => p.status === 'Active' && p.stock <= p.reorder).map((p) => [p.code, p.name, p.stock, p.reorder, Math.max(1, p.reorder * 2 - p.stock)]) }
      default:
        return {
          cols: ['PO', 'Supplier', 'Created', 'Status', 'Total'],
          rows: db.purchaseOrders.filter((p) => dayKey(p.createdAt) >= from && dayKey(p.createdAt) <= to).map((p) => [p.id, db.suppliers.find((s) => s.id === p.supplierId)?.name, fmtDate(p.createdAt), p.status, peso(p.total)]),
        }
    }
  }, [db, type, from, to])

  const dated = !['Inventory valuation', 'Low stock'].includes(type)
  const exportCsv = () => {
    const esc = (v) => `"${String(v).replaceAll('"', '""')}"`
    downloadFile(`${type.toLowerCase().replaceAll(' ', '-')}.csv`, [cols, ...rows].map((r) => r.map(esc).join(',')).join('\n'), 'text/csv')
  }

  return (
    <>
      <PageHead title="Reports" sub="Management summaries built from live operational data.">
        <Btn onClick={exportCsv} disabled={!rows.length}>Export CSV</Btn>
      </PageHead>
      <Panel>
        <div className="form-grid">
          <Field label="Report"><select value={type} onChange={(e) => setType(e.target.value)}>{REPORTS.map((r) => <option key={r}>{r}</option>)}</select></Field>
          {dated && <Field label="From"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>}
          {dated && <Field label="To"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>}
        </div>
        <Table
          empty="No data for this report and period."
          cols={cols.map((label, i) => ({ label, render: (r) => r.cells[i], num: i > 0 && /^[₱\d]/.test(String(rows[0]?.[i] ?? '')) }))}
          rows={rows.map((cells, id) => ({ id, cells }))}
        />
      </Panel>
    </>
  )
}
