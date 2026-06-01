const { Resend } = require('resend')
const { env } = require('../config/env')

const resend = new Resend(env.resendApiKey)

async function sendEmail({ to, subject, text, html, replyTo }) {
  if (env.emailMode === 'console' || !env.resendApiKey) {
    console.log('[EMAIL:console-mode]', { to, subject, text, html, replyTo })
    return { delivered: false, mode: 'console' }
  }

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      reply_to: replyTo,
      subject,
      text,
      html,
    })

    return { delivered: true, mode: 'resend', result: data }
  } catch (error) {
    console.error('[EMAIL:resend-error]', error)
    throw error
  }
}

module.exports = { sendEmail }
