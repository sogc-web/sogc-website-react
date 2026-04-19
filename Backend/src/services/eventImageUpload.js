const { configureCloudinary } = require('../config/cloudinary')
const { httpError } = require('../utils/httpError')

function extractCloudinaryPublicId(imageUrl) {
  if (!imageUrl) {
    return ''
  }

  try {
    const url = new URL(imageUrl)
    const uploadIndex = url.pathname.indexOf('/upload/')

    if (uploadIndex === -1) {
      return ''
    }

    const assetPath = url.pathname.slice(uploadIndex + '/upload/'.length)
    const normalizedPath = assetPath.replace(/^v\d+\//, '')
    const extensionIndex = normalizedPath.lastIndexOf('.')

    if (extensionIndex === -1) {
      return normalizedPath
    }

    return normalizedPath.slice(0, extensionIndex)
  } catch {
    return ''
  }
}

async function uploadEventImage(imageFileData, slug) {
  const cloudinary = configureCloudinary()

  if (!cloudinary.configured || !cloudinary.client) {
    throw httpError(503, 'Cloudinary is not configured for image uploads')
  }

  const result = await cloudinary.client.uploader.upload(imageFileData, {
    folder: 'sogc/events',
    public_id: slug ? `${slug}-${Date.now()}` : undefined,
    resource_type: 'image',
  })

  return {
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
  }
}

async function deleteEventImage(imagePublicId, imageUrl = '') {
  const cloudinary = configureCloudinary()

  if (!cloudinary.configured || !cloudinary.client) {
    return
  }

  const resolvedPublicId = imagePublicId || extractCloudinaryPublicId(imageUrl)

  if (!resolvedPublicId) {
    return
  }

  await cloudinary.client.uploader.destroy(resolvedPublicId, {
    resource_type: 'image',
  })
}

module.exports = { deleteEventImage, uploadEventImage }
