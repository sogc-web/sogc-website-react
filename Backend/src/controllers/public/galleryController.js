const mongoose = require('mongoose')
const { GalleryCollection } = require('../../models/GalleryCollection')
const { GalleryMedia } = require('../../models/GalleryMedia')
const { httpError } = require('../../utils/httpError')

async function attachPublishedMedia(collection) {
  const media = await GalleryMedia.find({
    collectionId: collection._id,
    isPublished: true,
  }).sort({ sortOrder: 1, createdAt: 1 })

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
  const items = await Promise.all(collections.map((collection) => attachPublishedMedia(collection)))

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
    item: await attachPublishedMedia(collection),
  })
}

module.exports = {
  getGalleryCollectionBySlug,
  listGalleryCollections,
}
