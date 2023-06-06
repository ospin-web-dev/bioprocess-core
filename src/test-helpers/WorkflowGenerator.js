const uuid = require('uuid')
const Workflow = require('../workflow')

const generate = (data = {}) => (
  Workflow.create({
    id: uuid.v4(),
    ...data,
  })
)

const generateTestWorkflow1 = () => (
  // this workflow should contain all possible elements
  Workflow.pipe([
    generate,
    Workflow.addPhase,
    Workflow.addEndEventDispatcher,
    Workflow.addAlertEventDispatcher,
    Workflow.addApprovalEventListener,
    Workflow.addConditionEventListener,
    Workflow.addStartEventListener,
    wf => Workflow.addTimerEventListener(wf, { phaseId: Workflow.getPhases(wf)[0].id }),
    Workflow.addAndGateway,
    Workflow.addOrGateway,
    Workflow.addConditionalGateway,
    wf => Workflow.addFlow(wf, {
      srcId: Workflow.getStartEventListeners(wf)[0].id,
      destId: Workflow.getPhases(wf)[0].id,
    }),
    wf => Workflow.addFlow(wf, {
      srcId: Workflow.getElementBy(wf, { type: Workflow.EventListener.TYPES.TIMER }).id,
      destId: Workflow.getElementBy(wf, { type: Workflow.EventDispatcher.TYPES.END }).id,
    }),
  ])
)

module.exports = {
  generate,
  generateTestWorkflow1,
}
