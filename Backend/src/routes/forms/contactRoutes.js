const express = require('express')
const { asyncHandler } = require('../../utils/asyncHandler')
const { submitContactForm } = require('../../controllers/forms/contactController')

const router = express.Router()

router.post('/', asyncHandler(submitContactForm))

module.exports = router
