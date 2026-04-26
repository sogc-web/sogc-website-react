const { configureCloudinary } = require('../../config/cloudinary')
const { createAdminCsrfToken } = require('../../services/adminCsrf')

function getAdminBootstrap(_request, response) {
  const cloudinary = configureCloudinary()

  response.json({
    message: 'Admin backend auth foundation ready.',
    features: {
      auth: 'foundation-ready',
      admins: 'invite-foundation-ready',
      events: 'protected',
      gallery: 'pending',
      popup: 'protected',
      cloudinary: cloudinary.configured ? 'configured' : 'missing-config',
    },
  })
}

function getAdminCsrf(request, response) {
  response.json({
    item: {
      token: createAdminCsrfToken(request.admin),
    },
  })
}

module.exports = { getAdminBootstrap, getAdminCsrf }
