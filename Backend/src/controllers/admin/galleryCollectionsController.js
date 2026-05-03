const mongoose = require('mongoose')
const { GalleryCollection } = require('../../models/GalleryCollection')
const { GalleryMedia } = require('../../models/GalleryMedia')
const { recordAdminActivity } = require('../../services/adminActivityLogger')
const { notifyAdminActivity } = require('../../services/adminActivityMailer')
const { assertGalleryQuotaCapacity, getGalleryQuotaSnapshot } = require('../../services/galleryQuota')
const { formatBytes, validateGalleryUploadCandidate } = require('../../services/galleryUploadPolicy')
const { deleteGalleryMedia, uploadGalleryMedia } = require('../../services/galleryMediaUpload')
const { httpError } = require('../../utils/httpError')
const { runDeferred } = require('../../utils/runDeferred')
const { slugify } = require('../../utils/slugify')

function ensureDatabaseConnection() {
  if (mongoose.connection.readyState !== 1) {
    throw httpError(503, 'Database connection is not available')
  }
}

function normalizePayload(payload) {
  return {
    title: String(payload.title ?? '').trim(),
    eyebrow: String(payload.eyebrow ?? '').trim(),
    summary: String(payload.summary ?? '').trim(),
    isPublished: Boolean(payload.isPublished),
  }
}

function validateRequiredFields(payload) {
  if (!payload.title) {
    throw httpError(400, 'Please provide: title')
  }
}

async function buildUniqueSlug(title, excludeId = null) {
  const baseSlug = slugify(title)

  if (!baseSlug) {
    throw httpError(400, 'A valid title is required to generate the slug')
  }

  let slug = baseSlug
  let suffix = 1

  while (true) {
    const existingCollection = await GalleryCollection.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })

    if (!existingCollection) {
      return slug
    }

    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }
}

async function countMediaForCollection(collectionId) {
  return GalleryMedia.countDocuments({ collectionId })
}

async function serializeCollection(collection) {
  const [mediaCount, totalBytes, media] = await Promise.all([
    countMediaForCollection(collection._id),
    sumMediaBytes(collection._id),
    GalleryMedia.find({ collectionId: collection._id }).sort({ sortOrder: 1, createdAt: 1 }),
  ])

  return {
    ...collection.toJSON(),
    mediaCount,
    totalBytes,
    media: media.map((item) => item.toJSON()),
  }
}

function serializeMediaItem(item) {
  return item.toJSON()
}

function queueAdminActivity(activity, label) {
  runDeferred(() => recordAdminActivity(activity), label)
}

async function serializeCollectionList(collections) {
  if (!collections.length) {
    return []
  }

  const collectionIds = collections.map((item) => item._id)
  const mediaItems = await GalleryMedia.find({
    collectionId: { $in: collectionIds },
  }).sort({ sortOrder: 1, createdAt: 1 })

  const mediaByCollectionId = new Map()

  for (const mediaItem of mediaItems) {
    const collectionId = mediaItem.collectionId.toString()
    const bucket = mediaByCollectionId.get(collectionId) || []
    bucket.push(mediaItem)
    mediaByCollectionId.set(collectionId, bucket)
  }

  return collections.map((collection) => {
    const collectionId = collection._id.toString()
    const media = mediaByCollectionId.get(collectionId) || []

    return {
      ...collection.toJSON(),
      mediaCount: media.length,
      totalBytes: media.reduce((total, item) => total + Number(item.bytes || 0), 0),
      media: media.map((item) => item.toJSON()),
    }
  })
}

async function sumMediaBytes(collectionId) {
  const [summary] = await GalleryMedia.aggregate([
    { $match: { collectionId } },
    { $group: { _id: null, totalBytes: { $sum: '$bytes' } } },
  ])

  return Number(summary?.totalBytes || 0)
}

async function listAdminGalleryCollections(_request, response) {
  ensureDatabaseConnection()

  const items = await GalleryCollection.find().sort({ createdAt: -1 })
  const serializedItems = await serializeCollectionList(items)
  response.json({ items: serializedItems })
}

