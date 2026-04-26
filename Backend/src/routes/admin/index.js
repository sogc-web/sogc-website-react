const express = require('express')
const { getAdminBootstrap, getAdminCsrf } = require('../../controllers/admin/metaController')
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
const { requireAdminCsrf } = require('../../middleware/adminCsrf')
const { adminInviteRateLimit } = require('../../middleware/rateLimits')
const { asyncHandler } = require('../../utils/asyncHandler')

const router = express.Router()

router.get('/invites/:token', asyncHandler(getInviteStatus))
router.get('/me', requireAdminAuth, getAdminMe)
router.get('/csrf', requireAdminAuth, getAdminCsrf)
router.get('/', requireAdminAuth, getAdminBootstrap)
router.get('/bootstrap', requireAdminAuth, getAdminBootstrap)
router.get('/admins', requireSuperAdmin, asyncHandler(listAdmins))
router.post('/admins/invite', requireSuperAdmin, adminInviteRateLimit, requireAdminCsrf, asyncHandler(inviteAdmin))
router.post(
  '/admins/:id/resend-invite',
  requireSuperAdmin,
  adminInviteRateLimit,
  requireAdminCsrf,
  asyncHandler(resendInvite),
)
router.patch('/admins/:id/disable', requireSuperAdmin, requireAdminCsrf, asyncHandler(disableAdmin))
router.patch('/admins/:id/enable', requireSuperAdmin, requireAdminCsrf, asyncHandler(enableAdmin))
router.delete('/admins/:id', requireSuperAdmin, requireAdminCsrf, asyncHandler(removeAdmin))
router.get('/events', requireAdminAuth, asyncHandler(listAdminEvents))
router.get('/events/:id', requireAdminAuth, asyncHandler(getAdminEvent))
router.post('/events', requireAdminAuth, requireAdminCsrf, asyncHandler(createAdminEvent))
router.put('/events/:id', requireAdminAuth, requireAdminCsrf, asyncHandler(updateAdminEvent))
router.delete('/events/:id', requireAdminAuth, requireAdminCsrf, asyncHandler(deleteAdminEvent))
router.get('/popups', requireAdminAuth, asyncHandler(listAdminPopups))
router.get('/popups/:id', requireAdminAuth, asyncHandler(getAdminPopup))
router.post('/popups', requireAdminAuth, requireAdminCsrf, asyncHandler(createAdminPopup))
router.put('/popups/:id', requireAdminAuth, requireAdminCsrf, asyncHandler(updateAdminPopup))
router.put('/popups/:id/activate', requireAdminAuth, requireAdminCsrf, asyncHandler(activateAdminPopup))
router.delete('/popups/:id', requireAdminAuth, requireAdminCsrf, asyncHandler(deleteAdminPopup))

module.exports = router
