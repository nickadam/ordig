'use strict'

module.exports = (hostname, key, next) => {
  next(null, {
    hostname: hostname,
    key: key
  })
}
