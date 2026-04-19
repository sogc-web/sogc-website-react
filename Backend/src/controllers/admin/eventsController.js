const mongoose = require('mongoose')
const { Event } = require('../../models/Event')
const { deleteEventImage, uploadEventImage } = require('../../services/eventImageUpload')
const { httpError } = require('../../utils/httpError')
const { slugify } = require('../../utils/slugify')

function ensureDatabaseConnection() {
  if (mongoose.connection.readyState !== 1) {
    throw httpError(503, 'Database connection is not available')
  }
}

function sanitizeHighlights(highlights) {
  if (!Array.isArray(highlights)) {
    return []
  }

  return highlights.map((item) => String(item).trim()).filter(Boolean)
}

function normalizePayload(payload) {
  const title = String(payload.title ?? '').trim()

  return {
    title,
    description: String(payload.description ?? '').trim(),
    date: String(payload.date ?? '').trim(),
    location: String(payload.location ?? '').trim(),
    tag: String(payload.tag ?? '').trim(),
    scheduleLine: String(payload.scheduleLine ?? '').trim(),
    bookletScheduleNote: String(payload.bookletScheduleNote ?? '').trim(),
    about: String(payload.about ?? '').trim(),
    experience: String(payload.experience ?? '').trim(),
    registrationUrl: String(payload.registrationUrl ?? '').trim(),
    imageUrl: String(payload.imageUrl ?? '').trim(),
    imagePublicId: String(payload.imagePublicId ?? '').trim(),
    imageAlt: title,
    imageFileData: typeof payload.imageFileData === 'string' ? payload.imageFileData : '',
    removeImage: Boolean(payload.removeImage),
    highlights: sanitizeHighlights(payload.highlights),
    isPublished: Boolean(payload.isPublished),
  }
}

function validateRequiredFields(payload) {
  const missingFields = []

  if (!payload.title) missingFields.push('title')
  if (!payload.description) missingFields.push('description')
  if (!payload.date) missingFields.push('date')
  if (!payload.location) missingFields.push('location')
  if (!payload.scheduleLine) missingFields.push('schedule line')
  if (!payload.bookletScheduleNote) missingFields.push('booklet schedule note')
  if (!payload.about) missingFields.push('about')
  if (!payload.experience) missingFields.push('experience')
  if (!payload.imageUrl && !payload.imageFileData) missingFields.push('event image')

  if (missingFields.length > 0) {
    throw httpError(400, `Please provide: ${missingFields.join(', ')}`)
  }

  if (!payload.highlights.length) {
    throw httpError(400, 'Please add at least one highlight')
  }
}

async function buildUniqueSlug(title, excludeId = null) {
  const baseSlug = slugify(title)

  if (!baseSlug) {
    throw httpError(400, 'A valid title is required to generate the slug')
  }

  let slug = baseSlug
  let suffix = 1

  while (true) {
    const existingEvent = await Event.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })

    if (!existingEvent) {
      return slug
    }

    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }
}

async function listAdminEvents(_request, response) {
  ensureDatabaseConnection()

  const items = await Event.find().sort({ createdAt: -1 })
  response.json({ items })
}

async function getAdminEvent(request, response) {
  ensureDatabaseConnection()

  const item = await Event.findById(request.params.id)

  if (!item) {
    throw httpError(404, 'Event not found')
  }

  response.json({ item })
}

async function createAdminEvent(request, response) {
  ensureDatabaseConnection()

  const payload = normalizePayload(request.body)
  validateRequiredFields(payload)
  payload.slug = await buildUniqueSlug(payload.title)

  if (payload.imageFileData) {
    const uploadedImage = await uploadEventImage(payload.imageFileData, payload.slug)
    payload.imageUrl = uploadedImage.imageUrl
    payload.imagePublicId = uploadedImage.imagePublicId
  }

  delete payload.imageFileData
  delete payload.removeImage

  const item = await Event.create(payload)
  response.status(201).json({ item })
}

async function updateAdminEvent(request, response) {
  ensureDatabaseConnection()

  const payload = normalizePayload(request.body)
  validateRequiredFields(payload)

  const item = await Event.findById(request.params.id)

  if (!item) {
    throw httpError(404, 'Event not found')
  }

  payload.slug = await buildUniqueSlug(payload.title, item._id)

  const previousImagePublicId = item.imagePublicId
  const previousImageUrl = item.imageUrl

  if (payload.imageFileData) {
    const uploadedImage = await uploadEventImage(payload.imageFileData, payload.slug)
    payload.imageUrl = uploadedImage.imageUrl
    payload.imagePublicId = uploadedImage.imagePublicId
    await deleteEventImage(previousImagePublicId, previousImageUrl)
  } else if (payload.removeImage) {
    await deleteEventImage(previousImagePublicId, previousImageUrl)
    payload.imageUrl = ''
    payload.imagePublicId = ''
  }

  delete payload.imageFileData
  delete payload.removeImage

  Object.assign(item, payload)
  await item.save()

  response.json({ item })
}

async function deleteAdminEvent(request, response) {
  ensureDatabaseConnection()

  const item = await Event.findByIdAndDelete(request.params.id)

  if (!item) {
    throw httpError(404, 'Event not found')
  }

  await deleteEventImage(item.imagePublicId, item.imageUrl)

  response.status(204).send()
}

module.exports = {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvent,
  listAdminEvents,
  updateAdminEvent,
}
