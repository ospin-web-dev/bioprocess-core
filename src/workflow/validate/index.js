const { validateSchema } = require('..')
const Rules = require('./Rules')

const validateRules = wf => {
  /* we are not asserting rules that are asserted via the API, like having at least one phase */
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
