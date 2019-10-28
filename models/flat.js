const mongoose = require('mongoose')
const { clusterData, calculateMedian } = require('../utils/map')

const Flat = new mongoose.Schema({
  // meta data
  flatId: { type: Number, index: true },
  created: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  updated: Date,
  type: String,

  // base data
  lat: { type: Number, index: true },
  lng: { type: Number, index: true },

  // grabbed data
  address: String,
  realtUpdate: Date,
  price: { type: Number, index: true },
  priceMeter: { type: Number, index: true },
  priceMonth: { type: Number, index: true },
  rooms: { type: Number, index: true },
  floor: Number,
  buildingFloors: Number,
  buildingType: String,
  area: { type: Number, index: true },
  areaLiving: Number,
  areaKitchen: Number,
  finishing: String,
  ceilHeight: Number,
  yearBuilt: { type: Number, index: true },
  images: [{
    url: String,
  }],
  details: {
    appliances: String,
    extra: String,
  },
  notes: String,
  history: [{
    date: Date,
    price: Number,
    priceMeter: Number,
    priceMonth: Number,
  }]
})

const FlatModel = mongoose.model('Flat', Flat)

const validateRangeFilter = query => {
  if (query && (query.gt || query.lt)) {
    const gt = parseFloat(query.gt)
    const lt = parseFloat(query.lt)
    const search = {}
    if (gt) search.$gte = gt
    if (lt) search.$lte = lt
    if (gt || lt) return search
  }
  return null
}

FlatModel.getByFlatIds = query => {
  if (!query.ids) throw 'No flat ids provided'
  return FlatModel.find({ flatId: query.ids }).sort({ price: 1, priceMonth: 1 })
}

FlatModel.getFlats = query => {
  const search = {active: true, type: 'sale'}
  if (query.rooms && query.rooms.length) {
    search.rooms = query.rooms.map(num => parseInt(num)).filter(num => num)
  }
  if (query.year) {
    let filter = validateRangeFilter(query.year)
    if (filter) search.yearBuilt = filter
  }
  if (query.area) {
    let filter = validateRangeFilter(query.area)
    if (filter) search.area = filter
  }
  if (query.price) {
    let filter = validateRangeFilter(query.price)
    if (filter) search.price = filter
  }
  if (query.priceMeter) {
    let filter = validateRangeFilter(query.priceMeter)
    if (filter) search.priceMeter = filter
  }

  return FlatModel.find(search, ['flatId', 'lat', 'lng', 'price', 'priceMeter', 'priceMonth'])
}

FlatModel.calculateAverageRentPrice = (query) => {
  const search = {type: 'rent'}
  if (query.year) {
    let filter = validateRangeFilter(query.year)
    if (filter) search.yearBuilt = filter
  }
  if (query.rooms && query.rooms.length) {
    search.rooms = query.rooms.map(num => parseInt(num)).filter(num => num)
  }
  if (query.area) {
    let filter = validateRangeFilter(query.area)
    if (filter) search.area = filter
  }

  return FlatModel.find(search, ['flatId', 'lat', 'lng', 'priceMonth']).then(flats => {
    const clusters = clusterData(flats)
    calculateMedian(clusters, 'priceMonth')
    return clusters
  })
}

module.exports = FlatModel
