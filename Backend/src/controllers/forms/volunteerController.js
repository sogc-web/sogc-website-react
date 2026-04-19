const { env } = require('../../config/env')
const { sendVolunteerNotification } = require('../../services/formMailer')
const { httpError } = require('../../utils/httpError')

async function submitVolunteerForm(request, response) {
  const { name, email, phone } = request.body

  if (!name || !email || !phone) {
    throw httpError(400, 'Name, email, and phone are required.')
  }

  const mailResult = await sendVolunteerNotification({
    to: env.volunteerToEmail,
    name,
    email,
    phone,
  })

  response.status(201).json({
    success: true,
    message: 'Volunteer form submitted successfully.',
    delivery: mailResult.mode,
  })
}

module.exports = { submitVolunteerForm }
