const { Resend } = require('resend')
const { env } = require('../config/env')

const resend = new Resend(env.resendApiKey)

async function sendEmail({ to, subject, text, html, replyTo, templateId, variables }) {
  if (env.emailMode === 'console' || !env.resendApiKey) {
    console.log('[EMAIL:console-mode]', { to, subject, text, html, replyTo, templateId, variables })
    return { delivered: false, mode: 'console' }
  }

  try {
    const payload = {
      from: 'onboarding@resend.dev',
      to,
      reply_to: replyTo,
      subject,
    }

    if (templateId) {
      payload.template = {
        id: templateId,
        variables: variables || {},
      }
    } else {
      payload.text = text
      payload.html = html
    }

    const data = await resend.emails.send(payload)

    return { delivered: true, mode: 'resend', result: data }
  } catch (error) {
    console.error('[EMAIL:resend-error]', error)
    throw error
  }
}

module.exports = { sendEmail }
