const mongoose = require('mongoose')

const popupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    buttonText: {
      type: String,
      trim: true,
      default: '',
    },
    linkedEventSlug: {
      type: String,
      trim: true,
      default: '',
    },
    linkedEventTitle: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    imagePublicId: {
      type: String,
      trim: true,
      default: '',
    },
    imageAlt: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdByEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    updatedByEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    openOnScroll: {
      type: Boolean,
      default: true,
    },
    openOnManualTrigger: {
      type: Boolean,
      default: true,
    },
    sessionStorageKey: {
      type: String,
      trim: true,
      default: 'event_popup_seen',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

popupSchema.set('toJSON', {
  transform: (_doc, popup) => {
    popup.id = popup._id.toString()
    delete popup._id
    return popup
  },
})

const Popup = mongoose.models.Popup || mongoose.model('Popup', popupSchema)

module.exports = { Popup }
