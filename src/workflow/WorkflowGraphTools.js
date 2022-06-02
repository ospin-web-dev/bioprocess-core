const Flows = require('./elements/flows/Flows')
const EventListeners = require('./elements/eventListeners/EventListeners')

class WorkflowGraphTools {

  static buildGraph(workflow) {
  /* the graph is build like that:
   * 1. flows are edges, the other elements are vertices
   * 2. additionally, we create edges between phases and their embedded event listeners;
   * we use an adjancency list because the graph is loosely connected
   */

    const adj = {}

    const flows = Flows.getAll(workflow)
    flows.forEach(({ srcId, destId }) => {
      if (!(srcId in adj)) {
        adj[srcId] = []
      }
      adj[srcId].push(destId)
    })

    const eventListeners = EventListeners.getAll(workflow)
    eventListeners.forEach(listener => {
      const { id, phaseId } = listener
      if (phaseId === null) return
      if (!(phaseId in adj)) {
        adj[phaseId] = []
      }
      adj[phaseId].push(id)
    })

    return adj
  }

  static elementIsReachable(workflow, elementId) {
    /* using BFS here; trying to start at every global event listener */
    const adjList = WorkflowGraphTools.buildGraph(workflow)
    const startNodes = EventListeners
      .getManyBy(workflow, { phaseId: null })
      .map(listener => listener.id)

    /* eslint-disable-next-line */
    for (const startNode of startNodes) {
      const queue = [ startNode ]
      const visited = new Set()

      while (queue.length) {
        const currElementId = queue.shift()
        if (currElementId === elementId) return true
        visited.add(currElementId)
        const neighbours = adjList[currElementId]

        if (neighbours) {
          neighbours.forEach(nbrId => {
            if (!visited.has(nbrId)) queue.push(nbrId)
          })
        }
      }
    }
    return false
  }

}

module.exports = WorkflowGraphTools
