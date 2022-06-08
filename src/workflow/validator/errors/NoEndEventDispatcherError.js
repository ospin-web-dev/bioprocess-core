const ConfigurationError = require('./ConfigurationError')

class NoEndEventDispatcherError extends ConfigurationError {

  constructor() {
    super('Workflow has to contain at least one END event dispatcher')
    this.type = 'NO_END_EVENT_DISPATCHER'
  }

}

module.exports = NoEndEventDispatcherError
