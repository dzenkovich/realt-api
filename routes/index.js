const express = require('express')
const Flat = require('../models/flat')

const router = express.Router()

router.get('/flats', function(req, res, next) {
  return Flat.getFlats(req.query).then(flats => res.send(flats))
})

router.get('/flat/:id', function(req, res, next) {
  return Flat.getByFlatId(req.params.id).then(flats => res.send(flats))
})

module.exports = router
