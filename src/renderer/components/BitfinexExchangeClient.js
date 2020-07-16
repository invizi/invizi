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
import { symbolToStandard } from '@/utils/SymbolManager'
const _ = require('lodash')
const moment = require('moment')
/* eslint-disable */
let { BehaviorSubject, defer, of, from } = rxjs
let { repeatWhen, switchMap, map, tap, delay, takeWhile, catchError } = rxjs.operators
/* eslint-enable */

const EXCHANGE_ID = 'bitfinex'
const wsTickerMapping = [
  'bid',
  'bid_size',
  'ask',
  'ask_size',
  'daily_change',
  'daily_change_perc',
  'last_price',
  'volume',
  'high',
  'low'
]

const HISTORY_TYPE = {
  DEPOSITS: 'DEPOSIT',
  WITHDRAWALS: 'WITHDRAWAL'
}

const MOVEMENT_HEADERS = [
  0, // 'ID',
  'symbol', // 'CURRENCY',
  'coinId', // 'CURRENCY_NAME',
  3,
  4,
  'MTS_STARTED',
  'MTS_UPDATED',
  7,
  8,
  'STATUS',
  10,
  11,
  'amount', // 'AMOUNT',
  'fee', // 'FEES',
  14,
  15,
  'DESTINATION_ADDRESS',
  17,
  18,
  19,
  'TRANSACTION_ID',
  'WITHDRAW_TRANSACTION_NOTE'
]

const fromMovementToStandardTrade = mov => {
  let toLower = x => typeof x === 'string' ? x.toLowerCase() : x
  var zip = _.zipObject(MOVEMENT_HEADERS, mov.map(toLower))
  let isDeposit = zip.amount >= 0
  let computedKey = isDeposit ? 'to' : 'from'
  let result = {fee: Math.abs(zip.fee)}
  result.fee_currency = zip.coinId
  result.quantity_from = result.quantity_to = 0
  result[computedKey] = symbolToStandard(EXCHANGE_ID, zip.symbol)
  result[`quantity_${computedKey}`] = Math.abs(zip.amount)
  result.date = zip.MTS_UPDATED / 1000
  result.account_name = EXCHANGE_ID
  return result
}

class BitfinexExchangeClient extends ExchangeClient {
  constructor (...args) {
    super(...args)
    this.wshost = 'wss://api.bitfinex.com/ws/2'
    this.tickerChannelIdToCurrencyPairMap = {}
    this.birthDate = '2012-01-01'
    // this.ccxt.fetchOptions = {mode: 'no-cors'}
  }

  wsTickerPrice (wsTicker) {
    return wsTicker['last_price']
  }

  hasWebSocket () {
    return false
  }

  getOnlyUsdAndBtcPairs (symbolCurrencyPairs) {
    return _.filter(symbolCurrencyPairs, (pair) => {
      return /.usd$/i.test(pair) || /.btc$/i.test(pair)
    })
  }

  isSubscribedToTickerChannel (wsResponse) {
    return wsResponse.event === 'subscribed' && wsResponse.channel === 'ticker'
  }

  processWsTickerResponse (tickerResponse, tickersWs) {
    tickersWs[tickerResponse['currency_pair']] = tickerResponse
    return tickersWs
  }

  wsSendTickerRequest () {
    return this.getWsPairs().then((idToSymbolMap) => {
      let onlyUsdBtcPairs = this.getOnlyUsdAndBtcPairs(Object.keys(idToSymbolMap))
      for (let pair of onlyUsdBtcPairs) {
        let tickerRequest = JSON.stringify({
          event: 'subscribe',
          channel: 'ticker',
          symbol: pair.toLowerCase()
        })
        this.webSocket.send(tickerRequest)
      }
    })
  }

  onWsMessage () {
    this.webSocket.on('message', (msg) => {
      let message = JSON.parse(msg)
      if (this.isSubscribedToTickerChannel(message)) {
        this.tickerChannelIdToCurrencyPairMap[message.channel] = this.tickerChannelIdToCurrencyPairMap[message.channel] || {}
        this.tickerChannelIdToCurrencyPairMap[message.channel][message.chanId] = message.pair
        // this.onWsTickerMessage(message)
      } else if (Array.isArray(message)) {
        if (message[1] === 'hb') return
        let channelId = message[0]
        let receivedTicker = _.zipObject(wsTickerMapping, message[1])
        let currencyPair = this.tickerChannelIdToCurrencyPairMap['ticker'][channelId]
        receivedTicker['currency_pair'] = this.idToSymbolMap[currencyPair]
        this.onWsTickerMessage(receivedTicker)
      }
    })
  }

  allTransactionsMaxIter () {
    return this.exchangeMarkets.length * 2
  }

