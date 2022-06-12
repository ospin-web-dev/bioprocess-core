const Workflow = require('../Workflow')
const Rules = require('./Rules')

class Validator {

  static validateRules(workflow) {
    Rules.containsExactlyOneStartEventListener(workflow)
    Rules.containsAtLeastOnePhase(workflow)
    Rules.everyPhaseIsReachable(workflow)
    Rules.containsAtLeastOneEndEventDispatcher(workflow)
    Rules.everyEndEventDispatcherIsReachable(workflow)
  }

  static validate(workflow) {
    Workflow.validateSchema(workflow)
    Validator.validateRules(workflow)
  }

}

module.exports = Validator