async function getAdminGalleryCollection(request, response) {
  ensureDatabaseConnection()

  const item = await GalleryCollection.findById(request.params.id)

  if (!item) {
    throw httpError(404, 'Gallery collection not found')
  }

  response.json({
    item: await serializeCollection(item),
  })
}

async function getAdminGalleryUsage(_request, response) {
  ensureDatabaseConnection()

  response.json({
    item: await getGalleryQuotaSnapshot(),
  })
}

async function createAdminGalleryCollection(request, response) {
  ensureDatabaseConnection()

  const payload = normalizePayload(request.body)
  validateRequiredFields(payload)
  payload.slug = await buildUniqueSlug(payload.title)
  payload.createdByEmail = request.admin.email
  payload.updatedByEmail = request.admin.email

  const item = await GalleryCollection.create(payload)

  queueAdminActivity({
    entityType: 'GalleryCollection',
    entityId: item._id,
    entityTitle: item.title,
    operation: 'created',
    actorEmail: request.admin.email,
    actorRole: request.admin.role,
    metadata: {
      slug: item.slug,
      isPublished: item.isPublished,
    },
  }, 'gallery-collection-created-activity')

  runDeferred(
    () =>
      notifyAdminActivity({
        entityType: 'Gallery collection',
        operation: 'created',
        actorEmail: request.admin.email,
        details: {
          Title: item.title,
          Slug: item.slug,
          Published: item.isPublished ? 'Yes' : 'No',
          'Media count': '0',
        },
      }),
    'gallery-collection-created-notify',
  )

  response.status(201).json({
    item: await serializeCollection(item),
  })
}

async function updateAdminGalleryCollection(request, response) {
  ensureDatabaseConnection()

  const payload = normalizePayload(request.body)
  validateRequiredFields(payload)

  const item = await GalleryCollection.findById(request.params.id)

  if (!item) {
    throw httpError(404, 'Gallery collection not found')
  }

  payload.slug = await buildUniqueSlug(payload.title, item._id)
  payload.updatedByEmail = request.admin.email

  Object.assign(item, payload)
  await item.save()
  await GalleryMedia.updateMany(
    { collectionId: item._id },
    {
      $set: {
        isPublished: item.isPublished,
        updatedByEmail: request.admin.email,
      },
    },
  )

  const mediaCount = await countMediaForCollection(item._id)

  queueAdminActivity({
    entityType: 'GalleryCollection',
    entityId: item._id,
    entityTitle: item.title,
    operation: 'updated',
    actorEmail: request.admin.email,
    actorRole: request.admin.role,
    metadata: {
      slug: item.slug,
      isPublished: item.isPublished,
      mediaCount,
    },
  }, 'gallery-collection-updated-activity')

  runDeferred(
    () =>
      notifyAdminActivity({
        entityType: 'Gallery collection',
        operation: 'updated',
        actorEmail: request.admin.email,
        details: {
          Title: item.title,
          Slug: item.slug,
          Published: item.isPublished ? 'Yes' : 'No',
          'Media count': String(mediaCount),
        },
      }),
    'gallery-collection-updated-notify',
  )

  response.json({
    item: await serializeCollection(item),
  })
}

async function deleteAdminGalleryCollection(request, response) {
  ensureDatabaseConnection()

  const item = await GalleryCollection.findById(request.params.id)

  if (!item) {
    throw httpError(404, 'Gallery collection not found')
  }

  const mediaCount = await countMediaForCollection(item._id)

  const mediaItems = await GalleryMedia.find({ collectionId: item._id })

  for (const mediaItem of mediaItems) {
    await deleteGalleryMedia({
      publicId: mediaItem.publicId,
      resourceType: mediaItem.resourceType,
    })
  }

  await GalleryMedia.deleteMany({ collectionId: item._id })
  await item.deleteOne()

  queueAdminActivity({
    entityType: 'GalleryCollection',
    entityId: item._id,
    entityTitle: item.title,
    operation: 'deleted',
    actorEmail: request.admin.email,
    actorRole: request.admin.role,
    metadata: {
      slug: item.slug,
      isPublished: item.isPublished,
      mediaCount,
    },
  }, 'gallery-collection-deleted-activity')

  runDeferred(
    () =>
      notifyAdminActivity({
        entityType: 'Gallery collection',
        operation: 'deleted',
        actorEmail: request.admin.email,
        details: {
          Title: item.title,
          Slug: item.slug,
          Published: item.isPublished ? 'Yes' : 'No',
          'Media count': String(mediaCount),
        },
      }),
    'gallery-collection-deleted-notify',
  )

  response.status(204).send()
}

