const IMAGE_MAX_BYTES = 10 * 1024 * 1024
const VIDEO_MAX_BYTES = 100 * 1024 * 1024

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime']

function getGalleryUploadKind(mimeType = '') {
  const normalizedMimeType = String(mimeType || '').trim().toLowerCase()

  if (ALLOWED_IMAGE_MIME_TYPES.includes(normalizedMimeType)) {
    return 'image'
  }

  if (ALLOWED_VIDEO_MIME_TYPES.includes(normalizedMimeType)) {
    return 'video'
  }

  return ''
}

function getGalleryUploadMaxBytes(kind) {
  if (kind === 'image') {
    return IMAGE_MAX_BYTES
  }

  if (kind === 'video') {
    return VIDEO_MAX_BYTES
  }

  return 0
}

function validateGalleryUploadCandidate({ fileName = '', mimeType = '', bytes = 0 }) {
  const kind = getGalleryUploadKind(mimeType)

  if (!kind) {
    throw unsupportedTypeError(fileName)
  }

  const maxBytes = getGalleryUploadMaxBytes(kind)
  const numericBytes = Number(bytes || 0)

  if (!Number.isFinite(numericBytes) || numericBytes <= 0) {
    throw new Error('Unable to determine the file size for this upload.')
  }

  if (numericBytes > maxBytes) {
    throw oversizeError({ fileName, kind, maxBytes })
  }

  return {
    kind,
    maxBytes,
    bytes: numericBytes,
    mimeType: String(mimeType || '').trim().toLowerCase(),
  }
}

function unsupportedTypeError(fileName = '') {
  const prefix = fileName ? `"${fileName}"` : 'This file'

  return new Error(
    `${prefix} is not a supported gallery format. Use JPG, JPEG, PNG, WEBP, MP4, or MOV files.`,
  )
}

function oversizeError({ fileName = '', kind = 'file', maxBytes = 0 }) {
  const prefix = fileName ? `"${fileName}"` : 'This file'

  return new Error(
    `${prefix} exceeds the ${formatBytes(maxBytes)} ${kind} upload limit. Choose a smaller file before uploading.`,
  )
}

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0)

  if (size <= 0) {
    return '0 MB'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** unitIndex

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
}

module.exports = {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
  formatBytes,
  getGalleryUploadKind,
  getGalleryUploadMaxBytes,
  validateGalleryUploadCandidate,
}
