const express = require('express')
const {
  beginGoogleAuth,
  handleGoogleCallback,
  logoutAdmin,
} = require('../controllers/authController')

const router = express.Router()

router.get('/google', beginGoogleAuth)
router.get('/google/callback', handleGoogleCallback)
router.post('/logout', logoutAdmin)

module.exports = router
