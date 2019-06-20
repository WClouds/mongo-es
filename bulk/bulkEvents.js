const _ = require('lodash')
const Redis = require('ioredis')

const { eventModel } = require('./connections')
const { upsertEvents } = require('./model-elastic')

const redis = new Redis('localhost')

async function run() {
  try {
    let startAt = new Date('2019-01-01T00:00:00.000Z')
    const endAt = new Date('2019-06-22T00:00:00.000Z')

    const redisDate = await redis.get('bulk:tronEventStartAt')
    console.log('redisDate==>', redisDate, typeof redisDate)

    if (redisDate) {
      console.log('exist=-=-==>', new Date(redisDate))
      startAt = new Date(redisDate)
    }

    let total = 0

    let running = true
    while (running) {
      const query = {
        name: 'tron.output',
        'data.tron': { $ne: null },
        createdAt: { $lte: endAt, $gt: startAt },
      }
      const project = {}
      const options = {
        sort: {
          createdAt: 1,
        },
        limit: 2000,
      }
      const events = await eventModel.find(query, project, options).lean()

      console.log('events length===>', events.length)
      total += events.length

      startAt = new Date(events[events.length - 1].createdAt)
      await redis.set('bulk:tronEventStartAt', startAt)
      console.log('new start at===>', startAt)

      await upsertEvents(events)

      if (events.length < 2000) {
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
