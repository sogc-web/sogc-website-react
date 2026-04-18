const { getPublishedAdminEventBySlug, getPublishedAdminEvents } = require('../../data/adminEvents')
const { httpError } = require('../../utils/httpError')

function listEvents(_request, response) {
  response.json({
    items: getPublishedAdminEvents(),
  })
}

function getEventBySlug(request, response, next) {
  const event = getPublishedAdminEventBySlug(request.params.slug)

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
