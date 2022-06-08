const ConfigurationError = require('./ConfigurationError')

class IncorrectAmountOfIncomingFlowsError extends ConfigurationError {

  constructor(message, { el }) {
    super(message)
    this.type = 'INCORRECT_AMOUNT_OF_OUTGOING_FLOWS'
    this.data = { el }
  }

}

module.exports = IncorrectAmountOfIncomingFlowsError
