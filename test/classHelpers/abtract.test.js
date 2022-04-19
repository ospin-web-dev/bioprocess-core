const { forbidInitializing }  = require('../../src/classHelpers/abstract')

describe('forbidInitializing', () => {

  class AbstractClass {

    constructor() {
      forbidInitializing(new.target, AbstractClass)
    }

  }

  class NonAbstractClass extends AbstractClass {

    constructor() {
      super()
    }

  }

  describe('when trying to create an instance of a class that implements the method', () => {
    it('throws an error', () => {
      expect(() => new AbstractClass()).toThrow(/AbstractClass is an abstract class - it cannot be initialized/)
    })
  })

  describe('when trying to create an instance of a class that inherits from a class that implements the method', () => {
    it('does NOT throw an error', () => {
      expect(() => new NonAbstractClass()).not.toThrow()
    })
  })

})
