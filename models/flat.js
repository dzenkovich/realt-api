const mongoose = require('mongoose')

const Flat = new mongoose.Schema({
  // meta data
  flatId: { type: Number, index: true },
  created: { type: Date, default: Date.now },
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
  ceilHeight: Number,
  yearBuilt: { type: Number, index: true },
  images: [{
    url: String,
  }],
  details: {
    appliances: String,
    extra: String
  },
  notes: String,
})

const FlatModel = mongoose.model('Flat', Flat)

const validateRangeFilter = query => {
  if(query && (query.gt || query.lt)) {
    const gt = parseFloat(query.gt)
    const lt = parseFloat(query.lt)
    const search = {}
    if(gt) search.$gte = gt
    if(lt) search.$lte = lt
    if(gt || lt) return search
  }
  return null
}

FlatModel.getByFlatId = flatId => {
  return FlatModel.findOne({flatId})
}

FlatModel.getFlats = query => {
  const search = {}
  if(query.rooms && query.rooms.length) {
    search.rooms = query.rooms.map(num => parseInt(num)).filter(num => num)
  }
  if(query.area) {
    let filter = validateRangeFilter(query.area)
    if(filter) search.area = filter
  }
  if(query.price) {
    let filter = validateRangeFilter(query.price)
    if(filter) search.price = filter
  }
  if(query.priceMeter) {
    let filter = validateRangeFilter(query.priceMeter)
    if(filter) search.priceMeter = filter
  }

  return FlatModel.find(search, ['flatId', 'lat', 'lng', 'price', 'priceMeter'])
}

module.exports = FlatModel
