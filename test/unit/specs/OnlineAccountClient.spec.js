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
import db from '@/components/Database'
import OnlineAccountClient from '@/models/OnlineAccountClient'
import TradeClient from '@/components/TradeClient'
import UserManager from '@/components/UserManager'
import { sha256 } from '@/components/InviziCrypto'
const sinon = require('sinon')
const moment = require('moment')

describe('OnlineAccountClient', () => {
  before(function (done) {
    db.onlineAccounts.clear().then(done, done)
    UserManager.hashedPassword = sha256('myPassword').toString()
  })

  it('saves the account poloniex', function () {
    var data = {name: 'poloniex', API_KEY: 'qwalsdjaldjl', API_SECRET: 'qwljeasidqlwe'}
    return OnlineAccountClient.save(data).then((key) => {
      return expect(key).to.equal('poloniex')
    })
  })

  it('reads the account poloniex', function () {
    return OnlineAccountClient.all().then((accounts) => {
      return expect(accounts[0].API_KEY).to.equal('qwalsdjaldjl')
    })
  })

  it('load individual account', function () {
    return OnlineAccountClient.load('poloniex').then((account) => {
      return expect(account.name).to.equal('poloniex')
    })
  })

  it('saves the account poloniex second time override previous value', function () {
    var data = {name: 'poloniex', API_KEY: 'qwalsdjaldjl', API_SECRET: 'qwljeasidqlwe'}
    return OnlineAccountClient.save(data).then((key) => {
      return expect(key).to.equal('poloniex')
    })
  })

  it('reads the account poloniex with the same value', function () {
    return OnlineAccountClient.all().then((accounts) => {
      return expect(accounts[0].API_KEY).to.equal('qwalsdjaldjl')
    })
  })

  it('deletes the account bittrex', function () {
    return OnlineAccountClient.delete('bittrex').then((account) => {
      return OnlineAccountClient.load('bittrex').then((account) => {
        return expect(account).to.equal(undefined)
      })
    })
  })

  it('matchBalanceWithTrades - Case remote account has coin local account does not have', async function () {
    //
    let remoteBalance = {bitcoin: 1, ethereum: 2, dash: 3}
    sinon.stub(OnlineAccountClient, 'loadBalance').callsFake(() => remoteBalance)
    let result = OnlineAccountClient.loadBalance()
    expect(result).to.eql(remoteBalance)
    // Init local data
    let data = {date: moment().unix(), to: 'bitcoin', quantity_to: 0.3, account_name: 'binance'}
    await TradeClient.add([data])
    let localTrades = await TradeClient.all()
    expect(localTrades).to.eql([data])
    await OnlineAccountClient.matchBalanceWithTrades({name: 'binance'})
    localTrades = await TradeClient.account('binance')
    let newLocalBalance = TradeClient.addTradesToBalance(localTrades)
    expect(newLocalBalance).to.eql(remoteBalance)

    await TradeClient.deleteAll()
    sinon.restore()
  })

  it('matchBalanceWithTrades - Case local has coin remote account does not have anymore ', async function () {
    let remoteBalance = {bitcoin: 1}
    sinon.stub(OnlineAccountClient, 'loadBalance').callsFake(() => remoteBalance)
    let data = [
      {date: moment().unix(), to: 'bitcoin', quantity_to: 0.3, account_name: 'binance'},
      {date: moment().unix(), to: 'ethereum', quantity_to: 2, account_name: 'binance'},
      {date: moment().unix(), to: 'dash', quantity_to: 3, account_name: 'binance'}]

    await TradeClient.add(data)
    await OnlineAccountClient.matchBalanceWithTrades({name: 'binance'})
    let localTrades = await TradeClient.account('binance')
    let newLocalBalance = TradeClient.addTradesToBalance(localTrades)
    expect(newLocalBalance).to.eql(remoteBalance)

    await TradeClient.deleteAll()
    sinon.restore()
  })
})
