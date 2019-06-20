import * as _ from 'lodash'

/**
 * format order data
 */
function orderFormater(order) {
  const source = _.get(order, 'stripe.source')
  if (_.isObject(source)) {
    _.set(order, 'stripe.source_obj', _.get(order, 'stripe.source'))
    delete order.stripe.source
  }
  if (_.isString(source)) {
    _.set(order, 'stripe.source_str', _.get(order, 'stripe.source'))
    delete order.stripe.source
  }

  const cutoff = _.get(order, 'restaurant.delivery.cutoff')
  if (_.isObject(cutoff)) {
    _.set(order, 'restaurant.delivery.cutoff_obj', cutoff)
    delete order.restaurant.delivery.cutoff
  } else {
    _.set(order, 'restaurant.delivery.cutoff_value', cutoff)
    delete order.restaurant.delivery.cutoff
  }

  const items = _.get(order, 'items')
  if (!_.isEmpty(items)) {
    order.items = _.map(items, item => {
      const options = _.get(item, 'options')
      if (_.isObject(options) && !_.isArray(options)) {
        item.options = _.map(options, (v, k) => {
          return v
        })
      }
      return item
    })
  }

  const restAddress = _.get(order, 'restaurant.address')
  if (restAddress && !_.isObject(restAddress)) {
    _.set(order, 'restaurant.address_text', restAddress)
    delete order.restaurant.address
  }

  const tip = _.get(order, 'tip')
  if (tip && _.isObject(tip)) {
    _.set(order, 'tip_obj', tip)
    delete order.tip
  } else {
    _.set(order, 'tip_value', tip)
    delete order.tip
  }

  const driver = _.get(order, 'driver')
  if (!_.isUndefined(driver) && !_.isObject(driver)) {
    _.set(order, 'driver_value', driver)
    delete order.driver
  }

  const cost = _.get(order, 'cost')
  if (!_.isUndefined(cost) && !_.isObject(cost)) {
    _.set(order, 'cost_value', cost)
    delete order.cost
  }

  return order
}

/**
 * format tron event data
 */
function tronEventFormater(event) {
  const formatedVisits = _.map(_.get(event, 'data.tron.input.visits'), (v, k) => {
    return {
      order_id: k,
      value: v,
    }
  })
  _.set(event, 'data.tron.input.visits', formatedVisits)
  _.set(event, 'data.input.visits', formatedVisits)
  const formatedFleet = _.map(_.get(event, 'data.tron.input.fleet'), (v, k) => {
    return {
      fleet_id: k,
      value: v,
    }
  })
  _.set(event, 'data.tron.input.fleet', formatedFleet)
  _.set(event, 'data.input.fleet', formatedFleet)

  const formatedDistances = _.map(_.get(event, 'data.tron.output.distances'), (v, k) => {
    return {
      driver_id: k,
      value: v,
    }
  })
  _.set(event, 'data.tron.output.distances', formatedDistances)

  const formatedUnserved = _.map(_.get(event, 'data.tron.output.unserved'), (v, k) => {
    return {
      order: k,
      value: v,
    }
  })
  _.set(event, 'data.tron.output.unserved', formatedUnserved)

  const formatedPolylines = _.map(_.get(event, 'data.tron.output.polylines'), (v, k) => {
    return {
      driver_id: k,
      polyline: v,
    }
  })
  _.set(event, 'data.tron.output.polylines', formatedPolylines)
  const formatedSolution = _.map(_.get(event, 'data.tron.output.solution'), (v, k) => {
    return {
      driver: k,
      route: v,
    }
  })
  _.set(event, 'data.tron.output.solution', formatedSolution)

  const alternative = _.get(event, 'data.tron.alternative')
  const formatedAlternative = _.map(alternative, item => {
    const solutions = _.map(_.get(item, 'output.solution'), (v, k) => {
      return {
        driver: k,
        route: v,
      }
    })
    _.set(item, 'output.solution', solutions)
    if (_.get(item, 'output.unserved')) {
      const formatedUnserved = _.map(_.get(item, 'output.unserved'), (v, k) => {
        return {
          driver: k,
          value: v,
        }
      })
      _.set(item, 'output.unserved', formatedUnserved)
    }
    if (item.input) {
      delete item.input
    }
    return item
  })
  _.set(event, 'data.tron.alternative', formatedAlternative)

  return event
}

/**
 * Tron event formater
 */
export default function formater(data) {
  /**
   * Iterate data and format
   */
  const formatedRes = _.map(data, item => {
    if (item.action === 'delete') {
      return item
    }
    if (_.get(item, 'data.name') === 'tron.output') {
      const event = item.data
      item.data = tronEventFormater(event)
    }

    if (/order/.test(item.id)) {
      const order = item.data
      item.data = orderFormater(order)
    }

    return item
  })
  return formatedRes
}
