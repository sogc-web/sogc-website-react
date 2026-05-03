const mongoose = require('mongoose')
const { GalleryCollection } = require('../../models/GalleryCollection')
const { GalleryMedia } = require('../../models/GalleryMedia')
const { httpError } = require('../../utils/httpError')

function serializeCollectionWithMedia(collection, media) {
  return {
    ...collection.toJSON(),
    media: media.map((item) => item.toJSON()),
    mediaCount: media.length,
  }
}

async function listGalleryCollections(_request, response) {
  if (mongoose.connection.readyState !== 1) {
    return response.json({
      items: [],
    })
  }

  const collections = await GalleryCollection.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: -1 })
  const mediaItems = await GalleryMedia.find({
    collectionId: { $in: collections.map((collection) => collection._id) },
    isPublished: true,
  }).sort({ sortOrder: 1, createdAt: 1 })

  const mediaByCollectionId = new Map()

  for (const mediaItem of mediaItems) {
    const collectionId = mediaItem.collectionId.toString()
    const bucket = mediaByCollectionId.get(collectionId) || []
    bucket.push(mediaItem)
    mediaByCollectionId.set(collectionId, bucket)
  }

  const items = collections.map((collection) =>
    serializeCollectionWithMedia(collection, mediaByCollectionId.get(collection._id.toString()) || []),
  )

  response.json({ items })
}

async function getGalleryCollectionBySlug(request, response, next) {
  if (mongoose.connection.readyState !== 1) {
    return next(httpError(404, 'Gallery collection not found'))
  }

  const collection = await GalleryCollection.findOne({
    slug: request.params.slug,
    isPublished: true,
  })

  if (!collection) {
    return next(httpError(404, 'Gallery collection not found'))
  }

  response.json({
    item: serializeCollectionWithMedia(
      collection,
      await GalleryMedia.find({
        collectionId: collection._id,
        isPublished: true,
      }).sort({ sortOrder: 1, createdAt: 1 }),
    ),
  })
}

module.exports = {
  getGalleryCollectionBySlug,
  listGalleryCollections,
}
