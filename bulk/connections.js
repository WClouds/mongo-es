const mongoose = require('mongoose')

const Schema = mongoose.Schema

const options = {
  dbName: 'live',
  useNewUrlParser: true,
  useFindAndModify: false,
}

const url = process.env.DATASOURCE_MONGO_URI

const localMongoConn = mongoose.createConnection(url, options)

localMongoConn.on('connected', () => {
  console.log('local mongodb connection success')
})

const eventModel = localMongoConn.model(
  'events',
  new Schema({
    _id: Schema.Types.Mixed,
    req: Object,
    ip: String,
    region: Object,
    name: String,
    data: Object,
    scope: Object,
    origin: String,
    user: Object,
    createdAt: Date,
    expiresAt: Date,
  }),
)

const orderModel = localMongoConn.model(
  'orders',
  new Schema({
    _id: String,
    passcode: String,
    customer: Object,
    restaurant: Object,
    delivery: Object,
    items: Object,
    destination: Object,
    createdAt: Date,
    region: Object,
    events: Object,
  }),
)

module.exports = {
  eventModel,
  orderModel,
}
