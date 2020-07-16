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
import EXCHANGE_MAPPING from '@/components/ExchangeMapping'
import InviziCalc from '@/components/InviziCalc'
import ExchangeProcessorMock from '@/components/ExchangeProcessorMock'
import InviziCache from '@/components/InviziCache'
import EventBus from '@/components/EventBus'
import Ticker from './Ticker'
import InviziTimer from '@/components/InviziTimer'
import InviziCrypto from '@/components/InviziCrypto'
import { symbolToStandard } from '@/utils/SymbolManager'

const ccxt = require('ccxt')
const _ = require('lodash')
const moment = require('moment')
const Ws = require('ws')
const MODES = ['production', 'development']
const IS_STABLE_COIN = /^BTC\/(USDC|USDT|BUSD|DAI)$/
/* eslint-disable */
let { defer, of } = rxjs
let { repeatWhen, map, delay, takeWhile, catchError } = rxjs.operators
/* eslint-enable */

function parseFee (exchangeId, trade) {
  let feeCurrency
  let feeInfo = {}
  if (!trade) return feeInfo

  if (trade.fee) {
    let feeCurrencySymbol = symbolToStandard(exchangeId, trade.fee.currency)
    if (feeCurrencySymbol) {
      feeCurrency = feeCurrencySymbol.toLowerCase()
    } else {
      console.error(`Missing coinId fee`)
      console.error(trade)
    }
  }

  if (trade.fee && feeCurrency) {
    feeInfo = {
      fee: trade.fee.cost,
      fee_currency: feeCurrency
    }
  }
  return feeInfo
}

function getPriceUsd (tickers, exchangeSymbol, priceBtc, btcUsdPrice) {
  if (tickers[`${exchangeSymbol}/USD`]) {
    return tickers[`${exchangeSymbol}/USD`].last
  } else {
    return InviziCalc.fiatFormat(priceBtc * btcUsdPrice)
  }
}

function toCcxtExchangeId (exchangeId) {
  return exchangeId === 'bitfinex' ? 'bitfinex2' : exchangeId
}

class ExchangeClient {
  constructor (exchangeId, { mode } = {mode: 'production'}) {
    this.exchangeId = exchangeId
    this.ccxt = new ccxt[toCcxtExchangeId(exchangeId)]()
    if (!this.ccxt.has.CORS) {
      this.activateProxy()
    }
    this.HISTORY_TYPE = {
      DEPOSITS: 'DEPOSITS',
      WITHDRAWALS: 'WITHDRAWALS'
    }
    this.HISTORY_KEYS_MAPPING = {
      currency: 'currency',
      timestamp: {
        'DEPOSITS': 'timestamp',
        'WITHDRAWALS': 'timestamp'
      },
      amount: 'amount'
    }
    this.webSocket = null
    this.connecting = false
    this.connected = false
    this.markets = null
    this.exchangeMarkets = null
    this.idToSymbolMap = null
    this.tickerBTC = null
    this.ccxt.enableRateLimit = true
    this.rateLimit = 20000
    this.safeRateLimit = this.ccxt.rateLimit * 1.1
    this.mode = mode
    this.setMode(this.mode)
    this.websocketActive = false
    // this.ccxt.fetchOptions = {mode: 'no-cors'}
  }

  activateProxy () {
    // this.ccxt.proxy = 'http://localhost:8080/'
  }

  setMode (mode) {
    if (!MODES.includes(mode)) {
      throw new Error('Invalid mode')
    }
    this.mode = mode
    if (this.mode === 'development') {
      this.mock = ExchangeProcessorMock
    }
  }

  getProcessor () {
    return this.mode === 'production' ? this.ccxt : this.mock
  }

  hasWebSocket () {
    return !!this.wshost
  }

  newCoins () {
    let exchange = EXCHANGE_MAPPING[this.exchangeId]
    return exchange && exchange['newCoins'] ? exchange['newCoins'] : {}
  }

  exceptionCoins () {
    let exchange = EXCHANGE_MAPPING[this.exchangeId]
    return exchange && exchange['except'] ? exchange['except'] : {}
  }

  initializeApiKey (apiKey) {
    this.ccxt.apiKey = apiKey['API_KEY']
    this.ccxt.secret = apiKey['API_SECRET']
  }