  // fetch deposits AND withdrawal
  getDepositsObs (apiKey, symbolCurrencyPair = undefined, params = {}) {
    this.initializeApiKey(apiKey)
    let markets = Object.keys(this.markets)
    let symbolIndex = -1

    const fetchData = () => {
      symbolIndex++
      console.log(`fetching ${markets[symbolIndex]}`)
      return this.getHistoryMovements({currency: markets[symbolIndex]})
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

  getWithdrawalsObs () {
    return of('')
  }

  getHistoryMovements (requestParams) {
    // requestParams = {
    //   currency: 'LTC'
    // }
    if (!requestParams.currency) {
      throw new Error(`${this.exchangeId} getDepositOrWithDrawalHistory method requires currency`)
    }
    return this.ccxt.privatePostAuthRMovementsHist(this.ccxt.extend(requestParams)).then(result => {
      return result.map(fromMovementToStandardTrade)
    })
  }

  getMyTradesObs (apiKey, symbolCurrencyPair = undefined, params = {}) {
    this.initializeApiKey(apiKey)

    let since = moment(this.birthDate).unix() * 1000
    const limit = 2500
    const fetchData = () => {
      return super.getMyTrades(apiKey, undefined, {limit, since})
    }

    const mapFun = trades => {
      // trades.symbolIndex = symbolIndex
      // trades.marketsLength = markets.length
      // trades.progress = (symbolIndex + 1) / (markets.length - 1)
      return trades
    }

    const trades$ = defer(fetchData)
    let result$ = trades$.pipe(
      map(mapFun),
      tap(data => { since = data[data.length - 1].date * 1000 + 1 }),
      map(data => ({errors: [], data})),
      catchError(error$ => {
        return of({errors: [error$.toString()], data: []})
      }),
      repeatWhen(notifications => notifications.pipe(
        delay(5000)
      )),
      takeWhile(result => result.data.length > 0)
    )
    return result$
  }

  filterByType (response, type) {
    return _.filter(response, (history) => {
      return history.type === HISTORY_TYPE[type]
    })
  }
}

// for symbolCurrencyPair pass a specific pair like 'BTC/USD' required
// The optional parameters can be passed in params
// params = {
//   symbol: 'BTC/USD' (passed as symbolCurrencyPair, no need to pass in params)
//   timestamp: moment('01/01/2017', 'DD/MM/YYYY').utc().format('X') optional, UNIX timestamp
//   until: moment('01/03/2018', 'DD/MM/YYYY').utc().format('X') optional, UNIX timestamp
//   limit_trades: 100 limit the number of trades to be returned
//   reverse: Return trades in reverse order (the oldest comes first). Default is returning newest trades first.
// }
// getMyTrades (apiKey, symbolCurrencyPair = undefined, params)

export default new BitfinexExchangeClient(EXCHANGE_ID)

// const wsTradesMapping = [
//   'mts',
//   'amount',
//   'price',
//   'rate',
//   'period'
// ]

// // [{
// //   "type":"deposit",
// //   "currency":"btc",
// //   "amount":"0.0",
// //   "available":"0.0"
// // },{
// //   "type":"deposit",
// //   "currency":"usd",
// //   "amount":"1.0",
// //   "available":"1.0"
// // },{
// //   "type":"exchange",
// //   "currency":"btc",
// //   "amount":"1",
// //   "available":"1"
// // },{
// //   "type":"exchange",
// //   "currency":"usd",
// //   "amount":"1",
// //   "available":"1"
// // },{
// //   "type":"trading",
// //   "currency":"btc",
// //   "amount":"1",
// //   "available":"1"
// // },{
// //   "type":"trading",
// //   "currency":"usd",
// //   "amount":"1",
// //   "available":"1"
// // }]

//   wsTrades: function () {
//     let currentChannel = 'trades'
//     this.wsConnect().then(() => {
//       InviziCache.setItem('BitfinexExchangeClient.wsTrades', [])
//       let symbol = 'tBTCUSD'
//       let tradesRequest = JSON.stringify({
//         event: 'subscribe',
//         channel: 'trades',
//         symbol: symbol
//       })
//       webSocket.send(tradesRequest)
//       webSocket.on('message', (msg) => {
//         let message = JSON.parse(msg)
//         if (message.event === 'subscribed' && message.channel === currentChannel) {
//           channelIdMapping[message.channel] = channelIdMapping[message.channel] || {}
//           channelIdMapping[message.channel][message.chanId] = message.pair
//         } else if (Array.isArray(message)) {
//           if (message[1] === 'hb') return
//           let channelId = message[0]
//           if (!channelIdMapping[currentChannel][channelId]) return
//           let receivedTrade = _.zipObject(wsTradesMapping, message[1])
//           console.log(receivedTrade)
//         }
//       })
//     })
//   },

//   getDepositHistory: function (apiKeys) {
//     throw new Error('Not Implemented yet')
//   },

//   getWithdrawalHistory: function (apiKeys) {
//     throw new Error('Not Implemented yet')
//   },

//   getTradeHistory: function (apiKeys) {
//     throw new Error('Not Implemented yet')
//   },

//   csvParser: function (result) {
//     throw new Error('Not Implemented yet')
//   },

//   // Save csv into db in right format in db.trades
//   csvSave: function (data) {
//     throw new Error('Not Implemented yet')
//   }
// }
