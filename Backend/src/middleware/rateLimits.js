const rateLimit = require('express-rate-limit')

function buildJsonLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: message,
    },
  })
}

const googleAuthRateLimit = buildJsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many Google sign-in attempts. Please wait a few minutes and try again.',
})

const googleCallbackRateLimit = buildJsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many Google callback attempts. Please retry after a short wait.',
})

const adminInviteRateLimit = buildJsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many admin invite requests. Please wait before sending more invites.',
})

module.exports = {
  adminInviteRateLimit,
  googleAuthRateLimit,
  googleCallbackRateLimit,
}
