const RuleViolationError = require('./RuleViolationError')

class IncorrectAmountOfStartEventListenersError extends RuleViolationError {

  constructor(data) {
    super('Workflow has to contain exactly one START event listener')
    this.type = 'INCORRECT_AMOUNT_OF_START_EVENT_LISTENERS'
    this.data = data
  }

}

module.exports = IncorrectAmountOfStartEventListenersError
