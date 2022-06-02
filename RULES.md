# Rules for Workflows

## Execution

**1. Every workflow needs to have at least on start event listener**

To define the entry point(s) of a workflow, the workflow needs to define a `START` event listener. Currently, only one start event listener is supported.

**2. Every workflow needs to have at least on phase**

A workflow without a single phase does nothing. Therefore this requirement.
