const RuleViolationError = require('./RuleViolationError')

class UnreachableEndEventDispatcherError extends RuleViolationError {

  constructor(data) {
    super('Workflow contains unreachable END event dispatcher')
    this.type = 'UNREACHABLE_END_EVENT_DISPATCHER'
    this.data = data
  }

}

module.exports = UnreachableEndEventDispatcherError
