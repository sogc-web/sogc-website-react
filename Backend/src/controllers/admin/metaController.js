const { configureCloudinary } = require('../../config/cloudinary')

function getAdminBootstrap(_request, response) {
  const cloudinary = configureCloudinary()

  response.json({
    message: 'Admin backend scaffold ready.',
    features: {
      auth: 'pending',
      admins: 'pending',
      events: 'pending',
      gallery: 'pending',
      popup: 'pending',
      cloudinary: cloudinary.configured ? 'configured' : 'missing-config',
    },
  })
}

module.exports = { getAdminBootstrap }
