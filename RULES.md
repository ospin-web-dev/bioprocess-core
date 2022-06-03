# Rules for Workflows

## Execution

**1. Every workflow needs to have exactly one START event listener**

To define the entry point of a workflow, the workflow needs to define a `START` event listener. Currently, only one start event listener is supported.

**2. Every workflow needs to have at least one phase**

A workflow without a single phase does nothing. Therefore this requirement.

**3. Every phase needs to be reachable**

Unreachable phases indicate a flaw the execution of the workflow.

**4. Every workflow needs to have at least one END event dispatcher**

To define an end of a process an `END` event has to be dispatched, so that the workflow engine knows that a process has ended.

**5. Every END event dispatcher of the process has to be reachable**

Unreachable `END` event dispatchers indicate a flaw the execution of the workflow.
