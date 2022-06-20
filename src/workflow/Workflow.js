const Joi = require('joi')
const uuid = require('uuid')
const {
  Flows,
  Phases,
  EventDispatchers,
  EndEventDispatcher,
  EventListeners,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  Gateways,
  AndMergeGateway,
  AndSplitGateway,
  LoopGateway,
  OrMergeGateway,
} = require('./elements')

const getElementById = require('./functions/getElementById')
const validateSchema = require('./functions/validateSchema')
const createFromSchema = require('./functions/createFromSchema')
const validate = require('./validate')

const SCHEMA = Joi.object({
  id: Joi.string().required(),
  version: Joi.string().default('1.0'),
  elements: Joi.object({
    eventDispatchers: Joi.array().items(EndEventDispatcher.SCHEMA).default([]),
    eventListeners: Joi.array().items(Joi.alternatives().try(
      ApprovalEventListener.SCHEMA,
      ConditionEventListener.SCHEMA,
      StartEventListener.SCHEMA,
      TimerEventListener.SCHEMA,
    )).default([]),
    flows: Joi.array().items(Flows.SCHEMA).default([]),
    gateways: Joi.array().items(Joi.alternatives().try(
      AndMergeGateway.SCHEMA,
      AndSplitGateway.SCHEMA,
      LoopGateway.SCHEMA,
      OrMergeGateway.SCHEMA,
    )).default([]),
    phases: Joi.array().items(Phases.SCHEMA).default([]),
  }).default(),
})

const create = data => createFromSchema(data, SCHEMA)

const pipe = (fns, initParams) => {
  let params = initParams

  /* eslint-disable no-restricted-syntax */
  for (const fn of fns) {
    const newParams = fn(params)
    params = newParams
  }

  return params
}

const createTemplate = () => {
  const id = uuid.v4()

  return pipe([
    create,
    StartEventListener.add,
    Phases.add,
    wf => Flows.add(wf, {
      srcId: StartEventListener.getAll(wf)[0].id,
      destId: Phases.getLast(wf).id,
    }),
    EndEventDispatcher.add,
    wf => ApprovalEventListener
      .add(wf, { phaseId: Phases.getLast(wf).id }),
    wf => Flows.add(wf, {
      srcId: ApprovalEventListener.getAll(wf)[0].id,
      destId: EndEventDispatcher.getAll(wf)[0].id,
    }),
  ], { id })

}

module.exports = {
  pipe,
  validateSchema: data => validateSchema(data, SCHEMA),
  validate,
  getElementById,
  createTemplate,
  create,
  Flows,
  EventListeners,
  EventDispatchers,
  Phases,
  Gateways,
  EndEventDispatcher,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  AndMergeGateway,
  AndSplitGateway,
  LoopGateway,
  OrMergeGateway,
}
