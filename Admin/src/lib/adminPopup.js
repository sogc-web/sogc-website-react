import { adminRequest as request } from './adminRequest'

export async function fetchAdminPopups() {
  const payload = await request('/api/admin/popups')
  return payload.items ?? []
}

export async function fetchAdminPopup(id) {
  const payload = await request(`/api/admin/popups/${id}`)
  return payload.item
}

export async function createAdminPopup(popup) {
  const payload = await request('/api/admin/popups', {
    method: 'POST',
    body: JSON.stringify(popup),
  })

  return payload.item
}

export async function updateAdminPopup(id, popup) {
  const payload = await request(`/api/admin/popups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(popup),
  })

  return payload.item
}

export async function activateAdminPopup(id) {
  const payload = await request(`/api/admin/popups/${id}/activate`, {
    method: 'PUT',
  })

  return payload.item
}

export async function deleteAdminPopup(id) {
  await request(`/api/admin/popups/${id}`, {
    method: 'DELETE',
  })
}
