const { httpError } = require('../utils/httpError')
const { verifyAdminCsrfToken } = require('../services/adminCsrf')

function requireAdminCsrf(request, _response, next) {
  const csrfToken = String(request.headers['x-csrf-token'] || '').trim()

  if (!verifyAdminCsrfToken(csrfToken, request.admin)) {
    return next(httpError(403, 'CSRF token is missing or invalid.'))
  }

  return next()
}

module.exports = {
  requireAdminCsrf,
}
