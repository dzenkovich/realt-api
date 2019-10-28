
const CLUSTER_PRECISION = 0.0005

class cluster {
  constructor(lat, lng) {
    this.lat = lat
    this.lng = lng
    this.items = []
  }

  addItem(item) {
    this.items.push(item)
  }
}

const getDistance = (ver, hor) => {
  return Math.sqrt(Math.pow(ver, 2) + Math.pow(hor, 2))
}

const searchForCluster = (clusters, lat, lng) => {
  let result = null
  let resultDistance = Infinity
  let precision = CLUSTER_PRECISION
  // regular for loop should be way more performing than .map or .filter
  for (let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i]
    let deltaLat = Math.abs(cluster.lat - lat)
    let deltaLng = Math.abs(cluster.lng - lng)
    if (deltaLat <= precision && deltaLng <= precision) {
      let distance = getDistance(deltaLat, deltaLng)
      if(distance < resultDistance) {
        resultDistance = distance
        result = cluster
      }
    }
  }
  return result
}

exports.clusterData = (data) => {
  return data.reduce((result, item) => { // combine positions in same building into clusters
    // combine points into clusters
    let res = searchForCluster(result, item.lat, item.lng)
    if(!res) {
      res = new cluster(item.lat, item.lng)
      result.push(res)
    }
    res.addItem(item)
    return result
  }, [])
}

exports.calculateMedian = (clusters, name) => {
  clusters.forEach(cluster => {
    const prices = cluster.items.map(item => item[name])
    cluster[name + 'Median'] = prices[Math.floor(prices.length / 2)]
  })
}
