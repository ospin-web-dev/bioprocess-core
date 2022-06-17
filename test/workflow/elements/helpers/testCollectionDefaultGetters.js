const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

/* eslint-disable jest/no-export */
module.exports = (collectionInterface, addElementFn = collectionInterface.add) => {

  const collectionName = collectionInterface.COLLECTION_NAME
  const elementName = collectionName.substr(0, collectionName.length - 1)

  const createWorkflowWithNElements = (n = 3) => {
    let wf = WorkflowGenerator.generate()
    Array.from({ length: n }).forEach(() => { wf = addElementFn(wf) })

    return { wf, elements: collectionInterface.getAll(wf) }
  }

  describe('getAll', () => {
    it(`returns all ${collectionName}`, () => {
      const { wf } = createWorkflowWithNElements()

      const res = collectionInterface.getAll(wf)

      expect(res).toHaveLength(3)
    })
  })

  describe('getManyBy', () => {
    it(`returns all ${collectionName} matching the query`, () => {
      const { wf, elements } = createWorkflowWithNElements()

      const res = collectionInterface.getManyBy(wf, { id: elements[0].id })

      expect(res).toStrictEqual([ elements[0] ])
    })
  })

  describe('getBy', () => {
    it(`returns the ${elementName} matching a query`, () => {
      const { wf, elements } = createWorkflowWithNElements()

      const res = collectionInterface.getBy(wf, { id: elements[0].id })

      expect(res).toStrictEqual(elements[0])
    })
  })

  describe('getById', () => {
    it(`returns a ${elementName} with the matching ID`, () => {
      const { wf, elements } = createWorkflowWithNElements()

      const res = collectionInterface.getById(wf, elements[0].id)

      expect(res).toStrictEqual(elements[0])
    })
  })
}
