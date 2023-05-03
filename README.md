[![codecov](https://codecov.io/gh/ospin-web-dev/process-core/branch/main/graph/badge.svg?token=T6YW4ZYWGR)](https://codecov.io/gh/ospin-web-dev/process-core)

# Process Core

This package contains logic for OSPIN workflow definition, including:

- utility functions to work with the workflow data model
- schemas for the workflow elements and for the expected dispatched workflow events
- description of execution semantics for the data model

# Introduction

The OSPIN workflow engine is an event-based execution engine that executes OSPIN workflow definitions. This document tries to define language and execution semantics for the underlying data model. The data schemas can be found [here](https://ospin-web-dev.github.io/process-core/) (they will be automatically generated from the repository, currently the docs are source-controlled and need to be generated using the command defined in the package.json):

The worklow definition is a directed, cyclic graph with 4 different types of nodes, namely **event listeners**, **event dispatchers**, **gateways**, and **phases**, and only a single type of edges that we call **flows**.

## Event Listeners

Event listeners listen for events coming from the outside world or from the device. We differentiate between global event listeners and event listeners that are bound to a phase.

Event listeners only listen to an event when they are active. An event listener becomes active either when the phase that it is bound to becomes active (e.g. for phase transitions), when it is a global event listener and has no incoming flows (e.g. the START event listener for process), or when it is a global event listener and it receives a signal via its incoming flow (for global event listeners that live between two flows).

![Image of the different position of event listeners in a workflow](/images/event_listeners_1.svg)

The event listeners have types that indicate which kind of event they listen to. Once they receive the event they wait for, they send a signal to their outgoing flow and become inactive again.

For phase-bound event listeners, a phase is set to considered "finished" when one of the event listeners receives its event and it is `interrupting`. When a phase is finished, all of its event listeners need to be set to inactive. This way we model "exclusive" event listeners for transitions, meaning only one transition can happen for phase, and all other once are cancelled. Non-interrupting event listeners do not cause a de-activation of other event listeners for that phase.
`interrupting` has currently no meaning for global event listeners and can be ignored.

The "START" event listener is special in the sense that it can be present only once per workflow and is required in every workflow definition. It defines the entry point of the workflow.

There are also implicit event listeners: For pausing, resuming and terminating a workflow. These listeners are not modelled in the data structure.

Another behaviour of event listeners is that every event listener can be triggered forcefully via a user command.

**Can connect to:**
  - Phases
  - Gateways
  - Event dispatchers
  - Event listeners (not implemented yet in the utility functions)

## Phases

Phases are a little bit wierd as they are really an abstraction on top of what most workflow engines would call a task/command/activity, extended with our event listeners. So what they really mean is:

Execute a command, then wait for one of the event listeners to receive an event.
One could consider omitting phases completely, in favour of an element type of "task" and an event gateway that follows the same logic for exclusiveness as the phase-bound event listeners (so once one event fires, the other ones are cancelled), but phases are easier to grasp for most customers, so lets keep them, even though they feel a little bit clumsy.

A phase is activated, when it receives a signal via an incoming flow. When activated, it executes its command and activates all event listeners that are bound to it (see Event Listeners).

Every workflow definition needs to have at least one phase.

A phase that is considered not finished yet, cannot be triggered again.

**Can connect to:**
  - nothing (as their outgoing connections are controlled by their phase-bound event listeners)

## Event Dispatchers

Event dispatchers dispatch an event when activated. This serves to communicate events to the outside world, like the end of a process, or for communication between different parts of the workflow.

After an event dispatcher dispatched an event, it finishes the current branch. They have no outgoing flows (discussable)

Every workflow has to have at least one END event dispatcher.

It is important to note that the engine will dispatch a lot of events that are not modelled explictly as event dispatchers, e.g. on a phase start. Event dispatchers in the data model are modelling only event dispatchers that can be controlled by the user.

**Can connect to:**
  - nothing (currently, dispatchers are only allowed on the end of a path; this can be changed if we want to allow dispatching an event "on passant", but this could also be modeled via an AND gateway with a single input and two outputs, one that leads to the event dispatcher and another that will continue the normal execution flow)

## Gateways

Gateways control the flow of the workflow on the highest level. They allows merging and splitting different execution paths, and they allow creating conditional logic like loops.
Gateways receive signals from the incoming flows and then produce output flows based on the type of the gateway. If a gateway produces a flow, it is considered "activated" (this becomes important for conditions based on gateway data).
Here are the rules:

### AndGateway

When all inputs flows have a signal, produce a signal on all output flows.

### OrGateway

When one of inputs flows has a signal, produce a signal on all output flows

Important to note: For convenience we support an "implicit OR", meaning that phases, event listeners and event dispatcher can have multiple incoming flows and in this case they are activated when one of the input flows receives a signal. We still need the explicit OrGateway for more complex composition with other gateways. (not updated in the utility functions yet)

### ConditionalGateway

Can have only one input and two outputs: One for when the provided condition is true, and one for false. The condition is evaluated when one of incoming flow receives a signal.

The conditional gateway can be used to represent loops, e.g. "run 10 times" by providing a condition that checks if the amount of iterations of the gateway has exceeded 10, something like

`${gateway.gatewayId.activations} < 10` or whatever syntax we decide for. `activations` serves as a variable for keep track on how many times the gateway was invoked (there are many ways to express that, e.g. we could call the variable also something else)

**Can connect to:**
  - Phases
  - Gateways
  - Event listeners
  - Event dispatchers

## Flows

Flows serve as connection between the different elements and transport signals between them. E.g. when the start listener receives an event, it dispatches a signal to the outgoing flow that is received by the destination element.

The destination element *might* consume the signal and be activated. Most of the time, signals will be consumed immediately. There are exceptions however, e.g. the AND-gateway will only consume the signal when all of its incoming flows have a signal in order to produce signals on its outgoing flows. This means signals have to be retained until they are consumed.

A flow can only ever carry a single signal.

**Can connect to:**
  - Phases
  - Gateways
  - Event listeners
  - Event dispatchers

# Rules for Workflows

## Execution

**1. Every workflow needs to have exactly one START event listener**

To define the entry point of a workflow, the workflow needs to define a `START` event listener.

**2. Every workflow needs to have at least one phase**

A workflow without a single phase does nothing. Therefore this requirement.

**3. Every phase needs to be reachable**

Unreachable phases indicate a flaw in the execution of the workflow.

**4. Every workflow needs to have at least one END event dispatcher**

To define an end of a workflow an `END` event has to be dispatched, so that the workflow engine knows that a workflow has ended.

**5. Every END event dispatcher of the workflow has to be reachable**

Unreachable `END` event dispatchers indicate a flaw in the execution of the workflow.

**6. A workflow is considered started, when the START event listener is triggered**

**7. A workflow is considered ended, when the first END event dispatcher dispatches an event**

## Implicitly dispatched events

In order to track the execution of the workflow, we need a range of events dispatched to the cloud. They are plenty, but it will also help much in the debugging process.

We need events when
- An event listener starts listening, see [EventListenerActivatedEvent](https://ospin-web-dev.github.io/process-core/)
- An event listener receives an event, see [EventReceivedEvent](https://ospin-web-dev.github.io/process-core/)
- a flow receives a signal, see [FlowSignaledEvent](https://ospin-web-dev.github.io/process-core/)
- a phase is started, see [PhaseStartedEvent](https://ospin-web-dev.github.io/process-core/)
- a gateway is activated, see [GatewayActivatedEvent](https://ospin-web-dev.github.io/process-core/)
- a workflow is paused/resumed/terminated, see [WorkflowPausedEvent|WorkflowResumedEvent|WorkflowTerminatedEvent](https://ospin-web-dev.github.io/process-core/)

## Examples

Here is an example process:

![Image of an example process with OR gateway, ConditionalGateway for loops and a range of phases and event listeners](/images/example_process.svg)

What we see here are (the icons are somewhat arbitrary as we have no finished UI concept yet):

1. The START event listener at the top left corner that starts Phase 1
2. Phase 1 has a TIMER event listener, meaning it will finish after a certain duration and transition to Phase 2
3. Phase 2 has two event listeners: The first one is a CONDITIONAL event listener, waiting for some sensor to reach a certain value (the icon that looks like a page with text on it) and a second one, an APPROVAL event listener waiting for a user APPROVAL. Depending on which listener will receive its event first, the workflow will transition into Phase 3 or Phase 4.
4. Phase 3 or Phase 4 (depending on which path was taken in step 3) will wait for a TIMER event and then dispatch a signal that will reach the OR-Gateway (because of our "implicit OR" feature this gateway is actually redundant, but I kept it for demonstration purposes)
5. The gateway will create a signal on its output flow and start Phase 5 which is actually the first phase of a loop (if we peak ahead a little bit)
6. We will go though Phase 5 and Phase 6, until we reach the ConditionalGateway which will check if we need another iteration of the loop and if so, loop back to Phase 5, otherwise it will send a signal to the flow to the right
7. The END event dispatcher is activated and dispatches the END event, marking the end of the process.

The data schema for such a process would look like this (handwritten, take with a grain of salt):

```js
const workflow = {
  id: 'a6921701-4706-40e9-82a0-07aa7e86987b',
  version: '1',
  elements: {

    eventListeners: [
      {
        type: 'START',
        id: 'eventListener_1',
        elementType: 'EVENT_LISTENER',
      },
      {
        type: 'TIMER',
        id: 'eventListener_2',
        durationInMS: 100000,
        phaseId: 'phase_1',
        elementType: 'EVENT_LISTENER',
      },
      {
        type: 'APPROVAL',
        id: 'eventListener_3',
        phaseId: 'phase_2',
        elementType: 'EVENT_LISTENER',
      },
      {
        type: 'CONDITION',
        id: 'eventListener_4',
        phaseId: 'phase_2',
        condition: {
          left: {
            type: 'SENSOR_DATA',
            data: {
              reporterFctId: 'b505cf08-cc3f-4814-8d76-3dd23ad1ea35',
            },
          },
          operator: '>=',
          right: 37,
          options: { sustainTimeInMS: 20000, allowedDeviation: 0.2 },
        },
        elementType: 'EVENT_LISTENER',
      },
      {
        type: 'TIMER',
        id: 'eventListener_5',
        durationInMS: 50000,
        phaseId: 'phase_3',
        elementType: 'EVENT_LISTENER',
      },
      {
        type: 'TIMER',
        id: 'eventListener_6',
        durationInMS: 30000,
        phaseId: 'phase_4',
        elementType: 'EVENT_LISTENER',
      },
      {
        type: 'TIMER',
        id: 'eventListener_7',
        durationInMS: 50000,
        phaseId: 'phase_5',
        elementType: 'EVENT_LISTENER',
      },
      {
        type: 'TIMER',
        id: 'eventListener_8',
        durationInMS: 50000,
        phaseId: 'phase_6',
        elementType: 'EVENT_LISTENER',
      },
    ],
  },

  phases: [
    {
      id: 'phase_1',
      commands: [
        {
          id: 'command_1',
          type: 'SET_TARGETS',
          data: {
            targets: [
              {
                inputNodeId: '8006ba5a-30cf-4d15-b4cb-34fda02e87e3',
                target: 20,
              },
            ],
          },
        },
      ],
      elementType: 'PHASE',
    },
    {
      id: 'phase_2',
      commands: [
        {
          id: 'command_1',
          type: 'SET_TARGETS',
          data: {
            targets: [
              {
                inputNodeId: '8006ba5a-30cf-4d15-b4cb-34fda02e87e3',
                target: 40,
              },
            ],
          },
        },
      ],
      elementType: 'PHASE',
    },
    {
      id: 'phase_3',
      commands: [
        {
          id: 'command_1',
          type: 'SET_TARGETS',
          data: {
            targets: [
              {
                inputNodeId: '8006ba5a-30cf-4d15-b4cb-34fda02e87e3',
                target: 20,
              },
            ],
          },
        },
      ],
      elementType: 'PHASE',
    },
    {
      id: 'phase_4',
      commands: [
        {
          id: 'command_1',
          type: 'SET_TARGETS',
          data: {
            targets: [
              {
                inputNodeId: '8006ba5a-30cf-4d15-b4cb-34fda02e87e3',
                target: 35,
              },
            ],
          },
        },
      ],
      elementType: 'PHASE',
    },
    {
      id: 'phase_5',
      commands: [
        {
          id: 'command_1',
          type: 'SET_TARGETS',
          data: {
            targets: [
              {
                inputNodeId: '8006ba5a-30cf-4d15-b4cb-34fda02e87e3',
                target: 40,
              },
            ],
          },
        },
      ],
      elementType: 'PHASE',
    },
    {
      id: 'phase_6',
      commands: [
        {
          id: 'command_1',
          type: 'SET_TARGETS',
          data: {
            targets: [
              {
                inputNodeId: '8006ba5a-30cf-4d15-b4cb-34fda02e87e3',
                target: 24,
              },
            ],
          },
        },
      ],
      elementType: 'PHASE',
    },
  ],

  gateways: [
    {
      id: 'gateway_1',
      type: 'OR',
      elementType: 'GATEWAY',
    },
    {
      /* conditional gateway that loops 3 times
      /* (the first iteration happens before we reach the gateway, that is why "right: 2") */
      id: 'gateway_2',
      type: 'CONDITION',
      condition: {
        left: {
          type: 'GATEWAY',
          data: {
            gatewayId: 'gateway_2',
            property: 'activations',
          },
        },
        operator: '<',
        right: 2,
      },
      trueFlowId: 'flow_10',
      falseFlowId: 'flow_11',
      elementType: 'GATEWAY',
    },
  ],

  flows: [
    {
      id: 'flow_1',
      srcId: 'eventListener_1',
      destId: 'phase_1',
      elementType: 'FLOW',
    },
    {
      id: 'flow_2',
      srcId: 'eventListener_2',
      destId: 'phase_2',
      elementType: 'FLOW',
    },
    {
      id: 'flow_3',
      srcId: 'eventListener_3',
      destId: 'phase_3',
      elementType: 'FLOW',
    },
    {
      id: 'flow_4',
      srcId: 'eventListener_4',
      destId: 'phase_4',
      elementType: 'FLOW',
    },
    {
      id: 'flow_5',
      srcId: 'eventListener_5',
      destId: 'gateway_1',
      elementType: 'FLOW',
    },
    {
      id: 'flow_6',
      srcId: 'eventListener_6',
      destId: 'gateway_1',
      elementType: 'FLOW',
    },
    {
      id: 'flow_7',
      srcId: 'gateway_1',
      destId: 'phase_5',
      elementType: 'FLOW',
    },
    {
      id: 'flow_8',
      srcId: 'eventListener_7',
      destId: 'phase_6',
      elementType: 'FLOW',
    },
    {
      id: 'flow_9',
      srcId: 'eventListener_8',
      destId: 'gateway_2',
      elementType: 'FLOW',
    },
    {
      id: 'flow_10',
      srcId: 'gateway_2',
      destId: 'phase_5',
      elementType: 'FLOW',
    },
    {
      id: 'flow_11',
      srcId: 'gateway_2',
      destId: 'eventDispatcher_1',
      elementType: 'FLOW',
    },
  ],

  eventDispatchers: [
    {
      type: 'END',
      id: 'eventDispatcher_1',
      elementType: 'EVENT_DISPATCHER',
    },
  ],
}
```
