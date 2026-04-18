const { v2: cloudinary } = require('cloudinary')
const { env } = require('./env')

function configureCloudinary() {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    return {
      configured: false,
      client: null,
    }
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  })

  return {
    configured: true,
    client: cloudinary,
  }
}

module.exports = { configureCloudinary }
