const jwt = require('jwt-simple')
const { JWT_SECRET } = require('./config')

function tokenFromId(id) {
  return jwt.encode({ id }, JWT_SECRET)
}

module.exports = {
  tokenFromId,
}
