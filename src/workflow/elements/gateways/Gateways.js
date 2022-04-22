const ElementsHandler = require('../ElementsHandler')

const AndMergeGateway = require('./AndMergeGateway')
const AndSplitGateway = require('./AndSplitGateway')
const LoopGateway = require('./LoopGateway')
const OrMergeGateway = require('./OrMergeGateway')

class Gateways extends ElementsHandler {

  static get COLLECTION_NAME() {
    return 'gateways'
  }

  static get ID_PREFIX() {
    return 'gateway'
  }

  static get TYPE_TO_INTERFACE_MAP() {
    return {
      [AndMergeGateway.TYPE]: AndMergeGateway,
      [AndSplitGateway.TYPE]: AndSplitGateway,
      [LoopGateway.TYPE]: LoopGateway,
      [OrMergeGateway.TYPE]: OrMergeGateway,
    }
  }

  static getInterface(gateway) {
    return Gateways.TYPE_TO_INTERFACE_MAP[gateway.type]
  }

  static removeGateway(workflow, gatewayId) {
    return this.removeElement(workflow, gatewayId)
  }

  static addAndMergeGateway(workflow, data) {
    return this.addElement(workflow, AndMergeGateway, data)
  }

  static addAndSplitGateway(workflow, data) {
    return this.addElement(workflow, AndSplitGateway, data)
  }

  static addLoopGateway(workflow, data) {
    return this.addElement(workflow, LoopGateway, data)
  }

  static addOrMergeGateway(workflow, data) {
    return this.addElement(workflow, OrMergeGateway, data)
  }

  static updateGateway(workflow, id, data) {
    return this.updateElement(workflow, id, data)
  }

}

module.exports = Gateways
