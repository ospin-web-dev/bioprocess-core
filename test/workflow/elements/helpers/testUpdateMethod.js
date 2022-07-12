const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

/* eslint-disable jest/no-export */
module.exports = (elementInterface, defaultData = {}, updateData = {}) => {
  describe('update', () => {
    describe('when the data is valid', () => {
      it('updates the element to the workflow', () => {
        let wf = WorkflowGenerator.generate()
        wf = elementInterface.add(wf, defaultData)
        wf = elementInterface.update(wf, elementInterface.getAll(wf)[0].id, updateData)

        expect(elementInterface.getAll(wf)[0]).toStrictEqual(expect.objectContaining(updateData))
      })
    })

    describe('when the data is invalid', () => {
      it('throw an error', () => {
        let wf = WorkflowGenerator.generate()
        wf = elementInterface.add(wf, defaultData)
        expect(() => {
          wf = elementInterface.update(wf, elementInterface.getAll(wf)[0].id, { acceptMe: 'senpai' })
        }).toThrow(/"acceptMe" is not allowed/)
      })
    })
  })
}
