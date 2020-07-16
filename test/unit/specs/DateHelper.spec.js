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
import DateHelper from '@/components/DateHelper'
const moment = require('moment')
const _ = require('lodash')

describe('DateHelper', () => {
  it('hourUnix', () => {
    expect(DateHelper.hourUnix()).to.equal(DateHelper.hourUnix())
  })

  it('todayUnix', () => {
    expect(DateHelper.todayUnix()).to.equal(DateHelper.todayUnix())
  })

  it('createIntervals', () => {
    var interval1 = DateHelper.createIntervals(1, 'days', moment().subtract(1, 'years').unix())
    expect(_.uniq(interval1).length).to.equal(interval1.length)
    expect(interval1.length).to.equal(366)
  })

  it('createIntervals Iterator', () => {
    let now = moment().unix()
    let intervalIter = DateHelper.intervalIterator(1, 'days', moment().subtract(1, 'years').unix(), now)
    let interval1 = []
    for (let currentIter of intervalIter) {
      interval1.push(currentIter)
    }

    expect(interval1.length).to.equal(interval1[0].length)
    interval1.forEach((currentIter, index) => {
      expect(currentIter.index).to.equal(index)
    })

    expect(_.uniq(interval1).length).to.equal(interval1.length)
    expect(interval1.length).to.equal(366)
    expect(_.last(interval1).date).to.equal(now)
  })

  it('sliceFromInclude', () => {
    let dates1 = [800, 900, 1000, 1100, 1200]
    let fromDate1 = 990
    let dates1Expected = [990, 1000, 1100, 1200]
    var filteredDates1 = DateHelper.sliceFromInclude(dates1, fromDate1)
    expect(_.isEqual(filteredDates1, dates1Expected)).to.be.equal(true)

    let dates2 = [800, 900, 1000, 1100, 1200]
    let fromDate2 = 1000
    let dates2Expected = [1000, 1100, 1200]
    var filteredDates2 = DateHelper.sliceFromInclude(dates2, fromDate2)
    expect(_.isEqual(filteredDates2, dates2Expected)).to.be.equal(true)
  })
})
