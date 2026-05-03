const crypto = require('crypto')
const { env } = require('../../config/env')
const { Admin } = require('../../models/Admin')
const { sendAdminInviteEmail } = require('../../services/adminInviteMailer')
const { httpError } = require('../../utils/httpError')
const { runDeferred } = require('../../utils/runDeferred')

function normalizeEmail(value = '') {
  return value.trim().toLowerCase()
}

function buildInviteUrl(token) {
  return `${env.adminUrl.replace(/\/$/, '')}/invite/accept?token=${encodeURIComponent(token)}`
}

function buildInviteTokenFields() {
  const inviteToken = crypto.randomBytes(32).toString('hex')
  const inviteTokenExpiresAt = new Date(Date.now() + env.adminInviteTtlHours * 60 * 60 * 1000)

  return { inviteToken, inviteTokenExpiresAt }
}

function toAdminListItem(admin) {
  return {
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name,
    role: admin.role,
    status: admin.status,
    provider: admin.provider,
    invitedBy: admin.invitedBy || null,
    inviteAcceptedAt: admin.inviteAcceptedAt,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  }
}

async function sendInviteWithFallback({ admin, inviter }) {
  const inviteUrl = buildInviteUrl(admin.inviteToken)

  runDeferred(
    async () => {
      try {
        await sendAdminInviteEmail({
          inviteeEmail: admin.email,
          invitedByName: inviter.name || inviter.email,
          inviteUrl,
          expiresAt: admin.inviteTokenExpiresAt,
        })
      } catch (error) {
        console.error('[admin-invite] Failed to send invite email:', error)
      }
    },
    'admin-invite-email',
  )

  return {
    emailDelivery: {
      delivered: false,
      pending: true,
      error: '',
    },
    inviteUrl,
  }
}

async function listAdmins(_request, response) {
  const admins = await Admin.find().sort({ createdAt: -1 }).lean()

  response.json({
    items: admins.map((admin) => ({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
      status: admin.status,
      provider: admin.provider,
      invitedBy: admin.invitedBy || null,
      inviteAcceptedAt: admin.inviteAcceptedAt,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    })),
  })
}

async function inviteAdmin(request, response) {
  const email = normalizeEmail(request.body?.email)
  const name = String(request.body?.name || '').trim()

  if (!email) {
    throw httpError(400, 'Invite email is required.')
  }

  const existingAdmin = await Admin.findOne({ email })

  if (existingAdmin) {
    throw httpError(409, 'Admin already exists for this email. Use resend invite or update their status instead.')
  }

  const { inviteToken, inviteTokenExpiresAt } = buildInviteTokenFields()

  const admin = await Admin.create({
    email,
    name,
    role: 'admin',
    status: 'invited',
    provider: 'google',
    inviteToken,
    inviteTokenExpiresAt,
    invitedBy: request.admin._id,
  })

  const inviteResult = await sendInviteWithFallback({
    admin,
    inviter: request.admin,
  })

  response.status(201).json({
    item: toAdminListItem(admin),
    invite: {
      url: inviteResult.inviteUrl,
      expiresAt: admin.inviteTokenExpiresAt,
      emailDelivery: inviteResult.emailDelivery,
    },
    message: 'Admin invitation created. The invite email is being sent in the background.',
  })
}

async function resendInvite(request, response) {
  const admin = await Admin.findById(request.params.id)

  if (!admin) {
    throw httpError(404, 'Admin not found.')
  }

  if (admin.role === 'superadmin') {
    throw httpError(400, 'Superadmin records cannot be re-invited.')
  }

  if (admin.status !== 'invited') {
    throw httpError(400, 'Only invited admins can receive a new invite link.')
  }

  const { inviteToken, inviteTokenExpiresAt } = buildInviteTokenFields()

  admin.inviteToken = inviteToken
  admin.inviteTokenExpiresAt = inviteTokenExpiresAt
  admin.invitedBy = request.admin._id
  await admin.save()

  const inviteResult = await sendInviteWithFallback({
    admin,
    inviter: request.admin,
  })

  response.json({
    item: toAdminListItem(admin),
    invite: {
      url: inviteResult.inviteUrl,
      expiresAt: admin.inviteTokenExpiresAt,
      emailDelivery: inviteResult.emailDelivery,
    },
    message: 'Admin invitation refreshed. The invite email is being sent in the background.',
  })
}

async function disableAdmin(request, response) {
  const admin = await Admin.findById(request.params.id)

  if (!admin) {
    throw httpError(404, 'Admin not found.')
  }

  if (admin.role === 'superadmin') {
    throw httpError(400, 'Superadmin cannot be disabled through this route.')
  }

  if (admin._id.toString() === request.admin._id.toString()) {
    throw httpError(400, 'You cannot disable your own admin account.')
  }

  admin.status = 'disabled'
  admin.inviteToken = ''
  admin.inviteTokenExpiresAt = null
  await admin.save()

  response.json({
    item: toAdminListItem(admin),
    message: 'Admin disabled.',
  })
}

async function enableAdmin(request, response) {
  const admin = await Admin.findById(request.params.id)

  if (!admin) {
    throw httpError(404, 'Admin not found.')
  }

  if (admin.role === 'superadmin') {
    throw httpError(400, 'Superadmin does not need to be enabled through this route.')
  }

  admin.status = 'active'
  await admin.save()

  response.json({
    item: toAdminListItem(admin),
    message: 'Admin enabled.',
  })
}

async function removeAdmin(request, response) {
  const admin = await Admin.findById(request.params.id)

  if (!admin) {
    throw httpError(404, 'Admin not found.')
  }

  if (admin.role === 'superadmin') {
    throw httpError(400, 'Superadmin cannot be removed through this route.')
  }

  if (admin._id.toString() === request.admin._id.toString()) {
    throw httpError(400, 'You cannot remove your own admin account.')
  }

  await admin.deleteOne()

  response.status(204).send()
}

async function getInviteStatus(request, response) {
  const token = String(request.params.token || '').trim()

  if (!token) {
    throw httpError(400, 'Invite token is required.')
  }

  const admin = await Admin.findOne({
    inviteToken: token,
    inviteTokenExpiresAt: { $gt: new Date() },
  }).select('email role status inviteTokenExpiresAt')

  if (!admin) {
    throw httpError(404, 'Invite token is invalid or expired.')
  }

  response.json({
    item: {
      email: admin.email,
      role: admin.role,
      status: admin.status,
      inviteTokenExpiresAt: admin.inviteTokenExpiresAt,
    },
    message: 'Invite token is valid. Next step is Google OAuth sign-in with the same email.',
  })
}

module.exports = {
  disableAdmin,
  enableAdmin,
  getInviteStatus,
  inviteAdmin,
  listAdmins,
  removeAdmin,
  resendInvite,
}
