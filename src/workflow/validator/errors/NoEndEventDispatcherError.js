const RuleViolationError = require('./RuleViolationError')

class NoEndEventDispatcherError extends RuleViolationError {

  constructor() {
    super('Workflow has to contain at least one END event dispatcher')
    this.type = 'NO_END_EVENT_DISPATCHER'
  }

}

module.exports = NoEndEventDispatcherError
