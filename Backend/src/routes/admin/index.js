const express = require('express')
const { getAdminBootstrap } = require('../../controllers/admin/metaController')
const {
  disableAdmin,
  enableAdmin,
  getInviteStatus,
  inviteAdmin,
  listAdmins,
  removeAdmin,
  resendInvite,
} = require('../../controllers/admin/adminsController')
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
const { getAdminMe } = require('../../controllers/authController')
const { requireAdminAuth, requireSuperAdmin } = require('../../middleware/adminAuth')
const { asyncHandler } = require('../../utils/asyncHandler')

const router = express.Router()

router.get('/invites/:token', asyncHandler(getInviteStatus))
router.get('/me', requireAdminAuth, getAdminMe)
router.get('/', requireAdminAuth, getAdminBootstrap)
router.get('/bootstrap', requireAdminAuth, getAdminBootstrap)
router.get('/admins', requireSuperAdmin, asyncHandler(listAdmins))
router.post('/admins/invite', requireSuperAdmin, asyncHandler(inviteAdmin))
router.post('/admins/:id/resend-invite', requireSuperAdmin, asyncHandler(resendInvite))
router.patch('/admins/:id/disable', requireSuperAdmin, asyncHandler(disableAdmin))
router.patch('/admins/:id/enable', requireSuperAdmin, asyncHandler(enableAdmin))
router.delete('/admins/:id', requireSuperAdmin, asyncHandler(removeAdmin))
router.get('/events', requireAdminAuth, asyncHandler(listAdminEvents))
router.get('/events/:id', requireAdminAuth, asyncHandler(getAdminEvent))
router.post('/events', requireAdminAuth, asyncHandler(createAdminEvent))
router.put('/events/:id', requireAdminAuth, asyncHandler(updateAdminEvent))
router.delete('/events/:id', requireAdminAuth, asyncHandler(deleteAdminEvent))
router.get('/popups', requireAdminAuth, asyncHandler(listAdminPopups))
router.get('/popups/:id', requireAdminAuth, asyncHandler(getAdminPopup))
router.post('/popups', requireAdminAuth, asyncHandler(createAdminPopup))
router.put('/popups/:id', requireAdminAuth, asyncHandler(updateAdminPopup))
router.put('/popups/:id/activate', requireAdminAuth, asyncHandler(activateAdminPopup))
router.delete('/popups/:id', requireAdminAuth, asyncHandler(deleteAdminPopup))

module.exports = router
