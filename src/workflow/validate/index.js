const { validateSchema } = require('../Workflow')
const Rules = require('./Rules')

const validateRules = wf => {
  Rules.containsExactlyOneStartEventListener(wf)
  Rules.containsAtLeastOnePhase(wf)
  Rules.containsAtLeastOneEndEventDispatcher(wf)
  Rules.everyPhaseIsReachable(wf)
  Rules.everyEndEventDispatcherIsReachable(wf)
}

/**
 * @function validate
 * @memberof Workflow
 * @arg {Object} workflow - workflow object
 * @desc validates a workflow in regards of the data schema and workflow rules
 */

const validate = wf => {
  validateSchema(wf)
  validateRules(wf)
}

module.exports = validate
