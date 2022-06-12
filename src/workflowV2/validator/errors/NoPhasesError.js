const ConfigurationError = require('./ConfigurationError')

class NoPhasesError extends ConfigurationError {

  constructor() {
    super('Workflow has to contain at least one phase')
    this.type = 'NO_PHASES'
  }

}

module.exports = NoPhasesError
