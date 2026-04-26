const crypto = require('crypto')
const { env } = require('../config/env')
const { httpError } = require('../utils/httpError')

const ADMIN_SESSION_COOKIE = 'sogc_admin_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const OAUTH_STATE_TTL_MS = 15 * 60 * 1000

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4)
  return Buffer.from(padded, 'base64').toString('utf8')
}

function signValue(value) {
  return crypto.createHmac('sha256', env.sessionSecret).update(value).digest('hex')
}

function encodeSignedPayload(payload) {
  if (!env.sessionSecret) {
    throw httpError(500, 'SESSION_SECRET is not configured.')
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signValue(encodedPayload)
  return `${encodedPayload}.${signature}`
}

function decodeSignedPayload(token) {
  if (!token || !token.includes('.')) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signValue(encodedPayload)

  if (signature.length !== expectedSignature.length) {
    return null
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload))

    if (!payload?.exp || Date.now() > payload.exp) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

function buildCookieHeader(name, value, options = {}) {
  const parts = [`${name}=${value}`]

  if (options.httpOnly !== false) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  if (typeof options.maxAge === 'number') parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`)
  if (options.expires instanceof Date) parts.push(`Expires=${options.expires.toUTCString()}`)

  return parts.join('; ')
}

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'None' : 'Lax',
    path: '/',
    maxAge: SESSION_TTL_MS,
  }
}

function createAdminSessionToken(admin) {
  return encodeSignedPayload({
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role,
    exp: Date.now() + SESSION_TTL_MS,
  })
}

function setAdminSessionCookie(response, admin) {
  const token = createAdminSessionToken(admin)
  response.setHeader('Set-Cookie', buildCookieHeader(ADMIN_SESSION_COOKIE, token, getSessionCookieOptions()))
}

function clearAdminSessionCookie(response) {
  response.setHeader(
    'Set-Cookie',
    buildCookieHeader(ADMIN_SESSION_COOKIE, '', {
      ...getSessionCookieOptions(),
      expires: new Date(0),
      maxAge: 0,
    }),
  )
}

function parseCookies(request) {
  const rawCookieHeader = request.headers?.cookie

  if (!rawCookieHeader) {
    return {}
  }

  return rawCookieHeader.split(';').reduce((cookies, cookiePart) => {
    const [rawName, ...rawValueParts] = cookiePart.trim().split('=')
    if (!rawName) {
      return cookies
    }

    cookies[rawName] = decodeURIComponent(rawValueParts.join('='))
    return cookies
  }, {})
}

function readAdminSessionToken(request) {
  const cookies = parseCookies(request)
  return cookies[ADMIN_SESSION_COOKIE] || ''
}

function createOAuthStateToken({ inviteToken = '', redirectTo = '/' }) {
  return encodeSignedPayload({
    inviteToken,
    redirectTo: redirectTo.startsWith('/') ? redirectTo : '/',
    exp: Date.now() + OAUTH_STATE_TTL_MS,
  })
}

function decodeOAuthStateToken(token) {
  return decodeSignedPayload(token)
}

module.exports = {
  clearAdminSessionCookie,
  createOAuthStateToken,
  decodeOAuthStateToken,
  parseCookies,
  readAdminSessionToken,
  setAdminSessionCookie,
}
