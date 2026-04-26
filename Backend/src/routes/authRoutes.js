const express = require('express')
const {
  beginGoogleAuth,
  handleGoogleCallback,
  logoutAdmin,
} = require('../controllers/authController')
const { googleAuthRateLimit, googleCallbackRateLimit } = require('../middleware/rateLimits')

const router = express.Router()

router.get('/google', googleAuthRateLimit, beginGoogleAuth)
router.get('/google/callback', googleCallbackRateLimit, handleGoogleCallback)
router.post('/logout', logoutAdmin)

module.exports = router
