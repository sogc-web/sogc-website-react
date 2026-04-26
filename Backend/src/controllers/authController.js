const { env } = require('../config/env')
const { Admin } = require('../models/Admin')
const { clearAdminSessionCookie, createOAuthStateToken, decodeOAuthStateToken, setAdminSessionCookie } = require('../services/adminSession')
const { createGoogleAuthUrl, ensureGoogleOAuthConfigured, exchangeCodeForTokens, fetchGoogleProfile } = require('../services/googleOAuth')
const { httpError } = require('../utils/httpError')

function buildAdminAppUrl(path) {
  const baseUrl = env.adminUrl || 'http://localhost:5174'
  return `${baseUrl.replace(/\/+$/, '')}${path}`
}

function buildErrorRedirect({ inviteToken = '', message }) {
  const encodedMessage = encodeURIComponent(message)

  if (inviteToken) {
    return buildAdminAppUrl(`/invite/accept?token=${encodeURIComponent(inviteToken)}&error=${encodedMessage}`)
  }

  return buildAdminAppUrl(`/login?error=${encodedMessage}`)
}

function sanitizeRedirectTo(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return '/'
  }

  return value
}

async function beginGoogleAuth(request, response) {
  ensureGoogleOAuthConfigured()

  const inviteToken = String(request.query?.inviteToken || '').trim()
  const redirectTo = sanitizeRedirectTo(String(request.query?.redirectTo || '/'))

  if (inviteToken) {
    const invitedAdmin = await Admin.findOne({
      inviteToken,
      status: 'invited',
      inviteTokenExpiresAt: { $gt: new Date() },
    })

    if (!invitedAdmin) {
      throw httpError(404, 'Invite token is invalid or expired.')
    }
  }

  const state = createOAuthStateToken({ inviteToken, redirectTo })
  response.redirect(createGoogleAuthUrl({ state }))
}

async function handleGoogleCallback(request, response) {
  try {
    ensureGoogleOAuthConfigured()

    const state = decodeOAuthStateToken(String(request.query?.state || ''))
    const code = String(request.query?.code || '').trim()

    if (!state) {
      throw httpError(400, 'OAuth state is invalid or expired.')
    }

    if (!code) {
      throw httpError(400, 'Missing Google OAuth code.')
    }

    const tokens = await exchangeCodeForTokens(code)
    const googleProfile = await fetchGoogleProfile(tokens.access_token)
    const email = String(googleProfile.email || '').trim().toLowerCase()

    if (!email) {
      throw httpError(401, 'Google account email is unavailable.')
    }

    let admin

    if (state.inviteToken) {
      admin = await Admin.findOne({
        inviteToken: state.inviteToken,
        status: 'invited',
        inviteTokenExpiresAt: { $gt: new Date() },
      })

      if (!admin) {
        throw httpError(404, 'Invite token is invalid or expired.')
      }

      if (admin.email !== email) {
        throw httpError(403, 'This Google account does not match the invited admin email.')
      }

      admin.status = 'active'
      admin.provider = 'google'
      admin.providerId = String(googleProfile.sub || '')
      admin.name = String(googleProfile.name || admin.name || '').trim()
      admin.inviteAcceptedAt = new Date()
      admin.lastLoginAt = new Date()
      admin.inviteToken = ''
      admin.inviteTokenExpiresAt = null
      await admin.save()
    } else {
      admin = await Admin.findOne({
        email,
        status: 'active',
        role: { $in: ['superadmin', 'admin'] },
      })

      if (!admin) {
        throw httpError(403, 'This Google account is not authorized for admin access.')
      }

      admin.provider = 'google'
      admin.providerId = String(googleProfile.sub || admin.providerId || '')
      admin.name = String(googleProfile.name || admin.name || '').trim()
      admin.lastLoginAt = new Date()
      await admin.save()
    }

    setAdminSessionCookie(response, admin)
    response.redirect(buildAdminAppUrl(sanitizeRedirectTo(state.redirectTo || '/')))
  } catch (error) {
    const inviteToken = decodeOAuthStateToken(String(request.query?.state || ''))?.inviteToken || ''
    response.redirect(buildErrorRedirect({ inviteToken, message: error.message || 'Google OAuth sign-in failed.' }))
  }
}

function logoutAdmin(_request, response) {
  clearAdminSessionCookie(response)
  response.json({ ok: true })
}

function getAdminMe(request, response) {
  if (!request.admin) {
    return response.status(401).json({
      error: 'Admin authentication required.',
    })
  }

  return response.json({
    item: {
      id: request.admin._id.toString(),
      email: request.admin.email,
      name: request.admin.name,
      role: request.admin.role,
      status: request.admin.status,
      provider: request.admin.provider,
      lastLoginAt: request.admin.lastLoginAt,
      createdAt: request.admin.createdAt,
      updatedAt: request.admin.updatedAt,
    },
  })
}

module.exports = {
  beginGoogleAuth,
  getAdminMe,
  handleGoogleCallback,
  logoutAdmin,
}
