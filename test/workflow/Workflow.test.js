const Workflow = require('../../src/workflow')

const {
  Flows,
  Phases,
  EndEventDispatcher,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  AndMergeGateway,
  AndSplitGateway,
  LoopGateway,
  pipe,
  validateSchema,
} = Workflow

const WorkflowGenerator = require('../helpers/generators/WorkflowGenerator')

describe('Workflow', () => {
  describe('validateSchema', () => {
    describe('when used with valid data', () => {
      it('does NOT throw an error', () => {

        const workflow = pipe([
          WorkflowGenerator.generate,
          Phases.add,
          EndEventDispatcher.add,
          ApprovalEventListener.add,
          ConditionEventListener.add,
          StartEventListener.add,
          TimerEventListener.add,
          AndMergeGateway.add,
          AndSplitGateway.add,
          LoopGateway.add,
          wf => Flows
            .add(wf, {
              srcId: StartEventListener.getAll(wf)[0].id,
              destId: Phases.getAll(wf)[0].id,
            }),
          wf => Flows.add(wf, {
            srcId: TimerEventListener.getAll(wf)[0].id,
            destId: EndEventDispatcher.getAll(wf)[0].id,
          }),
        ])

        expect(() => validateSchema(workflow)).not.toThrow()
      })
    })

    describe('when used with invalid data', () => {
      it('does throw an error', () => {
        const data = WorkflowGenerator.generate()
        data.nodes = []

        expect(() => Workflow.validateSchema(data)).toThrow(/"nodes" is not allowed/)
      })
    })
  })

  describe('createTemplate', () => {
    it('creates a workflow and assigns id and version', () => {
      const res = Workflow.createTemplate()

      expect(res.version).toBe('1.0')
      expect(res.id).toStrictEqual(expect.any(String))
    })

    it('creates a workflow with a START event listener', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.eventListeners[0].type).toBe(StartEventListener.TYPE)
    })

    it('creates a workflow with an initial phase', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.phases).toHaveLength(1)
    })

    it('creates a connection from the start event and the initial phase', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.flows[0].srcId)
        .toBe(res.elements.eventListeners[0].id)
      expect(res.elements.flows[0].destId)
        .toBe(res.elements.phases[0].id)
    })

    it('creates a workflow with an approval event for the first phase', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.eventListeners[1].type).toBe(ApprovalEventListener.TYPE)
      expect(res.elements.eventListeners[1].phaseId)
        .toBe(res.elements.phases[0].id)
    })

    it('creates a workflow with an END event dispatcher', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.eventDispatchers).toHaveLength(1)
      expect(res.elements.eventDispatchers[0].type).toBe(EndEventDispatcher.TYPE)
    })

    it('creates a connection from the approval event of the first phase and the END event dispatcher', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.flows[1].srcId)
        .toBe(res.elements.eventListeners[1].id)
      expect(res.elements.flows[1].destId)
        .toBe(res.elements.eventDispatchers[0].id)
    })
  })

})
