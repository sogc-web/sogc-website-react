const mongoose = require('mongoose')

const galleryCollectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    eyebrow: {
      type: String,
      trim: true,
      default: '',
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    coverMediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GalleryMedia',
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

galleryCollectionSchema.index({ isPublished: 1, sortOrder: 1, createdAt: -1 })
galleryCollectionSchema.index({ createdAt: -1 })

galleryCollectionSchema.set('toJSON', {
  transform: (_doc, collection) => {
    collection.id = collection._id.toString()
    delete collection._id
    return collection
  },
})

const GalleryCollection =
  mongoose.models.GalleryCollection || mongoose.model('GalleryCollection', galleryCollectionSchema)

module.exports = { GalleryCollection }
