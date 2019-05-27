import * as _ from 'lodash'

/**
 * Tron event formater
 */
export default function formater(data) {
  const formatedRes = _.map(data, item => {
    if (_.get(item, 'data.name') === 'tron.output') {
      const event = item.data

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

      const formatedDistances = _.map(
        _.get(event, 'data.tron.output.distances', (v, k) => {
          return {
            driver: k,
            value: v,
          }
        }),
      )
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
        return item
      })
      _.set(event, 'data.tron.alternative', formatedAlternative)

      item.data = event
    }

    return item
  })
  return formatedRes
}
