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
import TradeClient from '@/components/TradeClient'
import Performance from '@/components/Performance'
import Ticker from '@/components/Ticker'
import Forex from '@/components/Forex'
import UserManager from '@/components/UserManager'
import average from '@/components/ArrayAverage.js'
import { sha256 } from '@/components/InviziCrypto'
const moment = require('moment')
const math = require('mathjs')

describe('Performance', () => {
  before(function (done) {
    UserManager.hashedPassword = sha256('myPassword').toString()
    TradeClient.deleteAll().then(done, done)
  })

  it('fetches the live Forex', function () {
    this.timeout(10000)
    return Forex.get()
  })

  it('fetches the live ticker', function () {
    this.timeout(10000)
    return Ticker.get()
  })

  it('saves buy trades of bitcoin and ethereum in account local1', async function () {
    var now = moment().unix()
    var data = [
      {date: now, from: 'usd', quantity_from: 1000, to: 'bitcoin', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'bitcoin', quantity_from: 0.072, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'usd', quantity_from: 200, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'usd', quantity_from: 250, to: 'ethereum', quantity_to: 1, account_name: 'local1'}
    ]
    await TradeClient.add(data)
    let allTrades = await TradeClient.all()
    expect(allTrades.length).to.equal(data.length)
  })

  it('calculate averagebuyingprice', async function () {
    let now = moment().unix()
    let trades = [
      {date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'bitcoin', quantity_from: 0.072, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: undefined, quantity_from: 0, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'usd', quantity_from: 0, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'usd', quantity_from: 200, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'usd', quantity_from: 250, to: 'ethereum', quantity_to: 1, account_name: 'local1'}
    ]
    let avg = Performance.averageBuyingPrice(trades)
    expect(avg.usd).to.equal((250 + 200) / 3)
    expect(avg.bitcoin).to.equal((0.062 + 0.072) / 3)
  })

  it('calculate averagebuyingprice + perf', async function () {
    this.timeout(20000)
    let allTrades = await TradeClient.all()
    expect(() => {
      Performance.averageBuyingPrice(allTrades)
    }).to.throw()
    let filteredTrades = allTrades.filter(trade => trade.to === 'ethereum')
    let avg = await Performance.averageBuyingPrice(filteredTrades)
    expect(avg.bitcoin).to.equal(0.067)
    expect(avg.usd).to.equal(225)
    let allTimePerf = Performance.allTime(filteredTrades, 'ethereum')
    let ticker = Ticker.coinById('ethereum')
    expect(allTimePerf.bitcoin).to.equal(math.number(math.subtract(math.bignumber(ticker.price_btc), math.bignumber(avg.bitcoin))))
    expect(allTimePerf.usd).to.equal(math.number(math.subtract(math.bignumber(ticker.price_usd), math.bignumber(avg.usd))))
  })

  it('calculate averageBuyingPriceAll', async function () {
    let now = moment().unix()
    let trades = [
      {date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'bitcoin', quantity_from: 0.072, to: 'ethereum', quantity_to: 1, account_name: 'local1'}
      // {date: now, from: undefined, quantity_from: 0, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      // {date: now, from: 'usd', quantity_from: 0, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      // {date: now, from: 'usd', quantity_from: 200, to: 'ethereum', quantity_to: 1, account_name: 'local1'},
      // {date: now, from: 'usd', quantity_from: 6000, to: 'bitcoin', quantity_to: 1, account_name: 'local1'},
      // {date: now, from: 'usd', quantity_from: 7000, to: 'bitcoin', quantity_to: 1, account_name: 'local1'},
      // {date: now, from: 'usd', quantity_from: 250, to: 'ethereum', quantity_to: 1, account_name: 'local1'}
    ]
    let filteredTrades = trades.filter(trade => trade.to === 'ethereum')
    let avg = await Performance.averageBuyingPriceAll(filteredTrades)
    expect(avg['ethereum'].bitcoin.average).to.equal(average(filteredTrades.filter(trade => trade.from === 'bitcoin').map(trade => trade.quantity_from)))
    // expect(avg['ethereum'].usd.average).to.equal(average(filteredTrades.filter(trade => trade.from === 'usd').map(trade => trade.quantity_from)))
  })
})
