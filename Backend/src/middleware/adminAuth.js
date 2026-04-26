const { Admin } = require('../models/Admin')
const { httpError } = require('../utils/httpError')

function hasAllowedAdminRole(admin) {
  return Boolean(admin && admin.status === 'active' && ['superadmin', 'admin'].includes(admin.role))
}

async function hydrateAdminSession(request, _response, next) {
  // TODO: Populate request.session.adminId after Google OAuth is wired.
  const adminId = request.session?.adminId

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
