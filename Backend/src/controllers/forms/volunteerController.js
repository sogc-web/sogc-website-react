const { env } = require('../../config/env')
const { sendVolunteerNotification } = require('../../services/formMailer')
const { httpError } = require('../../utils/httpError')
const { runDeferred } = require('../../utils/runDeferred')

async function submitVolunteerForm(request, response) {
  const { name, email, phone } = request.body

  if (!name || !email || !phone) {
    throw httpError(400, 'Name, email, and phone are required.')
  }

  runDeferred(
    async () => {
      try {
        await sendVolunteerNotification({
          to: env.volunteerToEmail,
          name,
          email,
          phone,
        })
      } catch (error) {
        console.error('[volunteer-form] Failed to deliver notification email:', error)
      }
    },
    'volunteer-form-email',
  )

  response.status(202).json({
    success: true,
    message: 'Volunteer form submitted successfully.',
    delivery: 'queued',
  })
}

module.exports = { submitVolunteerForm }
