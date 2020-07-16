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
import Historical from '@/components/Historical'
import Forex from './Forex'
import Settings from './Settings'
import InviziLambda from '@/utils/InviziLambda'
import {subtract, add} from '@/components/InviziCalc'
import TradeClient from '@/components/TradeClient'

const _ = require('lodash')
const moment = require('moment')
const math = require('mathjs')

let BalanceHelper = {

  mergeAllAccounts: function (accounts) {
    var result = {}
    _.each(accounts, (obj) => {
      result = this.mergeAccounts(result, obj)
    })
    return result
  },

  diffBalances (a, b) {
    function subtracter (a, b) {
      if (a && b) {
        return subtract(a, b)
      }
      if (!a && b) {
        return -b
      }
    }
    return _.mergeWith(Object.assign({}, a), Object.assign({}, b), subtracter)
  },

  /*
   * Merge 2 accounts balance to a single object group by coinId
   */
  mergeAccounts (a, b) {
    let result = _.mergeWith({}, a, b, function (objValue, srcValue) {
      let val1 = 0
      if (!isNaN(objValue)) {
        val1 = objValue
      }
      let val2 = 0
      if (!isNaN(srcValue)) {
        val2 = srcValue
      }
      return add(val1, val2)
    })
    return this.removeZeroCoins(result)
  },

  balanceUSD (balance, options = {}) {
    let ticker
    try {
      ticker = Ticker.last(options)
    } catch (err) {
      console.log(err)
      return undefined
    }
    if (!ticker) return undefined

    var forex = Forex.last()
    // TODO check balance is not negative
    // calculate total

    var totalBalance = _.mapValues(balance, (quantity, key) => {
      var coin = _.find(ticker.data, {coin_id: key})
      if (coin) {
        return math.number(math.multiply(math.bignumber(quantity), math.bignumber(coin.price_usd)))
      } else if (key.toUpperCase() === 'USD') {
        return math.number(quantity)
      } else if (Forex.isFiat(key)) {
        return math.number(math.divide(math.bignumber(quantity), math.bignumber(forex.rates[key.toUpperCase()])))
      } else {
        return 0
      }
    })
    return totalBalance
  },

  balanceUSDtoBTC: function (balanceUSD, options = {}) {
    var ticker = Ticker.last(options).data
    if (!ticker) {
      return undefined
    }
    var btc = _.find(ticker, {symbol: 'BTC'})
    return _.mapValues(balanceUSD, function (priceUSD, key) {
      return math.number(math.divide(math.bignumber(priceUSD), math.bignumber(btc.price_usd)))
    })
  },

  totalByAttribute (obj, attrName) {
    return InviziLambda.sumFromObj(InviziLambda.attrExtractor(attrName), obj)
  },

  // @listBalanceUSD: array of balance in usd: [{BTC: 1400, ETH: 300, ..}, // {BTC: .. }]
  // @dates: [1368650101, 1369341302]
  // @reverse: convert from BTC to USD
  // TODO : check both are array
  balanceUSDtoBTCHistorical: function (listBalanceUSD, dates, reverse) {
    if (!_.isArray(dates) || !_.isArray(listBalanceUSD) || listBalanceUSD.length !== dates.length) {
      throw new Error('Incorrect arguments')
    }
    var result = []
    return Historical.get('bitcoin', dates).then((btcHistorical) => {
      listBalanceUSD.forEach((balance, balanceIndex) => {
        var convertedBalance = _.mapValues(balance, (usdValue) => {
          var computed
          if (reverse) {
            computed = math.number(math.multiply(math.bignumber(usdValue), math.bignumber(btcHistorical[balanceIndex][1])))
          } else {
            computed = math.number(math.divide(math.bignumber(usdValue), math.bignumber(btcHistorical[balanceIndex][1])))
          }
          return computed
        })
        result.push(convertedBalance)
      })
      let latestBtcPrice = Ticker.coinById('bitcoin').price_usd
      // The last entry need to be updated with latest price
      let lastBalance = _.mapValues(_.last(listBalanceUSD), (usdValue) => {
        var computed
        if (reverse) {
          computed = math.number(math.multiply(math.bignumber(usdValue), math.bignumber(latestBtcPrice)))
        } else {
          computed = math.number(math.divide(math.bignumber(usdValue), math.bignumber(latestBtcPrice)))
        }
        return computed
      })
      result[result.length - 1] = lastBalance
      return result
    })
  },

  totalFromObject (object) {
    return _.reduce(object, function (sum, value) {
      return math.number(math.add(math.bignumber(sum), math.bignumber(value)))
    }, 0)
  },

  balanceKeyDiscriminator (balance, discriminator = _.identity) {
    if (_.isEmpty(balance)) return {}
    let result = {}
    Object.keys(balance).forEach(key => {
      let currentKey = discriminator(key)
      if (result[currentKey] === undefined) {
        result[currentKey] = 0
      }
      result[currentKey] += balance[key]
    })
    let total = _.sum(Object.values(result))
    let finalResult = _.mapValues(result, (value) => {
      return {
        totalUSD: value,
        percent: math.number(math.divide(math.bignumber(value), math.bignumber(total)))
      }
    })

    return finalResult
  },

  exchangeBalanceToOrder: function (balance, exchangeId) {
    // TODO check arguments
    var ticker = Ticker.last().data
    var result = _.mapValues(balance, function (o, key, value) {
      var result = {}
      result.quantity = o
      result.coin = key
      result.date = moment().unix()
      result.account_name = exchangeId
      result.currency = 'USD'
      result.automatic = true
      var coin = _.find(ticker, {symbol: key})
      if (coin && coin.price_usd) {
        result.price = coin.price_usd
      }
      return result
    })
    return _.values(result)
  },

  accountsToArrayPie: function (accounts) { // TOREMOVE
    var onlyPositive = _.omitBy(accounts, (value, key) => {
      return !value || value < 0
    })
    var result = _.mapValues(onlyPositive, function (o, key, value) {
      var result = {}
      result.value = o
      result.name = key
      return result
    })
    return _.values(result)
  },

  removeZeroCoins: function (coins) {
    return _.omitBy(coins, function (a) { return a === 0 }) // Remove the 0
  },

  removeNegative: function (balance) {
    return _.pickBy(balance, (o) => { return o > 0 })
  },

  altcoinsOnly: function (balance) {
    var result = _.cloneDeep(balance)
    _.remove(result, {name: 'bitcoin'})
    _.remove(result, {name: 'usd'})
    return result
  },

  totalAltCurrency: function (totalUSD) {
    var forex = Forex.last()
    var totalAlt
    var altCurrency = Settings.get('alternateCurrency')
    var rate = forex.rates[altCurrency]
    if (rate) {
      totalAlt = math.number(math.multiply(math.bignumber(totalUSD), math.bignumber(rate)))
    }
    return totalAlt
  },

  // Check wether a particular trade will create a negative balance if updated
  checkUpdateTradeEntry (trade, balance, originalTrade) {
    let success = true
    let problematicCoinId
    let negatedTrade = TradeClient.negate(originalTrade)
    let currentTradeBalance = TradeClient.addTradesToBalance([trade, negatedTrade].filter(trade => trade))
    let relevantCoins = Object.keys(currentTradeBalance)
    let mergedBalance = this.mergeAccounts(balance, currentTradeBalance)

    relevantCoins.every(coinId => {
      if (mergedBalance[coinId] && mergedBalance[coinId] < 0) {
        success = false
        problematicCoinId = coinId
      }
      return success
    })

    return {
      success: success,
      problematicCoin: {coinId: problematicCoinId, value: currentTradeBalance[problematicCoinId]}
    }
  },

  // Check wether a particular trade will create a negative balance if deleted
  checkDeleteTradeEntry (trade, balance) {
    return this.checkUpdateTradeEntry(null, balance, trade)
  },

  // Check wether a particular trade will create a negative balance if added (which
  // should not happen like in real life)
  // Ex: User Bought 1 BTC for 6000 USD but does not have any USD in this
  // account
  checkInvalidTradeEntry (trade, balance) {
    let success = true
    let problematicCoinId
    let currentTradeBalance = TradeClient.addTradesToBalance([trade]) // wrong: TODO get the balance up to that trade's date
    let relevantCoins = Object.keys(currentTradeBalance)
    let mergedBalance = this.mergeAccounts(balance, currentTradeBalance)

    relevantCoins.every(coinId => {
      if (!(mergedBalance[coinId] >= 0)) {
        success = false
        problematicCoinId = coinId
      }
      return success
    })

    return {
      success: success,
      problematicCoin: {coinId: problematicCoinId, value: currentTradeBalance[problematicCoinId]}
    }
  },

  // @balance: balance in unit of the coin
  // return all the balance in USD, BTc and total balance
  allBalances (balance, options = {}) {
    var balanceUSD = this.removeZeroCoins(this.balanceUSD(balance, options))
    var totalUSD = +this.totalFromObject(balanceUSD).toFixed(2)
    var totalAltCurrency = this.totalAltCurrency(totalUSD)
    var balanceBTC = this.removeZeroCoins(this.balanceUSDtoBTC(balanceUSD, options))
    balanceBTC = _.fromPairs(_.sortBy(_.toPairs(balanceBTC), function (o) { return -o[1] }))
    var totalBTC = math.number(math.bignumber(this.totalFromObject(balanceBTC)))
    var allCoins = Ticker.allCoins()
    var full = _.mapValues(balanceBTC, (o, key) => {
      return _.find(allCoins, {coin_id: key})
    })
    return {
      USD: balanceUSD,
      BTC: balanceBTC,
      totalUSD: totalUSD,
      totalAltCurrency: totalAltCurrency,
      totalBTC: totalBTC,
      full: full
    }
  },

  // @arg: balance {coinId: amount}
  handleDustCoin (balance) {
    if (Settings.get('showCoinDust')) return balance
    let total = +this.totalFromObject(balance)
    if (total < 0) return balance
    let result = {}
    let heavyCoins = _.omitBy(balance, amount => amount / total <= 0.005)
    let dustCoins = _.pickBy(balance, amount => amount / total <= 0.005)
    let dustCoin = _.reduce(dustCoins, (result, value, key) => {
      result['dust'] || (result['dust'] = 0)
      return result
    }, {})
    result = Object.assign(heavyCoins, dustCoin)
    return result
  }
}

export default BalanceHelper
