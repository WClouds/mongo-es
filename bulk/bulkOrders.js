const _ = require('lodash')
const Redis = require('ioredis')

const { orderModel } = require('./connections')
const { upsertOrders } = require('./model-elastic')

const redis = new Redis('localhost')

async function run() {
  try {
    const startAt = new Date('2015-01-01T00:00:00.000Z')
    let endAt = new Date('2019-06-22T00:00:00.000Z')

    const redisDate = await redis.get('bulk:orderEndAt')
    console.log('redisDate==>', redisDate, typeof redisDate)

    if (redisDate) {
      console.log('exist=-=-==>', new Date(redisDate))
      endAt = new Date(redisDate)
    }

    let total = 0

    let running = true
    while (running) {
      const query = {
        createdAt: {
          $gte: startAt,
          $lt: endAt,
        },
      }
      const project = {}
      const options = {
        sort: {
          createdAt: -1,
        },
        limit: 4000,
      }
      const orders = await orderModel.find(query, project, options).lean()

      console.log('orders length===>', orders.length)
      total += orders.length

      endAt = new Date(orders[orders.length - 1].createdAt)
      await redis.set('bulk:orderEndAt', endAt)
      console.log('new start at===>', endAt)

      await upsertOrders(orders)

      if (orders.length < 4000) {
        running = false
        console.log('total===>', total)
      }
    }
  } catch (err) {
    console.log(err)
    console.log(err.meta)
  }
}

run()
