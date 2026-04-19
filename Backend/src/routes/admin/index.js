const express = require('express')
const { getAdminBootstrap } = require('../../controllers/admin/metaController')
const {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvent,
  listAdminEvents,
  updateAdminEvent,
} = require('../../controllers/admin/eventsController')
const { asyncHandler } = require('../../utils/asyncHandler')

const router = express.Router()

router.get('/', getAdminBootstrap)
router.get('/bootstrap', getAdminBootstrap)
router.get('/events', asyncHandler(listAdminEvents))
router.get('/events/:id', asyncHandler(getAdminEvent))
router.post('/events', asyncHandler(createAdminEvent))
router.put('/events/:id', asyncHandler(updateAdminEvent))
router.delete('/events/:id', asyncHandler(deleteAdminEvent))

module.exports = router
