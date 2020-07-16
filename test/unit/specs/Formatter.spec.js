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
import Formatter from '@/components/Formatter'
const _ = require('lodash')

describe('Formatter', () => {
  it('format correctly a single object', () => {
    var dataString = {coin: 'BTC', date: '122901830129', quantity: '123', price: '3428.0', account_name: 'local0', currency: 'USD'}
    const formatDefinition = {
      date: parseInt,
      quantity: parseFloat,
      price: parseFloat
    }
    var formatted = Formatter.run(dataString, formatDefinition)
    const expected = {coin: 'BTC', date: 122901830129, quantity: 123, price: 3428.0, account_name: 'local0', currency: 'USD'}
    expect(_.isEqual(expected, formatted)).to.be.equal(true)
  })

  it('format correctly an array', () => {
    var dataString = [{coin: 'BTC', date: '122901830129', quantity: '123', price: '3428.0', account_name: 'local0', currency: 'USD'},
      {coin: 'ETH', date: '122901830130', quantity: '1', price: '428.0', account_name: 'local0', currency: 'BTC'}]

    const formatDefinition = {
      date: parseInt,
      quantity: parseFloat,
      price: parseFloat
    }
    var formatted = Formatter.runBulk(dataString, formatDefinition)
    const expected = [{coin: 'BTC', date: 122901830129, quantity: 123, price: 3428.0, account_name: 'local0', currency: 'USD'},
      {coin: 'ETH', date: 122901830130, quantity: 1, price: 428.0, account_name: 'local0', currency: 'BTC'}]
    expect(_.isEqual(_.first(expected), _.first(formatted))).to.be.equal(true)
    expect(_.isEqual(_.last(expected), _.last(formatted))).to.be.equal(true)
  })
})
