# Rules for Workflows

## Execution

**1. Every workflow needs to have exactly one start event listener**

To define the entry point of a workflow, the workflow needs to define a `START` event listener. Currently, only one start event listener is supported.

**2. Every workflow needs to have at least one phase**

A workflow without a single phase does nothing. Therefore this requirement.

**3. Every workflow needs to have at least one end event dispatcher**

To define an end of a process an `END` event has to be dispatched, so that the workflow engine knows that a process has ended.



