const mongoose = require('mongoose')
const { Popup } = require('../../models/Popup')

async function getActivePopup(_request, response) {
  if (mongoose.connection.readyState !== 1) {
    return response.json({ item: null })
  }

  const item = await Popup.findOne({ isActive: true }).sort({ updatedAt: -1 })

  response.json({ item })
}

module.exports = {
  getActivePopup,
}
