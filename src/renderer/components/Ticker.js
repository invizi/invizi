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
import InviziCache from '@/components/InviziCache'
import EventBus from '@/components/EventBus'
import axios from '@/utils/InviziAxios'
const _ = require('lodash')
const moment = require('moment')
const math = require('mathjs')

let Ticker = {
  URL: 'https://apif.invizi.co/ticker',
  SYMBOL_TO_ID: {
    BTC: 'bitcoin'
  },
  // map old symbol to new or valid
  SYMBOL_MAPPING: {
  },

  SUPPORTED_EXCHANGES: {
    bitfinex: 'BitfinexExchangeClient',
    binance: 'BinanceExchangeClient',
    kraken: 'KrakenExchangeClient'
  },
  // fillIdAndName([], {BTG:'bitcoin-gold'})
  fillIdAndName: function (exchangeTickers, except = {}, newCoins = {}) {
    // let except = exceptOptions || {}
    let cmcTickers = Ticker.last().data
    for (let ticker of exchangeTickers) {
      let currentTicker = null
      if (except[ticker.symbol]) {
        currentTicker = _.find(cmcTickers, {coin_id: except[ticker.symbol]})
      } else {
        currentTicker = _.find(cmcTickers, {coin_id: ticker.coin_id})
      }
      if (currentTicker) {
        ticker.coin_id = currentTicker.coin_id
        ticker.name = currentTicker.name
      } else if (newCoins[ticker.symbol]) {
        Object.assign(ticker, newCoins[ticker.symbol])
      } else {
        // throw new Error(`symbol: ${ticker.symbol} not found in cmc or new coins.`)
      }
    }
    return exchangeTickers
  },

  fillFromId (exchangeTickers) {
    let cmcTickers = Ticker.last().data
    let cmcTickerSlugMap = {}
    cmcTickers.forEach(cmcTicker => {
      cmcTickerSlugMap[cmcTicker.coin_id] = cmcTicker
    })
    for (let ticker of exchangeTickers) {
      let currentTicker = null
      currentTicker = cmcTickerSlugMap[ticker.id]
      if (currentTicker) {
        ticker.coin_id = currentTicker.coin_id
        ticker.name = `${currentTicker.name} ${currentTicker.symbol || ''}`
      } else if (!ticker.id) {
        console.error(`symbol: ${ticker.symbol} not found in cmc or new coins.`)
      }
    }
    return exchangeTickers
  },

  async fillFromIdAsync (exchangeTickers) {
    let result = await this.fillFromId(exchangeTickers)
    return result
  },

  async get (options = {}) {
    let value
    value = await axios.get(this.URL, {crossdomain: true})
    let bitcoin = _.find(value.data, {coin_id: 'bitcoin'})
    // Transform into v1 format (price_usd, price btc)
    value.data.forEach((coin) => {
      let priceBtc = 0
      try {
        priceBtc = math.number(math.divide(coin.price_usd, bitcoin.price_usd))
      } catch (err) {
        console.error(`Invalid coin price ${coin.coin_id}`)
      }
      coin.price_btc = priceBtc
    })

    // Cache value
    let finalResult = { data: value.data, lastUpdated: moment().unix() }
    InviziCache.setItem('Ticker.get', finalResult, options)
    this.ID_TO_SYMBOL = _.fromPairs(_.map(value.data, (o) => {
      return [o.symbol, o.coin_id]
    }))

    EventBus.$emit('Ticker/get', finalResult)
    EventBus.$emit('ExchangeClient/getTickers', {tickers: finalResult})
    return finalResult
  },

  /*
   * Get from cache latest ticker
   * @options {exchange: 'bitfinex'}
   */
  last (options = {}) {
    let cacheKey = 'Ticker.get'
    if (this.SUPPORTED_EXCHANGES[options.exchange]) {
      cacheKey = `${this.SUPPORTED_EXCHANGES[options.exchange]}.getTickers`
    }
    let ticker = InviziCache.getItem(cacheKey)
    if (!ticker) {
      console.error(`Missing ticker for exchange ${cacheKey} in cache.`)
      ticker = InviziCache.getItem('Ticker.get')
    }
    return ticker
  },

  symbolToIdHash: function () {
    var all = this.last().data
    return _.fromPairs(_.map(all, function (o) { return [o.symbol, o.coin_id] }))
  },

  idToSymbolHash: function () {
    var all = this.last().data
    var result = _.fromPairs(_.map(all, function (o) { return [o.coin_id, o.symbol] }))
    return result
  },

  addIconUrl: function (data) {
    var all = this.last().data
    _.each(data, function (o) {
      var found = _.find(all, {symbol: o.coin})
      if (!found) {
        console.log('missing coin ')
        console.log(o)
      } else {
        o.imageUrl = `static/images/coins/${found.coin_id}.png`
      }
    })
    return data
  },

  fillNameAndImage: function (coins) {
    return coins.map((coin, i) => {
      if (!coin) {
        console.error(coin)
        console.error(i)
        throw new Error(`undefined coin`)
      }
      return Object.assign(coin, { displayName: `${coin.symbol} ${coin.name}`, imageUrl: `static/images/coins/${coin.coin_id}.png` })
    })
  },

  allCoins (options) {
    // TODO performance to cache
    let result = _.map(this.last(options).data, function (o) {
      return Object.assign({}, o, {name: `${o.symbol} ${o.name}`})
    })
    if (options && options.includeFiat) {
      result.push({ name: 'USD Dollar', symbol: 'usd', iconText: `$`, coin_id: 'usd' })
    }
    performance.mark('Ticker.allCoins end')
    return result
  },

  coinById (coinId) {
    return _.find(this.last().data, {coin_id: coinId})
  },

  coinByIdOrSymbol (coinName) {
    return _.find(this.last().data, (coin) => {
      return [coin.id, coin.symbol.toLowerCase()].indexOf(coinName.toLowerCase()) !== -1
    })
  },

  // Search a coin by its symbol
  coin (symbol, options = {}) {
    let find = (opts) => _.find(this.last(options).data, opts)

    if (symbol.toUpperCase() === 'BTG') {
      return find({coin_id: 'bitcoin-gold'})
    } else if (symbol === 'BCC') {
      return find({coin_id: 'bitcoin-cash'})
    } else {
      return find({symbol: symbol.toUpperCase()})
    }
  }
}

export default Ticker
