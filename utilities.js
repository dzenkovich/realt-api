const fs = require('fs')
const path = require('path')
const request = require('request')
const cheerio = require('cheerio')

// TODO make it reusable
const j = request.jar()
const cookie = request.cookie('realt-cu=840; path=/;')
const requestWJ = request.defaults({ jar: j })

exports.getListOfCountryFolders = (srcPath) => {
  return fs.readdirSync(srcPath).filter((file) => {
    return fs.statSync(path.join(srcPath, file)).isDirectory()
  })
}

/**
 * request.get wrapped into a Promise for convenience
 * @param url
 * @returns {Promise}
 */
exports.requestPromise = url => {
  j.setCookie(cookie, url.url || url)
  return new Promise((resolve, reject) => {
    requestWJ.get(url, (error, response, html) => {
      if (!error) {
        resolve(cheerio.load(html))
      }
      else {
        reject(error)
      }
    })
  })
}

/**
 * MySQL query wrapped into a Promise for convenience
 * @param connection {Object}
 * @param parameters
 * @returns {Promise}
 */
exports.queryPromise = (connection, ...parameters) => {
  return new Promise((resolve, reject) => {
    connection.query(...parameters, (error, results, fields) => {
      if (error) {
        reject(error)
      }
      else {
        resolve(results, fields)
      }
    })
  })
}

/**
 * Remove duplicate records from an array (string/number only due to hashtable)
 * @param array
 * @returns {*}
 */
exports.unique = array => {
  const seen = {}
  return array.filter(function(item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true)
  })
}

/**
 * Copy file wrapped in a promise
 * @param source
 * @param target
 * @returns {Promise}
 */
exports.copyFile = (source, target) => {
  return new Promise((resolve, reject) => {
    let rd = fs.createReadStream(source)
    rd.on('error', reject)
    let wr = fs.createWriteStream(target)
    wr.on('error', reject)
    wr.on('finish', resolve)
    rd.pipe(wr)
  })
}