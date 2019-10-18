const { FLATS_SALE_QUERY, FLATS_RENT_QUERY, URL_REALT_BY } = require('./constants')
const logger = require('./logger')
const flatRealtSale = require('./parsers/flatRealtSale')
const flatRealtRent = require('./parsers/flatRealtRent')
const { requestPromise } = require('./utilities')
const Flat = require('./models/flat')
const mongoose = require('mongoose')

const saveFlat = data => {
  const flat = new Flat(data)
  return flat.save()
    .then(() => logger.info('saved flat: ' + data.address))
    .catch(logger.warn)
}

const scrapeFlatsSale = () => {
  const options = {
    url: URL_REALT_BY,
    qs: FLATS_SALE_QUERY,
    qsStringifyOptions: {encodeValuesOnly: true, indices: false}
  }
  return requestPromise(options).then(response => {
    const flats = JSON.parse(response.text()).features
    if (!flats || !flats.length) {
      return logger.warn('No flats where found')
    }

    // extract every item one by one with delay
    return flats.reduce((promise, flat) => {
      const flatObject = {
        flatId: flat.id,
        lat: flat.geometry.coordinates[0],
        lng: flat.geometry.coordinates[1],
      }

      return promise.then(() => {
        return new Promise(resolve => {
          setTimeout(resolve, 250) // delay
        })
          .then(() => {
            return flatRealtSale(flat.id) // run next flat parsing
          })
          .then(data => {
            return saveFlat({ ...flatObject, ...data }) // save flat
          })
      })
    }, new Promise(resolve => {
      resolve()
    }))
  })
}

const scrapeFlatsRent = () => {
  const options = {
    url: URL_REALT_BY,
    qs: FLATS_RENT_QUERY,
    qsStringifyOptions: {encodeValuesOnly: true, indices: false}
  }
  return requestPromise(options).then(response => {
    const flats = JSON.parse(response.text()).features
    if (!flats || !flats.length) {
      return logger.warn('No flats where found')
    }

    // extract every item one by one with delay
    return flats.reduce((promise, flat) => {
      const flatObject = {
        flatId: flat.id,
        lat: flat.geometry.coordinates[0],
        lng: flat.geometry.coordinates[1],
      }

      return promise.then(() => {
        return new Promise(resolve => {
          setTimeout(resolve, 250) // delay
        })
          .then(() => {
            return flatRealtRent(flat.id) // run next flat parsing
          })
          .then(data => {
            return saveFlat({ ...flatObject, ...data }) // save flat
          })
      })
    }, new Promise(resolve => {
      resolve()
    }))
  })
}

mongoose.connect('mongodb://localhost:27017/realt', { useNewUrlParser: true, autoIndex: false })
  .then(scrapeFlatsRent)
  .then(process.exit)
