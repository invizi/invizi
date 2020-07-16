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
import Historical from '@/components/Historical'
import DateHelper from '@/components/DateHelper'
import Ticker from '@/components/Ticker'
import UserManager from '@/components/UserManager'
import { sha256 } from '@/components/InviziCrypto'

const _ = require('lodash')
const moment = require('moment')

describe('Historical', () => {
  before(function (done) {
    UserManager.hashedPassword = sha256('myPassword').toString()
    done()
  })

  it('fetches the live ticker', function () {
    this.timeout(10000)
    return Ticker.get()
  })

  it('pickDates correctly', function () {
    let result1 = Historical.pickDates([[1521626542], ['a']], [1521626542])
    expect(result1.length).to.be.equal(1)
    expect(result1[0]).to.be.equal('a')

    let result2 = Historical.pickDates([[1, 5, 10, 15, 20, 25], ['1', '5', '10', '15', '20', '25']], [1, 10, 20])
    expect(result2.length).to.be.equal(3)
    expect(_.isEqual(result2, ['1', '10', '20'])).to.be.equal(true)

    let result3 = Historical.pickDates([[1, 5, 8, 10, 11, 15, 20, 25], ['1', '5', '8', '10', '11', '15', '20', '25']], [1, 2, 3, 4, 9, 20])
    expect(result3.length).to.be.equal(6)
    expect(_.isEqual(result3, [ '1', '1', '1', '1', '8', '20' ])).to.be.equal(true)
  })

  it('filterByDate correctly', async function () {
    this.timeout(10000)
    let coinId = 'bitcoin'
    let data = await Historical.fetchHistorical(coinId)
    let filter1 = Historical.filterByDate(data.price_usd, [])
    expect(_.isEqual(filter1, data.price_usd)).to.be.equal(true)

    let minDate = moment().subtract(7, 'days').unix()
    let fullDates = DateHelper.createIntervals(1, 'days', minDate)
    let filter2 = Historical.filterByDate(data.price_usd, fullDates, coinId)
    expect(filter2.length).to.be.equal(fullDates.length)
  })

  it('filter to get performance dates 23h, 7d ...', function () {
    var fullDates = DateHelper.createIntervals(1, 'days', moment().subtract(2, 'years').unix())
    var datesValues = fullDates.map(function (o, i) {
      return i
    })
    var data = [fullDates, datesValues]
    var chosenDates = [moment().subtract(24, 'hours').unix(), moment().subtract(7, 'days').unix(), moment().subtract(30, 'days').unix(), moment().subtract(6, 'months').unix(), moment().subtract(6, 'months').unix()]
    var result = Historical.pickDates(data, chosenDates)
    expect(result.length).to.be.equal(chosenDates.length)
  })
})
