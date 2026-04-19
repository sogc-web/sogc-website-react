const express = require('express')
const { getActivePopup } = require('../../controllers/public/popupController')

const router = express.Router()

router.get('/', getActivePopup)

module.exports = router
