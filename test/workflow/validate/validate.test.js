const { validate } = require('../../../src/workflow')
const {
  Phases,
  Flows,
  StartEventListener,
  ApprovalEventListener,
  EndEventDispatcher,
  pipe,
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
            const wf = pipe([
              WorkflowGenerator.generate,
              StartEventListener.add,
            ])

            expect(() => validate(wf)).toThrow(/at least one phase/)
          })
        })
      })

      describe('for the containsAtLeastOneEndEventDispatcher rule', () => {
        describe('when the workflow does NOT contain any END event dispatcher', () => {
          it('throws an error', () => {
            const wf = pipe([
              WorkflowGenerator.generate,
              StartEventListener.add,
              Phases.add,
            ])

            expect(() => validate(wf)).toThrow(/at least one END event dispatcher/)
          })
        })
      })

      describe('for the everyPhaseIsReachable rule', () => {
        describe('when the workflow does contain unreachable phases', () => {
          it('throws an error', () => {
            const wf = pipe([
              WorkflowGenerator.generate,
              StartEventListener.add,
              Phases.add,
              EndEventDispatcher.add,
            ])

            expect(() => validate(wf)).toThrow(/contains unreachable phase/)
          })
        })
      })

      describe('for the everyEndEventDispatcherIsReachable rule', () => {
        describe('when the workflow does contain unrachable end event dispatchers', () => {
          it('throws an error', () => {
            const workflow = pipe([
              WorkflowGenerator.generate,
              StartEventListener.add,
              Phases.add,
              EndEventDispatcher.add,
              wf => Flows.add(wf, {
                srcId: wf.elements.eventListeners[0].id,
                destId: wf.elements.phases[0].id,
              }),
            ])

            expect(() => validate(workflow)).toThrow(/contains unreachable END event dispatcher/)
          })
        })
      })

    })

    describe('when the workflow is valid in format and semantics', () => {
      it('does NOT throw an error', () => {
        const workflow = pipe([
          WorkflowGenerator.generate,
          StartEventListener.add,
          Phases.add,
          EndEventDispatcher.add,
          wf => Flows.add(wf, {
            srcId: wf.elements.eventListeners[0].id,
            destId: wf.elements.phases[0].id,
          }),
          wf => ApprovalEventListener.add(wf, { phaseId: Phases.getAll(wf).id }),
          wf => Flows.add(wf, {
            srcId: wf.elements.eventListeners[1].id,
            destId: wf.elements.eventDispatchers[0].id,
          }),
        ])

        expect(() => validate(workflow)).not.toThrow()
      })
    })
  })

})
