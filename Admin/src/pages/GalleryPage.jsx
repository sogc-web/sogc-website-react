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
      description="Create, review, and maintain gallery collections with clear publishing status, visible covers, and quick access to each media library."
      action={
        <Link
          to="/gallery/new"
          className="inline-flex rounded-2xl bg-[#f8d35c] px-4 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f]"
        >
          Add collection
        </Link>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {status === 'loading' ? (
          <StatusCard tone="neutral" message="Loading gallery collections..." />
        ) : null}
        {status === 'error' ? (
          <StatusCard tone="error" message="Unable to load gallery collections from the backend right now." />
        ) : null}
        {status === 'ready' && rows.length === 0 ? (
          <StatusCard
            tone="neutral"
            message="No gallery collections have been added yet. Create your first collection to begin managing the gallery library."
          />
        ) : null}
        {status === 'ready'
          ? rows.map((collection) => {
              const cover = resolveCollectionCover(collection)

              return (
                <Link
                  key={collection.id}
                  to={`/gallery/${collection.id}/edit`}
                  className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 transition hover:border-[#f8d35c]/30 hover:bg-white/[0.07]"
                >
                  <div className="relative aspect-[16/10] bg-[#0f1513]">
                    {cover ? (
                      cover.type === 'video' ? (
                        <video
                          src={cover.secureUrl || cover.url}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={cover.secureUrl || cover.url}
                          alt={cover.alt || collection.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#91a39a]">
                        No cover selected
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#07100d] via-[#07100d]/20 to-transparent" />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#f8d35c]/20 bg-[#10170f]/90 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#f8d35c]">
                        {collection.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <span className="rounded-full border border-white/10 bg-[#07100d]/90 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                        {cover ? 'Cover ready' : 'No cover'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.25em] text-[#91a39a]">
                        {collection.eyebrow || 'Gallery collection'}
                      </p>
                      <h3 className="text-2xl font-semibold text-white">{collection.title}</h3>
                      <p className="line-clamp-3 text-sm leading-6 text-[#b7c6bf]">
                        {collection.summary || 'No collection summary has been added yet.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-[#91a39a]">
                      <MetricTile label="Media files" value={collection.mediaCount ?? 0} />
                      <MetricTile label="Library size" value={formatBytes(collection.totalBytes)} />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs text-[#91a39a]">
                        Updated {formatDateTime(collection.updatedAt)}
                      </p>
                      <span className="inline-flex text-sm font-medium text-[#f8d35c] transition group-hover:text-[#ffbf2f]">
                        Open collection
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })
          : null}
      </div>
    </SectionCard>
  )
}

function resolveCollectionCover(collection) {
  const media = Array.isArray(collection?.media) ? collection.media : []

  if (!media.length) {
    return null
  }

  if (collection?.coverMediaId) {
    const matched = media.find((item) => item.id === collection.coverMediaId)

    if (matched) {
      return matched
    }
  }

  return media.find((item) => item.type === 'image') ?? media[0] ?? null
}

function StatusCard({ message, tone }) {
  const className =
    tone === 'error'
      ? 'rounded-[24px] border border-[#ffb4a2]/20 bg-[#5a2318]/20 p-5 text-sm text-[#ffd5ca]'
      : 'rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-[#b7c6bf]'

  return <article className={className}>{message}</article>
}

function MetricTile({ label, value }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[#0f1513] px-3 py-3">
      <span className="block uppercase tracking-[0.18em]">{label}</span>
      <span className="mt-2 block text-sm text-white">{value}</span>
    </div>
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
