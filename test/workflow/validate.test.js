const Workflow = require('../../src/workflow/Workflow')
const { validate } = require('../../src/workflow/validate')
const WorkflowGenerator = require('../helpers/generators/WorkflowGenerator')

describe('validate', () => {
  describe('when the workflow has an invalid data schema', () => {
    it('throws an error', () => {
      const wf = WorkflowGenerator.generate()
      delete wf.id

      expect(() => validate(wf)).toThrow(/"id" is required/)
    })
  })

  describe('when the workflow is breaking a semantic rule', () => {

    describe('for the containsExactlyOneStartEventListener rule', () => {
      describe('when the workflow does NOT contain any START event listeners phases', () => {
        it('throws an error', () => {
          const wf = WorkflowGenerator.generate()

          expect(() => validate(wf)).toThrow(/exactly one START/)
        })
      })
    })

    describe('for the containsAtLeastOnePhase rule', () => {
      describe('when the workflow does NOT contain any phases', () => {
        it('throws an error', () => {
          const wf = Workflow.pipe([
            WorkflowGenerator.generate,
            Workflow.addStartEventListener,
          ])

          expect(() => validate(wf)).toThrow(/at least one phase/)
        })
      })
    })

    describe('for the containsAtLeastOneEndEventDispatcher rule', () => {
      describe('when the workflow does NOT contain any END event dispatcher', () => {
        it('throws an error', () => {
          const wf = Workflow.pipe([
            WorkflowGenerator.generate,
            Workflow.addStartEventListener,
            Workflow.addPhase,
          ])

          expect(() => validate(wf)).toThrow(/at least one END event dispatcher/)
        })
      })
    })

    describe('for the everyPhaseIsReachable rule', () => {
      describe('when the workflow does contain unreachable phases', () => {
        it('throws an error', () => {
          const wf = Workflow.pipe([
            WorkflowGenerator.generate,
            Workflow.addStartEventListener,
            Workflow.addPhase,
            Workflow.addEndEventDispatcher,
          ])

          expect(() => validate(wf)).toThrow(/contains unreachable phase/)
        })
      })
    })

    describe('for the everyEndEventDispatcherIsReachable rule', () => {
      describe('when the workflow does contain unrachable end event dispatchers', () => {
        it('throws an error', () => {
          const workflow = Workflow.pipe([
            WorkflowGenerator.generate,
            Workflow.addStartEventListener,
            Workflow.addPhase,
            Workflow.addEndEventDispatcher,
            wf => Workflow.addFlow(wf, {
              srcId: Workflow.getStartEventListeners(wf)[0].id,
              destId: Workflow.getPhases(wf)[0].id,
            }),
          ])

          expect(() => validate(workflow)).toThrow(/contains unreachable END event dispatcher/)
        })
      })
    })
  })
})
