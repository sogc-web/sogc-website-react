const { env } = require('../../config/env')
const { sendContactNotification } = require('../../services/formMailer')
const { httpError } = require('../../utils/httpError')
const { runDeferred } = require('../../utils/runDeferred')

async function submitContactForm(request, response) {
  const { name, email, phone, role, message } = request.body

  if (!name || !email || !message) {
    throw httpError(400, 'Name, email, and message are required.')
  }

  runDeferred(
    async () => {
      try {
        await sendContactNotification({
          to: env.contactToEmail,
          name,
          email,
          phone,
          role,
          message,
        })
      } catch (error) {
        console.error('[contact-form] Failed to deliver notification email:', error)
      }
    },
    'contact-form-email',
  )

  response.status(202).json({
    success: true,
    message: 'Contact form submitted successfully.',
    delivery: 'queued',
  })
}

module.exports = { submitContactForm }
