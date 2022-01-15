const Transition = require('../../../../src/processDescription/phases/transitions/Transition')

describe('the Transition interface', () => {
  describe('validate', () => {
    describe('when the data is valid', () => {
      it('does NOT throw an error', () => {
        const data = { condition: {}, destinationPhaseId: 1, id: 0 }
        expect(() => Transition.validate(data)).not.toThrow()
      })
    })

    describe('when the data is NOT valid', () => {
      it('does throw an error', () => {
        const data = { condition: {}, destinationPhaseId: 'COVID_OMEGA', id: 0 }
        expect(() => Transition.validate(data)).toThrow(/destinationPhaseId/)
      })
    })
  })
})
