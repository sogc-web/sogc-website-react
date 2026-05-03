const { configureCloudinary } = require('../../config/cloudinary')
const { createAdminCsrfToken } = require('../../services/adminCsrf')

function getAdminBootstrap(_request, response) {
  const cloudinary = configureCloudinary()

  response.json({
    message: 'Admin workspace is available.',
    features: {
      auth: 'ready',
      admins: 'available',
      events: 'protected',
      gallery: 'available',
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
