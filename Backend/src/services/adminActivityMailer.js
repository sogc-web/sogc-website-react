const { env } = require('../config/env')
const { sendEmail } = require('./mailer')

function getLogoUrl() {
  if (env.logoImage) {
    return String(env.logoImage).trim()
  }

  if (!env.adminUrl) {
    return ''
  }

  return `${env.adminUrl.replace(/\/+$/, '')}/sogc-logo.png`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildRows(details) {
  return Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => {
      const formattedValue = Array.isArray(value) ? value.join(', ') : String(value)

      return `
        <tr>
          <td style="padding:10px 0;color:#cbbd8d;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;color:#f3efe4;font-size:14px;line-height:1.6;vertical-align:top;">${escapeHtml(formattedValue)}</td>
        </tr>
      `
    })
    .join('')
}

function buildAdminActivityTemplate({ subject, entityType, operation, details, actorEmail }) {
  const logoUrl = getLogoUrl()
  const rows = buildRows({
    Type: entityType,
    Operation: operation,
    PerformedBy: actorEmail || '',
    ...details,
    Timestamp: new Date().toISOString(),
  })

  const html = `
    <div style="margin:0;padding:32px;background:#050707;font-family:Segoe UI,Arial,sans-serif;">
      <div style="max-width:720px;margin:0 auto;border:1px solid rgba(248,211,92,0.24);border-radius:28px;overflow:hidden;background:linear-gradient(180deg,#0b1210 0%,#101815 100%);">
        <div style="padding:28px 32px;border-bottom:1px solid rgba(248,211,92,0.18);background:linear-gradient(135deg,#111916 0%,#0a0f0d 100%);">
          ${logoUrl ? `<img src="${logoUrl}" alt="SOGC Admin" style="width:88px;height:88px;object-fit:contain;display:block;margin-bottom:18px;">` : ''}
          <div style="color:#f8d35c;font-size:12px;letter-spacing:0.38em;text-transform:uppercase;">SOGC Admin Activity</div>
          <h1 style="margin:14px 0 0;color:#ffffff;font-size:30px;line-height:1.2;">${escapeHtml(subject)}</h1>
        </div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 22px;color:#cfd8d2;font-size:15px;line-height:1.8;">
            An admin-side content operation was completed. Details of the activity are summarized in the table below for your reference.
          </p>
          <table style="width:100%;border-collapse:collapse;">
            ${rows}
          </table>
        </div>
      </div>
    </div>
  `

  const text = [
    subject,
    '',
    `Type: ${entityType}`,
    `Operation: ${operation}`,
    ...(actorEmail ? [`PerformedBy: ${actorEmail}`] : []),
    ...Object.entries(details)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join(', ') : value}`),
    `Timestamp: ${new Date().toISOString()}`,
  ].join('\n')

  return { html, text }
}

async function notifyAdminActivity({ entityType, operation, details, actorEmail }) {
  if (!env.sendToMail) {
    return { delivered: false, skipped: true, reason: 'missing-send-to-mail' }
  }

  const subject = `${entityType} ${operation}`
  const { html, text } = buildAdminActivityTemplate({ subject, entityType, operation, details, actorEmail })

  try {
    return await sendEmail({
      to: env.sendToMail,
      subject: `SOGC Admin: ${subject}`,
      text,
      html,
    })
  } catch (error) {
    console.error('[admin-activity-email] Failed to send notification:', error)
    return { delivered: false, skipped: true, reason: 'send-failed' }
  }
}

module.exports = { notifyAdminActivity }
