const Flows = require('../../../../src/workflow/elements/flows/Flows')

const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

describe('Flows', () => {
  describe('add', () => {
    it.only('adds a new flow to the workflow', () => {
      const srcId = 'eventListener_1'
      const destId = 'phase_1'
      const workflow = WorkflowGenerator.generate()

      const { elements: { flows } } = Flows.add(workflow, { srcId, destId })

      expect(flows).toHaveLength(1)
      expect(flows[0].srcId).toBe(srcId)
      expect(flows[0].destId).toBe(destId)
      expect(flows[0].id).toBe('flow_0')
    })

    describe('when the data is invalid', () => {
      it('throws an error', () => {
        const workflow = WorkflowGenerator.generate()

        expect(() => Flows.add(workflow, { acceptMe: 'senpai' }))
          .toThrow(/"srcId" is required/)
      })
    })
  })

  describe('remove', () => {
    it('removes a flow from the workflow', () => {
      const srcId = 'eventListener_1'
      const destId = 'phase_1'
      const wf = WorkflowGenerator.generate()
      const workflowWithFlow = Flows.add(wf, { destId, srcId })

      const flowId = Flows.getAll()[0].id

      const { elements: { flows } } = Flows.remove(workflowWithFlow, flowId)

      expect(flows).toHaveLength(0)
    })
  })

  describe('update', () => {
    describe('when the data is valid', () => {
      it('adds a new flow to the workflow', () => {
        const flowId = 'flow_0'
        const srcId = 'eventListener_1'
        const destId = 'phase_1'
        const newDestId = 'phase_2'
        const wf = WorkflowGenerator.generate()
        const workflowWithFlow = Flows.add(wf, { destId, srcId })

        const { elements: { flows } } = Flows
          .update(workflowWithFlow, flowId, { destId: newDestId })

        expect(flows[0].destId).toBe(newDestId)
      })
    })

    describe('when the data is invalid', () => {
      it('adds a new flow to the workflow', () => {
        const flowId = 'flow_0'
        const srcId = 'eventListener_1'
        const destId = 'phase_1'
        const wf = WorkflowGenerator.generate()
        const workflowWithFlow = Flows.add(wf, { destId, srcId })

        expect(() => Flows.update(workflowWithFlow, flowId, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })
})
