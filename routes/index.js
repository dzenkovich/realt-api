const express = require('express')
const Flat = require('../models/flat')

const router = express.Router()

router.get('/flats', function(req, res, next) {
  return Flat.getFlats(req.query).then(flats => res.send(flats))
})

router.get('/flat', function(req, res, next) {
  return Flat.getByFlatIds(req.query).then(flats => res.send(flats))
})

router.get('/rent-average', function(req, res, next) {
  return Flat.calculateAverageRentPrice(req.query).then(points => res.send(points))
})

module.exports = router
