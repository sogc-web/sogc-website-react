const mongoose = require('mongoose')

const ADMIN_ROLES = ['superadmin', 'admin']
const ADMIN_STATUSES = ['invited', 'active', 'disabled']

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      required: true,
      default: 'admin',
    },
    status: {
      type: String,
      enum: ADMIN_STATUSES,
      required: true,
      default: 'invited',
    },
    provider: {
      type: String,
      trim: true,
      default: 'google',
    },
    providerId: {
      type: String,
      trim: true,
      default: '',
    },
    inviteToken: {
      type: String,
      trim: true,
      default: '',
    },
    inviteTokenExpiresAt: {
      type: Date,
      default: null,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    inviteAcceptedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

adminSchema.index({ role: 1, status: 1 })
adminSchema.index({ inviteToken: 1 }, { sparse: true })

adminSchema.set('toJSON', {
  transform: (_doc, admin) => {
    admin.id = admin._id.toString()
    delete admin._id
    delete admin.inviteToken
    return admin
  },
})

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema)

module.exports = { Admin, ADMIN_ROLES, ADMIN_STATUSES }
