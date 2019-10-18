const moment = require('moment')
const winston = require('winston');
const {LOG_PATH} = require('./settings');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: __dirname + '/' + LOG_PATH + 'grabbing-' + moment().format("YY-MM-DD") + '.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger