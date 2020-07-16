/*
Copyright (C) 2018-2020 AI Atelier Ltd.

This file is part of Invizi.

Invizi is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.

Invizi is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with Invizi.  If not, see <https://www.gnu.org/licenses/>.
*/
const moment = require('moment')
const _ = require('lodash')

let DateHelper = {

  dateToUnix (date) {
    return moment(date.utc().format('DD/MM/YYYY'), 'DD/MM/YYYY').utc().format('X')
  },

  todayUnix () {
    return this.dateToUnix(moment())
  },

  todayConcat () {
    return moment().format('YYYYMMDDHmmss')
  },

  hourUnix (time) {
    if (!time) {
      time = moment()
    }
    return moment(time.utc().format('DD/MM/YYYY HH'), 'DD/MM/YYYY HH').utc().format('X')
  },

  // slice the array of date from a specific date and includes the fromDate
  // assuming dates is sorted
  // ex fromDate = 990, dates = [800, 900, 1000, 1100, 1200]
  // returns [990, 1000, 1100, 1200]
  sliceFromInclude (dates, fromDate) {
    if (fromDate < dates[0] || fromDate > _.last(dates)) {
      throw new Error('fromDate is to early compared to dates')
    }

    let foundIndex = _.findIndex(dates, (date) => {
      return date >= fromDate
    })

    let result = dates.slice(foundIndex)

    if (dates[foundIndex] !== fromDate) {
      result.unshift(fromDate)
    }
    return result
  },

  intervalIterator: function* (numberOfInterval, intervalName, minDate, maxDate) {
    if (!_.isNumber(numberOfInterval) || !_.isString(intervalName)) {
      throw new Error('Incorrect numberOfInterval or intervalName')
    }
    minDate = minDate || 1367174841
    maxDate = maxDate || moment().utc().unix()
    if (maxDate < minDate) {
      throw new Error('maxDate > than minDate')
    }
    // Find the best min (matching exactly the interval), it could be before minDate
    let bestMinDateMoment = moment(maxDate, 'X')
    let minDateMoment = moment(minDate, 'X')
    let numberOfDates = 2
    while (bestMinDateMoment > minDateMoment) {
      bestMinDateMoment = bestMinDateMoment.subtract(numberOfInterval, intervalName)
      numberOfDates++ // add an extra at the end we have to remove one after to get the real length
    }
    numberOfDates--
    let currentDate = bestMinDateMoment.unix()
    let index = 0
    while (currentDate <= maxDate) {
      yield {date: currentDate, length: numberOfDates, index}
      currentDate = moment(currentDate, 'X').add(numberOfInterval, intervalName).unix()
      index++
    }
  },

  createIntervals (numberOfInterval, intervalName, minDate, maxDate) {
    if (!_.isNumber(numberOfInterval) || !_.isString(intervalName)) {
      throw new Error('Incorrect numberOfInterval or intervalName')
    }
    minDate = minDate || 1367174841
    maxDate = maxDate || moment().utc().unix()
    if (maxDate < minDate) {
      throw new Error('maxDate > than minDate')
    }
    var result = []
    var currentDate = moment(maxDate, 'X').unix()
    while (currentDate >= minDate) {
      result.push(currentDate)
      currentDate = moment(currentDate, 'X').subtract(numberOfInterval, intervalName).unix()
    }
    return result.reverse()
  },

  yesterdayUnix () {
    return this.dateToUnix(moment().subtract(1, 'days'))
  }
}
export default DateHelper
