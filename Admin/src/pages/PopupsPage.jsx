import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SectionCard from '../components/SectionCard'
import { fetchAdminPopups } from '../lib/adminPopup'

function PopupsPage() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    fetchAdminPopups()
      .then((items) => {
        if (!isMounted) return
        setRows(items)
        setStatus('ready')
      })
      .catch(() => {
        if (!isMounted) return
        setRows([])
        setStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <SectionCard
      eyebrow="Popups"
      title="Manage website popups"
      description="Create promotional popups for events, review them, and choose which single popup should appear on the website."
      action={
        <Link
          to="/popup/new"
          className="inline-flex rounded-2xl bg-[#f8d35c] px-4 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f]"
        >
          Add popup
        </Link>
      }
    >
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-[#91a39a]">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Linked event</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-[#0f1513]">
              {status === 'loading' ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-[#b7c6bf]">
                    Loading popups...
                  </td>
                </tr>
              ) : null}
              {status === 'error' ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-[#ffb4a2]">
                    Unable to load popups from the backend right now.
                  </td>
                </tr>
              ) : null}
              {status === 'ready' && rows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-[#b7c6bf]">
                    No popups have been created yet. Add your first popup to get started.
                  </td>
                </tr>
              ) : null}
              {status === 'ready'
                ? rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4 text-white">
                        <Link to={`/popup/${row.id}`} className="hover:text-[#f8d35c]">
                          {row.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-[#b7c6bf]">{row.linkedEventTitle || 'No linked event'}</td>
                      <td className="px-4 py-4 text-[#b7c6bf]">{row.isActive ? 'Live' : 'Inactive'}</td>
                      <td className="px-4 py-4 text-[#b7c6bf]">{new Date(row.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-3">
                          <Link to={`/popup/${row.id}`} className="text-[#b7c6bf] hover:text-white">
                            View
                          </Link>
                          <Link to={`/popup/${row.id}/edit`} className="text-[#f8d35c] hover:text-[#ffbf2f]">
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  )
}

export default PopupsPage