async function createAdminGalleryMedia(request, response) {
  ensureDatabaseConnection()

  const collection = await GalleryCollection.findById(request.params.id)

  if (!collection) {
    throw httpError(404, 'Gallery collection not found')
  }

  const incomingItems = Array.isArray(request.body?.files)
    ? request.body.files
    : [
        {
          fileData: request.body?.fileData,
          fileName: request.body?.fileName,
          alt: request.body?.alt,
          caption: request.body?.caption,
          isPublished: request.body?.isPublished,
        },
      ]

  const files = incomingItems
    .map((item) => ({
      fileData: typeof item?.fileData === 'string' ? item.fileData : '',
      fileName: String(item?.fileName || '').trim(),
      alt: String(item?.alt || '').trim(),
      caption: String(item?.caption || '').trim(),
      isPublished: Boolean(item?.isPublished),
      mimeType: String(item?.mimeType || '').trim(),
      bytes: Number(item?.bytes || 0),
    }))
    .filter((item) => item.fileData)

  if (!files.length) {
    throw httpError(400, 'At least one media file is required')
  }

  const validatedFiles = files.map((file) => {
    const parsedMimeType = extractMimeTypeFromDataUrl(file.fileData) || file.mimeType
    const parsedBytes = calculateBytesFromDataUrl(file.fileData) || file.bytes

    try {
      const validation = validateGalleryUploadCandidate({
        fileName: file.fileName,
        mimeType: parsedMimeType,
        bytes: parsedBytes,
      })

      return {
        ...file,
        mimeType: validation.mimeType,
        bytes: validation.bytes,
        type: validation.kind,
      }
    } catch (error) {
      throw httpError(400, error.message)
    }
  })

  const totalRequestedBytes = validatedFiles.reduce((total, file) => total + Number(file.bytes || 0), 0)
  const quotaSnapshot = await getGalleryQuotaSnapshot()
  assertGalleryQuotaCapacity(quotaSnapshot, totalRequestedBytes)

  const maxSortOrderMedia = await GalleryMedia.findOne({ collectionId: collection._id }).sort({ sortOrder: -1, createdAt: -1 })
  const baseSortOrder = maxSortOrderMedia ? Number(maxSortOrderMedia.sortOrder || 0) + 1 : 0

  const uploadedAssets = []
  const createdMediaDocs = []

  try {
    for (const [index, file] of validatedFiles.entries()) {
      const uploadedMedia = await uploadGalleryMedia({
        fileData: file.fileData,
        collectionSlug: collection.slug,
        fileName: file.fileName,
      })

      uploadedAssets.push({
        publicId: uploadedMedia.publicId,
        resourceType: uploadedMedia.resourceType,
      })

      const mediaItem = await GalleryMedia.create({
        collectionId: collection._id,
        type: uploadedMedia.type,
        url: uploadedMedia.url,
        secureUrl: uploadedMedia.secureUrl,
        publicId: uploadedMedia.publicId,
        resourceType: uploadedMedia.resourceType,
        format: uploadedMedia.format,
        bytes: uploadedMedia.bytes,
        width: uploadedMedia.width,
        height: uploadedMedia.height,
        duration: uploadedMedia.duration,
        alt: file.alt || deriveAltFromFileName(file.fileName, collection.title),
        caption: file.caption,
        sortOrder: baseSortOrder + index,
        isPublished: collection.isPublished,
        createdByEmail: request.admin.email,
        updatedByEmail: request.admin.email,
      })

      createdMediaDocs.push(mediaItem)

    }
  } catch (error) {
    for (const mediaDoc of createdMediaDocs) {
      await GalleryMedia.deleteOne({ _id: mediaDoc._id }).catch(() => {})
    }

    for (const asset of uploadedAssets) {
      await deleteGalleryMedia(asset).catch(() => {})
    }

    throw error
  }

  for (const mediaItem of createdMediaDocs) {
    queueAdminActivity(
      {
        entityType: 'GalleryMedia',
        entityId: mediaItem._id,
        entityTitle: collection.title,
        operation: 'uploaded',
        actorEmail: request.admin.email,
        actorRole: request.admin.role,
        metadata: {
          collectionId: collection._id.toString(),
          publicId: mediaItem.publicId,
          bytes: mediaItem.bytes,
          type: mediaItem.type,
        },
      },
      'gallery-media-uploaded-activity',
    )
  }

  runDeferred(
    () =>
      notifyAdminActivity({
        entityType: 'Gallery media',
        operation: files.length > 1 ? 'bulk uploaded' : 'uploaded',
        actorEmail: request.admin.email,
        details: {
          Collection: collection.title,
          Files: String(createdMediaDocs.length),
          Published: collection.isPublished ? 'Yes' : 'No',
          'Total bytes': formatBytes(createdMediaDocs.reduce((total, item) => total + Number(item.bytes || 0), 0)),
        },
      }),
    'gallery-media-uploaded-notify',
  )

  response.status(201).json({
    items: createdMediaDocs,
  })
}

