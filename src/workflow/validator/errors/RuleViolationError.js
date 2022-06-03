class RuleViolationError extends Error {

  constructor(message) {
    super(message)
    this.name = 'RuleViolationError'
  }

}

module.exports = RuleViolationError
