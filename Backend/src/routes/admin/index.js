const express = require('express')
const { getAdminBootstrap } = require('../../controllers/admin/metaController')
const {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvent,
  listAdminEvents,
  updateAdminEvent,
} = require('../../controllers/admin/eventsController')
const {
  activateAdminPopup,
  createAdminPopup,
  deleteAdminPopup,
  getAdminPopup,
  listAdminPopups,
  updateAdminPopup,
} = require('../../controllers/admin/popupController')
const { asyncHandler } = require('../../utils/asyncHandler')

const router = express.Router()

router.get('/', getAdminBootstrap)
router.get('/bootstrap', getAdminBootstrap)
router.get('/events', asyncHandler(listAdminEvents))
router.get('/events/:id', asyncHandler(getAdminEvent))
router.post('/events', asyncHandler(createAdminEvent))
router.put('/events/:id', asyncHandler(updateAdminEvent))
router.delete('/events/:id', asyncHandler(deleteAdminEvent))
router.get('/popups', asyncHandler(listAdminPopups))
router.get('/popups/:id', asyncHandler(getAdminPopup))
router.post('/popups', asyncHandler(createAdminPopup))
router.put('/popups/:id', asyncHandler(updateAdminPopup))
router.put('/popups/:id/activate', asyncHandler(activateAdminPopup))
router.delete('/popups/:id', asyncHandler(deleteAdminPopup))

module.exports = router
