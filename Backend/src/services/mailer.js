const nodemailer = require('nodemailer')
const { env } = require('../config/env')

function createTransporter() {
  if (env.emailMode === 'console' || !env.mailHost) {
    return null
  }

  return nodemailer.createTransport({
    host: env.mailHost,
    port: env.mailPort,
    secure: env.mailSecure,
    auth: env.mailUser && env.mailPass ? { user: env.mailUser, pass: env.mailPass } : undefined,
  })
}

async function sendEmail({ to, subject, text, html, replyTo }) {
  const transporter = createTransporter()

  if (!transporter) {
    console.log('[EMAIL:console-mode]', { to, subject, text, html, replyTo })
    return { delivered: false, mode: 'console' }
  }

  const result = await transporter.sendMail({
    from: env.mailFrom,
    to,
    replyTo,
    subject,
    text,
    html,
  })

  return { delivered: true, mode: 'smtp', result }
}

module.exports = { sendEmail }
