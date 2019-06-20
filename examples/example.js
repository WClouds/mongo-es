const fs = require('fs')

const Redis = require('ioredis')

const { Config, Task, run } = require('../dist/src/index')

const redis = new Redis('localhost')

Task.onSaveCheckpoint((name, checkpoint) => {
  return redis.set(`mongo-es:${name}`, JSON.stringify(checkpoint))
})

Task.onLoadCheckpoint(name => {
  return redis.get(`mongo-es:${name}`).then(str => {
    console.log('loaded', `mongo-es:${name}`, str)
    return JSON.parse(str)
  })
})

let config = fs.readFileSync('examples/local_config.json', 'utf8')
config.mongodb = {
  url: process.env.MONGO_URL,
  options: {
    authSource: 'admin',
    readPreference: 'primaryPreferred',
  },
}
config.elasticsearch.options = {
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
}

run(new Config(config))
