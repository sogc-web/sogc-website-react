const crypto = require('crypto')
const { env } = require('../config/env')
const { httpError } = require('../utils/httpError')

const CSRF_TTL_MS = 2 * 60 * 60 * 1000

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
  if (!env.sessionSecret) {
    throw httpError(500, 'SESSION_SECRET is required for CSRF protection.')
  }

  return crypto.createHmac('sha256', env.sessionSecret).update(value).digest('hex')
}

function createAdminCsrfToken(admin) {
  const payload = {
    adminId: admin._id.toString(),
    exp: Date.now() + CSRF_TTL_MS,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signValue(encodedPayload)
  return `${encodedPayload}.${signature}`
}

function verifyAdminCsrfToken(token, admin) {
  if (!token || !token.includes('.') || !admin?._id) {
    return false
  }

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return false
  }

  const expectedSignature = signValue(encodedPayload)

  if (signature.length !== expectedSignature.length) {
    return false
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    return payload?.adminId === admin._id.toString() && Boolean(payload?.exp) && Date.now() <= payload.exp
  } catch {
    return false
  }
}

module.exports = {
  createAdminCsrfToken,
  verifyAdminCsrfToken,
}
