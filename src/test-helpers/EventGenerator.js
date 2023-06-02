const uuid = require('uuid')
const Event = require('../eventSourcing/Event')

const generateCommonData = type => ({
  id: uuid.v4(),
  type,
  createdAt: Date.now(),
  number: Math.round(Math.random() * 100),
})

const generateEventReceivedEvent = (eventListenerId, data = {}) => ({
  ...generateCommonData(Event.TYPES.EVENT_RECEIVED),
  data: {
    eventListenerId,
    forced: false,
  },
  ...data,
})

const generateEventListenerActivatedEvent = (eventListenerId, data = {}) => ({
  ...generateCommonData(Event.TYPES.EVENT_LISTENER_ACTIVATED),
  data: {
    eventListenerId,
  },
  ...data,
})

const generatePhaseStartedEvent = (phaseId, data = {}) => ({
  ...generateCommonData(Event.TYPES.PHASE_STARTED),
  data: {
    phaseId,
  },
  ...data,
})

const generateFlowSignaledEvent = (flowId, data = {}) => ({
  ...generateCommonData(Event.TYPES.FLOW_SIGNALED),
  data: {
    flowId,
  },
  ...data,
})

const generateGatewayActivatedEvent = (gatewayId, data = {}) => ({
  ...generateCommonData(Event.TYPES.GATEWAY_ACTIVATED),
  data: {
    gatewayId,
  },
  ...data,
})

const generateWorkflowTerminatedEvent = (data = {}) => ({
  ...generateCommonData(Event.TYPES.WORKFLOW_TERMINATED),
  ...data,
})

const generateWorkflowFinishedEvent = (data = {}) => ({
  ...generateCommonData(Event.TYPES.WORKFLOW_FINISHED),
  ...data,
})

module.exports = {
  generateEventReceivedEvent,
  generateWorkflowTerminatedEvent,
  generateWorkflowFinishedEvent,
  generateFlowSignaledEvent,
  generatePhaseStartedEvent,
  generateGatewayActivatedEvent,
  generateEventListenerActivatedEvent,
}
