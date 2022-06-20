const validate = require('../../../src/workflow/validate')
const {
  EventListeners,
  Phases,
  Flows,
  StartEventListener,
  ApprovalEventListener,
  EndEventDispatcher,
} = require('../../../src/workflow')
const WorkflowGenerator = require('../../helpers/generators/WorkflowGenerator')

describe('Validator', () => {
  describe('validate', () => {
    describe('when the workflow has an invalid data schema', () => {
      it('throws an error', () => {
        const wf = WorkflowGenerator.generate()
        delete wf.id

        expect(() => validate(wf)).toThrow(/"id" is required/)
      })
    })

    describe('when the workflow is breaking a semantic rule', () => {
      describe('for the everyPhaseIsReachable rule', () => {
        describe('when the workflow does contain unreachable phases', () => {
          it('throws an error', () => {
            const wf = WorkflowGenerator.generate()
            const workflowWithOneStartEvent = StartEventListener.add(wf)
            const workflowWithPhase = Phases.add(workflowWithOneStartEvent)

            expect(() => validate(workflowWithPhase)).toThrow(/contains unreachable phase/)
          })
        })
      })

      describe('for the everyEndEventDispatcherIsReachable rule', () => {
        describe('when the workflow does contain unrachable end event dispatchers', () => {
          it('throws an error', () => {
            const wf = WorkflowGenerator.generate()
            const workflowWithOneStartEvent = StartEventListener.add(wf)
            const workflowWithPhase = Phases.add(workflowWithOneStartEvent)
            const withPhaseConnected = Flows.add(workflowWithPhase, {
              srcId: workflowWithPhase.elements.eventListeners[0].id,
              destId: workflowWithPhase.elements.phases[0].id,
            })
            const withEndEventDispatcher = EndEventDispatcher.add(withPhaseConnected)

            expect(() => validate(withEndEventDispatcher)).toThrow(/contains unreachable END event dispatcher/)
          })
        })
      })

    })

    describe('when the workflow is valid in format and semantics', () => {
      it('does NOT throw an error', () => {
        const wf = WorkflowGenerator.generate()
        const workflowWithOneStartEvent = StartEventListener.add(wf, { interrupting: true })
        const workflowWithPhase = Phases.add(workflowWithOneStartEvent)
        const withPhaseConnected = Flows.add(workflowWithPhase, {
          srcId: workflowWithPhase.elements.eventListeners[0].id,
          destId: workflowWithPhase.elements.phases[0].id,
        })
        const workFlowWithEndEventDispatcher = EndEventDispatcher.add(withPhaseConnected)
        const workflowWithApprovalEvent = ApprovalEventListener.add(
          workFlowWithEndEventDispatcher,
          { phaseId: workFlowWithEndEventDispatcher.elements.phases[0].id },
        )

        const fullyConnected = Flows.add(workflowWithApprovalEvent, {
          srcId: workflowWithApprovalEvent.elements.eventListeners[1].id,
          destId: workflowWithApprovalEvent.elements.eventDispatchers[0].id,
        })

        expect(() => validate(fullyConnected)).not.toThrow()
      })
    })
  })

})
