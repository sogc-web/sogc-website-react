const mongoose = require('mongoose')

const galleryMediaSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GalleryCollection',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
      default: 'image',
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    secureUrl: {
      type: String,
      trim: true,
      default: '',
    },
    publicId: {
      type: String,
      trim: true,
      default: '',
    },
    resourceType: {
      type: String,
      trim: true,
      default: '',
    },
    format: {
      type: String,
      trim: true,
      default: '',
    },
    bytes: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    alt: {
      type: String,
      trim: true,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPublished: {
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

galleryMediaSchema.set('toJSON', {
  transform: (_doc, media) => {
    media.id = media._id.toString()
    media.collectionId = media.collectionId ? media.collectionId.toString() : ''
    delete media._id
    return media
  },
})

const GalleryMedia = mongoose.models.GalleryMedia || mongoose.model('GalleryMedia', galleryMediaSchema)

module.exports = { GalleryMedia }
