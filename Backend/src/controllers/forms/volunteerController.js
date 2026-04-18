const { env } = require('../../config/env')
const { sendEmail } = require('../../services/mailer')
const { httpError } = require('../../utils/httpError')

async function submitVolunteerForm(request, response) {
  const { name, email, phone } = request.body

  if (!name || !email || !phone) {
    throw httpError(400, 'Name, email, and phone are required.')
  }

  const subject = `New Cycle Mitra volunteer signup from ${name}`
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
  ].join('\n')

  const html = `
    <h2>New volunteer signup</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
  `

  const mailResult = await sendEmail({
    to: env.volunteerToEmail,
    subject,
    text,
    html,
  })

  response.status(201).json({
    success: true,
    message: 'Volunteer form submitted successfully.',
    delivery: mailResult.mode,
  })
}

module.exports = { submitVolunteerForm }
