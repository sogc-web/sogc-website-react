const mongoose = require('mongoose')
const { configureCloudinary } = require('../config/cloudinary')

function getHealth(_request, response) {
  const cloudinary = configureCloudinary()

  response.json({
    status: 'ok',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cloudinary: cloudinary.configured ? 'configured' : 'missing-config',
    },
  })
}

module.exports = { getHealth }
