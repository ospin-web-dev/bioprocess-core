const {
  getGlobalEventListeners,
  getEventListeners,
  getFlows,
} = require('./Workflow')

const buildGraph = workflow => {
  /* the graph is build like that:
   * 1. flows are edges, the other elements are vertices
   * 2. additionally, we create edges between phases and their embedded event listeners;
   * we use an adjancency list because the graph is loosely connected
   */

  const adj = {}

  const addToAdj = (src, dest) => {
    if (!(src in adj)) {
      adj[src] = []
    }
    adj[src].push(dest)
  }

  const flows = getFlows(workflow)
  flows.forEach(({ srcId, destId }) => {
    addToAdj(srcId, destId)
  })

  const eventListeners = getEventListeners(workflow)
  eventListeners.forEach(listener => {
    const { id, phaseId } = listener
    if (phaseId === null) return
    addToAdj(phaseId, id)
  })

  return adj
}

const elementIsReachable = (workflow, elementId) => {
  /* using BFS here; trying to start at every global event listener (phaseId: null) */
  const adjList = buildGraph(workflow)
  const startNodeIds = getGlobalEventListeners(workflow)
    .map(listener => listener.id)

  /* eslint-disable-next-line */
  for (const startNode of startNodeIds) {
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

module.exports = {
  elementIsReachable,
}
