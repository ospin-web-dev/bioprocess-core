const Workflow = require('../Workflow')
const Rules = require('./Rules')

class Validator {

  static validateRules(workflow) {
    Rules.containsExactlyOneStartEventListener(workflow)
  }

  static validate(workflow) {
    Workflow.validateSchema(workflow)
    Validator.validateRules(workflow)
  }

}

module.exports = Validator
