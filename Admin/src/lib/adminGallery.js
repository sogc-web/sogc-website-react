import { adminRequest as request } from './adminRequest'

export async function fetchAdminGalleryCollections() {
  const payload = await request('/api/admin/gallery')
  return payload.items ?? []
}

export async function fetchAdminGalleryCollection(id) {
  const payload = await request(`/api/admin/gallery/${id}`)
  return payload.item
}

export async function fetchAdminGalleryUsage() {
  const payload = await request('/api/admin/gallery/usage')
  return payload.item
}

export async function createAdminGalleryCollection(collection) {
  const payload = await request('/api/admin/gallery', {
    method: 'POST',
    body: JSON.stringify(collection),
  })

  return payload.item
}

export async function updateAdminGalleryCollection(id, collection) {
  const payload = await request(`/api/admin/gallery/${id}`, {
    method: 'PUT',
    body: JSON.stringify(collection),
  })

  return payload.item
}

export async function deleteAdminGalleryCollection(id) {
  await request(`/api/admin/gallery/${id}`, {
    method: 'DELETE',
  })
}

export async function uploadAdminGalleryMedia(id, media) {
  const payload = await request(`/api/admin/gallery/${id}/media`, {
    method: 'POST',
    body: JSON.stringify(media),
  })

  return payload.items ?? []
}

export async function updateAdminGalleryMedia(id, mediaId, media) {
  const payload = await request(`/api/admin/gallery/${id}/media/${mediaId}`, {
    method: 'PUT',
    body: JSON.stringify(media),
  })

  return payload.item
}

export async function reorderAdminGalleryMedia(id, mediaIds) {
  const payload = await request(`/api/admin/gallery/${id}/media/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ mediaIds }),
  })

  return payload.items ?? []
}

export async function updateAdminGalleryCover(id, coverMediaId) {
  const payload = await request(`/api/admin/gallery/${id}/cover`, {
    method: 'PUT',
    body: JSON.stringify({ coverMediaId }),
  })

  return payload.item
}

export async function deleteAdminGalleryMedia(id, mediaId) {
  await request(`/api/admin/gallery/${id}/media/${mediaId}`, {
    method: 'DELETE',
  })
}
