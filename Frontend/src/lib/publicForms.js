import { PUBLIC_API_BASE_URL } from './env'

async function request(path, body) {
  const response = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`)
  }

  return payload
}

export function submitVolunteerForm(form) {
  return request('/api/forms/volunteer', form)
}

export function submitContactForm(form) {
  return request('/api/forms/contact', form)
}
