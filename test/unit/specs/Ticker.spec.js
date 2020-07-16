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
import Ticker from '@/components/Ticker'
import InviziCache from '@/components/InviziCache'
import UserManager from '@/components/UserManager'
import { sha256 } from '@/components/InviziCrypto'
const _ = require('lodash')

describe('Ticker', () => {
  before(function (done) {
    UserManager.hashedPassword = sha256('myPassword').toString()
    done()
  })
  it('fetches the live ticker', function () {
    this.timeout(20000)
    return Ticker.get().then((value) => {
      // Check its already cache
      expect(_.isEqual(Ticker.last().data, value.data)).to.equal(true)
      return expect(_.find(value.data, {coin_id: 'bitcoin'}).price_btc).to.equal(1)
    })
  })
  it('gets all the coins', function () {
    var result = Ticker.allCoins()
    expect(!!_.find(result, {coin_id: 'bitcoin'})).to.be.equal(true)
  })
  it('gets all the coins incuding fiat', function () {
    var result = Ticker.allCoins({includeFiat: true})
    expect(!!_.find(result, {symbol: 'USD'})).to.be.equal(true)
  })
  it('fills in id and name of coins without conflict of symbols', function () {
    this.timeout(10000)
    let exchangeTickers = [
      {
        symbol: 'BTC',
        price_usd: '8915.22',
        price_btc: '1'
      },
      {
        symbol: 'ETH',
        price_usd: '895.954',
        price_btc: '0.1014'
      }

    ]

    Ticker.fillIdAndName(exchangeTickers)
    let btcTicker = _.find(exchangeTickers, {symbol: 'BTC'})
    expect(btcTicker.coin_id === 'bitcoin').to.be.equal(true)
    expect(btcTicker.name === 'Bitcoin').to.be.equal(true)
  })
  it('fills in id and name of coins with conflict of symbols', function () {
    this.timeout(10000)
    let exchangeTickers = [
      {
        symbol: 'BTC',
        price_usd: '8915.22',
        price_btc: '1'
      },
      {
        symbol: 'ETH',
        price_usd: '895.954',
        price_btc: '0.1014'
      },
      {
        symbol: 'BTG',
        price_usd: '161.687',
        price_btc: '0.018299'
      }
    ]
    let exceptOptions = {BTG: 'bitcoin-gold'}
    Ticker.fillIdAndName(exchangeTickers, exceptOptions)
    let btgTicker = _.find(exchangeTickers, {symbol: 'BTG'})
    expect(btgTicker.coin_id === 'bitcoin-gold').to.be.equal(true)
    expect(btgTicker.name === 'Bitcoin Gold').to.be.equal(true)
  })

  it('get and persist', async function () {
    this.timeout(10000)
    var resultTicker = await Ticker.get({persistent: true})
    let dbCacheTicker = await InviziCache.getItemFromDbCache('Ticker.get')
    expect(_.isEqual(resultTicker, dbCacheTicker)).to.be.equal(true)
  })
})
