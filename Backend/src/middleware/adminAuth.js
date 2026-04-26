const { Admin } = require('../models/Admin')
const { readAdminSessionToken } = require('../services/adminSession')
const { httpError } = require('../utils/httpError')
const { decodeOAuthStateToken } = require('../services/adminSession')

function hasAllowedAdminRole(admin) {
  return Boolean(admin && admin.status === 'active' && ['superadmin', 'admin'].includes(admin.role))
}

async function hydrateAdminSession(request, _response, next) {
  const sessionToken = readAdminSessionToken(request)
  const session = decodeOAuthStateToken(sessionToken)
  const adminId = session?.adminId

  if (!adminId) {
    return next()
  }

  const admin = await Admin.findById(adminId)

  if (hasAllowedAdminRole(admin)) {
    request.admin = admin
  }

  return next()
}

function requireAdminAuth(request, _response, next) {
  if (!hasAllowedAdminRole(request.admin)) {
    return next(httpError(401, 'Admin authentication required.'))
  }

  return next()
}

function requireSuperAdmin(request, _response, next) {
  if (!hasAllowedAdminRole(request.admin)) {
    return next(httpError(401, 'Admin authentication required.'))
  }

  if (request.admin.role !== 'superadmin') {
    return next(httpError(403, 'Superadmin access required.'))
  }

  return next()
}

module.exports = {
  hydrateAdminSession,
  requireAdminAuth,
  requireSuperAdmin,
}
