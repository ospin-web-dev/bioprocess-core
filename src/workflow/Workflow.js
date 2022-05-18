const Joi = require('joi')

const EndEventDispatcher = require('./elements/eventDispatchers/EndEventDispatcher')

const ApprovalEventListener = require('./elements/eventListeners/ApprovalEventListener')
const ConditionEventListener = require('./elements/eventListeners/ConditionEventListener')
const StartEventListener = require('./elements/eventListeners/StartEventListener')
const TimerEventListener = require('./elements/eventListeners/TimerEventListener')

const Flow = require('./elements/flows/Flow')

const AndMergeGateway = require('./elements/gateways/AndMergeGateway')
const AndSplitGateway = require('./elements/gateways/AndSplitGateway')
const LoopGateway = require('./elements/gateways/LoopGateway')
const OrMergeGateway = require('./elements/gateways/OrMergeGateway')

const Phase = require('./elements/phases/Phase')

class Workflow {

  static validateSchema(data) {
    Joi.assert(data, Workflow.SCHEMA)
  }

  static create(data) {
    return Joi.attempt(data, Workflow.SCHEMA)
  }

  static get SCHEMA() {
    return Joi.object({
      id: Joi.string().required(),
      version: Joi.string().required(),
      elements: Joi.object({
        eventDispatchers: Joi.array().items(EndEventDispatcher.SCHEMA).default([]),
        eventListeners: Joi.array().items(Joi.alternatives().try(
          ApprovalEventListener.SCHEMA,
          ConditionEventListener.SCHEMA,
          StartEventListener.SCHEMA,
          TimerEventListener.SCHEMA,
        )).default([]),
        flows: Joi.array().items(Flow.SCHEMA).default([]),
        gateways: Joi.array().items(Joi.alternatives().try(
          AndMergeGateway.SCHEMA,
          AndSplitGateway.SCHEMA,
          LoopGateway.SCHEMA,
          OrMergeGateway.SCHEMA,
        )).default([]),
        phases: Joi.array().items(Phase.SCHEMA).default([]),
      }).default(),
    })
  }

  static getElementId(element) {
    return element.id
  }

  static getElementById(elements, id) {
    return elements.find(el => el.id === id)
  }

  static getExistingIds(workflow) {
    const {
      elements: {
        eventDispatchers,
        eventListeners,
        flows,
        gateways,
        phases,
      },
    } = workflow

    return [
      ...eventDispatchers.map(Workflow.getElementId),
      ...eventListeners.map(Workflow.getElementId),
      ...flows.map(Workflow.getElementId),
      ...gateways.map(Workflow.getElementId),
      ...phases.map(Workflow.getElementId),
    ]
  }

}

module.exports = Workflow
