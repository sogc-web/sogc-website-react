function readRequiredEnv(name) {
  const value = import.meta.env[name]

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} is not configured. Add it to the Frontend environment variables.`)
  }

  return value.replace(/\/+$/, '')
}

export const PUBLIC_API_BASE_URL = readRequiredEnv('VITE_PUBLIC_API_URL')
