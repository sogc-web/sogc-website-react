import { Link } from 'react-router-dom'
import SectionCard from '../components/SectionCard'

const rows = [
  {
    id: 'placeholder-char-dwar',
    title: 'Char Dwar Cycle Yatra',
    status: 'Draft',
    date: 'Annual',
    location: 'Ujjain Sacred Circuit',
  },
]

function EventsPage() {
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
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-4 text-white">{row.title}</td>
                <td className="px-4 py-4 text-[#b7c6bf]">{row.status}</td>
                <td className="px-4 py-4 text-[#b7c6bf]">{row.date}</td>
                <td className="px-4 py-4 text-[#b7c6bf]">{row.location}</td>
                <td className="px-4 py-4">
                  <Link to={`/events/${row.id}/edit`} className="text-[#f8d35c] hover:text-[#ffbf2f]">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  )
}

export default EventsPage
