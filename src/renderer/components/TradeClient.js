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
import db from '@/components/InviziDatabase'
import assert from './assert.js'
import Formatter from '@/components/Formatter'
import Historical from '@/components/Historical'
import DateHelper from '@/components/DateHelper'
import BalanceHelper from '@/components/BalanceHelper'
import Forex from '@/components/Forex'
import UserManager from '@/components/UserManager'
import InviziCrypto from '@/components/InviziCrypto'
import InviziUtils from '@/utils/InviziUtils'
import InviziCache from '@/components/InviziCache'
import InviziCalc from '@/components/InviziCalc'
import Settings from '@/components/Settings'
import { autorun } from '@/utils/Dep.js'
const { ipcRenderer } = require('electron')

const moment = require('moment')
const _ = require('lodash')
const math = require('mathjs')
const DEBUG_BALANCE = true

function addToDebug (result, log) {
  if (DEBUG_BALANCE) {
    result.push(_.cloneDeep(log))
  }
  return result
}

const printDebug = console.log

function computeCounterNumber (trades) {
  if (!_.isEmpty(trades)) {
    trades._counterNumber = _.last(trades).id + 1
  } else {
    trades._counterNumber = 1
  }
  return trades
}

let TradeClient = {
  name: 'TradeClient',

  cacheKey: 'TradeClient.all()',

  tradeTypeLabels: ['Bought', 'Sold', 'Deposited', 'Withdrawn'],

  table: db.trades,

  DATE_NAMES: ['1_years', '6_months', '30_days', '7_days', '24_hours'],

  all () { // TODO refactor with async
    let allTradesEncryptedCache = InviziCache.getItem('TradeClient.trades.toArrayRaw()')
    if (allTradesEncryptedCache) {
      performance.mark('allTradesEncryptedCache start')
      let result = allTradesEncryptedCache.map(trade => InviziCrypto.decrypt(trade, UserManager.hashedPassword))
      performance.mark('allTradesEncryptedCache end')
      InviziCache.deleteItem('TradeClient.trades.toArrayRaw()')
      computeCounterNumber(result)
      InviziCache.setItem('TradeClient.all()', result)
      return InviziUtils.promisifyValue(result)
    }

    let allTradesCache = InviziCache.getItem('TradeClient.all()')
    if (allTradesCache && allTradesCache.length > 0) {
      return InviziUtils.promisifyValue(allTradesCache)
    }

    return db.trades.toArray().then((allTradesDb) => {
      computeCounterNumber(allTradesDb)
      InviziCache.setItem('TradeClient.all()', allTradesDb)
      return allTradesDb
    })
  },

  allRaw () {
    return db.trades.toArray().then(result => {
      return result || []
    })
  },

  count () {
    return this.table.count()
  },

  /**
   * Return a map of coin with their dates of trades
   * ex: {bitcoin: [15123, 123123], ethereum: [123123, ...]}
   */
  datesOfCoins (trades, key) { // TOREMOVE not used
    assert(key === 'from' || key === 'to')
    let result = {}
    trades.forEach(trade => {
      result[trade[key]] = result[trade[key]] || []
      result[trade[key]].push(trade['date'])
    })
    return result
  },

  formatDefinition: {
    date: function (value) {
      if (_.isString(value)) {
        if (/\d{4,4}-/.test(value)) {
          return moment(value, 'YYYY-MM-DD').unix()
        } else {
          return moment(value, 'X').unix()
        }
      } else {
        return value
      }
    },
    quantity_from: parseFloat,
    quantity_to: parseFloat,
    id: parseInt
  },

  // Compute a unique Id to identify unique trades
  // useful when importing trades subsequently
  hashId (trade) {
    let stringValue = trade.date + trade.from + trade.quantity_from + trade.to + trade.quantity_to
    return InviziCrypto.sha256(stringValue)
  },

  async loadCoin (coinId) { // TODO performance not efficient
    let allTrades = await this.all()
    let from = _.filter(allTrades, {from: coinId})
    let to = _.filter(allTrades, {to: coinId})
    return [...from, ...to]
  },

  loadBalance (options) {
    return this.all().then((history) => {
      let result = this.addTradesToBalance(history, {})
      return result
    })
  },

  // Given a trades iterator calculate balance for each date
  // returns: iterator with return {date: , balance: {bitcoin: 1, ethereum: 2}}
  // with balance added up to that date
  balanceOfTradesIterator: function* (tradesIterator) {
    let currentBalance = {}
    for (let currentIter of tradesIterator) {
      currentBalance = this.addTradesToBalance(currentIter.trades, currentBalance)
      yield {
        date: currentIter.date,
        balance: currentBalance,
        length: currentIter.length,
        index: currentIter.index
      }
    }
  },

  // Given a set of trades and date iterator pick all trades
  // placed after the previous date and before the current date
  // returns: iterator with return {date: , trades: []}
  tradesIterator: function* (trades, dateIterator) {
    let allTrades = trades.sort((a, b) => {
      return a.date - b.date
    })
    let currentTradeIndex = 0
    let currentResult = []
    for (let currentIter of dateIterator) {
      while (currentTradeIndex < allTrades.length &&
             allTrades[currentTradeIndex].date < currentIter.date) {
        currentResult.push(allTrades[currentTradeIndex])
        currentTradeIndex++
      }
      yield {
        date: currentIter.date,
        trades: currentResult,
        length: currentIter.length,
        index: currentIter.index }
      currentResult = []
    }
  },

  loadHistoricalBalance (options) {
    options = options || {}
    return this.all().then((allTrades) => {
      if (allTrades.length === 0) return []
      let trades = _.filter(allTrades, (o) => {
        return o.quantity_to > 0 || o.quantity_from > 0
      })
      let coinsInvolved = this.coinsInvolved(trades) // Contains only crypto coins
      // Remove fiat
      coinsInvolved = coinsInvolved.filter(coinId => !Forex.isFiat(coinId))
      let dates = _.uniq(_.map(trades, (o) => { return o.date }))
      dates = dates.sort((a, b) => {
        return a - b
      })
      trades = trades.sort((a, b) => {
        return a.date - b.date
      })
      let minDate = dates[0]
      let promises = []
      let intervalIter = DateHelper.intervalIterator(1, 'days', minDate)
      let fullDates = Array.from(intervalIter).map(iter => iter.date)
      intervalIter = DateHelper.intervalIterator(1, 'days', minDate)

      let tradeIter = TradeClient.tradesIterator(trades, intervalIter)
      let balanceIter = TradeClient.balanceOfTradesIterator(tradeIter)

      coinsInvolved.forEach((coinId) => {
        let coinPromise = Historical.get(coinId, fullDates).then(coinHistorical => {
          if (!coinHistorical || coinHistorical.length === 0) return []
          let result = Historical.pickDatesSafe(coinHistorical, fullDates)
          return result
        })
        promises.push(coinPromise)
      })

      return Promise.all(promises).then((historicalValues) => {
        let result = [fullDates, []]
        let balance = {}
        let dateIndex
        for (let currentIter of balanceIter) {
          //  balance is the balance until that date
          dateIndex = currentIter.index
          Object.keys(currentIter.balance).forEach((coinId) => {
            if (Forex.isFiat(coinId)) {
              // It's a fiat so just add it to the balance
              balance[coinId] = math.number(currentIter.balance[coinId])
            } else {
              let coinIdIndex = coinsInvolved.indexOf(coinId)
              if (historicalValues && currentIter.balance[coinId] && historicalValues[coinIdIndex] && historicalValues[coinIdIndex][dateIndex]) {
                balance[coinId] = math.number(math.multiply(math.bignumber(currentIter.balance[coinId]), math.bignumber(historicalValues[coinIdIndex][dateIndex])))
              }
            }
          })

          result[1].push(balance)
          balance = {}
        }
        // Add today's balance
        // var now = moment().unix()
        // result[0].push(now)
        // var balance = this.balanceFromTrades(trades, now, options)
        // result[1].push(BalanceHelper.balanceUSD(balance))
        return { coinsInvolved, data: result }
      })
    })
  },

  // data: same format as loadHistoricalBalance output
  // data: [[dates], [values]]
  performance: function (data) {
    if (!data[0] || !data[1] || data[1].length === 0) return {}

    let dateNames = this.DATE_NAMES
    let chosenDates = dateNames.map((dateName) => {
      let nameSplit = dateName.split('_')
      return moment().subtract(nameSplit[0], nameSplit[1]).unix()
    })

    let earliestDataDate = data[0][0]
    // Ensure earliest chosenDates is after earliest dates of data
    let earliestPossibleChosenDateIndex = _.findIndex(chosenDates, (chosenDate) => {
      return chosenDate >= earliestDataDate
    })

    if (earliestPossibleChosenDateIndex === -1) {
      return {}
    }

    let chosenDatesFiltered = chosenDates.slice(earliestPossibleChosenDateIndex)
    let dateNamesFiltered = dateNames.slice(earliestPossibleChosenDateIndex)

    let chosenDatesValues = Historical.pickDates(data, chosenDatesFiltered)
    let latestValue = _.last(data[1])

    if (chosenDatesFiltered.length !== dateNamesFiltered.length) {
      throw new Error('Incorrect chosenDatesFiltered length')
    }

    let result = {}
    dateNamesFiltered.forEach((dateName, dateIndex) => {
      result[dateName] = (latestValue - chosenDatesValues[dateIndex]) / chosenDatesValues[dateIndex]
    })

    return result
  },

  // Get all the coinIds of the coins involved in all accounts
  coinsInvolved (trades) {
    var result = _.flatMap(trades, (o) => { return [o.from, o.to] })
    // TODO remove all currencies
    return _.filter(_.uniq(result), (o) => { return ![undefined, 'undefined', 'usd', 0, null].includes(o) })
  },

  async account (accountName) {
    let accountTrades = await this.all()
    return _.filter(accountTrades, {account_name: accountName})
  },

  async deleteAccount (accountName) {
    let accountTrades = await this.account(accountName)
    let idsToRemove = accountTrades.map(t => t.id)
    InviziCache.removeFromCollection(this.cacheKey, idsToRemove)
    return idsToRemove
  },

  async find (filterOptions) {
    let accountTrades = await this.all()
    return _.filter(accountTrades, filterOptions)
  },

  // Return array of all the account names with at least a transaction
  async hasAccountsWithTrades () {
    let allTrades = await this.all()
    return !!_.find(allTrades, trade => !!trade.account_name)
  },

  loadAccountMerged (accountName, options) {
    return this.account(accountName).then((rows) => {
      return this.addTradesToBalance(rows)
    })
  },

  addTradesToBalance (initialTrades, balance = {}, until) {
    let currentBalance = Object.assign({}, balance)
    printDebug(currentBalance)
    let debugResult = []
    addToDebug(debugResult, currentBalance)
    let attribs, change
    let trades = initialTrades.sort((a, b) => {
      return a.date - b.date
    })

    trades.forEach(trade => {
      // exclude trades that are after the date
      if (until && trade.date > until) {
        addToDebug(debugResult, `trade ignored (until set to ${until}`)
        return
      }
      addToDebug(debugResult, `processing trade`)
      addToDebug(debugResult, trade)
      let keyQuantityMapping = ['quantity_to', 'quantity_from', 'fee']
      attribs = [trade.to, trade.from, trade.fee_currency]

      attribs.forEach((tradeKey, keyIndex) => {
        if (!tradeKey) return

        if (!currentBalance[tradeKey]) {
          currentBalance[tradeKey] = 0
        }
        change = trade[keyQuantityMapping[keyIndex]]
        if ([1, 2].includes(keyIndex)) {
          change = change * -1
        }
        addToDebug(debugResult, `add ${change} to ${tradeKey}`)
        currentBalance[tradeKey] = InviziCalc.add(currentBalance[tradeKey], change)
        addToDebug(debugResult, currentBalance)
      })
    })
    let finalResult = BalanceHelper.removeZeroCoins(currentBalance)
    addToDebug(debugResult, finalResult)
    printDebug(debugResult)
    return finalResult
  },

  async accountsUntil (unixDate) {
    let allTrades = await this.all()
    return _.filter(allTrades, (trade) => {
      return trade.date <= unixDate
    })
  },

  async getBalancePerAccount () {
    // Get all the trades
    const allTrades = await this.all()
    let balanceByAccount = _.chain(allTrades)
      .groupBy('account_name')
      .mapValues((trades) => this.addTradesToBalance(trades))
      .mapValues((coins, exchangeName) => BalanceHelper.allBalances(coins, {exchange: exchangeName}))
      .mapValues((balance) => _.pick(balance, ['totalAltCurrency', 'totalBTC', 'totalUSD']))
      .value()
    return balanceByAccount
  },

  // {binance: {bitcoin: {totalUSD: 3900, totalBTC: 1}}}
  async getBalancePerCoinByAccount () {
    // Get all the trades
    const allTrades = await this.all()
    let balancePerCoinInUnit = _.chain(allTrades)
      .groupBy('account_name')
      .mapValues((trades) => BalanceHelper.removeNegative(this.addTradesToBalance(trades)))
      .value()

    let balancePerCoinInUSD = _.mapValues(balancePerCoinInUnit, (coins, exchangeName) => {
      return BalanceHelper.balanceUSD(coins, {exchange: exchangeName})
    })
    let balancePerCoinBTC = _.mapValues(balancePerCoinInUSD, (coins, exchangeName) => BalanceHelper.balanceUSDtoBTC(coins, {exchange: exchangeName}))
    let result = _.mapValues(balancePerCoinInUnit, (balance, exchangeName) => {
      return _.mapValues(balance, (quantity, coinId) => {
        return {
          quantity: quantity,
          totalUSD: balancePerCoinInUSD[exchangeName][coinId],
          totalBTC: balancePerCoinBTC[exchangeName][coinId]
        }
      })
    })
    return result
  },

  async getBalancePerCoin () {
    const SHOW_COIN_DUST = Settings.get('showCoinDust')
    let balancePerCoinByAccount = await this.getBalancePerCoinByAccount()
    let result = _.reduce(balancePerCoinByAccount, (result, coins) => {
      Object.keys(coins).forEach(coinId => {
        if (!result[coinId]) {
          result[coinId] = coins[coinId]
        } else {
          result[coinId]['totalUSD'] = math.number(math.sum(math.bignumber(result[coinId]['totalUSD']), math.bignumber(coins[coinId]['totalUSD'])))
          result[coinId]['totalBTC'] = math.number(math.sum(math.bignumber(result[coinId]['totalBTC']), math.bignumber(coins[coinId]['totalBTC'])))
          result[coinId]['quantity'] = math.number(math.sum(math.bignumber(result[coinId]['quantity']), math.bignumber(coins[coinId]['quantity'])))
        }
      })
      return result
    }, {})
    let totalBTC = BalanceHelper.totalByAttribute(result, 'totalBTC')
    _.mapValues(result, value => {
      value['percent'] = math.number(math.divide(math.bignumber(value['totalBTC']), math.bignumber(totalBTC)))
      value['price'] = math.number(math.divide(math.bignumber(value['totalUSD']), math.bignumber(value['quantity'])))
    })
    result = _.omitBy(result, coin => coin.totalUSD === 0)
    if (!SHOW_COIN_DUST) { // hide the coins with small amount
      let heavyCoins = _.omitBy(result, coin => coin.percent <= 0.005)
      let dustCoins = _.pickBy(result, coin => coin.percent <= 0.005)
      let dustCoin = _.reduce(dustCoins, function (result, value, key) {
        result['dust'] || (result['dust'] = {percent: 0, totalUSD: 0, totalBTC: 0, quantity: 1})
        result['dust'].percent += value.percent
        result['dust'].totalUSD += value.totalUSD
        result['dust'].totalBTC += value.totalBTC
        return result
      }, {})
      result = Object.assign(heavyCoins, dustCoin)
    }
    return result
  },

  getTotalBalance (balance) {
    return _.chain(balance)
      .map(balance => balance.totalUSD)
      .sum()
      .value()
  },

  async getPortfolioByExchange () {
    const balanceByAccount = await this.getBalancePerAccount()
    const totalBalance = this.getTotalBalance(balanceByAccount)
    return _.mapValues(balanceByAccount, value => _.assign(value, {percent: totalBalance ? math.number(math.divide(
      math.bignumber(value.totalUSD), math.bignumber(totalBalance))) : 0}))
  },

  // Convert the new entry from Ui into a standardized format in db
  convertNewEntry (inputEntry, tradeType) {
    var entry = _.cloneDeep(inputEntry)
    if (this.tradeTypeLabels.indexOf(tradeType) === -1) {
      tradeType = 'Bought'
    }
    var formatDefinition = {
      date: function (value) {
        if (_.isString(value)) {
          return moment(value, 'YYYY-MM-DD').unix()
        } else {
          return value
        }
      },
      from: v => v.toLowerCase(),
      to: v => v.toLowerCase(),
      quantity: parseFloat
    }
    var newEntry = Formatter.run(entry, formatDefinition)
    var result = _.pick(newEntry, ['date', 'account_name', 'notes', 'fee', 'fee_currency'])
    if (newEntry.id) {
      result.id = newEntry.id
    }

    var conversion = {
      'bought': () => {
        return {
          from: newEntry.currency,
          quantity_from: math.number(math.multiply(math.bignumber(newEntry.price), math.bignumber(newEntry.quantity))),
          to: newEntry.coin,
          quantity_to: newEntry.quantity
        }
      },
      'sold': () => {
        return {
          from: newEntry.coin,
          quantity_from: newEntry.quantity,
          to: newEntry.currency,
          quantity_to: math.number(math.multiply(math.bignumber(newEntry.price), math.bignumber(newEntry.quantity)))
        }
      },
      'deposited': () => {
        return {
          from: undefined,
          quantity_from: 0,
          to: newEntry.coin,
          quantity_to: newEntry.quantity
        }
      },
      'withdrawn': () => {
        return {
          from: newEntry.coin,
          quantity_from: newEntry.quantity,
          to: undefined,
          quantity_to: 0
        }
      }
    }
    return _.defaults(conversion[tradeType.toLowerCase()](), result)
  },

  negate (trade) {
    let result = _.cloneDeep(trade)
    result.quantity_from = trade.quantity_to
    result.quantity_to = trade.quantity_from
    result.to = trade.from
    result.from = trade.to
    if (trade.fee) {
      result.fee = -trade.fee
    }
    return result
  },

  // Convert a typical exchange balance into a list of trades
  balanceToTrades (balance, accountName, accountType, commonAttributes) {
    var result = []
    let newTrade
    _.forOwn(balance, function (value, key) {
      if (!_.isNumber(value)) return
      if (value > 0) {
        // Its a deposit
        newTrade = Object.assign({}, commonAttributes, {from: undefined, quantity_from: 0, to: key, quantity_to: value, date: moment().unix(), account_name: accountName, account_type: accountType})
      } else if (value < 0) {
        // Its a withdraw
        newTrade = Object.assign({}, commonAttributes, {to: undefined, quantity_to: 0, from: key, quantity_from: Math.abs(value), date: moment().unix(), account_name: accountName, account_type: accountType})
      }
      result.push(newTrade)
    })
    return result
  },

  // Convert the db trades into display bough, sold etc..
  toDisplay: function (tradeEntry) {
    // var result = _.pick(tradeEntry, ['date', 'account_name', 'notes', 'id'])
    // if (quantity_from === 0)  {
    //   // Deposited
    //   result.type = 'Deposited'
    // }
  },

  // Given a problematicCoin {coindId:, value}, build another trade that will make the first one balanced
  //
  buildCompensatingTransaction (problematicCoin) {
    return {
      from: undefined,
      quantity_from: 0,
      to: problematicCoin.coinId,
      quantity_to: -problematicCoin.value
    }
  },

  _save (data) {
    // beforeUpdate()
    // performance.mark('TradeClient.save begin')
    // TODO ensure all values are correct or present
    // Prevent from to be equal to
    let plainData = Formatter.run(data, this.formatDefinition)
    // const multiple = 10000
    // let dataToSave = Array(multiple).fill(Object.assign({quantity_to: Math.random() * 10}, plainData))
    // performance.mark('TradeClient.save end array fill')
    // return db.trades.bulkPut(dataToSave)
    return db.trades.put(plainData)
  },

  delete (id) {
    // beforeUpdate()
    return this.table.where({id}).delete()
  },

  // diff: {positive: [...], negative: [id1, id2], update: [{id: }, {}]}
  async applyDiff (diff) {
    if (!diff) return
    if (diff.positive) {
      await this._bulkSave(diff.positive)
    }

    if (diff.negative) {
      if (diff.negative === 'all') {
        await this.table.clear()
      } else {
        diff.negative.forEach(async (id) => {
          await this.table.delete(id)
        })
      }
    }

    if (diff.update) {
      await this._bulkSave(diff.update)
    }
  },

  async add (trades) {
    InviziCache.addToCollection(this.cacheKey, trades)
  },

  async remove (trades) {
    InviziCache.removeFromCollection(this.cacheKey, trades)
  },

  async update (trades) {
    InviziCache.updateCollection(this.cacheKey, trades)
  },

  async _bulkSave (data) {
    function processor (inputData) {
      db.trades.bulkPut(Formatter.runBulk(inputData, this.formatDefinition))
    }
    InviziUtils.processDataByChunk(data, processor, 10, this)
  },

  async deleteAll () { // TODO move to parent
    InviziCache.deleteItem(this.cacheKey)
  },

  autoUpdateDb () { // TODO move to parent
    autorun((diff) => {
      InviziCache.getItem(this.cacheKey)
      this.applyDiff(diff)
    })
  },

  autoUpdateWorkerEnv () {
    autorun((diff) => {
      let trades = InviziCache.getItem(this.cacheKey)
      this.updateWorkerEnv(trades)
    })
  },

  updateWorkerEnv (trades) {
    ipcRenderer.send('worker-request', {channel: 'cache-update', cacheKey: this.cacheKey, data: trades})
  },

  async syncCacheFromDb () {
    let allTradesDb = await this.allRaw()
    if (!_.isEmpty(allTradesDb)) {
      allTradesDb._counterNumber = _.last(allTradesDb).id + 1
    } else {
      allTradesDb._counterNumber = 1
    }
    InviziCache.setItem(this.cacheKey, allTradesDb)
  }
}

TradeClient.autoUpdateDb()
TradeClient.autoUpdateWorkerEnv()

export default TradeClient
