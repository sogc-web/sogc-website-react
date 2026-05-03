const { configureCloudinary } = require('../config/cloudinary')
const { httpError } = require('../utils/httpError')

const LOW_QUOTA_THRESHOLD_BYTES = 500 * 1024 * 1024

async function getGalleryQuotaSnapshot() {
  const cloudinary = configureCloudinary()

  if (!cloudinary.configured || !cloudinary.client) {
    throw httpError(503, 'Cloudinary is not configured for gallery uploads')
  }

  const usage = await cloudinary.client.api.usage()
  const storageUsage = usage?.storage || {}
  const storageUsedBytes = pickNumber(
    storageUsage.usage,
    storageUsage.used,
    storageUsage.used_bytes,
    storageUsage.bytes,
    0,
  )
  const storageLimitBytes = pickNullableNumber(
    storageUsage.limit,
    storageUsage.max,
    storageUsage.allowed,
    usage?.plan?.storage,
  )
  const remainingBytes =
    storageLimitBytes === null ? null : Math.max(storageLimitBytes - storageUsedBytes, 0)
  const lowQuotaThresholdBytes =
    storageLimitBytes === null
      ? LOW_QUOTA_THRESHOLD_BYTES
      : Math.min(LOW_QUOTA_THRESHOLD_BYTES, Math.max(storageLimitBytes * 0.05, 0))

  return {
    checkedAt: new Date().toISOString(),
    storageUsedBytes,
    storageLimitBytes,
    remainingBytes,
    lowQuotaThresholdBytes,
    nearLimit: remainingBytes !== null && remainingBytes <= lowQuotaThresholdBytes,
    uploadBlocked: remainingBytes !== null && remainingBytes <= 0,
  }
}

function assertGalleryQuotaCapacity(quotaSnapshot, requestedBytes) {
  const numericRequestedBytes = Number(requestedBytes || 0)

  if (!Number.isFinite(numericRequestedBytes) || numericRequestedBytes <= 0) {
    throw httpError(400, 'Unable to determine upload size for this request')
  }

  if (quotaSnapshot.uploadBlocked) {
    throw httpError(
      409,
      'Cloudinary storage capacity has been exhausted. Upgrade your Cloudinary plan before uploading more media.',
    )
  }

  if (
    quotaSnapshot.remainingBytes !== null &&
    numericRequestedBytes > quotaSnapshot.remainingBytes
  ) {
    throw httpError(
      409,
      `Cloudinary storage limit is nearly exhausted. Only ${formatBytes(
        quotaSnapshot.remainingBytes,
      )} remains, so this upload cannot be completed.`,
    )
  }
}

function pickNumber(...values) {
  for (const value of values) {
    const numericValue = Number(value)

    if (Number.isFinite(numericValue) && numericValue >= 0) {
      return numericValue
    }
  }

  return 0
}

function pickNullableNumber(...values) {
  for (const value of values) {
    const numericValue = Number(value)

    if (Number.isFinite(numericValue) && numericValue > 0) {
      return numericValue
    }
  }

  return null
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
  LOW_QUOTA_THRESHOLD_BYTES,
  assertGalleryQuotaCapacity,
  getGalleryQuotaSnapshot,
}
