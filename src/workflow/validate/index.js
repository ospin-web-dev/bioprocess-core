const { validateSchema } = require('../Workflow')
const Rules = require('./Rules')

const validateRules = wf => {
  Rules.containsExactlyOneStartEventListener(wf)
  Rules.containsAtLeastOnePhase(wf)
  Rules.containsAtLeastOneEndEventDispatcher(wf)
  Rules.everyPhaseIsReachable(wf)
  Rules.everyEndEventDispatcherIsReachable(wf)
}

const validate = wf => {
  validateSchema(wf)
  validateRules(wf)
}

module.exports = validate
