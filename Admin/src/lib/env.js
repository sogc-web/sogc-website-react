function readRequiredEnv(name) {
  const value = import.meta.env[name]

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} is not configured. Add it to the Admin environment variables.`)
  }

  return value.trim()
}

export const ADMIN_API_BASE_URL = readRequiredEnv('VITE_ADMIN_API_URL').replace(/\/+$/, '')
export const ADMIN_LOGIN_EMAIL = readRequiredEnv('VITE_ADMIN_LOGIN_EMAIL')
export const ADMIN_LOGIN_PASSWORD = readRequiredEnv('VITE_ADMIN_LOGIN_PASSWORD')
