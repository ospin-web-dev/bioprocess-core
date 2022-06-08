const ConfigurationError = require('./ConfigurationError')

class IncorrectElementTypeError extends ConfigurationError {

  constructor(message, { el }) {
    super(message)
    this.type = 'INCORRECT_ELEMENT_TYPE'
    this.data = { el }
  }

}

module.exports = IncorrectElementTypeError
