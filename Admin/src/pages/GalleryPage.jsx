import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SectionCard from '../components/SectionCard'
import { fetchAdminGalleryCollections } from '../lib/adminGallery'

function GalleryPage() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    fetchAdminGalleryCollections()
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
      eyebrow="Gallery"
      title="Manage gallery collections"
      description="Create, review, and maintain gallery collections with clear publishing status, media totals, and quick access to each library."
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
        {status === 'loading' ? (
          <article className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-[#b7c6bf]">
            Loading gallery collections...
          </article>
        ) : null}
        {status === 'error' ? (
          <article className="rounded-[24px] border border-[#ffb4a2]/20 bg-[#5a2318]/20 p-5 text-sm text-[#ffd5ca]">
            Unable to load gallery collections from the backend right now.
          </article>
        ) : null}
        {status === 'ready' && rows.length === 0 ? (
          <article className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-[#b7c6bf]">
            No gallery collections have been added yet. Create your first collection to begin managing the gallery library.
          </article>
        ) : null}
        {status === 'ready'
          ? rows.map((collection) => (
              <article
                key={collection.id}
                className="rounded-[24px] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">
                      {collection.isPublished ? 'Published' : 'Draft'}
                    </p>
                    <h3 className="mt-3 text-xl font-medium text-white">{collection.title}</h3>
                    <p className="mt-2 text-sm text-[#91a39a]">
                      {collection.eyebrow || 'Gallery collection'}
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-[#0f1513] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                    {collection.coverMediaId ? 'Cover set' : 'No cover'}
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#b7c6bf]">
                  {collection.summary || 'No collection summary has been added yet.'}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#91a39a]">
                  <div className="rounded-[18px] border border-white/10 bg-[#0f1513] px-3 py-3">
                    <span className="block uppercase tracking-[0.18em]">Media files</span>
                    <span className="mt-2 block text-sm text-white">{collection.mediaCount ?? 0}</span>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-[#0f1513] px-3 py-3">
                    <span className="block uppercase tracking-[0.18em]">Library size</span>
                    <span className="mt-2 block text-sm text-white">{formatBytes(collection.totalBytes)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="text-xs text-[#91a39a]">
                    Updated {formatDateTime(collection.updatedAt)}
                  </p>
                  <Link
                    to={`/gallery/${collection.id}/edit`}
                    className="inline-flex text-sm font-medium text-[#f8d35c] hover:text-[#ffbf2f]"
                  >
                    Open collection
                  </Link>
                </div>
              </article>
            ))
          : null}
      </div>
    </SectionCard>
  )
}

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0)

  if (size <= 0) {
    return '0 MB'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** unitIndex

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
}

function formatDateTime(value) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return 'recently'
  }
}

export default GalleryPage
