const ConfigurationError = require('./ConfigurationError')

class UnreachablePhaseError extends ConfigurationError {

  constructor(data) {
    super('Workflow contains unreachable phase')
    this.type = 'UNREACHABLE_PHASE'
    this.data = data
  }

}

module.exports = UnreachablePhaseError
