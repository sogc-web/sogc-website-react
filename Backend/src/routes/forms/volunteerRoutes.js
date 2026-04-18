const express = require('express')
const { asyncHandler } = require('../../utils/asyncHandler')
const { submitVolunteerForm } = require('../../controllers/forms/volunteerController')

const router = express.Router()

router.post('/', asyncHandler(submitVolunteerForm))

module.exports = router
