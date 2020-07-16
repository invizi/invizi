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
import Calculator from '@/components/Calculator.js'
import Ticker from '@/components/Ticker.js'
const _ = require('lodash')

describe('Calculator', () => {
  before(function () {
    this.timeout(10000)
    return Ticker.get()
  })

  it('calculate the marketcap_volume_ratio', () => {
    var ticker = Ticker.last().data
    var result = Calculator.marketcap_volume_ratio(ticker)
    var btc = _.find(result, {'symbol': 'btc'})
    expect(btc['marketcap_volume_ratio']).to.be.above(0.001)
    expect(btc['marketcap_volume_ratio']).to.be.below(0.3)
  })
})
