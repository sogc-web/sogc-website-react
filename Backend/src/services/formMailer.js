const { sendEmail } = require('./mailer')

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
    .map(([label, value]) => `
      <tr>
        <td style="padding:10px 0;color:#cbbd8d;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:10px 0;color:#f3efe4;font-size:14px;line-height:1.7;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join('')
}

function buildFormHtml({ eyebrow, title, intro, details, bodyLabel, bodyText }) {
  const rows = buildRows(details)

  return `
    <div style="margin:0;padding:32px;background:#050707;font-family:Segoe UI,Arial,sans-serif;">
      <div style="max-width:720px;margin:0 auto;border:1px solid rgba(248,211,92,0.24);border-radius:28px;overflow:hidden;background:linear-gradient(180deg,#0b1210 0%,#101815 100%);">
        <div style="padding:28px 32px;border-bottom:1px solid rgba(248,211,92,0.18);background:linear-gradient(135deg,#111916 0%,#0a0f0d 100%);">
          <div style="color:#f8d35c;font-size:12px;letter-spacing:0.38em;text-transform:uppercase;">${escapeHtml(eyebrow)}</div>
          <h1 style="margin:14px 0 0;color:#ffffff;font-size:30px;line-height:1.2;">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 22px;color:#cfd8d2;font-size:15px;line-height:1.8;">${escapeHtml(intro)}</p>
          <table style="width:100%;border-collapse:collapse;">${rows}</table>
          ${bodyText ? `
            <div style="margin-top:24px;padding:18px 20px;border:1px solid rgba(248,211,92,0.16);border-radius:18px;background:rgba(255,255,255,0.02);">
              <div style="color:#cbbd8d;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(bodyLabel)}</div>
              <div style="margin-top:10px;color:#f3efe4;font-size:14px;line-height:1.8;">${escapeHtml(bodyText).replace(/\n/g, '<br />')}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `
}

async function sendContactNotification({ to, name, email, phone, role, message }) {
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

  return sendEmail({
    to,
    replyTo: email,
    subject,
    text,
    html: buildFormHtml({
      eyebrow: 'SOGC Contact Form',
      title: 'New contact enquiry',
      intro: 'A visitor submitted the contact form on the public website.',
      details: {
        Name: name,
        Email: email,
        Phone: phone || '-',
        Role: role || '-',
      },
      bodyLabel: 'Message',
      bodyText: message,
    }),
  })
}

async function sendVolunteerNotification({ to, name, email, phone }) {
  const subject = `New Cycle Mitra volunteer signup from ${name}`
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
  ].join('\n')

  return sendEmail({
    to,
    replyTo: email,
    subject,
    text,
    html: buildFormHtml({
      eyebrow: 'SOGC Volunteer Form',
      title: 'New Cycle Mitra signup',
      intro: 'A visitor submitted the volunteer form and wants to join as a Cycle Mitra.',
      details: {
        Name: name,
        Email: email,
        Phone: phone,
      },
      bodyLabel: '',
      bodyText: '',
    }),
  })
}

module.exports = {
  sendContactNotification,
  sendVolunteerNotification,
}
