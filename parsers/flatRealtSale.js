const logger = require('../logger')
const { requestPromise } = require('../utilities')
const {
  getAddress, getRealtUpdate, getPrice, getPriceMeter, getRooms, getFloor, getBuildingFloors, getBuildingType,
  getArea, getAreaLiving, getAreaKitchen, getFinishing, getCeilHeight, getYearBuilt, getImages, getDetails, getNotes,
} = require('./selectors')
const program = require('commander');

program.option('-d, --debug', 'output extra debugging')

const url = 'https://realt.by/sale/flats/object/:id/'

const grabPage = link => {
  program.debug && logger.info('scraping flat: ' + link)
  return requestPromise(link).then($html => {
    program.debug && logger.info('scraped flat: ' + getAddress($html))
    return {
      type: 'sale',
      address: getAddress($html),
      realtUpdate: getRealtUpdate($html),
      price: getPrice($html),
      priceMeter: getPriceMeter($html),
      rooms: getRooms($html),
      floor: getFloor($html),
      buildingFloors: getBuildingFloors($html),
      buildingType: getBuildingType($html),
      area: getArea($html),
      areaLiving: getAreaLiving($html),
      areaKitchen: getAreaKitchen($html),
      finishing: getFinishing($html),
      ceilHeight: getCeilHeight($html),
      yearBuilt: getYearBuilt($html),
      images: getImages($html),
      details: getDetails($html),
      notes: getNotes($html),
    }
  })
  // we don't want to break the scraping chain if something goes wrong with one paper
    .catch(error => logger.warn(error && error.message))
}

module.exports = function(id) {
  if (!id) throw 'Realt.by page Id is required'
  const link = url.replace(':id', id)

  return grabPage(link)
}
