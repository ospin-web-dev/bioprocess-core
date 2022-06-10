const ElementsHandler = require('../ElementsHandler')

const AndMergeGateway = require('./AndMergeGateway')
const AndSplitGateway = require('./AndSplitGateway')
const LoopGateway = require('./LoopGateway')
const OrMergeGateway = require('./OrMergeGateway')
const Gateway = require('./Gateway')

class Gateways extends ElementsHandler {

  static get ELEMENT_TYPE() {
    return Gateway.ELEMENT_TYPE
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
    return this.remove(workflow, gatewayId)
  }

  static addAndMergeGateway(workflow, data) {
    return this.add(workflow, AndMergeGateway, data)
  }

  static addAndSplitGateway(workflow, data) {
    return this.add(workflow, AndSplitGateway, data)
  }

  static addLoopGateway(workflow, data) {
    return this.add(workflow, LoopGateway, data)
  }

  static addOrMergeGateway(workflow, data) {
    return this.add(workflow, OrMergeGateway, data)
  }

  static updateGateway(workflow, id, data) {
    return this.update(workflow, id, data)
  }

}

module.exports = Gateways
