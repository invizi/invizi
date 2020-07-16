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
import assert from './assert.js'
import average from './ArrayAverage.js'
import Ticker from '@/components/Ticker'
const math = require('mathjs')

const _ = require('lodash')

var Performance = {
  /**
   * Returns a all time performance from a list of trades
   * @param {array} allTrades list of standard trades
   * @param {string} coinId id of the coin (optional)
   * @return {object} {percent: float, amount: float, currency: string}
   */
  allTime (allTrades) {
    let trades = allTrades
    let avg = this.averageBuyingPrice(trades)
    let coinId = trades[0].to
    let result = {}
    // For each currency get the current price
    Object.keys(avg).forEach(key => {
      let ticker = Ticker.coinById(coinId)
      let label = `price_${key}`
      if (key === 'bitcoin') {
        label = 'price_btc'
      }
      let currentPrice = ticker[label]
      result[key] = math.number(math.subtract(math.bignumber(currentPrice), math.bignumber(avg[key])))
    })
    return result
  },

  /**
   * Return the absolute and relative performance
   * @param {obj} avg the average object coming from averageBuyingPrice*
   * @param {obj} coin the ticker object of the coin, should contain the price
   */
  calc (avg, ticker) {
    let result = {bitcoin: {}, usd: {}}
    let currencies = Object.keys(result)
    let currencyPriceLabel = {bitcoin: 'price_btc', usd: 'price_usd'}
    Object.keys(avg).forEach(coinId => {
      currencies.forEach(currency => {
        if (!avg[coinId][currency]) return
        let absolute = math.number(math.subtract(math.bignumber(avg[coinId][currency].quantity * math.bignumber(ticker[coinId][currencyPriceLabel[currency]])), math.bignumber(avg[coinId][currency].average)))
        let percentage = absolute / avg[coinId][currency].total
        result[currency][coinId] = {absolute, percentage}
      })
    })
    return result
  },
  /**
   * Like averageBuyingPrice but for all trades and multiple coins
   * done serially for efficiency
   * @return {obj} {bitcoin: {usd: 6500},
   *                ethereum: {usd: 123, bitcoin: 0.056}}
   */
  averageBuyingPriceAll (trades) {
    let result = {}
    // Remove deposit and withdraw trades
    let filteredTrades = trades.filter(trade => trade.quantity_from !== 0 && trade.quantity_to !== 0)
    filteredTrades.forEach(trade => {
      let coinId = trade.to
      result[coinId] = result[coinId] || {}
      // Change undefined from to bitcoin
      if (!trade.from) trade.from = 'bitcoin'
      result[coinId][trade.from] = result[coinId][trade.from] || []
      result[coinId][trade.from].push(trade)
    })
    Object.keys(result).forEach(coinId => {
      Object.keys(result[coinId]).forEach(currency => {
        let quantitiesFrom = result[coinId][currency].map(trade => trade.quantity_from)
        let quantitiesTo = result[coinId][currency].map(trade => trade.quantity_to)
        let total = quantitiesFrom.reduce((acc, quantity) => acc + quantity)
        let avg = average(quantitiesFrom)
        let totalCoin = quantitiesTo.reduce((acc, quantity) => acc + quantity)
        result[coinId][currency] = {average: avg, total, quantity: totalCoin}
      })
    })
    return result
  },

  averageBuyingPrice (trades) {
    // Ensure all the trades is regarding one single coin
    assert(_.uniq(trades.map(trade => trade.to)).length === 1)
    // Segregate trades based on the currency traded (ex: BTC, USD..)
    let result = {}
    trades.forEach(trade => {
      // Change undefined from to bitcoin
      if (!trade.from) trade.from = 'bitcoin'
      result[trade.from] = result[trade.from] || []
      result[trade.from].push(trade)
    })
    Object.keys(result).forEach(currency => {
      result[currency] = average(result[currency].map(trade => trade.quantity_from))
    })
    return result
  }
}

export default Performance
