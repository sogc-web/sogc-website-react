const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const { hydrateAdminSession } = require('./middleware/adminAuth')
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers')
const healthRoutes = require('./routes/healthRoutes')
const formRoutes = require('./routes/forms')
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/authRoutes')
const publicEventRoutes = require('./routes/public/eventsRoutes')
const publicGalleryRoutes = require('./routes/public/galleryRoutes')
const publicPopupRoutes = require('./routes/public/popupRoutes')

const app = express()

app.set('trust proxy', 1)

const frontendUrls = env.frontendUrl ? env.frontendUrl.split(',').map(url => url.trim()) : []
const adminUrls = env.adminUrl ? env.adminUrl.split(',').map(url => url.trim()) : []

app.use(
  cors({
    origin: [...frontendUrls, ...adminUrls].filter(Boolean),
    credentials: true,
  }),
)
app.use(express.json({ limit: '160mb' }))
app.use(express.urlencoded({ extended: true, limit: '160mb' }))
app.use(hydrateAdminSession)

app.get('/', (_request, response) => {
  response.json({
    name: 'SOGC backend',
    status: 'ok',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/events', publicEventRoutes)
app.use('/api/gallery', publicGalleryRoutes)
app.use('/api/popup', publicPopupRoutes)
app.use('/api/forms', formRoutes)
app.use('/auth', authRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
