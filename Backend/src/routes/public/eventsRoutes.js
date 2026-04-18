const express = require('express')
const { getEventBySlug, listEvents } = require('../../controllers/public/eventsController')

const router = express.Router()

router.get('/', listEvents)
router.get('/:slug', getEventBySlug)

module.exports = router
