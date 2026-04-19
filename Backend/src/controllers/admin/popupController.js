const mongoose = require('mongoose')
const { Popup } = require('../../models/Popup')
const { deletePopupImage, uploadPopupImage } = require('../../services/eventImageUpload')
const { httpError } = require('../../utils/httpError')

function ensureDatabaseConnection() {
  if (mongoose.connection.readyState !== 1) {
    throw httpError(503, 'Database connection is not available')
  }
}

function normalizePayload(payload) {
  const title = String(payload.title ?? '').trim()

  return {
    title,
    description: String(payload.description ?? '').trim(),
    buttonText: String(payload.buttonText ?? '').trim(),
    linkedEventSlug: String(payload.linkedEventSlug ?? '').trim(),
    linkedEventTitle: String(payload.linkedEventTitle ?? '').trim(),
    imageUrl: String(payload.imageUrl ?? '').trim(),
    imagePublicId: String(payload.imagePublicId ?? '').trim(),
    imageAlt: title,
    imageFileData: typeof payload.imageFileData === 'string' ? payload.imageFileData : '',
    removeImage: Boolean(payload.removeImage),
    isActive: Boolean(payload.isActive),
    openOnScroll: Boolean(payload.openOnScroll),
    openOnManualTrigger: Boolean(payload.openOnManualTrigger),
    sessionStorageKey: String(payload.sessionStorageKey ?? '').trim() || 'event_popup_seen',
  }
}

function validatePopupPayload(payload) {
  const missingFields = []

  if (!payload.title) missingFields.push('popup title')
  if (!payload.description) missingFields.push('popup description')
  if (!payload.buttonText) missingFields.push('button label')
  if (!payload.linkedEventSlug) missingFields.push('linked event')
  if (!payload.imageUrl && !payload.imageFileData) missingFields.push('popup image')

  if (missingFields.length > 0) {
    throw httpError(400, `Please provide: ${missingFields.join(', ')}`)
  }
}

async function ensureSingleActivePopup(activePopupId) {
  await Popup.updateMany(
    { _id: { $ne: activePopupId } },
    { $set: { isActive: false } },
  )
}

async function listAdminPopups(_request, response) {
  ensureDatabaseConnection()

  const items = await Popup.find().sort({ createdAt: -1 })
  response.json({ items })
}

async function getAdminPopup(request, response) {
  ensureDatabaseConnection()

  const item = await Popup.findById(request.params.id)

  if (!item) {
    throw httpError(404, 'Popup not found')
  }

  response.json({ item })
}

async function createAdminPopup(request, response) {
  ensureDatabaseConnection()

  const payload = normalizePayload(request.body)
  validatePopupPayload(payload)

  if (payload.imageFileData) {
    const uploadedImage = await uploadPopupImage(payload.imageFileData, payload.linkedEventSlug || 'popup')
    payload.imageUrl = uploadedImage.imageUrl
    payload.imagePublicId = uploadedImage.imagePublicId
  }

  delete payload.imageFileData
  delete payload.removeImage

  const item = await Popup.create(payload)

  if (item.isActive) {
    await ensureSingleActivePopup(item._id)
  }

  response.status(201).json({ item })
}

async function updateAdminPopup(request, response) {
  ensureDatabaseConnection()

  const payload = normalizePayload(request.body)
  validatePopupPayload(payload)

  const item = await Popup.findById(request.params.id)

  if (!item) {
    throw httpError(404, 'Popup not found')
  }

  const previousImagePublicId = item.imagePublicId
  const previousImageUrl = item.imageUrl

  if (payload.imageFileData) {
    const uploadedImage = await uploadPopupImage(payload.imageFileData, payload.linkedEventSlug || 'popup')
    payload.imageUrl = uploadedImage.imageUrl
    payload.imagePublicId = uploadedImage.imagePublicId
    await deletePopupImage(previousImagePublicId, previousImageUrl)
  } else if (payload.removeImage) {
    await deletePopupImage(previousImagePublicId, previousImageUrl)
    payload.imageUrl = ''
    payload.imagePublicId = ''
  }

  delete payload.imageFileData
  delete payload.removeImage

  Object.assign(item, payload)
  await item.save()

  if (item.isActive) {
    await ensureSingleActivePopup(item._id)
  }

  response.json({ item })
}

async function activateAdminPopup(request, response) {
  ensureDatabaseConnection()

  const item = await Popup.findById(request.params.id)

  if (!item) {
    throw httpError(404, 'Popup not found')
  }

  item.isActive = true
  await item.save()
  await ensureSingleActivePopup(item._id)

  response.json({ item })
}

async function deleteAdminPopup(request, response) {
  ensureDatabaseConnection()

  const item = await Popup.findByIdAndDelete(request.params.id)

  if (!item) {
    throw httpError(404, 'Popup not found')
  }

  await deletePopupImage(item.imagePublicId, item.imageUrl)

  response.status(204).send()
}

module.exports = {
  activateAdminPopup,
  createAdminPopup,
  deleteAdminPopup,
  getAdminPopup,
  listAdminPopups,
  updateAdminPopup,
}
