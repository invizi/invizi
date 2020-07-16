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
import Forex from '@/components/Forex'
import TradeClient from '@/components/TradeClient'
import Account from '@/components/Account'
import DateHelper from '@/components/DateHelper'
import { sha256 } from '@/components/InviziCrypto'
import UserManager from '@/components/UserManager'
import InviziCache from '@/components/InviziCache'
import BalanceHelper from '@/components/BalanceHelper'
// import TradeSpecHelper from './TradeSpecHelper'

const _ = require('lodash')
const moment = require('moment')
const now = moment().subtract(1, 'minutes').unix()

// TODO
// bulkSave unformatted date

describe('TradeClient', () => {
  before(function (done) {
    UserManager.hashedPassword = sha256('myPassword').toString()
    done()
  })

  it('compute same hashId for same trades', function () {
    let trade1 = {from: 'usd', quantity_from: 1000, date: now, to: 'bitcoin', quantity_to: 1, account_name: 'local0'}
    let trade1bis = {from: 'usd', quantity_from: 1000, date: now, to: 'bitcoin', quantity_to: 1, account_name: 'local0'}
    expect(TradeClient.hashId(trade1), TradeClient.hashId(trade1bis))

    trade1bis = Object.assign({}, trade1, {account_name: 'local1'})
    expect(TradeClient.hashId(trade1), TradeClient.hashId(trade1bis))
  })

  it('compute different hashId for different trades', function () {
    let trade1 = {from: 'usd', quantity_from: 1000, date: now, to: 'bitcoin', quantity_to: 1, account_name: 'local0'}
    let trade1bis = Object.assign({}, trade1, {quantity_to: 2})
    expect(TradeClient.hashId(trade1), TradeClient.hashId(trade1bis))

    trade1bis = Object.assign({}, trade1, {quantity_from: 5})
    expect(TradeClient.hashId(trade1), TradeClient.hashId(trade1bis))

    trade1bis = Object.assign({}, trade1, {date: moment().subtract(1, 'months').unix()})
    expect(TradeClient.hashId(trade1), TradeClient.hashId(trade1bis))

    trade1bis = Object.assign({}, trade1, {from: 'eur'})
    expect(TradeClient.hashId(trade1), TradeClient.hashId(trade1bis))

    trade1bis = Object.assign({}, trade1, {to: 'eur'})
    expect(TradeClient.hashId(trade1), TradeClient.hashId(trade1bis))
  })

  it('deletes the cache, the db shall be cleared too', async function () {
    await TradeClient.deleteAll()
    let allTradesDb = await TradeClient.allRaw()
    expect(allTradesDb.length).to.be.equal(0)
  })

  it('get all the trades first time (not from cache)', async function () {
    await TradeClient.all()
    let cache = InviziCache.getItem(TradeClient.cacheKey)
    expect(_.isEqual(cache, [])).to.equal(true)
    InviziCache.deleteItem(TradeClient.cacheKey)
    cache = InviziCache.getItem(TradeClient.cacheKey)
    expect(cache).to.equal(undefined)
  })

  it('sync cache from db', async function () {
    await TradeClient.syncCacheFromDb()
    let cache = InviziCache.getItem(TradeClient.cacheKey)
    expect(_.isEqual(cache, [])).to.equal(true)
    expect(cache._counterNumber).to.equal(1)
  })

  it('loadHistoricalBalance with 0 trades', async function () {
    let result = await TradeClient.loadHistoricalBalance()
    expect(result.data.length).to.be.equal(0)
  })

  it('check accounts are empty', async function () {
    let result = await TradeClient.hasAccountsWithTrades()
    expect(result).to.equal(false)
  })

  it('fetches the live Forex', function () {
    this.timeout(10000)
    return Forex.get()
  })

  it('fetches the live ticker', function () {
    this.timeout(10000)
    return Ticker.get()
  })

  it('saves a trade of bitcoin bought with usd', async function () {
    var data = {from: 'usd', quantity_from: 1000, date: moment().unix(), to: 'bitcoin', quantity_to: 1, account_name: 'local0'}
    await TradeClient.add([data])
    let result = await TradeClient.all()
    expect(_.isEqual(result, [data])).to.equal(true)
    let allTradesDb = await TradeClient.allRaw()
    expect(allTradesDb.length === 1)
    let first = _.first(allTradesDb)
    expect(_.isEqual(first, data)).to.equal(true)

    var data2 = {from: 'usd', quantity_from: 4000, date: moment().unix(), to: 'ethereum', quantity_to: 15, account_name: 'local0'}
    await TradeClient.add([data2])
    result = await TradeClient.all()
    expect(_.isEqual(result[1], data2)).to.equal(true)
  })

  it('deletes all trades linked to account local0', async function () {
    await TradeClient.deleteAccount('local0')
    let trades = await TradeClient.account('local0')
    expect(trades.length).to.equal(0)
    let allTradesDb = await TradeClient.allRaw()
    expect(_.isEqual(allTradesDb, [])).to.equal(true)
  })

  it('saves buy trades of bitcoin and ethereum in account local1', async function () {
    var data = [
      {date: now, from: 'usd', quantity_from: 1000, to: 'bitcoin', quantity_to: 1, account_name: 'local1'},
      {date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local1'}
    ]
    await TradeClient.add(data)
    let result = await TradeClient.all()
    expect(_.isEqual(result, data)).to.equal(true)
    let allTradesDb = await TradeClient.allRaw()
    expect(_.isEqual(allTradesDb, data)).to.equal(true)
    let count = await TradeClient.count()
    expect(count).to.equal(2)
  })

  it('gets all trades', async function () {
    let result = await TradeClient.all()
    expect(result.length).to.equal(2)
  })

  it('saves buy trades of bitcoin and ethereum in account local2', async function () {
    var threeMonthAgo = moment().subtract(3, 'months').unix()
    var data = [
      {date: now, from: 'usd', quantity_from: 1000, to: 'bitcoin', quantity_to: 1, account_name: 'local2'},
      {date: threeMonthAgo, from: 'usd', quantity_from: 2000, to: 'bitcoin', quantity_to: 2, account_name: 'local2'},
      {date: threeMonthAgo, from: 'bitcoin', quantity_from: 0.124, to: 'ethereum', quantity_to: 2, account_name: 'local2'},
      {date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local2'}
    ]

    await TradeClient.add(data)
    let history = await TradeClient.accountsUntil(moment().subtract(2, 'months').unix())
    expect(history.length).to.equal(2)
    expect(_.first(_.filter(history, {to: 'bitcoin'})).quantity_to).to.equal(2)
  })

  it('getBalancePerAccount', async function () {
    let allTradesDb = await TradeClient.allRaw()
    let grouped = _.groupBy(allTradesDb, 'account_name')
    let result = {}
    Object.keys(grouped).forEach(key => {
      let currentBalance = TradeClient.addTradesToBalance(grouped[key])
      let allBalances = BalanceHelper.allBalances(currentBalance)
      result[key] = _.pick(allBalances, ['totalAltCurrency', 'totalBTC', 'totalUSD'])
    })
    let balancePerAccount = await TradeClient.getBalancePerAccount()
    expect(_.isEqual(balancePerAccount, result)).to.be.equal(true)
  })

  it('tests the find method', async function () {
    let result = await TradeClient.find({to: 'bitcoin'})
    expect(result.length).to.equal(3)
  })

  it('checks accounts are not empty', async function () {
    let result = await TradeClient.hasAccountsWithTrades()
    expect(result).to.equal(true)
  })

  it('returns datesOfCoins', async function () {
    let allTrades = await TradeClient.all()
    let result = TradeClient.datesOfCoins(allTrades, 'from')
    expect(result['usd'].length === 3)
    expect(result['bitcoin'].length === 3)
  })

  it('gets all trades of a coin', async function () {
    let result = await TradeClient.loadCoin('ethereum')
    expect(result.length).to.equal(3)
  })

  it('loads the total balance (aggregate all account group by coins)', async function () {
    let account = await TradeClient.loadBalance()
    expect(account.ethereum).to.equal(4)
    expect(account.usd).to.equal(-4000)
    expect(account.bitcoin).to.equal(parseFloat((4 - 0.062 - 0.124 - 0.062).toFixed(8)))
  })

  it('loads the total balance for one account', async function () {
    let account = await TradeClient.loadAccountMerged('local2')
    expect(account.ethereum).to.equal(3)
    let trades = TradeClient.balanceToTrades(account, 'local2', 'exchange')
    expect(_.find(trades, {to: 'bitcoin'}).quantity_to).to.be.equal(2.814)
    expect(_.find(trades, {to: 'ethereum'}).quantity_to).to.be.equal(3)
    expect(account.bitcoin).to.equal(parseFloat((3 - 0.124 - 0.062).toFixed(8)))
  })

  it('gets all the accounts names', async function () {
    let allNames = await Account.allNames()
    expect(allNames.length).to.equal(2)
    expect(!!_.find(allNames, {name: 'local1'})).to.equal(true)
    expect(_.find(allNames, {name: 'local1'}).type === 'local').to.equal(true)
    expect(!!_.find(allNames, {name: 'local2'})).to.equal(true)
  })

  it('gets all snapshots at all different times aggregate per coin in usd', function () {
    // TODO cannot get the local historical
    TradeClient.loadHistoricalBalance().then((result) => {
      return expect(result.data.length).to.be.equal(2)
    }).catch((arg) => {
      // console.log(arg)
      expect(true).to.be.equal(false)
    })
  })

  it('tradesIterator', async function () {
    let allTrades = await TradeClient.all()
    let intervalIter = DateHelper.intervalIterator(10, 'days', moment().subtract(1, 'years').unix())
    let tradeIter = TradeClient.tradesIterator(allTrades, intervalIter)
    let newTrades = []
    let result = []
    for (let currentIter of tradeIter) {
      result.push(currentIter)
      for (let trade of currentIter.trades) {
        newTrades.push(trade)
        expect(trade.date < currentIter.date).to.be.equal(true)
      }
    }
    expect(result.length).to.equal(result[0].length)
    expect(newTrades.length).to.be.equal(allTrades.length)
  })

  it('balanceOfTradesIterator', async function () {
    let allTrades = await TradeClient.all()

    let intervalIter = DateHelper.intervalIterator(10, 'days', moment().subtract(1, 'years').unix())
    let tradeIter = TradeClient.tradesIterator(allTrades, intervalIter)
    let balanceIter = TradeClient.balanceOfTradesIterator(tradeIter)
    let result = Array.from(balanceIter)
    expect(result.length).to.equal(result[0].length)

    let finalBalance = TradeClient.addTradesToBalance(allTrades)
    // console.log(`finalBalance=${JSON.stringify(finalBalance)}`)
    // console.log(`finalBalance=${JSON.stringify(_.last(result).balance)}`)
    expect(_.isEqual(_.last(result).balance, finalBalance)).to.equal(true)

    let someTrades = []
    let numberOfTrades = 10

    for (let index = 0; index < numberOfTrades; index++) {
      someTrades.push(
        { date: moment(now, 'X').subtract(index, 'days').unix(),
          from: 'usd',
          quantity_from: 1000,
          to: 'bitcoin',
          quantity_to: 1,
          account_name: 'iteratorAccount'}
      )
      someTrades.push(
        { date: moment(now, 'X').subtract(index, 'days').unix(),
          from: 'usd',
          quantity_from: 50,
          to: 'ethereum',
          quantity_to: 1,
          account_name: 'iteratorAccount'}
      )
    }

    expect(someTrades.length).to.equal(2 * numberOfTrades)
    let intervalIter2 = DateHelper.intervalIterator(1, 'days', moment().subtract(20, 'days').unix())
    let tradeIter2 = TradeClient.tradesIterator(someTrades, intervalIter2)
    let balanceIter2 = TradeClient.balanceOfTradesIterator(tradeIter2)
    let result2 = Array.from(balanceIter2)

    expect(result2.length).to.equal(result2[0].length)
    let finalBalance2 = TradeClient.addTradesToBalance(someTrades)
    expect(_.isEqual(_.last(result2).balance, finalBalance2)).to.equal(true)

    Array.from(Array(3)).forEach(() => {
      let randomIndex = Math.floor(Math.random() * someTrades.length)
      // console.log(`someTrades.length=${someTrades.length}`)
      // console.log(`randomIndex=${randomIndex}`)
      let randomBalanceIter = result2[randomIndex]
      // console.log('result2')
      // console.log(result2[randomIndex])
      let filteredTrades = someTrades.filter(trade => trade.date < randomBalanceIter.date)
      let filteredFinalBalance = TradeClient.addTradesToBalance(filteredTrades)
      expect(_.isEqual(randomBalanceIter.balance, filteredFinalBalance)).to.equal(true)
    })
  })

  it('deletes the account local2', async function () {
    await TradeClient.deleteAccount('local2')
    let trades = await TradeClient.account('local2')
    return expect(trades.length).to.equal(0)
  })

  it('convert entry from ui into standardized format in db', function () {
    var bought1 = {date: now, coin: 'bitcoin', quantity: 2, price: 900, currency: 'usd', account_name: 'local1', notes: 'mynotes'}
    expect(_.isEqual(TradeClient.convertNewEntry(bought1, 'Boughtmistake'), {from: 'usd', quantity_from: 1800, to: 'bitcoin', quantity_to: 2, date: now, notes: 'mynotes', account_name: 'local1'})).to.equal(true)

    var sold1 = {date: now, coin: 'bitcoin', quantity: 2, price: 900, currency: 'usd', account_name: 'local1', notes: 'mynotes'}
    var sold1Expected = {from: 'bitcoin', quantity_from: 2, to: 'usd', quantity_to: 1800, date: now, account_name: 'local1', notes: 'mynotes'}
    expect(_.isEqual(TradeClient.convertNewEntry(sold1, 'Sold'), sold1Expected)).to.equal(true)

    var deposited1 = {date: now, coin: 'bitcoin', quantity: 2, account_name: 'local1', notes: 'mynotes'}
    var deposited1Expected = {from: undefined, quantity_from: 0, to: 'bitcoin', quantity_to: 2, date: now, account_name: 'local1', notes: 'mynotes'}
    expect(_.isEqual(TradeClient.convertNewEntry(deposited1, 'Deposited'), deposited1Expected)).to.equal(true)

    var withdrawn1 = {date: now, coin: 'bitcoin', quantity: 2, account_name: 'local1', notes: 'mynotes'}
    var withdrawn1Expected = {from: 'bitcoin', quantity_from: 2, to: undefined, quantity_to: 0, date: now, account_name: 'local1', notes: 'mynotes'}
    expect(_.isEqual(TradeClient.convertNewEntry(withdrawn1, 'Withdrawn'), withdrawn1Expected)).to.equal(true)
  })

  it('calculate performance', function () {
    var fullDates = DateHelper.createIntervals(1, 'days', moment().subtract(2, 'years').unix())
    var datesValues = fullDates.map(function (o, i) {
      return i
    })
    var data = [fullDates, datesValues]
    var performance = TradeClient.performance(data)
    expect(performance['24_hours']).to.be.equal((730 - 729) / 729)
    expect(performance['7_days']).to.be.equal((730 - 723) / 723)
    expect(performance['30_days']).to.be.equal((730 - 700) / 700)
  })

  it('calculate performance with missing dates - 3 days', function () {
    var fullDates = DateHelper.createIntervals(1, 'days', moment().subtract(3, 'days').unix())
    var datesValues = fullDates.map(function (o, i) {
      return 730 - i
    })
    datesValues = datesValues.sort((a, b) => {
      return a - b
    })
    var data = [fullDates, datesValues]
    var performance = TradeClient.performance(data)
    expect(performance['24_hours']).to.be.equal((730 - 729) / 729)
    expect(performance['7_days']).to.be.equal(undefined)
    expect(performance['30_days']).to.be.equal(undefined)
    expect(performance['6_months']).to.be.equal(undefined)
    expect(performance['1_years']).to.be.equal(undefined)
  })

  it('calculate performance with missing dates - 30 days', function () {
    var fullDates = DateHelper.createIntervals(1, 'days', moment().subtract(30, 'days').unix())
    var datesValues = fullDates.map(function (o, i) {
      return 730 - i
    })
    datesValues = datesValues.sort((a, b) => {
      return a - b
    })
    var data = [fullDates, datesValues]
    var performance = TradeClient.performance(data)
    expect(performance['24_hours']).to.be.equal((730 - 729) / 729)
    expect(performance['7_days']).to.be.equal((730 - 723) / 723)
    expect(performance['30_days']).to.be.equal((730 - 700) / 700)
    expect(performance['6_months']).to.be.equal(undefined)
    expect(performance['1_years']).to.be.equal(undefined)
  })

  it('calculate performance with missing dates', function () {
    var fullDates = DateHelper.createIntervals(1, 'days', moment().subtract(30, 'days').unix())
    var datesValues = fullDates.map(function (o, i) {
      return 730 - i
    })
    datesValues = datesValues.sort((a, b) => {
      return a - b
    })
    var data = [fullDates, datesValues]
    var performance = TradeClient.performance(data)
    expect(performance['24_hours']).to.be.equal((730 - 729) / 729)
    expect(performance['7_days']).to.be.equal((730 - 723) / 723)
    expect(performance['30_days']).to.be.equal((730 - 700) / 700)
    expect(performance['6_months']).to.be.equal(undefined)
    expect(performance['1_years']).to.be.equal(undefined)
  })

  it('addTradesToBalance', function () {
    let threeMonthAgo = moment().subtract(3, 'months').unix()
    let initialBalance = {
      bitcoin: 1,
      usd: 10000,
      ethereum: 1
    }
    let trades = [
      {date: now, from: 'usd', quantity_from: 1000, to: 'bitcoin', quantity_to: 1, account_name: 'local2'},
      {date: threeMonthAgo, from: 'usd', quantity_from: 2000, to: 'bitcoin', quantity_to: 2, account_name: 'local2'},
      {date: threeMonthAgo, from: 'bitcoin', quantity_from: 0.124, to: 'ethereum', quantity_to: 2, account_name: 'local2'},
      {date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local2'}
    ]
    let result = TradeClient.addTradesToBalance(trades, initialBalance)
    expect(result.bitcoin).to.be.equal(initialBalance.bitcoin + 1 + 2 - 0.124 - 0.062)
    expect(result.ethereum).to.be.equal(initialBalance.ethereum + 1 + 2)
    expect(result.usd).to.be.equal(initialBalance.usd - 1000 - 2000)
  })

  it('add - remove - update trades', async function () {
    await TradeClient.deleteAll()
    var data = [
      {id: 1, date: now, from: 'usd', quantity_from: 1000, to: 'bitcoin', quantity_to: 1, account_name: 'local3'},
      {id: 2, date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local3'}
    ]

    let updatedData = [
      {id: 1, date: now, from: 'usd', quantity_from: 1000, to: 'bitcoin', quantity_to: 2, account_name: 'local3'},
      {id: 2, date: now, from: 'bitcoin', quantity_from: 0.062, to: 'ethereum', quantity_to: 1, account_name: 'local3'}
    ]

    await TradeClient.add(data)
    let result = await TradeClient.all()
    expect(_.isEqual(result, data)).to.equal(true)
    let allTradesDb = await TradeClient.allRaw()
    expect(_.isEqual(allTradesDb, data)).to.equal(true)
    let count = await TradeClient.count()
    expect(count).to.equal(2)

    let toUpdate = [{id: 1, date: now, from: 'usd', quantity_from: 1000, to: 'bitcoin', quantity_to: 2, account_name: 'local3'}]
    await TradeClient.update(toUpdate)
    result = await TradeClient.all()
    expect(_.isEqual(result, updatedData)).to.equal(true)
    allTradesDb = await TradeClient.allRaw()
    expect(_.isEqual(allTradesDb, updatedData)).to.equal(true)
  })
})
