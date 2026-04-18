const express = require('express')
const contactRoutes = require('./contactRoutes')
const volunteerRoutes = require('./volunteerRoutes')

const router = express.Router()

router.use('/contact', contactRoutes)
router.use('/volunteer', volunteerRoutes)

module.exports = router
