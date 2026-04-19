import { PUBLIC_API_BASE_URL } from './env'

export async function fetchActivePopup(signal) {
  const response = await fetch(`${PUBLIC_API_BASE_URL}/api/popup`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch active popup: ${response.status}`)
  }

  const payload = await response.json().catch(() => null)

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid active popup payload')
  }

  return payload.item ?? null
}
