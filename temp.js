const mongoose = require('mongoose')
const Flat = require('./models/flat')
const logger = require('./logger')

mongoose.connect('mongodb://localhost:27017/realt', { useNewUrlParser: true, autoIndex: false })
  .then(() => {
    return Flat.aggregate([
      {
        '$group': {
          '_id': '$flatId',
          'firstId': {
            '$first': '$_id',
          },
          'ids': {
            '$addToSet': {
              'id': '$_id',
              'created': '$created',
            },
          },
          'count': {
            '$sum': 1,
          },
        },
      }, {
        '$match': {
          'count': {
            '$gt': 1,
          },
        },
      }])
  })
  .then(result => {
    const duplicateIds = result.map(item => item.firstId)
    logger.info("Found duplicate documents: " + duplicateIds.length)
    return Flat.deleteMany({_id: duplicateIds})
  })
  .then(result => {
    logger.info("Delete documents: " + result.deletedCount)
  })
  .then(process.exit)