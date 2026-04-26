const mongoose = require('mongoose')

const adminActivityLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      trim: true,
      default: '',
    },
    entityTitle: {
      type: String,
      trim: true,
      default: '',
    },
    operation: {
      type: String,
      required: true,
      trim: true,
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    actorRole: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

adminActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })
adminActivityLogSchema.index({ actorEmail: 1, createdAt: -1 })

adminActivityLogSchema.set('toJSON', {
  transform: (_doc, item) => {
    item.id = item._id.toString()
    delete item._id
    return item
  },
})

const AdminActivityLog =
  mongoose.models.AdminActivityLog || mongoose.model('AdminActivityLog', adminActivityLogSchema)

module.exports = { AdminActivityLog }
