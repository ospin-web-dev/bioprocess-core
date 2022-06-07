const ElementsHandler = require('../../../src/workflow/elements/ElementsHandler')
const Phase = require('../../../src/workflow/elements/phases/Phase')

const WorkflowGenerator = require('../../helpers/generators/WorkflowGenerator')

describe('ElementsHandler', () => {

  class TestClass extends ElementsHandler {

    static get COLLECTION_NAME() {
      return 'phases'
    }

    static get ID_PREFIX() {
      return 'phase'
    }

  }

  describe('replace', () => {
    it('updates only the passed element', () => {
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({ id: 'phase_0' }),
            Phase.create({ id: 'phase_1' }),
          ],
        },
      })

      const updatedElements = TestClass
        .replace(workflow.elements.phases, { id: 'phase_0', newKey: 'test' })

      expect(updatedElements[0].newKey).toBe('test')
      expect(updatedElements[1].newKey).toBeUndefined()
    })
  })

  describe('getLast', () => {
    it('returns the last element of a collection', () => {
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({ id: 'phase_0' }),
            Phase.create({ id: 'phase_1' }),
          ],
        },
      })

      const lastEl = TestClass.getLast(workflow)

      expect(lastEl).toStrictEqual(workflow.elements.phases[1])
    })
  })

  describe('generateUniqeId', () => {
    it('returns a unique Id with the passed prefix', () => {
      const id = 'phase_0'
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({ id }),
          ],
        },
      })

      const newPhaseId = TestClass.generateUniqueId(workflow, 'phase')
      expect(newPhaseId).not.toBe(id)
    })
  })
})
