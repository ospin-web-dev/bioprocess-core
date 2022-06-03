const Workflow = require('./src/workflow/Workflow')
const Validator = require('./src/workflow/validator/Validator')
const EventListeners = require('./src/workflow/elements/eventListeners/EventListeners')
const EventDispatchers = require('./src/workflow/elements/eventDispatchers/EventDispatchers')
const Phases = require('./src/workflow/elements/phases/Phases')

module.exports = {
  Workflow,
  Validator,
  ElementsHandler: {
    EventListeners,
    EventDispatchers,
    Phases,
  },
}
