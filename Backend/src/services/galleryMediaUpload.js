const { configureCloudinary } = require('../config/cloudinary')
const { httpError } = require('../utils/httpError')

async function uploadGalleryMedia({ fileData, collectionSlug, fileName = '' }) {
  const cloudinary = configureCloudinary()

  if (!cloudinary.configured || !cloudinary.client) {
    throw httpError(503, 'Cloudinary is not configured for gallery uploads')
  }

  const result = await cloudinary.client.uploader.upload(fileData, {
    folder: `sogc/gallery/collections/${collectionSlug}`,
    public_id: buildPublicId(fileName),
    resource_type: 'auto',
  })

  return {
    url: result.url || result.secure_url || '',
    secureUrl: result.secure_url || result.url || '',
    publicId: result.public_id || '',
    resourceType: result.resource_type || '',
    format: result.format || '',
    bytes: Number(result.bytes || 0),
    width: Number(result.width || 0),
    height: Number(result.height || 0),
    duration: Number(result.duration || 0),
    type: result.resource_type === 'video' ? 'video' : 'image',
  }
}

async function deleteGalleryMedia({ publicId, resourceType }) {
  const cloudinary = configureCloudinary()

  if (!cloudinary.configured || !cloudinary.client || !publicId) {
    return
  }

  await cloudinary.client.uploader.destroy(publicId, {
    resource_type: resourceType || 'image',
  })
}

function buildPublicId(fileName) {
  const baseName = String(fileName || '')
    .trim()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  return baseName ? `${baseName}-${Date.now()}` : undefined
}

module.exports = {
  deleteGalleryMedia,
  uploadGalleryMedia,
}
