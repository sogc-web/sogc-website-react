const dotenv = require('dotenv')

dotenv.config()

function toBoolean(value, fallback = false) {
  if (value === undefined) return fallback
  return String(value).toLowerCase() === 'true'
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
  mongodbUri: process.env.MONGODB_URI || '',
  emailMode: process.env.EMAIL_MODE || 'console',
  mailHost: process.env.MAIL_HOST || '',
  mailPort: Number(process.env.MAIL_PORT || 587),
  mailSecure: toBoolean(process.env.MAIL_SECURE, false),
  mailUser: process.env.MAIL_USER || '',
  mailPass: process.env.MAIL_PASS || '',
  mailFrom: process.env.MAIL_FROM || 'SOGC Website <no-reply@example.com>',
  contactToEmail: process.env.CONTACT_TO_EMAIL || 'societyofglobalcycle@gmail.com',
  volunteerToEmail: process.env.VOLUNTEER_TO_EMAIL || 'societyofglobalcycle@gmail.com',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  sessionSecret: process.env.SESSION_SECRET || '',
}

module.exports = { env }
