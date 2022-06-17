const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

/* eslint-disable jest/no-export */
module.exports = (elementInterface, defaultData = {}) => {
  describe('add', () => {
    describe('when the data is valid', () => {
      it('adds a new element to the workflow', () => {
        let wf = WorkflowGenerator.generate()

        wf = elementInterface.add(wf, defaultData)

        expect(elementInterface.getAll(wf)).toHaveLength(1)
      })
    })

    describe('when the data is invalid', () => {
      it('throw an error', () => {
        const wf = WorkflowGenerator.generate()

        expect(() => elementInterface.add(wf, { ...defaultData, acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })
}
