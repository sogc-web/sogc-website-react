function readRequiredEnv(name) {
  const value = import.meta.env[name]

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} is not configured. Add it to the Admin environment variables.`)
  }

  return value.trim()
}

export const ADMIN_API_BASE_URL = readRequiredEnv('VITE_ADMIN_API_URL').replace(/\/+$/, '')
