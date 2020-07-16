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
import db from '@/components/DatabaseTest'
import moment from 'moment'
import _ from 'lodash'

describe('Database', function () {
  before(function (done) {
    db.balanceHistoryBTC.clear().then(() => {
      return db.trades.clear()
    }).then(done, done)
  })

  it('save in bulk', function () {
    var date1 = moment().format('X')
    var dataset = [
      { date: date1, value: 1 },
      { date: date1, value: 2 },
      { date: date1, value: 3 },
      { date: date1, value: 4 },
      { date: date1, value: 5 }
    ]
    return db.balanceHistoryBTC.bulkPut(dataset).then(lastKey => {
      return db.balanceHistoryBTC.toArray().then(items => {
        return expect(items.length).to.equal(1)
      })
    })
  })

  it('trades - 1', function () {
    var now = moment().utc().format('X')
    var data = [
      {date: now, from: 'USD', quantity_from: 1000, to: 'BTC', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'BTC', quantity_from: 0.062, to: 'ETH', quantity_to: 1, account_name: 'local1'}
    ]

    return db.trades.bulkPut(data).then(lastKey => {
      return db.trades.where({from: 'BTC'}).toArray().then(items => {
        return expect(items.length).to.equal(_.filter(data, {from: 'BTC'}).length)
      })
    })
  })
})