async function deleteAdminGalleryMedia(request, response) {
  ensureDatabaseConnection()

  const collection = await GalleryCollection.findById(request.params.id)

  if (!collection) {
    throw httpError(404, 'Gallery collection not found')
  }

  const mediaItem = await GalleryMedia.findOne({
    _id: request.params.mediaId,
    collectionId: collection._id,
  })

  if (!mediaItem) {
    throw httpError(404, 'Gallery media not found')
  }

  await deleteGalleryMedia({
    publicId: mediaItem.publicId,
    resourceType: mediaItem.resourceType,
  })

  if (collection.coverMediaId && collection.coverMediaId.toString() === mediaItem._id.toString()) {
    collection.coverMediaId = null
    collection.updatedByEmail = request.admin.email
    await collection.save()
  }

  await mediaItem.deleteOne()

  queueAdminActivity({
    entityType: 'GalleryMedia',
    entityId: mediaItem._id,
    entityTitle: collection.title,
    operation: 'deleted',
    actorEmail: request.admin.email,
    actorRole: request.admin.role,
    metadata: {
      collectionId: collection._id.toString(),
      publicId: mediaItem.publicId,
      bytes: mediaItem.bytes,
      type: mediaItem.type,
    },
  }, 'gallery-media-deleted-activity')

  runDeferred(
    () =>
      notifyAdminActivity({
        entityType: 'Gallery media',
        operation: 'deleted',
        actorEmail: request.admin.email,
        details: {
          Collection: collection.title,
          Type: mediaItem.type,
          Bytes: String(mediaItem.bytes),
          Published: mediaItem.isPublished ? 'Yes' : 'No',
        },
      }),
    'gallery-media-deleted-notify',
  )

  response.status(204).send()
}

async function updateAdminGalleryMedia(request, response) {
  ensureDatabaseConnection()

  const collection = await GalleryCollection.findById(request.params.id)

  if (!collection) {
    throw httpError(404, 'Gallery collection not found')
  }

  const mediaItem = await GalleryMedia.findOne({
    _id: request.params.mediaId,
    collectionId: collection._id,
  })

  if (!mediaItem) {
    throw httpError(404, 'Gallery media not found')
  }

  mediaItem.alt = String(request.body?.alt || '').trim()
  mediaItem.caption = String(request.body?.caption || '').trim()
  mediaItem.updatedByEmail = request.admin.email
  await mediaItem.save()

  queueAdminActivity({
    entityType: 'GalleryMedia',
    entityId: mediaItem._id,
    entityTitle: collection.title,
    operation: 'updated',
    actorEmail: request.admin.email,
    actorRole: request.admin.role,
    metadata: {
      collectionId: collection._id.toString(),
      publicId: mediaItem.publicId,
      type: mediaItem.type,
    },
  }, 'gallery-media-updated-activity')

  response.json({
    item: serializeMediaItem(mediaItem),
  })
}

