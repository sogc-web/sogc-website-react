const adminEvents = []

function getPublishedAdminEvents() {
  return adminEvents
    .filter((event) => event.isPublished !== false)
    .slice()
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
}

function getPublishedAdminEventBySlug(slug) {
  return getPublishedAdminEvents().find((event) => event.slug === slug) ?? null
}

module.exports = {
  getPublishedAdminEvents,
  getPublishedAdminEventBySlug,
}
