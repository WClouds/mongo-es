const { Client } = require('@elastic/elasticsearch')
const _ = require('lodash')

const { eventFormater, orderFormater } = require('./handler')

const esClient = new Client({
  cloud: {
    id: process.env.CLOUD_ID,
    username: process.env.CLOUD_USERNAME,
    password: process.env.CLOUD_PASSWORD,
  },
})

async function upsertEvents(events) {
  let event_list = _.chunk(events, 400)
  console.log('events list length===>', event_list.length)

  let n = 0
  for (const items of event_list) {
    const formatedEvents = eventFormater(items)
    const body = _.chain(formatedEvents)
      .map(i => {
        return [
          {
            index: { _index: 'tron_events', _id: i._id },
          },
          _.omit(i, ['_id']),
        ]
      })
      .flatten()
      .value()

    const res = await esClient.bulk({
      index: 'tron_events',
      body,
    })

    console.log(res)

    console.log(`done-=--->${n} / ${event_list.length}`)

    if (res.body.errors) {
      console.log(JSON.stringify(res.body.items, null, '\t'))
      process.exit(1)
    }

    n += 1
  }
}

async function upsertOrders(orders) {
  let orders_list = _.chunk(orders, 1000)
  console.log('orderss list length===>', orders_list.length)

  let n = 1
  for (const items of orders_list) {
    const formatedOrders = orderFormater(items)
    const body = _.chain(formatedOrders)
      .map(i => {
        return [
          {
            index: { _index: 'orders', _id: i._id },
          },
          _.omit(i, ['_id']),
        ]
      })
      .flatten()
      .value()

    const res = await esClient.bulk({
      index: 'orders',
      body,
    })

    // console.log(res);

    console.log(`done-=--->${n} / ${orders_list.length}`)

    if (res.body.errors) {
      console.log(JSON.stringify(res.body.items, null, '\t'))
      process.exit(1)
    }

    n += 1
  }
}

module.exports = {
  upsertEvents,
  upsertOrders,
}
