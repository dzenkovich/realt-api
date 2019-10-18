exports.URL_FLAT = 'https://realt.by/sale/flats/object/:id/'

exports.URL_REALT_BY = 'https://realt.by/'

exports.FLATS_SALE_QUERY = {
  eID: 'tx_uedbcore_mapApi',
  tid: 1,
  type: 'list',
  hash: '5a04745164189eb4886f737535e6e288',
  's[rooms][e][]': [1, 2, 3, 4],
  s: {
    price: {
      ge: 30,
      le: '',
    },
    price_m2: {
      ge: '',
      le: '',
    },
    area_total: {
      ge: '',
      le: '',
    },
    area_living: {
      ge: '',
      le: '',
    },
    area_kitchen: {
      ge: '',
      le: '',
    },
    building_year: {
      ge: '',
      le: '',
    },
    storeys: {
      ge: '',
      le: '',
    },
    ceiling_height: {
      ge: '',
      le: '',
    },
  },
  bbox: '53.7239,27.2461,54.0872,27.8613',
}

exports.FLATS_RENT_QUERY = {
  eID: 'tx_uedbcore_mapApi',
  tid: 2001,
  type: 'list',
  hash: '5a04745164189eb4886f737535e6e288',
  's[rooms][e][]': [1, 2, 3, 4],
  s: {
    price: {
      ge: 1,
      le: '',
    },
  },
  cat: 'long',
  bbox: '53.7239,27.2461,54.0872,27.9492',
}