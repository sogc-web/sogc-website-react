const { env } = require('../../config/env')
const { sendContactNotification } = require('../../services/formMailer')
const { httpError } = require('../../utils/httpError')

async function submitContactForm(request, response) {
  const { name, email, phone, role, message } = request.body

  if (!name || !email || !message) {
    throw httpError(400, 'Name, email, and message are required.')
  }

  const mailResult = await sendContactNotification({
    to: env.contactToEmail,
    name,
    email,
    phone,
    role,
    message,
  })

  response.status(201).json({
    success: true,
    message: 'Contact form submitted successfully.',
    delivery: mailResult.mode,
  })
}

module.exports = { submitContactForm }
