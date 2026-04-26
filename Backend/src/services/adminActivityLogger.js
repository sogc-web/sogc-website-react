const { AdminActivityLog } = require('../models/AdminActivityLog')

async function recordAdminActivity({
  entityType,
  entityId,
  entityTitle,
  operation,
  actorEmail,
  actorRole,
  metadata = {},
}) {
  if (!actorEmail) {
    return null
  }

  return AdminActivityLog.create({
    entityType,
    entityId: entityId ? String(entityId) : '',
    entityTitle: entityTitle || '',
    operation,
    actorEmail,
    actorRole: actorRole || '',
    metadata,
  })
}

module.exports = { recordAdminActivity }
