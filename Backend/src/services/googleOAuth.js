const { env } = require('../config/env')
const { httpError } = require('../utils/httpError')

const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

function ensureGoogleOAuthConfigured() {
  if (!env.googleClientId || !env.googleClientSecret || !env.googleCallbackUrl) {
    throw httpError(500, 'Google OAuth environment variables are not fully configured.')
  }

  if (!env.sessionSecret) {
    throw httpError(500, 'SESSION_SECRET is required for admin auth.')
  }
}

function createGoogleAuthUrl({ state }) {
  ensureGoogleOAuthConfigured()

  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: env.googleCallbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  })

  return `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`
}

async function exchangeCodeForTokens(code) {
  ensureGoogleOAuthConfigured()

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: env.googleCallbackUrl,
      grant_type: 'authorization_code',
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.access_token) {
    throw httpError(401, payload?.error_description || 'Failed to exchange Google OAuth code.')
  }

  return payload
}

async function fetchGoogleProfile(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.email) {
    throw httpError(401, 'Failed to fetch Google profile.')
  }

  return payload
}

module.exports = {
  createGoogleAuthUrl,
  ensureGoogleOAuthConfigured,
  exchangeCodeForTokens,
  fetchGoogleProfile,
}
