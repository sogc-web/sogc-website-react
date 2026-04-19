const mongoose = require('mongoose')
const { getPublishedAdminEventBySlug, getPublishedAdminEvents } = require('../../data/adminEvents')
const { Event } = require('../../models/Event')
const { httpError } = require('../../utils/httpError')

async function listEvents(_request, response) {
  if (mongoose.connection.readyState === 1) {
    const items = await Event.find({ isPublished: true }).sort({ createdAt: -1 })

    return response.json({
      items,
    })
  }

  response.json({
    items: getPublishedAdminEvents(),
  })
}

async function getEventBySlug(request, response, next) {
  let event = null

  if (mongoose.connection.readyState === 1) {
    event = await Event.findOne({ slug: request.params.slug, isPublished: true })
  } else {
    event = getPublishedAdminEventBySlug(request.params.slug)
  }

  if (!event) {
    return next(httpError(404, 'Event not found'))
  }

  response.json({
    item: event,
  })
}

module.exports = {
  getEventBySlug,
  listEvents,
}
