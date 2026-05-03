function runDeferred(task, label = 'deferred-task') {
  setImmediate(() => {
    Promise.resolve()
      .then(task)
      .catch((error) => {
        console.error(`[${label}] Deferred task failed:`, error)
      })
  })
}

module.exports = { runDeferred }
