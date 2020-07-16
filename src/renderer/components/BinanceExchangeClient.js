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
import ExchangeClient from './ExchangeClient'
import InviziCache from '@/components/InviziCache'
import Ticker from '@/components/Ticker'
import TradeClient from '@/components/TradeClient'
import Trade from '@/models/Trade'
const Ws = require('ws')
const _ = require('lodash')
const moment = require('moment')

const tickerFieldMap = {
  e: 'eventType',
  E: 'eventTime',
  s: 'symbol',
  p: 'priceChange',
  P: 'priceChangePercent',
  w: 'weightedAveragePrice',
  x: 'previousClose',
  c: 'currentClose',
  Q: 'closeQuantity',
  b: 'bestBid',
  B: 'bestBidQuantity',
  a: 'bestAskPrice',
  A: 'bestAskQuantity',
  o: 'open',
  h: 'high',
  l: 'low',
  v: 'baseAssetVolume',
  q: 'quoteAssetVolume',
  O: 'openTime',
  C: 'closeTime',
  F: 'firstTradeId',
  L: 'lastTradeId',
  n: 'trades'
}

class BinanceExchangeClient extends ExchangeClient {
  constructor (...args) {
    super(...args)
    this.HISTORY_KEYS_MAPPING = {
      currency: 'asset',
      timestamp: {
        'DEPOSITS': 'insertTime',
        'WITHDRAWALS': 'successTime'
      },
      amount: 'amount'
    }
    this.birthDate = '2017-03-01'
    this.autosync = 'allMarkets'
    this.wshost_baseUrl = 'wss://stream.binance.com:9443/ws/'
    this.wshost_combinedUrl = 'wss://stream.binance.com:9443/stream?streams='
    this.webSockets = {}
    this.streams = {
      // depth: (symbol) => `${symbol.toLowerCase()}@depth`,
      // depthLevel: (symbol, level) => `${symbol.toLowerCase()}@depth${level}`,
      // kline: (symbol, interval) => `${symbol.toLowerCase()}@kline_${interval}`,
      // aggTrade: (symbol) => `${symbol.toLowerCase()}@aggTrade`,
      // trade: (symbol) => `${symbol.toLowerCase()}@trade`,
      // ticker: (symbol) => `${symbol.toLowerCase()}@ticker`,
      allTickers: () => '!ticker@arr'
    }
    this.ccxt.fetchOptions = {mode: undefined} // remove 'no-cors'
  }

  hasWebSocket () {
    return true
  }

  initializeApiKey (apiKey) {
    super.initializeApiKey(apiKey)
    this.ccxt.options['adjustForTimeDifference'] = true
  }

  wsTickerPrice (wsTicker) {
    return wsTicker['weightedAveragePrice']
  }

  getOnlyUsdtAndBtcTickers (tickers) {
    return _.filter(tickers, (ticker) => {
      return /.usdt$/i.test(ticker['symbol']) || /.btc$/i.test(ticker['symbol'])
    })
  }

  processWsTickerResponse (tickerResponse, tickersWs) {
    let onlyBtcOrUsdtTickers = this.getOnlyUsdtAndBtcTickers(tickerResponse)
    for (let ticker of onlyBtcOrUsdtTickers) {
      tickersWs[this.idToSymbolMap[ticker['symbol']]] = ticker
    }
    return tickersWs
  }

  wsConnect (streamPath, isCombined) {
    return new Promise((resolve, reject) => {
      if (this.webSockets[streamPath] && this.webSockets[streamPath].connected) {
        resolve(this.webSockets[streamPath].ws)
      } else if (this.webSockets[streamPath] && this.webSockets[streamPath].connecting) {
        // do nothing
      } else {
        // do connection stuff
        let wshost = (isCombined ? this.wshost_combinedUrl : this.wshost_baseUrl) + streamPath
        this.webSockets[streamPath] = {}
        this.webSockets[streamPath].ws = new Ws(wshost)
        this.webSockets[streamPath].connecting = true
        let webSocket = this.webSockets[streamPath]
        webSocket.ws.on('open', () => {
          // console.log(`Open websocket exchange: ${this.exchangeId} stream: ${streamPath}`)
          webSocket.connected = true
          webSocket.connecting = false
          resolve(webSocket.ws)
        })
        webSocket.ws.on('close', () => {
          // console.log(`Closing websocket exchange: ${this.exchangeId} stream: ${streamPath}`)
          webSocket.connecting = false
          webSocket.connected = false
        })
      }
    })
  }

  onWsMessage (stream) {
    this.webSockets[stream].ws.on('message', (msg) => {
      let tickers = JSON.parse(msg)
      let result = []
      for (let ticker of tickers) {
        let currentTicker = {}
        _.each(ticker, (value, key) => {
          currentTicker[tickerFieldMap[key]] = value
        })
        // console.log(currentTicker)
        result.push(currentTicker)
      }
      this.onWsTickerMessage(result)
    })
  }

