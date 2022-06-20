const ConfigurationError = require('./ConfigurationError')

class IncorrectAmountOfStartEventListenersError extends ConfigurationError {

  constructor() {
    super('Workflow has to contain exactly one START event listener')
    this.type = 'INCORRECT_AMOUNT_OF_START_EVENT_LISTENERS'
  }

}

module.exports = IncorrectAmountOfStartEventListenersError
