import { useRef } from 'react'
import { useStore } from '../store'
import { Btn, PageHead, Panel, downloadFile, report, useToast } from '../ui'

export default function Backup() {
  const { act, resetData } = useStore()
  const toast = useToast()
  const file = useRef(null)

  const restore = async (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (!window.confirm('Restoring replaces ALL current data with the backup. Continue?')) return
    report(toast, act.importData(await f.text()), 'Backup restored.')
  }
  const reset = () => {
    if (window.confirm('Reset to the original demo data? Everything you entered will be lost.')) resetData()
  }

  return (
    <>
      <PageHead title="Backup & Recovery" sub="Data lives in this browser. Download regular backups and restore them after a data loss." />
      <div className="two-col">
        <Panel title="Backup">
          <p>Download everything (products, sales, orders, employees, audit log) as one JSON file.</p>
          <Btn variant="green" onClick={() => downloadFile(`bascart-a-backup-${new Date().toLocaleDateString('en-CA')}.json`, act.exportData(), 'application/json')}>Download backup</Btn>
        </Panel>
        <Panel title="Recovery">
          <p>Restore from a backup file previously downloaded here.</p>
          <input ref={file} type="file" accept="application/json" onChange={restore} hidden />
          <Btn onClick={() => file.current.click()}>Restore from file…</Btn>
        </Panel>
        <Panel title="Reset demo data">
          <p>Wipe all data and start again from the sample grocery catalog.</p>
          <Btn variant="red" onClick={reset}>Reset everything</Btn>
        </Panel>
      </div>
    </>
  )
}
