const $ = require('cheerio')

exports.getAddress = ($html) => $html('td:contains("Адрес")').next().text().replace("Информация о доме", "")
exports.getRealtUpdate = ($html) => $html('td:contains("Дата обновления")').next().text()
exports.getPrice = ($html) => parseFloat($html('.price-switchable').first().text().replace(/[^\d,]/g, '').split(',').shift()) || null
exports.getPriceMeter = ($html) => parseFloat($html('.price-switchable').first().text().replace(/[^\d,]/g, '').split(',').pop()) || null
exports.getRooms = ($html) => parseInt($html('td:contains("Комнат всего/разд.")').next().text().split('/').shift()) || null
exports.getFloor = ($html) => parseInt($html('td:contains("Этаж / этажность")').next().text().split('/').shift()) || null
exports.getBuildingFloors = ($html) => parseInt($html('td:contains("Этаж / этажность")').next().text().split('/').pop()) || null
exports.getArea = ($html) => parseFloat($html('td:contains("Площадь общая/жилая/кухня")').next().text().split('/')[0]) || null
exports.getAreaLiving = ($html) => parseFloat($html('td:contains("Площадь общая/жилая/кухня")').next().text().split('/')[1]) || null
exports.getAreaKitchen = ($html) => parseFloat($html('td:contains("Площадь общая/жилая/кухня")').next().text().split('/')[2]) || null
exports.getCeilHeight = ($html) => parseFloat($html('td:contains("Высота потолков")').next().text()) || null
exports.getYearBuilt = ($html) => parseInt($html('td:contains("Год постройки")').next().text()) || null
exports.getImages = ($html) => ($html('.photo-item img')).map((i, img) => ({ url: $(img).attr('src') })).get()
exports.getNotes = ($html) => $html('td:contains("Примечания")').next().text()
exports.getDetails = ($html) => ({
  appliances: $html('td:contains("Бытовая техника")').next().text(),
  extra: $html('td:contains("Дополнительно")').next().text()
})
