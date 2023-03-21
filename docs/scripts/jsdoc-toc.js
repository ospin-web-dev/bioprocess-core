(function($) {
    // TODO: make the node ID configurable
    var treeNode = $('#jsdoc-toc-nav');

    // initialize the tree
    treeNode.tree({
        autoEscape: false,
        closedIcon: '&#x21e2;',
        data: [{"label":"<a href=\"EventSourcing.html\">EventSourcing</a>","id":"EventSourcing","children":[]},{"label":"<a href=\"Workflow.html\">Workflow</a>","id":"Workflow","children":[{"label":"<a href=\"Workflow.AndGateway.html\">AndGateway</a>","id":"Workflow.AndGateway","children":[]},{"label":"<a href=\"Workflow.ApprovalEventListener.html\">ApprovalEventListener</a>","id":"Workflow.ApprovalEventListener","children":[]},{"label":"<a href=\"Workflow.ConditionEventListener.html\">ConditionEventListener</a>","id":"Workflow.ConditionEventListener","children":[]},{"label":"<a href=\"Workflow.ConditionalGateway.html\">ConditionalGateway</a>","id":"Workflow.ConditionalGateway","children":[]},{"label":"<a href=\"Workflow.EndEventDispatcher.html\">EndEventDispatcher</a>","id":"Workflow.EndEventDispatcher","children":[]},{"label":"<a href=\"Workflow.EventDispatchers.html\">EventDispatchers</a>","id":"Workflow.EventDispatchers","children":[]},{"label":"<a href=\"Workflow.EventListeners.html\">EventListeners</a>","id":"Workflow.EventListeners","children":[]},{"label":"<a href=\"Workflow.Flows.html\">Flows</a>","id":"Workflow.Flows","children":[]},{"label":"<a href=\"Workflow.Gateways.html\">Gateways</a>","id":"Workflow.Gateways","children":[]},{"label":"<a href=\"Workflow.OrGateway.html\">OrGateway</a>","id":"Workflow.OrGateway","children":[]},{"label":"<a href=\"Workflow.Phases.html\">Phases</a>","id":"Workflow.Phases","children":[]},{"label":"<a href=\"Workflow.StartEventListener.html\">StartEventListener</a>","id":"Workflow.StartEventListener","children":[]},{"label":"<a href=\"Workflow.TimerEventListener.html\">TimerEventListener</a>","id":"Workflow.TimerEventListener","children":[]}]}],
        openedIcon: ' &#x21e3;',
        saveState: false,
        useContextMenu: false
    });

    // add event handlers
    // TODO
})(jQuery);