  wsConnect () {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve(this.webSocket)
      } else if (this.connecting) {
        // do nothing
      } else {
        // do connection stuff
        this.webSocket = new Ws(this.wshost)
        this.connecting = true
        this.webSocket.on('open', () => {
          console.log(`Open websocket ${this.exchangeId}`)
          this.connected = true
          this.connecting = false
          resolve(this.webSocket)
        })
        this.webSocket.on('close', () => {
          console.log(`Closing websocket ${this.exchangeId}`)
          this.connecting = false
          this.connected = false
        })
      }
    })
  }

  wsStopPersistentConnection () {
    if (this.wsKeepAlive) {
      this.wsStopPersisted = true
      this.wsKeepAlive.stop()
    }
  }

  wsPersistentConnect () {
    this.wsStopPersisted = false
    function forceConnection () {
      if (this.connected || this.wsStopPersisted) return
      this.wsConnect(this.exchangeId)
    }
    this.wsKeepAlive = InviziTimer.repeat(forceConnection, 5000, this)
  }

  wsClose () {
    this.wsStopPersistentConnection()
    this.webSocket.close()
  }

  fetchOrder (...args) {
    // symbol, type, side, amount, price = undefined, params = {}}
    return this.getProcessor().fetchOrder(...args)
  }

  fetchOrders (...args) {
    return this.getProcessor().fetchOrders(...args)
  }

  fetchClosedOrders (...args) {
    return this.getProcessor().fetchClosedOrders('ETH/BTC', ...args)
  }

  fetchOpenOrders (apiKey, ...args) {
    this.initializeApiKey(apiKey)
    // return this.getProcessor().fetchOpenOrders(...args)
  }

  // (symbol, type, side, amount, price = undefined, params = {})
  createOrder (...args) {
    // symbol, type, side, amount, price = undefined, params = {}}
    return this.getProcessor().createOrder(...args)
  }

  // id, symbol = undefined, params = {}
  cancelOrder (...args) {
    return this.getProcessor().cancelOrder(...args)
  }

  // Get unique coin symbol for all markets
  marketSymbols (exchangeMarkets) {
    return _.uniq(exchangeMarkets.map(market => market.baseId).flat())
  }

  fetchMarkets () {
    return this.ccxt.fetchMarkets().then((pairs) => {
      this.exchangeMarkets = pairs
      let markets = {}
      for (let pair of pairs) {
        if (!EXCHANGE_MAPPING[this.exchangeId].ignore || !EXCHANGE_MAPPING[this.exchangeId].ignore.includes(pair.base)) {
          let symbol = pair.base
          markets[symbol] = markets[symbol] || {}
          markets[symbol][`has${pair.quote}`] = true
        }
      }
      this.markets = markets
      return markets
    })
  }

  usdPair (symbol) {
    return `${symbol}/USD`
  }

  usdtPair (symbol) {
    return `${symbol}/USDT`
  }

  btcPair (symbol) {
    return `${symbol}/BTC`
  }

  getWsPairs () {
    return this.fetchMarkets().then(() => {
      let idToSymbolMap = {}
      for (let exchangeMarket of this.exchangeMarkets) {
        idToSymbolMap[exchangeMarket.id] = exchangeMarket.symbol
      }
      this.idToSymbolMap = idToSymbolMap
      return idToSymbolMap
    })
  }

  processWsTickerResponse (tickerResponse) {
    throw new Error(`processWsTickerResponse - Missing implemenation for ${this.exchangeId}`)
  }

  getWsTickerRequest (symbolCurrencyPairs) {
    throw new Error(`getWsTickerRequest - Missing implemenation for ${this.exchangeId}.`)
  }

  wsSendTickerRequest () {
    throw new Error(`wsSendTickerRequest - Missing implemenation for ${this.exchangeId}.`)
  }

  wsTickerToStandard (tickers) {
    let exchange = EXCHANGE_MAPPING[this.exchangeId]
    if (exchange && exchange['cmc']) {
      return tickers.map((ticker) => {
        return Object.assign({}, ticker, {id: symbolToStandard(this.exchangeId, ticker.symbol)})
      })
    } else {
      return tickers
    }
  }

  wsTickerPrice (wsTicker) {
    return wsTicker.price
  }

  exchangeWsTickerToStandard (exchangeWsTickers) {
    let result = []
    let productIds = Object.keys(exchangeWsTickers)
    let symbols = _.uniq(productIds.map((productId) => {
      return productId.split('/')[0]
    }))
    for (let symbol of symbols) {
      let tickerUSD, tickerBTC, priceBTC, priceUSD
      if (this.markets[symbol].hasUSD) {
        tickerUSD = _.find(exchangeWsTickers, (ticker, key) => {
          return key === this.usdPair(symbol)
        })
        if (!tickerUSD) continue
      } else if (this.markets[symbol].hasUSDT) {
        tickerUSD = _.find(exchangeWsTickers, (ticker, key) => {
          return key === this.usdtPair(symbol)
        })
        if (!tickerUSD) continue
      }

      if (tickerUSD) {
        priceUSD = InviziCalc.fiatFormat(this.wsTickerPrice(tickerUSD))
      }

      if (symbol === 'BTC') {
        priceBTC = 1.0
      } else {
        tickerBTC = _.find(exchangeWsTickers, (ticker, key) => {
          return key === this.btcPair(symbol)
        })
        if (!tickerBTC) continue
        priceBTC = InviziCalc.btcFormat(this.wsTickerPrice(tickerBTC))
        if (!tickerUSD) {
          if ((this.markets['BTC'].hasUSD || this.markets['BTC'].hasUSDT) && this.tickerBTC) {
            priceUSD = InviziCalc.fiatFormat(priceBTC * this.tickerBTC.price_usd)
          } else {
            continue
          }
        }
      }
      let currentTicker = {
        symbol: symbol,
        price_usd: priceUSD,
        price_btc: priceBTC
      }
      result.push(currentTicker)
      if (symbol === 'BTC') {
        this.tickerBTC = currentTicker
      }
    }
    let resultStandard = this.wsTickerToStandard(result)
    if (process.env.VERBOSE_WEBSOCKET) {
      console.log(`WebSocket call :${this.exchangeId}`)
    }
    return Ticker.fillIdAndName(resultStandard, this.exceptionCoins(), this.newCoins())
  }
  // TODO: Private
  fetchTickers () {
    return this.ccxt.fetchTickers()
  }

  getTickers () {
    return this.fetchTickers().then((tickers) => {
      let btcUsdPrice
      if (tickers['BTC/USD']) {
        btcUsdPrice = tickers['BTC/USD']['last']
      } else if (tickers['BTC/USDT']) {
        btcUsdPrice = tickers['BTC/USDT']['last']
      } else {
        throw new Error('Missing BTC/USD or BTC/USDT pair.')
      }

      let tickersBtc = _.filter(tickers, (ticker, currency) => {
        return /BTC$/.test(currency) && !/^(USDC|USDT)/.test(currency)
      })

      let tickersStableCoins = _.filter(tickers, (ticker, currency) => {
        return IS_STABLE_COIN.test(currency)
      })

      let exchange = EXCHANGE_MAPPING[this.exchangeId]
      let result = []
      let btcTicker = {
        symbol: 'BTC',
        coin_id: 'bitcoin',
        price_usd: btcUsdPrice,
        price_btc: 1.0
      }
      result.push(btcTicker)
      let coinId
      // Handles pairs like XXX/BTC
      for (let ticker of tickersBtc) {
        let exchangeSymbol = ticker['symbol'].replace(/\/BTC$/, '')
        let ignoreList = (exchange && exchange['ignore']) ? exchange['ignore'] : []
        if (ignoreList && ignoreList.includes(exchangeSymbol)) {
          continue
        }
        coinId = symbolToStandard(this.exchangeId, exchangeSymbol)

        if (!coinId) continue // If it's an unknown coin, ignore it

        let priceBtc = ticker['last']
        let priceUsd
        if (tickers[`${exchangeSymbol}/USD`]) {
          priceUsd = tickers[`${exchangeSymbol}/USD`].last
        } else {
          priceUsd = InviziCalc.fiatFormat(priceBtc * btcUsdPrice)
        }

        let currentTicker = {
          coin_id: coinId,
          symbol: exchangeSymbol,
          price_usd: priceUsd,
          price_btc: priceBtc
        }
        result.push(currentTicker)
      }
      // Handles stable coins pairs like BTC/USDC
      for (let ticker of tickersStableCoins) {
        let match = ticker['symbol'].match(IS_STABLE_COIN)
        if (!match) continue
        let exchangeSymbol = match[1]
        coinId = symbolToStandard(this.exchangeId, exchangeSymbol)

        if (!coinId) continue // If it's an unknown coin, ignore it

        let priceBtc = 1 / ticker['last'] // We inverse since the pair is BTC/USDC
        let priceUsd = getPriceUsd(tickers, exchangeSymbol, priceBtc, btcUsdPrice)

        let currentTicker = {
          coin_id: coinId,
          symbol: exchangeSymbol,
          price_usd: priceUsd,
          price_btc: priceBtc
        }
        result.push(currentTicker)
      }

      Ticker.fillIdAndName(result, this.exceptionCoins(), this.newCoins())
      let finalResult = { data: result, lastUpdated: moment().unix() }
      InviziCache.setItem(`${_.upperFirst(this.exchangeId)}ExchangeClient.getTickers`, finalResult, {persistent: true})
      EventBus.$emit('ExchangeClient/getTickers', {exchange: this.exchangeId, tickers: finalResult})
      // console.log(`REST: ${moment(finalResult.lastUpdated, 'X').format()}`)
      return result
    })
  }

  parseWithdrawals (withdrawals) {
    let result = []
    for (let withdrawal of withdrawals) {
      let currency = symbolToStandard(this.exchangeId, withdrawal.currency)
      let amount = Math.abs(+withdrawal.amount)
      let date = +withdrawal.info.applyTime
      if (this.parseHistoryMovementsDate) {
        date = this.parseHistoryMovementsDate(date)
      }
      let feeInfo = parseFee(this.exchangeId, withdrawal)
      let trade = Object.assign({
        _id: InviziCrypto.uuidv4(),
        account_name: this.exchangeId,
        date: date,
        from: currency,
        quantity_from: amount,
        quantity_to: 0,
        to: undefined
      }, feeInfo)
      result.push(trade)
    }
    return result
  }

  parseDeposits (deposits) {
    let result = []
    for (let deposit of deposits) {
      let currency = symbolToStandard(this.exchangeId, deposit.currency)
      let amount = Math.abs(+deposit.amount)
      let date = +deposit.info.insertTime
      if (this.parseHistoryMovementsDate) {
        date = this.parseHistoryMovementsDate(date)
      }
      result.push({
        _id: InviziCrypto.uuidv4(),
        account_name: this.exchangeId,
        date: date,
        from: undefined,
        quantity_from: 0,
        quantity_to: amount,
        to: currency
      })
    }
    return result
  }

  parseHistoryMovements (depositOrWithdrawalHistory, type) {
    let result = []
    let isDeposit = (type === this.HISTORY_TYPE.DEPOSITS)
    for (let depositOrWithdrawal of depositOrWithdrawalHistory) {
      let currency = symbolToStandard(this.exchangeId, depositOrWithdrawal[`${this.HISTORY_KEYS_MAPPING.currency}`])
      let amount = Math.abs(+depositOrWithdrawal[`${this.HISTORY_KEYS_MAPPING.amount}`])
      let date = +depositOrWithdrawal[`${this.HISTORY_KEYS_MAPPING.timestamp[type]}`]
      if (this.parseHistoryMovementsDate) {
        date = this.parseHistoryMovementsDate(date)
      }
      result.push({
        _id: InviziCrypto.uuidv4(),
        account_name: this.exchangeId,
        date: date,
        from: isDeposit ? undefined : currency,
        quantity_from: isDeposit ? 0 : amount,
        quantity_to: isDeposit ? amount : 0,
        to: isDeposit ? currency : undefined
      })
    }
    return result
  }

  getDepositOrWithdrawalHistory (apiKey, type, requestParams) {
    this.initializeApiKey(apiKey)
    return this.getHistoryMovements(requestParams, type).then((response) => {
      // TODO Handle error in response
      let depositOrWithdrawalHistory = this.filterByType(response, type)
      return this.parseHistoryMovements(depositOrWithdrawalHistory, type)
    })
  }

  fetchUntil (fetchFun, mapFun, takeWhileFun) {
    const trades$ = defer(fetchFun)
    let result$ = trades$.pipe(
      map(mapFun),
      map(data => ({errors: [], data})),
      catchError(error$ => {
        return of({errors: [error$.toString()], data: []})
      }),
      repeatWhen(notifications => notifications.pipe(
        delay(this.safeRateLimit)
      )),
      takeWhile(takeWhileFun)
    )

    return result$
  }

  fetchDeposits (apiKey, since, requestParams) {
    console.log(`fetchDeposits ${moment(since, 'X').toString()}.`)
    this.initializeApiKey(apiKey)
    return this.ccxt.fetchDeposits(undefined, since * 1000, undefined, requestParams).then((trades) => {
      return this.parseDeposits(trades)
    })
  }

  fetchWithdrawals (apiKey, since, requestParams) {
    // console.log(`fetchWithdrawals ${moment(since, 'X').toString()}.`)
    this.initializeApiKey(apiKey)
    return this.ccxt.fetchWithdrawals(undefined, since * 1000, undefined, requestParams).then((trades) => {
      return this.parseWithdrawals(trades)
    })
  }

  // TODO: for new coins

  filterBalance (balance) {
    let filtered = balance
    // Exclude the ignore list
    if (EXCHANGE_MAPPING[this.exchangeId] && EXCHANGE_MAPPING[this.exchangeId]['ignore']) {
      filtered = _.omitBy(filtered, (value, key) => {
        return EXCHANGE_MAPPING[this.exchangeId]['ignore'].indexOf(key) >= 0
      })
    }
    // only the positive balance
    return _.pickBy(filtered, v => v > 0)
  }

  loadBalance (apiKey, options) {
    this.initializeApiKey(apiKey)
    return this.ccxt.fetchBalance(options).then((balance) => {
      return _.mapKeys(this.filterBalance(balance.total), (value, key) => {
        return symbolToStandard(this.exchangeId, key)
      })
    })
  }

  parseTrades (trades, symbolCurrencyPair) {
    let result = []
    let symbolCurrency, symbol, currency, coinId
    if (symbolCurrencyPair) {
      symbolCurrency = symbolCurrencyPair.split('/')
      symbol = symbolCurrency[0]
      currency = symbolToStandard(this.exchangeId, symbolCurrency[1])
      if (!currency) {
        console.warn(`Missing currency for symbol ${symbolCurrency[1]}`)
        return result
      }
      currency = currency.toLowerCase()
      coinId = symbolToStandard(this.exchangeId, symbolCurrency[0])
      if (!coinId) {
        console.warn(`Missing coinId for symbol ${symbolCurrency[0]}`)
        return result
      }
    }

    for (let trade of trades) {
      let isSell = (trade.side === 'sell')
      if (!symbolCurrencyPair) {
        symbolCurrency = trade.symbol.split('/')
        symbol = symbolCurrency[0]
        currency = symbolToStandard(this.exchangeId, symbolCurrency[1])
        if (!currency) {
          console.warn(`Missing coinId for currency symbol ${symbolCurrency[1]}`)
          continue
        }
        currency = currency.toLowerCase()
        coinId = symbolToStandard(this.exchangeId, symbol)
        if (!coinId) {
          console.warn(`Missing coinId for currency symbol ${symbol}`)
          continue
        }
      }
      let cost = InviziCalc.multiply(trade.price, trade.amount)

      if (!coinId) {
        throw new Error('Parsing issue in parseTrades')
      }

      let feeInfo = parseFee(this.exchangeId, trade)

      result.push(Object.assign({
        _id: InviziCrypto.uuidv4(),
        account_name: this.exchangeId,
        date: moment(trade.datetime).unix(),
        from: isSell ? coinId : currency,
        quantity_from: isSell ? trade.amount : cost,
        quantity_to: isSell ? cost : trade.amount,
        to: isSell ? currency : coinId
      }, feeInfo))
    }
    return result
  }

  // TODO: sometimes request times out
  // TODO: handle currency mapping
  getMyTrades (apiKey, symbolCurrencyPair = undefined, params = {}) {
    this.initializeApiKey(apiKey)
    return this.ccxt.fetchMyTrades(symbolCurrencyPair, params.since, params.limit, params).then((trades) => {
      return this.parseTrades(trades, symbolCurrencyPair)
    })
  }

  onWsTickerMessage (message) {
    let tickersWs = InviziCache.getItem(`${_.upperFirst(this.exchangeId)}ExchangeClient.tickersWs`)
    let exchangeWsTicker = this.processWsTickerResponse(message, tickersWs)
    InviziCache.setItem(`${_.upperFirst(this.exchangeId)}ExchangeClient.tickersWs`, exchangeWsTicker)
    let wsStandardTicker = this.exchangeWsTickerToStandard(exchangeWsTicker)
    let finalResult = { data: wsStandardTicker, lastUpdated: moment().unix() }
    InviziCache.setItem(`${_.upperFirst(this.exchangeId)}ExchangeClient.getTickers`, finalResult)
    // console.log(`WebSocket: ${moment(finalResult.lastUpdated, 'X').format()}`)
    EventBus.$emit('ExchangeClient/getTickers', { exchange: this.exchangeId, tickers: finalResult })
  }

  onWsMessage () {
    this.webSocket.on('message', (msg) => {
      let message = JSON.parse(msg)
      if (this.isTickerChannel(message)) {
        this.onWsTickerMessage(message)
      }
    })
  }

  getWsTickers () {
    return this.wsConnect().then(() => {
      InviziCache.setItem(`${_.upperFirst(this.exchangeId)}ExchangeClient.tickersWs`, {})
      this.wsSendTickerRequest()
      this.onWsMessage()
    })
  }
}

export default ExchangeClient
