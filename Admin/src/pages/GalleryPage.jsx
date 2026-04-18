import { Link } from 'react-router-dom'
import SectionCard from '../components/SectionCard'

const collections = [
  { id: 'char-dwar-2024', title: 'Char Dwar 2024', items: 0, status: 'Draft' },
]

function GalleryPage() {
  return (
    <SectionCard
      eyebrow="Gallery"
      title="Manage gallery collections"
      description="Collections and media should come from MongoDB instead of local folder scanning. This screen is the control point for cover media, visibility, and ordering."
      action={
        <Link
          to="/gallery/new"
          className="inline-flex rounded-2xl bg-[#f8d35c] px-4 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f]"
        >
          Add collection
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => (
          <article key={collection.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">{collection.status}</p>
            <h3 className="mt-3 text-xl font-medium text-white">{collection.title}</h3>
            <p className="mt-2 text-sm text-[#b7c6bf]">{collection.items} media items connected</p>
            <Link to={`/gallery/${collection.id}/edit`} className="mt-5 inline-flex text-sm text-[#f8d35c] hover:text-[#ffbf2f]">
              Edit collection
            </Link>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}

export default GalleryPage
