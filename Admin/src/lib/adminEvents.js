import { adminRequest as request } from './adminRequest'

export async function fetchAdminEvents() {
  const payload = await request('/api/admin/events')
  return payload.items ?? []
}

export async function fetchAdminEvent(id) {
  const payload = await request(`/api/admin/events/${id}`)
  return payload.item
}

export async function createAdminEvent(event) {
  const payload = await request('/api/admin/events', {
    method: 'POST',
    body: JSON.stringify(event),
  })

  return payload.item
}

export async function updateAdminEvent(id, event) {
  const payload = await request(`/api/admin/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  })

  return payload.item
}

export async function deleteAdminEvent(id) {
  await request(`/api/admin/events/${id}`, {
    method: 'DELETE',
  })
}
