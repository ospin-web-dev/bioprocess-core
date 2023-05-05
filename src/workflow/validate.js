const WorkflowGraphTools = require('./WorkflowGraphTools')

const UnreachablePhaseError = require('./errors/UnreachablePhaseError')
const UnreachableEndEventDispatcherError = require('./errors/UnreachableEndEventDispatcherError')
const IncorrectAmountOfStartEventListenersError = require('./errors/IncorrectAmountOfStartEventListenersError')
const NoPhasesError = require('./errors/NoPhasesError')
const NoEndEventDispatcherError = require('./errors/NoEndEventDispatcherError')

const Workflow = require('./Workflow')

// This is defined here to prevent cicular dependecies

const containsExactlyOneStartEventListener = wf => {
  const startEventListeners = Workflow.getStartEventListeners(wf)
  if (startEventListeners.length !== 1) {
    throw new IncorrectAmountOfStartEventListenersError()
  }
}

const containsAtLeastOnePhase = wf => {
  const phases = Workflow.getPhases(wf)
  if (phases.length === 0) throw new NoPhasesError()
}

const everyPhaseIsReachable = wf => {
  const phases = Workflow.getPhases(wf)
  phases.forEach(phase => {
    if (!WorkflowGraphTools.elementIsReachable(wf, phase.id)) {
      throw new UnreachablePhaseError({ phase })
    }
  })
}

const containsAtLeastOneEndEventDispatcher = wf => {
  const endDispatchers = Workflow.getEndEventDispatchers(wf)
  if (endDispatchers.length === 0) throw new NoEndEventDispatcherError()
}

const everyEndEventDispatcherIsReachable = wf => {
  const endDispatchers = Workflow.getEndEventDispatchers(wf)
  endDispatchers.forEach(endEventDispatcher => {
    if (!WorkflowGraphTools.elementIsReachable(wf, endEventDispatcher.id)) {
      throw new UnreachableEndEventDispatcherError({ endEventDispatcher })
    }
  })
}

const validateRules = wf => {
  containsExactlyOneStartEventListener(wf)
  containsAtLeastOnePhase(wf)
  containsAtLeastOneEndEventDispatcher(wf)
  everyPhaseIsReachable(wf)
  everyEndEventDispatcherIsReachable(wf)
}

const validate = wf => {
  Workflow.validateSchema(wf)
  validateRules(wf)
}

module.exports = {
  validate,
}
