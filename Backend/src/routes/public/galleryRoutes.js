const express = require('express')
const { getGalleryCollectionBySlug, listGalleryCollections } = require('../../controllers/public/galleryController')

const router = express.Router()

router.get('/', listGalleryCollections)
router.get('/:slug', getGalleryCollectionBySlug)

module.exports = router
