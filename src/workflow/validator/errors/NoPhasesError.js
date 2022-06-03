const RuleViolationError = require('./RuleViolationError')

class NoPhasesError extends RuleViolationError {

  constructor() {
    super('Workflow has to contain at least one phase')
    this.type = 'NO_PHASES'
  }

}

module.exports = NoPhasesError
