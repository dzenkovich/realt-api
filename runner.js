const { FLATS_SALE_QUERY, FLATS_RENT_QUERY, URL_REALT_BY } = require('./constants')
const logger = require('./logger')
const flatRealtSale = require('./parsers/flatRealtSale')
const flatRealtRent = require('./parsers/flatRealtRent')
const { requestPromise } = require('./utilities')
const Flat = require('./models/flat')
const mongoose = require('mongoose')
const program = require('commander');

program.option('-d, --debug', 'output extra debugging')

function printProgress(progress){
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(progress + '%');
}

const searchForFlat = data => {
  const {address, rooms, floor, buildingFloors, buildingType, area, areaLiving, areaKitchen, ceilHeight, yearBuilt} = data
  return Flat.findOne({address, rooms, floor, buildingFloors, buildingType, area, areaLiving, areaKitchen, ceilHeight, yearBuilt})
}

const saveFlat = (data, found, count) => {
  // Try to find this flat by address, floor, rooms, area etc.
  // if this seems like a re-created posting - update, otherwise create new flat
  return (found ? Flat.findOne({ flatId: found.flatId}) : searchForFlat(data)).then(flat => {
    if (flat) {
      flat.history.push({
        date: flat.created,
        price: flat.price,
        priceMeter: flat.priceMeter,
        priceMonth: flat.priceMonth,
      })
      flat.updated = Date.now()
      flat.active = true
      count.updated ++
      return Object.assign(flat, data)
    }
    else {
      count.created ++
      return new Flat(data)
    }
  }).then(flat => {
    return flat.save()
      .then(() => program.debug && logger.info('saved flat: ' + data.address))
      .catch(logger.warn)
  })
}

const flatHasChanges = (dbFlat, realtFlat, type) => {
  return dbFlat.lat !== realtFlat.geometry.coordinates[0]
    || dbFlat.lng !== realtFlat.geometry.coordinates[1]
    || dbFlat[type === 'sale' ? 'price' : 'priceMonth'] !== parseInt(realtFlat.properties.price)
}

const scrapeFlats = type => {
  const count = {
    scraped: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    deactivated: 0
  }
  const options = {
    url: URL_REALT_BY,
    qs: type === 'rent' ? FLATS_RENT_QUERY : FLATS_SALE_QUERY,
    qsStringifyOptions: { encodeValuesOnly: true, indices: false },
  }
  return requestPromise(options).then(response => {
    const flats = JSON.parse(response.text()).features
    if (!flats || !flats.length) {
      return logger.warn('No flats where found')
    }

    // grab all existing Sale flat ids
    return Flat.getFlats({ type }).then(existingFlats => {
      let outdatedFlats = existingFlats.map(flat => flat.flatId)
      let totalToScrap = 0

      // extract every item one by one with delayexistingFlats.find(item => item.flatId == flat.id)
      return flats.reduce((promise, flat) => {
        const found = existingFlats.find(item => item.flatId === flat.id)
        // remove existing flat from the list of flats to deactivate
        if (found) outdatedFlats = outdatedFlats.filter(flatId => flatId !== found.flatId)
        // Parse only if flat have changed
        if (!found || flatHasChanges(found, flat, type)) {
          const flatObject = {
            flatId: flat.id,
            lat: flat.geometry.coordinates[0],
            lng: flat.geometry.coordinates[1],
          }
          totalToScrap++

          return promise.then(() => {
            return new Promise(resolve => {
              setTimeout(resolve, 500) // delay
            })
              .then(() => {
                return type === 'rent' ? flatRealtRent(flat.id) : flatRealtSale(flat.id) // run next flat parsing
              })
              .then(data => {
                printProgress( (100 * (count.updated + count.created) / totalToScrap).toFixed(2) )
                return saveFlat({ ...flatObject, ...data }, found, count) // save flat
              })
          })
        }
        else {
          count.skipped++
        }

        return promise

      }, new Promise(resolve => {
        resolve()
      }))
        .then(() => {
          count.deactivated = outdatedFlats.length
          return Flat.updateMany({flatId: outdatedFlats}, {"$set": {active: false}})
        })
        .then(() => {
          logger.info('====================')
          const report = Object.keys(count).map(key => key + ': ' + count[key]).join(' | ')
          logger.info('TOTAL ' + type + ': ' + report)
          return true
        })

    })
  })
}

mongoose.connect('mongodb://localhost:27017/realt', { useNewUrlParser: true, autoIndex: false })
  .then(() => Promise.all([scrapeFlats('rent'), scrapeFlats('sale')]))
  .then(process.exit)
