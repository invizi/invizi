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
import BalanceHelper from '@/components/BalanceHelper'
import Ticker from '@/components/Ticker'
import Forex from '@/components/Forex'
const _ = require('lodash')
const moment = require('moment')

describe('BalanceHelper', () => {
  it('gets the total balance usd - error if no ticker', () => {
    var balance = { bitcoin: '1', ethereum: 2 }
    return expect(BalanceHelper.balanceUSD(balance)).to.be.undefined
  })

  it('fetches the live ticker first', function () {
    this.timeout(10000)
    return Ticker.get().then((value) => {
      return expect(_.find(value.data, {symbol: 'btc'}).price_btc).to.equal(1)
    })
  })

  it('merges 2 accounts balances', () => {
    var account1 = {
      'BTC': 1,
      'ETH': 2,
      'LTC': 3
    }
    var account2 = {
      BTC: 10,
      ZEC: 20,
      ETH: 30
    }
    var finalAccount = BalanceHelper.mergeAccounts(account1, account2)
    expect(finalAccount['BTC']).to.equal(11)
    expect(finalAccount['ZEC']).to.equal(20)
    expect(finalAccount['ETH']).to.equal(32)
    expect(finalAccount['LTC']).to.equal(3)
  })

  it('merge all accounts into one', () => {
    var accounts = [{
      'BTC': 1,
      'ETH': 2,
      'LTC': 3
    }, {
      BTC: 10,
      ZEC: 20,
      ETH: 30
    },
    {
      BTC: 100,
      ETH: 200
    },
    {
      BTC: 1,
      XMR: 10,
      ETH: 30
    }]

    var finalAccount = BalanceHelper.mergeAllAccounts(accounts)
    expect(finalAccount['BTC']).to.equal(112)
    expect(finalAccount['ZEC']).to.equal(20)
    expect(finalAccount['ETH']).to.equal(262)
    expect(finalAccount['LTC']).to.equal(3)
    expect(finalAccount['XMR']).to.equal(10)
  })

  it('gets the forex first', function () {
    this.timeout(20000)
    return Forex.get()
  })

  it('gets the ticker first', function () {
    this.timeout(10000)
    return Ticker.get()
  })

  it('gets the total balance usd - after ticker fetch (get from cache)', function () {
    var balance = { BTC: '1', ETH: 2 }
    var result = BalanceHelper.balanceUSD(balance)
    expect(result).not.to.equal(undefined)
    expect(result['BTC']).to.be.below(20000)
  })

  it('gets the total balance usd - with USD', function () {
    var balance = { BTC: '1', ETH: 2, USD: 1000.4, EUR: 300.05 }
    var result = BalanceHelper.balanceUSD(balance)
    expect(result).not.to.equal(undefined)
    expect(result['BTC']).to.be.below(20000)
    expect(result['USD']).to.be.equal(1000.4)
    expect(result['EUR']).to.be.above(300.05)
  })

  it('gets the total balance usd - with unknown coin', function () {
    var balance = { BTC: '1', ETH: 2, YYY: 10 }
    var result = BalanceHelper.balanceUSD(balance)
    expect(result).not.to.equal(undefined)
    expect(result['BTC']).to.be.below(20000)
    expect(result['YYY']).to.be.equal(0)
  })

  it('sums from an object - totalFromObject', function () {
    var balance = { BTC: 2000, ETH: 4000 }
    var result = BalanceHelper.totalFromObject(balance)
    expect(result).to.be.equal(6000)
  })

  it('gets the total balance in BTC', function () {
    var balance = { bitcoin: 2, ethereum: 4 }
    var balanceUSD = BalanceHelper.balanceUSD(balance)
    var balanceBTC = BalanceHelper.balanceUSDtoBTC(balanceUSD)
    var result = BalanceHelper.totalFromObject(balanceBTC)
    expect(result).to.be.above(2)
  })

  it('gets the total balance in BTC from a balance in USD with list of dates', function () {
    var balances = [
      { BTC: 2000, ETH: 4000 },
      { BTC: 2500, ETH: 4020 },
      { BTC: 2700, ETH: 4800 },
      { BTC: 3400, ETH: 5000, XMR: 150 }
    ]

    var dates = [moment().subtract('10', 'months').unix(), moment().subtract('5', 'months').unix(), moment().subtract('1', 'months').unix()]

    expect(() => { BalanceHelper.balanceUSDtoBTCHistorical(balances, dates) }).to.throw()
    // TODO
  })

  it('remove coins with zero balance', function () {
    var balance = { BTC: 2, ETH: 4, XMR: 0, ETC: 0 }
    var result = BalanceHelper.removeZeroCoins(balance)
    expect(result['XMR']).to.be.equal(undefined)
    expect(result['BTC']).not.to.be.equal(undefined)
  })

  it('transforms accounts object to array - filter only altcoinsOnly', function () {
    var balance = { BTC: 2, ETH: 4, XMR: 3, ETC: 100, LTC: 10, USD: 1000 }
    var result = BalanceHelper.exchangeBalanceToOrder(balance)
    expect(_.isArray(result)).to.be.equal(true)
    var result2 = BalanceHelper.altcoinsOnly(balance)
    expect(!!_.find(result2, { name: 'BTC' })).to.equal(false)
    expect(!!_.find(result2, { name: 'USD' })).to.equal(false)
  })

  it('diffBalances', function () {
    const balance1 = {bitcoin: 2, ethereum: 1, dash: 3}
    const balance2 = {bitcoin: 1, ethereum: 3}
    let result = BalanceHelper.diffBalances(balance1, balance2)
    console.log(balance1)
    expect(_.isEqual(result, {bitcoin: 1, ethereum: -2, dash: 3})).to.equal(true)
    let adds = BalanceHelper.mergeAccounts(balance2, result)
    console.log(adds)
    console.log(balance1)
    expect(_.isEqual(adds, balance1)).to.equal(true)

    result = BalanceHelper.diffBalances(balance2, balance1)
    console.log(result)
    expect(_.isEqual(result, {bitcoin: -1, ethereum: 2, dash: -3})).to.equal(true)
    console.log(balance1)
    console.log(balance2)
    result = BalanceHelper.mergeAccounts(balance1, result)
    console.log(result)
    expect(_.isEqual(result, balance2)).to.equal(true)
  })
})