  getWsTickers () {
    let tickerStream = this.streams.allTickers()
    this.wsConnect(tickerStream, false).then(() => {
      InviziCache.setItem(`${_.upperFirst(this.exchangeId)}ExchangeClient.tickersWs`, {})
      this.getWsPairs().then(() => {
        this.onWsMessage(tickerStream)
      })
    })
  }

  wsClose () {
    this.wsStopPersistentConnection()
    for (let stream of Object.values(this.webSockets)) {
      stream.ws.close()
    }
  }

  isDeposit (type) {
    return type === this.HISTORY_TYPE['DEPOSITS']
  }

  getHistoryMovements (requestParams = undefined, type) {
    if (this.isDeposit(type)) {
      return this.ccxt.wapiGetDepositHistory(requestParams)
    }
    return this.ccxt.wapiGetWithdrawHistory(requestParams)
  }

  iterConditions () {
    let today = moment()
    let since = today.clone()
    let earliestDate = moment(this.birthDate)
    let maxIter = 0
    let currentIter = 0
    while (since.unix() > earliestDate.unix()) {
      maxIter++
      since = since.subtract(3, 'months')
    }
    since = today.clone()
    return {since, currentIter, maxIter}
  }

  allTransactionsMaxIter () {
    let { maxIter } = this.iterConditions()
    return this.exchangeMarkets.length + (maxIter - 1) * 2
  }

  getDepWithGeneric (type, apiKey, params) {
    let {since, currentIter, maxIter} = this.iterConditions()

    const fetchData = () => {
      since = since.subtract(3, 'months')
      currentIter++
      return super[type](apiKey, since.unix(), params)
    }

    const mapFun = trades => {
      trades.since = since.unix()
      trades.progress = (currentIter + 1) / maxIter
      return trades
    }

    const takeWhileFun = trades => {
      return currentIter < maxIter
    }

    return this.fetchUntil(fetchData, mapFun, takeWhileFun)
  }

  getDepositsObs (apiKey, symbolCurrencyPair = undefined, params = {}) {
    return this.getDepWithGeneric('fetchDeposits', apiKey, params)
  }

  getWithdrawalsObs (apiKey, symbolCurrencyPair = undefined, params = {}) {
    return this.getDepWithGeneric('fetchWithdrawals', apiKey, params)
  }

  getMyTradesObs (apiKey, symbolCurrencyPair = undefined, params = {}) {
    let markets = this.exchangeMarkets.map(market => market.symbol)
    let symbolIndex = -1

    const fetchData = () => {
      symbolIndex++
      return super.getMyTrades(apiKey, markets[symbolIndex])
    }

    const mapFun = trades => {
      trades.symbolIndex = symbolIndex
      trades.marketsLength = markets.length
      trades.progress = (symbolIndex + 1) / (markets.length - 1)
      return trades
    }

    const takeWhileFun = trades => {
      return symbolIndex < markets.length - 1
    }

    return this.fetchUntil(fetchData, mapFun, takeWhileFun)
  }

  parseHistoryMovementsDate (date) {
    return date / 1000
  }

  filterByType (response, type) {
    if (!response.success) {
      return new Error(`Could not fetch ${type.toLowerCase()} from ${this.exchangeId}`)
    }
    if (this.isDeposit(type)) {
      return response.depositList
    }
    return response.withdrawList
  }

  csvSave (data) {
    let result = []
    // Date(UTC) -> date
    // Market -> from, to
    // Type -> quantity_to, quantity_from
    // Price
    // Amount -> quantity_to, quantity_from
    // Total
    const DATE = 0
    const MARKET = 1
    const TYPE = 2
    const PRICE = 3
    const AMOUNT = 4
    // const TOTAL = 5
    const FEE = 6
    const FEE_COIN = 7
    data.forEach((rowString, index) => {
      if (index === 0) return
      let row = rowString[0].replace(/"/g, '').split(',')
      // Get the real market first
      let marketPair = _.find(this.exchangeMarkets, {id: row[MARKET]})
      if (!marketPair) throw new Error('Missing Pair')

      let from, to
      [to, from] = marketPair.symbol.split('/').map(o => {
        let coin = Ticker.coin(o) // Buy side
        if (!coin) throw new Error('Missing Pair')
        return coin.id
      })
      if (!from || !to) throw new Error('Incorrect Pair')
      if (row[TYPE] === 'SELL') {
        let toTmp = to
        to = from
        from = toTmp
      }

      let trade = new Trade({
        date: +moment.utc(row[DATE]).format('X'),
        from: from,
        to: to,
        fee: +row[FEE],
        fee_currency: row[FEE_COIN]
      })
      trade.account_name = this.exchangeId
      trade.setPriceQuantity(+row[PRICE], +row[AMOUNT])
      result.push(trade)
    })
    return TradeClient.add(result)
  }
}

export default new BinanceExchangeClient('binance')
