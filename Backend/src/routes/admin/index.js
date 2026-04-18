const express = require('express')
const { getAdminBootstrap } = require('../../controllers/admin/metaController')

const router = express.Router()

router.get('/', getAdminBootstrap)
router.get('/bootstrap', getAdminBootstrap)

module.exports = router
