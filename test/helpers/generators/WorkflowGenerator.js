const uuid = require('uuid')
const Workflow = require('../../../src/workflow/Workflow')

class WorkflowGenerator {

  static generate(data = {}) {
    return Workflow.create({
      id: uuid.v4(),
      ...data,
    })
  }

}

module.exports = WorkflowGenerator
