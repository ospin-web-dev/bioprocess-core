const ConfigurationError = require('./ConfigurationError')

class UnreachableEndEventDispatcherError extends ConfigurationError {

  constructor(data) {
    super('Workflow contains unreachable END event dispatcher')
    this.type = 'UNREACHABLE_END_EVENT_DISPATCHER'
    this.data = data
  }

}

module.exports = UnreachableEndEventDispatcherError
