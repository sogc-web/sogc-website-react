function beginGoogleAuth(_request, response) {
  // TODO: Wire Google OAuth using GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.
  response.status(501).json({
    error: 'Google OAuth is not configured yet.',
  })
}

function handleGoogleCallback(_request, response) {
  // TODO: Complete OAuth callback flow and enforce invited-email matching before activation.
  response.status(501).json({
    error: 'Google OAuth callback is not configured yet.',
  })
}

function logoutAdmin(_request, response) {
  // TODO: Destroy the server-side admin session after OAuth/session wiring is added.
  response.status(501).json({
    error: 'Logout is not configured yet.',
  })
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
