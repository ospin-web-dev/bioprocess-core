const ConfigurationError = require('./ConfigurationError')

class ForbiddenConnectionError extends ConfigurationError {

  constructor(message, { srcEl, destEl }) {
    super(message)
    this.type = 'FORBIDDEN_CONNECTION'
    this.data = { srcEl, destEl }
  }

}

module.exports = ForbiddenConnectionError
