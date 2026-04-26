import { adminRequest } from './adminRequest'

export async function fetchAdmins() {
  const payload = await adminRequest('/api/admin/admins')
  return payload.items ?? []
}

export async function inviteAdmin(input) {
  const payload = await adminRequest('/api/admin/admins/invite', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return payload.item
}

export async function resendAdminInvite(id) {
  const payload = await adminRequest(`/api/admin/admins/${id}/resend-invite`, {
    method: 'POST',
  })

  return payload.item
}

export async function disableAdmin(id) {
  const payload = await adminRequest(`/api/admin/admins/${id}/disable`, {
    method: 'PATCH',
  })

  return payload.item
}

export async function enableAdmin(id) {
  const payload = await adminRequest(`/api/admin/admins/${id}/enable`, {
    method: 'PATCH',
  })

  return payload.item
}

export async function removeAdmin(id) {
  await adminRequest(`/api/admin/admins/${id}`, {
    method: 'DELETE',
  })
}
