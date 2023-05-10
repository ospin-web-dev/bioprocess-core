const uuid = require('uuid')
const WorkflowGenerator = require('../../src/test-helpers/WorkflowGenerator')
const EventGenerator = require('../../src/test-helpers/EventGenerator')
const Workflow = require('../../src/workflow')
const EventSourcing = require('../../src/eventSourcing/EventSourcing')

describe('EventSourcing', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  const createSetup = () => {
    const wf = WorkflowGenerator.generateTestWorkflow1()
    const startListenerId = Workflow.getStartEventListeners(wf)[0].id
    const listeningEvent = EventGenerator
      .generateEventListenerActivatedEvent(startListenerId, { createdAt: Date.now() - 10000 })
    const startedEvent = EventGenerator
      .generateEventReceivedEvent(startListenerId, { createdAt: Date.now() - 9000 })

    const flowId = Workflow.getOutgoingFlows(wf, startListenerId)[0].id
    const flowSignaledEvent = EventGenerator
      .generateFlowSignaledEvent(flowId, { createdAt: Date.now() - 8000 })

    const phaseId = Workflow.getPhases(wf)[0].id
    const phaseStartedEvent = EventGenerator
      .generatePhaseStartedEvent(phaseId, { createdAt: Date.now() - 7000 })

    const phaseEventListenerId = Workflow.getPhaseEventListeners(wf, phaseId)[0].id
    const listeningEvent2 = EventGenerator
      .generateEventListenerActivatedEvent(phaseEventListenerId, { createdAt: Date.now() - 6000 })
    const transitionEvent = EventGenerator
      .generateEventReceivedEvent(phaseEventListenerId, { createdAt: Date.now() - 5000 })

    const flowId2 = Workflow.getOutgoingFlows(wf, phaseEventListenerId)[0].id
    const flowSignaledEvent2 = EventGenerator
      .generateFlowSignaledEvent(flowId2, { createdAt: Date.now() - 4000 })

    const finishedEvent = EventGenerator
      .generateWorkflowFinishedEvent({ createdAt: Date.now() - 3000 })

    return {
      wf,
      events: [
        listeningEvent,
        startedEvent,
        flowSignaledEvent,
        phaseStartedEvent,
        listeningEvent2,
        transitionEvent,
        flowSignaledEvent2,
        finishedEvent,
      ],
    }
  }

  describe('getStartedEvent', () => {
    it('returns the "EVENT_RECEIVED" event of the start event listener', () => {
      const { events } = createSetup()

      const res = EventSourcing.getStartedEvent(events)

      expect(res).toStrictEqual(events[1])
    })
  })

  describe('getEndingEvent', () => {
    describe('when ending with a "WORKFLOW_FINISHED" event', () => {
      it('returns the event', () => {
        const { events } = createSetup()

        const res = EventSourcing.getEndingEvent(events)

        expect(res).toStrictEqual(events[events.length - 1])
      })
    })

    describe('when ending with a "WORKFLOW_TERMINATED" event', () => {
      it('returns the event', () => {
        const { events } = createSetup()
        // replace last event
        events[events.lenght - 1] = EventGenerator
          .generateWorkflowTerminatedEvent()

        const res = EventSourcing.getEndingEvent(events)

        expect(res).toStrictEqual(events[events.length - 1])
      })
    })
  })

  describe('getWorkflowDuration', () => {
    describe('when the workflow has not started yet', () => {
      it('returns 0', () => {
        const res = EventSourcing.getWorkflowDuration([])

        expect(res).toBe(0)
      })
    })

    describe('when the workflow was finished', () => {
      it('returns the total duration between starting and ending event', () => {
        const { events } = createSetup()

        const res = EventSourcing.getWorkflowDuration(events)

        expect(res).toBe(events[events.length - 1].createdAt - events[1].createdAt)
      })
    })

    describe('when the workflow is still running', () => {
      it('returns the total duration between starting event and Date.now', () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 100000)
        const { events } = createSetup()
        events.pop()

        const res = EventSourcing.getWorkflowDuration(events)

        expect(res).toBe(100000 - events[1].createdAt)
      })
    })
  })

  describe('getActiveTarget', () => {
    describe('when the lastest phase does not define target', () => {
      it('returns the target of the latest phase that did define the target', () => {
        const { wf, events } = createSetup()
        const flowId = Workflow.getLastFlow(wf).id
        const wfWithSecondPhase = Workflow.insertPhase(wf, flowId)

        const phases = Workflow.getPhases(wfWithSecondPhase)

        const inputNodeId = uuid.v4()
        const value = 37

        const wfWithTarget = Workflow
          .setTargetValue(wfWithSecondPhase, phases[0].id, inputNodeId, value)

        // modify events to insert events for our second phase
        const [
          listeningEvent,
          startedEvent,
          flowSignaledEvent,
          phaseStartedEvent,
          listeningEvent2,
          transitionEvent,
        ] = events

        const phaseEventListenerId = Workflow.getPhaseEventListeners(wf, phases[0].id)[0].id
        const flowId2 = Workflow.getOutgoingFlows(wfWithTarget, phaseEventListenerId)[0].id
        const flowSignaledEvent2 = EventGenerator
          .generateFlowSignaledEvent(flowId2, { createdAt: Date.now() - 4000 })

        const phaseId2 = phases[1].id
        const phaseStartedEvent2 = EventGenerator
          .generatePhaseStartedEvent(phaseId2, { createdAt: Date.now() - 3000 })

        const newEvents = [
          listeningEvent,
          startedEvent,
          flowSignaledEvent,
          phaseStartedEvent,
          listeningEvent2,
          transitionEvent,
          flowSignaledEvent2,
          phaseStartedEvent2,
        ]

        const res = EventSourcing.getActiveTarget(wfWithTarget, newEvents, inputNodeId)
        expect(res).toBe(value)
      })
    })
  })

})
