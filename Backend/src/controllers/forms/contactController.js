const { env } = require('../../config/env')
const { sendEmail } = require('../../services/mailer')
const { httpError } = require('../../utils/httpError')

async function submitContactForm(request, response) {
  const { name, email, phone, role, message } = request.body

  if (!name || !email || !message) {
    throw httpError(400, 'Name, email, and message are required.')
  }

  const subject = `New contact form submission from ${name}`
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || '-'}`,
    `Role: ${role || '-'}`,
    '',
    'Message:',
    message,
  ].join('\n')

  const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || '-'}</p>
    <p><strong>Role:</strong> ${role || '-'}</p>
    <p><strong>Message:</strong></p>
    <p>${String(message).replace(/\n/g, '<br />')}</p>
  `

  const mailResult = await sendEmail({
    to: env.contactToEmail,
    subject,
    text,
    html,
  })

  response.status(201).json({
    success: true,
    message: 'Contact form submitted successfully.',
    delivery: mailResult.mode,
  })
}

module.exports = { submitContactForm }
