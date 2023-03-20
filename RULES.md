# Introduction

The OSPIN workflow engine is an event-based execution engine that executes OSPIN workflow definitions. This document tries to define language and execution semantics for the underlying data model. The data schemas can be found here (they are automatically generated from the repository): INSERT LINK

# Language

The worklow definition is a directed, cyclic graph with 4 different types of nodes, namely **event listeners**, **event dispatchers**, **gateways**, and **phases**, and only a single type of edges that we call **flows**.

## Event Listeners

Schema: INSERT LINK

Event listeners listen for events coming from the outside world or from the device. We differentiate between global event listeners and event listeners that are bound to a phase.

Event listeners only listen to an event when they are active. An event listener becomes active either when the phase that it is bound to becomes active (e.g. for phase transitions), when it is a global event listener and has no incoming flows (e.g. the START event listener for process), or when it is a global event listener and it receives a signal via its incoming flow (for global event listeners that live between two flows).

ADD IMAGE FOR THE DIFFERENT SETUP

The event listeners have types that indicate which kind of event they listen to. Once they receive the event they wait for, they send a signal to their outgoing flow and become inactive again.

For phase-bound event listeners, a phase is set to finished when one of the event listeners receives its event. When a phase is finished, all of its event listeners need to be set to inactive. This way we model "exclusive" event listeners for transitions, meaning only one transition can happen for phase, and all other once are cancelled.

The "START" event listener is special in the sense that it can be present only once per workflow and is required in every workflow definition. It defines the entry point of the workflow.

There are also implicit event listeners: For pausing, resuming and terminating a workflow. These listeners are not modelled in the data structure.

Another behaviour of event listeners is that every event listener can be triggered forcefully via a user command.

## Phases

Phases are a little bit wierd as they are really an abstraction on top of what most workflow engines would call a task/command/activity, extended with our event listeners. So what they really mean is:

Execute a command, then wait for one of the event listeners to receive an event.
One could consider omitting phases completely, in favour of an element type of "task" and an event gateway that follows the same logic for exclusiveness as the phase-bound event listeners (so once one event fires, the other ones are cancelled), but phases are easier to grasp for most customers, so lets keep them, even though they feel a little bit clumsy.

A phase is activated, when it receives a signal via an incoming flow. A phase can have only a single incoming flow (if multiple flows need to trigger a phase, one has to use gateways to unify them, e.g. via an OR-Merge gateway). When activated, it executes its command and activates all event-listeners that are bound to it (see Event Listeners).

Every workflow definition needs to have at least one phase.

A phase that is considered not finished yet, cannot be triggered again.

## Event Dispatchers

Event dispatchers dispatch an event when activated. This serves to communicate events to the outside world, like the end of a process, or for communication between different parts of the workflow.

After an event dispatcher dispatched an event, it finishes the current branch. The have no outgoing flows (discussable)

Every workflow has to have at least one END event dispatcher.

It is important to note that the engine will dispatch a lot of events that are not modelled explictly as event dispatchers, e.g. on a phase start. Event dispatchers in the data model are modelling only event disaptchers that can be controlled by the user.

## Gateways

Gateway control the flow of the workflow on the highest level. It allows merging and splitting the workflow, and it allows creating conditional logic like loops.

Gateways receive signals from the incoming flows and then produce output flows based on the type of the gateway, e.g. OR gateways produce a signal on all outgoing flows whenever one of the incoming flows receives a signal.

## Flows

Flows serve as connection between the different elements and transport signal between them. E.g. when the start listener receives an event, it dispatches a signal to the outgoing flow that is received by the destination element.

The destination element *might* consume the signal and be activated. Most of the time, signals will be consumed immediately. There are exceptions however, e.g. the AND-Merge gateway will only consume the signal when all of its incoming flows have a signal in order to produce signals on its outgoing flows. This means signals have to be retained until they are consumed.

A flow can only ever carry a single signal.


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
- an event listener receives an event
- a flow receives a signal
- a phase is started
- a phase is finished
- a gateway creates a flow
- a workflow is paused/resumed/terminated


## Connection

This section defines which elements can be connected via flows

### Phases

can connect to:
 - nothing

The transition from a phase happens via the attached event listeners, so the phase itself does not have flows attached to it. This might change when we want to allow immediate transitions when all command of a phase were fired.

### Event Listeners

can conncect to:
 - event dispatchers
 - gateways
 - phases
 - event listeners (not implemented yet)

An event listener can only have one outgoing flow

### Event Dispatchers

can connect to:
 - nothing

Event Dispatchers finish the flow branch that they are on

### Gateways

can connect to:
 - event dispatchers
 - gateways
 - phases
 - event listeners (not implemented yet)

#### AndGateway

When all inputs flows have a signal, produce a signal on all output flows

#### OrGateway

When one of inputs flows has a signal, produce a signal on all output flows

#### ConditionalGateway

Can have only one input and two outputs: One for when the provided condition is true, and one for false. The condition is evaluated when one of incoming flow receives a signal. Afer evaluation, the signal is consumed.

The conditional gateway can be used to represent loops, e.g. "run 10 times" by providing a condition that checks if the amount of iterations of the gateway has exceeded 10, something like

`${gateway.gatewayId.activations} < 10` or whatever syntax we decide for. `activations` serves as a local varibale for keep track on how many times the gateway was invoked (there are many ways to express that, e.g. we could call the variable also something else)


