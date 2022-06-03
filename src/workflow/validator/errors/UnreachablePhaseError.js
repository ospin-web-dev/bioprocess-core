const RuleViolationError = require('./RuleViolationError')

class UnreachablePhaseError extends RuleViolationError {

  constructor(data) {
    super('Workflow contains unreachable phase')
    this.type = 'UNREACHABLE_PHASE'
    this.data = data
  }

}

module.exports = UnreachablePhaseError
