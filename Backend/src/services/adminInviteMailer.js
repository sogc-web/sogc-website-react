const { env } = require('../config/env')
const { sendEmail } = require('./mailer')

function formatInviteExpiry(expiresAt) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Calcutta',
    timeZoneName: 'short',
  }).format(expiresAt)
}

function buildInviteEmail({ inviteeEmail, invitedByName, inviteUrl, expiresAt }) {
  const subject = 'SOGC Admin invitation'
  const formattedExpiry = formatInviteExpiry(expiresAt)
  const text = [
    'You have been invited to access the SOGC admin panel.',
    '',
    `Email: ${inviteeEmail}`,
    `Invited by: ${invitedByName || 'SOGC Superadmin'}`,
    `Accept invite: ${inviteUrl}`,
    `Expires at: ${formattedExpiry}`,
    '',
    'You must sign in with Google using the same invited email address.',
  ].join('\n')

  const html = `
    <div style="margin:0;padding:32px;background:#050707;font-family:Segoe UI,Arial,sans-serif;color:#f4efe3;">
      <div style="max-width:680px;margin:0 auto;border:1px solid rgba(248,211,92,0.24);border-radius:24px;overflow:hidden;background:linear-gradient(180deg,#0b1210 0%,#101815 100%);">
        <div style="padding:28px 32px;border-bottom:1px solid rgba(248,211,92,0.18);background:linear-gradient(135deg,#111916 0%,#0a0f0d 100%);">
          ${env.logoImage ? `<img src="${env.logoImage}" alt="SOGC Admin" style="height:56px;display:block;margin-bottom:18px;" />` : ''}
          <div style="letter-spacing:0.35em;font-size:12px;color:#f8d35c;text-transform:uppercase;">SOGC Admin Invite</div>
          <h1 style="margin:14px 0 0;font-size:34px;line-height:1.15;color:#f8f4ea;">Access invitation</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#d6d2c8;">
            You have been invited to access the SOGC admin panel as an <strong>admin</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#d6d2c8;">
            Sign in with Google using <strong>${inviteeEmail}</strong>. The invite link below is valid until
            <strong>${formattedExpiry}</strong>.
          </p>
          <a href="${inviteUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#f8d35c;color:#151515;font-weight:700;text-decoration:none;">Accept invite</a>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#a9a59b;">
            Invited by: ${invitedByName || 'SOGC Superadmin'}<br />
            If this was not expected, you can ignore this email.
          </p>
        </div>
      </div>
    </div>
  `

  return { subject, text, html }
}

async function sendAdminInviteEmail({ inviteeEmail, invitedByName, inviteUrl, expiresAt }) {
  const { subject, text, html } = buildInviteEmail({
    inviteeEmail,
    invitedByName,
    inviteUrl,
    expiresAt,
  })

  return sendEmail({
    to: inviteeEmail,
    subject,
    text,
    html,
  })
}

module.exports = { sendAdminInviteEmail }
