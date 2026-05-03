import { PUBLIC_API_BASE_URL } from '../lib/env'

function getFileNameFromUrl(url = '') {
  const normalized = String(url || '').split('?')[0]
  const segments = normalized.split('/')
  return segments[segments.length - 1] || 'media'
}

function normalizeMediaItem(item) {
  const src = item?.secureUrl || item?.url || ''
  const type = item?.type === 'video' ? 'video' : 'image'

  return {
    id: item?.id || src,
    src,
    fileName: getFileNameFromUrl(src),
    type,
    alt: item?.alt || '',
    caption: item?.caption || '',
  }
}

function chooseCover(collection) {
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

function normalizeCollection(collection) {
  const media = (Array.isArray(collection?.media) ? collection.media : [])
    .filter((item) => (item?.secureUrl || item?.url) && item?.isPublished !== false)
    .map(normalizeMediaItem)
  const cover = chooseCover({
    coverMediaId: collection?.coverMediaId,
    media,
  })

  return {
    id: collection?.id || collection?.slug || '',
    slug: collection?.slug || '',
    title: collection?.title || '',
    eyebrow: collection?.eyebrow || '',
    summary: collection?.summary || '',
    cover,
    media,
  }
}

export async function fetchAdminGalleryCollections(signal) {
  const response = await fetch(`${PUBLIC_API_BASE_URL}/api/gallery`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch gallery collections: ${response.status}`)
  }

  const payload = await response.json().catch(() => null)
  const items = Array.isArray(payload?.items) ? payload.items : []

  return items
    .map(normalizeCollection)
    .filter((collection) => collection.id && collection.cover && collection.media.length > 0)
}

export function mergeGalleryCollections(staticCollections = [], adminCollections = []) {
  const merged = [...staticCollections]
  const seenKeys = new Set(
    staticCollections
      .map((collection) => collection.slug || collection.id)
      .filter(Boolean),
  )

  adminCollections.forEach((collection) => {
    const key = collection.slug || collection.id

    if (!key || seenKeys.has(key)) {
      return
    }

    seenKeys.add(key)
    merged.push(collection)
  })

  return merged
}