async function reorderAdminGalleryMedia(request, response) {
  ensureDatabaseConnection()

  const collection = await GalleryCollection.findById(request.params.id)

  if (!collection) {
    throw httpError(404, 'Gallery collection not found')
  }

  const orderedMediaIds = Array.isArray(request.body?.mediaIds)
    ? request.body.mediaIds.map((value) => String(value || '').trim()).filter(Boolean)
    : []

  if (!orderedMediaIds.length) {
    throw httpError(400, 'Please provide mediaIds in the new order')
  }

  const mediaItems = await GalleryMedia.find({ collectionId: collection._id }).sort({ sortOrder: 1, createdAt: 1 })
  const currentIds = mediaItems.map((item) => item._id.toString())

  if (currentIds.length !== orderedMediaIds.length || currentIds.some((id) => !orderedMediaIds.includes(id))) {
    throw httpError(400, 'The media order is invalid for this collection')
  }

  await Promise.all(
    orderedMediaIds.map((mediaId, index) =>
      GalleryMedia.updateOne(
        { _id: mediaId, collectionId: collection._id },
        { $set: { sortOrder: index, updatedByEmail: request.admin.email } },
      ),
    ),
  )

  const updatedItems = await GalleryMedia.find({ collectionId: collection._id }).sort({ sortOrder: 1, createdAt: 1 })

  queueAdminActivity({
    entityType: 'GalleryCollection',
    entityId: collection._id,
    entityTitle: collection.title,
    operation: 'reordered media',
    actorEmail: request.admin.email,
    actorRole: request.admin.role,
    metadata: {
      mediaIds: orderedMediaIds,
    },
  }, 'gallery-media-reordered-activity')

  response.json({
    items: updatedItems.map((item) => serializeMediaItem(item)),
  })
}

async function updateAdminGalleryCover(request, response) {
  ensureDatabaseConnection()

  const collection = await GalleryCollection.findById(request.params.id)

  if (!collection) {
    throw httpError(404, 'Gallery collection not found')
  }

  const coverMediaId = String(request.body?.coverMediaId || '').trim()

  if (!coverMediaId) {
    collection.coverMediaId = null
  } else {
    const mediaItem = await GalleryMedia.findOne({
      _id: coverMediaId,
      collectionId: collection._id,
    })

    if (!mediaItem) {
      throw httpError(404, 'Cover media not found in this collection')
    }

    collection.coverMediaId = mediaItem._id
  }

  collection.updatedByEmail = request.admin.email
  await collection.save()

  queueAdminActivity({
    entityType: 'GalleryCollection',
    entityId: collection._id,
    entityTitle: collection.title,
    operation: collection.coverMediaId ? 'updated cover' : 'cleared cover',
    actorEmail: request.admin.email,
    actorRole: request.admin.role,
    metadata: {
      coverMediaId: collection.coverMediaId ? collection.coverMediaId.toString() : '',
    },
  }, 'gallery-cover-updated-activity')

  response.json({
    item: await serializeCollection(collection),
  })
}

module.exports = {
  createAdminGalleryCollection,
  createAdminGalleryMedia,
  deleteAdminGalleryCollection,
  deleteAdminGalleryMedia,
  getAdminGalleryCollection,
  getAdminGalleryUsage,
  listAdminGalleryCollections,
  reorderAdminGalleryMedia,
  updateAdminGalleryCover,
  updateAdminGalleryCollection,
  updateAdminGalleryMedia,
}

function deriveAltFromFileName(fileName, fallbackTitle) {
  const baseName = String(fileName || '')
    .trim()
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')

  return baseName || fallbackTitle || 'Gallery media'
}

function extractMimeTypeFromDataUrl(fileData) {
  const match = String(fileData || '').match(/^data:([^;]+);base64,/i)
  return match ? match[1].trim().toLowerCase() : ''
}

function calculateBytesFromDataUrl(fileData) {
  const value = String(fileData || '')
  const base64Index = value.indexOf('base64,')

  if (base64Index === -1) {
    return 0
  }

  const base64Value = value.slice(base64Index + 7)
  const paddingLength = base64Value.endsWith('==') ? 2 : base64Value.endsWith('=') ? 1 : 0

  return Math.max(Math.floor((base64Value.length * 3) / 4) - paddingLength, 0)
}
