# Rules for Workflows

## Execution

**1. Every workflow needs to have exactly one START event listener**

To define the entry point of a workflow, the workflow needs to define a `START` event listener. Currently, only one start event listener is supported.

**2. Every workflow needs to have at least one phase**

A workflow without a single phase does nothing. Therefore this requirement.

**3. Every phase needs to be reachable**

Unreachable phases indicate a flaw in the execution of the workflow.

**4. Every workflow needs to have at least one END event dispatcher**

To define an end of a workflow an `END` event has to be dispatched, so that the workflow engine knows that a workflow has ended.

**5. Every END event dispatcher of the workflow has to be reachable**

Unreachable `END` event dispatchers indicate a flaw in the execution of the workflow.

**6. A workflow is considered started, when the first START event listener is triggered**

**6. A workflow is considered ended, when the first END event dispatcher dispatches an event**

## Connection

This section defines which elements can be connected via flows

### Phases

can connect to:
 - nothing

The transition from a phase happens via the attached event listeners, so the phase itself does not have flows attached to it. This might change when we want to allow immediate transitions when all command of a phase were fired. In this case we can either allow phases to connected directly or introduce an event listener that listens for a `COMMANDS_EXECUTED` event that a phase might dispatch when all command were procssed

### Event Listeners

can conncect to:
 - event dispatchers
 - gateways
 - phases

An event listener can only have one outgoing flow

### Event Dispatchers

can conncect to:
 - nothing

Event Dispatchers finish the flow branch that they are on

### Gateways

can conncect to:
 - event dispatchers
 - gateways
 - phases

#### AndMergeGateway

Can have many inputs, but only one output

#### AndSplitGateway

Can have many outputs, but only one input

#### OrMergeGateway

Can have many inputs, but only one output

#### Loopback

Can have many outputs, but only one input and only one loopback flow
