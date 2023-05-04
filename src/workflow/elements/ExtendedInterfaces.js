/* Here we overwrite/add CRUD operations on the element interfaces whenever
 * we have to interact with other element groups
 */

const Flows = require('./flows/Flows')
const Phases = require('./phases/Phases')

const Gateways = require('./gateways/Gateways')
const AndGateway = require('./gateways/AndGateway')
const OrGateway = require('./gateways/OrGateway')
const ConditionalGateway = require('./gateways/ConditionalGateway')

const EventListeners = require('./eventListeners/EventListeners')
const ApprovalEventListener = require('./eventListeners/ApprovalEventListener')
const ConditionEventListener = require('./eventListeners/ConditionEventListener')
const StartEventListener = require('./eventListeners/StartEventListener')
const TimerEventListener = require('./eventListeners/TimerEventListener')

const EventDispatchers = require('./eventDispatchers/EventDispatchers')
const EndEventDispatcher = require('./eventDispatchers/EndEventDispatcher')
const AlertEventDispatcher = require('./eventDispatchers/AlertEventDispatcher')

const removeFlowReferenceFromGateway = flowRemoveFn => (workflow, flowId) => {
  /* whenever an outgoing flow of a ConditionalGateway is removed, unset the refs */
  const flow = Flows.getById(workflow, flowId)
  const workflowWithoutFlow = flowRemoveFn(workflow, flowId)

  const gatewayWithTrueFlowRef = Gateways.getBy(workflowWithoutFlow, { trueFlowId: flow.id })
  const gatewayWithFalseFlowRef = Gateways.getBy(workflowWithoutFlow, { falseFlowId: flow.id })

  if (!gatewayWithTrueFlowRef && !gatewayWithFalseFlowRef) {
    return workflowWithoutFlow
  }

  if (gatewayWithTrueFlowRef) {
    return ConditionalGateway
      .update(workflowWithoutFlow, gatewayWithTrueFlowRef.id, { trueFlowId: null })
  }

  return ConditionalGateway
    .update(workflowWithoutFlow, gatewayWithFalseFlowRef.id, { falseFlowId: null })
}

Flows.remove = removeFlowReferenceFromGateway(Flows.remove)

/* whenever a non-Flow element is removed, delete all associated flows */

module.exports = {
  Flows,
  Phases,
  Gateways,
  EventListeners,
  EventDispatchers,
  AndGateway,
  OrGateway,
  ConditionalGateway,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  EndEventDispatcher,
  AlertEventDispatcher,
}
