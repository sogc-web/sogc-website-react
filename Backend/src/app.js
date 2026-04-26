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
const publicPopupRoutes = require('./routes/public/popupRoutes')

const app = express()

app.use(
  cors({
    origin: [env.frontendUrl, env.adminUrl].filter(Boolean),
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(hydrateAdminSession)

app.get('/', (_request, response) => {
  response.json({
    name: 'SOGC backend',
    status: 'ok',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/events', publicEventRoutes)
app.use('/api/popup', publicPopupRoutes)
app.use('/api/forms', formRoutes)
app.use('/auth', authRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
