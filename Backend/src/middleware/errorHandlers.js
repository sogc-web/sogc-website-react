function notFoundHandler(request, response) {
  response.status(404).json({
    error: `Route not found: ${request.method} ${request.originalUrl}`,
  })
}

function errorHandler(error, _request, response, _next) {
  const status = error.status || 500

  response.status(status).json({
    error: error.message || 'Internal server error',
  })
}

module.exports = { notFoundHandler, errorHandler }
