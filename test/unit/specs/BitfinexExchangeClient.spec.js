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
// import BitfinexExchangeClient from '@/components/BitfinexExchangeClient'
import Ticker from '@/components/Ticker'
const _ = require('lodash')

describe('BitfinexExchangeClient', () => {
  it('fetches the live ticker', function () {
    this.timeout(10000)
    return Ticker.get().then((value) => {
      // Check its already cache
      expect(_.isEqual(Ticker.last().data, value.data)).to.equal(true)
      return expect(_.find(value.data, {coin_id: 'bitcoin'}).price_btc).to.equal(1)
    })
  })

  // it('fetches the tickers', function () {
  //   this.timeout(10000)
  //   return BitfinexExchangeClient.getTickers().then((tickers) => {
  //     expect(Array.isArray(tickers)).to.be.equal(true)
  //     let btcTicker = _.find(tickers, {symbol: 'BTC'})
  //     expect(btcTicker.price_usd).to.be.above(0)
  //     expect(btcTicker.price_btc).to.be.equal(1)
  //     expect(btcTicker.id === 'bitcoin').to.be.equal(true)
  //     expect(btcTicker.name === 'Bitcoin').to.be.equal(true)
  //   })
  // })
})
