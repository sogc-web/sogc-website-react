import { PUBLIC_API_BASE_URL } from './env'

function normalizeBackendEvent(event) {
  return {
    ...event,
    image: event.image ?? event.imageUrl ?? '',
    highlights: Array.isArray(event.highlights) ? event.highlights : [],
    registrationUrl: event.registrationUrl ?? '',
  }
}

export async function fetchAdminEvents(signal) {
  const response = await fetch(`${PUBLIC_API_BASE_URL}/api/events`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch admin events: ${response.status}`)
  }

  const payload = await response.json()
  const items = Array.isArray(payload) ? payload : payload.items

  if (!Array.isArray(items)) {
    throw new Error('Invalid admin events payload')
  }

  return items.map(normalizeBackendEvent)
}

export function mergeEventCatalog(staticEvents, adminEvents) {
  const mergedEvents = [...staticEvents]
  const seenSlugs = new Set(staticEvents.map((event) => event.slug))

  adminEvents.forEach((event) => {
    if (!event?.slug || seenSlugs.has(event.slug)) {
      return
    }

    seenSlugs.add(event.slug)
    mergedEvents.push(event)
  })

  return mergedEvents
}
