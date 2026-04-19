import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SectionCard from '../components/SectionCard'
import { fetchAdminEvents } from '../lib/adminEvents'

function EventsPage() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    fetchAdminEvents()
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
      eyebrow="Events"
      title="Manage event records"
      description="These rows are placeholders for the Mongo-backed event list. Publish state, order, cover image, and detail copy should be managed here."
      action={
        <Link
          to="/events/new"
          className="inline-flex rounded-2xl bg-[#f8d35c] px-4 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f]"
        >
          Add event
        </Link>
      }
    >
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-[#91a39a]">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-[#0f1513]">
            {status === 'loading' ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-[#b7c6bf]">
                  Loading events...
                </td>
              </tr>
            ) : null}
            {status === 'error' ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-[#ffb4a2]">
                  Unable to load events from the backend right now.
                </td>
              </tr>
            ) : null}
            {status === 'ready' && rows.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-[#b7c6bf]">
                  No admin-managed events yet. Create the first one to test the full flow.
                </td>
              </tr>
            ) : null}
            {status === 'ready' ? rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-4 text-white">
                  <Link to={`/events/${row.id}`} className="hover:text-[#f8d35c]">
                    {row.title}
                  </Link>
                </td>
                <td className="px-4 py-4 text-[#b7c6bf]">{row.isPublished ? 'Published' : 'Draft'}</td>
                <td className="px-4 py-4 text-[#b7c6bf]">{row.date}</td>
                <td className="px-4 py-4 text-[#b7c6bf]">{row.location}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-3">
                    <Link to={`/events/${row.id}`} className="text-[#b7c6bf] hover:text-white">
                      View
                    </Link>
                    <Link to={`/events/${row.id}/edit`} className="text-[#f8d35c] hover:text-[#ffbf2f]">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            )) : null}
          </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  )
}

export default EventsPage
